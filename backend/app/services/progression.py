"""Progression service — level unlocks, streak bonuses, and feature gating.

All configuration is loaded from ``app/data/level_unlocks.json`` and cached
in-process. No DB calls — pure lookups against the static config.
"""

import json
from pathlib import Path
from typing import Any

from app.core import supabase as supa

_CONFIG: dict[str, Any] | None = None


def _load_config() -> dict[str, Any]:
    """Load and cache the level-unlock configuration."""
    global _CONFIG
    if _CONFIG is None:
        path = Path(__file__).resolve().parent.parent / "data" / "level_unlocks.json"
        _CONFIG = json.loads(path.read_text(encoding="utf-8"))
    return _CONFIG


def _highest_threshold(mapping: dict[str, Any], value: int) -> Any:
    """Return the value from *mapping* whose key is the highest int <= *value*.

    Args:
        mapping: Dict with stringified-int keys (e.g. ``{"1": 2, "5": 3}``).
        value: The level/streak to evaluate against.

    Returns:
        The mapped value at the highest qualifying threshold.
    """
    best_val = None
    best_key = -1
    for k, v in mapping.items():
        k_int = int(k)
        if k_int <= value and k_int > best_key:
            best_key = k_int
            best_val = v
    return best_val


# -----------------------------------------------------------------------
# Public API
# -----------------------------------------------------------------------


def get_generation_limit(hero_level: int) -> int:
    """Return the daily AI generation limit for a given hero level.

    Args:
        hero_level: The user's current hero level.

    Returns:
        Integer generation cap (default 2).
    """
    cfg = _load_config()
    result = _highest_threshold(cfg["generation_limits"], hero_level)
    return result if result is not None else 2


def get_active_tree_cap(hero_level: int) -> int:
    """Return the maximum active trees allowed at a given hero level.

    Args:
        hero_level: The user's current hero level.

    Returns:
        Integer tree cap (default 5).
    """
    cfg = _load_config()
    result = _highest_threshold(cfg["active_tree_cap"], hero_level)
    return result if result is not None else 5


def get_streak_multiplier(current_streak: int) -> float:
    """Return the XP multiplier based on the user's current streak length.

    Args:
        current_streak: Number of consecutive active days.

    Returns:
        Float multiplier (1.0 = no bonus, 1.20 = 20% bonus).
    """
    cfg = _load_config()
    result = _highest_threshold(cfg["streak_bonuses"], current_streak)
    return float(result) if result is not None else 1.0


def get_next_streak_milestone(current_streak: int) -> dict[str, Any] | None:
    """Return info about the next streak bonus threshold.

    Args:
        current_streak: Number of consecutive active days.

    Returns:
        Dict with days_needed, target_days, and multiplier, or None if at max.
    """
    cfg = _load_config()
    thresholds = sorted(int(k) for k in cfg["streak_bonuses"])
    for threshold in thresholds:
        if threshold > current_streak:
            return {
                "target_days": threshold,
                "days_needed": threshold - current_streak,
                "multiplier": cfg["streak_bonuses"][str(threshold)],
            }
    return None


def get_unlocked_features(hero_level: int) -> list[str]:
    """Return list of feature keys unlocked at this level.

    Args:
        hero_level: The user's current hero level.

    Returns:
        List of unlocked feature key strings.
    """
    cfg = _load_config()
    return [
        key for key, req_level in cfg["feature_unlocks"].items()
        if hero_level >= req_level
    ]


def get_all_unlocks_for_display(hero_level: int) -> list[dict[str, Any]]:
    """Return all level unlocks with their current status for profile display.

    Includes generation limits, tree caps, dungeon tiers, and feature unlocks,
    sorted by required level.

    Args:
        hero_level: The user's current hero level.

    Returns:
        List of unlock dicts with feature, description, required_level, unlocked.
    """
    cfg = _load_config()
    unlocks: list[dict[str, Any]] = []

    # Dungeon tiers
    tier_names = {
        "shallow_crypts": "The Shallow Crypts",
        "ember_mines": "The Ember Mines",
        "hollow_deep": "The Hollow Deep",
        "abyssal_rift": "The Abyssal Rift",
    }
    for tier_key, req_level in cfg["dungeon_tiers"].items():
        unlocks.append({
            "feature": f"dungeon_{tier_key}",
            "description": f"Dungeon: {tier_names.get(tier_key, tier_key)}",
            "required_level": req_level,
            "unlocked": hero_level >= req_level,
        })

    # Generation limits
    prev_limit = 0
    for level_str, limit in sorted(cfg["generation_limits"].items(), key=lambda x: int(x[0])):
        req_level = int(level_str)
        if limit > prev_limit:
            unlocks.append({
                "feature": f"gen_limit_{limit}",
                "description": f"{limit} daily AI generations",
                "required_level": req_level,
                "unlocked": hero_level >= req_level,
            })
            prev_limit = limit

    # Active tree caps
    prev_cap = 0
    for level_str, cap in sorted(cfg["active_tree_cap"].items(), key=lambda x: int(x[0])):
        req_level = int(level_str)
        if cap > prev_cap:
            unlocks.append({
                "feature": f"tree_cap_{cap}",
                "description": f"{cap} active talent trees",
                "required_level": req_level,
                "unlocked": hero_level >= req_level,
            })
            prev_cap = cap

    # Feature unlocks
    feature_descriptions = {
        "hero_profile": "Hero Profile page",
        "fog_of_war_toggle": "Tree fog-of-war toggle",
        "prestige": "Prestige (reset for permanent +10% XP)",
    }
    for key, req_level in cfg["feature_unlocks"].items():
        unlocks.append({
            "feature": key,
            "description": feature_descriptions.get(key, key),
            "required_level": req_level,
            "unlocked": hero_level >= req_level,
        })

    # Streak bonuses
    for level_str, mult in sorted(cfg["streak_bonuses"].items(), key=lambda x: int(x[0])):
        days = int(level_str)
        pct = round((mult - 1.0) * 100)
        unlocks.append({
            "feature": f"streak_{days}",
            "description": f"{days}-day streak: +{pct}% XP bonus",
            "required_level": 1,  # streak bonuses are level-independent
            "unlocked": True,  # always available, gated by streak not level
        })

    unlocks.sort(key=lambda u: u["required_level"])
    return unlocks


async def get_user_streak_multiplier(user_id: str) -> float:
    """Fetch a user's profile and compute their streak XP multiplier.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Float multiplier (1.0 if no streak bonus).
    """
    profile = await supa.get_profile(user_id)
    if not profile:
        return 1.0
    return get_streak_multiplier(profile.get("current_streak", 0))
