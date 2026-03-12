"""Google Gemini AI service for tree generation.

Placeholder — implemented in Task 4.
"""

from app.core.config import settings


class GeminiService:
    """Handles all AI interactions via the Google Gemini API."""

    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key
        self.model_fast = settings.gemini_model_fast
        self.model_quality = settings.gemini_model_quality

    async def generate_followup_questions(self, goal_prompt: str) -> dict:
        """Generate clarifying follow-up questions for the user's goal.

        Args:
            goal_prompt: The user's stated goal.

        Returns:
            Structured follow-up questions.
        """
        # TODO (Task 4): Call Gemini API with JSON mode
        raise NotImplementedError

    async def generate_tree(self, goal_prompt: str, answers: dict[str, str]) -> dict:
        """Generate a full talent tree given the goal and follow-up answers.

        Args:
            goal_prompt: The user's stated goal.
            answers: User's answers to follow-up questions.

        Returns:
            Structured talent tree JSON.
        """
        # TODO (Task 4): Call Gemini API with structured output
        raise NotImplementedError


gemini_service = GeminiService()
