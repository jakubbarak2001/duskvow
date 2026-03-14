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

    Args:
        body: Contains the user's goal prompt.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with session_id and list of follow-up questions.
    """
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

    Args:
        body: Session ID from /generate and the user's answers.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with the complete saved talent tree (including nodes).
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

    return {"data": tree, "error": None}


@router.get("", response_model=dict)
async def list_trees(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """List all talent trees for the authenticated user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of trees (without nodes).
    """
    trees = await supa.list_trees(user_id)
    return {"data": trees, "error": None}


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


@router.delete("/{tree_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tree(
    tree_id: str,
    user_id: str = Depends(get_current_user_id),
) -> None:
    """Delete a talent tree and all its nodes.

    Args:
        tree_id: UUID of the talent tree to delete.
        user_id: Authenticated user's UUID.
    """
    deleted = await supa.delete_tree(tree_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tree not found.",
        )
