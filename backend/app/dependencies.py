"""Shared FastAPI dependencies (authentication, etc.)."""

from __future__ import annotations

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from app.config import get_settings


async def get_current_user(authorization: str = Header(...)) -> str:
    """Decode a Supabase-issued JWT from the ``Authorization`` header.

    Expects a header value like ``Bearer <token>``.  Returns the user id
    (the ``sub`` claim) on success or raises a 401 otherwise.
    """
    settings = get_settings()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Strip the "Bearer " prefix if present.
    token = authorization
    if token.lower().startswith("bearer "):
        token = token[7:]

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return user_id
