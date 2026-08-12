#!/usr/bin/env python3
"""Finds significant new results in astronomy and astrophysics on arXiv.

Fourth of the family, after find_ai_solves.py, find_benchmarks.py and
find_llm_ideas.py, built the same way: arXiv's OAI-PMH bulk interface,
stdlib only, Markdown on stdout, progress on stderr.

Astronomy needs a different scorer from the AI scripts, because the field
signals importance differently. There is no headroom to measure and no
benchmark to release. What an astronomy abstract does carry, and what a
curator actually reads for, is:

  discovery  - a first, a record, a detection of something not seen before,
               or the confirmation/refutation of a predicted object;
  facility   - which instrument. JWST, LIGO/Virgo/KAGRA, Euclid, Vera Rubin,
               DESI, ALMA and their peers are where the decade's results
               come from, and a paper's facility is a strong prior on how
               much new information it can possibly contain;
  rigor      - significance in sigma, sample size, multi-messenger or
               multi-wavelength corroboration, spectroscopic (rather than
               photometric) confirmation, long baselines;
  stakes     - does it bear on something the field would have to revise:
               cosmological tension, dark matter or energy, general
               relativity tests, the origin of life or of structure.

The gate is looser than the AI scripts' because astro-ph is already the
right population - the categories do most of the filtering. What the gate
removes is the genuinely non-result literature: instrument descriptions,
survey data releases without a finding, catalogues, forecasts of what a
future telescope might see, and pure methodology papers.

Sigma values are parsed and scored on a curve: 5-sigma is the discovery
threshold in this field and is worth more than 3-sigma, which is worth more
than a hint. Tension claims are scored but flagged, since "N-sigma tension"
is also how systematic errors announce themselves.

Scores are heuristics over title and abstract, a triage order and not a
verdict; the evidence for every point is printed so the ranking can be
argued with.

Usage:
  python scripts/find_astro.py                      # last 30 days, top 10
  python scripts/find_astro.py --days 90 --top 30
  python scripts/find_astro.py --since 2026-05-14 --until 2026-06-12
  python scripts/find_astro.py --all --json out.json
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

UA = "vibemathed-astro-finder/1.0 (+https://vibemathed.com)"

ARXIV_CATEGORIES = [
    "astro-ph.CO", "astro-ph.GA", "astro-ph.HE", "astro-ph.SR",
    "astro-ph.EP", "astro-ph.IM", "gr-qc",
]
CATEGORY_SET = set(ARXIV_CATEGORIES)

OAI_URL = "https://oaipmh.arxiv.org/oai"
# astro-ph is its own OAI set; gr-qc arrives under physics.
OAI_SETS = ["physics:astro-ph", "physics:gr-qc"]
OAI_NS = {"oai": "http://www.openarchives.org/OAI/2.0/",
          "ax": "http://arxiv.org/OAI/arXiv/"}

# ---------------------------------------------------------------- the gate

# What is NOT a result: the paper describes hardware, ships a catalogue,
# forecasts a future mission, or proposes a method with nothing measured.
NON_RESULT_RE = re.compile(
    r"\b(?:instrument (?:design|overview|description)|we (?:describe|present) the design|"
    r"data release|catalogue? (?:of|paper|release)|pipeline (?:description|overview)|"
    r"forecasts? for|we forecast|will be able to|prospects for detecting|"
    r"mock (?:catalogue?s?|observations?)|simulated observations? of a future|"
    r"review|lecture notes|proceedings of|white paper|mission concept)\b", re.I)
# ...but a measured result inside such a paper redeems it.
RESULT_RE = re.compile(
    r"\b(?:we (?:report|detect|measure|find|observe|present the (?:first|discovery)|"
    r"confirm|rule out|constrain|infer|identify)|"
    r"(?:we|here) (?:present|announce)\b[^.]{0,50}(?:detection|discovery|measurement|"
    r"observation|constraint|evidence)|"
    r"is detected|are detected|has been detected|we place (?:new )?(?:limits|constraints))\b",
    re.I)

# ---- discovery
FIRST_RE = re.compile(
    r"\b(?:first (?:ever )?(?:detection|discovery|measurement|observation|evidence|"
    r"confirmed|direct|spectroscopic|resolved|image)|"
    r"never before (?:seen|observed|detected)|"
    r"most (?:distant|massive|luminous|energetic|precise|ancient|compact|rapid)|"
    r"record[- ](?:breaking|setting)|smallest|largest|earliest|oldest|"
    r"heaviest|fastest|brightest)\b", re.I)
NEWCLASS_RE = re.compile(
    r"\b(?:new (?:class|population|type|family) of|"
    r"previously unknown|unprecedented|unexpected(?:ly)?|"
    r"challenges? (?:our|the) (?:understanding|current|standard)|"
    r"cannot be explained by|defies?|at odds with|in tension with)\b", re.I)
CONFIRM_RE = re.compile(
    r"\b(?:confirm(?:s|ed|ation) (?:of|the)|independent(?:ly)? confirm\w+|"
    r"rules? out|excluded? at|refut\w+|falsif\w+)\b", re.I)

# ---- facility. The decade's results come from a short list of machines.
FLAGSHIP_RE = re.compile(
    r"\b(?:JWST|James Webb|LIGO|Virgo|KAGRA|LISA Pathfinder|Euclid|"
    r"Vera (?:C\.? )?Rubin|LSST|DESI|ALMA|Event Horizon Telescope|EHT|"
    r"NICER|IceCube|Gaia|Chandra|XRISM|eROSITA|Roman Space Telescope|"
    r"NANOGrav|EPTA|pulsar timing array|SKA|CHIME|ELT|JVLA|VLT|Hubble)\b")
MULTIMSG_RE = re.compile(
    r"\b(?:multi-?messenger|gravitational[- ]wave counterpart|"
    r"neutrino counterpart|electromagnetic counterpart|"
    r"joint (?:detection|observation|analysis) (?:of|with)|"
    r"multi-?wavelength (?:campaign|observations?|follow-?up))\b", re.I)

# ---- rigor
SIGMA_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(?:-|\s)?sigma|(\d+(?:\.\d+)?)\s*σ", re.I)
SPECTRO_RE = re.compile(
    r"\b(?:spectroscopic(?:ally)? (?:confirmed?|redshift|identification)|"
    r"spectroscopy of|radial[- ]velocity confirmation|"
    r"transit and radial velocity)\b", re.I)
SAMPLE_RE = re.compile(
    r"\b(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?\s*(?:million|billion)|\d{3,})\s+"
    r"(?:galaxies|stars|quasars|supernovae|objects|sources|systems|"
    r"exoplanets|events|bursts|clusters|pulsars)\b", re.I)
BASELINE_RE = re.compile(
    r"\b(?:over (?:\d+) (?:years?|decades?)|(?:\d+)[- ]year (?:baseline|survey|campaign)|"
    r"decades? of (?:observations?|monitoring)|long[- ]term monitoring)\b", re.I)

# ---- stakes
BIGQ_RE = re.compile(
    r"\b(?:Hubble tension|H0 tension|S8 tension|sigma8 tension|"
    r"dark (?:matter|energy)|equation of state of dark energy|"
    r"general relativity|test(?:s|ing)? of gravity|modified gravity|"
    r"cosmological constant|inflation|primordial|"
    r"baryon acoustic|neutrino mass|"
    r"first stars|Population III|cosmic dawn|reionization|"
    r"habitab\w+|biosignature|origin of life|technosignature|"
    r"black hole (?:information|horizon)|event horizon|"
    r"fast radio burst|gravitational[- ]wave background|"
    r"planet nine|interstellar object)\b", re.I)
REVISE_RE = re.compile(
    r"\b(?:requires? (?:a )?revision|overturns?|contradicts?|inconsistent with|"
    r"significantly (?:higher|lower|different) than (?:predicted|expected)|"
    r"exceeds? (?:theoretical|standard|expected)|"
    r"no (?:standard|known) (?:model|mechanism) (?:can|explains?))\b", re.I)


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


def is_result(title: str, abstract: str) -> bool:
    blob = f"{title}. {abstract}"
    if NON_RESULT_RE.search(blob) and not RESULT_RE.search(blob):
        return False
    return bool(RESULT_RE.search(blob) or FIRST_RE.search(blob)
                or NEWCLASS_RE.search(blob))


def max_sigma(blob: str) -> float:
    best = 0.0
    for m in SIGMA_RE.finditer(blob):
        v = m.group(1) or m.group(2)
        try:
            f = float(v)
        except (TypeError, ValueError):
            continue
        if f <= 100:                       # "50 sigma" is real; "1000" is a typo
            best = max(best, f)
    return best


def score(p: dict) -> dict:
    blob = f"{p['title']}. {p['abstract']}"
    pts: list[tuple[str, int, str]] = []

    # ---- discovery
    if FIRST_RE.search(blob):
        pts.append(("discovery", 3, f'first or record claim: "{FIRST_RE.search(blob).group(0)}"'))
    if NEWCLASS_RE.search(blob):
        pts.append(("discovery", 2,
                    f'unexpected or new population: "{NEWCLASS_RE.search(blob).group(0)}"'))
    if CONFIRM_RE.search(blob):
        pts.append(("discovery", 1,
                    f'confirms or rules out: "{CONFIRM_RE.search(blob).group(0)}"'))

    # ---- facility
    if FLAGSHIP_RE.search(blob):
        names = sorted({m.group(0) for m in FLAGSHIP_RE.finditer(blob)})[:4]
        pts.append(("facility", 2, "flagship facility: " + ", ".join(names)))
    if MULTIMSG_RE.search(blob):
        pts.append(("facility", 2,
                    f'multi-messenger or multi-wavelength: "{MULTIMSG_RE.search(blob).group(0)}"'))

    # ---- rigor
    s = max_sigma(blob)
    if s >= 5:
        pts.append(("rigor", 3, f"{s:g} sigma - at or above the discovery threshold"))
    elif s >= 3:
        pts.append(("rigor", 2, f"{s:g} sigma"))
    elif s > 0:
        pts.append(("rigor", 1, f"{s:g} sigma - suggestive only"))
    if SPECTRO_RE.search(blob):
        pts.append(("rigor", 2,
                    f'spectroscopic confirmation: "{SPECTRO_RE.search(blob).group(0)}"'))
    if SAMPLE_RE.search(blob):
        pts.append(("rigor", 1, f"sample size: {SAMPLE_RE.search(blob).group(0)}"))
    if BASELINE_RE.search(blob):
        pts.append(("rigor", 1, f'long baseline: "{BASELINE_RE.search(blob).group(0)}"'))

    # ---- stakes
    if BIGQ_RE.search(blob):
        names = sorted({m.group(0).lower() for m in BIGQ_RE.finditer(blob)})[:3]
        pts.append(("stakes", 2, "bears on: " + ", ".join(names)))
    if REVISE_RE.search(blob):
        pts.append(("stakes", 2,
                    f'claims something must be revised: "{REVISE_RE.search(blob).group(0)}"'))

    axes = {"discovery": 0, "facility": 0, "rigor": 0, "stakes": 0}
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
                if not is_result(title, abstract):
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
            print(f"  [oai:{oai_set}] page {pages}, {kept} candidate results so far",
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
    print(f"# Astronomy and astrophysics results on arXiv, {window[0]} to {window[1]}\n")
    print(f"_{len(papers)} candidate result papers found across "
          f"{', '.join(ARXIV_CATEGORIES)}; showing "
          f"{'all' if args.all else f'the top {len(shown)} by score'}._\n")
    print("_Scored on four axes - discovery (a first, a record, an "
          "unexpected population), facility (which machine took the data), "
          "rigor (sigma, spectroscopic confirmation, sample size, baseline) "
          "and stakes (does it bear on a question the field would have to "
          "revise). Instrument papers, catalogues and forecasts are filtered "
          "out before scoring. Treat N-sigma tension claims with care - that "
          "is also how systematics announce themselves. The score is a "
          "reading order, not a verdict._\n")
    for i, p in enumerate(shown, 1):
        auth = ", ".join(p["authors"][:3]) + (" et al." if len(p["authors"]) > 3 else "")
        ax = p["axes"]
        print(f"## {i}. {p['title']}")
        print(f"- arXiv:{p['id']} ({p['primary']}, submitted {p['created']}) - "
              f"https://arxiv.org/abs/{p['id']}")
        print(f"- {auth}")
        print(f"- **score {p['score']}** (discovery {ax['discovery']}, facility {ax['facility']}, "
              f"rigor {ax['rigor']}, stakes {ax['stakes']})")
        for w in p["why"]:
            print(f"  - {w}")
        print(f"- {p['abstract'][:600]}{'...' if len(p['abstract']) > 600 else ''}\n")
    if not shown:
        print("_Nothing matched. Widen the window, or the gate is too tight._")


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
