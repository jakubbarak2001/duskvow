"""Supabase JWT verification via the Auth API."""

import httpx
from fastapi import HTTPException, status

from app.core.config import settings


async def verify_supabase_jwt(token: str) -> str:
    """Verify a Supabase JWT by calling the Auth API, returning the user's UUID.

    Args:
        token: Raw JWT string from the Authorization header.

    Returns:
        The authenticated user's UUID string.

    Raises:
        HTTPException: 401 if the token is invalid or expired.
    """
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.supabase_service_role_key,
            },
        )

    if res.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    data = res.json()
    user_id: str | None = data.get("id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
