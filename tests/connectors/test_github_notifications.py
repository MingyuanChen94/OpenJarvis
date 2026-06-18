"""Tests for GitHubNotificationsConnector — GitHub REST API."""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import patch

import pytest

from openjarvis.connectors._stubs import Document
from openjarvis.core.registry import ConnectorRegistry


def test_github_notifications_registered():
    """GitHubNotificationsConnector is discoverable via ConnectorRegistry."""
    from openjarvis.connectors.github_notifications import (
        GitHubNotificationsConnector,
    )

    ConnectorRegistry.register_value(
        "github_notifications", GitHubNotificationsConnector
    )
    assert ConnectorRegistry.contains("github_notifications")
    cls = ConnectorRegistry.get("github_notifications")
    assert cls.connector_id == "github_notifications"
    assert cls.auth_type == "token"


_NOTIFICATIONS_RESPONSE = [
    {
        "id": "1001",
        "reason": "review_requested",
        "updated_at": "2026-04-01T10:00:00Z",
        "subject": {
            "title": "Add caching layer to inference engine",
            "type": "PullRequest",
            "url": "https://api.github.com/repos/org/repo/pulls/42",
        },
        "repository": {"full_name": "org/repo"},
    },
    {
        "id": "1002",
        "reason": "mention",
        "updated_at": "2026-04-01T11:30:00Z",
        "subject": {
            "title": "Bug: memory leak in long sessions",
            "type": "Issue",
            "url": "https://api.github.com/repos/org/repo/issues/99",
        },
        "repository": {"full_name": "org/repo"},
    },
]


@pytest.fixture()
def connector(tmp_path):
    """GitHubNotificationsConnector with fake token file."""
    from openjarvis.connectors.github_notifications import (
        GitHubNotificationsConnector,
    )

    token_path = tmp_path / "github.json"
    token_path.write_text('{"token": "ghp_fake123"}', encoding="utf-8")
    return GitHubNotificationsConnector(token_path=str(token_path))


def test_is_connected(connector):
    assert connector.is_connected() is True


def test_is_connected_no_file(tmp_path):
    from openjarvis.connectors.github_notifications import (
        GitHubNotificationsConnector,
    )

    c = GitHubNotificationsConnector(token_path=str(tmp_path / "missing.json"))
    assert c.is_connected() is False


def test_sync_yields_documents(connector):
    """Sync returns Documents for each notification."""
    with patch(
        "openjarvis.connectors.github_notifications._github_api_get",
        return_value=_NOTIFICATIONS_RESPONSE,
    ):
        docs = list(connector.sync(since=datetime(2026, 4, 1)))

    assert len(docs) == 2
    assert all(isinstance(d, Document) for d in docs)

    pr_doc = docs[0]
    assert pr_doc.source == "github_notifications"
    assert pr_doc.title == "Add caching layer to inference engine"
    assert "review_requested" in pr_doc.content
    assert pr_doc.metadata["repo"] == "org/repo"
    assert pr_doc.metadata["type"] == "PullRequest"

    issue_doc = docs[1]
    assert issue_doc.title == "Bug: memory leak in long sessions"
    assert issue_doc.metadata["reason"] == "mention"


def test_disconnect(connector):
    connector.disconnect()
    assert connector.is_connected() is False


def test_since_param_well_formed_for_aware_datetime(connector):
    """Regression: an incremental sync passes a tz-aware UTC ``since`` (as the
    SyncEngine checkpoint produces); the outbound ``since`` param must be a
    single-``Z`` RFC 3339 value, not the malformed ``…+00:00Z``."""
    captured: dict = {}

    def _fake_get(token, params=None):
        captured["params"] = params
        return _NOTIFICATIONS_RESPONSE

    # Mirrors sync_engine: datetime.now(tz=timezone.utc) reloaded via fromisoformat.
    since = datetime(2026, 6, 17, 23, 18, 49, 990147, tzinfo=timezone.utc)
    with patch(
        "openjarvis.connectors.github_notifications._github_api_get",
        side_effect=_fake_get,
    ):
        list(connector.sync(since=since))

    sent = captured["params"]["since"]
    assert sent == "2026-06-17T23:18:49Z"  # old code emitted "...+00:00Z"
    assert "+00:00" not in sent
    assert sent.endswith("Z") and sent.count("Z") == 1


def test_since_param_naive_datetime_not_shifted(connector):
    """A naive first-sync ``since`` must be formatted as-is (no local-tz shift)."""
    captured: dict = {}

    def _fake_get(token, params=None):
        captured["params"] = params
        return _NOTIFICATIONS_RESPONSE

    with patch(
        "openjarvis.connectors.github_notifications._github_api_get",
        side_effect=_fake_get,
    ):
        list(connector.sync(since=datetime(2026, 4, 1)))

    assert captured["params"]["since"] == "2026-04-01T00:00:00Z"
