"""Tests for node state transitions — completion, prerequisite cascades, XP."""

from unittest.mock import AsyncMock, call

import pytest

from tests.helpers import OTHER_USER_ID, TEST_USER_ID, make_node, make_tree


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _patch_ownership(monkeypatch, node, tree):
    monkeypatch.setattr("app.core.supabase.get_node", AsyncMock(return_value=node))
    monkeypatch.setattr("app.core.supabase.get_tree_by_id", AsyncMock(return_value=tree))


def _patch_side_effects(monkeypatch):
    """Patch all write-side supabase calls with no-op mocks."""
    monkeypatch.setattr("app.core.supabase.update_node", AsyncMock(return_value={}))
    monkeypatch.setattr("app.core.supabase.batch_update_nodes_state", AsyncMock())
    monkeypatch.setattr("app.core.supabase.update_tree_progress", AsyncMock())
    monkeypatch.setattr("app.core.supabase.add_xp_to_profile", AsyncMock(return_value=110))
    monkeypatch.setattr("app.core.supabase.record_daily_activity", AsyncMock())
    monkeypatch.setattr("app.core.supabase.update_streak", AsyncMock())


# ---------------------------------------------------------------------------
# complete_node
# ---------------------------------------------------------------------------


async def test_complete_node_success(client, monkeypatch):
    node = make_node(id="node-1", tree_id="tree-1", state="available", xp_reward=10)
    tree = make_tree(id="tree-1", total_nodes=1)
    completed_node = {**node, "state": "completed"}

    _patch_ownership(monkeypatch, node, tree)
    monkeypatch.setattr(
        "app.core.supabase.get_all_tree_nodes",
        AsyncMock(side_effect=[[node], [completed_node]]),
    )
    _patch_side_effects(monkeypatch)

    res = await client.patch("/api/v1/nodes/node-1/complete")

    assert res.status_code == 200
    data = res.json()["data"]
    assert data["node_id"] == "node-1"
    assert data["new_state"] == "completed"
    assert data["xp_earned"] == 10
    assert data["total_xp"] == 110


async def test_complete_node_unlocks_dependents(client, monkeypatch):
    """Completing a node should make its locked children available if all their prereqs are now met."""
    node_a = make_node(id="node-a", tree_id="tree-1", state="available")
    node_b = make_node(id="node-b", tree_id="tree-1", state="locked", prerequisites=["node-a"])
    tree = make_tree(id="tree-1", total_nodes=2)
    completed_a = {**node_a, "state": "completed"}

    _patch_ownership(monkeypatch, node_a, tree)
    monkeypatch.setattr(
        "app.core.supabase.get_all_tree_nodes",
        AsyncMock(side_effect=[[node_a, node_b], [completed_a, node_b]]),
    )
    mock_batch = AsyncMock()
    monkeypatch.setattr("app.core.supabase.batch_update_nodes_state", mock_batch)
    monkeypatch.setattr("app.core.supabase.update_node", AsyncMock(return_value={}))
    monkeypatch.setattr("app.core.supabase.update_tree_progress", AsyncMock())
    monkeypatch.setattr("app.core.supabase.add_xp_to_profile", AsyncMock(return_value=10))
    monkeypatch.setattr("app.core.supabase.record_daily_activity", AsyncMock())
    monkeypatch.setattr("app.core.supabase.update_streak", AsyncMock())

    res = await client.patch("/api/v1/nodes/node-a/complete")

    assert res.status_code == 200
    mock_batch.assert_called_once_with(["node-b"], "available")


async def test_complete_node_partial_prereqs_stay_locked(client, monkeypatch):
    """A child with two prerequisites stays locked if only one is completed."""
    node_a = make_node(id="node-a", tree_id="tree-1", state="available")
    node_b = make_node(id="node-b", tree_id="tree-1", state="available")
    node_c = make_node(
        id="node-c", tree_id="tree-1", state="locked", prerequisites=["node-a", "node-b"]
    )
    tree = make_tree(id="tree-1", total_nodes=3)
    completed_a = {**node_a, "state": "completed"}

    _patch_ownership(monkeypatch, node_a, tree)
    monkeypatch.setattr(
        "app.core.supabase.get_all_tree_nodes",
        AsyncMock(side_effect=[[node_a, node_b, node_c], [completed_a, node_b, node_c]]),
    )
    mock_batch = AsyncMock()
    monkeypatch.setattr("app.core.supabase.batch_update_nodes_state", mock_batch)
    monkeypatch.setattr("app.core.supabase.update_node", AsyncMock(return_value={}))
    monkeypatch.setattr("app.core.supabase.update_tree_progress", AsyncMock())
    monkeypatch.setattr("app.core.supabase.add_xp_to_profile", AsyncMock(return_value=10))
    monkeypatch.setattr("app.core.supabase.record_daily_activity", AsyncMock())
    monkeypatch.setattr("app.core.supabase.update_streak", AsyncMock())

    res = await client.patch("/api/v1/nodes/node-a/complete")

    assert res.status_code == 200
    # node-c should NOT be in the unlock list
    mock_batch.assert_called_once_with([], "available")


