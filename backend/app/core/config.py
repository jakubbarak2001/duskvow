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
    api_secret_key: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Google Gemini
    gemini_api_key: str = ""
    gemini_model_fast: str = "gemini-2.0-flash"
    # Tree generation moved from gemini-2.5-pro to gemini-2.5-flash on
    # 2026-04-13. Reason: pro has p50 ~30s and p95 ~60s+ for our 18-22 node
    # JSON output, which sat right at the timeout band and produced flaky
    # "AI generation timed out" errors. Flash is 3-5x faster (~8-15s p50)
    # and the new template-based prompt (see prompts/generate_tree.txt) is
    # strict enough that flash follows it just as well as pro did.
    gemini_model_quality: str = "gemini-2.5-flash"

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://duskvow.vercel.app",
        "https://duskvow-production.vercel.app",
                "https://duskvow.com",
                "https://www.duskvow.com",
    ]
    cors_allow_all_vercel_previews: bool = True

    # Rate limiting
    free_tier_daily_generations: int = 2

    # AI
    # 45s ceiling with thinking disabled on 2.5 Flash. Flash typically
    # finishes in 5-10s now; 45s is ~3x our p95 target (30s) so it catches
    # real stalls without letting the user stare at a spinner for minutes.
    # If you raise this, also bump the frontend client timeout in api.ts.
    ai_timeout_seconds: int = 45


settings = Settings()
