#!/usr/bin/env python3
"""Finds candidate "problem solved with AI" items across several sources:

  1. arXiv: papers in math / theory categories whose title or abstract smells
     like a resolution (conjecture, counterexample, disproof, open problem,
     ...), harvested over OAI-PMH - arXiv's own bulk interface, which does
     date windows natively (no 12000-result cap, no deep-pagination 500s)
     and is keyless. Daily runs resume from a checkpoint, so skipped days
     are covered by the next run. For each candidate the HTML full text
     (when arXiv has one) is fetched and searched for AI-model mentions -
     that is where AI-use disclosures actually live, not in the abstract.
     The search API remains only as a fallback when the harvester fails.
  2. GitHub PRs: google-deepmind/formal-conjectures (any resolution-flavoured
     or AI-mentioning PR) and leanprover-community/mathlib4 (AI-disclosing PRs
     only - mathlib requires disclosure in the PR body, and every mathlib PR
     is "proofy" so that filter alone would drown the report).
  3. Tao's ledger: the AI-contributions wiki page on teorth/erdosproblems,
     parsed by table and outcome. Only PRIMARY sections (AI doing the
     mathematics) can be solves; solve-grade rows (green full solutions,
     white candidates) print in detail with their source links, partial /
     variant / incorrect rows get one-liners, and secondary rows
     (literature search, formalizing human proofs) only a count.
  4. Zenodo: recent records that look like a resolution and mention a model
     (some authors publish there instead of arXiv - the SSUF papers did).
  5. News feeds: OpenAI and DeepMind announcement RSS, the Kourovka Notebook
     blog and the Xena project blog, filtered to math-resolution keywords.
  6. An external aggregate claim index (URL supplied locally via the
     FINDER_INDEX_URL env var or scripts/.finder_index_url, deliberately
     not named in the repo). Claims whose links match nothing in our
     catalog (arXiv id, Erdős number, GitHub repo, Zenodo id, vibemathed
     slug) surface for triage - it aggregates far more than any single
     upstream, so this is the broadest net.
  7. Watched artifact repositories (plby/lean-proofs, Demonstrandum,
     AlphaProof results, ten-proofs, ...): new commits in the window.
  8. Trackers: Star Fleet Math's proposed-solution list (Erdős numbers),
     Epoch AI's FrontierMath open-problems pages, and 1stproof.org's
     batch/announcement links - new items only.

Zero dependencies (stdlib only). A state file remembers everything already
reported, so repeated runs only surface NEW finds. Every source fails soft:
a dead endpoint prints a note and the rest of the report still runs.

Usage:
  python scripts/find_ai_solves.py                    # last 5 days, all sources
  python scripts/find_ai_solves.py --days 7
  python scripts/find_ai_solves.py --sources github,zenodo   # subset (arxiv,
                                                     # github, erdos, zenodo, feeds)
  python scripts/find_ai_solves.py --reset            # forget seen-state first
  python scripts/find_ai_solves.py --since 2026-07-01 --until 2026-08-01
                                                      # a fixed window (backfills);
                                                      # same OAI harvest as daily
                                                      # mode, any size, resumable

Output is a Markdown report on stdout: triage it against the methodology
(vibemathed.com/methodology) before anything becomes an entry.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

from ratelimit import LIMITER

# Windows consoles default to cp1252, which cannot print the math papers'
# own characters. The report is UTF-8, unconditionally.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

STATE_FILE = Path(__file__).parent / ".find_ai_solves_state.json"

# The models whose mention in a paper marks it as AI-assisted work.
MODEL_TERMS = [
    "Claude", "GPT", "ChatGPT", "Codex", "Gemini", "Grok",
    "Aristotle", "AlphaProof", "AlphaEvolve", "LLM-assisted",
    # Agents seen in the wild that are not model brands.
    "Danus", "Rethlas", "AxiomProver",
]

# Generic phrasings, matched ONLY against a paper's own title and abstract.
# In full text they are worthless: "Conference on Artificial Intelligence and
# Statistics" is a venue, "large language models (LLMs)" is usually a citation,
# and a 14-day sweep matching these anywhere returned 224 hits from 630 papers.
# In an abstract, the same words are the authors describing their own method.
GENERIC_TERMS = [
    "generative AI", "language model", "AI system", "AI-assisted",
    "AI-generated", "AI-guided", "artificial intelligence",
    "automated theorem prov",
]
GENERIC_RE = re.compile("|".join(re.escape(t) for t in GENERIC_TERMS), re.IGNORECASE)

# Contexts where a model mention means the opposite of a contribution. Writing
# help is below our bottom tier, so a paper whose only AI mention is a language
# -polishing declaration is not a candidate at all.
NOISE_RE = re.compile(
    r"improve the English|language editing|writing process|proofread|grammar"
    # Found by triage 2026-08-03: an isoperimetric paper's only model mention
    # was "used to help eliminate typos, mistakes and inconsistencies from the
    # text", which is the same class as English-polishing.
    r"|eliminate typos|inconsistencies from the text|copy-?edit"
    r"|Conference on Artificial|Journal of Artificial|Cited by",
    re.IGNORECASE,
)


def _model_term(t: str) -> str:
    """One model name, guarded against running into other words.

    No LETTERS on either side: "GPTV01" and "GPTW24" are citation keys,
    "grokking" is a phenomenon, "GPTs" is usually generalized probabilistic
    theories - each of these cost a full-text fetch and a human look in the
    May 2026 sweep. Digits stay allowed on purpose: "GPT4" and "Gemini 3
    Thinking" are real names.
    """
    return rf"(?<![A-Za-z]){re.escape(t)}(?![A-Za-z])"


MODEL_RE = re.compile("|".join(_model_term(t) for t in MODEL_TERMS), re.IGNORECASE)

# Contexts where a guarded term still is not a model. Each line is a real
# false positive from a measured sweep, not a guess: "Aristotle University of
# Thessaloniki" flagged an ergodic theory paper (2026-08-03); mathematics is
# full of French Claudes (Berge, Chevalley, Shannon's first name, and the
# Universite Claude Bernard in Lyon on half of all French affiliations); and
# "[GPT23]" is an author-initials citation key, which the letter guard cannot
# catch because a digit follows.
#
# Applied per SNIPPET: a paper mentioning both Claude-the-model and Claude
# Bernard still surfaces through the model snippet.
MODEL_FALSE_POSITIVE_RE = re.compile(
    r"Aristotle University|Aristotle's|Codex (?:Sinaiticus|Vaticanus)"
    r"|Universit[ée]\w* Claude|Claude[- ]Bernard"
    r"|Claude (?:Berge|Shannon|Chevalley|Laflamme|Gittelson|Bardos|LeBrun|Viterbo)"
    r"|GPT[A-Z]{0,2}\d{2}(?!\d)",
    re.IGNORECASE,
)

# What a resolution smells like, in a title or abstract.
RESOLUTION_RE = re.compile(
    r"conjecture|counterexample|disproo?f|disprov|open problem|open question"
    r"|long-?standing|resolv|settles?|refut|first proof"
    # "answers a question of X" is the commonest way a paper says it closed
    # something, and its absence hid both Danus results in July 2026.
    r"|answers? (?:a|the|this) question|answering (?:a|the) question"
    r"|affirmative answer|negative answer|remained open|left open"
    # Record ladders on a famous open problem never say "conjecture" or
    # "resolve" - they say "improved lower bound". That gap hid the whole
    # Shannon capacity chain (Gao 2607.27869, Buys-Polak-Zuiddam 2607.29681),
    # even though the catalog already had an entry for the same ladder.
    r"|improved? (?:lower|upper) bounds?|new (?:lower|upper) bounds?"
    r"|better (?:lower|upper) bounds?|sharpens?|strengthens?"
    r"|best (?:known|possible) bound|record",
    re.IGNORECASE,
)

# Categories where model names are the SUBJECT, not a disclosure. A paper in
# cs.LG about language models mentions "GPT" on every page, so the full-text
# product arm matches it every time; these supplied all eight junk hits in the
# measured sweeps. Excluded from the AI-mention test entirely, not from the
# scan - a genuine resolution posted here would still need a math cross-list.
ML_CATEGORIES = ("cs.LG", "cs.AI", "cs.CL", "cs.CV", "cs.NE", "cs.IR", "stat.ML")

ARXIV_CATEGORIES = [
    "math.CO", "math.NT", "math.AG", "math.PR", "math.GR", "math.CA",
    "math.MG", "math.AC", "math.GT", "math.LO", "math.OC", "math.SP",
    "math.DS", "math.AP", "math.RA", "math.RT", "math.FA", "math.ST",
    "cs.CC", "cs.DM", "cs.DS", "cs.FL", "cs.LG", "quant-ph", "math-ph",
]

# PR sources. ai_only repos report ONLY PRs whose title or body mentions a
# model - the volume filter for repos where every PR is about proofs.
PR_REPOS = [
    {"repo": "google-deepmind/formal-conjectures", "ai_only": False, "max_pages": 3},
    {"repo": "leanprover-community/mathlib4", "ai_only": True, "max_pages": 10},
]

# Announcement feeds worth watching, filtered by RESOLUTION_RE. The Kourovka
# blog posts solution announcements for the notebook's problems; Buzzard's
# Xena blog covers formalization-adjacent AI mathematics.
FEEDS = [
    ("OpenAI news", "https://openai.com/news/rss.xml"),
    ("DeepMind blog", "https://deepmind.google/blog/rss.xml"),
    ("Kourovka Notebook", "https://kourovkanotebookorg.wordpress.com/feed/"),
    ("Xena project", "https://xenaproject.wordpress.com/feed/"),
]

# Result-artifact repositories where labs and individuals drop proofs. A new
# commit is a triage signal; the commit message usually names the problem.
WATCHED_REPOS = [
    "plby/lean-proofs",
    "demonstrandum-research/artifacts",
    "google-deepmind/alphaproof-nexus-results",
    "google-deepmind/superhuman",
    "openai/ten-proofs",
    "pitmonticone/kourovka",
    "octonion/mathematics",
]

STARFLEET_URL = "https://www.starfleetmath.com/"
EPOCH_URL = "https://epoch.ai/frontiermath/open-problems"
FIRSTPROOF_URLS = [
    "https://1stproof.org/",
    "https://1stproof.org/second-batch.html",
]

ERDOS_WIKI_URL = (
    "https://github.com/teorth/erdosproblems/wiki/AI-contributions-to-Erd%C5%91s-problems"
)

UA = {"User-Agent": "vibemathed-finder/1.0 (rasmus.lindahl1996@gmail.com)"}

DATASET_URL = "https://vibemathed.com/api/dataset"
ARXIV_ID_RE = re.compile(r"arxiv\.org/(?:abs|html|pdf)/(\d{4}\.\d{4,5})", re.IGNORECASE)
FC_PR_RE = re.compile(r"github\.com/google-deepmind/formal-conjectures/pull/(\d+)", re.IGNORECASE)
MATHLIB_PR_RE = re.compile(r"github\.com/leanprover-community/mathlib4/pull/(\d+)", re.IGNORECASE)
ZENODO_ID_RE = re.compile(r"zenodo\.org/records?/(\d+)", re.IGNORECASE)
ERDOS_NUM_RE = re.compile(r"erdosproblems\.com/(\d+)", re.IGNORECASE)
GH_REPO_RE = re.compile(r"github\.com/([\w.-]+/[\w.-]+)", re.IGNORECASE)
VIBEMATHED_RE = re.compile(r"vibemathed\.com/problem/([\w-]+)", re.IGNORECASE)


def _pacing_note(host: str, code: int, wait: float, attempt: int, why: str) -> None:
    """Backoffs go to stderr, so the Markdown report on stdout stays clean."""
    label = f"HTTP {code}" if code else why
    print(f"  [pace] {host}: {label}, waiting {wait:.1f}s ({why}, attempt {attempt + 1})",
          file=sys.stderr, flush=True)


def fetch(url: str, timeout: int = 30) -> str:
    """Rate-limit-aware GET. Pacing is adaptive and shared per host - see
    scripts/ratelimit.py for why a fixed sleep was the wrong shape."""
    return LIMITER.fetch(url, UA, timeout=timeout, on_wait=_pacing_note).decode(
        "utf-8", errors="replace")


def load_state() -> dict:
    state = json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}
    # Older state files predate the newer sources; default every key.
    state.setdefault("seen_arxiv", [])
    state.setdefault("seen_prs", [])  # formal-conjectures numbers (legacy key)
    state.setdefault("seen_mathlib_prs", [])
    state.setdefault("seen_erdos_rows", [])
    state.setdefault("seen_zenodo", [])
    state.setdefault("seen_feed_items", [])
    state.setdefault("seen_index", [])
    state.setdefault("seen_repo_commits", [])
    state.setdefault("seen_tracker_items", [])
    # Last date the default (non --since) arXiv harvest completed through.
    # A run after a gap resumes from here instead of losing the gap days.
    state.setdefault("arxiv_oai_until", "")
    return state


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


def strip_tags(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


# -------------------------------------------------------------- catalog ----

def catalog_index() -> dict:
    """Ids already in the live catalog, per source kind.

    Pulled from the site's own public dataset endpoint (sourceUrl plus every
    extra link per entry), so finds that are already tracked get marked in the
    report instead of wasting triage time. Fails soft: if the site is
    unreachable, nothing gets marked and the report still prints.
    """
    known = {"arxiv": set(), "fc_prs": set(), "mathlib_prs": set(),
             "zenodo": set(), "erdos": set(), "gh": set(), "slugs": set()}
    try:
        data = json.loads(fetch(DATASET_URL))
    except Exception as e:
        print(f"_(catalog check skipped: {e})_\n", file=sys.stderr)
        return known
    for p in data.get("problems", []):
        known["slugs"].add(p.get("slug") or "")
        # The problemNumber FIELD, not the slug: famous Erdős problems live
        # under named slugs (erdos-planar-unit-distance is #90), so slug
        # parsing alone under-counts what the catalog already tracks.
        if p.get("problemNumber") is not None:
            known["erdos"].add(int(p["problemNumber"]))
        urls = [p.get("sourceUrl") or "", p.get("citationsUrl") or ""]
        urls += [link.get("url") or "" for link in p.get("links", [])]
        for u in urls:
            for m in ARXIV_ID_RE.finditer(u):
                known["arxiv"].add(m.group(1))
            for m in FC_PR_RE.finditer(u):
                known["fc_prs"].add(int(m.group(1)))
            for m in MATHLIB_PR_RE.finditer(u):
                known["mathlib_prs"].add(int(m.group(1)))
            for m in ZENODO_ID_RE.finditer(u):
                known["zenodo"].add(int(m.group(1)))
            for m in GH_REPO_RE.finditer(u):
                known["gh"].add(m.group(1).lower())
    return known


# ---------------------------------------------------------------- arXiv ----

# The OAI-PMH harvester: arXiv's own bulk interface, and the primary way this
# script reads arXiv now. Keyless, date-ranged, resumption-token paginated,
# ~1000 records per response - none of the search API's failure modes (the
# 12000-result cap, deep-pagination 500s, the sort-order dependence) exist
# here, because bulk harvesting is what OAI-PMH is FOR.
OAI_URL = "https://oaipmh.arxiv.org/oai"
# The sets covering ARXIV_CATEGORIES. OAI serves whole sets; the category
# filter runs client-side on each record's own category list.
OAI_SETS = ["math", "cs", "physics:math-ph", "physics:quant-ph"]
OAI_NS = {"oai": "http://www.openarchives.org/OAI/2.0/",
          "ax": "http://arxiv.org/OAI/arXiv/"}
CATEGORY_SET = set(ARXIV_CATEGORIES)


def arxiv_oai_window(from_date: str, until_date: str | None) -> list[dict]:
    """Resolution-flavoured papers with a created date in the window.

    Harvests by DATESTAMP (last metadata change), which is the only range
    OAI-PMH offers. A new paper's datestamp is its announcement day, but its
    `created` is the SUBMISSION day, typically days earlier - so the created
    filter takes slack before the window rather than aligning with it, or a
    one-day harvest would drop every new paper it returned (measured: 860
    in-category records on 2026-08-04, zero with created that same day).
    What the slack exists to exclude is the other kind of record a datestamp
    harvest returns: v2s and metadata edits of years-old papers. Overlap
    between adjacent sweeps is the seen-state's problem, and it handles it.
    Dates are YYYY-MM-DD, both ends inclusive, in arXiv's clock (UTC).
    """
    slack = (datetime.fromisoformat(from_date) - timedelta(days=14)).date().isoformat()
    papers: list[dict] = []
    for oai_set in OAI_SETS:
        token: str | None = None
        pages = 0
        while True:
            if token:
                query = f"verb=ListRecords&resumptionToken={urllib.parse.quote(token)}"
            else:
                query = (f"verb=ListRecords&metadataPrefix=arXiv&set={oai_set}"
                         f"&from={from_date}"
                         + (f"&until={until_date}" if until_date else ""))
            root = ET.fromstring(fetch(f"{OAI_URL}?{query}", timeout=90))
            err = root.find("oai:error", OAI_NS)
            if err is not None:
                # An empty window is an answer, not a failure.
                if err.get("code") == "noRecordsMatch":
                    break
                raise RuntimeError(f"OAI {err.get('code')}: {(err.text or '').strip()}")
            for rec in root.findall(".//oai:record", OAI_NS):
                meta = rec.find(".//ax:arXiv", OAI_NS)
                if meta is None:
                    continue  # deleted/withdrawn record: header only
                cats = (meta.findtext("ax:categories", "", OAI_NS) or "").split()
                if not CATEGORY_SET.intersection(cats):
                    continue
                created = meta.findtext("ax:created", "", OAI_NS)
                if created < slack or (until_date and created > until_date):
                    continue
                title = re.sub(r"\s+", " ", meta.findtext("ax:title", "", OAI_NS)).strip()
                abstract = re.sub(r"\s+", " ", meta.findtext("ax:abstract", "", OAI_NS)).strip()
                if RESOLUTION_RE.search(title + " " + abstract):
                    papers.append({
                        "id": meta.findtext("ax:id", "", OAI_NS),
                        "title": title, "abstract": abstract,
                        "primary": cats[0] if cats else "",
                    })
            pages += 1
            tok = root.find(".//oai:resumptionToken", OAI_NS)
            token = (tok.text or "").strip() if tok is not None else ""
            print(f"  [oai:{oai_set}] page {pages}, {len(papers)} flagged so far",
                  file=sys.stderr, flush=True)
            if not token:
                break
    # Cross-listed papers arrive once per set they belong to (math.CO + cs.DM
    # shows up in both harvests); one report each.
    seen_ids: set[str] = set()
    unique = []
    for p in papers:
        if p["id"] in seen_ids:
            continue
        seen_ids.add(p["id"])
        unique.append(p)
    return unique


def arxiv_recent(days: int, since: str | None = None, until: str | None = None) -> list[dict]:
    """FALLBACK: the search-API scan, used only when the OAI harvest fails.

    Papers in the target categories, resolution-flavoured only.

    Default mode pages backwards from now. That cannot reach past roughly a
    month: the result cap below is an absolute 12000, and these categories
    produce enough submissions to exhaust it in about that time, so an older
    window was simply unreachable no matter what --days said.

    Passing --since/--until instead puts a submittedDate range into the query
    itself, so the whole result set is the window and pagination starts at its
    newest edge. That is what makes historical sweeps possible.
    """
    cat_query = "+OR+".join(f"cat:{c}" for c in ARXIV_CATEGORIES)
    if since:
        cutoff = datetime.fromisoformat(since).replace(tzinfo=timezone.utc)
        hi = until or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        # Parentheses round the category OR group, or the AND binds to the
        # last category only and the window silently does nothing.
        window = (f"%28{cat_query}%29+AND+submittedDate:"
                  f"%5B{cutoff.strftime('%Y%m%d')}0000+TO+{hi.replace('-', '')}0000%5D")
    else:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        window = cat_query
    papers, start, page = [], 0, 200
    ns = {"a": "http://www.w3.org/2005/Atom"}
    # Hard stop scaled to the window: ~1500 submissions/day across these
    # categories, capped so a giant window cannot page forever.
    #
    # Scale it to the window actually being queried. With --since/--until the
    # span is the date range, NOT --days, whose default of 5 would cap a
    # three-week sweep at 7500 entries: paging would stop a third of the way
    # in, silently, having covered only the newest end. That is the same
    # silent-truncation failure as the swallowed paging error, arriving by a
    # different route.
    span_days = max(1, (datetime.fromisoformat(hi).replace(tzinfo=timezone.utc)
                        - cutoff).days) if since else days
    hard_stop = min(12000, 1500 * span_days)
    while start < hard_stop:
        url = (
            "http://export.arxiv.org/api/query?search_query=" + window
            + f"&sortBy=submittedDate&sortOrder=descending&start={start}&max_results={page}"
        )
        # arXiv 500s intermittently on deep pagination. Letting that propagate
        # discarded the entire scan and printed "0 papers scanned", which reads
        # as "nothing to find" rather than "the search broke" - the worst
        # possible failure mode for a recall tool. fetch() now retries with
        # adaptive backoff, so reaching this handler means it gave up; keep
        # what we have and say where paging stopped.
        try:
            root = ET.fromstring(fetch(url))
        except Exception as exc:
            print(f"_(arXiv paging stopped at start={start}: {exc}; "
                  f"{len(papers)} papers kept)_\n")
            break
        entries = root.findall("a:entry", ns)
        if not entries:
            break
        # Paging is the slow part and used to be completely silent: minutes of
        # nothing, indistinguishable from a hang. Report each page to stderr,
        # with the date reached so the remaining distance to the cutoff is
        # visible rather than guessed at.
        if entries:
            oldest = entries[-1].findtext("a:published", "", ns)[:10]
            print(f"  [page {start // page + 1}] {start + len(entries)} scanned, "
                  f"back to {oldest} (cutoff {cutoff:%Y-%m-%d}), "
                  f"{len(papers)} flagged", file=sys.stderr, flush=True)
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
                cat = e.find("{http://arxiv.org/schemas/atom}primary_category")
                papers.append({
                    "id": arxiv_id, "title": title, "abstract": abstract,
                    "primary": cat.get("term") if cat is not None else "",
                })
        if stop:
            break
        start += page
    else:
        # Fell out on the cap rather than on reaching the cutoff, so the older
        # end of the window was never looked at. Say so: a truncated sweep that
        # reads as a complete one is worse than no sweep, because it retires
        # the window from the todo list.
        print(f"_(arXiv paging hit the {hard_stop}-entry cap before reaching "
              f"{cutoff:%Y-%m-%d}; the older end of this window is UNSCANNED)_\n")
    return papers


def ai_mention_snippets(text: str) -> list[str]:
    """Model-mention snippets that survive the noise and collision filters.

    The single definition of "this text discloses AI involvement": the
    scanner and the regression corpus in test_find_ai_solves.py both call it,
    which is what makes editing the patterns above safe.
    """
    return [
        c for c in context_lines(text, MODEL_RE)
        if not NOISE_RE.search(c) and not MODEL_FALSE_POSITIVE_RE.search(c)
    ]


def arxiv_ai_mentions(paper: dict) -> tuple[list[str], str]:
    """Fetches the HTML full text (if any) and returns (snippets, how).

    `how` distinguishes the two very different reasons for scanning an
    abstract instead of a paper: "no-html" (arXiv has no HTML rendering,
    normal for PDF-only submissions) and "failed" (the fetch itself broke,
    which is a RECALL LOSS the report must count - a sweep that silently
    degrades to abstracts stops seeing disclosures at all, and that is how
    an hour of scanning once produced nothing).

    One fetch, of the unversioned id: arXiv serves the latest version there,
    and the old versioned-then-plain fallback just 404ed twice per PDF-only
    paper. PDFs are deliberately not parsed to keep this dependency-free.
    """
    plain_id = paper["id"].split("v")[0]
    how = "html"
    try:
        html = fetch(f"https://arxiv.org/html/{plain_id}")
    except urllib.error.HTTPError as err:
        html, how = paper["abstract"], ("no-html" if err.code == 404 else "failed")
    except Exception:
        html, how = paper["abstract"], "failed"
    text = re.sub(r"<[^>]+>", " ", html)
    return ai_mention_snippets(text), how


# --------------------------------------------------------------- GitHub ----

def github_prs(repo: str, days: int, ai_only: bool, max_pages: int) -> list[dict]:
    """Recent PRs (any state), paginated back to the cutoff.

    ai_only repos report only PRs whose title/body mentions a model; the rest
    also report resolution-flavoured titles.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    out = []
    for page_no in range(1, max_pages + 1):
        url = (f"https://api.github.com/repos/{repo}/pulls"
               f"?state=all&sort=created&direction=desc&per_page=100&page={page_no}")
        rows = json.loads(fetch(url))
        if not rows:
            break
        past_cutoff = False
        for pr in rows:
            created = datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00"))
            if created < cutoff:
                past_cutoff = True
                break
            text = (pr["title"] or "") + "\n" + (pr["body"] or "")
            ai = MODEL_RE.search(text) is not None
            proofy = re.search(
                r"disprov|prove|counterexample|solv", pr["title"] or "", re.IGNORECASE
            ) is not None
            if (ai_only and ai) or (not ai_only and (ai or proofy)):
                out.append({
                    "number": pr["number"],
                    "title": pr["title"],
                    "url": pr["html_url"],
                    "state": pr["state"] + (" (merged)" if pr.get("merged_at") else ""),
                    "ai_mention": ai,
                    "snippets": context_lines(text, MODEL_RE) if ai else [],
                })
        if past_cutoff:
            break
        time.sleep(1)  # unauthenticated API: 60 req/hour, be frugal
    return out


