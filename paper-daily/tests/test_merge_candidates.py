import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from merge_candidates import merge_candidate_files


def write_candidates(path: Path, papers: list[dict]) -> None:
    path.write_text(json.dumps(papers), encoding="utf-8")


def test_merge_candidates_deduplicates_and_caps_by_score(tmp_path):
    first = tmp_path / "first.json"
    second = tmp_path / "second.json"
    write_candidates(
        first,
        [
            {"source": "arxiv", "id": "1", "title": "One", "coarse_retrieval_score": 3},
            {"source": "arxiv", "id": "2", "title": "Two", "coarse_retrieval_score": 2},
        ],
    )
    write_candidates(
        second,
        [
            {"source": "arxiv", "id": "1", "title": "One", "coarse_retrieval_score": 5},
            {"source": "arxiv", "id": "3", "title": "Three", "coarse_retrieval_score": 4},
        ],
    )

    merged = merge_candidate_files([first, second], limit=2)

    assert [paper["id"] for paper in merged] == ["1", "3"]
    assert merged[0]["coarse_retrieval_score"] == 5
