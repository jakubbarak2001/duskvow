"""Profile API routes."""

import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.dependencies import get_current_user_id
from app.core import supabase as supa
from app.schemas.profile import DeleteAccountRequest, ProfileUpdateRequest
from app.services.progression import get_all_unlocks_for_display

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=dict)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Get the authenticated user's profile and stats.

    Args:
        user_id: Authenticated user's UUID, injected by the auth dependency.

    Returns:
        Envelope with user profile data including XP and streak stats.

    Raises:
        HTTPException: 404 if no profile row exists for this user.
    """
    profile = await supa.get_profile(user_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found — the auth trigger may not have fired yet.",
        )

    return {"data": profile, "error": None}


@router.patch("", response_model=dict)
async def update_profile(
    body: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Update the authenticated user's hero name.

    Args:
        body: Request body containing hero_name.
        user_id: Authenticated user's UUID, injected by the auth dependency.

    Returns:
        Envelope with the updated profile.
    """
    profile = await supa.upsert_profile(user_id, {"hero_name": body.hero_name})
    return {"data": profile, "error": None}


@router.get("/unlocks", response_model=dict)
async def get_unlocks(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return all level unlocks with current status for the authenticated user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with list of unlock objects.
    """
    profile = await supa.get_profile(user_id)
    hero_level = profile["hero_level"] if profile else 1
    unlocks = get_all_unlocks_for_display(hero_level)
    return {"data": unlocks, "error": None}


@router.get("/stats", response_model=dict)
async def get_stats(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return aggregated hero stats for the profile page.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with stats dict.
    """
    stats = await supa.get_profile_stats(user_id)
    return {"data": stats, "error": None}


@router.delete("/me", response_model=dict)
async def delete_account(
    body: DeleteAccountRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Permanently delete the authenticated user and all their data.

    Requires a confirmation phrase in the body so accidental calls fail at
    the schema layer instead of wiping the account. On success, all rows
    in the public schema are removed via FK CASCADE from auth.users.

    Args:
        body: Request body with ``confirm: "DELETE MY VOW"``.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope confirming deletion.
    """
    # Log (without PII) before the user record is gone so support can
    # reconstruct the request trail if needed.
    logger.info("account_deletion_requested", extra={"user_id_hash": hash(user_id)})
    await supa.delete_auth_user(user_id)
    return {"data": {"deleted": True}, "error": None}


@router.get("/me/export")
async def export_account_data(
    user_id: str = Depends(get_current_user_id),
) -> Response:
    """Return a full JSON export of the authenticated user's data.

    GDPR Art. 20 (data portability). The response is a single JSON
    document containing profile, trees (with nodes), embers,
    achievements, inventory, dungeon history, and daily activity. It is
    returned as ``application/json`` with a ``Content-Disposition``
    attachment header so browsers save it as a file.
    """
    bundle = await supa.build_user_export_bundle(user_id)

    # json.dumps handles datetime fields fine because supa returns ISO
    # strings from PostgREST already. default=str is a belt-and-suspenders
    # fallback for any unexpected non-serializable leaf (e.g. UUID objects).
    body = json.dumps(bundle, indent=2, default=str)

    filename = f"duskvow-export-{user_id}.json"
    return Response(
        content=body,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
