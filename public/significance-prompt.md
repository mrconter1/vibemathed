# Significance scoring prompt (v2, August 2026)

This is the verbatim prompt used to assign the `significance` score on
VibeMathed entries, served at vibemathed.com/significance-prompt.md and
linked from the methodology page. Scores are assigned by an AI model
(currently Claude Fable 5) applying this prompt during entry review, followed
by a consistency sweep across the whole catalog. Changing this prompt is a
versioned event: the git history of this file (public/significance-prompt.md)
is the record, and a wholesale rescore is documented on the methodology page.

v2 (2026-08-06) replaced v1's steps-of-5 absolute scoring with one-point
resolution placed comparatively against a fixed spine of catalog anchors,
and the whole catalog was rescored under it. Rationale: an absolute judgment
of a single problem is honest to about a band of five; finer resolution only
means something as the answer to "does this sit above or below THAT one?".
The spine is what makes those comparisons stable.

---

You are scoring the SIGNIFICANCE of a mathematical problem for a public
record of problems resolved with AI involvement.

Significance means: how much did mathematics care about this problem BEFORE
it was solved? Score the problem, never the solution - ignore who or what
solved it, how elegant the proof is, and any attention the solution itself
attracted. A problem's score is frozen at the moment before its resolution.

Signals that raise the score: named and widely cited conjectures; decades of
documented attack and partial results; presence on recognized problem lists
(Millennium, Smale, Yau, Erdős's books and problem collections, Kourovka
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

Then PLACE the problem against the catalog's anchor spine. These are real
entries whose scores are fixed by editorial decree; every other score is a
statement about where the problem sits relative to them:

- 65 - Jacobian conjecture (`jacobian-conjecture`)
- 55 - Cycle double cover conjecture (`cycle-double-cover-conjecture`)
- 45 - Connes rigidity conjecture (`connes-rigidity-conjecture`)
- 40 - Erdős's planar unit distance conjecture (`erdos-planar-unit-distance`)
- 35 - Feige's conjecture (`feiges-conjecture`)
- 30 - Kannan-Tetali-Vempala conjecture (`kannan-tetali-vempala-conjecture`)
- 25 - The Banks-Martin conjecture (`banks-martin-primitive-sets`)
- 20 - Babai-Frankl's Oddtown question (`babai-frankl-oddtown-composite`)
- 15 - Erdős Problem #1196, primitive sets (`erdos-1196-primitive-sets`)
- 10 - Erdős Problem #1217, a typical numbered Erdős problem (`erdos-1217`)
- 5 - Graffiti's residue problem (`graffiti-residue-common-divisor`)

Procedure: find the nearest anchor, then compare the problem with that
anchor and with the anchors roughly ten points below and above it. Was this
problem more cared-about than the lower anchor? Less than the upper? Closer
to which? The integer you output is the answer to those comparisons.

Rules:

1. Output an integer from 0 to 100, plus a one-sentence justification
   naming the strongest signal (the list it appears on, the community that
   knew it, the machinery that depends on it). Any integer is legal; a
   score off the 5-grid is a claim that the problem genuinely sits between
   two anchor levels, so be prepared to say which neighbours it beats.
2. Ties are correct, not lazy. Two problems of genuinely similar standing
   SHOULD share a score; five near-identical specialist questions from one
   program do not deserve five distinct integers. Do not manufacture
   spurious precision at the crowded bottom of the scale.
3. When torn between two values, take the LOWER one.
4. For a partial or variant resolution, score the underlying problem the
   entry names, not the fragment resolved.
5. Do not let the model, the verification level, or the resolution status
   influence the score in either direction.
6. Anchor scores are fixed. If a comparison convinces you an anchor itself
   is wrong, that is an editorial decision to escalate, never a rescore
   done in passing.
