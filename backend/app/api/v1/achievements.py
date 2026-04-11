"""Achievement API routes — read-only achievement status."""

from typing import Any

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.services.achievements import get_user_achievements_with_status

router = APIRouter()


@router.get("", response_model=dict)
async def list_achievements(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return all achievements with the user's unlock status.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of achievement objects.
    """
    achievements = await get_user_achievements_with_status(user_id)
    return {"data": achievements, "error": None}
