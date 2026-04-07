"""Tests for authentication — missing and invalid tokens."""

from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException


async def test_missing_auth_header_returns_401(unauthed_client):
    """FastAPI's HTTPBearer returns 401 when no Authorization header is present."""
    res = await unauthed_client.get("/api/v1/profile")

    assert res.status_code == 401


async def test_invalid_token_returns_401(unauthed_client, monkeypatch):
    """A well-formed but invalid Bearer token is rejected with 401."""
    monkeypatch.setattr(
        "app.core.auth.verify_supabase_jwt",
        AsyncMock(
            side_effect=HTTPException(status_code=401, detail="Invalid or expired token")
        ),
    )

    res = await unauthed_client.get(
        "/api/v1/profile", headers={"Authorization": "Bearer bad-token"}
    )

    assert res.status_code == 401
