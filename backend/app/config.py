"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the Ember API.

    Values are read from environment variables (case-insensitive) and
    optionally from a ``.env`` file located in the project root.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # ── Database ──────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── Supabase ──────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str

    # ── Anthropic ─────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str

    # ── Stripe ────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ── Background workers / originality checks ──────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    ORIGINALITY_MOCK_API_URL: str = ""
    COPYSCAPE_MOCK_API_URL: str = ""
    REWRITE_MOCK_API_URL: str = ""
    ORIGINALITY_AI_SCORE_THRESHOLD: float = 20.0
    COPYSCAPE_MATCH_THRESHOLD: int = 0
    ORIGINALITY_MAX_REWRITE_LOOPS: int = 3

    # ── CORS ──────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── API ───────────────────────────────────────────────────────────
    API_PREFIX: str = "/api/v1"


@lru_cache
def get_settings() -> Settings:
    """Return a cached :class:`Settings` instance."""
    return Settings()  # type: ignore[call-arg]
