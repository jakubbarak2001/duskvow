"""Supabase service-role REST client for server-side database access.

All functions use the service-role key which bypasses RLS.
Ownership checks must be done in the calling route handler.
"""

import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx

from app.core.config import settings

_SERVICE_HEADERS: dict[str, str] = {
    "apikey": settings.supabase_service_role_key,
    "Authorization": f"Bearer {settings.supabase_service_role_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def _url(table: str) -> str:
    """PostgREST table endpoint URL."""
    return f"{settings.supabase_url}/rest/v1/{table}"


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------

async def _get(table: str, params: dict[str, str]) -> list[dict[str, Any]]:
    """SELECT rows matching params."""
    async with httpx.AsyncClient() as client:
        res = await client.get(_url(table), headers=_SERVICE_HEADERS, params=params)
        res.raise_for_status()
        return res.json()


async def _insert_one(table: str, data: dict[str, Any]) -> dict[str, Any]:
    """INSERT one row, returning it."""
    async with httpx.AsyncClient() as client:
        res = await client.post(_url(table), headers=_SERVICE_HEADERS, json=data)
        res.raise_for_status()
        return res.json()[0]


async def _bulk_insert(table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """INSERT multiple rows, returning them all."""
    async with httpx.AsyncClient() as client:
        res = await client.post(_url(table), headers=_SERVICE_HEADERS, json=rows)
        res.raise_for_status()
        return res.json()


async def _patch(
    table: str,
    params: dict[str, str],
    data: dict[str, Any],
) -> list[dict[str, Any]]:
    """UPDATE rows matching params, returning updated rows."""
    async with httpx.AsyncClient() as client:
        res = await client.patch(
            _url(table),
            headers=_SERVICE_HEADERS,
            params=params,
            json=data,
        )
        res.raise_for_status()
        return res.json()


async def _delete(table: str, params: dict[str, str]) -> None:
    """DELETE rows matching params."""
    async with httpx.AsyncClient() as client:
        res = await client.delete(
            _url(table),
            headers={**_SERVICE_HEADERS, "Prefer": "return=minimal"},
            params=params,
        )
        res.raise_for_status()


# ---------------------------------------------------------------------------
# Profiles
# ---------------------------------------------------------------------------

async def get_profile(user_id: str) -> dict[str, Any] | None:
    """Fetch a profile row by primary key.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Profile dict or None.
    """
    rows = await _get("profiles", {"id": f"eq.{user_id}", "select": "*"})
    return rows[0] if rows else None


async def upsert_profile(user_id: str, data: dict[str, Any]) -> dict[str, Any]:
    """Insert or update a profile row.

    Args:
        user_id: Authenticated user's UUID.
        data: Fields to merge (id is forced to user_id).

    Returns:
        The upserted profile dict.
    """
    payload = {"id": user_id, **data}
    async with httpx.AsyncClient() as client:
        res = await client.post(
            _url("profiles"),
            headers={
                **_SERVICE_HEADERS,
                "Prefer": "return=representation,resolution=merge-duplicates",
            },
            json=payload,
        )
        res.raise_for_status()
        return res.json()[0]


async def add_xp_to_profile(user_id: str, xp: int) -> int:
    """Add XP to a user's profile, returning the new total.

    Args:
        user_id: Authenticated user's UUID.
        xp: Amount of XP to add.

    Returns:
        New total_xp value.
    """
    profile = await get_profile(user_id)
    new_total = (profile["total_xp"] if profile else 0) + xp
    await upsert_profile(
        user_id,
        {
            "total_xp": new_total,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return new_total


async def update_streak(user_id: str) -> None:
    """Update current_streak and longest_streak based on today's activity.

    Increments streak if last activity was yesterday; resets to 1 if the
    streak was broken; does nothing if already active today.

    Args:
        user_id: Authenticated user's UUID.
    """
    profile = await get_profile(user_id)
    if not profile:
        return

    today = date.today()
    last_str: str | None = profile.get("last_activity_date")
    current: int = profile.get("current_streak", 0)
    longest: int = profile.get("longest_streak", 0)

    if last_str is None:
        new_streak = 1
    else:
        last = date.fromisoformat(last_str)
        if last == today:
            return  # already recorded today
        elif last == today - timedelta(days=1):
            new_streak = current + 1
        else:
            new_streak = 1

    await upsert_profile(
        user_id,
        {
            "current_streak": new_streak,
            "longest_streak": max(longest, new_streak),
            "last_activity_date": today.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )


# ---------------------------------------------------------------------------
# Daily activity
# ---------------------------------------------------------------------------

async def record_daily_activity(
    user_id: str,
    nodes_completed: int,
    xp_earned: int,
) -> None:
    """Upsert today's daily_activity row, incrementing counters.

    Args:
        user_id: Authenticated user's UUID.
        nodes_completed: Number of nodes just completed.
        xp_earned: XP just earned.
    """
    today = date.today().isoformat()
    rows = await _get(
        "daily_activity",
        {"user_id": f"eq.{user_id}", "activity_date": f"eq.{today}"},
    )
    if rows:
        existing = rows[0]
        await _patch(
            "daily_activity",
            {"id": f"eq.{existing['id']}"},
            {
                "nodes_completed": existing["nodes_completed"] + nodes_completed,
                "xp_earned": existing["xp_earned"] + xp_earned,
            },
        )
    else:
        await _insert_one(
            "daily_activity",
            {
                "user_id": user_id,
                "activity_date": today,
                "nodes_completed": nodes_completed,
                "xp_earned": xp_earned,
            },
        )


# ---------------------------------------------------------------------------
# Generation limits and active tree cap
# ---------------------------------------------------------------------------

DAILY_GENERATION_LIMIT = 3
ACTIVE_TREE_CAP = 5


async def get_daily_generation_count(user_id: str) -> int:
    """Return how many trees the user has generated today (UTC date).

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Integer count (0 if no row exists yet).
    """
    today = date.today().isoformat()
    rows = await _get(
        "daily_tree_generations",
        {"user_id": f"eq.{user_id}", "generation_date": f"eq.{today}", "select": "*"},
    )
    return rows[0]["count"] if rows else 0


async def increment_daily_generation(user_id: str) -> int:
    """Increment today's generation count, upserting the row if needed.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        New count after increment.
    """
    today = date.today().isoformat()
    rows = await _get(
        "daily_tree_generations",
        {"user_id": f"eq.{user_id}", "generation_date": f"eq.{today}", "select": "*"},
    )
    if rows:
        existing = rows[0]
        new_count = existing["count"] + 1
        await _patch(
            "daily_tree_generations",
            {"id": f"eq.{existing['id']}"},
            {"count": new_count},
        )
        return new_count
    else:
        await _insert_one(
            "daily_tree_generations",
            {"user_id": user_id, "generation_date": today, "count": 1},
        )
        return 1


async def count_active_trees(user_id: str) -> int:
    """Count how many non-deleted, active trees the user has.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Integer count.
    """
    rows = await _get(
        "talent_trees",
        {
            "user_id": f"eq.{user_id}",
            "status": "eq.active",
            "deleted_at": "is.null",
            "select": "id",
        },
    )
    return len(rows)


async def get_generation_status(user_id: str) -> dict[str, Any]:
    """Return the user's current generation limits and active tree count.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Dict with generations_used, generations_remaining, generations_limit,
        active_trees, and active_tree_cap.
    """
    daily_count = await get_daily_generation_count(user_id)
    active_count = await count_active_trees(user_id)
    return {
        "generations_used": daily_count,
        "generations_remaining": max(0, DAILY_GENERATION_LIMIT - daily_count),
        "generations_limit": DAILY_GENERATION_LIMIT,
        "active_trees": active_count,
        "active_tree_cap": ACTIVE_TREE_CAP,
    }


# ---------------------------------------------------------------------------
# Talent trees
# ---------------------------------------------------------------------------

async def list_trees(user_id: str) -> list[dict[str, Any]]:
    """List all non-deleted talent trees for a user (without nodes).

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of tree dicts.
    """
    return await _get(
        "talent_trees",
        {"user_id": f"eq.{user_id}", "deleted_at": "is.null", "select": "*"},
    )


async def get_tree_by_id(tree_id: str) -> dict[str, Any] | None:
    """Fetch a single non-deleted tree row (without nodes).

    Args:
        tree_id: Tree UUID.

    Returns:
        Tree dict or None.
    """
    rows = await _get(
        "talent_trees",
        {"id": f"eq.{tree_id}", "deleted_at": "is.null", "select": "*"},
    )
    return rows[0] if rows else None


async def get_tree_with_nodes(
    tree_id: str,
    user_id: str,
) -> dict[str, Any] | None:
    """Fetch a tree with all its skill nodes, verifying ownership.

    Args:
        tree_id: Tree UUID.
        user_id: Expected owner UUID.

    Returns:
        Tree dict with a 'nodes' key, or None if not found / not owned.
    """
    tree = await get_tree_by_id(tree_id)
    if not tree or tree["user_id"] != user_id:
        return None
    nodes = await get_all_tree_nodes(tree_id)
    return {**tree, "nodes": nodes}


async def save_generated_tree(
    user_id: str,
    goal_prompt: str,
    ai_result: dict[str, Any],
) -> dict[str, Any]:
    """Persist an AI-generated tree and its nodes, mapping temp IDs to UUIDs.

    The AI returns nodes with temporary string IDs like "node_1". This function
    replaces them with real UUIDs before inserting, preserving prerequisite links.
    Nodes with no prerequisites start as 'available'; all others start as 'locked'.

    Args:
        user_id: Owner's UUID.
        goal_prompt: Original user goal text.
        ai_result: Dict from Gemini with title, description, nodes[], edges[].

    Returns:
        The saved tree dict with 'nodes' key.
    """
    raw_nodes: list[dict] = ai_result.get("nodes", [])
    total_xp = sum(n.get("xp_reward", 10) for n in raw_nodes)

    # Create tree row
    tree = await _insert_one(
        "talent_trees",
        {
            "user_id": user_id,
            "title": ai_result.get("title", "My Vow"),
            "description": ai_result.get("description", ""),
            "goal_prompt": goal_prompt,
            "total_nodes": len(raw_nodes),
            "total_xp": total_xp,
        },
    )
    tree_id = tree["id"]

    # Map temporary AI node IDs → real UUIDs
    id_map: dict[str, str] = {
        n["id"]: str(uuid.uuid4()) for n in raw_nodes
    }

    node_rows: list[dict[str, Any]] = []
    for i, n in enumerate(raw_nodes):
        prereqs_temp: list[str] = n.get("prerequisites", [])
        prereqs_real: list[str] = [id_map.get(p, p) for p in prereqs_temp]
        initial_state = "available" if not prereqs_real else "locked"

        node_rows.append(
            {
                "id": id_map[n["id"]],
                "tree_id": tree_id,
                "title": n["title"],
                "description": n["description"],
                "node_type": n.get("type", "action"),
                "tier": n.get("tier", "common"),
                "state": initial_state,
                "position_x": float(n.get("position", {}).get("x", i * 150)),
                "position_y": float(n.get("position", {}).get("y", 0)),
                "prerequisites": prereqs_real,
                "is_optional": n.get("optional", False),
                "xp_reward": n.get("xp_reward", 10),
                "estimated_time": n.get("estimated_time"),
                "sort_order": i,
            }
        )

    nodes = await _bulk_insert("skill_nodes", node_rows)
    return {**tree, "nodes": nodes}


async def delete_tree(tree_id: str, user_id: str) -> bool:
    """Soft-delete a tree by setting deleted_at, verifying ownership.

    The row is preserved for analytics — it simply becomes invisible to
    all list/get queries which filter on deleted_at IS NULL.

    Args:
        tree_id: Tree UUID.
        user_id: Expected owner UUID.

    Returns:
        True if soft-deleted, False if not found / not owned.
    """
    tree = await get_tree_by_id(tree_id)
    if not tree or tree["user_id"] != user_id:
        return False
    await _patch(
        "talent_trees",
        {"id": f"eq.{tree_id}"},
        {"deleted_at": datetime.now(timezone.utc).isoformat()},
    )
    return True


async def update_tree_progress(
    tree_id: str,
    completed_nodes: int,
    earned_xp: int,
    new_status: str | None = None,
) -> None:
    """Update a tree's completion counters.

    Args:
        tree_id: Tree UUID.
        completed_nodes: New completed node count.
        earned_xp: New earned XP total.
        new_status: Optional new status ('active' | 'completed' | 'abandoned').
    """
    data: dict[str, Any] = {
        "completed_nodes": completed_nodes,
        "earned_xp": earned_xp,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if new_status:
        data["status"] = new_status
    await _patch("talent_trees", {"id": f"eq.{tree_id}"}, data)


# ---------------------------------------------------------------------------
# Skill nodes
# ---------------------------------------------------------------------------

async def get_node(node_id: str) -> dict[str, Any] | None:
    """Fetch a single skill node.

    Args:
        node_id: Node UUID.

    Returns:
        Node dict or None.
    """
    rows = await _get("skill_nodes", {"id": f"eq.{node_id}", "select": "*"})
    return rows[0] if rows else None


async def get_all_tree_nodes(tree_id: str) -> list[dict[str, Any]]:
    """Fetch all nodes for a tree, ordered by sort_order.

    Args:
        tree_id: Tree UUID.

    Returns:
        List of node dicts.
    """
    return await _get(
        "skill_nodes",
        {"tree_id": f"eq.{tree_id}", "select": "*", "order": "sort_order.asc"},
    )


async def update_node(node_id: str, data: dict[str, Any]) -> dict[str, Any]:
    """Update a skill node's fields.

    Args:
        node_id: Node UUID.
        data: Fields to update.

    Returns:
        Updated node dict.
    """
    rows = await _patch("skill_nodes", {"id": f"eq.{node_id}"}, data)
    return rows[0]


# ---------------------------------------------------------------------------
# Embers
# ---------------------------------------------------------------------------

EMBER_CAP = 50


async def list_embers(user_id: str) -> list[dict[str, Any]]:
    """List all embers for a user, ordered by created_at DESC.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of ember dicts.
    """
    return await _get(
        "embers",
        {"user_id": f"eq.{user_id}", "select": "*", "order": "created_at.desc"},
    )


async def count_embers(user_id: str) -> int:
    """Count how many embers the user has.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Integer count.
    """
    rows = await _get("embers", {"user_id": f"eq.{user_id}", "select": "id"})
    return len(rows)


async def create_ember(
    user_id: str,
    title: str,
    description: str | None,
) -> dict[str, Any]:
    """Insert a new ember row.

    Args:
        user_id: Owner's UUID.
        title: Victory title (1-100 chars).
        description: Optional description (max 500 chars).

    Returns:
        The created ember dict.
    """
    payload: dict[str, Any] = {"user_id": user_id, "title": title}
    if description is not None:
        payload["description"] = description
    return await _insert_one("embers", payload)


async def get_ember(ember_id: str) -> dict[str, Any] | None:
    """Fetch a single ember row.

    Args:
        ember_id: Ember UUID.

    Returns:
        Ember dict or None.
    """
    rows = await _get("embers", {"id": f"eq.{ember_id}", "select": "*"})
    return rows[0] if rows else None


async def delete_ember(ember_id: str, user_id: str) -> bool:
    """Delete an ember, verifying ownership.

    Args:
        ember_id: Ember UUID.
        user_id: Expected owner UUID.

    Returns:
        True if deleted, False if not found or not owned.
    """
    ember = await get_ember(ember_id)
    if not ember or ember["user_id"] != user_id:
        return False
    await _delete("embers", {"id": f"eq.{ember_id}"})
    return True
