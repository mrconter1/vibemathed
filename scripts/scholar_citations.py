#!/usr/bin/env python3
"""
scholar_citations.py - look up Google Scholar citation counts by paper title.

Why this is a standalone manual script and not something wired into the build:
Google Scholar has no official API, rate-limits/CAPTCHAs scripted access
aggressively, and its numbers drift over time. Running it unattended (in CI,
or against every entry automatically) would either get blocked or eventually
paper over a block with a wrong number. So: run it locally by hand, eyeball
the matches, paste results into problems.json yourself. See README.md.

Usage:
    # single title
    python scripts/scholar_citations.py "On Sets of Distances of n Points"

    # batch from a text file (one title per line)
    python scripts/scholar_citations.py --file titles.txt

    # find gaps in VibeMathed's own data and look them up
    python scripts/scholar_citations.py --data src/data/problems.json

Every request is spaced by --delay seconds (default 8) with a real browser
User-Agent, one request at a time - no concurrency, on purpose. If Scholar
serves a CAPTCHA/consent page instead of results, that lookup is reported as
BLOCKED rather than silently skipped or guessed: a wrong number is worse than
an honest gap, which is the same rule the rest of this project follows.

This never writes to problems.json for you. It prints what it found so a
human decides what to paste in - matches the project's "hand-curated" stance.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SCHOLAR_URL = "https://scholar.google.com/scholar"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

BLOCK_MARKERS = (
    "our systems have detected unusual traffic",
    "please show you're not a robot",
    "recaptcha",
    "/sorry/",
)


@dataclass
class LookupResult:
    query: str
    status: str  # "ok" | "no_results" | "blocked" | "error"
    matched_title: str | None = None
    citations: int | None = None
    scholar_url: str | None = None
    detail: str | None = None


def normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def parse_result_count(html: str) -> int | None:
    """Extract Scholar's "About N results" estimate from the results header.

    This is a DIFFERENT metric from a citation count: it's how many papers
    Scholar thinks match the query, not how many cite one paper. It is also
    Scholar's own rough estimate - it drifts between pages and is inflated -
    so treat it as an order-of-magnitude "how discussed" signal, never a
    precise figure. A bare-number query like `"erdos" "592"` is especially
    noisy because the number matches page numbers, years, and equation labels
    in unrelated papers. Use a distinctive phrase if you want signal.
    """
    soup = BeautifulSoup(html, "html.parser")
    header = soup.select_one("div.gs_ab_mdw")
    if not header:
        return None
    text = header.get_text(" ", strip=True)
    # "About 17,300 results (0.05 sec)" / "1 result" / "17,300 results"
    m = re.search(r"([\d,]+)\s+results?", text)
    if not m:
        return None
    return int(m.group(1).replace(",", ""))


def count_results(query: str, session: requests.Session) -> LookupResult:
    """Return Scholar's estimated result count for an arbitrary query."""
    try:
        resp = session.get(
            SCHOLAR_URL, params={"q": query, "hl": "en"}, headers=HEADERS, timeout=15
        )
    except requests.RequestException as e:
        return LookupResult(query, "error", detail=str(e))
    body_lower = resp.text.lower()
    if resp.status_code != 200 or any(m in body_lower for m in BLOCK_MARKERS):
        return LookupResult(query, "blocked", detail=f"HTTP {resp.status_code}, possible CAPTCHA/consent page")
    count = parse_result_count(resp.text)
    if count is None:
        # No header at all usually means zero hits for this exact query.
        return LookupResult(query, "no_results", citations=0)
    return LookupResult(query, "ok", citations=count, detail="result-count (not citations)")


def titles_match(a: str, b: str) -> bool:
    """Same strict-equality rule used for the OpenAlex lookups in this
    project: exact normalized match only. A prior loose (prefix) match let
    "Some unsolved problems" match into an unrelated paper about cervical
    spondylosis - a wrong citation count is worse than a missing one."""
    return normalize(a) == normalize(b)


