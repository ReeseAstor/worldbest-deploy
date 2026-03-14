"""Line editor service – AI-powered prose improvement suggestions."""

from __future__ import annotations

import json
import logging
import uuid

import anthropic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.project import Chapter
from app.prompts.editing import LINE_EDIT_SYSTEM_PROMPT, EDIT_TYPE_PROMPTS

logger = logging.getLogger("ember.line_editor")

# Default edit categories to check
DEFAULT_EDIT_TYPES = [
    "filter_words",
    "show_dont_tell",
    "dialogue_tags",
    "pov_consistency",
]


class LineEditor:
    """Send chapter text to Claude for line-level editing suggestions."""

    MODEL = "claude-sonnet-4-20250514"

    def __init__(self, db: AsyncSession, settings: Settings) -> None:
        self.db = db
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def analyze_chapter(
        self,
        chapter_id: uuid.UUID,
        edit_types: list[str] | None = None,
    ) -> list[dict]:
        """Analyze a chapter's text and return a list of edit suggestions.

        Each suggestion dict contains:
        - id: unique suggestion identifier
        - edit_type: category of the edit
        - original_text: the text span to change
        - suggested_text: the improved version
        - explanation: why this change is recommended
        - position: optional positional info (paragraph index, etc.)
        """
        result = await self.db.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = result.scalar_one_or_none()
        if chapter is None:
            raise ValueError(f"Chapter {chapter_id} not found")

        if not chapter.content_text or not chapter.content_text.strip():
            return []

        types_to_check = edit_types or DEFAULT_EDIT_TYPES
        all_suggestions: list[dict] = []

        for edit_type in types_to_check:
            prompt_template = EDIT_TYPE_PROMPTS.get(edit_type)
            if not prompt_template:
                logger.warning("Unknown edit type: %s", edit_type)
                continue

            user_message = prompt_template.format(text=chapter.content_text[:8000])

            try:
                response = await self.client.messages.create(
                    model=self.MODEL,
                    max_tokens=2048,
                    system=LINE_EDIT_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_message}],
                )

                raw = response.content[0].text.strip()
                suggestions = self._parse_suggestions(raw, edit_type)
                all_suggestions.extend(suggestions)

            except Exception as exc:
                logger.error("Line edit analysis failed for %s: %s", edit_type, exc)

        return all_suggestions

    @staticmethod
    def _parse_suggestions(raw_text: str, edit_type: str) -> list[dict]:
        """Parse Claude's JSON response into a list of suggestion dicts."""
        try:
            # Handle markdown code fences
            text = raw_text
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1])

            data = json.loads(text)

            if isinstance(data, list):
                suggestions = data
            elif isinstance(data, dict) and "suggestions" in data:
                suggestions = data["suggestions"]
            else:
                return []

            result = []
            for i, s in enumerate(suggestions):
                result.append(
                    {
                        "id": f"{edit_type}_{i}_{uuid.uuid4().hex[:8]}",
                        "edit_type": edit_type,
                        "original_text": s.get("original", s.get("original_text", "")),
                        "suggested_text": s.get("suggestion", s.get("suggested_text", "")),
                        "explanation": s.get("explanation", s.get("reason", "")),
                        "position": s.get("position"),
                    }
                )
            return result

        except json.JSONDecodeError:
            logger.warning("Could not parse line edit suggestions as JSON")
            return [
                {
                    "id": f"{edit_type}_raw_{uuid.uuid4().hex[:8]}",
                    "edit_type": edit_type,
                    "original_text": "",
                    "suggested_text": "",
                    "explanation": raw_text[:500],
                    "position": None,
                }
            ]
