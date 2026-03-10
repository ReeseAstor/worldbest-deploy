"""Voice analysis service – sends writing samples to Claude for fingerprinting."""

from __future__ import annotations

import json
import logging

import anthropic

from app.config import Settings
from app.prompts.voice import VOICE_ANALYSIS_PROMPT

logger = logging.getLogger("ember.voice_analyzer")


class VoiceAnalyzer:
    """Analyse writing samples and produce a structured voice fingerprint."""

    MODEL = "claude-sonnet-4-20250514"

    def __init__(self, settings: Settings) -> None:
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def analyze(self, sample_texts: list[str]) -> dict:
        """Send sample texts to Claude and return a VoiceFingerprint dict.

        The fingerprint includes:
        - sentence_structure: description of typical sentence patterns
        - vocabulary_level: simple / moderate / advanced / literary
        - tone: e.g. "warm and conversational", "dark and brooding"
        - pacing: slow / moderate / fast / varied
        - dialogue_style: description of dialogue tendencies
        - description_style: how settings / characters are described
        - distinctive_patterns: unique quirks or habits
        - pov_tendency: first / third-close / third-omniscient / mixed
        - emotional_range: how emotions are conveyed
        """
        combined_samples = "\n\n---\n\n".join(sample_texts)

        user_message = VOICE_ANALYSIS_PROMPT.format(samples=combined_samples)

        response = await self.client.messages.create(
            model=self.MODEL,
            max_tokens=2048,
            system=(
                "You are a literary voice analyst. Analyze the provided writing "
                "samples and return a JSON object describing the author's voice "
                "fingerprint. Return ONLY valid JSON, no other text."
            ),
            messages=[{"role": "user", "content": user_message}],
        )

        raw_text = response.content[0].text.strip()

        # Parse the JSON response from Claude
        try:
            # Handle potential markdown code fences
            if raw_text.startswith("```"):
                lines = raw_text.split("\n")
                raw_text = "\n".join(lines[1:-1])
            fingerprint = json.loads(raw_text)
        except json.JSONDecodeError:
            logger.warning("Failed to parse voice fingerprint JSON, returning raw")
            fingerprint = {
                "raw_analysis": raw_text,
                "sentence_structure": "varied",
                "vocabulary_level": "moderate",
                "tone": "neutral",
                "pacing": "moderate",
                "dialogue_style": "natural",
                "description_style": "balanced",
                "distinctive_patterns": "none identified",
                "pov_tendency": "third-close",
                "emotional_range": "moderate",
            }

        return fingerprint
