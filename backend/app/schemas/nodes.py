"""Pydantic schemas for node API responses."""

from pydantic import BaseModel


class NodeCompleteResponse(BaseModel):
    """Response from PATCH /api/v1/nodes/{id}/complete."""

    node_id: str
    new_state: str
    xp_earned: int
    total_xp: int
