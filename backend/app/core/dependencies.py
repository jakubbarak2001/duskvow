"""FastAPI dependency injection helpers."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import verify_supabase_jwt

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Extract and verify the Supabase JWT, returning the user's UUID.

    Args:
        credentials: Bearer token from Authorization header.

    Returns:
        The authenticated user's UUID string.

    Raises:
        HTTPException: 401 if token is invalid, expired, or missing.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_supabase_jwt(token)
