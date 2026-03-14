"""SQLAlchemy model: Character."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Character(Base):
    __tablename__ = "characters"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    aliases: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(255)), nullable=True, default=list
    )
    role: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="FMC, MMC, antagonist, secondary, etc.",
    )
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    appearance: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    personality: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    backstory: Mapped[str | None] = mapped_column(Text, nullable=True)
    relationships: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    arc: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    voice_profile: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
        comment="Character speech patterns (not author voice)",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("now()"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("now()"),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Character {self.name!r} ({self.role})>"
