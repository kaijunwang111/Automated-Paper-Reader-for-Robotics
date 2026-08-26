import sys
from datetime import date
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from fresh_oai_backfill import ensure_window_ready


def test_all_zero_window_is_treated_as_unavailable_batch():
    targets = [date(2026, 8, 21), date(2026, 8, 22), date(2026, 8, 23)]

    with pytest.raises(RuntimeError, match="incomplete/unavailable announcement batch"):
        ensure_window_ready({}, targets, allow_empty_window=False)


def test_nonempty_window_passes_readiness_gate():
    targets = [date(2026, 8, 21), date(2026, 8, 22), date(2026, 8, 23)]
    by_day = {date(2026, 8, 22): [{"id": "2608.00001"}]}

    ensure_window_ready(by_day, targets, allow_empty_window=False)


def test_empty_window_requires_explicit_manual_override():
    targets = [date(2026, 8, 21)]

    ensure_window_ready({}, targets, allow_empty_window=True)