def lookup(title: str, session: requests.Session) -> LookupResult:
    try:
        # hl=en matters: Scholar appears to pick its UI language from IP
        # geolocation rather than the Accept-Language header. Without this,
        # "Cited by N" can come back as e.g. Swedish "Citerat av N" and the
        # English-only regex below silently finds nothing for every result -
        # not a block, just a wrong assumption that looked like one.
        resp = session.get(
            SCHOLAR_URL, params={"q": title, "hl": "en"}, headers=HEADERS, timeout=15
        )
    except requests.RequestException as e:
        return LookupResult(title, "error", detail=str(e))

    body_lower = resp.text.lower()
    if resp.status_code != 200 or any(m in body_lower for m in BLOCK_MARKERS):
        return LookupResult(
            title, "blocked", detail=f"HTTP {resp.status_code}, possible CAPTCHA/consent page"
        )

    soup = BeautifulSoup(resp.text, "html.parser")
    # gs_ri is nested *inside* gs_r.gs_or.gs_scl on current markup - selecting
    # both matched every result twice. One selector, not a comma list.
    results = soup.select("div.gs_r.gs_or.gs_scl")
    if not results:
        return LookupResult(title, "no_results")

    for r in results:
        title_el = r.select_one("h3.gs_rt")
        if not title_el:
            continue
        result_title = title_el.get_text(" ", strip=True)
        # Scholar prepends the format tag TWICE (icon label + visible text,
        # e.g. "[PDF] [PDF] Title" or "[BOOK] [B] Title") - strip all of them,
        # not just the first, or the leftover tag breaks the exact-match gate.
        result_title = re.sub(r"^(\s*\[[A-Z]+\]\s*)+", "", result_title)
        if not titles_match(result_title, title):
            continue

        cited_by = None
        cite_url = None
        for a in r.select("div.gs_fl a"):
            text = a.get_text(strip=True)
            m = re.match(r"Cited by (\d+)", text)
            if m:
                cited_by = int(m.group(1))
                cite_url = a.get("href")
                break
        if cited_by is None:
            return LookupResult(title, "ok", matched_title=result_title, citations=0, detail="no 'Cited by' link - likely 0")
        return LookupResult(title, "ok", matched_title=result_title, citations=cited_by, scholar_url=cite_url)

    # Results existed but none matched the title closely enough to trust.
    top = results[0].select_one("h3.gs_rt")
    top_title = top.get_text(" ", strip=True) if top else None
    return LookupResult(title, "no_results", detail=f"top result didn't match closely: {top_title!r}")


def extract_title_from_citations_paper(text: str) -> str | None:
    """problems.json stores citationsPaper as e.g.
    'P. Erdős, R. Graham (1980), "Old and new problems...", venue'
    - pull the quoted title out."""
    m = re.search(r'"([^"]+)"', text)
    return m.group(1) if m else None


def gather_from_data_file(path: Path) -> list[tuple[str, str]]:
    """Return (identifier, title) pairs for entries missing a citation count,
    preferring the known founding-paper title over the problem's own name."""
    entries = json.loads(path.read_text(encoding="utf-8"))
    out = []
    for e in entries:
        if e.get("citations") is not None:
            continue
        title = None
        if e.get("citationsPaper"):
            title = extract_title_from_citations_paper(e["citationsPaper"])
        if not title:
            title = e.get("name")
        if title:
            out.append((e.get("slug", "?"), title))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("title", nargs="?", help="A single paper title to look up")
    ap.add_argument("--file", type=Path, help="Text file, one title per line")
    ap.add_argument("--data", type=Path, help="Path to problems.json - looks up entries with citations: null")
    ap.add_argument("--delay", type=float, default=8.0, help="Seconds between requests (default 8)")
    ap.add_argument("--output", type=Path, help="Write JSON results to this path")
    ap.add_argument(
        "--count",
        action="store_true",
        help=(
            "Result-count mode: report Scholar's 'About N results' estimate for "
            "each query verbatim instead of finding a paper's citation count. "
            "This is a 'how discussed' signal, NOT a citation count, and is noisy "
            "- see parse_result_count()'s docstring."
        ),
    )
    args = ap.parse_args()

    queries: list[tuple[str, str]] = []
    if args.title:
        queries.append((args.title, args.title))
    if args.file:
        for line in args.file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                queries.append((line, line))
    if args.data and not args.count:
        queries.extend(gather_from_data_file(args.data))

    if not queries:
        ap.print_help()
        return 1

    session = requests.Session()
    results = []
    for i, (ident, query) in enumerate(queries):
        r = count_results(query, session) if args.count else lookup(query, session)
        results.append({"id": ident, **r.__dict__})
        if args.count:
            status_line = {
                "ok": f"~{r.citations} results (Scholar estimate, NOT citations)",
                "no_results": "0 results",
                "blocked": f"BLOCKED - {r.detail}",
                "error": f"ERROR - {r.detail}",
            }[r.status]
        else:
            status_line = {
                "ok": f"{r.citations} citations - \"{r.matched_title}\"",
                "no_results": f"NO MATCH ({r.detail})" if r.detail else "NO RESULTS",
                "blocked": f"BLOCKED - {r.detail}",
                "error": f"ERROR - {r.detail}",
            }[r.status]
        print(f"[{i + 1}/{len(queries)}] {ident}: {status_line}", file=sys.stderr)

        if r.status == "blocked":
            print(
                "  -> Scholar is blocking this session. Stop here, wait a while, "
                "try from a browser, or reduce request volume.",
                file=sys.stderr,
            )
            break

        if i < len(queries) - 1:
            time.sleep(args.delay)

    if args.output:
        args.output.write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f"\nWrote {len(results)} results to {args.output}", file=sys.stderr)

    ok = sum(1 for r in results if r["status"] == "ok")
    metric = "result counts" if args.count else "confident citation counts"
    print(f"\n{ok} of {len(results)} resolved with {metric}.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
