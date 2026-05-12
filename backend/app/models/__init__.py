"""Import all models so Alembic (and ``Base.metadata``) can discover them."""

from app.models.user import User  # noqa: F401
from app.models.project import Project, Book, Chapter  # noqa: F401
from app.models.character import Character  # noqa: F401
from app.models.location import Location  # noqa: F401
from app.models.voice_profile import VoiceProfile  # noqa: F401
from app.models.embedding import Embedding  # noqa: F401

__all__ = [
    "User",
    "Project",
    "Book",
    "Chapter",
    "Character",
    "Location",
    "VoiceProfile",
    "Embedding",
]
