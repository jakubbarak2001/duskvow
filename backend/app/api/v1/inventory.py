"""Inventory API routes — view items, claim loot, use consumables."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core import supabase as supa
from app.core.dependencies import get_current_user_id
from app.services.achievements import check_and_award

router = APIRouter()


@router.get("", response_model=dict)
async def list_inventory(
    user_id: str = Depends(get_current_user_id),
    used: bool | None = Query(None, description="Filter by used status"),
) -> dict[str, Any]:
    """Return the user's inventory items.

    Args:
        user_id: Authenticated user's UUID.
        used: Optional filter. None returns all, False returns active, True returns used.

    Returns:
        Envelope with list of inventory items.
    """
    items = await supa.get_user_inventory(user_id, used=used)
    return {"data": items, "error": None}


@router.get("/count", response_model=dict)
async def inventory_count(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return count of unused inventory items.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with count.
    """
    count = await supa.get_user_inventory_count(user_id, used=False)
    return {"data": {"count": count}, "error": None}


@router.get("/unclaimed", response_model=dict)
async def unclaimed_loot_count(
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Return the number of dungeon runs with unclaimed loot.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with count of runs that have unclaimed loot.
    """
    runs = await supa.get_unclaimed_loot_runs(user_id)
    return {"data": {"count": len(runs)}, "error": None}


@router.post("/claim/{run_id}", response_model=dict)
async def claim_loot(
    run_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Claim unclaimed loot from a dungeon run into the hero's inventory.

    Args:
        run_id: Dungeon run UUID.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with claimed_count, items, and any new achievements.
    """
    try:
        claimed_count = await supa.claim_dungeon_loot_rpc(user_id, run_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not claim loot. Run may not exist or loot already claimed.",
        )

    # Fetch the newly added inventory items for the response
    items = await supa.get_user_inventory(user_id, used=False)

    # Check loot-related achievements
    total_count = await supa.get_user_inventory_count(user_id)
    new_achievements = await check_and_award(
        user_id, "loot_claimed", {"total_count": total_count}
    )

    return {
        "data": {
            "claimed_count": claimed_count,
            "items": items,
            "new_achievements": new_achievements,
        },
        "error": None,
    }


@router.post("/{item_id}/use", response_model=dict)
async def use_item(
    item_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, Any]:
    """Use (consume) an inventory item.

    Args:
        item_id: Inventory item UUID.
        user_id: Authenticated user's UUID.

    Returns:
        Envelope with the used item.
    """
    try:
        item = await supa.use_inventory_item_rpc(user_id, item_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item not found, already used, or does not belong to you.",
        )

    return {"data": item, "error": None}
