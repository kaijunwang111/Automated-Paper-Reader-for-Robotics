"""Rebuild natural-day candidate pools from saved fetch artifacts.

This backfill utility reads only raw/candidate metadata.  It never reads prior
scores, reports, or selected-paper modules, so a rerun cannot inherit an old
editorial choice.
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any

import yaml

from rank_papers import build_candidate_pool
from utils import paper_display_date, read_json, stable_source_key, write_json_atomic


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Rebuild exact-day candidate files from saved metadata.")
    parser.add_argument("--config", default="config.yaml")
    parser.add_argument("--date", action="append", required=True, help="Natural day in YYYY-MM-DD; repeatable")
    parser.add_argument("--processed-dir", default="data/processed")
    parser.add_argument("--raw-dir", default="data/raw")
    return parser.parse_args()


def load_saved_papers(processed_dir: Path, raw_dir: Path) -> list[dict[str, Any]]:
    papers: dict[str, dict[str, Any]] = {}
    paths = sorted(processed_dir.glob("*_candidates.json")) + sorted(raw_dir.glob("*.json"))
    for path in paths:
        try:
            payload = read_json(path)
        except json.JSONDecodeError:
            payload = json.loads(path.read_text(encoding="utf-8-sig"))
        items = payload if isinstance(payload, list) else payload.get("papers", []) if isinstance(payload, dict) else []
        for item in items:
            if not isinstance(item, dict):
                continue
            key = stable_source_key(item) or str(item.get("title") or "")
            if key:
                papers[key] = merge_saved_record(papers.get(key), item)
    return list(papers.values())


def merge_saved_record(existing: dict[str, Any] | None, incoming: dict[str, Any]) -> dict[str, Any]:
    if existing is None:
        return dict(incoming)
    result = dict(existing)
    existing_date = paper_display_date(existing)
    incoming_date = paper_display_date(incoming)
    if incoming_date and (existing_date is None or incoming_date < existing_date):
        result["published_at"] = incoming.get("published_at") or incoming.get("updated_at")
    if len(str(incoming.get("abstract") or "")) > len(str(result.get("abstract") or "")):
        result["abstract"] = incoming.get("abstract")
    result["categories"] = sorted(set(result.get("categories", [])) | set(incoming.get("categories", [])))
    return result


def exact_day_papers(papers: list[dict[str, Any]], target: date) -> list[dict[str, Any]]:
    result = []
    for paper in papers:
        published = paper_display_date(paper)
        if published and published.date() == target:
            result.append(paper)
    return result


def main() -> None:
    args = parse_args()
    config_path = Path(args.config).resolve()
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    processed_dir = (config_path.parent / args.processed_dir).resolve()
    raw_dir = (config_path.parent / args.raw_dir).resolve()
    saved = load_saved_papers(processed_dir, raw_dir)
    daily_limit = int(config.get("retrieval", {}).get("daily_candidate_limit", 200))

    for value in args.date:
        target = date.fromisoformat(value)
        day_papers = exact_day_papers(saved, target)
        candidates = build_candidate_pool(
            day_papers,
            config.get("research_profile", {}),
            target,
            candidate_limit=daily_limit,
        )
        output = processed_dir / f"{value}_candidates.json"
        write_json_atomic(output, candidates)
        print(f"{value}: source={len(day_papers)} candidates={len(candidates)} output={output}")


if __name__ == "__main__":
    main()
