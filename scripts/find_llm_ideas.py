#!/usr/bin/env python3
"""Finds new LLM / transformer IDEAS on arXiv - architectures, objectives,
optimizers, decoding and training methods - as opposed to benchmarks or
applications.

Third of the family, after find_ai_solves.py and find_benchmarks.py, and
built the same way: arXiv's OAI-PMH bulk interface, stdlib only, Markdown on
stdout, progress on stderr.

The filtering problem here is the mirror image of the benchmark finder's.
Nearly every paper in cs.CL "proposes a method", so a proposal verb alone
selects the whole category. Three gates run in series:

  1. an AI gate, so the harvest stays on language models and transformers;
  2. a CONTRIBUTION gate, wanting a proposal verb close to a machinery noun -
     an attention mechanism, an objective, an optimizer, a decoding
     algorithm, a positional encoding - rather than close to "framework",
     which means nothing;
  3. an EXCLUSION gate for the three things that otherwise flood the top:
     survey and position papers, benchmark releases (they have their own
     script), and pure applications of an existing method to a new domain.

What survives is scored on four axes, which are the ways an idea can matter:

  reach     - does it apply to transformers in general, at pretraining or
              inference, or to one task in one domain? Multi-scale
              validation and scaling-law evidence count here;
  mechanism - does it change something load-bearing (attention, optimizer,
              objective, tokenizer, memory) or wrap the model in a prompt?
              A prompting-only contribution scores negative;
  evidence  - parameter counts, token budgets, ablations, released weights,
              theory. Big claims with a 125M-parameter experiment do not
              survive contact with this axis;
  effect    - the size of the reported win: speedups, memory and FLOP
              reductions, context-length multipliers, quality deltas.

Scores are heuristics over title and abstract, a triage order and not a
verdict. The evidence for every point is printed so the ranking can be
argued with, and the top of the list still has to be read.

Usage:
  python scripts/find_llm_ideas.py                     # last 30 days, top 10
  python scripts/find_llm_ideas.py --days 90 --top 30
  python scripts/find_llm_ideas.py --since 2026-05-14 --until 2026-08-12
  python scripts/find_llm_ideas.py --all --json out.json
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

UA = "vibemathed-llm-idea-finder/1.0 (+https://vibemathed.com)"

ARXIV_CATEGORIES = ["cs.CL", "cs.LG", "cs.AI", "cs.NE", "stat.ML"]
CATEGORY_SET = set(ARXIV_CATEGORIES)

OAI_URL = "https://oaipmh.arxiv.org/oai"
OAI_SETS = ["cs", "stat"]
OAI_NS = {"oai": "http://www.openarchives.org/OAI/2.0/",
          "ax": "http://arxiv.org/OAI/arXiv/"}

# ---------------------------------------------------------------- the gates

AI_RE = re.compile(
    r"\b(?:LLM|LLMs|large language model|language model|transformer|"
    r"foundation model|GPT|attention|autoregressive|decoder-only|"
    r"vision[- ]language|multimodal model|MoE|mixture[- ]of[- ]experts|"
    r"state[- ]space model|diffusion language model)\b", re.I)

# The load-bearing parts of a model. Deliberately does NOT include
# "framework", "pipeline" or "approach", which every paper claims.
MACHINERY = (
    r"(?:attention(?:\s+mechanism)?|self-attention|linear attention|"
    r"positional (?:encoding|embedding)|tokeni[sz]er|tokeni[sz]ation|"
    r"objective(?:\s+function)?|loss(?:\s+function)?|optimi[sz]er|"
    r"architecture|layer|block|normali[sz]ation|activation function|"
    r"KV[- ]cache|key-value cache|context window|memory mechanism|"
    r"recurrence|state[- ]space|mixture[- ]of[- ]experts|routing|"
    r"decoding (?:algorithm|strategy|scheme)|sampling (?:algorithm|strategy)|"
    r"speculative decoding|quanti[sz]ation|sparsity|pruning|distillation|"
    r"pre-?training (?:objective|recipe|scheme)|fine-?tuning method|"
    r"reinforcement learning|RLHF|RLVR|reward model|scaling law|"
    r"parameteri[sz]ation|initiali[sz]ation|embedding scheme|"
    r"inference (?:algorithm|engine|method)|training (?:algorithm|recipe|objective))"
)
PROPOSE = (r"(?:introduce|present|propose|develop|derive|design|"
           r"put forward|describe|contribute)")
CONTRIB_RE = re.compile(rf"\b(?:we\s+)?{PROPOSE}\b[^.]{{0,70}}?{MACHINERY}", re.I)
# "X: a new attention mechanism for ..." in the title
TITLE_CONTRIB_RE = re.compile(rf"[:\-]\s*[^.]{{0,50}}{MACHINERY}", re.I)
# Papers whose title is a bare mechanism claim, e.g. "Rethinking Attention"
MECH_TITLE_RE = re.compile(rf"^\W*(?:rethinking|revisiting|beyond|towards)\b"
                           rf"[^.]{{0,40}}{MACHINERY}", re.I)

SURVEY_RE = re.compile(
    r"\b(?:survey|systematic review|literature review|position paper|"
    r"a review of|overview of|tutorial|roadmap|taxonomy of|"
    r"empirical study of existing|reproducib\w+ study)\b", re.I)
BENCHMARK_RE = re.compile(
    r"\b(?:we\s+)?(?:introduce|present|release|construct|curate)\b[^.]{0,50}?"
    r"(?:benchmark|evaluation suite|dataset|leaderboard|test\s*bed)\b", re.I)
APPLICATION_RE = re.compile(
    r"\b(?:we (?:apply|use|employ|leverage|adapt|fine-?tune)\s+"
    r"(?:an? )?(?:existing |pre-?trained |off-the-shelf )?"
    r"(?:LLMs?|GPT|models?)\s+(?:to|for|on)\b|"
    r"\bcase study\b|\bin the context of\s+\w+ (?:industry|medicine|law))", re.I)

# ---- reach
GENERAL_RE = re.compile(
    r"\b(?:general[- ]purpose|architecture[- ]agnostic|model[- ]agnostic|"
    r"drop-?in replacement|any transformer|across (?:model )?(?:scales|"
    r"architectures|families)|plug-?and-?play|task[- ]agnostic|"
    r"applies? to any|broadly applicable)\b", re.I)
PRETRAIN_RE = re.compile(
    r"\b(?:pre-?train(?:ing|ed)? from scratch|pre-?training (?:objective|recipe|run)|"
    r"trained from scratch|continued pre-?training)\b", re.I)
SCALES_RE = re.compile(
    r"\b(?:across (?:model )?scales|(?:from|at) \d+\s*[MB]\s*(?:to|-)\s*\d+\s*[MB]|"
    r"scaling (?:law|curve|behaviou?r|analysis)|model sizes? (?:from|of)\s*\d)\b", re.I)

# ---- mechanism
CORE_CHANGE_RE = re.compile(
    r"\b(?:replaces?|replacing|instead of (?:softmax|attention|backprop)|"
    r"without (?:attention|softmax|backpropagation|a KV cache)|"
    r"new (?:attention|objective|optimi[sz]er|architecture|parameteri[sz]ation)|"
    r"alternative to (?:attention|transformers?|softmax)|"
    r"reformulat\w+|first-principles?|from first principles)\b", re.I)
THEORY_RE = re.compile(
    r"\b(?:we prove|proof|theorem|provably|theoretical(?:ly)? (?:guarantee|analysis|"
    r"justification)|closed[- ]form|convergence (?:guarantee|analysis|rate)|"
    r"lower bound|upper bound|optimality)\b", re.I)
PROMPT_ONLY_RE = re.compile(
    r"\b(?:prompt(?:ing)? (?:strategy|technique|method|engineering|template)|"
    r"chain-of-thought prompting|in-context (?:learning )?prompt|"
    r"we design a prompt|prompt-based)\b", re.I)

# ---- evidence
SCALE_RE = re.compile(r"\b(\d+(?:\.\d+)?)\s*([BMT])\s*(?:parameters?|params?|tokens?)\b")
ABLATION_RE = re.compile(r"\b(?:ablation|ablate|controlled (?:study|comparison)|"
                         r"matched[- ]compute|iso[- ]?FLOP|compute[- ]matched)\b", re.I)
OPEN_RE = re.compile(
    r"\b(?:we release|open-?source|publicly available|open weights?|"
    r"checkpoints? (?:are )?(?:released|available)|code (?:is )?available)\b", re.I)

# ---- effect
SPEED_RE = re.compile(
    r"\b(\d+(?:\.\d+)?)\s*(?:x|×|-fold|\s*times)\s*"
    r"(?:faster|speed-?up|throughput|higher throughput|less memory|"
    r"fewer (?:FLOPs?|parameters?)|longer|more efficient|reduction)\b", re.I)
PCT_CUT_RE = re.compile(
    r"\b(?:reduc\w+|cut\w*|lower\w*|sav\w+|shrink\w*)\D{0,40}?"
    r"(\d{1,2}(?:\.\d+)?)\s*%", re.I)
CONTEXT_RE = re.compile(
    r"\b(\d+(?:\.\d+)?)\s*([KM])\s*(?:token|-token)?\s*context\b", re.I)
SOTA_RE = re.compile(
    r"\b(?:state[- ]of[- ]the[- ]art|SOTA|outperform\w*|surpass\w*|"
    r"new best|matches? (?:GPT|Claude|Gemini))\b", re.I)


def fetch(url: str, timeout: int = 60) -> str:
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


def is_idea(title: str, abstract: str) -> bool:
    blob = f"{title}. {abstract}"
    if not AI_RE.search(blob):
        return False
    if SURVEY_RE.search(blob):
        return False
    # A benchmark release is the sibling script's job. It only disqualifies
    # when the paper is ONLY that - plenty of method papers ship a small eval
    # set alongside, and those still count as ideas.
    if BENCHMARK_RE.search(blob) and not CONTRIB_RE.search(blob):
        return False
    if APPLICATION_RE.search(blob) and not CONTRIB_RE.search(blob):
        return False
    return bool(CONTRIB_RE.search(blob) or TITLE_CONTRIB_RE.search(title)
                or MECH_TITLE_RE.search(title))


def _num(v: str, unit: str) -> float:
    return float(v) * {"K": 1e3, "M": 1e6, "B": 1e9, "T": 1e12}[unit.upper()]


def score(p: dict) -> dict:
    blob = f"{p['title']}. {p['abstract']}"
    pts: list[tuple[str, int, str]] = []

    # ---- reach
    if GENERAL_RE.search(blob):
        pts.append(("reach", 3, f'general-purpose claim: "{GENERAL_RE.search(blob).group(0)}"'))
    if PRETRAIN_RE.search(blob):
        pts.append(("reach", 2, f'operates at pretraining: "{PRETRAIN_RE.search(blob).group(0)}"'))
    if SCALES_RE.search(blob):
        pts.append(("reach", 2, f'validated across scales: "{SCALES_RE.search(blob).group(0)}"'))

    # ---- mechanism
    if CORE_CHANGE_RE.search(blob):
        pts.append(("mechanism", 3,
                    f'changes a load-bearing part: "{CORE_CHANGE_RE.search(blob).group(0)}"'))
    if THEORY_RE.search(blob):
        pts.append(("mechanism", 2, f'theory offered: "{THEORY_RE.search(blob).group(0)}"'))
    if PROMPT_ONLY_RE.search(blob) and not CORE_CHANGE_RE.search(blob):
        pts.append(("mechanism", -2, "prompting-level contribution only"))

    # ---- evidence
    sizes = [_num(v, u) for v, u in SCALE_RE.findall(blob)]
    if sizes:
        big = max(sizes)
        if big >= 3e10:
            pts.append(("evidence", 3, f"validated at {big/1e9:g}B scale or above"))
        elif big >= 5e9:
            pts.append(("evidence", 2, f"validated around {big/1e9:g}B"))
        else:
            pts.append(("evidence", 1, f"largest stated scale {big/1e9:g}B"))
    if ABLATION_RE.search(blob):
        pts.append(("evidence", 2,
                    f'controlled comparison: "{ABLATION_RE.search(blob).group(0)}"'))
    if OPEN_RE.search(blob):
        pts.append(("evidence", 1, "code, weights or checkpoints released"))

    # ---- effect
    sp = SPEED_RE.search(blob)
    if sp:
        v = float(sp.group(1))
        pts.append(("effect", 3 if v >= 5 else 2, f'reports a {sp.group(0)}'))
    ctx = CONTEXT_RE.search(blob)
    if ctx:
        pts.append(("effect", 2, f"context length: {ctx.group(0)}"))
    cut = PCT_CUT_RE.search(blob)
    if cut and float(cut.group(1)) >= 20:
        pts.append(("effect", 1, f'reports a cut of {cut.group(1)}%'))
    if SOTA_RE.search(blob):
        pts.append(("effect", 1, "claims state of the art or beats a frontier model"))

    axes = {"reach": 0, "mechanism": 0, "evidence": 0, "effect": 0}
    for axis, v, _ in pts:
        axes[axis] += v
    return {"score": sum(axes.values()), "axes": axes,
            "why": [f"[{a}] {w}" for a, _, w in pts]}


def harvest(from_date: str, until_date: str | None) -> list[dict]:
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
                if created < slack or created < from_date:
                    continue
                if until_date and created > until_date:
                    continue
                title = re.sub(r"\s+", " ", meta.findtext("ax:title", "", OAI_NS)).strip()
                abstract = re.sub(r"\s+", " ",
                                  meta.findtext("ax:abstract", "", OAI_NS)).strip()
                if not is_idea(title, abstract):
                    continue
                authors = []
                for a in meta.findall(".//ax:author", OAI_NS):
                    fn = (a.findtext("ax:forenames", "", OAI_NS) or "").strip()
                    kn = (a.findtext("ax:keyname", "", OAI_NS) or "").strip()
                    authors.append(f"{fn} {kn}".strip())
                out.append({"id": meta.findtext("ax:id", "", OAI_NS), "title": title,
                            "abstract": abstract, "created": created,
                            "primary": cats[0] if cats else "", "categories": cats,
                            "authors": authors})
                kept += 1
            pages += 1
            tok = root.find(".//oai:resumptionToken", OAI_NS)
            token = (tok.text or "").strip() if tok is not None else ""
            print(f"  [oai:{oai_set}] page {pages}, {kept} candidate ideas so far",
                  file=sys.stderr, flush=True)
            if not token:
                break
    seen: set[str] = set()
    uniq = []
    for p in out:
        if p["id"] in seen:
            continue
        seen.add(p["id"])
        uniq.append(p)
    return uniq


def spread(p: dict) -> int:
    return sum(1 for v in p["axes"].values() if v > 0)


def report(papers: list[dict], args, window: tuple[str, str]) -> None:
    ranked = sorted(papers, key=lambda p: (-p["score"], -spread(p), p["created"]))
    shown = ranked if args.all else ranked[: args.top]
    print(f"# LLM and transformer ideas on arXiv, {window[0]} to {window[1]}\n")
    print(f"_{len(papers)} candidate idea papers found across "
          f"{', '.join(ARXIV_CATEGORIES)}; showing "
          f"{'all' if args.all else f'the top {len(shown)} by score'}._\n")
    print("_Scored on four axes - reach (how general), mechanism (does it "
          "change something load-bearing), evidence (scale, ablations, "
          "released artifacts) and effect (size of the reported win). "
          "Surveys, benchmark releases and pure applications are filtered "
          "out before scoring. The score is a reading order, not a verdict; "
          "every point prints its evidence._\n")
    for i, p in enumerate(shown, 1):
        auth = ", ".join(p["authors"][:3]) + (" et al." if len(p["authors"]) > 3 else "")
        ax = p["axes"]
        print(f"## {i}. {p['title']}")
        print(f"- arXiv:{p['id']} ({p['primary']}, submitted {p['created']}) - "
              f"https://arxiv.org/abs/{p['id']}")
        print(f"- {auth}")
        print(f"- **score {p['score']}** (reach {ax['reach']}, mechanism {ax['mechanism']}, "
              f"evidence {ax['evidence']}, effect {ax['effect']})")
        for w in p["why"]:
            print(f"  - {w}")
        print(f"- {p['abstract'][:600]}{'...' if len(p['abstract']) > 600 else ''}\n")
    if not shown:
        print("_Nothing matched. Widen the window, or the gates are too tight._")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--since")
    ap.add_argument("--until")
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--json")
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
