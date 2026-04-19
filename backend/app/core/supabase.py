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


def _check(res: httpx.Response) -> None:
    """Like res.raise_for_status() but includes the PostgREST response body.

    PostgREST encodes the actionable diagnostic (missing column, FK
    violation, RLS denial, null constraint, type mismatch) in the JSON
    response body. Plain raise_for_status() discards it, leaving only
    "400 Bad Request" + URL in the traceback — unactionable in prod.
    This wrapper re-raises with the body preserved in the exception
    message, which the global handler in main.py then logs via
    exc_info=True. Body is truncated to 2000 chars to keep log lines
    bounded on worst-case responses.
    """
    if res.is_success:
        return
    body = (res.text or "")[:2000]
    raise httpx.HTTPStatusError(
        f"supabase {res.status_code} {res.reason_phrase}: {body}",
        request=res.request,
        response=res,
    )


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------

async def _get(table: str, params: dict[str, str]) -> list[dict[str, Any]]:
    """SELECT rows matching params."""
    res = await _client.get(_url(table), headers=_SERVICE_HEADERS, params=params)
    _check(res)
    return res.json()


async def _insert_one(table: str, data: dict[str, Any]) -> dict[str, Any]:
    """INSERT one row, returning it."""
    res = await _client.post(_url(table), headers=_SERVICE_HEADERS, json=data)
    _check(res)
    return res.json()[0]


