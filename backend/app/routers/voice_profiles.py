"""CRUD endpoints for Voice Profiles."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.voice_profile import VoiceProfile
from app.services.voice_analyzer import VoiceAnalyzer

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────


class VoiceProfileCreate(BaseModel):
    name: str
    sample_excerpts: list[str] | None = None


class VoiceProfileUpdate(BaseModel):
    name: str | None = None
    sample_excerpts: list[str] | None = None


class VoiceProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    sample_excerpts: list[str] | None = None
    fingerprint: dict | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Helpers ──────────────────────────────────────────────────────────────


async def _get_profile_for_user(
    profile_id: uuid.UUID, user_id: str, db: AsyncSession
) -> VoiceProfile:
    result = await db.execute(
        select(VoiceProfile).where(
            VoiceProfile.id == profile_id,
            VoiceProfile.user_id == uuid.UUID(user_id),
        )
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Voice profile not found"
        )
    return profile


# ── Endpoints ────────────────────────────────────────────────────────────


@router.get("/voice-profiles", response_model=list[VoiceProfileOut])
async def list_voice_profiles(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[VoiceProfile]:
    result = await db.execute(
        select(VoiceProfile)
        .where(VoiceProfile.user_id == uuid.UUID(user_id))
        .order_by(VoiceProfile.created_at.desc())
    )
    return list(result.scalars().all())


@router.post(
    "/voice-profiles",
    response_model=VoiceProfileOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_voice_profile(
    body: VoiceProfileCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceProfile:
    profile = VoiceProfile(
        user_id=uuid.UUID(user_id),
        name=body.name,
        sample_excerpts=body.sample_excerpts or [],
    )
    db.add(profile)
    await db.flush()
    await db.refresh(profile)
    return profile


@router.post("/voice-profiles/{profile_id}/analyze", response_model=VoiceProfileOut)
async def analyze_voice_profile(
    profile_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceProfile:
    """Trigger voice fingerprint analysis on the stored sample excerpts."""
    profile = await _get_profile_for_user(profile_id, user_id, db)

    if not profile.sample_excerpts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No sample excerpts to analyze. Add excerpts first.",
        )

    settings = get_settings()
    analyzer = VoiceAnalyzer(settings=settings)
    fingerprint = await analyzer.analyze(profile.sample_excerpts)
    profile.fingerprint = fingerprint

    await db.flush()
    await db.refresh(profile)
    return profile


@router.put("/voice-profiles/{profile_id}", response_model=VoiceProfileOut)
async def update_voice_profile(
    profile_id: uuid.UUID,
    body: VoiceProfileUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceProfile:
    profile = await _get_profile_for_user(profile_id, user_id, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.flush()
    await db.refresh(profile)
    return profile


@router.post("/voice-profiles/{profile_id}/activate", response_model=VoiceProfileOut)
async def activate_voice_profile(
    profile_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VoiceProfile:
    """Set this profile as the active voice profile, deactivating all others."""
    profile = await _get_profile_for_user(profile_id, user_id, db)

    # Deactivate all other profiles for this user
    await db.execute(
        update(VoiceProfile)
        .where(
            VoiceProfile.user_id == uuid.UUID(user_id),
            VoiceProfile.id != profile_id,
        )
        .values(is_active=False)
    )

    profile.is_active = True
    await db.flush()
    await db.refresh(profile)
    return profile


@router.delete("/voice-profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voice_profile(
    profile_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    profile = await _get_profile_for_user(profile_id, user_id, db)
    await db.delete(profile)
    await db.flush()
