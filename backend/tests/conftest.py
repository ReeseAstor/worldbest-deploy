from __future__ import annotations

import os

from app.config import get_settings


os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/test_db")
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")

# Ensure tests use environment above even if settings were cached earlier.
get_settings.cache_clear()
