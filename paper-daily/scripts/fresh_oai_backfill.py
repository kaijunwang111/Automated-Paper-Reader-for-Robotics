"""Rebuild historical natural-day arXiv pools from the official OAI feed.

Unlike the live fetcher and the saved-metadata repair utility, this command
does not read any existing raw, candidate, score, report, or website file.
It queries arXiv afresh, reads the first ``arXivRaw/version/date`` entry as the
v1 date, then writes one independent pool per natural day.  This deliberately
avoids the ordinary OAI ``created`` field, which may reflect a later revision.
"""

from __future__ import annotations

import argparse
import base64
import html
import subprocess
import time
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import requests

from rank_papers import build_candidate_pool
from utils import load_config, normalize_whitespace, write_json_atomic


OAI_URL = "https://export.arxiv.org/oai2"
OAI_NS = "http://www.openarchives.org/OAI/2.0/"
ARXIV_RAW_NS = "http://arxiv.org/OAI/arXivRaw/"
USER_AGENT = "CodexAutomatedPaperReader/1.0 (historical backfill)"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fresh historical arXiv OAI backfill")
    parser.add_argument("--config", default="config.yaml")
    parser.add_argument("--date", action="append", required=True, help="Natural day; repeatable")
    parser.add_argument(
        "--until",
        default=datetime.now(timezone.utc).date().isoformat(),
        help="Last OAI datestamp to inspect (defaults to the current UTC date)",
    )
    parser.add_argument("--sleep-seconds", type=float, default=3.0)
    parser.add_argument(
        "--allow-empty-window",
        action="store_true",
        help="Permit an all-zero target window. Intended only for a manually verified arXiv outage/holiday.",
    )
    return parser.parse_args()


def request_xml(params: dict[str, str], retries: int = 3) -> ET.Element:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            response = requests.get(
                OAI_URL,
                params=params,
                headers={"User-Agent": USER_AGENT},
                timeout=180,
                proxies={"http": None, "https": None},
            )
            if response.status_code == 503:
                delay = int(response.headers.get("Retry-After", "20"))
                time.sleep(max(1, delay))
                continue
            response.raise_for_status()
            return ET.fromstring(response.content)
        except (requests.RequestException, ET.ParseError) as exc:
            last_error = exc
            if "10054" in str(exc) or "connection was reset" in str(exc).lower():
                break
            if attempt + 1 < retries:
                time.sleep(10 * (attempt + 1))
    assert last_error is not None
    try:
        return request_xml_with_powershell(params)
    except (OSError, RuntimeError, subprocess.SubprocessError, ET.ParseError) as fallback_error:
        raise RuntimeError(
            "arXiv OAI failed through both requests and the Windows web-stack fallback: "
            f"requests={last_error}; fallback={fallback_error}"
        ) from fallback_error


def request_xml_with_powershell(params: dict[str, str]) -> ET.Element:
    """Use the Windows web stack when Python sockets are reset by the local network.

    Some Windows environments can reach export.arxiv.org through
    ``Invoke-WebRequest`` while Python/OpenSSL connections are reset.  The
    fallback is per-request, keeps the official HTTPS endpoint, and passes the
    command via ``-EncodedCommand`` so OAI resumption tokens are not interpreted
    by a shell.
    """

    prepared = requests.Request("GET", OAI_URL, params=params).prepare()
    url = (prepared.url or OAI_URL).replace("'", "''")
    user_agent = USER_AGENT.replace("'", "''")
    script = (
        "$ErrorActionPreference='Stop';"
        "$ProgressPreference='SilentlyContinue';"
        "[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false);"
        f"$response=Invoke-WebRequest -UseBasicParsing -Uri '{url}' "
        f"-Headers @{{'User-Agent'='{user_agent}'}} -TimeoutSec 180;"
        "[Console]::Out.Write($response.Content)"
    )
    encoded = base64.b64encode(script.encode("utf-16le")).decode("ascii")
    completed = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
        check=False,
        capture_output=True,
        timeout=210,
    )
    if completed.returncode != 0:
        stderr = completed.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(stderr or f"PowerShell exited with {completed.returncode}")
    return ET.fromstring(completed.stdout)


def iter_category_records(
    category: str,
    from_date: date,
    until_date: date,
    sleep_seconds: float,
) -> list[dict[str, Any]]:
    archive, subject = category.split(".", 1)
    params = {
        "verb": "ListRecords",
        "from": from_date.isoformat(),
        "until": until_date.isoformat(),
        "set": f"{archive}:{archive}:{subject}",
        "metadataPrefix": "arXivRaw",
    }
    records: list[dict[str, Any]] = []
    while True:
        root = request_xml(params)
        error = root.find(f"{{{OAI_NS}}}error")
        if error is not None:
            code = error.attrib.get("code", "unknown")
            if code == "noRecordsMatch":
                return records
            raise RuntimeError(f"arXiv OAI error {code}: {normalize_whitespace(error.text or '')}")

        for node in root.findall(f".//{{{OAI_NS}}}record"):
            paper = parse_record(node)
            if paper:
                records.append(paper)

        token_node = root.find(f".//{{{OAI_NS}}}resumptionToken")
        token = normalize_whitespace(token_node.text or "") if token_node is not None else ""
        if not token:
            return records
        time.sleep(max(0.0, sleep_seconds))
        params = {"verb": "ListRecords", "resumptionToken": token}


