"""Regression corpus for the finder's pattern gates.

Every case here is a REAL text from a measured sweep, kept verbatim or
lightly trimmed: the hits are disclosures that led to catalog entries, the
misses are false positives that cost a full-text fetch and a human look.
The patterns encode months of triage lessons, and this file is what makes
editing them safe - a well-meaning regex tweak that re-admits "Universite
Claude Bernard" should fail here, not in the next sweep's report.

Run: python scripts/test_find_ai_solves.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import find_ai_solves as f  # noqa: E402

FAILS: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"  {'PASS' if cond else 'FAIL'}  {name}{'  ' + detail if detail else ''}")
    if not cond:
        FAILS.append(name)


# (label, text, should a mention snippet survive the filters?)
MENTION_CASES = [
    # --- disclosures that became entries -----------------------------------
    ("autonomous ChatGPT proof",
     "The disproof of the conjecture of Hamaker-Reiner was obtained "
     "autonomously by ChatGPT 5.4 Pro.", True),
    ("AlphaEvolve counterexample",
     "Our counterexample was found by the AlphaEvolve AI-assisted "
     "optimization system.", True),
    ("Gemini Deep Think sessions",
     "Several structural ideas and technical arguments emerged from "
     "exploratory sessions with the AI-based reasoning system Gemini Deep "
     "Think.", True),
    ("Rethlas system credit",
     "The main result of this paper is obtained by generative AI, "
     "particularly Chatgpt 5.5 pro and the Rethlas system.", True),
    ("Grok collaboration",
     "we report five mathematical discoveries made in collaboration with "
     "Grok, all of which have been subsequently verified by the authors",
     True),
    ("GPT with version suffix",
     "GPT-5.4 Thinking was used to assist with parts of the computational "
     "implementation.", True),
    ("unhyphenated GPT4",
     "The key lemma was suggested by GPT4 during a long dialogue.", True),
    ("AxiomProver formalization",
     "AxiomProver autonomously produced Lean/mathlib formalizations and "
     "machine-checkable proofs of the positivity conjectures.", True),
    ("Claude Opus in a proof",
     "We used Claude Opus 4.6 to aid us in the proof of Theorem 5.1.", True),
    ("bare Claude as the model",
     "I thank Claude for helping me to write Python scripts to analyze "
     "CHEVIE data.", True),

    # --- false positives that cost triage time -----------------------------
    ("Universite Claude Bernard affiliation",
     "Severine Millet, Université Claude Bernard Lyon 1, LMFA, UMR 5509, "
     "CNRS, Ecole Centrale de Lyon.", False),
    ("Claude-Bernard with hyphen",
     "Thèse d'État, Université Claude-Bernard, Lyon 1, 1978.", False),
    ("Claude Berge the graph theorist",
     "a classical theorem of Claude Berge on perfect graphs", False),
    ("citation keys GPT23 and GPTW24",
     "using estimates for Green functions in [ GPS24 , GPT23 , GPTW24 ] , "
     "which gives a robust framework", False),
    ("citation key GPTV01",
     "the operator case fails [ GPTV01 ] due to a blow up of the estimate",
     False),
    ("GPTs as probabilistic theories",
     "generalized probabilistic theories (GPTs) provide a framework beyond "
     "quantum mechanics", False),
    ("grokking the phenomenon",
     "we study the grokking phenomenon in overparametrized networks", False),
    ("Aristotle University affiliation",
     "Department of Mathematics, Aristotle University of Thessaloniki",
     False),
    ("English-polishing disclosure",
     "The author used ChatGPT to improve the English and grammar of the "
     "manuscript.", False),
    ("Codex Sinaiticus",
     "as attested in the Codex Sinaiticus and other manuscripts", False),
]

# (label, text, should it read as a resolution?)
RESOLUTION_CASES = [
    ("disproves a named conjecture",
     "We disprove the so-called HRT conjecture of Heil, Ramanathan and "
     "Topiwala.", True),
    ("answers a question of",
     "We answer a question of Kollár and Kovács by constructing a flat "
     "projective morphism.", True),
    ("record ladder phrasing",
     "We give an improved lower bound on the maximal Gaussian perimeter of "
     "convex sets.", True),
    ("plain computation, no resolution",
     "We compute the cohomology of certain moduli spaces of stable curves.",
     False),
]


def run() -> None:
    print("mention gate (MODEL_RE + NOISE_RE + MODEL_FALSE_POSITIVE_RE):")
    for label, text, expect in MENTION_CASES:
        got = bool(f.ai_mention_snippets(text))
        check(label, got == expect,
              f"expected {'hit' if expect else 'miss'}, got {'hit' if got else 'miss'}")

    print("\nresolution gate (RESOLUTION_RE):")
    for label, text, expect in RESOLUTION_CASES:
        got = bool(f.RESOLUTION_RE.search(text))
        check(label, got == expect,
              f"expected {'hit' if expect else 'miss'}, got {'hit' if got else 'miss'}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    run()
    print(f"\n{'ALL PASS' if not FAILS else 'FAILED: ' + ', '.join(FAILS)}")
    sys.exit(1 if FAILS else 0)