# ---------------------------------------------------- Tao's Erdős ledger ----

LEDGER_SECTIONS = [
    "1(a) AI standalone", "1(b) AI alongside literature",
    "1(c) AI building on literature", "1(d) AI with humans",
    "2(a) literature search", "2(b) formalization",
    "2(c) rewriting", "2(d) computation",
]


def erdos_ledger_rows() -> list[dict]:
    """Structured rows from Tao's AI-contributions wiki.

    The page is eight tables - four PRIMARY sections where the AI did
    mathematics, four SECONDARY ones (literature search, formalizing human
    proofs, rewriting, computation) that are not solves by the site's
    methodology. Outcome colors are Tao's confidence: green = full/vetted,
    white = unvetted candidate, yellow = partial/variant, red = incorrect.
    Problem links live in href attributes, so cells are parsed before
    tag-stripping.
    """
    html = fetch(ERDOS_WIKI_URL)
    body = html.split('<div class="markdown-body"', 1)[-1]
    tables = re.findall(r"<table.*?</table>", body, re.S)
    rows = []
    for ti, t in enumerate(tables[:8]):
        heads = [re.sub(r"<[^>]+>", "", h).strip()
                 for h in re.findall(r"<th[^>]*>(.*?)</th>", t, re.S)]
        for raw in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
            tds = re.findall(r"<td[^>]*>(.*?)</td>", raw, re.S)
            if not tds:
                continue
            cells = dict(zip(heads, (strip_tags(c).strip() for c in tds)))
            nums = sorted({int(m.group(1)) for m in ERDOS_NUM_RE.finditer(tds[0])})
            if not nums:
                continue
            links = [u for u in re.findall(r'href="([^"]+)"', raw)
                     if "erdosproblems.com" not in u and not u.startswith("#")]
            rows.append({
                "nums": nums,
                "section": LEDGER_SECTIONS[ti],
                "primary": ti <= 3,
                "systems": cells.get("AI systems", ""),
                "date": cells.get("Date", ""),
                "outcome": cells.get("Outcome", ""),
                "links": links[:4],
                "key": f"{','.join(map(str, nums))}|{LEDGER_SECTIONS[ti]}|"
                       f"{cells.get('Date', '')}|{cells.get('Outcome', '')}",
            })
    return rows


