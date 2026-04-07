"""Shared test factories and constants used across test modules."""

import time

from app.api.v1 import trees as trees_module

TEST_USER_ID = "00000000-0000-0000-0000-000000000001"
OTHER_USER_ID = "00000000-0000-0000-0000-000000000002"


def make_tree(
    *,
    id: str = "tree-1",
    user_id: str = TEST_USER_ID,
    status: str = "active",
    total_nodes: int = 3,
    completed_nodes: int = 0,
    total_xp: int = 30,
    earned_xp: int = 0,
    **kw,
) -> dict:
    return {
        "id": id,
        "user_id": user_id,
        "title": "Test Tree",
        "description": "A test tree",
        "goal_prompt": "Learn Python",
        "status": status,
        "total_nodes": total_nodes,
        "completed_nodes": completed_nodes,
        "total_xp": total_xp,
        "earned_xp": earned_xp,
        "deleted_at": None,
        "created_at": "2026-04-07T00:00:00Z",
        "updated_at": "2026-04-07T00:00:00Z",
        **kw,
    }


def make_node(
    *,
    id: str = "node-1",
    tree_id: str = "tree-1",
    state: str = "available",
    prerequisites: list | None = None,
    xp_reward: int = 10,
    title: str = "Test Node",
    **kw,
) -> dict:
    return {
        "id": id,
        "tree_id": tree_id,
        "title": title,
        "description": "A test node",
        "node_type": "action",
        "tier": "common",
        "state": state,
        "position_x": 0.0,
        "position_y": 0.0,
        "prerequisites": prerequisites if prerequisites is not None else [],
        "is_optional": False,
        "xp_reward": xp_reward,
        "estimated_time": None,
        "sort_order": 0,
        "completed_at": None,
        **kw,
    }


def make_profile(*, user_id: str = TEST_USER_ID, **kw) -> dict:
    return {
        "id": user_id,
        "total_xp": 100,
        "current_streak": 3,
        "longest_streak": 7,
        **kw,
    }


def make_ember(
    *,
    id: str = "ember-1",
    user_id: str = TEST_USER_ID,
    title: str = "Won something",
    **kw,
) -> dict:
    return {
        "id": id,
        "user_id": user_id,
        "title": title,
        "description": None,
        "created_at": "2026-04-07T00:00:00Z",
        **kw,
    }


def inject_session(
    session_id: str,
    user_id: str = TEST_USER_ID,
    goal: str = "Learn Python",
) -> None:
    """Insert a ready-to-use generation session into the in-memory store."""
    trees_module._sessions[session_id] = {
        "user_id": user_id,
        "goal_prompt": goal,
        "created_at": time.time(),
    }
