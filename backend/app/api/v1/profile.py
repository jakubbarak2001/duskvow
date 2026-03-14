"""Profile API routes."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id
from app.core import supabase as supa

router = APIRouter()


@router.get("", response_model=dict)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Get the authenticated user's profile and stats.

    Args:
        user_id: Authenticated user's UUID, injected by the auth dependency.

    Returns:
        Envelope with user profile data including XP and streak stats.

    Raises:
        HTTPException: 404 if no profile row exists for this user.
    """
    profile = await supa.get_profile(user_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found — the auth trigger may not have fired yet.",
        )

    return {"data": profile, "error": None}