async def test_complete_already_completed_returns_400(client, monkeypatch):
    node = make_node(state="completed")
    tree = make_tree()

    _patch_ownership(monkeypatch, node, tree)

    res = await client.patch("/api/v1/nodes/node-1/complete")

    assert res.status_code == 400
    assert "already completed" in res.json()["detail"]


async def test_complete_node_on_completed_tree_returns_400(client, monkeypatch):
    node = make_node(state="available")
    tree = make_tree(status="completed")

    _patch_ownership(monkeypatch, node, tree)

    res = await client.patch("/api/v1/nodes/node-1/complete")

    assert res.status_code == 400
    assert "finished" in res.json()["detail"]


async def test_complete_with_unmet_prereqs_returns_400(client, monkeypatch):
    prereq = make_node(id="prereq-node", tree_id="tree-1", state="available")
    node = make_node(id="node-1", tree_id="tree-1", state="available", prerequisites=["prereq-node"])
    tree = make_tree()

    _patch_ownership(monkeypatch, node, tree)
    monkeypatch.setattr(
        "app.core.supabase.get_all_tree_nodes",
        AsyncMock(return_value=[prereq, node]),
    )

    res = await client.patch("/api/v1/nodes/node-1/complete")

    assert res.status_code == 400
    assert "Prerequisite" in res.json()["detail"]


async def test_complete_node_tree_becomes_completed(client, monkeypatch):
    """Completing the last node should flip tree status to 'completed'."""
    node_a = make_node(id="node-a", tree_id="tree-1", state="completed", xp_reward=10)
    node_b = make_node(id="node-b", tree_id="tree-1", state="available", xp_reward=20)
    tree = make_tree(id="tree-1", total_nodes=2, completed_nodes=1)
    completed_b = {**node_b, "state": "completed"}

    _patch_ownership(monkeypatch, node_b, tree)
    monkeypatch.setattr(
        "app.core.supabase.get_all_tree_nodes",
        AsyncMock(side_effect=[[node_a, node_b], [node_a, completed_b]]),
    )
    mock_progress = AsyncMock()
    monkeypatch.setattr("app.core.supabase.update_tree_progress", mock_progress)
    monkeypatch.setattr("app.core.supabase.update_node", AsyncMock(return_value={}))
    monkeypatch.setattr("app.core.supabase.batch_update_nodes_state", AsyncMock())
    monkeypatch.setattr("app.core.supabase.add_xp_to_profile", AsyncMock(return_value=30))
    monkeypatch.setattr("app.core.supabase.record_daily_activity", AsyncMock())
    monkeypatch.setattr("app.core.supabase.update_streak", AsyncMock())

    res = await client.patch("/api/v1/nodes/node-b/complete")

    assert res.status_code == 200
    # completed_count=2, earned_xp=30, new_status="completed"
    mock_progress.assert_called_once_with("tree-1", 2, 30, "completed")


# ---------------------------------------------------------------------------
# start_node
# ---------------------------------------------------------------------------


async def test_start_node_success(client, monkeypatch):
    node = make_node(state="available")
    tree = make_tree()

    _patch_ownership(monkeypatch, node, tree)
    monkeypatch.setattr("app.core.supabase.update_node", AsyncMock(return_value={}))

    res = await client.patch("/api/v1/nodes/node-1/start")

    assert res.status_code == 200
    assert res.json()["data"]["new_state"] == "in_progress"


async def test_start_locked_node_returns_400(client, monkeypatch):
    node = make_node(state="locked")
    tree = make_tree()

    _patch_ownership(monkeypatch, node, tree)

    res = await client.patch("/api/v1/nodes/node-1/start")

    assert res.status_code == 400
    assert "locked" in res.json()["detail"]


# ---------------------------------------------------------------------------
# Ownership / not-found
# ---------------------------------------------------------------------------


async def test_node_not_found_returns_404(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.get_node", AsyncMock(return_value=None))

    res = await client.patch("/api/v1/nodes/nonexistent/complete")

    assert res.status_code == 404


async def test_node_wrong_owner_returns_404(client, monkeypatch):
    """A node whose parent tree belongs to another user should return 404."""
    node = make_node(id="node-1", tree_id="tree-1")
    tree = make_tree(id="tree-1", user_id=OTHER_USER_ID)  # different owner

    _patch_ownership(monkeypatch, node, tree)

    res = await client.patch("/api/v1/nodes/node-1/complete")

    assert res.status_code == 404
