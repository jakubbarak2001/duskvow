"""Node API routes — manage skill node states and award XP."""

import asyncio
import math
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core import supabase as supa
from app.core.dependencies import get_current_user_id
from app.services.achievements import check_and_award
from app.services.progression import get_user_streak_multiplier

router = APIRouter()


async def _get_node_with_ownership(
    node_id: str,
    user_id: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Fetch a node and its parent tree, verifying the user owns the tree.

    Args:
        node_id: Node UUID.
        user_id: Authenticated user's UUID.

    Returns:
        Tuple of (node dict, tree dict).

    Raises:
        HTTPException: 404 if node or tree not found, or tree not owned by user.
    """
    node = await supa.get_node(node_id)
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found.")

    tree = await supa.get_tree_by_id(node["tree_id"])
    if not tree or tree["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found.")

    return node, tree


@router.patch("/{node_id}/complete", response_model=dict)
async def complete_node(
    node_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Mark a skill node as completed, award XP, and unlock dependent nodes.

    Validates that the node is available/in-progress and all prerequisites
    are completed. Then:
    - Sets node state to 'completed'
    - Unlocks any node whose prerequisites are now all completed
    - Updates tree progress counters
    - Adds XP to the user's profile
    - Records daily activity and updates streak

    Args:
        node_id: UUID of the node to complete.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with node_id, new_state, xp_earned, total_xp.
    """
    node, tree = await _get_node_with_ownership(node_id, user_id)

    if tree["status"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This tree is finished and can no longer be modified.",
        )

    if node["state"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Node is already completed.",
        )

    # Always verify prerequisites against live DB state.
    # We intentionally do NOT gate on node["state"] == "locked" here:
    # the frontend may optimistically unlock a node before the backend's
    # prior completion write commits, so a "locked" DB state is not a
    # reliable signal when completions arrive in quick succession.
    prereqs: list[str] = node.get("prerequisites") or []
    all_nodes = await supa.get_all_tree_nodes(node["tree_id"])
    node_map = {n["id"]: n for n in all_nodes}
    for prereq_id in prereqs:
        prereq = node_map.get(prereq_id)
        if prereq and prereq["state"] != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prerequisite '{prereq['title']}' must be completed first.",
            )

    # Mark this node completed
    await supa.update_node(
        node_id,
        {
            "state": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        },
    )

    # Re-fetch all nodes so counts and unlock checks reflect the write above
    all_nodes = await supa.get_all_tree_nodes(node["tree_id"])
    node_map = {n["id"]: n for n in all_nodes}

    # Collect all nodes to unlock, then batch in a single UPDATE
    to_unlock = [
        n["id"]
        for n in all_nodes
        if n["state"] == "locked"
        and node_id in (n.get("prerequisites") or [])
        and all(
            node_map.get(p, {}).get("state") == "completed"
            for p in (n.get("prerequisites") or [])
        )
    ]
    await supa.batch_update_nodes_state(to_unlock, "available")

    # Recompute counters from live node data — avoids the stale-read race where
    # two concurrent completions each read the same old tree["earned_xp"] and
    # the second write silently discards the first's XP increment.
    completed_count = sum(1 for n in all_nodes if n["state"] == "completed")
    earned_xp = sum(n["xp_reward"] for n in all_nodes if n["state"] == "completed")
    new_status = "completed" if completed_count >= tree["total_nodes"] else "active"
    await supa.update_tree_progress(node["tree_id"], completed_count, earned_xp, new_status)

    # Apply streak multiplier to XP
    base_xp = node["xp_reward"]
    streak_mult = await get_user_streak_multiplier(user_id)
    adjusted_xp = math.floor(base_xp * streak_mult)
    streak_bonus_xp = adjusted_xp - base_xp

    # Award XP, record activity, and update streak in parallel
    xp_result, _, streak_result = await asyncio.gather(
        supa.add_xp_to_profile(user_id, adjusted_xp),
        supa.record_daily_activity(user_id, 1, adjusted_xp),
        supa.update_streak(user_id),
    )

    # Check achievements (node_complete + possible tree_complete)
    achievement_context = {"tree_id": node["tree_id"]}
    new_achievements = await check_and_award(user_id, "node_complete", achievement_context)

    if new_status == "completed":
        tree_achievements = await check_and_award(user_id, "tree_complete", achievement_context)
        new_achievements.extend(tree_achievements)

    # Check level-up achievements
    if xp_result.get("leveled_up"):
        level_achievements = await check_and_award(
            user_id, "level_up", {"level": xp_result.get("new_level", 1)}
        )
        new_achievements.extend(level_achievements)

    return {
        "data": {
            "node_id": node_id,
            "new_state": "completed",
            "xp_earned": adjusted_xp,
            "base_xp": base_xp,
            "streak_bonus_xp": streak_bonus_xp,
            "total_xp": xp_result.get("new_total_xp", 0),
            "leveled_up": xp_result.get("leveled_up", False),
            "new_level": xp_result.get("new_level", 1),
            "previous_level": xp_result.get("previous_level", 1),
            "new_title": xp_result.get("new_title", "Wanderer"),
            "new_achievements": new_achievements,
            "streak_milestone": streak_result.get("streak_milestone") if isinstance(streak_result, dict) else None,
        },
        "error": None,
    }


@router.patch("/{node_id}/start", response_model=dict)
async def start_node(
    node_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Mark a skill node as in_progress.

    Args:
        node_id: UUID of the node to start.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with node_id and new_state.
    """
    node, tree = await _get_node_with_ownership(node_id, user_id)

    if tree["status"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This tree is finished and can no longer be modified.",
        )

    if node["state"] == "locked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Node is locked — complete prerequisites first.",
        )
    if node["state"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Node is already completed.",
        )
    if node["state"] == "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Node is already in progress.",
        )

    await supa.update_node(node_id, {"state": "in_progress"})

    return {
        "data": {"node_id": node_id, "new_state": "in_progress"},
        "error": None,
    }


@router.patch("/{node_id}/reset", response_model=dict)
async def reset_node(
    node_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Reset a skill node back to available state.

    Note: This does NOT remove XP that was already awarded.

    Args:
        node_id: UUID of the node to reset.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with node_id and new_state.
    """
    node, tree = await _get_node_with_ownership(node_id, user_id)

    if tree["status"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This tree is finished and can no longer be modified.",
        )

    if node["state"] == "locked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Locked nodes cannot be reset.",
        )

    await supa.update_node(node_id, {"state": "available", "completed_at": None})

    return {
        "data": {"node_id": node_id, "new_state": "available"},
        "error": None,
    }
