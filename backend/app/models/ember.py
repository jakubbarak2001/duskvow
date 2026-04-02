"""SQLModel database model for embers."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Ember(SQLModel, table=True):
    """Represents a user's personal victory record (ember)."""

    __tablename__ = "embers"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(..., foreign_key="auth.users.id", index=True)
    title: str
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
