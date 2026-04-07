"""Tests for tree generation, session management, CRUD, and rate limits."""

from unittest.mock import AsyncMock

import pytest

from app.services.gemini import gemini_service
from tests.helpers import OTHER_USER_ID, TEST_USER_ID, inject_session, make_node, make_tree

_AI_QUESTIONS = {
    "questions": [
        {"id": "q1", "text": "How often?", "options": ["Daily", "Weekly"]},
    ]
}

_AI_TREE = {
    "title": "Python Mastery",
    "description": "Learn Python from scratch",
    "nodes": [
        {
            "id": "node_1",
            "title": "Hello World",
            "description": "First program",
            "type": "action",
            "tier": "common",
            "prerequisites": [],
            "optional": False,
            "xp_reward": 10,
            "estimated_time": "1 hour",
            "position": {"x": 0, "y": 0},
        }
    ],
    "edges": [],
}


# ---------------------------------------------------------------------------
# POST /generate
# ---------------------------------------------------------------------------


async def test_generate_returns_session_and_questions(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.count_active_trees", AsyncMock(return_value=0))
    monkeypatch.setattr("app.core.supabase.get_daily_generation_count", AsyncMock(return_value=0))
    monkeypatch.setattr(
        gemini_service, "generate_followup_questions", AsyncMock(return_value=_AI_QUESTIONS)
    )

    res = await client.post("/api/v1/trees/generate", json={"goal_prompt": "Learn Python fast"})

    assert res.status_code == 200
    data = res.json()["data"]
    assert "session_id" in data
    assert len(data["questions"]) == 1


async def test_generate_blocked_by_active_tree_cap(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.count_active_trees", AsyncMock(return_value=5))

    res = await client.post("/api/v1/trees/generate", json={"goal_prompt": "Learn Python fast"})

    assert res.status_code == 429
    assert "5 active trees" in res.json()["detail"]


async def test_generate_blocked_by_daily_limit(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.count_active_trees", AsyncMock(return_value=0))
    monkeypatch.setattr("app.core.supabase.get_daily_generation_count", AsyncMock(return_value=3))

    res = await client.post("/api/v1/trees/generate", json={"goal_prompt": "Learn Python fast"})

    assert res.status_code == 429
    assert "daily generations" in res.json()["detail"]


# ---------------------------------------------------------------------------
# POST /followup
# ---------------------------------------------------------------------------


async def test_followup_creates_tree(client, monkeypatch):
    inject_session("sess-abc")

    saved_tree = {**make_tree(id="tree-new"), "nodes": [make_node(tree_id="tree-new")]}
    monkeypatch.setattr(
        gemini_service, "generate_tree", AsyncMock(return_value=_AI_TREE)
    )
    monkeypatch.setattr(
        "app.core.supabase.save_generated_tree", AsyncMock(return_value=saved_tree)
    )
    monkeypatch.setattr(
        "app.core.supabase.increment_daily_generation", AsyncMock(return_value=1)
    )

    res = await client.post(
        "/api/v1/trees/followup",
        json={"session_id": "sess-abc", "answers": {"q1": "Daily"}},
    )

    assert res.status_code == 200
    data = res.json()["data"]
    assert data["tree"]["id"] == "tree-new"
    assert data["generations_remaining"] == 2
    assert data["generations_used"] == 1


async def test_followup_invalid_session_returns_400(client):
    res = await client.post(
        "/api/v1/trees/followup",
        json={"session_id": "nonexistent", "answers": {}},
    )

    assert res.status_code == 400
    assert "Session" in res.json()["detail"]


async def test_followup_wrong_user_returns_403(client):
    inject_session("sess-xyz", user_id=OTHER_USER_ID)

    res = await client.post(
        "/api/v1/trees/followup",
        json={"session_id": "sess-xyz", "answers": {}},
    )

    assert res.status_code == 403


async def test_followup_consumes_session(client, monkeypatch):
    """A session can only be used once — second call returns 400."""
    inject_session("sess-once")

    saved_tree = {**make_tree(), "nodes": []}
    monkeypatch.setattr(gemini_service, "generate_tree", AsyncMock(return_value=_AI_TREE))
    monkeypatch.setattr(
        "app.core.supabase.save_generated_tree", AsyncMock(return_value=saved_tree)
    )
    monkeypatch.setattr(
        "app.core.supabase.increment_daily_generation", AsyncMock(return_value=1)
    )

    first = await client.post(
        "/api/v1/trees/followup",
        json={"session_id": "sess-once", "answers": {}},
    )
    second = await client.post(
        "/api/v1/trees/followup",
        json={"session_id": "sess-once", "answers": {}},
    )

    assert first.status_code == 200
    assert second.status_code == 400


# ---------------------------------------------------------------------------
# GET /trees
# ---------------------------------------------------------------------------


async def test_list_trees_returns_user_trees(client, monkeypatch):
    trees = [make_tree(id="t1"), make_tree(id="t2")]
    monkeypatch.setattr("app.core.supabase.list_trees", AsyncMock(return_value=trees))

    res = await client.get("/api/v1/trees")

    assert res.status_code == 200
    assert len(res.json()["data"]) == 2


# ---------------------------------------------------------------------------
# GET /trees/generation-status
# ---------------------------------------------------------------------------


async def test_generation_status(client, monkeypatch):
    status_data = {
        "generations_used": 1,
        "generations_remaining": 2,
        "generations_limit": 3,
        "active_trees": 2,
        "active_tree_cap": 5,
    }
    monkeypatch.setattr(
        "app.core.supabase.get_generation_status", AsyncMock(return_value=status_data)
    )

    res = await client.get("/api/v1/trees/generation-status")

    assert res.status_code == 200
    assert res.json()["data"] == status_data


# ---------------------------------------------------------------------------
# GET /trees/{tree_id}
# ---------------------------------------------------------------------------


async def test_get_tree_with_nodes(client, monkeypatch):
    tree = {**make_tree(id="tree-1"), "nodes": [make_node()]}
    monkeypatch.setattr("app.core.supabase.get_tree_with_nodes", AsyncMock(return_value=tree))

    res = await client.get("/api/v1/trees/tree-1")

    assert res.status_code == 200
    assert res.json()["data"]["id"] == "tree-1"
    assert len(res.json()["data"]["nodes"]) == 1


async def test_get_tree_not_found(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.get_tree_with_nodes", AsyncMock(return_value=None))

    res = await client.get("/api/v1/trees/no-such-tree")

    assert res.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /trees/{tree_id}
# ---------------------------------------------------------------------------


async def test_delete_tree_soft_deletes(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.delete_tree", AsyncMock(return_value=True))

    res = await client.delete("/api/v1/trees/tree-1")

    assert res.status_code == 200
    assert res.json()["data"]["deleted"] is True


async def test_delete_tree_not_found(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.delete_tree", AsyncMock(return_value=False))

    res = await client.delete("/api/v1/trees/no-such-tree")

    assert res.status_code == 404
