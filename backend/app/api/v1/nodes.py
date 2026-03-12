"""Node API routes — manage skill node states."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id

router = APIRouter()


@router.patch("/{node_id}/complete", response_model=dict)
async def complete_node(
    node_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Mark a skill node as completed and award XP.

    Args:
        node_id: UUID of the node to complete.
        user_id: Authenticated user's UUID.

    Returns:
        XP earned from completing the node.
    """
    # TODO (Task 7): Validate prerequisites, update state, award XP
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.patch("/{node_id}/start", response_model=dict)
async def start_node(
    node_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Mark a skill node as in_progress.

    Args:
        node_id: UUID of the node to start.
        user_id: Authenticated user's UUID.
    """
    # TODO (Task 7): Validate node is available, update state
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.patch("/{node_id}/reset", response_model=dict)
async def reset_node(
    node_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Reset a skill node back to available state.

    Args:
        node_id: UUID of the node to reset.
        user_id: Authenticated user's UUID.
    """
    # TODO (Task 7): Reset state, remove XP
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
