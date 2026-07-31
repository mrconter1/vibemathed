#!/usr/bin/env python3
"""Finds candidate "problem solved with AI" items across two sources:

  1. arXiv: recent papers in math / theory categories whose title or abstract
     smells like a resolution (conjecture, counterexample, disproof, open
     problem, ...). For each candidate the HTML full text (when arXiv has one)
     is fetched and searched for AI-model mentions - that is where AI-use
     disclosures actually live, not in the abstract.
  2. GitHub: recent pull requests on google-deepmind/formal-conjectures, whose
     merged PRs have been a steady source of Lean-checked (dis)proofs.

Zero dependencies (stdlib only). A state file remembers everything already
reported, so repeated runs only surface NEW finds.

Usage:
  python scripts/find_ai_solves.py               # last 3 days, prints report
  python scripts/find_ai_solves.py --days 7
  python scripts/find_ai_solves.py --reset       # forget seen-state first

Output is a Markdown report on stdout: triage it against the methodology
(vibemathed.com/methodology) before anything becomes an entry.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Windows consoles default to cp1252, which cannot print the math papers'
# own characters. The report is UTF-8, unconditionally.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

STATE_FILE = Path(__file__).parent / ".find_ai_solves_state.json"

# The models whose mention in a paper marks it as AI-assisted work.
MODEL_TERMS = [
    "Claude", "GPT", "ChatGPT", "Codex", "Gemini", "Grok",
    "Aristotle", "AlphaProof", "AlphaEvolve", "large language model",
    "LLM-assisted", "generative AI",
]
MODEL_RE = re.compile("|".join(re.escape(t) for t in MODEL_TERMS), re.IGNORECASE)
# "Claude" and "GPT" style terms inside ordinary words ("claudication") are not
# a risk worth engineering around at this volume; the context line shown in
# the report makes false positives obvious.

# What a resolution smells like, in a title or abstract.
RESOLUTION_RE = re.compile(
    r"conjecture|counterexample|disproo?f|disprov|open problem|open question"
    r"|long-?standing|resolv|settles?|refut|first proof",
    re.IGNORECASE,
)

ARXIV_CATEGORIES = [
    "math.CO", "math.NT", "math.AG", "math.PR", "math.GR", "math.CA",
    "math.MG", "math.AC", "math.GT", "math.LO", "math.OC", "math.SP",
    "math.DS", "math.AP", "math.RA", "math.RT", "math.FA", "math.ST",
    "cs.CC", "cs.DM", "cs.DS", "cs.FL", "cs.LG", "quant-ph", "math-ph",
]

UA = {"User-Agent": "vibemathed-finder/1.0 (rasmus.lindahl1996@gmail.com)"}

DATASET_URL = "https://vibemathed.com/api/dataset"
ARXIV_ID_RE = re.compile(r"arxiv\.org/(?:abs|html|pdf)/(\d{4}\.\d{4,5})", re.IGNORECASE)
FC_PR_RE = re.compile(r"github\.com/google-deepmind/formal-conjectures/pull/(\d+)", re.IGNORECASE)


def fetch(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read().decode("utf-8", errors="replace")


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"seen_arxiv": [], "seen_prs": []}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=1))


def context_lines(text: str, pattern: re.Pattern, limit: int = 3) -> list[str]:
    """Short context snippets around each distinct match, for the report."""
    out, seen_terms = [], set()
    for m in pattern.finditer(text):
        term = m.group(0).lower()
        if term in seen_terms:
            continue
        seen_terms.add(term)
        start, end = max(0, m.start() - 80), min(len(text), m.end() + 80)
        snippet = re.sub(r"\s+", " ", text[start:end]).strip()
        out.append(f"…{snippet}…")
        if len(out) >= limit:
            break
    return out


# -------------------------------------------------------------- catalog ----

def catalog_index() -> tuple[set[str], set[int]]:
    """arXiv ids and formal-conjectures PR numbers already in the live catalog.

    Pulled from the site's own public dataset endpoint (sourceUrl plus every
    extra link per entry), so finds that are already tracked get marked in the
    report instead of wasting triage time. Fails soft: if the site is
    unreachable, nothing gets marked and the report still prints.
    """
    try:
        data = json.loads(fetch(DATASET_URL))
    except Exception as e:
        print(f"_(catalog check skipped: {e})_\n", file=sys.stderr)
        return set(), set()
    arxiv_ids: set[str] = set()
    pr_numbers: set[int] = set()
    for p in data.get("problems", []):
        urls = [p.get("sourceUrl") or "", p.get("citationsUrl") or ""]
        urls += [link.get("url") or "" for link in p.get("links", [])]
        for u in urls:
            for m in ARXIV_ID_RE.finditer(u):
                arxiv_ids.add(m.group(1))
            for m in FC_PR_RE.finditer(u):
                pr_numbers.add(int(m.group(1)))
    return arxiv_ids, pr_numbers


# ---------------------------------------------------------------- arXiv ----

def arxiv_recent(days: int) -> list[dict]:
    """Recent papers in the target categories, resolution-flavoured only."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    cat_query = "+OR+".join(f"cat:{c}" for c in ARXIV_CATEGORIES)
    papers, start, page = [], 0, 200
    ns = {"a": "http://www.w3.org/2005/Atom"}
    # Hard stop scaled to the window: ~1500 submissions/day across these
    # categories, capped so a giant window cannot page forever.
    while start < min(12000, 1500 * days):
        url = (
            "http://export.arxiv.org/api/query?search_query=" + cat_query
            + f"&sortBy=submittedDate&sortOrder=descending&start={start}&max_results={page}"
        )
        root = ET.fromstring(fetch(url))
        entries = root.findall("a:entry", ns)
        if not entries:
            break
        stop = False
        for e in entries:
            updated = datetime.fromisoformat(e.findtext("a:published", "", ns).replace("Z", "+00:00"))
            if updated < cutoff:
                stop = True
                break
            arxiv_id = e.findtext("a:id", "", ns).rsplit("/", 1)[-1]
            title = re.sub(r"\s+", " ", e.findtext("a:title", "", ns)).strip()
            abstract = re.sub(r"\s+", " ", e.findtext("a:summary", "", ns)).strip()
            if RESOLUTION_RE.search(title + " " + abstract):
                papers.append({"id": arxiv_id, "title": title, "abstract": abstract})
        if stop:
            break
        start += page
        time.sleep(3)  # arXiv API etiquette
    return papers