# ---------------------------------------------------------------- Zenodo ----

def zenodo_recent(days: int) -> list[dict]:
    """Recent Zenodo records that look like a resolution and mention a model."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    # No quoted phrases: Zenodo's query parser 400s on them. The client-side
    # RESOLUTION_RE / MODEL_RE re-check below covers the lost precision.
    q = urllib.parse.quote(
        "(conjecture OR counterexample OR disproof) "
        "AND (GPT OR Claude OR Gemini OR Codex)"
    )
    # size caps at 25 for unauthenticated requests; enough for a days-window.
    data = json.loads(fetch(
        f"https://zenodo.org/api/records?q={q}&sort=mostrecent&size=25"
    ))
    out = []
    for hit in data.get("hits", {}).get("hits", []):
        created = datetime.fromisoformat(hit["created"].replace("Z", "+00:00"))
        if created < cutoff:
            continue
        meta = hit.get("metadata", {})
        title = meta.get("title", "")
        desc = strip_tags(meta.get("description", "") or "")
        blob = f"{title}\n{desc}"
        # The query casts wide; require both signals up close before reporting.
        if not (RESOLUTION_RE.search(blob) and MODEL_RE.search(blob)):
            continue
        out.append({
            "id": hit["id"],
            "title": title,
            "url": f"https://zenodo.org/records/{hit['id']}",
            "created": created.date().isoformat(),
            "snippets": context_lines(blob, MODEL_RE),
        })
    return out


# ----------------------------------------------------------------- feeds ----

def feed_items(name: str, url: str, days: int) -> list[dict]:
    """RSS/Atom items in the window whose text is resolution-flavoured."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    root = ET.fromstring(fetch(url))
    atom = {"a": "http://www.w3.org/2005/Atom"}
    items = root.findall(".//item") or root.findall(".//a:entry", atom)
    out = []
    for it in items:
        title = it.findtext("title") or it.findtext("a:title", "", atom) or ""
        link = it.findtext("link") or ""
        if not link:
            link_el = it.find("a:link", atom)
            link = link_el.get("href", "") if link_el is not None else ""
        desc = it.findtext("description") or it.findtext("a:summary", "", atom) or ""
        stamp = (it.findtext("pubDate") or it.findtext("a:updated", "", atom) or "").strip()
        when = None
        if stamp:
            try:
                when = parsedate_to_datetime(stamp)
            except (TypeError, ValueError):
                try:
                    when = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
                except ValueError:
                    when = None
        if when is not None and when < cutoff:
            continue
        blob = strip_tags(f"{title} {desc}")
        # Feeds are general-purpose; only math-resolution items make the cut.
        if not RESOLUTION_RE.search(blob):
            continue
        out.append({
            "key": f"{name}:{link or title}",
            "feed": name,
            "title": strip_tags(title).strip(),
            "url": link.strip(),
            "date": when.date().isoformat() if when else "?",
        })
    return out


