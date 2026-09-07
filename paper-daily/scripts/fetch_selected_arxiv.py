"""Download selected arXiv HTML full text and one original method figure.

The command is intentionally explicit: callers provide the selected paper ids
after semantic/full-text review.  It never chooses papers and never reads an
older report or candidate decision.
"""

from __future__ import annotations

import argparse
import base64
import html as html_module
import json
import re
import struct
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

import requests


USER_AGENT = "CodexAutomatedPaperReader/1.0 (figure quality audit)"


class TextExtractor(HTMLParser):
    BREAK_TAGS = {
        "address", "article", "br", "caption", "div", "figcaption", "figure",
        "h1", "h2", "h3", "h4", "h5", "h6", "li", "p", "section", "table",
        "td", "th", "tr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.BREAK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.BREAK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        value = re.sub(r"\s+", " ", data).strip()
        if value:
            self.parts.append(value + " ")

    def result(self) -> str:
        text = "".join(self.parts)
        text = re.sub(r"[ \t]+\n", "\n", text)
        text = re.sub(r"\n[ \t]+", "\n", text)
        return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch selected arXiv full text and method figures")
    parser.add_argument("--report-date", required=True)
    parser.add_argument("--paper", action="append", required=True, help="arXiv id; repeatable")
    parser.add_argument("--repo-root", default="..")
    parser.add_argument(
        "--fulltext-only",
        action="store_true",
        help="Download HTML/text for review without selecting figures or writing a manifest.",
    )
    return parser.parse_args()


def get(url: str) -> requests.Response:
    try:
        response = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=180,
            proxies={"http": None, "https": None},
        )
        response.raise_for_status()
        return response
    except requests.RequestException as primary_error:
        try:
            return get_with_powershell(url)
        except (OSError, RuntimeError, subprocess.SubprocessError) as fallback_error:
            raise RuntimeError(
                "Download failed through both requests and the Windows web-stack fallback: "
                f"requests={primary_error}; fallback={fallback_error}"
            ) from fallback_error


