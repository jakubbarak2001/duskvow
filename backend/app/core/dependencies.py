"""FastAPI dependency injection helpers."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Extract and validate the Supabase JWT, returning the user's UUID.

    Args:
        credentials: Bearer token from Authorization header.

    Returns:
        The authenticated user's UUID string.

    Raises:
        HTTPException: 401 if token is invalid or missing.
    """
    # TODO (Task 2): Verify JWT against Supabase JWT secret
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )
    # Placeholder — real verification in Task 2
    return "placeholder-user-id"
