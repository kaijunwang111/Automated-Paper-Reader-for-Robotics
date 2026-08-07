"""Merge already-bounded daily candidate files without a window-wide cutoff."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from utils import normalize_title, read_json, stable_source_key, write_json_atomic


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Merge and deduplicate candidate JSON files.")
    parser.add_argument("inputs", nargs="+", help="Candidate JSON files in chronological order")
    parser.add_argument("--output", required=True, help="Output JSON file")
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Optional compatibility cap; production windows should omit it",
    )
    return parser.parse_args()


def candidate_identity(paper: dict[str, Any]) -> str:
    return stable_source_key(paper) or f"title:{normalize_title(str(paper.get('title', '')))}"


TIER_PRIORITY = {"P0": 3, "P1": 2, "P2": 1, "reject": 0}


def candidate_sort_key(paper: dict[str, Any]) -> tuple[int, str, str]:
    return (
        TIER_PRIORITY.get(str(paper.get("recall_tier") or "P2"), 1),
        str(paper.get("published_at") or paper.get("updated_at") or ""),
        str(paper.get("title") or ""),
    )


def merge_candidate_files(paths: list[Path], limit: int | None = None) -> list[dict[str, Any]]:
    by_identity: dict[str, dict[str, Any]] = {}
    for path in paths:
        payload = read_json(path)
        if not isinstance(payload, list):
            raise ValueError(f"Candidate file must contain a JSON list: {path}")
        for raw_paper in payload:
            if not isinstance(raw_paper, dict):
                continue
            identity = candidate_identity(raw_paper)
            existing = by_identity.get(identity)
            if existing is None or candidate_sort_key(raw_paper) > candidate_sort_key(existing):
                by_identity[identity] = dict(raw_paper)

    merged = sorted(by_identity.values(), key=candidate_sort_key, reverse=True)
    if limit is None:
        return merged
    return merged[: max(0, int(limit))]


def main() -> None:
    args = parse_args()
    input_paths = [Path(value).resolve() for value in args.inputs]
    output_path = Path(args.output).resolve()
    merged = merge_candidate_files(input_paths, args.limit)
    write_json_atomic(output_path, merged)
    print(f"Merged candidates: {len(merged)}")
    print(f"Output: {output_path}")


if __name__ == "__main__":
    main()
