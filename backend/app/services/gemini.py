"""Google Gemini AI service for generating follow-up questions and talent trees."""

import asyncio
import json
import logging
import re
import time
from pathlib import Path

from google import genai
from google.genai import types
from fastapi import HTTPException, status
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pydantic import BaseModel, ValidationError

from app.core.config import settings

_PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# AI response validation schemas
# ---------------------------------------------------------------------------

class _AIFollowUpQuestion(BaseModel):
    id: str
    text: str
    options: list[str]


class _AIFollowUpResponse(BaseModel):
    questions: list[_AIFollowUpQuestion]


class _AINodePosition(BaseModel):
    x: float = 0.0
    y: float = 0.0


class _AINode(BaseModel):
    id: str
    title: str
    description: str
    type: str = "action"
    tier: str = "common"
    prerequisites: list[str] = []
    optional: bool = False
    xp_reward: int = 10
    estimated_time: str | None = None
    position: _AINodePosition = _AINodePosition()


class _AIDailyQuest(BaseModel):
    id: str
    title: str
    description: str
    xp_reward: int = 15
    # Optional minute estimate for timed activities (practice, study, etc).
    # Was missing from the schema before — Pydantic was silently stripping it
    # during validation, so supabase.py:507's `q.get("estimated_minutes")`
    # check could never succeed. Restored 2026-04-13.
    estimated_minutes: int | None = None


class _AITreeResponse(BaseModel):
    title: str
    description: str
    nodes: list[_AINode]
    daily_quests: list[_AIDailyQuest] = []


def _validate_followup(data: dict) -> dict:
    """Validate AI follow-up response against schema."""
    try:
        return _AIFollowUpResponse.model_validate(data).model_dump()
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned unexpected structure: {exc}",
        )


def _validate_tree(data: dict) -> dict:
    """Validate AI tree response against schema + structural rules.

    Pydantic handles shape. Post-shape we enforce the two rules that are
    most likely to regress with Gemini thinking disabled: exactly one
    Tier 6 (mythic) Capstone, and >=2 nodes in every Tier 2-5 row.
    Violations raise 502 so the caller's retry path picks them up.

    Args:
        data: Raw parsed JSON from Gemini.

    Returns:
        Validated + structurally-sane tree dict.

    Raises:
        HTTPException: 502 on schema OR structural violation.
    """
    try:
        validated = _AITreeResponse.model_validate(data).model_dump()
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned unexpected structure: {exc}",
        )

    # Structural rules — the insurance policy for running without thinking.
    tier_counts: dict[str, int] = {}
    for node in validated["nodes"]:
        tier_counts[node["tier"]] = tier_counts.get(node["tier"], 0) + 1

    mythic_count = tier_counts.get("mythic", 0)
    if mythic_count != 1:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned {mythic_count} mythic nodes (expected exactly 1 Capstone).",
        )

    for tier in ("uncommon", "rare", "epic", "legendary"):
        count = tier_counts.get(tier, 0)
        if count < 2:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI returned {count} {tier} nodes (expected >=2 per tier).",
            )

    return validated


# ---------------------------------------------------------------------------

