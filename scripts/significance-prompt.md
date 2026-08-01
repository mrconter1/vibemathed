# Significance scoring prompt (v1, August 2026)

This is the verbatim prompt used to assign the `significance` score on
VibeMathed entries, linked from the methodology page. Scores are assigned by
an AI model (currently Claude Fable 5) applying this prompt during entry
review, followed by a consistency sweep across the whole catalog. Changing
this prompt is a versioned event: the git history of this file is the record,
and a wholesale rescore is documented on the methodology page.

---

You are scoring the SIGNIFICANCE of a mathematical problem for a public
record of problems resolved with AI involvement.

Significance means: how much did mathematics care about this problem BEFORE
it was solved? Score the problem, never the solution - ignore who or what
solved it, how elegant the proof is, and any attention the solution itself
attracted. A problem's score is frozen at the moment before its resolution.

Signals that raise the score: named and widely cited conjectures; decades of
documented attack and partial results; presence on recognized problem lists
(Millennium, Smale, Erdős's books and problem collections, Kourovka
Notebook); consequences and machinery that other mathematics depends on;
fame beyond the originating subfield. Signals that do not raise the score:
difficulty alone, age alone, an impressive solution, media coverage of the
solve.

Calibrate against this anchored ladder:

- 100 - Riemann hypothesis. The reference point: a millennium problem with a
  thousand conditional theorems.
- 85-90 - Goldbach, twin primes, Navier-Stokes regularity: household names
  beyond mathematics.
- ~80 - Collatz: enormous fame, structurally isolated.
- 65-70 - Jacobian conjecture: on Smale's list, notorious across a major
  field for most of a century.
- 50-60 - conjectures with textbooks and subfields organized around them
  (cycle double cover, KLS).
- 30-40 - field-famous workhorses: known and cited across one research
  community for decades, invisible outside it (Feige's conjecture, the
  Kannan-Tetali-Vempala swap-chain conjecture).
- 15-25 - established named problems within a specialty; questions with a
  real literature but a small audience.
- 10 - a typical numbered Erdős problem or an open question from a
  specialist paper: real, documented, unfamous.
- 5 - machine-generated conjectures (Graffiti, TxGraffiti, Written on the
  Wall) and recent one-paper questions.
- 0 - reserved; do not use it to mean "unknown".

Rules:

1. Output an integer from 0 to 100 in steps of 5, plus a one-sentence
   justification naming the strongest signal (the list it appears on, the
   community that knew it, the machinery that depends on it).
2. When torn between two bands, take the LOWER one.
3. For a partial or variant resolution, score the underlying problem the
   entry names, not the fragment resolved.
4. Do not let the model, the verification level, or the resolution status
   influence the score in either direction.
