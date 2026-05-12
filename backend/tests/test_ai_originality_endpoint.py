from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.dependencies import get_current_user
from app.routers import ai


def create_test_app() -> FastAPI:
    app = FastAPI()
    app.include_router(ai.router, prefix="/api/v1")
    app.dependency_overrides[get_current_user] = (
        lambda: "00000000-0000-0000-0000-000000000000"
    )
    return app


def test_enqueue_originality_review(monkeypatch) -> None:
    app = create_test_app()
    monkeypatch.setattr(ai, "_enqueue_originality_task", lambda _text: "task-123")

    client = TestClient(app)
    response = client.post("/api/v1/ai/originality/review", json={"text": "hello"})

    assert response.status_code == 202
    assert response.json() == {"task_id": "task-123", "status": "queued"}


def test_get_originality_review_status(monkeypatch) -> None:
    app = create_test_app()
    monkeypatch.setattr(
        ai, "_fetch_originality_task", lambda _task_id: ("SUCCESS", {"passed": True})
    )

    client = TestClient(app)
    response = client.get("/api/v1/ai/originality/review/task-123")

    assert response.status_code == 200
    assert response.json() == {
        "task_id": "task-123",
        "status": "SUCCESS",
        "result": {"passed": True},
    }
