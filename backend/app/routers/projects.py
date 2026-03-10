"""CRUD endpoints for Projects, Books, and Chapters."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.project import Book, Chapter, Project

router = APIRouter()


# ── Pydantic schemas ────────────────────────────────────────────────────


class ProjectCreate(BaseModel):
    title: str
    synopsis: str | None = None
    genre: str = "romantasy"
    subgenres: list[str] | None = None
    settings: dict | None = None
    metadata: dict | None = None


class ProjectUpdate(BaseModel):
    title: str | None = None
    synopsis: str | None = None
    genre: str | None = None
    subgenres: list[str] | None = None
    settings: dict | None = None
    metadata: dict | None = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    synopsis: str | None = None
    genre: str
    subgenres: list[str] | None = None
    settings: dict | None = None
    metadata: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookCreate(BaseModel):
    title: str
    order: int = 1
    blurb: str | None = None
    target_word_count: int | None = None


class BookUpdate(BaseModel):
    title: str | None = None
    order: int | None = None
    blurb: str | None = None
    target_word_count: int | None = None
    status: str | None = None


class BookOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    order: int
    blurb: str | None = None
    target_word_count: int | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChapterCreate(BaseModel):
    number: int
    title: str
    summary: str | None = None
    target_word_count: int | None = None
    pov_character_id: uuid.UUID | None = None


class ChapterUpdate(BaseModel):
    number: int | None = None
    title: str | None = None
    summary: str | None = None
    target_word_count: int | None = None
    status: str | None = None
    pov_character_id: uuid.UUID | None = None


class ChapterContentUpdate(BaseModel):
    content_json: dict
    content_text: str | None = None


class ChapterOut(BaseModel):
    id: uuid.UUID
    book_id: uuid.UUID
    number: int
    title: str
    summary: str | None = None
    word_count: int
    target_word_count: int | None = None
    status: str
    pov_character_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChapterDetailOut(ChapterOut):
    content_text: str
    content_json: dict | None = None


class ProjectDetailOut(ProjectOut):
    books: list[BookOut] = Field(default_factory=list)


# ── Helpers ──────────────────────────────────────────────────────────────


async def _get_project_for_user(
    project_id: uuid.UUID,
    user_id: str,
    db: AsyncSession,
) -> Project:
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.owner_id == uuid.UUID(user_id),
        )
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


# ── Project CRUD ─────────────────────────────────────────────────────────


@router.get("/projects", response_model=list[ProjectOut])
async def list_projects(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Project]:
    result = await db.execute(
        select(Project)
        .where(Project.owner_id == uuid.UUID(user_id))
        .order_by(Project.updated_at.desc())
    )
    return list(result.scalars().all())


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Project:
    project = Project(
        owner_id=uuid.UUID(user_id),
        title=body.title,
        synopsis=body.synopsis,
        genre=body.genre,
        subgenres=body.subgenres or [],
        settings=body.settings or {},
        metadata_=body.metadata or {},
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=ProjectDetailOut)
async def get_project(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Project:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.books))
        .where(
            Project.id == project_id,
            Project.owner_id == uuid.UUID(user_id),
        )
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Project:
    project = await _get_project_for_user(project_id, user_id, db)
    update_data = body.model_dump(exclude_unset=True)
    if "metadata" in update_data:
        update_data["metadata_"] = update_data.pop("metadata")
    for field, value in update_data.items():
        setattr(project, field, value)
    await db.flush()
    await db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    project = await _get_project_for_user(project_id, user_id, db)
    await db.delete(project)
    await db.flush()


# ── Book CRUD ────────────────────────────────────────────────────────────


@router.get("/projects/{project_id}/books", response_model=list[BookOut])
async def list_books(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Book]:
    await _get_project_for_user(project_id, user_id, db)
    result = await db.execute(
        select(Book)
        .where(Book.project_id == project_id)
        .order_by(Book.order)
    )
    return list(result.scalars().all())


@router.post(
    "/projects/{project_id}/books",
    response_model=BookOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_book(
    project_id: uuid.UUID,
    body: BookCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Book:
    await _get_project_for_user(project_id, user_id, db)
    book = Book(
        project_id=project_id,
        title=body.title,
        order=body.order,
        blurb=body.blurb,
        target_word_count=body.target_word_count,
    )
    db.add(book)
    await db.flush()
    await db.refresh(book)
    return book


@router.put("/books/{book_id}", response_model=BookOut)
async def update_book(
    book_id: uuid.UUID,
    body: BookUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Book:
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    # verify ownership
    await _get_project_for_user(book.project_id, user_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(book, field, value)
    await db.flush()
    await db.refresh(book)
    return book


# ── Chapter CRUD ─────────────────────────────────────────────────────────


@router.get("/books/{book_id}/chapters", response_model=list[ChapterOut])
async def list_chapters(
    book_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Chapter]:
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    await _get_project_for_user(book.project_id, user_id, db)
    result = await db.execute(
        select(Chapter)
        .where(Chapter.book_id == book_id)
        .order_by(Chapter.number)
    )
    return list(result.scalars().all())


@router.post(
    "/books/{book_id}/chapters",
    response_model=ChapterOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_chapter(
    book_id: uuid.UUID,
    body: ChapterCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Chapter:
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    await _get_project_for_user(book.project_id, user_id, db)
    chapter = Chapter(
        book_id=book_id,
        number=body.number,
        title=body.title,
        summary=body.summary,
        target_word_count=body.target_word_count,
        pov_character_id=body.pov_character_id,
    )
    db.add(chapter)
    await db.flush()
    await db.refresh(chapter)
    return chapter


@router.get("/chapters/{chapter_id}", response_model=ChapterDetailOut)
async def get_chapter(
    chapter_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Chapter:
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    # verify ownership via book -> project
    book_result = await db.execute(select(Book).where(Book.id == chapter.book_id))
    book = book_result.scalar_one()
    await _get_project_for_user(book.project_id, user_id, db)
    return chapter


@router.put("/chapters/{chapter_id}", response_model=ChapterOut)
async def update_chapter(
    chapter_id: uuid.UUID,
    body: ChapterUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Chapter:
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    book_result = await db.execute(select(Book).where(Book.id == chapter.book_id))
    book = book_result.scalar_one()
    await _get_project_for_user(book.project_id, user_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(chapter, field, value)
    await db.flush()
    await db.refresh(chapter)
    return chapter


@router.put("/chapters/{chapter_id}/content", response_model=ChapterDetailOut)
async def save_chapter_content(
    chapter_id: uuid.UUID,
    body: ChapterContentUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Chapter:
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    book_result = await db.execute(select(Book).where(Book.id == chapter.book_id))
    book = book_result.scalar_one()
    await _get_project_for_user(book.project_id, user_id, db)

    chapter.content_json = body.content_json

    # Derive plain text from provided content_text or from the JSON
    if body.content_text is not None:
        chapter.content_text = body.content_text
    else:
        chapter.content_text = _extract_text_from_prosemirror(body.content_json)

    chapter.word_count = len(chapter.content_text.split()) if chapter.content_text else 0
    await db.flush()
    await db.refresh(chapter)
    return chapter


@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    book_result = await db.execute(select(Book).where(Book.id == chapter.book_id))
    book = book_result.scalar_one()
    await _get_project_for_user(book.project_id, user_id, db)
    await db.delete(chapter)
    await db.flush()


# ── Utilities ────────────────────────────────────────────────────────────


def _extract_text_from_prosemirror(doc: dict) -> str:
    """Recursively extract plain text from a Tiptap/ProseMirror JSON doc."""
    parts: list[str] = []

    def _walk(node: dict) -> None:
        if "text" in node:
            parts.append(node["text"])
        for child in node.get("content", []):
            _walk(child)

    _walk(doc)
    return " ".join(parts)
