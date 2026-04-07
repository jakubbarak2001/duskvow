"""Shared fixtures for backend tests."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.v1 import trees as trees_module
from app.core.dependencies import get_current_user_id
from app.main import app
from tests.helpers import TEST_USER_ID


@pytest.fixture
async def client():
    """Async test client with auth dependency overridden to TEST_USER_ID."""
    app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def unauthed_client():
    """Async test client with no auth override — real dependency runs."""
    app.dependency_overrides.clear()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
def clear_sessions():
    """Clear the in-memory session store before and after every test."""
    trees_module._sessions.clear()
    yield
    trees_module._sessions.clear()