def arxiv_ai_mentions(paper: dict) -> list[str]:
    """Fetches the HTML full text (if any) and returns AI-mention snippets.

    Falls back to the abstract alone when no HTML version exists - PDFs are
    deliberately not parsed to keep this dependency-free.
    """
    plain_id = paper["id"].split("v")[0]
    try:
        html = fetch(f"https://arxiv.org/html/{paper['id']}")
    except Exception:
        try:
            html = fetch(f"https://arxiv.org/html/{plain_id}")
        except Exception:
            html = paper["abstract"]
    text = re.sub(r"<[^>]+>", " ", html)
    return context_lines(text, MODEL_RE)


# --------------------------------------------------------------- GitHub ----

def github_prs(repo: str, days: int) -> list[dict]:
    """Recent PRs (any state); flags AI mentions and (dis)proof titles."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    url = f"https://api.github.com/repos/{repo}/pulls?state=all&sort=created&direction=desc&per_page=100"
    rows = json.loads(fetch(url))
    out = []
    for pr in rows:
        created = datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00"))
        if created < cutoff:
            break
        text = (pr["title"] or "") + "\n" + (pr["body"] or "")
        ai = MODEL_RE.search(text) is not None
        proofy = re.search(r"disprov|prove|counterexample|solv", pr["title"] or "", re.IGNORECASE) is not None
        if ai or proofy:
            out.append({
                "number": pr["number"],
                "title": pr["title"],
                "url": pr["html_url"],
                "state": pr["state"] + (" (merged)" if pr.get("merged_at") else ""),
                "ai_mention": ai,
                "snippets": context_lines(text, MODEL_RE) if ai else [],
            })
    return out


# --------------------------------------------------------------- report ----

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=3)
    ap.add_argument("--reset", action="store_true", help="forget previously seen items")
    args = ap.parse_args()

    state = {"seen_arxiv": [], "seen_prs": []} if args.reset else load_state()
    seen_arxiv, seen_prs = set(state["seen_arxiv"]), set(state["seen_prs"])

    known_arxiv, known_prs = catalog_index()

    print(f"# AI-solve candidates - last {args.days} days\n")
    print(f"_Catalog check: {len(known_arxiv)} arXiv ids and {len(known_prs)} "
          f"formal-conjectures PRs already tracked on vibemathed.com._\n")

    print("## arXiv (resolution-flavoured papers mentioning a model)\n")
    papers = arxiv_recent(args.days)
    new_papers = [p for p in papers if p["id"] not in seen_arxiv]
    # The full-text fetches dominate the runtime and are independent; a small
    # pool keeps a week-sized sweep to minutes while staying polite to arXiv.
    with ThreadPoolExecutor(max_workers=4) as pool:
        all_snippets = list(pool.map(arxiv_ai_mentions, new_papers))
    hits = 0
    for p, snippets in zip(new_papers, all_snippets):
        seen_arxiv.add(p["id"])
        if not snippets:
            continue
        hits += 1
        # Marked rather than hidden: one paper can hold a second, untracked
        # result, so "already in catalog" is a triage hint, not a filter.
        tracked = " **[already in catalog]**" if p["id"].split("v")[0] in known_arxiv else ""
        print(f"### [{p['title']}](https://arxiv.org/abs/{p['id']}){tracked}")
        print(f"- id: {p['id']}")
        for s in snippets:
            print(f"- {s}")
        print()
    print(f"_({len(papers)} resolution-flavoured papers scanned, {hits} new with AI mentions)_\n")

    print("## google-deepmind/formal-conjectures PRs\n")
    prs = github_prs("google-deepmind/formal-conjectures", args.days)
    new_prs = [pr for pr in prs if pr["number"] not in seen_prs]
    for pr in new_prs:
        seen_prs.add(pr["number"])
        flag = " [AI mention]" if pr["ai_mention"] else ""
        if pr["number"] in known_prs:
            flag += " **[already in catalog]**"
        print(f"- [#{pr['number']} {pr['title']}]({pr['url']}) - {pr['state']}{flag}")
        for s in pr["snippets"]:
            print(f"  - {s}")
    print(f"\n_({len(prs)} matching PRs in window, {len(new_prs)} new)_")

    state["seen_arxiv"] = sorted(seen_arxiv)
    state["seen_prs"] = sorted(seen_prs)
    save_state(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
