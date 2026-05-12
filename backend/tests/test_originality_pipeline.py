from __future__ import annotations

from types import SimpleNamespace

import asyncio

from app.services.originality_pipeline import OriginalityPipeline


class StubPipeline(OriginalityPipeline):
    def __init__(self, settings, scores: list[float], matches: list[int]) -> None:
        super().__init__(settings=settings)
        self._scores = scores
        self._matches = matches
        self.rewrite_calls = 0

    async def _get_ai_detection_score(self, text: str) -> float:
        idx = min(self.rewrite_calls, len(self._scores) - 1)
        return self._scores[idx]

    async def _get_copyscape_matches(self, text: str) -> int:
        idx = min(self.rewrite_calls, len(self._matches) - 1)
        return self._matches[idx]

    async def _rewrite_text(self, text: str) -> str:
        self.rewrite_calls += 1
        return f"{text} [rewrite-{self.rewrite_calls}]"


def test_review_passes_without_rewrite() -> None:
    settings = SimpleNamespace(
        ORIGINALITY_MAX_REWRITE_LOOPS=3,
        ORIGINALITY_AI_SCORE_THRESHOLD=20.0,
        COPYSCAPE_MATCH_THRESHOLD=0,
    )
    pipeline = StubPipeline(settings=settings, scores=[10.0], matches=[0])

    result = asyncio.run(pipeline.review("chapter text"))

    assert result.passed is True
    assert result.rewrites == 0
    assert result.ai_score == 10.0
    assert result.copyscape_matches == 0


def test_review_stops_after_max_rewrites() -> None:
    settings = SimpleNamespace(
        ORIGINALITY_MAX_REWRITE_LOOPS=2,
        ORIGINALITY_AI_SCORE_THRESHOLD=20.0,
        COPYSCAPE_MATCH_THRESHOLD=0,
    )
    pipeline = StubPipeline(
        settings=settings, scores=[90.0, 75.0, 60.0], matches=[0, 0, 0]
    )

    result = asyncio.run(pipeline.review("chapter text"))

    assert result.passed is False
    assert result.rewrites == 2
    assert pipeline.rewrite_calls == 2
    assert "rewrite-2" in result.text
