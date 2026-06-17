"""Shared time-formatting helpers for connector outbound API params."""

from __future__ import annotations

from datetime import datetime, timezone

__all__ = ["to_utc_z"]


def to_utc_z(dt: datetime) -> str:
    """Format *dt* as an RFC 3339 / ISO 8601 UTC timestamp with a ``Z`` suffix.

    Many APIs (GitHub notifications ``since``, Google Tasks ``updatedMin``, …)
    expect a value like ``2026-06-18T00:00:00Z`` — a single trailing ``Z``
    designator with **no** numeric offset and no fractional seconds.

    A timezone-aware *dt* is normalized to UTC before formatting.  A naive
    *dt* is assumed to already be UTC and is formatted as-is — it is **not**
    shifted — so a caller passing a naive wall-clock value gets a stable
    result regardless of the host's local timezone.

    This avoids the ``f"{dt.isoformat()}Z"`` trap: a tz-aware ``isoformat()``
    already emits ``+00:00``, so appending ``Z`` produces the invalid
    ``…+00:00Z`` that APIs reject.
    """
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
