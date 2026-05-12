"""Export endpoints (DOCX / EPUB)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.services.export_service import ExportService

router = APIRouter()

# In-memory job store (swap for Redis / DB in production)
_jobs: dict[str, dict] = {}


# ── Schemas ──────────────────────────────────────────────────────────────


class ExportRequest(BaseModel):
    project_id: uuid.UUID
    format: str  # "docx" | "epub"
    options: dict | None = None


class ExportJobOut(BaseModel):
    job_id: str
    status: str  # "pending" | "processing" | "completed" | "failed"
    format: str
    download_url: str | None = None


# ── Endpoints ────────────────────────────────────────────────────────────


@router.post("/export", response_model=ExportJobOut, status_code=status.HTTP_202_ACCEPTED)
async def create_export(
    body: ExportRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create an export job. In this skeleton the export runs synchronously."""
    if body.format not in ("docx", "epub"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="format must be 'docx' or 'epub'",
        )

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "status": "processing",
        "format": body.format,
        "data": None,
    }

    export_svc = ExportService(db=db)
    try:
        if body.format == "docx":
            data = await export_svc.export_docx(
                project_id=body.project_id, options=body.options or {}
            )
        else:
            data = await export_svc.export_epub(
                project_id=body.project_id, options=body.options or {}
            )
        _jobs[job_id]["data"] = data
        _jobs[job_id]["status"] = "completed"
    except Exception as exc:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = str(exc)

    return {
        "job_id": job_id,
        "status": _jobs[job_id]["status"],
        "format": body.format,
        "download_url": f"/export/{job_id}/download" if _jobs[job_id]["status"] == "completed" else None,
    }


@router.get("/export/{job_id}", response_model=ExportJobOut)
async def poll_export(
    job_id: str,
    user_id: str = Depends(get_current_user),
) -> dict:
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export job not found")
    return {
        "job_id": job_id,
        "status": job["status"],
        "format": job["format"],
        "download_url": f"/export/{job_id}/download" if job["status"] == "completed" else None,
    }


@router.get("/export/{job_id}/download")
async def download_export(
    job_id: str,
    user_id: str = Depends(get_current_user),
) -> Response:
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Export job not found")
    if job["status"] != "completed" or job.get("data") is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Export not ready for download",
        )

    fmt = job["format"]
    if fmt == "docx":
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = "export.docx"
    else:
        media_type = "application/epub+zip"
        filename = "export.epub"

    return Response(
        content=job["data"],
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
