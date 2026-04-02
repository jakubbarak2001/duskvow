"""Ember API routes — list, create, and delete personal victory records."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core import supabase as supa
from app.core.dependencies import get_current_user_id
from app.schemas.embers import EmberCreate, EmberResponse

router = APIRouter()


@router.get("", response_model=dict)
async def list_embers(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Return all embers for the authenticated user, ordered by created_at DESC.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of ember objects.
    """
    embers = await supa.list_embers(user_id)
    return {"data": embers, "error": None}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_ember(
    body: EmberCreate,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Create a new ember for the authenticated user.

    Enforces a cap of 50 embers per user.

    Args:
        body: Ember title and optional description.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with the created ember object.

    Raises:
        HTTPException: 400 if the user has reached the 50-ember cap.
    """
    count = await supa.count_embers(user_id)
    if count >= supa.EMBER_CAP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ember cap reached ({supa.EMBER_CAP}). Remove an existing ember before adding a new one.",
        )

    ember = await supa.create_ember(user_id, body.title, body.description)
    return {"data": ember, "error": None}


@router.delete("/{ember_id}", response_model=dict)
async def delete_ember(
    ember_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Delete an ember belonging to the authenticated user.

    Args:
        ember_id: UUID of the ember to delete.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope confirming deletion.

    Raises:
        HTTPException: 404 if ember not found or not owned by the user.
    """
    deleted = await supa.delete_ember(ember_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ember not found",
        )
    return {"data": {"deleted": True}, "error": None}
