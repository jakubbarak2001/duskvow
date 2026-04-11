"""Profile API routes."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id
from app.core import supabase as supa
from app.schemas.profile import ProfileUpdateRequest
from app.services.progression import get_all_unlocks_for_display

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


@router.patch("", response_model=dict)
async def update_profile(
    body: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Update the authenticated user's hero name.

    Args:
        body: Request body containing hero_name.
        user_id: Authenticated user's UUID, injected by the auth dependency.

    Returns:
        Envelope with the updated profile.
    """
    profile = await supa.upsert_profile(user_id, {"hero_name": body.hero_name})
    return {"data": profile, "error": None}


@router.get("/unlocks", response_model=dict)
async def get_unlocks(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return all level unlocks with current status for the authenticated user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of unlock objects.
    """
    profile = await supa.get_profile(user_id)
    hero_level = profile["hero_level"] if profile else 1
    unlocks = get_all_unlocks_for_display(hero_level)
    return {"data": unlocks, "error": None}


@router.get("/stats", response_model=dict)
async def get_stats(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return aggregated hero stats for the profile page.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with stats dict.
    """
    stats = await supa.get_profile_stats(user_id)
    return {"data": stats, "error": None}
