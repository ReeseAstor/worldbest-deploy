"""CRUD endpoints for Characters."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.character import Character
from app.models.project import Project

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────


class CharacterCreate(BaseModel):
    name: str
    aliases: list[str] | None = None
    role: str | None = None
    age: int | None = None
    gender: str | None = None
    appearance: dict | None = None
    personality: dict | None = None
    backstory: str | None = None
    relationships: dict | None = None
    arc: dict | None = None
    voice_profile: dict | None = None


class CharacterUpdate(BaseModel):
    name: str | None = None
    aliases: list[str] | None = None
    role: str | None = None
    age: int | None = None
    gender: str | None = None
    appearance: dict | None = None
    personality: dict | None = None
    backstory: str | None = None
    relationships: dict | None = None
    arc: dict | None = None
    voice_profile: dict | None = None


class CharacterOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    aliases: list[str] | None = None
    role: str | None = None
    age: int | None = None
    gender: str | None = None
    appearance: dict | None = None
    personality: dict | None = None
    backstory: str | None = None
    relationships: dict | None = None
    arc: dict | None = None
    voice_profile: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Helpers ──────────────────────────────────────────────────────────────


async def _verify_project_ownership(
    project_id: uuid.UUID, user_id: str, db: AsyncSession
) -> None:
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.owner_id == uuid.UUID(user_id),
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )


# ── Endpoints ────────────────────────────────────────────────────────────


@router.get("/projects/{project_id}/characters", response_model=list[CharacterOut])
async def list_characters(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Character]:
    await _verify_project_ownership(project_id, user_id, db)
    result = await db.execute(
        select(Character)
        .where(Character.project_id == project_id)
        .order_by(Character.name)
    )
    return list(result.scalars().all())


@router.post(
    "/projects/{project_id}/characters",
    response_model=CharacterOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_character(
    project_id: uuid.UUID,
    body: CharacterCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Character:
    await _verify_project_ownership(project_id, user_id, db)
    character = Character(
        project_id=project_id,
        **body.model_dump(),
    )
    db.add(character)
    await db.flush()
    await db.refresh(character)
    return character


@router.get("/characters/{character_id}", response_model=CharacterOut)
async def get_character(
    character_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Character:
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Character not found"
        )
    await _verify_project_ownership(character.project_id, user_id, db)
    return character


@router.put("/characters/{character_id}", response_model=CharacterOut)
async def update_character(
    character_id: uuid.UUID,
    body: CharacterUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Character:
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Character not found"
        )
    await _verify_project_ownership(character.project_id, user_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(character, field, value)
    await db.flush()
    await db.refresh(character)
    return character


@router.delete("/characters/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Character not found"
        )
    await _verify_project_ownership(character.project_id, user_id, db)
    await db.delete(character)
    await db.flush()
