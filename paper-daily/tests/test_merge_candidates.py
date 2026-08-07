import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from merge_candidates import merge_candidate_files


def write_candidates(path: Path, papers: list[dict]) -> None:
    path.write_text(json.dumps(papers), encoding="utf-8")


def test_merge_candidates_deduplicates_without_a_window_cap(tmp_path):
    first = tmp_path / "first.json"
    second = tmp_path / "second.json"
    write_candidates(
        first,
        [
            {"source": "arxiv", "id": "1", "title": "One", "recall_tier": "P1"},
            {"source": "arxiv", "id": "2", "title": "Two", "recall_tier": "P2"},
        ],
    )
    write_candidates(
        second,
        [
            {"source": "arxiv", "id": "1", "title": "One", "recall_tier": "P0"},
            {"source": "arxiv", "id": "3", "title": "Three", "recall_tier": "P1"},
        ],
    )

    merged = merge_candidate_files([first, second])

    assert [paper["id"] for paper in merged] == ["1", "3", "2"]
    assert merged[0]["recall_tier"] == "P0"


def test_compatibility_limit_is_optional_and_not_keyword_count_based(tmp_path):
    path = tmp_path / "daily.json"
    write_candidates(
        path,
        [
            {"source": "arxiv", "id": "p2", "title": "Keyword Stuffed", "recall_tier": "P2", "keyword_score": 99},
            {"source": "arxiv", "id": "p0", "title": "Decisive", "recall_tier": "P0", "keyword_score": 1},
        ],
    )

    merged = merge_candidate_files([path], limit=1)

    assert [paper["id"] for paper in merged] == ["p0"]
