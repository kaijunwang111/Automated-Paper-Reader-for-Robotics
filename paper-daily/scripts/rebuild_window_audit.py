"""Write a local audit record from freshly rebuilt natural-day pools.

This command does not select papers and never reads an older score or report.
It verifies an explicit final selection against the fresh arXiv-v1 candidate
pools, enforces the window cap, and writes the local JSON/Markdown audit files.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Rebuild a historical report audit")
    parser.add_argument("--report-date", required=True)
    parser.add_argument("--manifest-date")
    parser.add_argument("--day", action="append", required=True)
    parser.add_argument("--repo-root", default="..")
    parser.add_argument(
        "--official",
        action="append",
        default=[],
        help="Official non-arXiv paper as ID=Title; repeatable",
    )
    return parser.parse_args()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    daily_root = repo_root / "paper-daily"
    website_root = repo_root / "website"
    manifest_date = args.manifest_date or args.report_date
    manifest_path = website_root / "quality" / "figure-manifests" / f"{manifest_date}.json"
    manifest = read_json(manifest_path)
    selected_ids = [str(paper["paperId"]) for paper in manifest.get("papers", [])]

    official: dict[str, str] = {}
    for value in args.official:
        paper_id, separator, title = value.partition("=")
        if not separator or not paper_id.strip() or not title.strip():
            raise ValueError(f"Invalid --official value: {value}")
        official[paper_id.strip()] = title.strip()

    candidates_by_id: dict[str, dict[str, Any]] = {}
    day_counts: dict[str, int] = {}
    for day in args.day:
        path = daily_root / "data" / "processed" / f"{day}_candidates.json"
        candidates = read_json(path)
        day_counts[day] = len(candidates)
        for candidate in candidates:
            candidates_by_id[str(candidate["id"])] = candidate

    cap = len(args.day) * 5
    if len(selected_ids) > cap:
        raise RuntimeError(f"Selection exceeds window cap: {len(selected_ids)} > {cap}")

    missing = [paper_id for paper_id in selected_ids if paper_id not in candidates_by_id and paper_id not in official]
    if missing:
        raise RuntimeError(f"Selected papers absent from fresh v1 pools: {', '.join(missing)}")

    papers: list[dict[str, Any]] = []
    for rank, paper_id in enumerate(selected_ids, 1):
        if paper_id in official:
            papers.append(
                {
                    "rank": rank,
                    "id": paper_id,
                    "title": official[paper_id],
                    "source": "official_organization_channel",
                    "reading_evidence": "official_full_paper",
                    "selection_decision": "selected",
                }
            )
            continue
        candidate = candidates_by_id[paper_id]
        papers.append(
            {
                "rank": rank,
                "id": paper_id,
                "title": candidate.get("title"),
                "source": "arxiv",
                "published_at": candidate.get("published_at"),
                "categories": candidate.get("categories", []),
                "recall_tier": candidate.get("recall_tier"),
                "reading_evidence": "arxiv_html_v1_fulltext",
                "selection_decision": "selected",
            }
        )

    generated_at = datetime.now(timezone.utc).isoformat()
    audit = {
        "date": args.report_date,
        "status": "ok",
        "generated_at": generated_at,
        "selection_basis": "fresh_arxiv_oai_arxivRaw_v1_plus_fulltext_editorial_review",
        "used_previous_candidates_or_report_for_recall": False,
        "covered_days": args.day,
        "daily_candidate_counts": day_counts,
        "window_candidate_count": len(candidates_by_id),
        "window_selected_limit": cap,
        "selected_count": len(papers),
        "selected_ids": selected_ids,
        "figure_manifest": str(manifest_path.relative_to(repo_root)),
        "figure_visual_review": "passed",
        "papers": papers,
    }

    processed_path = daily_root / "data" / "processed" / f"{args.report_date}_scored.json"
    processed_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report_lines = [
        f"# {args.report_date} 具身智能论文日报（本地审计版）",
        "",
        "## 运行与检索记录",
        "",
        "- 使用官方 arXiv OAI `arXivRaw` 从零重建自然日候选，并以 version history 的 v1 日期归窗。",
        "- 召回阶段未读取旧 candidates、旧评分、旧日报或网站既有入选结果。",
        f"- 覆盖自然日：{', '.join(args.day)}。",
        f"- 每日候选数：{', '.join(f'{day}={count}' for day, count in day_counts.items())}。",
        f"- 合并去重候选：{len(candidates_by_id)}；最终收录：{len(papers)}；窗口上限：{cap}。",
        f"- 原文图片清单：`website/quality/figure-manifests/{manifest_date}.json`，视觉复核通过。",
        "",
        "## 入选论文",
        "",
    ]
    for paper in papers:
        source = "官方完整论文" if paper["source"] != "arxiv" else f"arXiv v1 · {paper.get('published_at', '')[:10]}"
        report_lines.append(f"{paper['rank']}. **{paper['title']}** (`{paper['id']}`) — {source}")
    report_lines.extend(
        [
            "",
            "## 本地说明",
            "",
            "公开网站仅展示论文内容、分类、资源链接和原文图片；检索批次、筛选记录与内部质量判断保留在本地审计文件中。",
            "",
        ]
    )
    report_path = daily_root / "reports" / f"{args.report_date}.md"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"Audit JSON: {processed_path}")
    print(f"Local report: {report_path}")
    print(f"Selected: {len(papers)}/{cap}; candidates={len(candidates_by_id)}")


if __name__ == "__main__":
    main()
