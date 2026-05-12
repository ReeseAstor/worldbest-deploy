"""Originality review pipeline with bounded rewrite loop."""

from __future__ import annotations

from dataclasses import dataclass

import httpx

from app.config import Settings


@dataclass
class OriginalityReviewResult:
    """Final output of originality + duplicate checks."""

    text: str
    ai_score: float
    copyscape_matches: int
    rewrites: int
    passed: bool


class OriginalityPipeline:
    """Checks generated text and applies rewrite retries when needed."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def review(self, text: str) -> OriginalityReviewResult:
        """Run originality checks and rewrite loop up to configured max attempts."""
        working_text = text

        for rewrite_count in range(self.settings.ORIGINALITY_MAX_REWRITE_LOOPS + 1):
            ai_score = await self._get_ai_detection_score(working_text)
            copyscape_matches = await self._get_copyscape_matches(working_text)
            passed = (
                ai_score <= self.settings.ORIGINALITY_AI_SCORE_THRESHOLD
                and copyscape_matches <= self.settings.COPYSCAPE_MATCH_THRESHOLD
            )
            if passed:
                return OriginalityReviewResult(
                    text=working_text,
                    ai_score=ai_score,
                    copyscape_matches=copyscape_matches,
                    rewrites=rewrite_count,
                    passed=True,
                )

            if rewrite_count == self.settings.ORIGINALITY_MAX_REWRITE_LOOPS:
                return OriginalityReviewResult(
                    text=working_text,
                    ai_score=ai_score,
                    copyscape_matches=copyscape_matches,
                    rewrites=rewrite_count,
                    passed=False,
                )

            working_text = await self._rewrite_text(working_text)

        return OriginalityReviewResult(
            text=working_text,
            ai_score=100.0,
            copyscape_matches=999,
            rewrites=self.settings.ORIGINALITY_MAX_REWRITE_LOOPS,
            passed=False,
        )

    async def _get_ai_detection_score(self, text: str) -> float:
        """Call a configurable mock originality endpoint; fallback to heuristic score."""
        payload = {"text": text}
        if not self.settings.ORIGINALITY_MOCK_API_URL:
            return self._heuristic_ai_score(text)

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                self.settings.ORIGINALITY_MOCK_API_URL, json=payload
            )
            response.raise_for_status()
            data = response.json()
            return float(data.get("ai_score", self._heuristic_ai_score(text)))

    async def _get_copyscape_matches(self, text: str) -> int:
        """Call a configurable mock copyscape endpoint; fallback to no matches."""
        payload = {"text": text}
        if not self.settings.COPYSCAPE_MOCK_API_URL:
            return 0

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                self.settings.COPYSCAPE_MOCK_API_URL, json=payload
            )
            response.raise_for_status()
            data = response.json()
            return int(data.get("matches", 0))

    async def _rewrite_text(self, text: str) -> str:
        """Rewrite helper.

        This placeholder intentionally avoids provider-specific implementation details
        and can later be swapped for a dedicated LLM rewrite endpoint.
        """
        if not self.settings.REWRITE_MOCK_API_URL:
            return f"{text}\n\n[rewrite-pass]"

        payload = {
            "text": text,
            "instruction": (
                "Rewrite for stronger voice variation, sensory specificity, and lower repetition."
            ),
        }
        async with httpx.AsyncClient(timeout=40) as client:
            response = await client.post(
                self.settings.REWRITE_MOCK_API_URL, json=payload
            )
            response.raise_for_status()
            data = response.json()
            return str(data.get("text", text))

    @staticmethod
    def _heuristic_ai_score(text: str) -> float:
        """Basic fallback heuristic used when no mock scorer is configured."""
        words = len(text.split())
        unique_words = len(set(text.lower().split())) or 1
        diversity = unique_words / max(words, 1)
        score = 100 - min(100, diversity * 140)
        return round(max(1.0, score), 2)
