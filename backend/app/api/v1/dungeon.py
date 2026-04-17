"""Dungeon API routes — start runs, track progress, complete/retreat."""

import asyncio
import math
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core import supabase as supa
from app.core.dependencies import get_current_user_id
from app.schemas.dungeon import DungeonStartRequest
from app.services.dungeon import (
    compute_xp_reward,
    generate_dungeon_run,
    get_all_tiers,
)
from app.services.achievements import check_and_award
from app.services.progression import get_user_streak_multiplier

router = APIRouter()


@router.get("/tiers", response_model=dict)
async def list_tiers(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return all dungeon tiers with lock status based on hero level.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of tier objects, each with an 'unlocked' flag.
    """
    profile = await supa.get_profile(user_id)
    hero_level = profile["hero_level"] if profile else 1

    tiers = get_all_tiers()
    data = [
        {
            "key": key,
            "name": cfg["name"],
            "description": cfg["description"],
            "min_level": cfg["min_level"],
            "floors": cfg["floors"],
            "base_xp": cfg["base_xp"],
            "unlocked": hero_level >= cfg["min_level"],
        }
        for key, cfg in tiers.items()
    ]

    return {"data": data, "error": None}


@router.get("/active", response_model=dict)
async def get_active_run(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return the user's current active dungeon run with events.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with run + events, or null data if no active run.
    """
    run = await supa.get_active_dungeon_run(user_id)
    return {"data": run, "error": None}


@router.post("/start", response_model=dict)
async def start_run(
    body: DungeonStartRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Start a new dungeon run.

    Validates hero level, ensures no active run exists, pre-rolls the
    dungeon events and loot, then persists everything.

    Args:
        body: Tier, duration, optional linked node.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with the created run, events, and loot.
    """
    # Parallel: fetch profile and check for active run
    profile, active_run = await asyncio.gather(
        supa.get_profile(user_id),
        supa.get_active_dungeon_run(user_id),
    )

    if active_run:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active dungeon run. Complete or retreat first.",
        )

    hero_level = profile["hero_level"] if profile else 1
    tiers = get_all_tiers()

    if body.tier not in tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown dungeon tier: {body.tier}",
        )

    tier_cfg = tiers[body.tier]
    if hero_level < tier_cfg["min_level"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Hero level {hero_level} is too low. {tier_cfg['name']} requires level {tier_cfg['min_level']}.",
        )

    # Verify linked node ownership before committing to a run.
    # Without this, a crafted linked_node_id would let an attacker credit
    # their dungeon bonuses against another user's node. The FK is ON DELETE
    # SET NULL with no user scope, so only the API layer can enforce this.
    if body.linked_node_id:
        linked_node = await supa.get_node(body.linked_node_id)
        if not linked_node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Linked node not found.",
            )
        linked_tree = await supa.get_tree_by_id(linked_node["tree_id"])
        if not linked_tree or linked_tree["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Linked node does not belong to you.",
            )

    # Generate the dungeon run (no AI calls — pure random from pools)
    generated = generate_dungeon_run(body.tier, body.duration_minutes)

    # Persist the run
    run = await supa.create_dungeon_run({
        "user_id": user_id,
        "tier": body.tier,
        "total_floors": generated["total_floors"],
        "duration_minutes": body.duration_minutes,
        "linked_node_id": body.linked_node_id,
        "status": "active",
    })
    run_id = run["id"]

    # Prepare event and loot rows with run_id
    event_rows = [
        {**evt, "run_id": run_id}
        for evt in generated["events"]
    ]
    loot_rows = [
        {
            "run_id": run_id,
            "user_id": user_id,
            "item_type": item["item_type"],
            "item_name": item["item_name"],
            "description": item["description"],
            "effect": item["effect"],
        }
        for item in generated["loot"]
    ]

    # Persist events and loot in parallel
    events, loot = await asyncio.gather(
        supa.create_dungeon_events(event_rows),
        supa.create_dungeon_loot(loot_rows),
    )

    return {
        "data": {
            **run,
            "events": events,
            "loot": loot,
        },
        "error": None,
    }


@router.post("/complete", response_model=dict)
async def complete_run(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Complete the user's active dungeon run.

    Awards full XP (with bonus for linked node) and grants loot.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with xp_earned, loot, level-up info.
    """
    run = await supa.get_active_dungeon_run(user_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active dungeon run to complete.",
        )

    total_floors = run["total_floors"]
    base_xp = compute_xp_reward(
        tier=run["tier"],
        cleared_floors=total_floors,
        total_floors=total_floors,
        duration_minutes=run["duration_minutes"],
        linked_node=bool(run.get("linked_node_id")),
    )

    # Apply streak multiplier
    streak_mult = await get_user_streak_multiplier(user_id)
    adjusted_xp = math.floor(base_xp * streak_mult)
    streak_bonus_xp = adjusted_xp - base_xp

    now = datetime.now(timezone.utc).isoformat()

    # Update run status and award XP/activity/streak in parallel
    _updated_run, xp_result, _, streak_result = await asyncio.gather(
        supa.complete_dungeon_run(run["id"], {
            "status": "completed",
            "cleared_floors": total_floors,
            "xp_earned": adjusted_xp,
            "completed_at": now,
        }),
        supa.add_xp_to_profile(user_id, adjusted_xp),
        supa.record_daily_activity(user_id, 0, adjusted_xp),
        supa.update_streak(user_id),
    )

    # Fetch loot for the response
    loot = await supa.get_dungeon_loot(run["id"])

    # Check achievements
    new_achievements = await check_and_award(
        user_id, "dungeon_complete",
        {"duration_minutes": run["duration_minutes"]},
    )
    if xp_result.get("leveled_up"):
        level_achievements = await check_and_award(
            user_id, "level_up", {"level": xp_result.get("new_level", 1)}
        )
        new_achievements.extend(level_achievements)

    return {
        "data": {
            "run_id": run["id"],
            "status": "completed",
            "cleared_floors": total_floors,
            "total_floors": total_floors,
            "xp_earned": adjusted_xp,
            "base_xp": base_xp,
            "streak_bonus_xp": streak_bonus_xp,
            "total_xp": xp_result.get("new_total_xp", 0),
            "leveled_up": xp_result.get("leveled_up", False),
            "new_level": xp_result.get("new_level", 1),
            "previous_level": xp_result.get("previous_level", 1),
            "new_title": xp_result.get("new_title", "Wanderer"),
            "loot": loot,
            "new_achievements": new_achievements,
            "streak_milestone": streak_result.get("streak_milestone") if isinstance(streak_result, dict) else None,
        },
        "error": None,
    }


@router.post("/retreat", response_model=dict)
async def retreat_run(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Retreat from the active dungeon run.

    Awards partial XP proportional to floors cleared (based on elapsed time),
    but grants zero loot. The CD8 (Loss/Avoidance) penalty.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with partial xp_earned, cleared_floors.
    """
    run = await supa.get_active_dungeon_run(user_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active dungeon run to retreat from.",
        )

    # Calculate floors cleared based on elapsed time
    started_at = datetime.fromisoformat(run["created_at"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    elapsed_seconds = (now - started_at).total_seconds()
    total_seconds = run["duration_minutes"] * 60
    total_floors = run["total_floors"]

    if total_seconds > 0:
        cleared_floors = min(
            total_floors - 1,  # Can't "clear" last floor by retreating
            int((elapsed_seconds / total_seconds) * total_floors),
        )
    else:
        cleared_floors = 0

    cleared_floors = max(0, cleared_floors)

    base_xp = compute_xp_reward(
        tier=run["tier"],
        cleared_floors=cleared_floors,
        total_floors=total_floors,
        duration_minutes=run["duration_minutes"],
        linked_node=False,  # No bonuses on retreat
    )

    # Apply streak multiplier even on retreat (you still worked)
    streak_mult = await get_user_streak_multiplier(user_id)
    adjusted_xp = math.floor(base_xp * streak_mult)
    streak_bonus_xp = adjusted_xp - base_xp

    now_iso = now.isoformat()

    # Update run and award partial XP in parallel
    _, xp_result, _, streak_result = await asyncio.gather(
        supa.complete_dungeon_run(run["id"], {
            "status": "retreated",
            "cleared_floors": cleared_floors,
            "xp_earned": adjusted_xp,
            "completed_at": now_iso,
        }),
        supa.add_xp_to_profile(user_id, adjusted_xp),
        supa.record_daily_activity(user_id, 0, adjusted_xp),
        supa.update_streak(user_id),
    )

    return {
        "data": {
            "run_id": run["id"],
            "status": "retreated",
            "cleared_floors": cleared_floors,
            "total_floors": total_floors,
            "xp_earned": adjusted_xp,
            "base_xp": base_xp,
            "streak_bonus_xp": streak_bonus_xp,
            "total_xp": xp_result.get("new_total_xp", 0),
            "leveled_up": xp_result.get("leveled_up", False),
            "new_level": xp_result.get("new_level", 1),
            "loot": [],  # No loot on retreat
            "streak_milestone": streak_result.get("streak_milestone") if isinstance(streak_result, dict) else None,
        },
        "error": None,
    }


@router.get("/history", response_model=dict)
async def get_history(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return the user's last 10 completed or retreated dungeon runs.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of past run summaries.
    """
    runs = await supa.get_dungeon_history(user_id)
    return {"data": runs, "error": None}
