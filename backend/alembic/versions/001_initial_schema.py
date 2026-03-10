"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-06
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON, ARRAY, TEXT

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── Users table (synced from Supabase auth.users) ─────────────────
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column(
            "display_name", sa.String(255), nullable=False, server_default=""
        ),
        sa.Column(
            "plan", sa.String(50), nullable=False, server_default="starter"
        ),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("active_voice_profile_id", UUID(as_uuid=True), nullable=True),
        sa.Column("preferences", JSON, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    # ── Projects ──────────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "owner_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("synopsis", sa.Text, nullable=True),
        sa.Column(
            "genre", sa.String(100), nullable=False, server_default="romantasy"
        ),
        sa.Column("subgenres", ARRAY(sa.String), nullable=True),
        sa.Column("settings", JSON, nullable=True),
        sa.Column("metadata", JSON, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_projects_owner_id", "projects", ["owner_id"])

    # ── Books ─────────────────────────────────────────────────────────
    op.create_table(
        "books",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("blurb", sa.Text, nullable=True),
        sa.Column("target_word_count", sa.Integer, nullable=True),
        sa.Column(
            "status", sa.String(50), nullable=False, server_default="planning"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_books_project_id", "books", ["project_id"])

    # ── Chapters ──────────────────────────────────────────────────────
    op.create_table(
        "chapters",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "book_id",
            UUID(as_uuid=True),
            sa.ForeignKey("books.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("number", sa.Integer, nullable=False, server_default="1"),
        sa.Column("title", sa.String(500), nullable=False, server_default=""),
        sa.Column("summary", sa.Text, nullable=True),
        sa.Column("content_text", sa.Text, nullable=False, server_default=""),
        sa.Column("content_json", JSON, nullable=True),
        sa.Column(
            "word_count", sa.Integer, nullable=False, server_default="0"
        ),
        sa.Column("target_word_count", sa.Integer, nullable=True),
        sa.Column(
            "status", sa.String(50), nullable=False, server_default="outlined"
        ),
        sa.Column("pov_character_id", UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_chapters_book_id", "chapters", ["book_id"])

    # ── Characters ────────────────────────────────────────────────────
    op.create_table(
        "characters",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("aliases", ARRAY(sa.String), nullable=True),
        sa.Column("role", sa.String(100), nullable=True),
        sa.Column("age", sa.Integer, nullable=True),
        sa.Column("gender", sa.String(50), nullable=True),
        sa.Column("appearance", JSON, nullable=True),
        sa.Column("personality", JSON, nullable=True),
        sa.Column("backstory", sa.Text, nullable=True),
        sa.Column("relationships", JSON, nullable=True),
        sa.Column("arc", JSON, nullable=True),
        sa.Column("voice_profile", JSON, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_characters_project_id", "characters", ["project_id"])

    # ── Locations ─────────────────────────────────────────────────────
    op.create_table(
        "locations",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("geography", JSON, nullable=True),
        sa.Column("atmosphere", sa.String(500), nullable=True),
        sa.Column("significance", sa.String(500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_locations_project_id", "locations", ["project_id"])

    # ── Voice Profiles ────────────────────────────────────────────────
    op.create_table(
        "voice_profiles",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("sample_excerpts", ARRAY(TEXT), nullable=True),
        sa.Column("fingerprint", JSON, nullable=True),
        sa.Column(
            "is_active", sa.Boolean, nullable=False, server_default="false"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_voice_profiles_user_id", "voice_profiles", ["user_id"])

    # ── Embeddings (pgvector) ─────────────────────────────────────────
    op.create_table(
        "embeddings",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("content_type", sa.String(50), nullable=False),
        sa.Column("content_id", UUID(as_uuid=True), nullable=False),
        sa.Column("content_text", sa.Text, nullable=False),
        # Vector column added via raw SQL below
        sa.Column("metadata", JSON, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.execute("ALTER TABLE embeddings ADD COLUMN embedding vector(1536)")
    op.create_index("ix_embeddings_project_id", "embeddings", ["project_id"])

    # ── Line Edit Suggestions ─────────────────────────────────────────
    op.create_table(
        "line_edit_suggestions",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "chapter_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chapters.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("original_text", sa.Text, nullable=False),
        sa.Column("suggested_text", sa.Text, nullable=False),
        sa.Column("explanation", sa.Text, nullable=False),
        sa.Column("position_from", sa.Integer, nullable=False),
        sa.Column("position_to", sa.Integer, nullable=False),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="pending"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_line_edit_suggestions_chapter_id",
        "line_edit_suggestions",
        ["chapter_id"],
    )

    # ── Export Jobs ────────────────────────────────────────────────────
    op.create_table(
        "export_jobs",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("format", sa.String(20), nullable=False),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="pending"
        ),
        sa.Column("file_url", sa.String(1000), nullable=True),
        sa.Column("options", JSON, nullable=True),
        sa.Column("error", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    # ── Subscriptions ─────────────────────────────────────────────────
    op.create_table(
        "subscriptions",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
        sa.Column(
            "plan", sa.String(50), nullable=False, server_default="starter"
        ),
        sa.Column(
            "status", sa.String(50), nullable=False, server_default="active"
        ),
        sa.Column(
            "current_period_start", sa.DateTime(timezone=True), nullable=True
        ),
        sa.Column(
            "current_period_end", sa.DateTime(timezone=True), nullable=True
        ),
        sa.Column(
            "cancel_at_period_end",
            sa.Boolean,
            nullable=False,
            server_default="false",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])

    # ── AI Usage tracking ─────────────────────────────────────────────
    op.create_table(
        "ai_usage",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("project_id", UUID(as_uuid=True), nullable=True),
        sa.Column("chapter_id", UUID(as_uuid=True), nullable=True),
        sa.Column("intent", sa.String(100), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column(
            "prompt_tokens", sa.Integer, nullable=False, server_default="0"
        ),
        sa.Column(
            "completion_tokens", sa.Integer, nullable=False, server_default="0"
        ),
        sa.Column(
            "total_tokens", sa.Integer, nullable=False, server_default="0"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_ai_usage_user_id", "ai_usage", ["user_id"])

    # ── Add FK for active_voice_profile_id on users ───────────────────
    op.create_foreign_key(
        "fk_users_active_voice_profile",
        "users",
        "voice_profiles",
        ["active_voice_profile_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_users_active_voice_profile", "users", type_="foreignkey"
    )
    op.drop_table("ai_usage")
    op.drop_table("subscriptions")
    op.drop_table("export_jobs")
    op.drop_table("line_edit_suggestions")
    op.drop_table("embeddings")
    op.drop_table("voice_profiles")
    op.drop_table("locations")
    op.drop_table("characters")
    op.drop_table("chapters")
    op.drop_table("books")
    op.drop_table("projects")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS vector")
