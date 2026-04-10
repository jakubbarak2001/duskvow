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

# Shared HTTP client — reuses TCP connections instead of opening a new one per call.
_client = httpx.AsyncClient(timeout=30.0)


def _url(table: str) -> str:
    """PostgREST table endpoint URL."""
    return f"{settings.supabase_url}/rest/v1/{table}"


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------

async def _get(table: str, params: dict[str, str]) -> list[dict[str, Any]]:
    """SELECT rows matching params."""
    res = await _client.get(_url(table), headers=_SERVICE_HEADERS, params=params)
    res.raise_for_status()
    return res.json()


async def _insert_one(table: str, data: dict[str, Any]) -> dict[str, Any]:
    """INSERT one row, returning it."""
    res = await _client.post(_url(table), headers=_SERVICE_HEADERS, json=data)
    res.raise_for_status()
    return res.json()[0]


async def _bulk_insert(table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """INSERT multiple rows, returning them all."""
    res = await _client.post(_url(table), headers=_SERVICE_HEADERS, json=rows)
    res.raise_for_status()
    return res.json()


async def _patch(
    table: str,
    params: dict[str, str],
    data: dict[str, Any],
) -> list[dict[str, Any]]:
    """UPDATE rows matching params, returning updated rows."""
    res = await _client.patch(
        _url(table),
        headers=_SERVICE_HEADERS,
        params=params,
        json=data,
    )
    res.raise_for_status()
    return res.json()


async def _delete(table: str, params: dict[str, str]) -> None:
    """DELETE rows matching params."""
    res = await _client.delete(
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
    res = await _client.post(
        _url("profiles"),
        headers={
            **_SERVICE_HEADERS,
            "Prefer": "return=representation,resolution=merge-duplicates",
        },
        json=payload,
    )
    res.raise_for_status()
    return res.json()[0]


async def add_xp_to_profile(user_id: str, xp: int) -> dict[str, Any]:
    """Add XP to a user's profile atomically, with level-up detection.

    Uses a direct SQL increment (total_xp + N) to avoid the read-modify-write
    race condition where two concurrent completions could clobber each other's XP.
    The RPC function also computes the new level, updates hero_level/hero_title
    if a level-up occurred, and returns full level context.

    Args:
        user_id: Authenticated user's UUID.
        xp: Amount of XP to add.

    Returns:
        Dict with new_total_xp, new_level, previous_level, leveled_up, new_title.
    """
    res = await _client.post(
        f"{settings.supabase_url}/rest/v1/rpc/increment_profile_xp",
        headers=_SERVICE_HEADERS,
        json={"p_user_id": user_id, "p_xp": xp},
    )
    res.raise_for_status()
    result = res.json()
    if isinstance(result, dict):
        return result
    # Fallback for unexpected return shape
    return {
        "new_total_xp": result if isinstance(result, int) else 0,
        "new_level": 1,
        "previous_level": 1,
        "leveled_up": False,
        "new_title": "Wanderer",
    }


async def update_streak(user_id: str) -> None:
    """Update current_streak and longest_streak atomically via Postgres RPC.

    Delegates to update_streak_atomic() which does the read + conditional
    increment in a single transaction, preventing two concurrent completions
    from clobbering each other's streak.

    Args:
        user_id: Authenticated user's UUID.
    """
    res = await _client.post(
        f"{settings.supabase_url}/rest/v1/rpc/update_streak_atomic",
        headers=_SERVICE_HEADERS,
        json={"p_user_id": user_id},
    )
    res.raise_for_status()


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
    """Atomically increment today's generation count, returning the new value.

    Delegates to a Postgres function that does the upsert + increment in a
    single statement, preventing the TOCTOU race where two concurrent requests
    both read count=0 and both insert a new row (count=1 each).

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        New count after increment.
    """
    res = await _client.post(
        f"{settings.supabase_url}/rest/v1/rpc/increment_daily_generation",
        headers=_SERVICE_HEADERS,
        json={"p_user_id": user_id, "p_date": date.today().isoformat()},
    )
    res.raise_for_status()
    result = res.json()
    return result if isinstance(result, int) else 1


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


async def batch_update_nodes_state(node_ids: list[str], state: str) -> None:
    """Update multiple skill nodes to the same state in a single query.

    Uses PostgREST's `id=in.(id1,id2,...)` filter to avoid N individual UPDATEs.

    Args:
        node_ids: List of node UUIDs to update.
        state: New state value for all nodes.
    """
    if not node_ids:
        return
    id_list = f"in.({','.join(node_ids)})"
    await _patch("skill_nodes", {"id": id_list}, {"state": state})


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
