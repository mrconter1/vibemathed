"""Ingest OpenAI's openai/math release into a family manifest, and report how
it overlaps the catalog.

    python scripts/openai-math/ingest.py            # fetch at the pinned commit
    python scripts/openai-math/ingest.py --commit <sha>

Read-only: it fetches public files from GitHub and the site's public dataset,
and writes two files next to this script:

    manifest-<sha7>.json   one row per result family (372 at adc7f12)
    overlap-<sha7>.md      catalog entries that look related, per family

The unit is the family, OpenAI's grouping of a principal result with its
companion manuscripts; the catalog's unit is the posed problem, and the two
mostly coincide (see docs/reviewing.md, "Bulk releases by AI labs").

Sources inside the release:
  CONTENTS.md         family number, title, summary; manuscripts with abstracts
  overview.pdf        the subject heading each family is filed under
  lean/formalization.yaml
                      which manuscripts have a formalised main result
"""

from __future__ import annotations

import argparse
import io
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

REPO = "openai/math"
PINNED = "adc7f1241b42e322a6451854ab7e4b4c146bf78a"  # 6 Oct 2026 21:58 UTC, first release
DATASET = "https://vibemathed.com/api/dataset"
HERE = Path(__file__).resolve().parent

SUBJECTS = [
    "Number theory", "Algebraic and complex geometry", "Real and complex analysis",
    "Convex and metric geometry", "Theoretical computer science",
    "Dynamical systems and ergodic theory", "Combinatorics", "Algebra",
    "Probability and statistical mechanics", "Mathematical logic", "Group theory",
    "Mathematical physics", "Operator algebras", "Topology", "Functional analysis",
    "Differential geometry", "Partial differential equations",
]


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "vibemathed-ingest"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def raw(commit: str, path: str) -> bytes:
    return fetch(f"https://raw.githubusercontent.com/{REPO}/{commit}/{path}")


def plain(s: str) -> str:
    s = re.sub(r"</?i>|</?b>|</?sub>|</?sup>", "", s)
    s = s.replace("&emsp;", "").replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", s).strip()


def parse_contents(md: str) -> list[dict]:
    families: list[dict] = []
    cur: dict | None = None
    for cell in re.findall(r"<td>\s*(.*?)\s*</td>", md, flags=re.S):
        head = re.match(r"\*\*(\d{3})\. (.+?)\*\*\s*(.*)", cell, flags=re.S)
        if head:
            title = head.group(2).strip().rstrip(".")
            cur = {
                "family": head.group(1),
                "title": plain(title),
                "summary": plain(head.group(3)),
                "manuscripts": [],
            }
            families.append(cur)
            continue
        for m in re.finditer(r"\[(.+?)\]\((preprints/[^)]+)\)\s*(.*)", cell, flags=re.S):
            if cur is None:
                raise SystemExit("manuscript before any family")
            path = m.group(2)
            cur["manuscripts"].append({
                "title": plain(m.group(1)),
                "pdf": path,
                "folder": path.split("/")[1],
                "abstract": plain(m.group(3)),
            })
    return families


def parse_subjects(pdf_bytes: bytes) -> dict[str, str]:
    from pypdf import PdfReader  # pip install pypdf

    text = "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(pdf_bytes)).pages)
    text = text.replace("T opology", "Topology").replace("T ogether", "Together")
    lines = text.splitlines()
    try:
        start = next(i for i, l in enumerate(lines) if l.strip() == SUBJECTS[0] and i > 25)
    except StopIteration:
        start = 0
    subject = None
    out: dict[str, str] = {}
    for line in lines[start:]:
        s = line.strip()
        if s in SUBJECTS:
            subject = s
            continue
        m = re.match(r"^(\d{3})\. ", s)
        if m and subject:
            out.setdefault(m.group(1), subject)
    return out


def parse_formalised(yaml_text: str) -> set[str]:
    return set(re.findall(r"\.\./preprints/([^/\s]+)/", yaml_text))


def folder_date(folder: str) -> str | None:
    m = re.search(r"(January|February|March|April|May|June|July|August|September|October|November|December)-(\d{1,2})-(\d{4})$", folder)
    if not m:
        return None
    month = ["January", "February", "March", "April", "May", "June", "July", "August",
             "September", "October", "November", "December"].index(m.group(1)) + 1
    return f"{m.group(3)}-{month:02d}-{int(m.group(2)):02d}"


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


