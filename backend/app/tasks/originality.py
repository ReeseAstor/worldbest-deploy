"""Celery task entrypoints for originality checks."""

from __future__ import annotations

import asyncio

from app.config import get_settings
from app.services.originality_pipeline import OriginalityPipeline
from app.workers.celery_app import celery_app


@celery_app.task(name="app.tasks.originality.review_text")
def review_text(text: str) -> dict:
    """Run originality checks and bounded rewrite loops asynchronously."""
    settings = get_settings()
    pipeline = OriginalityPipeline(settings=settings)
    result = asyncio.run(pipeline.review(text=text))
    return {
        "text": result.text,
        "ai_score": result.ai_score,
        "copyscape_matches": result.copyscape_matches,
        "rewrites": result.rewrites,
        "passed": result.passed,
    }
