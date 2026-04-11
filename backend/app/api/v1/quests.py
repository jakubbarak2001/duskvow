"""Daily Quest API routes — list today's quests, complete, and uncomplete."""

import asyncio
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core import supabase as supa
from app.core.dependencies import get_current_user_id

router = APIRouter()


@router.get("/today", response_model=dict)
async def get_today_quests(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return all daily quests for the user's active trees, with today's completion status.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of quest objects, each including completed_today flag.
    """
    quests, completions = await asyncio.gather(
        supa.list_daily_quests(user_id),
        supa.get_today_completions(user_id),
    )

    completed_quest_ids = {c["quest_id"] for c in completions}

    data = [
        {**q, "completed_today": q["id"] in completed_quest_ids}
        for q in quests
    ]

    return {"data": data, "error": None}


@router.post("/{quest_id}/complete", response_model=dict)
async def complete_quest(
    quest_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Mark a daily quest as completed for today.

    Awards XP, records daily activity, and updates streak.

    Args:
        quest_id: UUID of the quest to complete.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with quest_id, xp_earned, total_xp, and level-up info.
    """
    quest = await supa.get_daily_quest(quest_id)
    if not quest or quest["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found.",
        )

    # Check if already completed today
    today_completions = await supa.get_today_completions(user_id)
    if any(c["quest_id"] == quest_id for c in today_completions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quest already completed today.",
        )

    # Record completion, award XP, record activity, update streak in parallel
    _, xp_result, _, _ = await asyncio.gather(
        supa.complete_daily_quest(quest_id, user_id),
        supa.add_xp_to_profile(user_id, quest["xp_reward"]),
        supa.record_daily_activity(user_id, 0, quest["xp_reward"]),
        supa.update_streak(user_id),
    )

    return {
        "data": {
            "quest_id": quest_id,
            "xp_earned": quest["xp_reward"],
            "total_xp": xp_result.get("new_total_xp", 0),
            "leveled_up": xp_result.get("leveled_up", False),
            "new_level": xp_result.get("new_level", 1),
            "previous_level": xp_result.get("previous_level", 1),
            "new_title": xp_result.get("new_title", "Wanderer"),
        },
        "error": None,
    }


@router.delete("/{quest_id}/complete", response_model=dict)
async def uncomplete_quest(
    quest_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Un-complete a daily quest for today (undo a misclick).

    Deducts the XP that was awarded on completion to prevent
    farming XP by toggling complete/uncomplete repeatedly.

    Args:
        quest_id: UUID of the quest to uncomplete.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope confirming the uncomplete action.
    """
    quest = await supa.get_daily_quest(quest_id)
    if not quest or quest["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found.",
        )

    # Verify it was actually completed today before deducting
    today_completions = await supa.get_today_completions(user_id)
    was_completed = any(c["quest_id"] == quest_id for c in today_completions)

    if was_completed:
        await asyncio.gather(
            supa.uncomplete_daily_quest(quest_id, user_id),
            supa.add_xp_to_profile(user_id, -quest["xp_reward"]),
        )
    else:
        await supa.uncomplete_daily_quest(quest_id, user_id)

    return {
        "data": {"quest_id": quest_id, "uncompleted": True},
        "error": None,
    }
