"""Tests for the profile endpoint."""

from unittest.mock import AsyncMock

import pytest

from tests.helpers import TEST_USER_ID, make_profile


async def test_get_profile_success(client, monkeypatch):
    profile = make_profile()
    monkeypatch.setattr("app.core.supabase.get_profile", AsyncMock(return_value=profile))

    res = await client.get("/api/v1/profile")

    assert res.status_code == 200
    assert res.json()["data"]["id"] == TEST_USER_ID
    assert res.json()["data"]["total_xp"] == 100


async def test_get_profile_not_found_returns_404(client, monkeypatch):
    monkeypatch.setattr("app.core.supabase.get_profile", AsyncMock(return_value=None))

    res = await client.get("/api/v1/profile")

    assert res.status_code == 404
