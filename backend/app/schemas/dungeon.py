"""Pydantic schemas for dungeon API requests and responses."""

from pydantic import BaseModel, Field


class DungeonStartRequest(BaseModel):
    """Request body for starting a new dungeon run."""

    tier: str = Field(..., description="Dungeon tier key (e.g. 'shallow_crypts')")
    duration_minutes: int = Field(..., ge=15, le=120, description="Timer duration in minutes")
    linked_node_id: str | None = Field(None, description="Optional tree node being worked on")
    linked_quest_id: str | None = Field(None, description="Optional daily quest being fulfilled")