async def _bulk_insert(table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """INSERT multiple rows, returning them all."""
    res = await _client.post(_url(table), headers=_SERVICE_HEADERS, json=rows)
    _check(res)
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
    _check(res)
    return res.json()


async def _count_fast(table: str, params: dict[str, str]) -> int:
    """COUNT rows using HEAD + Prefer: count=exact (no row transfer).

    Uses PostgREST's count feature: the count is returned in the
    content-range header without transferring any row data.

    Args:
        table: Table name.
        params: PostgREST filter params.

    Returns:
        Integer count of matching rows.
    """
    res = await _client.head(
        _url(table),
        headers={**_SERVICE_HEADERS, "Prefer": "count=exact"},
        params={**params, "select": "id"},
    )
    _check(res)
    # content-range header: "0-N/total" or "*/total" if no rows
    content_range = res.headers.get("content-range", "*/0")
    return int(content_range.split("/")[-1])


async def _delete(table: str, params: dict[str, str]) -> None:
    """DELETE rows matching params."""
    res = await _client.delete(
        _url(table),
        headers={**_SERVICE_HEADERS, "Prefer": "return=minimal"},
        params=params,
    )
    _check(res)


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


async def update_streak(user_id: str) -> dict[str, Any]:
    """Update current_streak and longest_streak atomically via Postgres RPC.

    Delegates to update_streak_atomic() which does the read + conditional
    increment in a single transaction, preventing two concurrent completions
    from clobbering each other's streak. Also computes and persists the
    streak_multiplier.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Dict with new_streak, streak_multiplier, streak_milestone, streak_broken.
    """
    res = await _client.post(
        f"{settings.supabase_url}/rest/v1/rpc/update_streak_atomic",
        headers=_SERVICE_HEADERS,
        json={"p_user_id": user_id},
    )
    res.raise_for_status()
    result = res.json()
    if isinstance(result, dict):
        return result
    return {
        "new_streak": 0,
        "streak_multiplier": 1.0,
        "streak_milestone": None,
        "streak_broken": False,
    }


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

    Limits are dynamic based on hero level (via progression service).

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Dict with generations_used, generations_remaining, generations_limit,
        active_trees, active_tree_cap, and next_unlock_level.
    """
    from app.services.progression import get_generation_limit, get_active_tree_cap

    profile = await get_profile(user_id)
    hero_level = profile["hero_level"] if profile else 1

    gen_limit = get_generation_limit(hero_level)
    tree_cap = get_active_tree_cap(hero_level)

    daily_count = await get_daily_generation_count(user_id)
    active_count = await count_active_trees(user_id)

    # Find next level where either limit increases
    from app.services.progression import _load_config
    cfg = _load_config()
    next_unlock_level: int | None = None
    for level_str in sorted(cfg["generation_limits"], key=lambda x: int(x)):
        if int(level_str) > hero_level:
            next_unlock_level = int(level_str)
            break
    if next_unlock_level is None:
        for level_str in sorted(cfg["active_tree_cap"], key=lambda x: int(x)):
            if int(level_str) > hero_level:
                next_unlock_level = int(level_str)
                break

    return {
        "generations_used": daily_count,
        "generations_remaining": max(0, gen_limit - daily_count),
        "generations_limit": gen_limit,
        "active_trees": active_count,
        "active_tree_cap": tree_cap,
        "next_unlock_level": next_unlock_level,
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


async def get_public_tree_by_slug(slug: str) -> dict[str, Any] | None:
    """Fetch a public tree + its nodes by share_slug. No ownership check.

    Returns the tree dict (with ``nodes`` key) only when the row is
    ``is_public = true`` and not soft-deleted. ``user_id`` is stripped
    from the returned shape so the public route never leaks the owner's
    auth identity. ``hero_name`` is attached (best-effort) so the public
    view can render "by <hero_name>".

    Args:
        slug: The share slug.

    Returns:
        Tree dict with ``nodes`` and ``hero_name`` or None.
    """
    rows = await _get(
        "talent_trees",
        {
            "share_slug": f"eq.{slug}",
            "is_public": "eq.true",
            "deleted_at": "is.null",
            "select": "*",
        },
    )
    if not rows:
        return None
    tree = rows[0]
    owner_id = tree.get("user_id")
    nodes = await get_all_tree_nodes(tree["id"])
    hero_name: str | None = None
    if owner_id:
        owner = await get_profile(owner_id)
        if owner:
            hero_name = owner.get("hero_name")
    # Strip owner identity from the response shape — the public route
    # must not leak user_id to anonymous consumers.
    safe_tree = {k: v for k, v in tree.items() if k != "user_id"}
    return {**safe_tree, "nodes": nodes, "hero_name": hero_name}


async def share_tree(
    tree_id: str,
    user_id: str,
    slug: str,
) -> dict[str, Any] | None:
    """Stamp a slug on an owned tree and flip it public.

    Ownership is enforced by filtering on user_id + tree_id in the same
    PATCH so a non-owner's request no-ops (no row returned).

    Args:
        tree_id: Tree UUID.
        user_id: Authenticated user's UUID (must own tree).
        slug: Pre-generated share slug.

    Returns:
        Updated tree dict, or None if not owned / not found / deleted.
    """
    rows = await _patch(
        "talent_trees",
        {
            "id": f"eq.{tree_id}",
            "user_id": f"eq.{user_id}",
            "deleted_at": "is.null",
        },
        {
            "share_slug": slug,
            "is_public": True,
            "shared_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return rows[0] if rows else None


async def unshare_tree(tree_id: str, user_id: str) -> bool:
    """Flip a tree back to private. Keeps the slug (so re-publish is stable).

    Args:
        tree_id: Tree UUID.
        user_id: Authenticated user's UUID (must own tree).

    Returns:
        True if a row was updated, False otherwise.
    """
    rows = await _patch(
        "talent_trees",
        {
            "id": f"eq.{tree_id}",
            "user_id": f"eq.{user_id}",
            "deleted_at": "is.null",
        },
        {"is_public": False},
    )
    return bool(rows)


async def count_public_trees(user_id: str) -> int:
    """Count currently-public (non-deleted) trees owned by a user."""
    return await _count_fast(
        "talent_trees",
        {
            "user_id": f"eq.{user_id}",
            "is_public": "eq.true",
            "deleted_at": "is.null",
        },
    )


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
        ai_result: Dict from Gemini with title, description, and nodes[].

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


async def get_node_with_tree(
    node_id: str,
) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    """Fetch a node and its parent tree in ONE PostgREST round trip.

    Uses PostgREST's embedded-resource select (`*,talent_trees(*)`) so the
    node's tree comes back inline. Halves the RT count on the hot
    ``complete_node`` path; the ownership check still runs in the caller.

    Args:
        node_id: Node UUID.

    Returns:
        Tuple of ``(node, tree)``; either can be None if the node is
        missing or the tree has been soft-deleted.
    """
    rows = await _get(
        "skill_nodes",
        {"id": f"eq.{node_id}", "select": "*,talent_trees(*)"},
    )
    if not rows:
        return None, None
    node = dict(rows[0])
    tree = node.pop("talent_trees", None)
    # PostgREST returns an embedded dict (1:1 FK). Historic bug guard:
    # if the embedded resource is returned as a list under some configs,
    # peel the first element.
    if isinstance(tree, list):
        tree = tree[0] if tree else None
    return node, tree


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


# ---------------------------------------------------------------------------
# Dungeon Runs
# ---------------------------------------------------------------------------


async def create_dungeon_run(data: dict[str, Any]) -> dict[str, Any]:
    """Insert a new dungeon run row.

    Args:
        data: Run fields (user_id, tier, total_floors, duration_minutes, etc.).

    Returns:
        The created run dict.
    """
    return await _insert_one("dungeon_runs", data)


async def create_dungeon_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Bulk insert dungeon events for a run.

    Args:
        events: List of event dicts (each with run_id, floor_number, etc.).

    Returns:
        List of created event dicts.
    """
    return await _bulk_insert("dungeon_events", events)


async def create_dungeon_loot(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Bulk insert dungeon loot items for a run.

    Args:
        items: List of loot dicts (each with run_id, user_id, item_type, etc.).

    Returns:
        List of created loot dicts.
    """
    if not items:
        return []
    return await _bulk_insert("dungeon_loot", items)


async def get_active_dungeon_run(user_id: str) -> dict[str, Any] | None:
    """Fetch the user's current active dungeon run with events.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Run dict with 'events' key, or None if no active run.
    """
    rows = await _get(
        "dungeon_runs",
        {
            "user_id": f"eq.{user_id}",
            "status": "eq.active",
            "select": "*",
        },
    )
    if not rows:
        return None

    run = rows[0]
    events = await _get(
        "dungeon_events",
        {
            "run_id": f"eq.{run['id']}",
            "select": "*",
            "order": "sort_order.asc",
        },
    )
    return {**run, "events": events}


async def complete_dungeon_run(
    run_id: str,
    data: dict[str, Any],
) -> dict[str, Any]:
    """Update a dungeon run's status and completion fields.

    Args:
        run_id: Run UUID.
        data: Fields to update (status, cleared_floors, xp_earned, completed_at).

    Returns:
        Updated run dict.
    """
    rows = await _patch("dungeon_runs", {"id": f"eq.{run_id}"}, data)
    return rows[0]


async def get_dungeon_loot(run_id: str) -> list[dict[str, Any]]:
    """Fetch all loot items for a specific dungeon run.

    Args:
        run_id: Run UUID.

    Returns:
        List of loot dicts.
    """
    return await _get(
        "dungeon_loot",
        {"run_id": f"eq.{run_id}", "select": "*"},
    )


async def get_dungeon_history(user_id: str, limit: int = 10) -> list[dict[str, Any]]:
    """Fetch recent completed/retreated runs for a user.

    Args:
        user_id: Authenticated user's UUID.
        limit: Max rows to return.

    Returns:
        List of run dicts ordered by completed_at DESC.
    """
    return await _get(
        "dungeon_runs",
        {
            "user_id": f"eq.{user_id}",
            "status": f"in.(completed,retreated)",
            "select": "*",
            "order": "completed_at.desc",
            "limit": str(limit),
        },
    )


# ---------------------------------------------------------------------------
# Profile stats (aggregated counts for hero profile page)
# ---------------------------------------------------------------------------


async def get_profile_stats(user_id: str) -> dict[str, Any]:
    """Return aggregated hero stats for the profile page.

    Counts trees, nodes, dungeons, and loot across all time.
    Uses HEAD + Prefer: count=exact for all counts (no row transfer).

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Dict with trees_completed, trees_active, nodes_completed,
        dungeons_completed, total_dungeon_minutes, total_loot_collected.
    """
    import asyncio

    async def _sum_minutes() -> int:
        rows = await _get(
            "dungeon_runs",
            {
                "user_id": f"eq.{user_id}",
                "status": "in.(completed,retreated)",
                "select": "duration_minutes",
            },
        )
        return sum(r["duration_minutes"] for r in rows)

    async def _count_user_nodes_completed() -> int:
        """Count completed nodes across user's trees (2 queries, but fast)."""
        tree_rows = await _get(
            "talent_trees",
            {"user_id": f"eq.{user_id}", "deleted_at": "is.null", "select": "id"},
        )
        if not tree_rows:
            return 0
        tree_ids = ",".join(t["id"] for t in tree_rows)
        return await _count_fast(
            "skill_nodes",
            {"tree_id": f"in.({tree_ids})", "state": "eq.completed"},
        )

    (
        trees_completed,
        trees_active,
        nodes_completed,
        dungeons_completed,
        total_dungeon_minutes,
        total_loot,
    ) = await asyncio.gather(
        _count_fast("talent_trees", {"user_id": f"eq.{user_id}", "status": "eq.completed", "deleted_at": "is.null"}),
        _count_fast("talent_trees", {"user_id": f"eq.{user_id}", "status": "eq.active", "deleted_at": "is.null"}),
        _count_user_nodes_completed(),
        _count_fast("dungeon_runs", {"user_id": f"eq.{user_id}", "status": "eq.completed"}),
        _sum_minutes(),
        _count_fast("hero_inventory", {"user_id": f"eq.{user_id}"}),
    )

    return {
        "trees_completed": trees_completed,
        "trees_active": trees_active,
        "nodes_completed": nodes_completed,
        "dungeons_completed": dungeons_completed,
        "total_dungeon_minutes": total_dungeon_minutes,
        "total_loot_collected": total_loot,
    }


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------


async def get_leaderboard(
    metric: str = "total_xp",
    period: str = "weekly",
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Fetch the ranked leaderboard.

    Args:
        metric: Column to rank by — 'total_xp' or 'current_streak'.
        period: 'weekly' (weekly_xp) or 'all_time' (total_xp/current_streak).
        limit: Max rows to return.

    Returns:
        List of dicts with id, hero_name, display_name, hero_level, hero_title,
        score, and rank.
    """
    # Determine which column to sort by
    if metric == "current_streak":
        order_col = "current_streak"
    elif period == "weekly":
        order_col = "weekly_xp"
    else:
        order_col = "total_xp"

    # display_name comes from OAuth `full_name` — exposing it on the
    # leaderboard would leak real names (GDPR Art. 5 data minimisation).
    # Only the chosen hero_name is returned; users without one are rendered
    # as "Anonymous Wanderer" by the frontend.
    select = "id,hero_name,hero_level,hero_title,total_xp,weekly_xp,current_streak"
    rows = await _get(
        "profiles",
        {
            "select": select,
            "order": f"{order_col}.desc",
            "limit": str(limit),
        },
    )

    # Add rank and score
    result = []
    for i, row in enumerate(rows):
        result.append({
            **row,
            "rank": i + 1,
            "score": row.get(order_col, 0),
        })
    return result


async def get_leaderboard_rank(
    user_id: str,
    metric: str = "total_xp",
    period: str = "weekly",
) -> dict[str, Any]:
    """Fetch a user's rank and score.

    Args:
        user_id: Authenticated user's UUID.
        metric: Column to rank by.
        period: 'weekly' or 'all_time'.

    Returns:
        Dict with user's rank, score, and total participants.
    """
    import asyncio

    if metric == "current_streak":
        order_col = "current_streak"
    elif period == "weekly":
        order_col = "weekly_xp"
    else:
        order_col = "total_xp"

    # Get user's score first (needed for rank query)
    profile = await get_profile(user_id)
    if not profile:
        return {"rank": 0, "score": 0, "total_participants": 0}

    user_score = profile.get(order_col, 0)

    # Parallelize: count higher scores + count total participants
    higher_count, total = await asyncio.gather(
        _count_fast("profiles", {order_col: f"gt.{user_score}"}),
        _count_fast("profiles", {order_col: "gt.0"}),
    )

    return {
        "rank": higher_count + 1,
        "score": user_score,
        "total_participants": total,
        "hero_name": profile.get("hero_name"),
        "hero_level": profile.get("hero_level", 1),
        "hero_title": profile.get("hero_title", "Wanderer"),
    }


# ---------------------------------------------------------------------------
# Inventory & Achievements
# ---------------------------------------------------------------------------


async def get_user_achievement_keys(user_id: str) -> list[str]:
    """Return list of achievement keys already earned by the user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of achievement key strings.
    """
    rows = await _get(
        "hero_achievements",
        {"user_id": f"eq.{user_id}", "select": "achievement_key"},
    )
    return [r["achievement_key"] for r in rows]


async def get_user_achievements(user_id: str) -> list[dict[str, Any]]:
    """Return all achievement rows for a user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of achievement dicts.
    """
    return await _get(
        "hero_achievements",
        {"user_id": f"eq.{user_id}", "select": "*", "order": "unlocked_at.asc"},
    )


async def award_achievement(user_id: str, achievement_key: str) -> dict[str, Any]:
    """Insert an achievement row and increment the profile counter.

    Args:
        user_id: Authenticated user's UUID.
        achievement_key: The achievement identifier.

    Returns:
        The inserted achievement dict.
    """
    row = await _insert_one(
        "hero_achievements",
        {"user_id": user_id, "achievement_key": achievement_key},
    )
    # Increment the denormalized count
    profile = await get_profile(user_id)
    if profile:
        new_count = profile.get("achievements_count", 0) + 1
        await _patch(
            "profiles",
            {"id": f"eq.{user_id}"},
            {"achievements_count": new_count},
        )
    return row


async def get_user_inventory(
    user_id: str,
    used: bool | None = None,
) -> list[dict[str, Any]]:
    """Return inventory items for a user.

    Args:
        user_id: Authenticated user's UUID.
        used: Filter by used status. None returns all.

    Returns:
        List of inventory item dicts.
    """
    params: dict[str, str] = {
        "user_id": f"eq.{user_id}",
        "select": "*",
        "order": "created_at.desc",
    }
    if used is not None:
        params["used"] = f"eq.{str(used).lower()}"
    return await _get("hero_inventory", params)


async def get_user_inventory_count(user_id: str, used: bool = False) -> int:
    """Count inventory items for a user.

    Args:
        user_id: Authenticated user's UUID.
        used: Filter by used status.

    Returns:
        Integer count.
    """
    rows = await _get(
        "hero_inventory",
        {
            "user_id": f"eq.{user_id}",
            "used": f"eq.{str(used).lower()}",
            "select": "id",
        },
    )
    return len(rows)


async def count_completed_trees(user_id: str) -> int:
    """Count completed (non-deleted) trees for a user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Integer count.
    """
    rows = await _get(
        "talent_trees",
        {
            "user_id": f"eq.{user_id}",
            "status": "eq.completed",
            "deleted_at": "is.null",
            "select": "id",
        },
    )
    return len(rows)


async def count_completed_dungeons(user_id: str) -> int:
    """Count completed (not retreated) dungeon runs for a user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Integer count.
    """
    rows = await _get(
        "dungeon_runs",
        {
            "user_id": f"eq.{user_id}",
            "status": "eq.completed",
            "select": "id",
        },
    )
    return len(rows)


async def claim_dungeon_loot_rpc(user_id: str, run_id: str) -> int:
    """Claim unclaimed dungeon loot via RPC, moving items to hero_inventory.

    Args:
        user_id: Authenticated user's UUID.
        run_id: Dungeon run UUID.

    Returns:
        Number of items claimed.
    """
    res = await _client.post(
        f"{settings.supabase_url}/rest/v1/rpc/claim_dungeon_loot",
        headers=_SERVICE_HEADERS,
        json={"p_user_id": user_id, "p_run_id": run_id},
    )
    res.raise_for_status()
    result = res.json()
    return result if isinstance(result, int) else 0


async def use_inventory_item_rpc(user_id: str, item_id: str) -> dict[str, Any]:
    """Use an inventory item via RPC.

    Args:
        user_id: Authenticated user's UUID.
        item_id: Inventory item UUID.

    Returns:
        The used item dict.
    """
    res = await _client.post(
        f"{settings.supabase_url}/rest/v1/rpc/use_inventory_item",
        headers=_SERVICE_HEADERS,
        json={"p_user_id": user_id, "p_item_id": item_id},
    )
    res.raise_for_status()
    return res.json()


async def get_unclaimed_loot_runs(user_id: str) -> list[dict[str, Any]]:
    """Return dungeon runs that have unclaimed loot.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of run IDs with unclaimed loot.
    """
    rows = await _get(
        "dungeon_loot",
        {
            "user_id": f"eq.{user_id}",
            "claimed": "eq.false",
            "select": "run_id",
        },
    )
    # Deduplicate run IDs
    seen: set[str] = set()
    result = []
    for r in rows:
        if r["run_id"] not in seen:
            seen.add(r["run_id"])
            result.append({"run_id": r["run_id"]})
    return result


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


# ---------------------------------------------------------------------------
# Account deletion + export (GDPR Art. 17 + Art. 20)
# ---------------------------------------------------------------------------


async def delete_auth_user(user_id: str) -> None:
    """Delete an auth.users row via the Supabase Auth Admin API.

    Cascades to the public schema via FK ON DELETE CASCADE on
    profiles.id, talent_trees.user_id, embers.user_id, and the rest
    of the per-user tables defined across migrations.

    Args:
        user_id: Authenticated user's UUID.

    Raises:
        httpx.HTTPStatusError: if Supabase returns a non-2xx response.
    """
    res = await _client.delete(
        f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
        headers={
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
        },
    )
    _check(res)


async def build_user_export_bundle(user_id: str) -> dict[str, Any]:
    """Assemble a full JSON export of the user's data (GDPR Art. 20).

    Every list here is fetched via service-role so it bypasses RLS — the
    caller is responsible for verifying that the JWT's user_id matches the
    ``user_id`` argument. Nested tree nodes are inlined so the export is
    self-contained and reimportable in principle.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Plain dict serializable by ``json.dumps`` — profile + trees (with
        nodes) + embers + achievements + inventory + dungeon history (with
        events + loot) + daily activity.
    """
    import asyncio

    async def _trees_with_nodes() -> list[dict[str, Any]]:
        trees = await _get(
            "talent_trees",
            {"user_id": f"eq.{user_id}", "select": "*"},
        )
        if not trees:
            return []
        tree_ids = ",".join(t["id"] for t in trees)
        nodes = await _get(
            "skill_nodes",
            {"tree_id": f"in.({tree_ids})", "select": "*", "order": "sort_order.asc"},
        )
        by_tree: dict[str, list[dict[str, Any]]] = {}
        for n in nodes:
            by_tree.setdefault(n["tree_id"], []).append(n)
        return [{**t, "nodes": by_tree.get(t["id"], [])} for t in trees]

    async def _dungeon_runs_full() -> list[dict[str, Any]]:
        runs = await _get(
            "dungeon_runs",
            {"user_id": f"eq.{user_id}", "select": "*"},
        )
        if not runs:
            return []
        run_ids = ",".join(r["id"] for r in runs)
        events, loot = await asyncio.gather(
            _get("dungeon_events", {"run_id": f"in.({run_ids})", "select": "*"}),
            _get("dungeon_loot", {"run_id": f"in.({run_ids})", "select": "*"}),
        )
        events_by_run: dict[str, list[dict[str, Any]]] = {}
        loot_by_run: dict[str, list[dict[str, Any]]] = {}
        for e in events:
            events_by_run.setdefault(e["run_id"], []).append(e)
        for item in loot:
            loot_by_run.setdefault(item["run_id"], []).append(item)
        return [
            {
                **r,
                "events": events_by_run.get(r["id"], []),
                "loot": loot_by_run.get(r["id"], []),
            }
            for r in runs
        ]

    (
        profile,
        trees,
        embers,
        achievements,
        inventory,
        dungeon_runs,
        daily_activity,
    ) = await asyncio.gather(
        get_profile(user_id),
        _trees_with_nodes(),
        list_embers(user_id),
        get_user_achievements(user_id),
        get_user_inventory(user_id),
        _dungeon_runs_full(),
        _get("daily_activity", {"user_id": f"eq.{user_id}", "select": "*"}),
    )

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "profile": profile,
        "trees": trees,
        "embers": embers,
        "achievements": achievements,
        "inventory": inventory,
        "dungeon_runs": dungeon_runs,
        "daily_activity": daily_activity,
    }
