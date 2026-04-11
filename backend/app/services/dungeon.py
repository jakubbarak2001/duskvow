"""Dungeon generation service — pre-rolls combat runs from curated data pools.

No AI calls. All randomness comes from weighted selection over the monster,
event, and loot pools defined in ``app/data/dungeon_pools.json``.
"""

import json
import math
import random
from pathlib import Path
from typing import Any

_POOLS: dict[str, Any] | None = None

_EVENT_WEIGHTS: dict[str, int] = {
    "combat": 50,
    "discovery": 20,
    "trap": 15,
    "rest": 15,
}


def _load_pools() -> dict[str, Any]:
    """Load and cache dungeon pool data from the JSON file."""
    global _POOLS
    if _POOLS is None:
        path = Path(__file__).resolve().parent.parent / "data" / "dungeon_pools.json"
        _POOLS = json.loads(path.read_text(encoding="utf-8"))
    return _POOLS


def get_tier_config(tier: str) -> dict[str, Any]:
    """Return the configuration for a specific dungeon tier.

    Args:
        tier: Tier key (e.g. 'shallow_crypts').

    Returns:
        Tier configuration dict.

    Raises:
        ValueError: If tier is unknown.
    """
    pools = _load_pools()
    if tier not in pools["tiers"]:
        raise ValueError(f"Unknown dungeon tier: {tier}")
    return pools["tiers"][tier]


def get_all_tiers() -> dict[str, dict[str, Any]]:
    """Return all tier configurations keyed by tier slug."""
    return _load_pools()["tiers"]


def get_loot_item_info(item_type: str) -> dict[str, Any]:
    """Return the static loot item info for a given item type.

    Args:
        item_type: Loot item key (e.g. 'scroll_of_clarity').

    Returns:
        Dict with name, description, effect, rarity.

    Raises:
        ValueError: If item_type is unknown.
    """
    pools = _load_pools()
    if item_type not in pools["loot_items"]:
        raise ValueError(f"Unknown loot item: {item_type}")
    return pools["loot_items"][item_type]


def generate_dungeon_run(tier: str, duration_minutes: int) -> dict[str, Any]:
    """Pre-roll a complete dungeon run: events per floor and loot drops.

    Args:
        tier: Dungeon tier key.
        duration_minutes: Total timer duration in minutes.

    Returns:
        Dict with events list, loot list, total_floors, and base_xp.
    """
    config = get_tier_config(tier)
    total_floors = config["floors"]
    total_seconds = duration_minutes * 60
    seconds_per_floor = total_seconds / total_floors

    events: list[dict[str, Any]] = []
    sort_idx = 0

    for floor_num in range(1, total_floors + 1):
        floor_start_seconds = int((floor_num - 1) * seconds_per_floor)

        if floor_num == total_floors:
            # Last floor: boss encounter
            boss = config["boss"]
            events.append({
                "floor_number": floor_num,
                "event_type": "boss",
                "title": f"{boss['name']} Awaits",
                "description": boss["description"],
                "monster_name": boss["name"],
                "monsters_defeated": 1,
                "trigger_at_seconds": floor_start_seconds,
                "sort_order": sort_idx,
            })
            sort_idx += 1
        elif floor_num == 1:
            # First floor: always combat to set the tone
            monster = random.choice(config["monsters"])
            count = random.randint(1, 3)
            events.append({
                "floor_number": floor_num,
                "event_type": "combat",
                "title": f"{monster['name']} Encounter",
                "description": monster["description"],
                "monster_name": monster["name"],
                "monsters_defeated": count,
                "trigger_at_seconds": floor_start_seconds,
                "sort_order": sort_idx,
            })
            sort_idx += 1
        else:
            # Middle floors: weighted random event type
            event_types = list(_EVENT_WEIGHTS.keys())
            weights = list(_EVENT_WEIGHTS.values())
            chosen_type = random.choices(event_types, weights=weights, k=1)[0]

            if chosen_type == "combat":
                monster = random.choice(config["monsters"])
                count = random.randint(1, 3)
                events.append({
                    "floor_number": floor_num,
                    "event_type": "combat",
                    "title": f"{monster['name']} Encounter",
                    "description": monster["description"],
                    "monster_name": monster["name"],
                    "monsters_defeated": count,
                    "trigger_at_seconds": floor_start_seconds,
                    "sort_order": sort_idx,
                })
            else:
                event_pool = config["events"].get(chosen_type, [])
                if not event_pool:
                    # Fallback to combat if pool is empty
                    monster = random.choice(config["monsters"])
                    events.append({
                        "floor_number": floor_num,
                        "event_type": "combat",
                        "title": f"{monster['name']} Encounter",
                        "description": monster["description"],
                        "monster_name": monster["name"],
                        "monsters_defeated": random.randint(1, 3),
                        "trigger_at_seconds": floor_start_seconds,
                        "sort_order": sort_idx,
                    })
                else:
                    event = random.choice(event_pool)
                    events.append({
                        "floor_number": floor_num,
                        "event_type": chosen_type,
                        "title": event["title"],
                        "description": event["description"],
                        "monster_name": None,
                        "monsters_defeated": 0,
                        "trigger_at_seconds": floor_start_seconds,
                        "sort_order": sort_idx,
                    })
            sort_idx += 1

    # Pre-roll loot: 1-2 items from weighted loot table
    loot = _roll_loot(config["loot_weights"], count=random.randint(1, 2))

    return {
        "events": events,
        "loot": loot,
        "total_floors": total_floors,
        "base_xp": config["base_xp"],
    }


