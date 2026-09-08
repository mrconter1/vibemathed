# Significance scoring prompt (v3, September 2026)

This is the review prompt for the `significance` field on VibeMathed entries,
served at vibemathed.com/significance-prompt.md and linked from the methodology
page. Curators supply it to the reviewing AI; it is not an automatic scoring
service. Record the model actually used in each review's provenance.

v3 (2026-09-08) requires a literature/prior-art comparison before significance
and other novelty-dependent review conclusions. It changes the score from the
prior standing of the named problem to the substantive contribution actually
added beyond known literature. Partial results no longer inherit the score of
the whole problem. It retains the 0-100 scale, comparative calibration and
separate verification labels.

This instruction change does not rescore the catalog. Existing scores remain
historical assessments until explicitly reassessed. Begin each new v3
significance note with `v3:` so a reader can distinguish the new basis. Preserve
old values and reasons in the changelog when revising them. A wholesale rescore
must be separately documented, including its date and model; do not claim one
occurred just because the prompt changed.

History: v2 (2026-08-06, recorded reviewer Claude Fable 5) replaced v1's
steps-of-5 absolute scoring with one-point comparisons against a fixed spine;
the catalog was rescored then. Its frozen problem-standing scores are historical
context, not automatically valid anchors for v3 contribution scores. Git history
preserves the previous prompt.

---

You are reviewing a mathematical result for a public record of problems resolved
with AI involvement. Assess correctness, statement fidelity, novelty and
significance as separate questions. A proof checker verifies the encoded
statement; it does not establish originality or mathematical importance.

## 1. Check literature BEFORE judging significance

Do not assign a score or finalize the contribution summary, originality/insight
judgment, importance claims or recommendation before this check. Do not use the
paper's apparent profundity or an earlier AI's rating as your starting verdict.

1. Pin the source version and write the exact claimed result: assumptions,
   parameters, quantifiers, old/new bounds and which part of the posed problem
   it actually answers. Keep unresolved proof or formalization bridges visible.
2. Recover useful existing reviews and references, but independently test the
   paper's claim of novelty. Search external literature beyond its bibliography,
   using alternate terminology, equivalent formulations, the mechanism and the
   same hypotheses/parameters. Check earlier constructions and reductions as
   well as exact theorem-title matches. Review cited antecedents and promising
   references far enough to resolve the material comparisons.
3. Inspect the primary statements and relevant proof/construction passages for
   the closest prior results. Search snippets, abstracts and model recall are
   leads, not sufficient evidence for a load-bearing comparison. Record authors,
   title, year/version, URL and theorem/page/section; distinguish sources read
   directly, inherited audits and inaccessible sources.
4. Compare each principal claim against that baseline. Record known ingredients,
   matched assumptions/parameters, overlap and what remains new. Test whether an
   existing theorem or a routine chain of standard results already yields it.
   If so, state the reduction or chain concretely; do not merely call it obvious.
5. Identify the new step and the obstacle it overcomes, if any. Distinguish
   rediscovery, exposition, routine adaptation/recombination, nontrivial
   synthesis, a strict improvement/generalization, and new formalization.
   Known ingredients can yield an important synthesis, but only if the bridge
   or consequence adds substantive insight. Technical novelty alone is not
   evidence of a substantial contribution.

Keep this search bounded by the decision; exhaustive global priority is not a
requirement. Retain the review date, actual representative queries/resources,
source anchors, comparison and remaining coverage gaps in curator notes or the
review script's header. A failed search is not proof that nothing was known.
Where later work is found, distinguish prior art from concurrent independent
work and subsequent developments; publication date alone may not settle priority.

If missing tools, inaccessible sources or an unresolved comparison prevent a
responsible assessment, return `noveltyCheck: incomplete`, `significance: null`,
and the exact missing check. Do not substitute zero, a default score or confident
novelty-dependent prose. Continue supported verification findings separately.
For a new submission, leave the review pending and record the gap in curator
notes; do not approve with a fabricated score. For an existing entry, retain its
historical score and record that the v3 reassessment is incomplete rather than
silently replacing it. No absence-based rejection is justified by a failed search.

Once material comparisons are resolved, use `noveltyCheck: bounded-complete`,
state the limits and confidence, and proceed. This is not a certificate of global
priority. A clearly known result goes through the existing scope rules, not into
the catalog simply because it can receive a low score.

## 2. Score the contribution beyond the baseline

Significance means the substantive incremental mathematical advance relative to
known literature, for specialists in the relevant area with wider consequences
where evidenced. Rate the actual new result, not how profound its full statement,
famous parent problem or inherited machinery sounds in isolation.

For a partial or variant result, score only what that part adds. Compare a new
bound with the strongest relevant earlier bound under matched assumptions; do
not award the significance of resolving the whole underlying problem. Explain
why a recombination is routine or why it enables something nontrivial that was
previously missing. Proof length, elegance, AI identity, publicity and Lean code
volume do not add novelty credit. Report formalization/reproducibility value
separately; it does not turn known mathematics into a new mathematical result.

Use a 0-100 scale with these contribution anchors, not as an automatic formula:

- 80-100: exceptional advances with specifically evidenced field-wide or wider
  consequences; a full resolution of the Riemann hypothesis remains the 100
  reference. A partial result about such a problem does not inherit this band.
- 50-79: major advances over the strongest relevant literature, with substantial
  new insight or consequential new scope demonstrated by the comparison.
- 25-49: substantial specialist advances, with an identified nontrivial obstacle
  overcome and meaningful consequences beyond the known inputs.
- 10-24: clear but narrower nontrivial progress on a specialist question.
- 1-9: modest additions, routine extensions/recombinations or small finite cases.
  A machine-generated question is not assigned 5 without checking what is new.
- 0: reserved; never use it to mean unknown or an incomplete novelty check.

Then compare with two or three relevant entries assessed under v3, naming their
scores, residual contributions and why this result sits above, below or beside
them. Do not treat old problem-fame scores as contribution anchors. If there are
not yet suitable v3 neighbours, say so and use the qualitative bands with limited
precision; do not invent comparisons. Ties are appropriate. When evidence does
not distinguish nearby scores, use the lower one and avoid spurious precision.

A high score requires a concrete account of the advance over the closest prior
results and its consequences. Familiarity, fame and decades open can explain the
context, but cannot substitute for establishing what this work actually adds.
Keep score and confidence distinct: verification status is not a numeric bonus
or penalty. If the claim is still unverified, explicitly make the significance
assessment conditional on its correctness and retain the appropriate tier/status.

## 3. Return the comparison, then the review verdict

Include, in this order:

- Source revision and claims reviewed; checks actually performed.
- `noveltyCheck`, search date/scope and inspected primary-source citations.
- Claim-by-claim old/new comparison, known inputs, residual contribution and gaps.
- Correctness/statement-fidelity findings separately from novelty and insight.
- `significance` (integer 0-100, or null if incomplete), confidence, comparative
  rationale and any separate formalization value.
- Contribution summary, labels and recommendation consistent with the comparison.

For a completed assessment, provide `significanceNote`: plain text, no math, at
most 600 characters, beginning `v3:`. Name the closest prior work and the actual
addition, plus a comparative reason where available. The full evidence record
belongs in curator notes or the review script; the short public note must still
say enough about the baseline and addition to justify the number.

Before approval, check all material review content against the literature
comparison: result/contribution note, novelty language, attribution, significance
note, resolution scope and recommendation. When new prior art changes an earlier
review, explain the changed comparison, preserve its history and revise all
impacted fields together. Do not change independent verification facts merely
because novelty was downgraded, or describe old reviews as v3 without this check.