def get_with_powershell(url: str) -> requests.Response:
    safe_url = url.replace("'", "''")
    user_agent = USER_AGENT.replace("'", "''")
    with tempfile.TemporaryDirectory(prefix="paper-reader-fetch-") as temp_dir:
        output_path = Path(temp_dir) / "response.bin"
        safe_output = str(output_path).replace("'", "''")
        script = (
            "$ErrorActionPreference='Stop';"
            "$ProgressPreference='SilentlyContinue';"
            f"Invoke-WebRequest -UseBasicParsing -Uri '{safe_url}' "
            f"-Headers @{{'User-Agent'='{user_agent}'}} -TimeoutSec 180 "
            f"-OutFile '{safe_output}'"
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
        payload = output_path.read_bytes()

    response = requests.Response()
    response.status_code = 200
    response.url = url
    response._content = payload
    suffix = Path(urlparse(url).path).suffix.lower()
    response.headers["Content-Type"] = (
        "image/png" if suffix == ".png" else
        "image/jpeg" if suffix in {".jpg", ".jpeg"} else
        "text/html; charset=utf-8"
    )
    response.encoding = "utf-8"
    return response


def strip_tags(value: str) -> str:
    return re.sub(r"\s+", " ", html_module.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def figure_candidates(page_html: str, base_url: str) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for index, match in enumerate(re.finditer(r"<figure\b[^>]*>(.*?)</figure>", page_html, flags=re.I | re.S), 1):
        block = match.group(1)
        sources = re.findall(r"<img\b[^>]*?src=[\"']([^\"']+)[\"']", block, flags=re.I)
        sources += re.findall(
            r"<object\b[^>]*?type=[\"']image/svg\+xml[\"'][^>]*?data=[\"']([^\"']+)[\"']",
            block,
            flags=re.I,
        )
        if len(sources) != 1:
            continue
        caption_match = re.search(r"<figcaption\b[^>]*>(.*?)</figcaption>", block, flags=re.I | re.S)
        caption = strip_tags(caption_match.group(1)) if caption_match else ""
        number_match = re.search(r"(?:Figure|Fig\.)\s+(\d+[a-z]?)", caption, flags=re.I)
        number = number_match.group(1).lower() if number_match else str(index)
        lowered = caption.lower()
        score = 0
        # Prefer an actual method/architecture overview, then an early visual
        # abstract.  Word boundaries matter here: e.g. "foundation models" or
        # "different methods" in a result caption must not look like a method
        # diagram merely because they contain the substring ``model``/``method``.
        if re.search(r"\b(overview|framework|architecture|pipeline|block diagram|interface|core components)\b", lowered):
            score += 24
        if re.search(r"\b(method|approach|system)\b", lowered):
            score += 10
        if number == "1":
            score += 12
        elif number == "2":
            score += 8
        if re.search(
            r"\b(results?|comparison|qualitative|visualization|success rate|sample trajectories|ablation)\b",
            lowered,
        ):
            score -= 24
        candidates.append(
            {
                "source_url": urljoin(base_url, html_module.unescape(sources[0])),
                "caption": caption,
                "figure_number": number,
                "score": score,
            }
        )
    def figure_order(item: dict[str, Any]) -> int:
        match = re.match(r"\d+", str(item["figure_number"]))
        return int(match.group(0)) if match else 10_000

    return sorted(candidates, key=lambda item: (item["score"], -figure_order(item)), reverse=True)


def image_dimensions(data: bytes) -> tuple[int, int]:
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return struct.unpack(">II", data[16:24])
    if data.startswith(b"\xff\xd8"):
        offset = 2
        while offset + 9 < len(data):
            if data[offset] != 0xFF:
                offset += 1
                continue
            marker = data[offset + 1]
            offset += 2
            if marker in {0xD8, 0xD9}:
                continue
            if offset + 2 > len(data):
                break
            length = int.from_bytes(data[offset:offset + 2], "big")
            if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                height = int.from_bytes(data[offset + 3:offset + 5], "big")
                width = int.from_bytes(data[offset + 5:offset + 7], "big")
                return width, height
            offset += max(2, length)
    if data.lstrip().startswith(b"<svg"):
        svg = data.decode("utf-8", errors="ignore")
        width_match = re.search(r"\bwidth=[\"']([0-9.]+)", svg, flags=re.I)
        height_match = re.search(r"\bheight=[\"']([0-9.]+)", svg, flags=re.I)
        if width_match and height_match:
            return round(float(width_match.group(1))), round(float(height_match.group(1)))
        viewbox_match = re.search(
            r"\bviewBox=[\"']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*[\"']",
            svg,
            flags=re.I,
        )
        if viewbox_match:
            return round(float(viewbox_match.group(1))), round(float(viewbox_match.group(2)))
    raise ValueError("unsupported image format")


def extension_for(url: str, content_type: str) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".svg"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    if "svg" in content_type:
        return ".svg"
    return ".jpg" if "jpeg" in content_type else ".png"


def main() -> None:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    fulltext_dir = repo_root / "paper-daily" / "data" / "fulltext"
    asset_dir = repo_root / "website" / "public" / "report-assets" / args.report_date
    fulltext_dir.mkdir(parents=True, exist_ok=True)
    asset_dir.mkdir(parents=True, exist_ok=True)
    manifest_papers: list[dict[str, Any]] = []

    for paper_id in args.paper:
        html_url = f"https://arxiv.org/html/{paper_id}v1"
        try:
            response = get(html_url)
        except RuntimeError as exc:
            if args.fulltext_only:
                print(f"{paper_id}: HTML unavailable; PDF review required ({exc})")
                continue
            raise
        page_html = response.text
        (fulltext_dir / f"{paper_id}.html").write_text(page_html, encoding="utf-8")
        extractor = TextExtractor()
        extractor.feed(page_html)
        (fulltext_dir / f"{paper_id}.txt").write_text(extractor.result(), encoding="utf-8")
        if args.fulltext_only:
            print(f"{paper_id}: full text saved")
            continue

        selected: dict[str, Any] | None = None
        for candidate in figure_candidates(page_html, html_url):
            try:
                image_response = get(candidate["source_url"])
                width, height = image_dimensions(image_response.content)
            except Exception as exc:
                print(f"{paper_id}: skipped figure {candidate['figure_number']}: {exc}")
                continue
            is_svg = Path(urlparse(candidate["source_url"]).path).suffix.lower() == ".svg"
            min_width, min_height = (200, 100) if is_svg else (700, 180)
            if width < min_width or height < min_height:
                print(f"{paper_id}: skipped small figure {candidate['figure_number']} {width}x{height}")
                continue
            extension = extension_for(candidate["source_url"], image_response.headers.get("Content-Type", ""))
            file_name = f"{paper_id}-fig{candidate['figure_number']}{extension}"
            (asset_dir / file_name).write_bytes(image_response.content)
            selected = {
                "file": file_name,
                "figureNumber": candidate["figure_number"],
                "sourceUrl": candidate["source_url"],
                "sourceType": "arxiv_html_figure",
                "width": width,
                "height": height,
                "caption": candidate["caption"],
                "visualReview": "pending",
                "containsPageHeader": False,
                "completeFrame": True,
            }
            print(f"{paper_id}: Figure {candidate['figure_number']} {width}x{height} {file_name}")
            break
        if selected is None:
            raise RuntimeError(f"No figure passed the automatic dimension gate for {paper_id}")
        manifest_papers.append({"paperId": paper_id, "figures": [selected]})

    if args.fulltext_only:
        return

    manifest = {
        "reportDate": args.report_date,
        "reviewedAt": None,
        "papers": manifest_papers,
    }
    manifest_path = repo_root / "website" / "quality" / "figure-manifests" / f"{args.report_date}.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