# ----------------------------------------------------- external claim index ----

def index_url() -> str:
    """The external index's URL, from env or a gitignored side file."""
    from os import environ
    url = environ.get("FINDER_INDEX_URL", "").strip()
    if url:
        return url
    side = Path(__file__).parent / ".finder_index_url"
    return side.read_text(encoding="utf-8").strip() if side.exists() else ""


def index_claims(known: dict) -> list[dict]:
    """Claims on the external index whose links match nothing we track.

    The index aggregates from more upstreams than any single source, so an
    unmatched claim is the strongest 'we are missing something' signal. A
    claim matches if ANY of its links resolves to a known arXiv id, Erdős
    number, GitHub repo, Zenodo record or vibemathed slug.
    """
    url = index_url()
    if not url:
        raise RuntimeError("no index URL configured (FINDER_INDEX_URL)")
    html = fetch(url, timeout=90)
    out = []
    for cid, body in re.findall(r'<article class="claim"[^>]*id="([^"]+)"(.*?)</article>', html, re.S):
        links = re.findall(r'href="(https?://[^"]+)"', body)
        hit = False
        for u in links:
            if (any(m.group(1) in known["arxiv"] for m in ARXIV_ID_RE.finditer(u))
                    or any(int(m.group(1)) in known["erdos"] for m in ERDOS_NUM_RE.finditer(u))
                    or any(m.group(1).lower() in known["gh"] for m in GH_REPO_RE.finditer(u))
                    or any(int(m.group(1)) in known["zenodo"] for m in ZENODO_ID_RE.finditer(u))
                    or any(m.group(1) in known["slugs"] for m in VIBEMATHED_RE.finditer(u))):
                hit = True
                break
        if hit:
            continue
        title = re.search(r"<h3><span>(.*?)</span></h3>", body, re.S)
        date = re.search(r'claim-date">([^<]+)<', body)
        out.append({
            "id": cid,
            "title": strip_tags(title.group(1)).strip() if title else cid,
            "date": date.group(1) if date else "?",
            "links": [u for u in links if not u.startswith(url)][:4],
        })
    return out


