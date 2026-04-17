"""Achievement tracking service — evaluates conditions and awards badges.

Achievements are one-time accomplishments defined in ``app/data/achievements.json``.
The ``check_and_award`` function is called after significant user actions (node
complete, dungeon complete, etc.) and returns any newly earned achievements so
the frontend can show notification toasts.
"""

import json
from pathlib import Path
from typing import Any

from app.core import supabase as supa

_ACHIEVEMENTS: dict[str, Any] | None = None


def _load_achievements() -> dict[str, Any]:
    """Load and cache achievement definitions from JSON."""
    global _ACHIEVEMENTS
    if _ACHIEVEMENTS is None:
        path = Path(__file__).resolve().parent.parent / "data" / "achievements.json"
        _ACHIEVEMENTS = json.loads(path.read_text(encoding="utf-8"))
    return _ACHIEVEMENTS


def get_all_achievements() -> dict[str, Any]:
    """Return all achievement definitions."""
    return _load_achievements()


async def get_user_achievements_with_status(user_id: str) -> list[dict[str, Any]]:
    """Return all achievements with the user's unlock status.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of achievement dicts with key, name, description, category,
        icon, unlocked, and unlocked_at.
    """
    definitions = _load_achievements()
    earned_rows = await supa.get_user_achievements(user_id)
    earned_map = {r["achievement_key"]: r["unlocked_at"] for r in earned_rows}

    result = []
    for key, defn in definitions.items():
        result.append({
            "key": key,
            "name": defn["name"],
            "description": defn["description"],
            "category": defn["category"],
            "icon": defn["icon"],
            "unlocked": key in earned_map,
            "unlocked_at": earned_map.get(key),
        })
    return result


async def check_and_award(
    user_id: str,
    trigger: str,
    context: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Check all achievement conditions and award any newly qualified ones.

    Args:
        user_id: Authenticated user's UUID.
        trigger: Action that triggered the check. One of:
            node_complete, tree_complete, dungeon_complete, dungeon_retreat,
            streak_update, level_up, loot_claimed.
        context: Additional data for evaluation (e.g. level, streak, duration).

    Returns:
        List of newly awarded achievement dicts (empty if none earned).
    """
    if context is None:
        context = {}

    definitions = _load_achievements()
    already_earned = set(await supa.get_user_achievement_keys(user_id))

    # Only evaluate achievements relevant to the current trigger
    relevant = _get_relevant_achievements(trigger, definitions, already_earned)
    if not relevant:
        return []

    newly_awarded: list[dict[str, Any]] = []

    for key, defn in relevant.items():
        condition = defn["condition"]
        earned = await _evaluate_condition(user_id, condition, context)

        if earned:
            try:
                await supa.award_achievement(user_id, key)
                newly_awarded.append({
                    "key": key,
                    "name": defn["name"],
                    "description": defn["description"],
                    "category": defn["category"],
                    "icon": defn["icon"],
                })
            except Exception:
                # UNIQUE constraint violation = already awarded (race condition)
                pass

    return newly_awarded


def _get_relevant_achievements(
    trigger: str,
    definitions: dict[str, Any],
    already_earned: set[str],
) -> dict[str, Any]:
    """Filter achievements to only those possibly affected by this trigger.

    Args:
        trigger: The action trigger type.
        definitions: All achievement definitions.
        already_earned: Set of already-earned achievement keys.

    Returns:
        Dict of achievement key → definition for relevant, un-earned achievements.
    """
    trigger_to_condition_types: dict[str, set[str]] = {
        "node_complete": {"tree_nodes_completed"},
        "tree_complete": {"trees_completed", "tree_nodes_completed"},
        "dungeon_complete": {"dungeons_completed", "dungeon_duration_completed"},
        "dungeon_retreat": set(),  # retreating doesn't earn achievements
        "streak_update": {"streak_reached"},
        "level_up": {"level_reached"},
        "loot_claimed": {"total_loot_collected"},
    }

    # active_trees can be triggered by tree creation (not currently a trigger,
    # but check it alongside tree_complete for safety)
    trigger_to_condition_types.setdefault("tree_complete", set()).add("active_trees")

    relevant_types = trigger_to_condition_types.get(trigger, set())
    if not relevant_types:
        return {}

    return {
        key: defn
        for key, defn in definitions.items()
        if key not in already_earned and defn["condition"]["type"] in relevant_types
    }


async def _evaluate_condition(
    user_id: str,
    condition: dict[str, Any],
    context: dict[str, Any],
) -> bool:
    """Evaluate a single achievement condition.

    Args:
        user_id: Authenticated user's UUID.
        condition: Condition dict from the achievement definition.
        context: Additional context data from the triggering action.

    Returns:
        True if the condition is met.
    """
    ctype = condition["type"]

    if ctype == "trees_completed":
        count = await supa.count_completed_trees(user_id)
        return count >= condition["count"]

    if ctype == "active_trees":
        count = await supa.count_active_trees(user_id)
        return count >= condition["count"]

    if ctype == "tree_nodes_completed":
        # Check if the just-completed tree had >= N completed nodes
        tree_id = context.get("tree_id")
        if not tree_id:
            return False
        nodes = await supa.get_all_tree_nodes(tree_id)
        completed = sum(1 for n in nodes if n["state"] == "completed")
        return completed >= condition["count"]

    if ctype == "dungeons_completed":
        count = await supa.count_completed_dungeons(user_id)
        return count >= condition["count"]

    if ctype == "dungeon_duration_completed":
        # Check if context has the completed run's duration
        duration = context.get("duration_minutes", 0)
        return duration >= condition["minutes"]

    if ctype == "total_loot_collected":
        count = await supa.get_user_inventory_count(user_id)
        return count >= condition["count"]

    if ctype == "streak_reached":
        streak = context.get("streak", 0)
        if streak >= condition["days"]:
            return True
        # Also check profile in case context didn't include it
        profile = await supa.get_profile(user_id)
        if profile:
            return max(
                profile.get("current_streak", 0),
                profile.get("longest_streak", 0),
            ) >= condition["days"]
        return False

    if ctype == "level_reached":
        level = context.get("level", 0)
        if level >= condition["level"]:
            return True
        profile = await supa.get_profile(user_id)
        return (profile["hero_level"] if profile else 1) >= condition["level"]

    return False
