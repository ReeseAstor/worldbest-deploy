"""Core AI orchestration service – assembles context and streams Claude responses."""

from __future__ import annotations

import logging
import uuid
from collections.abc import AsyncGenerator
from typing import Any

import anthropic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.project import Chapter, Project
from app.models.voice_profile import VoiceProfile
from app.prompts.base import SYSTEM_PROMPT_MUSE
from app.prompts.drafting import SLASH_COMMAND_TEMPLATES
from app.services.bible_retriever import BibleRetriever
from app.services.steam_calibrator import SteamCalibrator

logger = logging.getLogger("ember.ai_orchestrator")


class AIOrchestrator:
    """Coordinates context retrieval, prompt assembly, and Claude streaming."""

    MODEL = "claude-sonnet-4-20250514"
    MAX_TOKENS = 4096

    def __init__(self, db: AsyncSession, settings: Settings) -> None:
        self.db = db
        self.settings = settings
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.bible_retriever = BibleRetriever(db=db, settings=settings)
        self.steam_calibrator = SteamCalibrator()

    # ── Public API ────────────────────────────────────────────────────

    async def generate(
        self, request: Any, user_id: str
    ) -> AsyncGenerator[str, None]:
        """General-purpose generation with full context pipeline.

        Steps:
        1. Retrieve Bible context via embedding search
        2. Load voice profile if specified
        3. Read steam calibration from project settings
        4. Assemble system + user prompts
        5. Stream Claude response, yielding text chunks
        """
        # 1. Bible context
        bible_context = await self.bible_retriever.retrieve_context(
            project_id=request.project_id,
            query=request.prompt,
            limit=5,
        )
        bible_text = self._format_bible_context(bible_context)

        # 2. Voice profile
        voice_instructions = ""
        if request.voice_profile_id:
            voice_instructions = await self._load_voice_instructions(
                request.voice_profile_id, user_id
            )

        # 3. Steam calibration
        steam_instructions = await self._load_steam_instructions(request.project_id)

        # 4. Assemble prompt
        system_prompt = self._build_system_prompt(
            bible_text=bible_text,
            voice_instructions=voice_instructions,
            steam_instructions=steam_instructions,
        )

        user_message = request.prompt
        if request.context_text:
            user_message = f"Context:\n{request.context_text}\n\n{user_message}"

        # 5. Stream response
        async for chunk in self._stream_claude(system_prompt, user_message):
            yield chunk

    async def execute_slash_command(
        self,
        command: str,
        chapter_id: uuid.UUID,
        context_text: str,
        user_id: str,
        parameters: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        """Route a slash command to the appropriate prompt template and stream."""
        # Load chapter for context
        result = await self.db.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = result.scalar_one_or_none()

        chapter_context = ""
        if chapter:
            chapter_context = (
                f"Chapter {chapter.number}: {chapter.title}\n"
                f"Current text:\n{chapter.content_text[:2000]}"
            )

        # Get the prompt template for this command
        template = SLASH_COMMAND_TEMPLATES.get(
            command.lstrip("/"), SLASH_COMMAND_TEMPLATES.get("draft", "")
        )

        user_message = template.format(
            context=context_text or chapter_context,
            parameters=parameters or {},
        )

        system_prompt = SYSTEM_PROMPT_MUSE

        async for chunk in self._stream_claude(system_prompt, user_message):
            yield chunk

    # ── Private helpers ───────────────────────────────────────────────

    async def _stream_claude(
        self, system_prompt: str, user_message: str
    ) -> AsyncGenerator[str, None]:
        """Open a streaming request to Claude and yield text deltas."""
        async with self.client.messages.stream(
            model=self.MODEL,
            max_tokens=self.MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def _load_voice_instructions(
        self, profile_id: uuid.UUID, user_id: str
    ) -> str:
        result = await self.db.execute(
            select(VoiceProfile).where(
                VoiceProfile.id == profile_id,
                VoiceProfile.user_id == uuid.UUID(user_id),
            )
        )
        profile = result.scalar_one_or_none()
        if profile and profile.fingerprint:
            fp = profile.fingerprint
            parts = [
                f"Voice Profile: {profile.name}",
                f"Sentence structure: {fp.get('sentence_structure', 'varied')}",
                f"Vocabulary level: {fp.get('vocabulary_level', 'moderate')}",
                f"Tone: {fp.get('tone', 'neutral')}",
                f"Pacing: {fp.get('pacing', 'moderate')}",
                f"Distinctive patterns: {fp.get('distinctive_patterns', 'none identified')}",
            ]
            return "\n".join(parts)
        return ""

    async def _load_steam_instructions(self, project_id: uuid.UUID) -> str:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = result.scalar_one_or_none()
        if project and project.settings:
            heat_level = project.settings.get("steam_calibration", {}).get(
                "heat_level", 3
            )
            return self.steam_calibrator.get_steam_instructions(heat_level)
        return self.steam_calibrator.get_steam_instructions(3)

    @staticmethod
    def _format_bible_context(results: list[dict]) -> str:
        if not results:
            return ""
        parts = ["### Story Bible Context"]
        for r in results:
            parts.append(
                f"[{r.get('content_type', 'unknown')}] {r.get('content_text', '')[:500]}"
            )
        return "\n\n".join(parts)

    @staticmethod
    def _build_system_prompt(
        bible_text: str,
        voice_instructions: str,
        steam_instructions: str,
    ) -> str:
        sections = [SYSTEM_PROMPT_MUSE]
        if bible_text:
            sections.append(bible_text)
        if voice_instructions:
            sections.append(f"### Author Voice Instructions\n{voice_instructions}")
        if steam_instructions:
            sections.append(f"### Steam / Heat Level Instructions\n{steam_instructions}")
        return "\n\n".join(sections)
