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


# The exact phrase a user must type into the frontend modal before their
# account is wiped. Deliberately in-character so a panic-click on "delete"
# doesn't actually nuke everything — the user has to intend to finish.
DELETE_CONFIRM_PHRASE = "DELETE MY VOW"


class DeleteAccountRequest(BaseModel):
    """Request body for DELETE /api/v1/profile/me.

    Requires the literal string ``DELETE MY VOW`` in ``confirm`` so that
    accidental clicks or forged requests that don't surface the modal copy
    return 400 instead of wiping the account.
    """

    confirm: str = Field(..., description="Must equal DELETE_CONFIRM_PHRASE")

    @field_validator("confirm")
    @classmethod
    def validate_confirm(cls, v: str) -> str:
        if v.strip() != DELETE_CONFIRM_PHRASE:
            raise ValueError(
                f"Confirmation phrase must be exactly '{DELETE_CONFIRM_PHRASE}'."
            )
        return v
