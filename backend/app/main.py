"""FastAPI application entry-point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import (
    ai,
    billing,
    characters,
    export,
    locations,
    projects,
    voice_profiles,
)

logger = logging.getLogger("ember")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: runs on startup and shutdown."""
    logger.info("Ember API starting up")
    yield
    logger.info("Ember API shutting down")


def create_app() -> FastAPI:
    """Build and return the configured FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Ember API",
        description="AI-Powered Romantasy Ghostwriting Platform",
        version="0.1.0",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────
    prefix = settings.API_PREFIX
    app.include_router(projects.router, prefix=prefix, tags=["projects"])
    app.include_router(characters.router, prefix=prefix, tags=["characters"])
    app.include_router(locations.router, prefix=prefix, tags=["locations"])
    app.include_router(ai.router, prefix=prefix, tags=["ai"])
    app.include_router(voice_profiles.router, prefix=prefix, tags=["voice-profiles"])
    app.include_router(export.router, prefix=prefix, tags=["export"])
    app.include_router(billing.router, prefix=prefix, tags=["billing"])

    # ── Root & health ─────────────────────────────────────────────────
    @app.get("/", tags=["meta"])
    async def root() -> dict:
        return {"app": "Ember API", "version": "0.1.0"}

    @app.get("/health", tags=["meta"])
    async def health() -> dict:
        return {"status": "healthy"}

    return app


app = create_app()