def _roll_loot(loot_weights: dict[str, int], count: int) -> list[dict[str, Any]]:
    """Weighted random selection of loot items.

    Args:
        loot_weights: Dict mapping item_type to weight (0 = never drops).
        count: Number of items to roll.

    Returns:
        List of loot item dicts with item_type, item_name, description, effect.
    """
    pools = _load_pools()
    # Filter out zero-weight items
    eligible = {k: v for k, v in loot_weights.items() if v > 0}
    if not eligible:
        return []

    item_types = list(eligible.keys())
    weights = list(eligible.values())
    chosen = random.choices(item_types, weights=weights, k=count)

    result = []
    for item_type in chosen:
        info = pools["loot_items"][item_type]
        result.append({
            "item_type": item_type,
            "item_name": info["name"],
            "description": info["description"],
            "effect": info["effect"],
        })
    return result


def _duration_multiplier(duration_minutes: int) -> float:
    """Return an XP multiplier based on delve duration.

    Baseline is 25 minutes (1.0x). Longer sessions scale up linearly,
    capped at 2.0x for a 120-minute session.

    25 min → 1.0x, 45 min → 1.4x, 60 min → 1.7x, 90 min → 2.0x, 120 min → 2.0x
    """
    baseline = 25
    cap = 2.0
    if duration_minutes <= baseline:
        return 1.0
    ratio = 1.0 + (duration_minutes - baseline) / (90 - baseline)
    return min(ratio, cap)


def compute_xp_reward(
    tier: str,
    cleared_floors: int,
    total_floors: int,
    duration_minutes: int = 25,
    linked_node: bool = False,
    linked_quest: bool = False,
) -> int:
    """Compute XP reward for a dungeon run.

    Args:
        tier: Dungeon tier key.
        cleared_floors: Number of floors the hero cleared.
        total_floors: Total floors in the run.
        duration_minutes: How long the delve lasted (longer = more XP).
        linked_node: Whether a tree node was linked (+20% bonus).
        linked_quest: Whether a daily quest was linked (+15% bonus).

    Returns:
        Integer XP reward (minimum 5).
    """
    config = get_tier_config(tier)
    base = config["base_xp"]

    # Proportional to progress
    progress_ratio = cleared_floors / total_floors if total_floors > 0 else 0
    xp = base * progress_ratio

    # Duration multiplier — longer focus sessions earn more
    xp *= _duration_multiplier(duration_minutes)

    # Bonuses
    if linked_node:
        xp *= 1.20
    if linked_quest:
        xp *= 1.15

    return max(5, math.floor(xp))