# ----------------------------------------------------------- watched repos ----

def repo_commits(repo: str, days: int) -> list[dict]:
    """Commits pushed to a watched artifact repo within the window."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    rows = json.loads(fetch(
        f"https://api.github.com/repos/{repo}/commits?since={cutoff}&per_page=30"
    ))
    out = []
    for c in rows:
        msg = (c.get("commit", {}).get("message") or "").splitlines()[0]
        out.append({
            "sha": c.get("sha", "")[:12],
            "key": f"{repo}@{c.get('sha', '')[:12]}",
            "repo": repo,
            "msg": msg[:110],
            "url": c.get("html_url", ""),
            "date": (c.get("commit", {}).get("committer", {}).get("date") or "")[:10],
        })
    return out


# --------------------------------------------------------------- trackers ----

def starfleet_numbers() -> list[int]:
    """Erdős numbers on Star Fleet Math's proposed-solutions list."""
    html = fetch(STARFLEET_URL)
    return sorted({int(m.group(1)) for m in ERDOS_NUM_RE.finditer(html)})


def epoch_problem_slugs() -> list[str]:
    """Problem pages on Epoch AI's FrontierMath open-problems index."""
    html = fetch(EPOCH_URL)
    slugs = {m.group(1) for m in re.finditer(r'href="/frontiermath/open-problems/([\w-]+)"', html)}
    return sorted(s for s in slugs if s not in ("about",) and not s.startswith("about"))


