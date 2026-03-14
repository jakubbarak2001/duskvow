"""Supabase JWT verification utilities."""

import jwt
from fastapi import HTTPException, status

from app.core.config import settings


def verify_supabase_jwt(token: str) -> str:
    """Decode and verify a Supabase-issued JWT, returning the user's UUID.

    Supabase JWTs are HS256-signed with the project JWT secret.
    The ``sub`` claim contains the authenticated user's UUID.

    Args:
        token: Raw JWT string from the Authorization header.

    Returns:
        The authenticated user's UUID string.

    Raises:
        HTTPException: 401 if the token is expired, malformed, or invalid.
    """
    try:
        payload: dict = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            # Skip audience verification — Supabase sets aud="authenticated"
            # but we validate role manually below.
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str | None = payload.get("sub")
    role: str | None = payload.get("role")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if role != "authenticated":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not an authenticated user token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
