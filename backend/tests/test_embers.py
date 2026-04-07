"""Tests for ember CRUD endpoints."""

from unittest.mock import AsyncMock

import pytest

from tests.helpers import OTHER_USER_ID, TEST_USER_ID, make_ember


async def test_list_embers(client, monkeypatch):
    embers = [make_ember(id="e1"), make_ember(id="e2")]
    monkeypatch.setattr("app.core.supabase.list_embers", AsyncMock(return_value=embers))

    res = await client.get("/api/v1/embers")

    assert res.status_code == 200
    assert len(res.json()["data"]) == 2


async def test_create_ember_success(client, monkeypatch):
    ember = make_ember(title="Beat the boss")
    monkeypatch.setattr("app.core.supabase.count_embers", AsyncMock(return_value=0))
    monkeypatch.setattr("app.core.supabase.create_ember", AsyncMock(return_value=ember))

    res = await client.post("/api/v1/embers", json={"title": "Beat the boss"})

    assert res.status_code == 201
    assert res.json()["data"]["title"] == "Beat the boss"


async def test_create_ember_at_cap_returns_400(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.count_embers", AsyncMock(return_value=50))

    res = await client.post("/api/v1/embers", json={"title": "One more"})

    assert res.status_code == 400
    assert "cap" in res.json()["detail"].lower()


async def test_delete_ember_success(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.delete_ember", AsyncMock(return_value=True))

    res = await client.delete("/api/v1/embers/ember-1")

    assert res.status_code == 200
    assert res.json()["data"]["deleted"] is True


async def test_delete_ember_wrong_owner_returns_404(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.delete_ember", AsyncMock(return_value=False))

    res = await client.delete("/api/v1/embers/ember-other")

    assert res.status_code == 404