_jinja = Environment(
    loader=FileSystemLoader(str(_PROMPTS_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def _parse_json(text: str) -> dict:
    """Strip markdown code fences if present, then parse JSON.

    Args:
        text: Raw model output, possibly wrapped in ```json ... ```.

    Returns:
        Parsed dict.

    Raises:
        HTTPException: 502 if JSON is invalid.
    """
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned invalid JSON: {exc}",
        )


class GeminiService:
    """Handles all AI interactions via the Google Gemini API.

    Uses gemini-2.0-flash for speed-sensitive calls (follow-up questions)
    and gemini-2.5-flash (thinking disabled) for tree generation. Model IDs
    are configurable via settings.gemini_model_fast and .gemini_model_quality.
    """

    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._fast_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.8,
        )
        # Quality config uses response_schema to constrain Gemini's output to
        # the exact tree shape we expect. This both speeds up generation
        # (~10-20% per Google docs — fewer model "choices" per token) and
        # eliminates entire classes of validation failures (no more parsing
        # markdown fences, no more missing fields, no more wrong key names).
        #
        # thinking_budget=0 disables Gemini 2.5 Flash's "thinking" tokens.
        # This prompt is "fill a strict schema" — a bookkeeping task, not a
        # reasoning task. Thinking-on-by-default was adding 30-80s of
        # latency for no quality gain (see 2026-04-14 regression). Structural
        # correctness is now enforced post-hoc in `_validate_tree` plus a
        # single retry on 502/504 in `generate_tree`.
        self._quality_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_AITreeResponse,
            temperature=0.7,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        )

    async def _call(
        self,
        model: str,
        config: types.GenerateContentConfig,
        prompt: str,
    ) -> dict:
        """Call Gemini asynchronously with a hard timeout.

        Emits a structured `gemini_call` log entry on every call with
        model, elapsed_ms, prompt_chars, and status — so prod p50/p95 can
        be computed directly from logs (e.g. ``... | jq '.elapsed_ms'``).

        Args:
            model: Model ID string (e.g. 'gemini-2.0-flash').
            config: GenerateContentConfig for this call.
            prompt: Rendered prompt string.

        Returns:
            Parsed JSON dict from the model response.

        Raises:
            HTTPException: 504 on timeout, 502 on invalid JSON.
        """
        t0 = time.perf_counter()

        def _log(status_label: str) -> None:
            logger.info(
                "gemini_call",
                extra={
                    "model": model,
                    "elapsed_ms": int((time.perf_counter() - t0) * 1000),
                    "prompt_chars": len(prompt),
                    "status": status_label,
                },
            )

        try:
            response = await asyncio.wait_for(
                self._client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config,
                ),
                timeout=float(settings.ai_timeout_seconds),
            )
        except asyncio.TimeoutError:
            _log("timeout")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="AI generation timed out — please try again.",
            )
        except Exception:
            _log("error")
            raise

        _log("ok")
        return _parse_json(response.text)

    async def generate_followup_questions(self, goal_prompt: str) -> dict:
        """Generate 2-3 clarifying follow-up questions for the user's goal.

        Args:
            goal_prompt: The user's stated goal.

        Returns:
            Dict with a 'questions' list of {id, text, options}.
        """
        tmpl = _jinja.get_template("followup_questions.txt")
        prompt = tmpl.render(goal_prompt=goal_prompt)
        raw = await self._call(settings.gemini_model_fast, self._fast_config, prompt)
        return _validate_followup(raw)

    async def generate_tree(
        self,
        goal_prompt: str,
        answers: dict[str, str],
    ) -> dict:
        """Generate a full talent tree given the goal and follow-up answers.

        On a 502 (malformed / structurally-invalid tree) or 504 (timeout),
        retries ONCE with a lower temperature for more deterministic output.
        Real flakiness post-thinking-disable is structural violations,
        not timeouts — so retrying on 502 is essential, not just on 504.

        Args:
            goal_prompt: The user's stated goal.
            answers: Map of question_id → selected option.

        Returns:
            Dict with title, description, nodes[], and daily_quests[].
        """
        tmpl = _jinja.get_template("generate_tree.txt")
        prompt = tmpl.render(goal_prompt=goal_prompt, answers=answers)

        try:
            raw = await self._call(
                settings.gemini_model_quality, self._quality_config, prompt
            )
            return _validate_tree(raw)
        except HTTPException as exc:
            if exc.status_code not in (
                status.HTTP_502_BAD_GATEWAY,
                status.HTTP_504_GATEWAY_TIMEOUT,
            ):
                raise
            logger.info(
                "gemini_retry",
                extra={"reason": exc.detail, "status_code": exc.status_code},
            )

        # Retry once with lower temperature — more deterministic, same
        # thinking-disabled config otherwise.
        retry_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_AITreeResponse,
            temperature=0.5,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        )
        raw = await self._call(
            settings.gemini_model_quality, retry_config, prompt
        )
        return _validate_tree(raw)


gemini_service = GeminiService()
