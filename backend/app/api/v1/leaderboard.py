"""Leaderboard API routes."""

from typing import Any

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user_id
from app.core import supabase as supa

router = APIRouter()


@router.get("", response_model=dict)
async def get_leaderboard(
    metric: str = Query("total_xp", pattern="^(total_xp|current_streak)$"),
    period: str = Query("weekly", pattern="^(weekly|all_time)$"),
    limit: int = Query(50, ge=1, le=100),
    _user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Get the ranked leaderboard.

    Args:
        metric: Ranking metric — 'total_xp' or 'current_streak'.
        period: Time period — 'weekly' or 'all_time'.
        limit: Max entries to return (1-100).
        _user_id: Auth guard — requires valid JWT.

    Returns:
        Envelope with list of ranked entries.
    """
    entries = await supa.get_leaderboard(metric=metric, period=period, limit=limit)
    return {"data": entries, "error": None}


@router.get("/me", response_model=dict)
async def get_my_rank(
    metric: str = Query("total_xp", pattern="^(total_xp|current_streak)$"),
    period: str = Query("weekly", pattern="^(weekly|all_time)$"),
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Get the authenticated user's rank and score.

    Args:
        metric: Ranking metric — 'total_xp' or 'current_streak'.
        period: Time period — 'weekly' or 'all_time'.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with rank, score, and total participants.
    """
    rank_info = await supa.get_leaderboard_rank(
        user_id=user_id, metric=metric, period=period,
    )
    return {"data": rank_info, "error": None}
