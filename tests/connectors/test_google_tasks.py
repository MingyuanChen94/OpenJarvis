"""Tests for GoogleTasksConnector — Google Tasks API v1."""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import patch

import pytest

from openjarvis.core.registry import ConnectorRegistry


def test_google_tasks_registered():
    from openjarvis.connectors.google_tasks import GoogleTasksConnector

    ConnectorRegistry.register_value("google_tasks", GoogleTasksConnector)
    assert ConnectorRegistry.contains("google_tasks")
    cls = ConnectorRegistry.get("google_tasks")
    assert cls.connector_id == "google_tasks"
    assert cls.display_name == "Google Tasks"
    assert cls.auth_type == "oauth"


_TASK_LISTS_RESPONSE = {"items": [{"id": "list1", "title": "My Tasks"}]}

_TASKS_RESPONSE = {
    "items": [
        {
            "id": "task1",
            "title": "Review PR #42",
            "notes": "Check the auth middleware changes",
            "status": "needsAction",
            "due": "2026-04-01T00:00:00.000Z",
            "updated": "2026-03-31T20:00:00.000Z",
            "selfLink": "https://tasks.googleapis.com/tasks/v1/lists/list1/tasks/task1",
        },
        {
            "id": "task2",
            "title": "Submit expense report",
            "notes": "",
            "status": "completed",
            "due": "2026-03-31T00:00:00.000Z",
            "completed": "2026-03-31T15:00:00.000Z",
            "updated": "2026-03-31T15:00:00.000Z",
            "selfLink": "https://tasks.googleapis.com/tasks/v1/lists/list1/tasks/task2",
        },
    ]
}


@pytest.fixture()
def connector(tmp_path):
    from openjarvis.connectors.google_tasks import GoogleTasksConnector

    creds = tmp_path / "google_tasks.json"
    creds.write_text('{"token": "fake-token"}', encoding="utf-8")
    return GoogleTasksConnector(credentials_path=str(creds))


def test_sync_yields_tasks(connector):
    with patch(
        "openjarvis.connectors.google_tasks._tasks_api_get",
        side_effect=[_TASK_LISTS_RESPONSE, _TASKS_RESPONSE],
    ):
        docs = list(connector.sync(since=datetime(2026, 3, 31)))

    assert len(docs) == 2
    assert docs[0].source == "google_tasks"
    assert docs[0].doc_type == "task"
    assert docs[0].title == "Review PR #42"
    assert docs[0].metadata["status"] == "needsAction"
    assert docs[1].metadata["status"] == "completed"


def test_updated_min_param_well_formed_for_aware_datetime(connector):
    """Regression: an incremental sync passes a tz-aware UTC ``since``; the
    outbound ``updatedMin`` must be a single-``Z`` RFC 3339 value, not the
    malformed ``…+00:00Z`` that the Google Tasks API rejects."""
    captured: dict = {}

    def _fake_get(token, endpoint, params=None):
        if endpoint == "users/@me/lists":
            return _TASK_LISTS_RESPONSE
        captured["params"] = params
        return _TASKS_RESPONSE

    since = datetime(2026, 6, 17, 23, 18, 49, 990147, tzinfo=timezone.utc)
    with patch(
        "openjarvis.connectors.google_tasks._tasks_api_get",
        side_effect=_fake_get,
    ):
        list(connector.sync(since=since))

    sent = captured["params"]["updatedMin"]
    assert sent == "2026-06-17T23:18:49Z"  # old code emitted "...+00:00Z"
    assert "+00:00" not in sent
    assert sent.endswith("Z") and sent.count("Z") == 1