NOT_NAMES = set("""
the a an of for and in on to with without from by at via every all any is are no not
conjecture conjectures problem problems question theorem hypothesis counterexample proof
lower upper sharp full general generalized exact optimal new first second third
""".split())


def names(s: str) -> set[str]:
    """Proper names in a title: capitalised words, possessives stripped, so
    "Seymour's second-neighborhood conjecture" gives {"seymour"}. Hyphenated
    double names split ("Erdős–Sós" gives both)."""
    out = set()
    for w in re.findall(r"[A-ZÀ-Þ][\w'’\-–]+", s):
        for part in re.split(r"[\-–]", w):
            part = re.sub(r"['’]s?$", "", part)
            n = norm(part)
            if len(n) >= 3 and n not in NOT_NAMES and not n.isupper():
                out.add(n)
    return out


def overlap(families: list[dict], catalog: list[dict]) -> list[tuple[dict, list[tuple[float, dict]]]]:
    cat = [(p, names(p["name"]) | names(p.get("posedBy") or "")) for p in catalog]
    df: dict[str, int] = {}
    for _, t in cat:
        for w in t:
            df[w] = df.get(w, 0) + 1
    rows = []
    for f in families:
        fn = names(f["title"])
        hits = []
        for p, t in cat:
            common = {w for w in fn & t if df[w] <= 12}
            if not common:
                continue
            hits.append((round(len(common) + sum(1.0 / df[w] for w in common), 2), p))
        hits.sort(key=lambda h: -h[0])
        rows.append((f, hits[:6]))
    return rows


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--commit", default=PINNED)
    args = ap.parse_args()
    commit = args.commit
    short = commit[:7]

    contents = raw(commit, "CONTENTS.md").decode("utf-8")
    families = parse_contents(contents)
    subjects = parse_subjects(raw(commit, "overview.pdf"))
    formalised = parse_formalised(raw(commit, "lean/formalization.yaml").decode("utf-8"))

    for f in families:
        f["subject"] = subjects.get(f["family"])
        dates = [d for d in (folder_date(m["folder"]) for m in f["manuscripts"]) if d]
        f["date"] = min(dates) if dates else None
        for m in f["manuscripts"]:
            m["formalised"] = m["folder"] in formalised
        f["formalised"] = any(m["formalised"] for m in f["manuscripts"])
        f["sourceUrl"] = f"https://github.com/{REPO}/tree/{commit}/preprints/{f['manuscripts'][0]['folder']}" if f["manuscripts"] else None

    n_ms = sum(len(f["manuscripts"]) for f in families)
    print(f"families {len(families)}  manuscripts {n_ms}  formalised families {sum(f['formalised'] for f in families)}"
          f"  formalised manuscripts {sum(m['formalised'] for f in families for m in f['manuscripts'])}"
          f"  without subject {sum(1 for f in families if not f['subject'])}")
    missing = [x for x in formalised if not any(m["folder"] == x for f in families for m in f["manuscripts"])]
    if missing:
        print(f"WARNING: {len(missing)} formalised folders not in CONTENTS.md: {missing[:5]}")

    manifest = {"repo": REPO, "commit": commit, "families": families}
    (HERE / f"manifest-{short}.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")

    catalog = json.loads(fetch(DATASET).decode("utf-8"))["problems"]
    rows = overlap(families, catalog)
    out = [f"# Overlap of {REPO}@{short} with the catalog\n",
           f"{len(catalog)} catalog entries; {sum(1 for _, h in rows if h)} of {len(families)} families have a candidate match.",
           "Matching is on shared proper names (Seymour, Hadwiger, ...) between family titles and entry names/posedBy, ignoring names used by more than 12 entries.",
           "Every hit needs a human read: same result / stronger than ours / unrelated / conflict.\n"]
    for f, hits in rows:
        if not hits:
            continue
        out.append(f"## {f['family']}. {f['title']}  ({f['subject']}{', Lean' if f['formalised'] else ''})")
        for score, p in hits:
            out.append(f"- {score:>5}  `{p['slug']}`  {p['name']}  [{p.get('resolution')}, sig {p.get('significance')}]")
        out.append("")
    (HERE / f"overlap-{short}.md").write_text("\n".join(out), encoding="utf-8")
    print(f"wrote manifest-{short}.json and overlap-{short}.md")


if __name__ == "__main__":
    sys.exit(main())
