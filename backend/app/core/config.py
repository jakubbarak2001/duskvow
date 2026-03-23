"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All configuration for the Duskvow backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # API
    api_secret_key: str = "dev-secret-change-in-production"

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Google Gemini
    gemini_api_key: str = ""
    gemini_model_fast: str = "gemini-2.0-flash"
    gemini_model_quality: str = "gemini-2.0-flash"

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://duskvow.vercel.app",
        "https://duskvow-production.vercel.app",
    ]
    cors_allow_all_vercel_previews: bool = True

    # Rate limiting
    free_tier_daily_generations: int = 2

    # AI
    ai_timeout_seconds: int = 30


settings = Settings()
