"""Pydantic schemas for daily quest API responses."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class DailyQuestResponse(BaseModel):
    """A daily quest with today's completion status."""

    id: UUID
    tree_id: UUID
    user_id: UUID
    title: str
    description: str
    xp_reward: int
    sort_order: int
    created_at: datetime
    completed_today: bool


class QuestCompletionResponse(BaseModel):
    """Result of completing or uncompleting a daily quest."""

    quest_id: UUID
    xp_earned: int
    total_xp: int
    leveled_up: bool
    new_level: int
    previous_level: int
    new_title: str
