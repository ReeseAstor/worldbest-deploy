"""CRUD endpoints for Locations."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.location import Location
from app.models.project import Project

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────


class LocationCreate(BaseModel):
    name: str
    description: str | None = None
    geography: dict | None = None
    atmosphere: str | None = None
    significance: str | None = None


class LocationUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    geography: dict | None = None
    atmosphere: str | None = None
    significance: str | None = None


class LocationOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    description: str | None = None
    geography: dict | None = None
    atmosphere: str | None = None
    significance: str | None = None
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


@router.get("/projects/{project_id}/locations", response_model=list[LocationOut])
async def list_locations(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Location]:
    await _verify_project_ownership(project_id, user_id, db)
    result = await db.execute(
        select(Location)
        .where(Location.project_id == project_id)
        .order_by(Location.name)
    )
    return list(result.scalars().all())


@router.post(
    "/projects/{project_id}/locations",
    response_model=LocationOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_location(
    project_id: uuid.UUID,
    body: LocationCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Location:
    await _verify_project_ownership(project_id, user_id, db)
    location = Location(
        project_id=project_id,
        **body.model_dump(),
    )
    db.add(location)
    await db.flush()
    await db.refresh(location)
    return location


@router.get("/locations/{location_id}", response_model=LocationOut)
async def get_location(
    location_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Location:
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    await _verify_project_ownership(location.project_id, user_id, db)
    return location


@router.put("/locations/{location_id}", response_model=LocationOut)
async def update_location(
    location_id: uuid.UUID,
    body: LocationUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Location:
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    await _verify_project_ownership(location.project_id, user_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(location, field, value)
    await db.flush()
    await db.refresh(location)
    return location


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Location not found"
        )
    await _verify_project_ownership(location.project_id, user_id, db)
    await db.delete(location)
    await db.flush()