def parse_record(node: ET.Element) -> dict[str, Any] | None:
    header = node.find(f"{{{OAI_NS}}}header")
    metadata = node.find(f"{{{OAI_NS}}}metadata")
    if header is None or metadata is None or "status" in header.attrib:
        return None
    arxiv = metadata.find(f"{{{ARXIV_RAW_NS}}}arXivRaw")
    if arxiv is None:
        return None

    def text(name: str) -> str:
        item = arxiv.find(f"{{{ARXIV_RAW_NS}}}{name}")
        return normalize_whitespace(html.unescape(item.text or "")) if item is not None else ""

    paper_id = text("id")
    versions = arxiv.findall(f"{{{ARXIV_RAW_NS}}}version")
    version_dates: list[datetime] = []
    for version in versions:
        date_node = version.find(f"{{{ARXIV_RAW_NS}}}date")
        if date_node is None or not normalize_whitespace(date_node.text or ""):
            continue
        parsed = parsedate_to_datetime(normalize_whitespace(date_node.text or ""))
        version_dates.append(parsed.astimezone(timezone.utc))
    if not paper_id or not version_dates:
        return None
    authors = [normalize_whitespace(value) for value in text("authors").split(",") if normalize_whitespace(value)]

    categories = text("categories").split()
    created_dt = version_dates[0]
    updated_dt = version_dates[-1]
    return {
        "id": paper_id,
        "source": "arxiv",
        "title": text("title"),
        "authors": authors,
        "abstract": text("abstract"),
        "url": f"https://arxiv.org/abs/{paper_id}",
        "pdf_url": f"https://arxiv.org/pdf/{paper_id}",
        "published_at": created_dt.isoformat().replace("+00:00", "Z"),
        "updated_at": updated_dt.isoformat().replace("+00:00", "Z"),
        "venue": categories[0] if categories else "arXiv",
        "categories": categories,
        "oai_datestamp": normalize_whitespace(
            (header.find(f"{{{OAI_NS}}}datestamp").text or "")
            if header.find(f"{{{OAI_NS}}}datestamp") is not None
            else ""
        ),
    }


def merge_papers(existing: dict[str, Any] | None, incoming: dict[str, Any]) -> dict[str, Any]:
    if existing is None:
        return incoming
    merged = dict(existing)
    merged["categories"] = sorted(set(existing.get("categories", [])) | set(incoming.get("categories", [])))
    if len(str(incoming.get("abstract", ""))) > len(str(existing.get("abstract", ""))):
        merged["abstract"] = incoming["abstract"]
    return merged


def ensure_window_ready(
    by_day: dict[date, list[dict[str, Any]]],
    targets: list[date],
    *,
    allow_empty_window: bool,
) -> None:
    """Reject a false-empty OAI response before it can overwrite report inputs."""

    target_paper_count = sum(len(by_day.get(target, [])) for target in targets)
    if target_paper_count > 0 or allow_empty_window:
        return
    target_range = f"{targets[0].isoformat()}..{targets[-1].isoformat()}"
    raise RuntimeError(
        "Fresh arXiv OAI retrieval returned zero v1 papers across the entire "
        f"target window {target_range}. Treat this as an incomplete/unavailable "
        "announcement batch, not a valid empty report. Retry after the scheduled "
        "arXiv announcement or pass --allow-empty-window only after manual verification."
    )


def main() -> None:
    args = parse_args()
    config_path = Path(args.config).resolve()
    config = load_config(config_path)
    targets = sorted({date.fromisoformat(value) for value in args.date})
    until_date = date.fromisoformat(args.until)
    from_date = min(targets)
    categories = config.get("research_profile", {}).get("arxiv_categories", [])
    all_papers: dict[str, dict[str, Any]] = {}

    for index, category in enumerate(categories):
        records = iter_category_records(category, from_date, until_date, args.sleep_seconds)
        print(f"{category}: fetched={len(records)}")
        for paper in records:
            all_papers[paper["id"]] = merge_papers(all_papers.get(paper["id"]), paper)
        if index + 1 < len(categories):
            time.sleep(max(0.0, args.sleep_seconds))

    by_day: dict[date, list[dict[str, Any]]] = defaultdict(list)
    target_set = set(targets)
    for paper in all_papers.values():
        created_day = date.fromisoformat(str(paper["published_at"])[:10])
        if created_day in target_set:
            by_day[created_day].append(paper)

    ensure_window_ready(by_day, targets, allow_empty_window=args.allow_empty_window)

    raw_dir = config_path.parent / config.get("output", {}).get("data_dir", "data") / "raw"
    processed_dir = config_path.parent / config.get("output", {}).get("data_dir", "data") / "processed"
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    daily_limit = int(config.get("retrieval", {}).get("daily_candidate_limit", 200))

    for target in targets:
        papers = sorted(by_day.get(target, []), key=lambda item: (item["title"], item["id"]))
        candidates = build_candidate_pool(
            papers,
            config.get("research_profile", {}),
            target,
            candidate_limit=daily_limit,
        )
        day = target.isoformat()
        raw_payload = {
            "date": day,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "stage": "fresh_oai_v1_backfill",
            "source": "arxiv_oai",
            "query_datestamp_range": [from_date.isoformat(), until_date.isoformat()],
            "paper_count": len(papers),
            "candidate_count": len(candidates),
            "papers": papers,
        }
        write_json_atomic(raw_dir / f"{day}.json", raw_payload)
        write_json_atomic(processed_dir / f"{day}_candidates.json", candidates)
        print(f"{day}: source={len(papers)} candidates={len(candidates)}")


if __name__ == "__main__":
    main()
