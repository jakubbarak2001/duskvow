"""Tree API routes — generate, list, get, delete talent trees."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id
from app.schemas.trees import (
    GenerateTreeRequest,
    FollowUpRequest,
    FollowUpQuestionsResponse,
    TalentTreeResponse,
)

router = APIRouter()


@router.post("/generate", response_model=dict)
async def generate_tree(
    body: GenerateTreeRequest,
    user_id: str = Depends(get_current_user_id),
) -> FollowUpQuestionsResponse:
    """Start AI tree generation — returns follow-up questions.

    Args:
        body: Contains the user's goal prompt.
        user_id: Authenticated user's UUID.

    Returns:
        Follow-up questions for the AI to ask.
    """
    # TODO (Task 4): Call Gemini service to generate follow-up questions
    return FollowUpQuestionsResponse(
        session_id="placeholder-session",
        questions=[
            {
                "id": "q1",
                "text": "What's your current experience level?",
                "options": ["Complete beginner", "Some basics", "Intermediate", "Advanced"],
            },
        ],
    )


@router.post("/followup", response_model=dict)
async def submit_followup(
    body: FollowUpRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Submit follow-up question answers and generate the talent tree.

    Args:
        body: Session ID and user's answers to follow-up questions.
        user_id: Authenticated user's UUID.

    Returns:
        The generated talent tree.
    """
    # TODO (Task 4): Call Gemini service to generate full tree
    return {"data": None, "error": {"message": "Not implemented yet", "code": "NOT_IMPLEMENTED"}}


@router.get("", response_model=dict)
async def list_trees(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """List all talent trees for the authenticated user.

    Args:
        user_id: Authenticated user's UUID.

    Returns:
        List of talent trees.
    """
    # TODO (Task 2): Fetch from Supabase
    return {"data": [], "error": None}


@router.get("/{tree_id}", response_model=dict)
async def get_tree(
    tree_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Get a specific talent tree with all its nodes.

    Args:
        tree_id: UUID of the talent tree.
        user_id: Authenticated user's UUID.

    Returns:
        The talent tree with nodes.
    """
    # TODO (Task 2): Fetch from Supabase
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.delete("/{tree_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tree(
    tree_id: str,
    user_id: str = Depends(get_current_user_id),
) -> None:
    """Delete a talent tree.

    Args:
        tree_id: UUID of the talent tree to delete.
        user_id: Authenticated user's UUID.
    """
    # TODO (Task 2): Delete from Supabase
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
