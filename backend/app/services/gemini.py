"""Google Gemini AI service for generating follow-up questions and talent trees."""

import asyncio
import json
import re
from pathlib import Path

from google import genai
from google.genai import types
from fastapi import HTTPException, status
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pydantic import BaseModel, ValidationError

from app.core.config import settings

_PROMPTS_DIR = Path(__file__).parent.parent / "prompts"
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


class _AIEdge(BaseModel):
    source: str = ""
    target: str = ""


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
    edges: list[_AIEdge] = []
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
    """Validate AI tree response against schema."""
    try:
        return _AITreeResponse.model_validate(data).model_dump()
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned unexpected structure: {exc}",
        )


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
    and gemini-2.5-pro for quality-sensitive calls (full tree generation).
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
        self._quality_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_AITreeResponse,
            temperature=0.7,
        )

    async def _call(
        self,
        model: str,
        config: types.GenerateContentConfig,
        prompt: str,
    ) -> dict:
        """Call Gemini asynchronously with a hard timeout.

        Args:
            model: Model ID string (e.g. 'gemini-2.0-flash').
            config: GenerateContentConfig for this call.
            prompt: Rendered prompt string.

        Returns:
            Parsed JSON dict from the model response.

        Raises:
            HTTPException: 504 on timeout, 502 on invalid JSON.
        """
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
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="AI generation timed out — please try again.",
            )
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

        Args:
            goal_prompt: The user's stated goal.
            answers: Map of question_id → selected option.

        Returns:
            Dict with title, description, nodes[], and edges[].
        """
        tmpl = _jinja.get_template("generate_tree.txt")
        prompt = tmpl.render(goal_prompt=goal_prompt, answers=answers)
        raw = await self._call(settings.gemini_model_quality, self._quality_config, prompt)
        return _validate_tree(raw)


gemini_service = GeminiService()
