#!/usr/bin/env python3
"""Finds newly released AI/LLM benchmarks and evaluations on arXiv.

Sibling of find_ai_solves.py and built the same way: arXiv's OAI-PMH bulk
interface (keyless, date-ranged, resumption-token paginated), stdlib only,
Markdown report on stdout, progress on stderr.

The hard part is not finding papers that mention a benchmark - almost every
LLM paper does - it is finding papers that RELEASE one. Two gates run in
series:

  1. a release gate, which wants "we introduce/present/release <thing>"
     within a few words of a benchmark noun, so that papers merely *scoring*
     on MMLU are dropped;
  2. an AI gate, so that a new benchmark for protein folding software does
     not arrive alongside the language-model ones.

What survives is then SCORED on four named axes, because "interesting" is
not one thing:

  novelty  - measures something nothing measured before (a claimed first, an
             argued gap in existing benchmarks), not a harder rerun;
  design   - cleverness of mechanism: verifiable or execution-based grading,
             renewable task generation, contamination defeated by
             construction, process-level evaluation. Leaning on
             LLM-as-a-judge costs a point; replacing it earns one;
  utility  - real data, real stakes, tasks deployment actually faces;
  headroom - the frontier fails it. Still a signal, no longer the dominant
             one: a clever, novel, useful benchmark at 60% beats a routine
             QA set at 8%.

Ties break towards papers positive on more axes. Scores are heuristics over
title and abstract. They are a triage order, NOT a verdict: the report
prints the evidence for every point it awards so the ranking can be argued
with, and the top of the list still has to be read.

Usage:
  python scripts/find_benchmarks.py                     # last 30 days, top 10
  python scripts/find_benchmarks.py --days 7 --top 20
  python scripts/find_benchmarks.py --since 2026-07-01 --until 2026-08-01
  python scripts/find_benchmarks.py --all               # every hit, not just top
  python scripts/find_benchmarks.py --json out.json     # machine-readable too
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
from datetime import date, datetime, timedelta

UA = "vibemathed-benchmark-finder/1.0 (+https://vibemathed.com)"

# Where AI benchmarks are announced. stat.ML is included because a good few
# eval papers cross-list there and nowhere else in cs.
ARXIV_CATEGORIES = [
    "cs.AI", "cs.CL", "cs.LG", "cs.CV", "cs.SE", "cs.IR",
    "cs.MA", "cs.HC", "cs.CY", "cs.RO", "stat.ML",
]
CATEGORY_SET = set(ARXIV_CATEGORIES)

OAI_URL = "https://oaipmh.arxiv.org/oai"
OAI_SETS = ["cs", "stat"]
OAI_NS = {"oai": "http://www.openarchives.org/OAI/2.0/",
          "ax": "http://arxiv.org/OAI/arXiv/"}

# ---------------------------------------------------------------- the gates

BENCH_NOUN = (
    r"(?:benchmark|benchmarks|eval(?:uation)?\s+suite|evaluation\s+benchmark|"
    r"test\s*bed|testbed|dataset|data\s+set|challenge\s+set|task\s+suite|"
    r"leaderboard|arena|evaluation\s+framework|diagnostic\s+suite|"
    r"question\s+set|exam|corpus)"
)
# "we introduce X, a benchmark" / "we release the FooBench benchmark" /
# "X: a benchmark for ...". The window between verb and noun is deliberately
# short - at 200 characters this matched papers that introduced a *method*
# and evaluated it on a benchmark two clauses later, and even at 80 it let
# through a fine-tuning method paper whose sentence mentioned safety
# benchmarks in passing (DataRx, caught in the 2026-08 run). 60 keeps the
# noun in the object position of the release verb.
RELEASE_RE = re.compile(
    r"\b(?:we\s+)?(?:introduce|present|propose|release|construct|curate|"
    r"develop|build|contribute|open-?source|publish)\b[^.]{0,60}?" + BENCH_NOUN,
    re.I,
)
# The other common shape, in titles: "SomeBench: A Benchmark for ..."
TITLE_RE = re.compile(r":\s*(?:a|an|the)?\s*[^.]{0,40}" + BENCH_NOUN, re.I)
# Named-benchmark shape, e.g. "MathArena", "SWE-Bench", "GPQA-Diamond".
COINED_RE = re.compile(r"\b[A-Z][A-Za-z0-9]*(?:-?Bench|Bench-?[A-Za-z0-9]*|"
                       r"-?Eval|Arena|QA|Suite)\b")

AI_RE = re.compile(
    r"\b(?:LLM|LLMs|large language model|language model|foundation model|"
    r"vision[- ]language|multimodal model|VLM|MLLM|generative model|"
    r"AI agent|agentic|chatbot|GPT|ChatGPT|Claude|Gemini|Llama|Qwen|Mistral|"
    r"DeepSeek|Grok|frontier model|reasoning model)\b",
    re.I,
)

FRONTIER_RE = re.compile(
    r"\b(?:GPT-?5(?:\.\d)?|GPT-?4(?:\.\d)?o?|o[1-4](?:-mini|-pro)?|"
    r"Claude\s*(?:Opus|Sonnet|Haiku|Fable)?\s*[3-5](?:\.\d)?|"
    r"Gemini\s*[1-3](?:\.\d)?|Grok\s*[2-5]|DeepSeek[- ]?(?:V[23]|R1)|"
    r"Llama\s*[3-5]|Qwen\s*[23](?:\.\d)?|frontier model)\b",
    re.I,
)

# "the best model reaches only 12.4%" and friends. The number and the word
# that qualifies it are both captured, because "only" is what separates a
# headroom claim from a victory lap.
LOW_SCORE_RE = re.compile(
    r"(?:only|merely|just|below|less than|at most|fails? to exceed|no better than|"
    r"a mere)\s*(?:about|around|~)?\s*(\d{1,2}(?:\.\d+)?)\s*%",
    re.I,
)
ANY_SCORE_RE = re.compile(
    r"(?:accuracy|score|success rate|pass@?\d?|solve rate|F1|win rate)\D{0,30}?"
    r"(\d{1,3}(?:\.\d+)?)\s*%", re.I)
HUMAN_BASE_RE = re.compile(
    r"\b(?:human\s+(?:baseline|performance|expert|annotator|accuracy|ceiling)|"
    r"expert\s+(?:baseline|performance|annotator)|human[- ]level)\b", re.I)
CONTAM_RE = re.compile(
    r"\b(?:contamination|decontaminat\w+|data\s+leakage|held[- ]out|"
    r"unseen|memoriz\w+|freshly\s+(?:collected|written)|newly\s+(?:created|written)|"
    r"private\s+(?:set|split)|dynamic\s+benchmark|live\s+benchmark)\b", re.I)
EXPERT_RE = re.compile(
    r"\b(?:expert[- ]written|expert[- ]curated|expert[- ]annotated|"
    r"PhD[- ]level|olympiad|research[- ]level|professional\w*[- ]written|"
    r"domain expert)\b", re.I)
SIZE_RE = re.compile(
    r"\b(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?\s*[kKmM])\s+"
    r"(?:questions|problems|tasks|items|instances|examples|samples|prompts|"
    r"episodes|scenarios|queries)\b")
ARTIFACT_RE = re.compile(
    r"(https?://\S*(?:github|huggingface|hf\.co|zenodo|osf\.io|codalab)\S*)", re.I)
SATURATED_RE = re.compile(
    r"\b(?:saturat\w+|near[- ]?ceiling|solved\b|surpass(?:es|ed)?\s+human)\b", re.I)

# ---- the four curation axes. Each regex is one signal; the evidence line it
# ---- prints is the argument for the point it awards.

# NOVELTY: does the paper argue a measurement gap, or claim a first?
FIRST_RE = re.compile(
    r"\bfirst\s+(?:[a-z-]+\s+){0,3}?(?:benchmark|evaluation|testbed|dataset|"
    r"systematic (?:study|evaluation)|to (?:measure|evaluate|test))\b", re.I)
GAP_RE = re.compile(
    r"\b(?:existing|current|prior|previous|conventional|traditional)\s+"
    r"(?:benchmarks?|evaluations?|datasets?)\s[^.]{0,90}?"
    r"(?:fail|do(?:es)? not|don't|rarely|seldom|overlook|ignore|lack|miss|"
    r"under-?(?:measure|explore|estimate)|leave|cannot|struggle|fall short|"
    r"neglect|limited)|"
    r"\bno (?:existing|prior|dedicated|such)\s+(?:benchmark|dataset|evaluation)|"
    r"\bblind spot\b|\bremains? (?:unexplored|unmeasured|untested|poorly understood)",
    re.I)

# DESIGN (cleverness): how does the benchmark grade, and does it stay fresh?
VERIFIABLE_RE = re.compile(
    r"\b(?:execution[- ]based|executable|programmatically verif\w+|"
    r"verifiable (?:rewards?|answers?|metrics?|by construction)|"
    r"(?:unit|regression|maintainer(?:'s)?) tests|"
    r"gold answers? (?:are )?(?:computed|derived|executed)|"
    r"formal(?:ly)? verif\w+|proof check\w+|exact[- ]match verif\w+|"
    r"deterministic (?:grading|scoring|evaluation))\b", re.I)
RENEWABLE_RE = re.compile(
    r"\b(?:benchmark generator|procedurally generat\w+|synthesi[sz]ed answer-first|"
    r"dynamically generat\w+|renewable|continuously updat\w+|auto-?generat\w+ tasks|"
    r"parameteri[sz]ed (?:tasks|templates)|arbitrar(?:y|ily) (?:many|renewable))\b", re.I)
PROCESS_RE = re.compile(
    r"\b(?:step-?level|process-?level|per-?turn|turn-?level|fine-?grained "
    r"(?:diagnos\w+|evaluation|analysis)|reasoning process|intermediate steps?|"
    r"error attribut\w+|failure (?:taxonomy|attribution|localization))\b", re.I)
JUDGE_RE = re.compile(r"\bLLM[- ]as[- ]a[- ]judge\b", re.I)
JUDGE_REPLACED_RE = re.compile(
    r"\b(?:replac\w+|instead of|avoid\w*|without|rather than|mov\w+ (?:away|beyond))"
    r"[^.]{0,60}\bjudge\b|\bjudge\b[^.]{0,60}"
    r"\b(?:subjectiv|inconsisten|unreliab|replac)", re.I)

# UTILITY: is the data real and the task one deployment actually faces?
REAL_RE = re.compile(
    r"\b(?:real[- ]world|real user|production|deployed|in the wild|"
    r"mined from|authentic|clinical records?|patient|industrial|"
    r"live (?:repositories|systems?|database)|actual (?:usage|deployments?))\b", re.I)
STAKES_RE = re.compile(
    r"\b(?:safety[- ]critical|high[- ]stakes|medical|clinical|healthcare|triage|"
    r"security|vulnerab\w+|malware|legal|law\b|financial|finance|"
    r"misinformation|harmful)\b", re.I)
HUMAN_COST_RE = re.compile(
    r"\b(?:takes? (?:human|expert)s?[^.]{0,40}(?:hours?|days?)|"
    r"(?:median|average) of[^.]{0,25}(?:hours?|days?)|"
    r"(?:hours?|days?) of (?:human|expert|manual) (?:work|effort|labor))\b", re.I)


def fetch(url: str, timeout: int = 60) -> str:
    """GET with retry and polite backoff; arXiv 503s under load by design."""
    last = None
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = e
            wait = int(e.headers.get("Retry-After", 0) or 0) or 5 * (attempt + 1)
            print(f"  [http {e.code}] waiting {wait}s", file=sys.stderr, flush=True)
            time.sleep(wait)
        except Exception as e:                                  # noqa: BLE001
            last = e
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"fetch failed: {url}: {last}")


def harvest(from_date: str, until_date: str | None) -> list[dict]:
    """Every in-category record whose SUBMISSION date lands in the window.

    OAI ranges over datestamp (last metadata change), not submission, so the
    created filter takes slack before the window - a paper announced today was
    typically submitted a few days ago, and without the slack a short harvest
    returns records it then throws all of away. The same slack is why v2s of
    old papers have to be excluded on the far side.
    """
    slack = (datetime.fromisoformat(from_date) - timedelta(days=14)).date().isoformat()
    out: list[dict] = []
    for oai_set in OAI_SETS:
        token, pages, kept = None, 0, 0
        while True:
            if token:
                q = f"verb=ListRecords&resumptionToken={urllib.parse.quote(token)}"
            else:
                q = (f"verb=ListRecords&metadataPrefix=arXiv&set={oai_set}"
                     f"&from={from_date}" + (f"&until={until_date}" if until_date else ""))
            root = ET.fromstring(fetch(f"{OAI_URL}?{q}", timeout=120))
            err = root.find("oai:error", OAI_NS)
            if err is not None:
                if err.get("code") == "noRecordsMatch":
                    break
                raise RuntimeError(f"OAI {err.get('code')}: {(err.text or '').strip()}")
            for rec in root.findall(".//oai:record", OAI_NS):
                meta = rec.find(".//ax:arXiv", OAI_NS)
                if meta is None:
                    continue
                cats = (meta.findtext("ax:categories", "", OAI_NS) or "").split()
                if not CATEGORY_SET.intersection(cats):
                    continue
                created = meta.findtext("ax:created", "", OAI_NS)
                if created < slack or (until_date and created > until_date):
                    continue
                if created < from_date:
                    continue
                title = re.sub(r"\s+", " ", meta.findtext("ax:title", "", OAI_NS)).strip()
                abstract = re.sub(r"\s+", " ",
                                  meta.findtext("ax:abstract", "", OAI_NS)).strip()
                if not is_benchmark_release(title, abstract):
                    continue
                authors = []
                for a in meta.findall(".//ax:author", OAI_NS):
                    fn = (a.findtext("ax:forenames", "", OAI_NS) or "").strip()
                    kn = (a.findtext("ax:keyname", "", OAI_NS) or "").strip()
                    authors.append(f"{fn} {kn}".strip())
                out.append({
                    "id": meta.findtext("ax:id", "", OAI_NS),
                    "title": title,
                    "abstract": abstract,
                    "created": created,
                    "primary": cats[0] if cats else "",
                    "categories": cats,
                    "authors": authors,
                })
                kept += 1
            pages += 1
            tok = root.find(".//oai:resumptionToken", OAI_NS)
            token = (tok.text or "").strip() if tok is not None else ""
            print(f"  [oai:{oai_set}] page {pages}, {kept} benchmark releases so far",
                  file=sys.stderr, flush=True)
            if not token:
                break
    seen: set[str] = set()
    uniq = []
    for p in out:                       # cross-lists arrive once per set
        if p["id"] in seen:
            continue
        seen.add(p["id"])
        uniq.append(p)
    return uniq


def is_benchmark_release(title: str, abstract: str) -> bool:
    """Does this paper RELEASE an AI benchmark, rather than merely score on one?"""
    blob = f"{title}. {abstract}"
    if not AI_RE.search(blob):
        return False
    return bool(RELEASE_RE.search(blob) or TITLE_RE.search(title)
                or (COINED_RE.search(title) and re.search(BENCH_NOUN, blob, re.I)))


def score(p: dict) -> dict:
    """Rank by four named axes: novelty, design, utility, headroom.

    The axes exist because "interesting" is not one thing. NOVELTY asks
    whether the paper measures something nothing measured before, or just
    ships a harder version of an old test. DESIGN is cleverness of mechanism:
    verifiable grading, renewable task generation, contamination defeated by
    construction rather than by filtering. UTILITY asks whether the data is
    real and the task one deployment actually faces. HEADROOM keeps its old
    role - a benchmark the frontier already clears is a historical record -
    but no longer dominates: a clever, novel, useful benchmark at 60% beats
    a routine QA set at 8%.

    Every point carries its evidence string, because the score is a reading
    order and not a verdict.
    """
    blob = f"{p['title']}. {p['abstract']}"
    pts: list[tuple[str, int, str]] = []  # (axis, value, evidence)

    # ---- novelty
    if FIRST_RE.search(blob):
        pts.append(("novelty", 2, f'claims a first: "{FIRST_RE.search(blob).group(0)}"'))
    if GAP_RE.search(blob):
        gap = re.sub(r"\s+", " ", GAP_RE.search(blob).group(0))[:90]
        pts.append(("novelty", 2, f'argues a measurement gap: "{gap}"'))

    # ---- design
    if VERIFIABLE_RE.search(blob):
        pts.append(("design", 3,
                    f'verifiable grading: "{VERIFIABLE_RE.search(blob).group(0)}"'))
    if RENEWABLE_RE.search(blob):
        pts.append(("design", 2,
                    f'renewable by construction: "{RENEWABLE_RE.search(blob).group(0)}"'))
    if CONTAM_RE.search(blob):
        pts.append(("design", 2, "addresses contamination / held-out or fresh data"))
    if PROCESS_RE.search(blob):
        pts.append(("design", 1,
                    f'grades the process, not just the answer: "{PROCESS_RE.search(blob).group(0)}"'))
    if JUDGE_RE.search(blob):
        if JUDGE_REPLACED_RE.search(blob):
            pts.append(("design", 1, "replaces LLM-as-a-judge with something firmer"))
        else:
            pts.append(("design", -1, "relies on LLM-as-a-judge scoring"))
    if HUMAN_BASE_RE.search(blob):
        pts.append(("design", 1, "reports a human or expert baseline"))

    # ---- utility
    if REAL_RE.search(blob):
        pts.append(("utility", 2, f'real data or setting: "{REAL_RE.search(blob).group(0)}"'))
    if STAKES_RE.search(blob):
        pts.append(("utility", 1, f'high-stakes domain: "{STAKES_RE.search(blob).group(0)}"'))
    if HUMAN_COST_RE.search(blob):
        pts.append(("utility", 2,
                    f'tasks carry real human cost: "{HUMAN_COST_RE.search(blob).group(0)}"'))
    if EXPERT_RE.search(blob):
        pts.append(("utility", 1, "expert-written or research-level tasks"))
    if ARTIFACT_RE.search(blob):
        pts.append(("utility", 1, "links a public artifact"))
    sz = SIZE_RE.search(blob)
    if sz:
        pts.append(("utility", 1, f"stated size: {sz.group(0)}"))

    # ---- headroom
    low = LOW_SCORE_RE.search(blob)
    if low:
        v = float(low.group(1))
        if v <= 10:
            pts.append(("headroom", 4, f"frontier scores only {low.group(1)}% - very large headroom"))
        elif v <= 30:
            pts.append(("headroom", 3, f"frontier scores only {low.group(1)}% - large headroom"))
        else:
            pts.append(("headroom", 1, f"frontier scores only {low.group(1)}%"))
    else:
        best = [float(m.group(1)) for m in ANY_SCORE_RE.finditer(blob)]
        best = [b for b in best if b <= 100]
        if best and min(best) <= 40:
            pts.append(("headroom", 1, f"reported scores as low as {min(best):g}%"))
        elif best and max(best) >= 90:
            pts.append(("headroom", -2, f"reported scores up to {max(best):g}% - little headroom"))
    if SATURATED_RE.search(blob):
        pts.append(("headroom", -2, "describes saturation or human parity"))
    if FRONTIER_RE.search(blob):
        names = sorted({m.group(0) for m in FRONTIER_RE.finditer(blob)})[:4]
        pts.append(("headroom", 1, "evaluates named frontier models: " + ", ".join(names)))

    axes = {"novelty": 0, "design": 0, "utility": 0, "headroom": 0}
    for axis, v, _ in pts:
        axes[axis] += v
    return {
        "score": sum(axes.values()),
        "axes": axes,
        "why": [f"[{a}] {w}" for a, _, w in pts],
    }


def spread(p: dict) -> int:
    """How many axes the paper scores positive on. Used as the tie-breaker:
    at equal totals, strong-on-three-axes beats spiking one axis, because
    the axes were chosen to be independent reasons to care."""
    return sum(1 for v in p["axes"].values() if v > 0)


def report(papers: list[dict], args, window: tuple[str, str]) -> None:
    ranked = sorted(papers, key=lambda p: (-p["score"], -spread(p), p["created"]))
    shown = ranked if args.all else ranked[: args.top]
    print(f"# Benchmark releases on arXiv, {window[0]} to {window[1]}\n")
    print(f"_{len(papers)} benchmark-release papers found across "
          f"{', '.join(ARXIV_CATEGORIES)}; showing "
          f"{'all' if args.all else f'the top {len(shown)} by score'}._\n")
    print("_Scored on four axes - novelty (measures something new), design "
          "(verifiable, renewable, contamination-proof mechanisms), utility "
          "(real data, real stakes) and headroom (the frontier fails it). "
          "Ties break towards papers positive on more axes. The score is a "
          "reading order, not a verdict - every point prints its evidence "
          "so the ranking can be argued with._\n")
    for i, p in enumerate(shown, 1):
        auth = ", ".join(p["authors"][:3]) + (" et al." if len(p["authors"]) > 3 else "")
        ax = p["axes"]
        print(f"## {i}. {p['title']}")
        print(f"- arXiv:{p['id']} ({p['primary']}, submitted {p['created']}) - "
              f"https://arxiv.org/abs/{p['id']}")
        print(f"- {auth}")
        print(f"- **score {p['score']}** (novelty {ax['novelty']}, design {ax['design']}, "
              f"utility {ax['utility']}, headroom {ax['headroom']})")
        for w in p["why"]:
            print(f"  - {w}")
        abstract = p["abstract"]
        print(f"- {abstract[:600]}{'...' if len(abstract) > 600 else ''}\n")
    if not shown:
        print("_Nothing matched. Widen the window, or the gates are too tight._")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=30,
                    help="window ending today (default 30)")
    ap.add_argument("--since", help="YYYY-MM-DD, overrides --days")
    ap.add_argument("--until", help="YYYY-MM-DD")
    ap.add_argument("--top", type=int, default=10, help="how many to print (default 10)")
    ap.add_argument("--all", action="store_true", help="print every hit, not just the top")
    ap.add_argument("--json", help="also write the full ranked list to this path")
    args = ap.parse_args()

    until = args.until or date.today().isoformat()
    since = args.since or (date.today() - timedelta(days=args.days)).isoformat()
    print(f"harvesting arXiv {since} to {until}...", file=sys.stderr, flush=True)

    papers = harvest(since, until)
    for p in papers:
        p.update(score(p))
    report(papers, args, (since, until))

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(sorted(papers, key=lambda p: -p["score"]), fh, indent=1)
        print(f"\n_Full ranked list written to {args.json}._")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
