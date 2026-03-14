"""Bible retriever – pgvector semantic search over story-bible embeddings."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.embedding import Embedding

logger = logging.getLogger("ember.bible_retriever")


class BibleRetriever:
    """Retrieve relevant story-bible context using pgvector cosine similarity."""

    def __init__(self, db: AsyncSession, settings: Settings) -> None:
        self.db = db
        self.settings = settings

    async def retrieve_context(
        self,
        project_id: uuid.UUID,
        query: str,
        content_types: list[str] | None = None,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Find the top-k most relevant bible entries for *query*.

        Steps:
        1. Generate an embedding vector for the query text.
        2. Run a pgvector cosine-similarity search filtered by project.
        3. Return results with content text and relevance score.
        """
        query_embedding = await self._generate_embedding(query)
        if query_embedding is None:
            logger.warning("Could not generate embedding for query; returning empty.")
            return []

        # Build the similarity query
        embedding_literal = f"[{','.join(str(v) for v in query_embedding)}]"

        type_filter = ""
        if content_types:
            types_str = ",".join(f"'{t}'" for t in content_types)
            type_filter = f"AND content_type IN ({types_str})"

        sql = text(f"""
            SELECT
                id,
                content_type,
                content_id,
                content_text,
                metadata,
                1 - (embedding <=> :embedding::vector) AS score
            FROM embeddings
            WHERE project_id = :project_id
            {type_filter}
            ORDER BY embedding <=> :embedding::vector
            LIMIT :limit
        """)

        result = await self.db.execute(
            sql,
            {
                "project_id": str(project_id),
                "embedding": embedding_literal,
                "limit": limit,
            },
        )

        rows = result.fetchall()
        return [
            {
                "id": str(row.id),
                "content_type": row.content_type,
                "content_id": str(row.content_id),
                "content_text": row.content_text,
                "metadata": row.metadata,
                "score": float(row.score) if row.score else 0.0,
            }
            for row in rows
        ]

    async def _generate_embedding(self, text_input: str) -> list[float] | None:
        """Generate an embedding vector for the given text.

        Uses the Anthropic-compatible embedding or a placeholder.
        In production, swap this for your embedding provider
        (e.g. OpenAI text-embedding-3-small, Voyage, etc.).
        """
        try:
            import httpx

            # Example: using a hypothetical /v1/embeddings endpoint
            # Replace with your actual embedding provider
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.voyageai.com/v1/embeddings",
                    headers={"Authorization": f"Bearer {self.settings.ANTHROPIC_API_KEY}"},
                    json={
                        "model": "voyage-3",
                        "input": text_input,
                    },
                    timeout=30.0,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data["data"][0]["embedding"]
                else:
                    logger.warning(
                        "Embedding request failed with status %s", resp.status_code
                    )
                    return None
        except Exception as exc:
            logger.warning("Embedding generation failed: %s", exc)
            return None
