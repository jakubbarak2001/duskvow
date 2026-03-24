"""Pydantic schemas for tree API requests and responses."""

from pydantic import BaseModel, Field


class GenerateTreeRequest(BaseModel):
    """Request body for POST /api/v1/trees/generate."""

    goal_prompt: str = Field(..., min_length=5, max_length=1000, description="User's goal description")


class FollowUpQuestion(BaseModel):
    """A single AI follow-up question."""

    id: str
    text: str
    options: list[str]


class FollowUpQuestionsResponse(BaseModel):
    """Response from POST /api/v1/trees/generate."""

    session_id: str
    questions: list[FollowUpQuestion]


class FollowUpRequest(BaseModel):
    """Request body for POST /api/v1/trees/followup."""

    session_id: str = Field(
        ...,
        min_length=36,
        max_length=36,
        pattern=r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    )
    answers: dict[str, str] = Field(..., description="Map of question_id to selected option")


class SkillNodeSchema(BaseModel):
    """Schema for a single skill node in the tree."""

    id: str
    title: str
    description: str
    node_type: str
    tier: str
    state: str = "locked"
    position_x: float
    position_y: float
    prerequisites: list[str] = []
    is_optional: bool = False
    xp_reward: int = 10
    estimated_time: str | None = None


class TalentTreeResponse(BaseModel):
    """Response schema for a full talent tree."""

    id: str
    user_id: str
    title: str
    description: str | None
    goal_prompt: str
    total_nodes: int
    completed_nodes: int
    total_xp: int
    earned_xp: int
    status: str
    nodes: list[SkillNodeSchema]
    created_at: str
    updated_at: str