def firstproof_items() -> list[str]:
    """Document/batch links on the First Proof project pages."""
    out: set[str] = set()
    for url in FIRSTPROOF_URLS:
        html = fetch(url)
        for u in re.findall(r'href="([^"]+)"', html):
            if re.search(r"\.pdf$|batch|arxiv\.org|cmsa\.fas", u, re.I):
                out.add(u if u.startswith("http") else f"https://1stproof.org/{u.lstrip('/')}")
    return sorted(out)


# --------------------------------------------------------------- report ----

def main() -> int:
    ap = argparse.ArgumentParser()
    # 5, not 3. arXiv's search index advances when papers are ANNOUNCED, and
    # announcements pause at weekends: on Sunday 2026-08-02 the newest paper
    # in our categories was 75 hours old, so a 3-day cutoff landed three hours
    # past it and the source contributed nothing. The window has to exceed the
    # announcement gap, not the run cadence. Widening is free - the state file
    # dedupes, so a longer window costs fetch time, never repeated output.
    ap.add_argument("--days", type=int, default=5)
    ap.add_argument("--since", help="YYYY-MM-DD; query a submittedDate window instead of paging back from now")
    ap.add_argument("--until", help="YYYY-MM-DD; end of the --since window (default: today)")
    ap.add_argument("--reset", action="store_true", help="forget previously seen items")
    ap.add_argument(
        "--sources", default="arxiv,github,erdos,zenodo,feeds,index,repos,trackers",
        help="comma list: arxiv, github, erdos, zenodo, feeds, index, repos, trackers",
    )
    args = ap.parse_args()
    wanted = {s.strip() for s in args.sources.split(",") if s.strip()}

    state = load_state()
    if args.reset:
        state = {k: [] for k in state}

    known = catalog_index()

    window_label = (f"{args.since} to {args.until or 'today'}" if args.since
                    else f"last {args.days} days")
    print(f"# AI-solve candidates - {window_label}\n")
    print(f"_Catalog check: {len(known['arxiv'])} arXiv ids, "
          f"{len(known['fc_prs'])} formal-conjectures PRs, "
          f"{len(known['mathlib_prs'])} mathlib PRs, "
          f"{len(known['zenodo'])} Zenodo records and "
          f"{len(known['erdos'])} Erdős numbers already tracked on vibemathed.com._\n")

    if "arxiv" in wanted:
        print("## arXiv (resolution-flavoured papers mentioning a model)\n")
        seen = set(state["seen_arxiv"])
        # One code path for daily runs and backfills: a date window, harvested
        # over OAI-PMH. Daily mode self-heals - it resumes from the checkpoint
        # of the last completed harvest, so skipped days are covered by the
        # next run instead of falling between windows. The checkpoint lookback
        # is capped: a state file untouched for months must not silently turn
        # a daily run into a mega-harvest (run a --since sweep for the gap).
        today = datetime.now(timezone.utc).date()
        if args.since:
            from_date, until_date = args.since, args.until
        else:
            from_date = (today - timedelta(days=args.days)).isoformat()
            checkpoint = state["arxiv_oai_until"]
            if checkpoint and checkpoint < from_date:
                floor_date = (today - timedelta(days=30)).isoformat()
                if checkpoint < floor_date:
                    print(f"_(harvest checkpoint {checkpoint} is over 30 days old; "
                          f"resuming from {floor_date} - run --since {checkpoint} "
                          f"--until {floor_date} to cover the gap)_\n")
                    from_date = floor_date
                else:
                    from_date = checkpoint
            until_date = None
        harvested = False
        try:
            papers = arxiv_oai_window(from_date, until_date)
            harvested = True
        except Exception as e:
            # The search API remains as the fallback, with all its known
            # sharp edges; a failed harvest must not cost the day's scan.
            print(f"_(OAI harvest failed ({e}); falling back to the search API)_\n")
            try:
                papers = arxiv_recent(args.days, args.since, args.until)
            except Exception as e2:
                papers = []
                print(f"_(arXiv scan failed: {e2})_\n")
        if harvested and not args.since:
            state["arxiv_oai_until"] = today.isoformat()
        print(f"_(window {from_date}..{until_date or 'today'} via "
              f"{'OAI-PMH' if harvested else 'search API'})_\n")
        # Seen-state may hold versioned ids from the search-API era; OAI ids
        # are unversioned. Compare and store version-blind.
        seen = {s.split("v")[0] for s in seen}
        for p in papers:
            p["id"] = p["id"].split("v")[0]
        new_papers = [p for p in papers if p["id"] not in seen]
        # The full-text fetches dominate the runtime and are independent; a small
        # pool keeps a week-sized sweep to minutes while staying polite to arXiv.
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(arxiv_ai_mentions, new_papers))
        all_snippets = [snips for snips, _ in results]
        no_html = sum(1 for _, how in results if how == "no-html")
        failed = sum(1 for _, how in results if how == "failed")
        hits = 0
        for p, snippets in zip(new_papers, all_snippets):
            seen.add(p["id"])
            # A product name anywhere in the full text, OR a generic phrasing in
            # the paper's own abstract. The second arm exists for papers that
            # describe their method without naming a product ("AI systems
            # generated key ideas and proofs"), which the product list alone
            # cannot see; restricting it to the abstract keeps venue names and
            # citation lists out.
            abstract = p["title"] + " " + p["abstract"]
            # Gate the generic arm on the primary category. In cs.LG or cs.CL,
            # "language model" is the paper's SUBJECT, not a disclosure about
            # how it was written, and those categories supplied every one of
            # the eight junk hits in the first measured sweep.
            primary = p.get("primary", "")
            if primary in ML_CATEGORIES:
                continue
            mathy = primary.startswith(("math", "quant-ph"))
            generic = (
                mathy and GENERIC_RE.search(abstract) and not NOISE_RE.search(abstract)
            )
            if not snippets and not generic:
                continue
            if not snippets:
                snippets = [f"(abstract) …{abstract[:220]}…"]
            hits += 1
            # Marked rather than hidden: one paper can hold a second, untracked
            # result, so "already in catalog" is a triage hint, not a filter.
            tracked = " **[already in catalog]**" if p["id"].split("v")[0] in known["arxiv"] else ""
            print(f"### [{p['title']}](https://arxiv.org/abs/{p['id']}){tracked}")
            print(f"- id: {p['id']}")
            for s in snippets:
                print(f"- {s}")
            print()
        print(f"_({len(papers)} resolution-flavoured papers scanned "
              f"({len(new_papers)} new; {no_html} abstract-only, no HTML; "
              f"{failed} full-text fetches FAILED), {hits} with AI mentions)_\n")
        # Degraded recall must not read as a quiet day. "No HTML" is a fact
        # about the paper; "failed" is a fact about this run, and enough of
        # them means the window is NOT covered even though the report ends
        # normally.
        if failed > max(3, len(new_papers) // 20):
            print(f"**WARNING: {failed} of {len(new_papers)} full-text fetches "
                  f"failed, so those papers were scanned on abstracts alone, "
                  f"where disclosures never appear. Re-run before treating "
                  f"this window as covered.**\n")
        state["seen_arxiv"] = sorted(seen)

    if "github" in wanted:
        for cfg in PR_REPOS:
            repo = cfg["repo"]
            legacy = repo == "google-deepmind/formal-conjectures"
            state_key = "seen_prs" if legacy else "seen_mathlib_prs"
            known_key = "fc_prs" if legacy else "mathlib_prs"
            gate = " (AI-disclosing PRs only)" if cfg["ai_only"] else ""
            print(f"## {repo} PRs{gate}\n")
            seen = set(state[state_key])
            try:
                prs = github_prs(repo, args.days, cfg["ai_only"], cfg["max_pages"])
            except Exception as e:
                prs = []
                print(f"_(scan failed: {e})_")
            new_prs = [pr for pr in prs if pr["number"] not in seen]
            for pr in new_prs:
                seen.add(pr["number"])
                flag = " [AI mention]" if pr["ai_mention"] else ""
                if pr["number"] in known[known_key]:
                    flag += " **[already in catalog]**"
                print(f"- [#{pr['number']} {pr['title']}]({pr['url']}) - {pr['state']}{flag}")
                for s in pr["snippets"]:
                    print(f"  - {s}")
            print(f"\n_({len(prs)} matching PRs in window, {len(new_prs)} new)_\n")
            state[state_key] = sorted(seen)

    if "erdos" in wanted:
        print("## Tao's AI-contributions ledger (teorth/erdosproblems wiki)\n")
        seen = set(state["seen_erdos_rows"])
        try:
            rows = erdos_ledger_rows()
        except Exception as e:
            rows = []
            print(f"_(wiki scan failed: {e})_")
        fresh = [r for r in rows if r["key"] not in seen]
        seen.update(r["key"] for r in fresh)
        # Only rows on problems the catalog lacks are triage work, and only
        # PRIMARY rows can be solves. Solve-grade rows (a green full solution
        # or a white unvetted candidate) get full detail; yellow partials and
        # red incorrect claims get a one-liner; secondary rows just a count.
        untracked = [r for r in fresh
                     if not all(n in known["erdos"] for n in r["nums"])]
        solve_grade = [r for r in untracked if r["primary"]
                       and ("🟢" in r["outcome"] or "⚪" in r["outcome"])
                       # A "new proof" of an already-solved problem is a
                       # re-proof, not a first solve - out of scope.
                       and "new proof" not in r["outcome"].lower()]
        other_primary = [r for r in untracked if r["primary"] and r not in solve_grade]
        secondary = [r for r in untracked if not r["primary"]]
        if solve_grade:
            print("### Solve-grade rows (full solutions and candidates)\n")
        for r in solve_grade:
            probs = ", ".join(f"[#{n}](https://www.erdosproblems.com/{n})" for n in r["nums"])
            print(f"- {probs} **{r['outcome']}** - {r['systems']}, {r['date']} ({r['section']})")
            for u in r["links"]:
                print(f"  - <{u}>")
        if other_primary:
            print("\n### Other new primary rows (partials, variants, incorrect claims)\n")
        for r in other_primary:
            probs = ", ".join(f"#{n}" for n in r["nums"])
            print(f"- {probs} {r['outcome']} - {r['systems']}, {r['date']} ({r['section']})")
        print(f"\n_({len(rows)} ledger rows, {len(fresh)} new since last run: "
              f"{len(solve_grade)} solve-grade, {len(other_primary)} other primary, "
              f"{len(secondary)} secondary (literature/formalization/rewrite/compute, "
              f"not solves) on uncatalogued problems)_\n")
        state["seen_erdos_rows"] = sorted(seen)

    if "zenodo" in wanted:
        print("## Zenodo (resolution-flavoured records mentioning a model)\n")
        seen = set(state["seen_zenodo"])
        try:
            records = zenodo_recent(args.days)
        except Exception as e:
            records = []
            print(f"_(Zenodo scan failed: {e})_")
        new_records = [r for r in records if r["id"] not in seen]
        for r in new_records:
            seen.add(r["id"])
            tracked = " **[already in catalog]**" if r["id"] in known["zenodo"] else ""
            print(f"### [{r['title']}]({r['url']}){tracked}")
            print(f"- uploaded {r['created']}")
            for s in r["snippets"]:
                print(f"- {s}")
            print()
        print(f"_({len(records)} matching records in window, {len(new_records)} new)_\n")
        state["seen_zenodo"] = sorted(seen)

    if "index" in wanted:
        print("## External claim index (claims matching nothing in our catalog)\n")
        seen = set(state["seen_index"])
        try:
            claims = index_claims(known)
        except Exception as e:
            claims = []
            print(f"_(index scan failed: {e})_")
        fresh = [c for c in claims if c["id"] not in seen]
        seen.update(c["id"] for c in fresh)
        for c in fresh:
            print(f"- [{c['date']}] **{c['title']}**")
            for u in c["links"]:
                print(f"  - <{u}>")
        print(f"\n_({len(claims)} unmatched claims on the index, {len(fresh)} new "
              f"since last run. Unmatched is a triage signal, not a verdict - the "
              f"index also lists partials, re-proofs and things we excluded on purpose.)_\n")
        state["seen_index"] = sorted(seen)

    if "repos" in wanted:
        print("## Watched artifact repositories (new commits)\n")
        seen = set(state["seen_repo_commits"])
        shown = 0
        for repo in WATCHED_REPOS:
            try:
                commits = repo_commits(repo, args.days)
            except Exception as e:
                print(f"_({repo}: {e})_")
                continue
            for c in commits:
                if c["key"] in seen:
                    continue
                seen.add(c["key"])
                shown += 1
                print(f"- **{c['repo']}** [{c['msg']}]({c['url']}) - {c['date']}")
            time.sleep(1)  # unauthenticated API budget
        print(f"\n_({shown} new commits across {len(WATCHED_REPOS)} watched repos)_\n")
        state["seen_repo_commits"] = sorted(seen)

    if "trackers" in wanted:
        print("## Trackers (Star Fleet Math, Epoch AI, First Proof)\n")
        seen = set(state["seen_tracker_items"])
        shown = 0
        try:
            for n in starfleet_numbers():
                key = f"starfleet:{n}"
                if key in seen:
                    continue
                seen.add(key)
                shown += 1
                tracked = " **[already in catalog]**" if n in known["erdos"] else ""
                print(f"- **Star Fleet Math** proposes [Erdős #{n}](https://www.erdosproblems.com/{n}){tracked}")
        except Exception as e:
            print(f"_(Star Fleet scan failed: {e})_")
        try:
            for s in epoch_problem_slugs():
                key = f"epoch:{s}"
                if key in seen:
                    continue
                seen.add(key)
                shown += 1
                print(f"- **Epoch AI** open problem [{s}](https://epoch.ai/frontiermath/open-problems/{s})")
        except Exception as e:
            print(f"_(Epoch scan failed: {e})_")
        try:
            for u in firstproof_items():
                key = f"1stproof:{u}"
                if key in seen:
                    continue
                seen.add(key)
                shown += 1
                print(f"- **First Proof** <{u}>")
        except Exception as e:
            print(f"_(First Proof scan failed: {e})_")
        print(f"\n_({shown} new tracker items)_\n")
        state["seen_tracker_items"] = sorted(seen)

    if "feeds" in wanted:
        print("## Announcement feeds\n")
        seen = set(state["seen_feed_items"])
        shown = 0
        for name, url in FEEDS:
            try:
                items = feed_items(name, url, args.days)
            except Exception as e:
                print(f"_({name} feed failed: {e})_")
                continue
            for it in items:
                if it["key"] in seen:
                    continue
                seen.add(it["key"])
                shown += 1
                print(f"- **{it['feed']}** [{it['title']}]({it['url']}) - {it['date']}")
        print(f"\n_({shown} new resolution-flavoured feed items)_")
        state["seen_feed_items"] = sorted(seen)

    save_state(state)
    # Persist what this run learned about each host's tolerance, so the next
    # invocation starts at the right pace instead of rediscovering the limit.
    LIMITER.save()
    print(f"  [pace] learned: {LIMITER.status()}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
