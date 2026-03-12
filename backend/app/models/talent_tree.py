"""SQLModel database models for talent trees and skill nodes."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class TalentTree(SQLModel, table=True):
    """Represents a user's AI-generated talent tree."""

    __tablename__ = "talent_trees"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(..., foreign_key="auth.users.id", index=True)
    title: str
    description: str | None = None
    goal_prompt: str
    ai_context: dict | None = Field(default=None, sa_type_args=["JSONB"])
    total_nodes: int = 0
    completed_nodes: int = 0
    total_xp: int = 0
    earned_xp: int = 0
    status: str = Field(default="active")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SkillNode(SQLModel, table=True):
    """Represents a single node within a talent tree."""

    __tablename__ = "skill_nodes"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tree_id: UUID = Field(..., foreign_key="talent_trees.id", index=True)
    title: str
    description: str
    node_type: str
    tier: str
    state: str = Field(default="locked")
    position_x: float
    position_y: float
    prerequisites: list[str] = Field(default=[])
    is_optional: bool = False
    xp_reward: int = 10
    estimated_time: str | None = None
    sort_order: int = 0
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
