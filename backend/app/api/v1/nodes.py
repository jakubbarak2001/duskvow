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

    Perf notes (2026-04-17):
      - Node + tree are fetched in one embedded PostgREST query (1 RT).
      - Tree nodes + streak multiplier run in parallel (1 RT).
      - The node-state write is applied in memory so the unlock + counter
        recompute does NOT require a second `get_all_tree_nodes` refetch.
      - All six writes (node update, unlock batch, tree counters, XP,
        activity, streak) run in a single ``asyncio.gather``.

    Args:
        node_id: UUID of the node to complete.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with node_id, new_state, xp_earned, total_xp.
    """
    # 1 RT — node + parent tree via embedded select.
    node, tree = await supa.get_node_with_tree(node_id)
    if not node or not tree or tree.get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found.")

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

    # 1 RT (parallel) — sibling nodes for prereq + unlock checks, and the
    # profile read used to derive the streak multiplier. These are
    # independent of each other so we fan them out.
    all_nodes, streak_mult = await asyncio.gather(
        supa.get_all_tree_nodes(node["tree_id"]),
        get_user_streak_multiplier(user_id),
    )
    node_map = {n["id"]: n for n in all_nodes}

    # Always verify prerequisites against live DB state.
    # We intentionally do NOT gate on node["state"] == "locked" here:
    # the frontend may optimistically unlock a node before the backend's
    # prior completion write commits, so a "locked" DB state is not a
    # reliable signal when completions arrive in quick succession.
    prereqs: list[str] = node.get("prerequisites") or []
    for prereq_id in prereqs:
        prereq = node_map.get(prereq_id)
        if prereq and prereq["state"] != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prerequisite '{prereq['title']}' must be completed first.",
            )

    # Apply the completion in memory so unlock + counter math doesn't need
    # a second `get_all_tree_nodes` refetch from the DB.
    completed_at = datetime.now(timezone.utc).isoformat()
    node_map[node_id] = {**node_map[node_id], "state": "completed", "completed_at": completed_at}
    all_nodes = list(node_map.values())

    # Collect all nodes to unlock based on the post-completion state.
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

    # Recompute counters from the in-memory post-completion state.
    # This replaces the pre-parallel sequential flow (update → refetch →
    # update_tree_progress) and preserves the stale-read-race protection
    # because these counts include the single node we just flipped.
    completed_count = sum(1 for n in all_nodes if n["state"] == "completed")
    earned_xp = sum(n["xp_reward"] for n in all_nodes if n["state"] == "completed")
    new_status = "completed" if completed_count >= tree["total_nodes"] else "active"

    # XP + streak-bonus math.
    base_xp = node["xp_reward"]
    adjusted_xp = math.floor(base_xp * streak_mult)
    streak_bonus_xp = adjusted_xp - base_xp

    # 1 RT (parallel) — every write for this completion. They all target
    # disjoint rows so ordering doesn't matter; wall time = slowest single
    # call, not the sum.
    (
        _node_write,
        _unlock_write,
        _tree_write,
        xp_result,
        _activity_write,
        streak_result,
    ) = await asyncio.gather(
        supa.update_node(node_id, {"state": "completed", "completed_at": completed_at}),
        supa.batch_update_nodes_state(to_unlock, "available"),
        supa.update_tree_progress(node["tree_id"], completed_count, earned_xp, new_status),
        supa.add_xp_to_profile(user_id, adjusted_xp),
        supa.record_daily_activity(user_id, 1, adjusted_xp),
        supa.update_streak(user_id),
    )

    # Check achievements (node_complete + possible tree_complete).
    # These run sequentially because later calls depend on the XP result
    # (for the level_up trigger) — parallelising them would require
    # threading the level-up context which isn't worth the complexity.
    achievement_context = {"tree_id": node["tree_id"]}
    new_achievements = await check_and_award(user_id, "node_complete", achievement_context)

    if new_status == "completed":
        tree_achievements = await check_and_award(user_id, "tree_complete", achievement_context)
        new_achievements.extend(tree_achievements)

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


