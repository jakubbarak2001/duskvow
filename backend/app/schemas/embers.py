"""Pydantic schemas for ember API requests and responses."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class EmberCreate(BaseModel):
    """Request body for POST /api/v1/embers."""

    title: str = Field(..., min_length=1, max_length=100, description="Victory title")
    description: str | None = Field(
        default=None, max_length=500, description="Optional description"
    )


class EmberResponse(BaseModel):
    """Response schema for a single ember."""

    id: UUID
    user_id: UUID
    title: str
    description: str | None
    created_at: datetime
