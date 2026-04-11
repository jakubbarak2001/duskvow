"""Tree API routes — generate, list, get, delete talent trees."""

import time
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core import supabase as supa
from app.core.dependencies import get_current_user_id
from app.schemas.trees import (
    FollowUpQuestionsResponse,
    FollowUpRequest,
    GenerateTreeRequest,
)
from app.services.gemini import gemini_service
from app.services.progression import get_active_tree_cap, get_generation_limit

router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory session store — holds goal_prompt between /generate and /followup.
# Maps session_id → {user_id, goal_prompt, created_at}.
# TTL-cleaned on every access.
# ---------------------------------------------------------------------------
_SESSION_TTL = 3600  # seconds
_sessions: dict[str, dict[str, Any]] = {}


def _cleanup_sessions() -> None:
    now = time.time()
    expired = [k for k, v in _sessions.items() if now - v["created_at"] > _SESSION_TTL]
    for k in expired:
        del _sessions[k]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/generate", response_model=dict)
async def generate_tree(
    body: GenerateTreeRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Ask the AI for clarifying follow-up questions about the user's goal.

    Checks the active tree cap and daily generation limit before calling AI.
    Active tree cap is checked first — no point consuming a daily generation
    slot if the user can't hold another tree.

    Args:
        body: Contains the user's goal prompt.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with session_id and list of follow-up questions.
    """
    # Fetch hero level for dynamic limits
    profile = await supa.get_profile(user_id)
    hero_level = profile["hero_level"] if profile else 1
    tree_cap = get_active_tree_cap(hero_level)
    gen_limit = get_generation_limit(hero_level)

    # 1. Active tree cap check (runs first per spec)
    active_count = await supa.count_active_trees(user_id)
    if active_count >= tree_cap:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"You have {tree_cap} active trees. Finish or delete a tree to create a new one.",
        )

    # 2. Daily generation limit check
    daily_count = await supa.get_daily_generation_count(user_id)
    if daily_count >= gen_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"You've used all {gen_limit} daily generations. Come back tomorrow to create more.",
        )

    result = await gemini_service.generate_followup_questions(body.goal_prompt)

    _cleanup_sessions()
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {
        "user_id": user_id,
        "goal_prompt": body.goal_prompt,
        "created_at": time.time(),
    }

    return {
        "data": {
            "session_id": session_id,
            "questions": result.get("questions", []),
        },
        "error": None,
    }


@router.post("/followup", response_model=dict)
async def submit_followup(
    body: FollowUpRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Submit follow-up answers; generate and persist the full talent tree.

    Increments the daily generation count after a successful save and returns
    the remaining count for the day so the frontend can update its display.

    Args:
        body: Session ID from /generate and the user's answers.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with the complete saved talent tree and remaining daily count.
    """
    _cleanup_sessions()
    session = _sessions.get(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session expired or not found — please start a new generation.",
        )
    if session["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Session does not belong to this user.",
        )

    ai_result = await gemini_service.generate_tree(
        session["goal_prompt"],
        body.answers,
    )

    tree = await supa.save_generated_tree(user_id, session["goal_prompt"], ai_result)

    # Session consumed — remove it
    del _sessions[body.session_id]

    # Increment daily count and compute remaining (dynamic limit)
    profile = await supa.get_profile(user_id)
    hero_level = profile["hero_level"] if profile else 1
    gen_limit = get_generation_limit(hero_level)
    new_count = await supa.increment_daily_generation(user_id)
    remaining = max(0, gen_limit - new_count)

    return {
        "data": {
            "tree": tree,
            "generations_remaining": remaining,
            "generations_used": new_count,
        },
        "error": None,
    }


@router.get("", response_model=dict)
async def list_trees(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """List all non-deleted talent trees for the authenticated user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of trees (without nodes).
    """
    trees = await supa.list_trees(user_id)
    return {"data": trees, "error": None}


@router.get("/generation-status", response_model=dict)
async def get_generation_status(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return the user's daily generation usage and active tree count.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with generations_used, generations_remaining, generations_limit,
        active_trees, and active_tree_cap.
    """
    gen_status = await supa.get_generation_status(user_id)
    return {"data": gen_status, "error": None}


@router.get("/{tree_id}", response_model=dict)
async def get_tree(
    tree_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Get a specific talent tree with all its skill nodes.

    Args:
        tree_id: UUID of the talent tree.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with tree and nodes array.
    """
    tree = await supa.get_tree_with_nodes(tree_id, user_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tree not found.",
        )
    return {"data": tree, "error": None}


@router.delete("/{tree_id}", response_model=dict)
async def delete_tree(
    tree_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Soft-delete a talent tree (marks deleted_at, preserves the row).

    Args:
        tree_id: UUID of the talent tree to delete.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope confirming deletion.
    """
    deleted = await supa.delete_tree(tree_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tree not found.",
        )
    return {"data": {"deleted": True, "tree_id": tree_id}, "error": None}
