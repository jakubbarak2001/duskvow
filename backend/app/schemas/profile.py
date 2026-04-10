"""Pydantic schemas for profile API requests."""

import re

from pydantic import BaseModel, Field, field_validator


class ProfileUpdateRequest(BaseModel):
    """Request body for PATCH /api/v1/profile."""

    hero_name: str = Field(..., min_length=1, max_length=30, description="Hero display name")

    @field_validator("hero_name")
    @classmethod
    def validate_hero_name(cls, v: str) -> str:
        """Allow letters, spaces, hyphens, and apostrophes only."""
        v = v.strip()
        if not re.match(r"^[a-zA-Z][a-zA-Z '\-]{0,29}$", v):
            raise ValueError("Hero name must start with a letter and contain only letters, spaces, hyphens, or apostrophes.")
        return v
