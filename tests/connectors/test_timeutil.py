"""Tests for the shared connector time helper (``to_utc_z``)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from openjarvis.connectors._timeutil import to_utc_z


def test_naive_datetime_formatted_as_is() -> None:
    # A naive value is assumed UTC and must NOT be shifted by the host's tz.
    assert to_utc_z(datetime(2026, 4, 1, 0, 0, 0)) == "2026-04-01T00:00:00Z"


def test_aware_utc_datetime_drops_offset_and_fractional_seconds() -> None:
    dt = datetime(2026, 6, 17, 23, 18, 49, 990147, tzinfo=timezone.utc)
    out = to_utc_z(dt)
    assert out == "2026-06-17T23:18:49Z"
    assert "+00:00" not in out
    assert out.endswith("Z") and out.count("Z") == 1


def test_aware_non_utc_datetime_converted_to_utc() -> None:
    # 2026-06-18T01:00:00+02:00 == 2026-06-17T23:00:00Z
    dt = datetime(2026, 6, 18, 1, 0, 0, tzinfo=timezone(timedelta(hours=2)))
    assert to_utc_z(dt) == "2026-06-17T23:00:00Z"
