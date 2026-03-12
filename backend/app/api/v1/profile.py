"""Profile API routes."""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id

router = APIRouter()


@router.get("", response_model=dict)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Get the authenticated user's profile and stats.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        User profile with XP, streak, and progress stats.
    """
    # TODO (Task 2): Fetch from Supabase profiles table
    return {
        "data": {
            "id": user_id,
            "display_name": None,
            "total_xp": 0,
            "current_streak": 0,
            "longest_streak": 0,
            "last_activity_date": None,
        },
        "error": None,
    }
