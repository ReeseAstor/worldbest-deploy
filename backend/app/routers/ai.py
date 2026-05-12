"""AI generation endpoints (streaming via SSE)."""

from __future__ import annotations

import json
import uuid
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.project import Chapter
from app.services.ai_orchestrator import AIOrchestrator
from app.services.line_editor import LineEditor

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────


class AIGenerationRequest(BaseModel):
    project_id: uuid.UUID
    chapter_id: uuid.UUID | None = None
    prompt: str
    context_text: str | None = None
    voice_profile_id: uuid.UUID | None = None
    parameters: dict | None = None


class SlashCommandRequest(BaseModel):
    command: str
    chapter_id: uuid.UUID
    context_text: str | None = None
    parameters: dict | None = None


class LineEditRequest(BaseModel):
    edit_types: list[str] | None = None


class SuggestionAction(BaseModel):
    action: str  # "accept" | "reject"


class OriginalityReviewRequest(BaseModel):
    text: str


class OriginalityReviewEnqueueOut(BaseModel):
    task_id: str
    status: str


class OriginalityReviewStatusOut(BaseModel):
    task_id: str
    status: str
    result: dict | None = None


class LineEditSuggestionOut(BaseModel):
    id: str
    edit_type: str
    original_text: str
    suggested_text: str
    explanation: str
    position: dict | None = None


# ── Helpers ──────────────────────────────────────────────────────────────


async def _sse_stream(
    generator: AsyncGenerator[str, None],
) -> AsyncGenerator[bytes, None]:
    """Wrap an async string generator as SSE ``data:`` frames."""
    async for chunk in generator:
        yield f"data: {json.dumps({'content': chunk})}\n\n".encode()
    yield b"data: [DONE]\n\n"


# ── Endpoints ────────────────────────────────────────────────────────────


def _enqueue_originality_task(text: str) -> str:
    """Enqueue an originality review task and return task id."""
    from app.tasks.originality import review_text

    task = review_text.delay(text)
    return str(task.id)


def _fetch_originality_task(task_id: str) -> tuple[str, dict | None]:
    """Fetch task status and optional result payload."""
    from app.workers.celery_app import celery_app

    async_result = celery_app.AsyncResult(task_id)
    result = async_result.result if async_result.successful() else None
    return str(async_result.status), result


@router.post("/ai/generate")
async def ai_generate(
    body: AIGenerationRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """General-purpose AI text generation with streaming SSE response."""
    settings = get_settings()
    orchestrator = AIOrchestrator(db=db, settings=settings)
    generator = orchestrator.generate(request=body, user_id=user_id)
    return StreamingResponse(
        _sse_stream(generator),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/ai/slash-command")
async def ai_slash_command(
    body: SlashCommandRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Execute a slash command (e.g. /draft, /scene, /dialogue) with streaming."""
    settings = get_settings()
    orchestrator = AIOrchestrator(db=db, settings=settings)
    generator = orchestrator.execute_slash_command(
        command=body.command,
        chapter_id=body.chapter_id,
        context_text=body.context_text or "",
        user_id=user_id,
        parameters=body.parameters,
    )
    return StreamingResponse(
        _sse_stream(generator),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/ai/line-edit/{chapter_id}",
    response_model=list[LineEditSuggestionOut],
)
async def run_line_edit(
    chapter_id: uuid.UUID,
    body: LineEditRequest | None = None,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Run line-edit analysis on a chapter and return suggestions."""
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found"
        )
    settings = get_settings()
    editor = LineEditor(db=db, settings=settings)
    edit_types = body.edit_types if body else None
    suggestions = await editor.analyze_chapter(
        chapter_id=chapter_id,
        edit_types=edit_types,
    )
    return suggestions


@router.patch("/ai/line-edit/suggestions/{suggestion_id}")
async def handle_suggestion(
    suggestion_id: str,
    body: SuggestionAction,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Accept or reject a line-edit suggestion."""
    # In a full implementation this would update a line_edit_suggestions table
    # and optionally apply the suggestion to the chapter content.
    if body.action not in ("accept", "reject"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="action must be 'accept' or 'reject'",
        )
    return {
        "suggestion_id": suggestion_id,
        "action": body.action,
        "status": "applied" if body.action == "accept" else "dismissed",
    }


@router.post(
    "/ai/originality/review",
    response_model=OriginalityReviewEnqueueOut,
    status_code=status.HTTP_202_ACCEPTED,
)
async def enqueue_originality_review(
    body: OriginalityReviewRequest,
    user_id: str = Depends(get_current_user),
) -> dict:
    """Queue originality review + rewrite loop in Celery."""
    _ = user_id
    task_id = _enqueue_originality_task(body.text)
    return {"task_id": task_id, "status": "queued"}


@router.get(
    "/ai/originality/review/{task_id}",
    response_model=OriginalityReviewStatusOut,
)
async def get_originality_review_status(
    task_id: str,
    user_id: str = Depends(get_current_user),
) -> dict:
    """Fetch status/result for a queued originality review task."""
    _ = user_id
    status_text, result = _fetch_originality_task(task_id)
    payload = {"task_id": task_id, "status": status_text}
    if result is not None:
        payload["result"] = result
    return payload
