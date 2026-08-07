import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from utils import dedupe_papers, normalize_title, paper_display_date, stable_source_key


def test_normalize_title_removes_case_and_punctuation():
    assert normalize_title("Sensor Forecasting: Sequence Modeling!") == "sensor forecasting sequence modeling"


def test_stable_source_key_ignores_arxiv_version_suffix():
    assert stable_source_key({"source": "arxiv", "id": "2607.20033v3"}) == "arxiv:2607.20033"
    assert stable_source_key({"source": "arxiv", "id": "2607.20033"}) == "arxiv:2607.20033"


def test_paper_display_date_repairs_legacy_next_day_midnight():
    displayed = paper_display_date(
        {
            "published_at": "2026-07-17T00:00:00+00:00",
            "updated_at": "2026-07-16T03:59:44+00:00",
        }
    )

    assert displayed is not None
    assert displayed.date().isoformat() == "2026-07-16"


def test_dedupe_by_source_id_and_title():
    papers = [
        {
            "id": "2605.1",
            "source": "arxiv",
            "title": "Sensor Forecasting Sequence Modeling",
            "authors": ["Alice"],
            "abstract": "short",
            "url": "a",
            "pdf_url": "",
            "published_at": "",
            "updated_at": "",
            "venue": "arXiv",
            "categories": ["cs.LG"],
        },
        {
            "id": "2605.1",
            "source": "arxiv",
            "title": "Sensor Forecasting Sequence Modeling",
            "authors": ["Bob"],
            "abstract": "a much longer abstract",
            "url": "a",
            "pdf_url": "pdf",
            "published_at": "",
            "updated_at": "",
            "venue": "arXiv",
            "categories": ["q-bio.NC"],
        },
        {
            "id": "other",
            "source": "openreview",
            "title": "Sensor Forecasting: Sequence Modeling!",
            "authors": ["Carol"],
            "abstract": "duplicate by title",
            "url": "o",
            "pdf_url": "",
            "published_at": "",
            "updated_at": "",
            "venue": "ICLR",
            "categories": [],
        },
    ]

    deduped = dedupe_papers(papers)

    assert len(deduped) == 1
    assert set(deduped[0]["authors"]) == {"Alice", "Bob", "Carol"}
    assert "q-bio.NC" in deduped[0]["categories"]
    assert deduped[0]["abstract"] == "a much longer abstract"
    assert deduped[0]["pdf_url"] == "pdf"
