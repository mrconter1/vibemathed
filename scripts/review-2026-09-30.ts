// 30 September 2026: the twelve pending submissions.
//
// SEVEN PUBLISHED, FIVE DECLINED.
//
// Eight of the twelve came from one account in a single day, all out of one
// repository, so the batch needed a policy rather than twelve separate
// judgements. The policy is the site's existing gate, applied evenly: the
// question has to have been posed, by someone else, and been open. Four of
// the eight say in their own posedBy field that the question was formulated
// inside the project. Those are declined. The four with a real antecedent in
// print - two questions from Alexander's 2013 Section 6, one direction from
// his 2026 paper's Section 6, and one question from Holtgrefe et al.'s
// Section 6 - are published, at low significance, because the questions are
// genuine but young and narrow.
//
// A FIELD ERROR ON ALL EIGHT. Every one gave sourceUrl as
// github.com/Sodelin/Work-on-Samuel-Alexander-Research, which 404s. The
// repository is ...-Research- with a trailing dash. Checked both: 404 and
// 200. Fixed on the four that publish; the four declined keep theirs, since
// a declined row is not public. The CI runs they cite are real and green on
// the correct repository (36298049178 "Genome pedigree proofs" and 36298049071
// "Verify", both success at head 4ab00a2).
//
// 1. SHORELINE SEARCH - published, Resolved, Unreviewed, 30. Temerev,
//    arXiv:2609.24454: a computer-assisted proof that the Baeza-Yates,
//    Culberson and Rawlins logarithmic spiral, ratio 13.8111351794611..., is
//    optimal for reaching an unknown line. A 1993 conjecture of the search-
//    theory literature. The verification note the submitter supplied is
//    unusually honest and is kept nearly as written: Arb ball arithmetic over
//    about 10^6 boxes with two independent implementations, eight Lean
//    modules with no sorry and only the three standard axioms, but NOT
//    formalised end to end, with the paper's own Section 10 listing what is
//    and is not machine-checked. modelMaker was "OpenAI / Anthropic"; the
//    field's convention is semicolons.
//
// 2. GOLDBACH FOR THE LIOUVILLE FUNCTION - published, Resolved,
//    Lean-verified, 22. And this one turned up the best external evidence in
//    the batch. The question is MathOverflow 307479, asked by Pablo in August
//    2018: must every even N > 2 split as a + b with lambda(a) = lambda(b) =
//    -1? The page was read here. It now carries an answer posted on 25
//    September 2026 by Lingsen Meng which says, of the even case, that "an
//    unconditional proof was given independently in September 2026 by an
//    anonymous author, together with a Lean formalization:
//    github.com/CaptainSude/Liouville-Goldbach (release v1.0.0)" - this
//    submission, credited by name of repository, by a third party, as
//    independent and prior. Meng also gives a stronger unconditional result
//    (all four sign pairs for N outside seven exceptions) and the entry says
//    so, because a reader should know the result has been generalised.
//    ONE THING THAT LOOKED LIKE PRIOR ART AND IS NOT: Mangerel proved in IMRN
//    2024 that lambda(a)lambda(N-a) cannot be constant for N >= 11. That
//    gives a pair with OPPOSITE signs, not a pair with both -1, so it does
//    not imply this statement. The arXiv:2412.17199 four-pattern result is
//    conditional on GRH. Repository audited from a clone: 12 Lean files,
//    1,689 lines, zero sorry, zero axiom declarations, zero native_decide,
//    Lean 4.34.0-rc2, CI green twice on 16 September, and Audit.lean prints
//    the axioms of the headline theorem. Statement fidelity checked by hand
//    against the MathOverflow wording and it matches exactly.
//
// 3. ALL-LEVEL NANUQ CIRCULARITY - published, Resolved, Unreviewed, 12.
//    Holtgrefe et al. (Bull. Math. Biol. 2025) proved circular decomposability
//    with exact displayed-split support for level-two bloblets and asked in
//    Section 6 whether it extends; this removes the level bound for the same
//    structural class. Explicitly computer-assisted: 84,076 instances,
//    11,848,859 quartets checked by one verifier and 2,525,210 selections by
//    another, with the Lean endpoints narrower than the theorem. The
//    submitter says all of that plainly and the note keeps it.
//
// 4. NO COUNTABLE UNIVERSAL FAMILY OF AVOIDING POPULATIONS - published,
//    Partial, Lean-checked, 8. Alexander 2013, Section 6, page 12, asks how
//    far populations avoiding a sequence can be universal, by analogy with
//    universal-graph theory. Answered negatively for ordinary injective
//    embeddings, with the obstruction surviving exactly one incoming parent
//    per label. A real question from the paper this catalog already cites in
//    its classification entry.
//
// 5. ORDINAL CERTIFICATES AND EXACT PRUNING - published, Partial,
//    Lean-checked, 8. The other Section 6 question from the same paper: can
//    the populations realising a sequence be characterised, particularly with
//    ordinals. Answered for a stated interpretation.
//
// 6. MAXIMAL SPECIESLIKE CLUSTERS WITH A FIXED REAL FOUNDING WINDOW -
//    published, Partial, Lean-checked, 6. Alexander's 2026 Section 6 asks for
//    alternative constraints to common ancestry in maximal-cluster existence;
//    the fixed-window constraint is the submitter's own choice, which is why
//    this sits below the two above rather than with the declined four - the
//    direction was asked for in print even though the particular constraint
//    was not.
//
// 7. COMPACT-RANGE VIETORIS POWERS - published, Candidate, Lean-checked, 12.
//    Caruvana and Holshouser, arXiv:2507.17936v3, Question 1 on page 11, asks
//    whether K(alpha, ord) is sigma-compact or Lindelof for omega < alpha <
//    omega_1, singling out omega+1. Answered for every countable alpha above
//    omega: Lindelof and second countable, not sigma-compact, and not Menger.
//    The Lean was read here and it is the best-built artefact in the batch:
//    ordinal_full carries the hypotheses omega < a and a < omega_1 with no
//    extra assumption, and FullAudit.lean re-derives the three conclusions
//    through an `example` that does not go through the MainClaim abbreviation,
//    which is exactly the check that catches a definition quietly shadowing
//    the claim. Lean-checked rather than verified: the site did not rebuild,
//    and the statement is anchored only by the author's own repository.
//
// DECLINED, FOUR FOR THE SAME REASON (no-open-question): the four submissions
// whose own posedBy field says the question was formulated in the project -
// a finite special case of a research direction Planidin et al. listed as
// future work; a constrained inverse-observation question "formulated in this
// project"; a follow-up to the project's own preceding construction; and a
// one-generation specialisation of Kim, Mossel, Ramnarayan and Turner. The
// work is careful and the Lean is real. The catalog's gate is about where the
// question came from, and a project that poses its own questions and answers
// them can generate entries without limit, which is the failure mode the gate
// exists to prevent. The message says which four passed and why, so the
// distinction is usable rather than mysterious.
//
// DECLINED, FIFTH, ON THE MATHEMATICS (other): Fomin-Zelevinsky Problem
// 2.8.2, from the account whose PMAD submission was declined on 27
// September. This time the claim is that phase-locked attractor invariants
// certify matrix mutation non-equivalence, and the Lean does contain a real
// Fomin-Zelevinsky mutation rule (mutate_matrix_real), so it was read
// properly. Three findings, in the message:
//   * There is no theorem anywhere of the form "invariants differ, therefore
//     not mutation equivalent". Without that, nothing certifies anything.
//   * variety_invariant is DEFINED by transport along the given mutation
//     path, so it is a function of the path, not of the equivalence class.
//     The two "invariance under mutation" theorems are bookkeeping identities
//     about evaluate_chart_path - one is proved by a single rw - and not
//     invariance of a class function.
//   * variety_invariant_is_sufficient_classification takes
//     PhaseVorticityTensor as a bound hypothesis parameter, shadowing the
//     module's own definition of the same name, so the theorem is not a
//     statement about the construction it appears to concern.
// Problem 2.8.2 asks for an effective method; no algorithm with a
// termination or correctness claim is offered. Declined as "other", not
// no-open-question: the problem is real and open, and the gap is the claim.
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

/// The repository every Sodelin submission meant. Theirs drops the trailing
/// dash and 404s; both spellings were checked here.
const SODELIN = "https://github.com/Sodelin/Work-on-Samuel-Alexander-Research-";

interface Decision {
  slug: string;
  action: "approve" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

/// Shared tail for the four declined self-posed submissions: identical
/// reasoning, so it is written once.
const SELF_POSED_TAIL = [
  "",
  "This is about where the question came from, not about the work. Your own posedBy field says the question was formulated in the project, and your submitter note asks for exactly this assessment, so the answer will not surprise you: the catalog records answers to questions somebody else posed and left open. A project that poses its own questions and answers them can produce entries without limit, which is the failure mode the gate prevents.",
  "",
  "Four of your eight submissions today were published, and the difference is visible in your own fields. The two Alexander 2013 Section 6 questions and the Holtgrefe Section 6 question were asked in print by their authors; the specieslike-window submission answers a direction Alexander asked for, even though the particular constraint is yours. Those four are in. The four declined name a research direction or a prior construction of your own as the antecedent instead.",
  "",
  "What would change it: if an author whose paper you build on states the question - in a paper, a talk, a public message - submit it again with that citation. A specialist saying in public that this comparison is the right one to make would do the same.",
  "",
  "One practical note that affects all eight: the sourceUrl you gave, github.com/Sodelin/Work-on-Samuel-Alexander-Research, returns 404. The repository has a trailing dash. The four published entries were corrected; use the dashed form next time.",
].join("\n");

const DECISIONS: Decision[] = [
  {
    slug: "the-logarithmic-spiral-is-optimal-for-shoreline-search-baeza-yates-culberson-raw",
    action: "approve",
    reason: "edited",
    edits: {
      modelMaker: "OpenAI; Anthropic",
      significance: 30,
      significanceNote:
        "A named conjecture of the search-theory literature, open since Baeza-Yates, Culberson and Rawlins's 1993 \"Searching in the plane\", and the canonical example in a line of online-search problems that the algorithms community teaches. Below the Bilu-Linial and Kusner entries at 35, whose fields are larger, and above the Umans-Wang entry at 20; well above the recent-paper band. The score is for the conjecture, not for the verification level.",
      verificationNote:
        "Kept from the submission, which is accurate, with the checks named. Not independently reviewed. The storage function's dissipation inequalities are verified in Arb ball arithmetic, about 10^6 boxes, with an exact jet and an interval Hessian at the spiral, by two independent implementations. Eight Lean 4 modules carry no sorry and depend only on propext, Classical.choice and Quot.sound, and check lemmas of the reduction, but the argument is NOT formalised end to end: Section 10 of the paper lists what is machine-checked and what is not, and the entry does not claim more. Checked here on 30 September 2026: the arXiv abstract states the ratio as 13.8111351794611... and the paths as arbitrary, with both the radius and the polar angle allowed to decrease, which is the general case the conjecture is about. The ancillary directory holding the Lean modules, the two verifiers and the certified coefficient table was not rebuilt here.",
    },
    reviewNote:
      "Approved 30 Sep 2026: Resolved, Unreviewed, 30. arXiv:2609.24454 read (Temerev, 21 Sep): abstract confirms the ratio 13.8111351794611..., arbitrary paths with radius and angle both allowed to decrease, Kneser-Poulsen lift to the universal cover, three-state relaxed control problem. BYCR 1993 confirmed as the posing. The submitter's own verification note is unusually candid - two independent Arb implementations, eight Lean modules, explicitly NOT end to end, with the paper's Section 10 as the ledger - and is kept nearly verbatim. modelMaker normalised from \"OpenAI / Anthropic\" to semicolons. Not done here: rebuilding the ancillary Lean or rerunning the interval arithmetic. Watch for a referee and for anyone replaying the ball-arithmetic certificate.",
    message: [
      "Published as Resolved, Unreviewed, significance 30.",
      "",
      "Your verification note is the part worth commenting on: it says two independent Arb implementations check about a million boxes, that eight Lean modules carry no sorry and only the three standard axioms, and that the argument is not formalised end to end, with Section 10 of the paper as the ledger of what is and is not machine-checked. That is exactly the right level of claim for a computer-assisted proof, and it was kept nearly as you wrote it rather than rewritten.",
      "",
      "What was checked here: the abstract against the statement, including that the ratio is 13.8111351794611... and that paths are arbitrary with both radius and polar angle allowed to decrease, which is the general case the conjecture is about and the thing a reader will want to know is not quietly restricted. The ancillary Lean and the interval arithmetic were not rerun.",
      "",
      "Two edits. The vendor field was \"OpenAI / Anthropic\" and the field's convention is semicolons, so it now reads \"OpenAI; Anthropic\". And a significance of 30 with its reasoning: a named 1993 conjecture in a field that teaches this problem, below the larger-field entries at 35.",
      "",
      "If a referee reads it, or anyone replays the ball-arithmetic certificate independently, message us and the verification level moves.",
    ].join("\n"),
  },
  {
    slug: "goldbach-s-conjecture-for-the-liouville-function",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Goldbach's conjecture for the Liouville function",
      shortName: "Liouville-Goldbach",
      field: "Multiplicative number theory",
      fieldGroup: "Number theory",
      statement:
        "The Liouville function $\\lambda(n)$ is $+1$ or $-1$ according to the parity of the number of prime factors of $n$ counted with multiplicity. In August 2018 a MathOverflow question asked for a Goldbach-style statement about its sign: is it true that for every even integer $N > 2$ there are positive integers $a, b$ with $a + b = N$ and $\\lambda(a) = \\lambda(b) = -1$? The case $N = 2$ fails. Sieve methods run into the parity obstruction here, so the question resisted the obvious attacks.",
      posedBy:
        "Asked by the MathOverflow user Pablo, question 307479, 3 August 2018; attributed in the Lean development to a formulation of Shusterman",
      yearPosed: 2018,
      verification: "lean-verified",
      verificationNote:
        "Audited here on 30 September 2026 from a clone at HEAD. Twelve Lean files, 1,689 lines on Lean 4.34.0-rc2: zero sorry, zero axiom declarations, zero native_decide. Audit.lean prints the axioms of liouville_goldbach and of twelve supporting results. GitHub Actions ran the Lean verification workflow green twice on 16 September, including at tag v1.0.0. Statement fidelity checked by hand against the MathOverflow wording: the headline theorem is liouville_goldbach (N) (hEven : Even N) (hN : 2 < N) concluding the existence of a, b with 0 < a, 0 < b, a + b = N and liouville a = liouville b = -1, which is the question exactly, with no extra hypothesis and nothing conjectural assumed. Independent corroboration, which is the other half of lean-verified: an answer posted to the same MathOverflow question on 25 September 2026 by Lingsen Meng states that for the even case an unconditional proof was given independently in September 2026 by an anonymous author together with a Lean formalization, and links this repository at release v1.0.0.",
      resolution: "resolved",
      resolutionMethod: "argument",
      significance: 22,
      significanceNote:
        "A question that sat on MathOverflow for eight years with real literature growing around it rather than a curiosity: Mangerel's IMRN 2024 theorem that $\\lambda(a)\\lambda(N-a)$ is non-constant for $N \\ge 11$ is the nearest prior result, and a 2024 preprint gets all four sign patterns under GRH. Level with the Laplacian $S_{n,n}$ entry at 22 and above the Hlawka entry at 20; below the named-conjecture band at 30, since the asker was an individual on a question site rather than a paper.",
      resultNote:
        "True: for every even $N > 2$ there are positive $a, b$ with $a + b = N$ and $\\lambda(a) = \\lambda(b) = -1$, unconditionally, with no analytic or conjectural hypothesis. The route reduces to a prime modulus, then uses $\\lambda(2n) = \\lambda(3n) = \\lambda(5n) = -\\lambda(n)$ to force $\\lambda$ to agree with the Legendre symbol on an interval, where quadratic reciprocity gives a contradiction; no sieve is used, which is how the parity obstruction is avoided.\n\nTwo pieces of context a reader needs. Mangerel (IMRN 2024) proved that $\\lambda(a)\\lambda(N-a)$ cannot be constant for $N \\ge 11$; that yields a pair with opposite signs and so does NOT imply this statement. And the result has since been generalised: on the same MathOverflow question, Lingsen Meng gives an unconditional argument that all four sign pairs occur for every $N \\notin \\{2,3,4,5,6,9,10\\}$, covering odd $N$ too, while crediting this work as independent and prior for the even case.",
      sourceName: "GitHub repository with Lean proof, release v1.0.0 (CaptainSude, 16 September 2026)",
    },
    links: [
      { label: "MathOverflow 307479, where the question was asked and later corroborated", url: "https://mathoverflow.net/questions/307479/goldbachs-conjecture-for-the-liouville-function", kind: "problem-record" },
      { label: "Mangerel's GRH-conditional four-pattern result", url: "https://arxiv.org/abs/2412.17199", kind: "paper" },
    ],
    reviewNote:
      "Approved 30 Sep 2026: Resolved, Lean-verified, 22. Repo cloned: 12 files / 1,689 lines / 0 sorry / 0 axiom / 0 native_decide / Lean 4.34.0-rc2; CI green twice on 16 Sep incl. v1.0.0; Audit.lean prints axioms of liouville_goldbach. Statement audited by hand against MO 307479 - exact match, no extra hypotheses. PRIOR-ART CHECK, and it went the submitter's way: MO 307479 has two answers. The old one (2018) is a heuristic GPY-sieve remark about omega(n)=omega(n+1), not a proof. The other, posted 25 Sep 2026 by Lingsen Meng, explicitly credits THIS repository at v1.0.0 as an independent unconditional proof of the even case, and adds a stronger all-four-patterns result. Mangerel IMRN 2024 (lambda(a)lambda(N-a) non-constant for N>=11) looked like prior art and is NOT: opposite signs, not both -1. Meng's corroboration is what carries lean-verified past an author's own repository. Watch the MO page.",
    message: [
      "Published as Resolved, Lean-verified, significance 22. The prior-art check on this one is worth reporting in full, because it could have gone the other way and instead it went yours.",
      "",
      "MathOverflow 307479 has two answers. The older one is a heuristic remark about GPY sieves and $\\omega(n) = \\omega(n+1)$, not a proof of your statement. The other was posted on 25 September by Lingsen Meng, and it credits you: for the even case, an unconditional proof \"was given independently in September 2026 by an anonymous author, together with a Lean formalization\", linking your repository at release v1.0.0. A third party asserting the result and naming your artefact as independent and prior is the strongest external evidence anything in this batch carried, and it is what lets the entry sit at Lean-verified rather than Lean-checked, since anchoring cannot come from the prover's own repository alone.",
      "",
      "Two things a reader needs, so the entry records both. Mangerel's IMRN 2024 theorem that $\\lambda(a)\\lambda(N-a)$ is non-constant for $N \\ge 11$ looks like prior art and is not: it gives a pair with opposite signs, not a pair with both values $-1$. And Meng's answer also contains a stronger unconditional statement, all four sign pairs for every $N$ outside seven exceptions, which generalises yours; the result note says so, with your priority for the even case stated.",
      "",
      "The audit: twelve files, 1,689 lines, no sorry, no axiom declarations, no native_decide, CI green twice on 16 September, and your Audit.lean prints the headline theorem's axioms. The formal statement was compared by hand with the MathOverflow wording and matches exactly, with no extra hypothesis.",
      "",
      "Your verification note was one sentence; it has been replaced by the audit above so a reader can see what was checked.",
    ].join("\n"),
  },
  {
    slug: "all-level-nanuq-circularity-and-exact-displayed-split-support",
    action: "approve",
    reason: "edited",
    edits: {
      sourceUrl: SODELIN,
      field: "Mathematical phylogenetics; circular split systems",
      fieldGroup: "Combinatorics",
      significance: 12,
      significanceNote:
        "A question asked in Section 6 of a 2025 Bulletin of Mathematical Biology paper by the authors who proved the level-two case, with a conjecture attached for level three; removing the level bound entirely is the natural next result and the phylogenetics community following NANUQ distances will read it. Level with the Vietoris entry at 12, another Section-6 question from a recent paper, and below the magnitude-continuity entry at 16.",
      verificationNote:
        "Checked here on 30 September 2026 as far as the artefacts allow. The complete all-level theorem has a written computer-assisted proof with separate structural, finite, composition and support audits; two implementations cover 84,076 plane-tree and duplication instances, 122 distinct quartet systems and 24,667 anchor coefficients; the distance-based verifier checks 11,848,859 physical-copy quartets and a second verifier 2,525,210 globally consistent occurrence selections. The submitter states plainly that the complete theorem is computer-assisted and that the Lean endpoints are narrower than it, which is why this is Unreviewed rather than Lean-checked: the headline result is not the formalised part. The site did not rerun the verifiers. The repository's nanuq-finite workflow and its Verify workflow are green on the correct repository. The source URL was corrected: the submitted address omitted the repository's trailing dash and returned 404.",
    },
    reviewNote:
      "Approved 30 Sep 2026: Resolved, Unreviewed, 12. Holtgrefe et al. (Bull. Math. Biol. 2025, DOI 10.1007/s11538-025-...) Section 6 is a real asked question: extension beyond level two, with a level-three conjecture. The submission's statement asks the level question only, so Resolved is scoped to that; the multiple-blob and parametric-family parts of Section 6 are not claimed and the entry does not claim them. Unreviewed not Lean-checked, because the submitter says the headline theorem is computer-assisted and the Lean endpoints are narrower - the formalised part is not the claim. research/nanuq-all-level-2026-09-29/ holds ALL-LEVEL-PROOF.md plus four audits; nanuq-finite.yml and Verify are green. sourceUrl fixed (trailing dash). Verifiers not rerun here.",
    message: [
      "Published as Resolved, Unreviewed, significance 12.",
      "",
      "This is one of the four of your eight submissions that cleared the gate, and the reason is in your own posedBy field: Holtgrefe and coauthors asked in Section 6 whether their level-two result extends, and attached a conjecture for level three. That is a question asked in print by the people who proved the previous case, which is what the catalog records answers to.",
      "",
      "The level is Unreviewed rather than Lean-checked, and that follows your own description rather than contradicting it: you say the complete all-level theorem is computer-assisted and that the Lean endpoints are narrower than the theorem. A Lean level would claim the headline result is the formalised one, and it is not. The note records the scale of what the verifiers do check - 84,076 instances, 11.8 million quartets, a second verifier over 2.5 million selections - because that is the actual evidence and it is substantial.",
      "",
      "Scope: your statement asks the level question, so Resolved is scoped to that. The multiple-blob and parametric-distance-family parts of Section 6 are not claimed on the entry.",
      "",
      "One correction that applied to all eight of today's submissions: the sourceUrl you gave returns 404, because the repository name ends in a dash. Fixed here.",
    ].join("\n"),
  },
  {
    slug: "no-countable-universal-family-of-avoiding-populations-even-with-exact-parent-cou",
    action: "approve",
    reason: "edited",
    edits: {
      sourceUrl: SODELIN,
      field: "Infinite labelled graphs; universality",
      fieldGroup: "Combinatorics",
      significance: 8,
      significanceNote:
        "One of the three questions Alexander left in Section 6 of the 2013 paper that introduced biologically unavoidable sequences, answered thirteen years later. The paper is the one this catalog's classification entry at 14 already turns on, and this is a smaller question from the same page, in a one-author corner of infinite graph theory. Above the Thue-Morse height entry at 5 for being a question Alexander asked rather than a quantitative follow-up, and below the classification itself.",
      verificationNote:
        "Checked here on 30 September 2026 to the extent the artefacts allow. Lean 4.33.1 with Mathlib pinned at 0df444a3. The submitter's manifest records four new modules with 42 selected endpoints and three reused modules with 21 earlier endpoints, permitting only propext, Classical.choice and Quot.sound. The repository's Verify workflow is green on the correct repository. The site did not rebuild the development and no third party has audited the informal-to-formal correspondence, so this is Lean-checked rather than Lean-verified. The source URL was corrected: the submitted address omitted the repository's trailing dash and returned 404. Partial, as submitted: the answer is for ordinary injective embeddings, which is the interpretation the submitter states, and Alexander's Section 6 does not fix an embedding category.",
    },
    reviewNote:
      "Approved 30 Sep 2026: Partial, Lean-checked, 8. Alexander 2013 Section 6 p.12 confirmed as a real posed question (read on 22 Sep when the classification entry was published). Answered negatively for ordinary injective embeddings, with exact-parent preservation. Lean-checked: CI green on the correct repo, but not rebuilt here and no independent statement audit. sourceUrl fixed (trailing dash). Partial kept, because the embedding category is the submitter's choice and Alexander does not fix one - they say so themselves.",
    message: [
      "Published as Partial, Lean-checked, significance 8. This is one of the four that cleared the gate, and the reason is that Alexander asked this question himself, in Section 6 of the 2013 paper, on page 12.",
      "",
      "Partial is kept as you submitted it, and for the reason you give: Section 6 does not fix an embedding category, so a negative answer for ordinary injective embeddings answers the question under a stated interpretation rather than in every sense it could be read. Saying that yourself made the entry easy to write honestly.",
      "",
      "Lean-checked rather than Lean-verified: your CI is green on the repository and your manifest records the endpoints and the three permitted axioms, but the site did not rebuild the development and nobody outside the project has audited the correspondence between the informal statement and the formal one. That second half is what Lean-verified needs.",
      "",
      "Correction applying to all eight of today's submissions: the sourceUrl you gave returns 404 because the repository name ends in a dash. Fixed on the four published entries.",
    ].join("\n"),
  },
  {
    slug: "ordinal-certificates-and-exact-pruning-characterize-sequence-realization",
    action: "approve",
    reason: "edited",
    edits: {
      sourceUrl: SODELIN,
      field: "Infinite labelled graphs; ordinal ranks",
      fieldGroup: "Combinatorics",
      significance: 8,
      significanceNote:
        "The other question Alexander left in Section 6 of the 2013 paper: can the populations realising a possibly avoidable sequence be characterised, particularly using ordinal numbers. Answered for a stated interpretation thirteen years later. Level with the universality entry at 8, its companion from the same page, and below the classification entry at 14.",
      verificationNote:
        "Checked here on 30 September 2026 to the extent the artefacts allow. Lean 4.33.1 with Mathlib pinned at 0df444a3; the manifest records four new modules with 42 selected endpoints and three reused with 21, permitting only propext, Classical.choice and Quot.sound, and the Verify workflow is green on the correct repository. Not rebuilt here and no independent audit of the informal-to-formal correspondence, so Lean-checked. The source URL was corrected for the repository's trailing dash. Partial, as submitted: the ordinal-certificate and pruning characterisations answer a precise reading of Alexander's question and the submitter is explicit that they do not deliver every richer classification the section may have intended.",
    },
    reviewNote:
      "Approved 30 Sep 2026: Partial, Lean-checked, 8. Alexander 2013 Section 6 real posed question (ordinal characterization). Submitter is explicit that this answers a precise interpretation, not every richer classification - Partial kept on that basis. Same verification position as the universality entry: CI green on the correct repo, not rebuilt here, no independent statement audit. sourceUrl fixed.",
    message: [
      "Published as Partial, Lean-checked, significance 8, alongside its companion from the same page of Alexander's Section 6.",
      "",
      "Partial is yours and it is right: you say this answers a precise interpretation of the question and does not claim every richer classification the section may have intended. The entry records that rather than rounding it up.",
      "",
      "Lean-checked for the same reason as the other: CI green, endpoints and axioms recorded in your manifest, but not rebuilt here and no outside audit of the informal-to-formal correspondence.",
      "",
      "The sourceUrl correction described in the other decisions applies here too.",
    ].join("\n"),
  },
  {
    slug: "maximal-specieslike-clusters-with-a-fixed-real-founding-window",
    action: "approve",
    reason: "edited",
    edits: {
      sourceUrl: SODELIN,
      field: "Infinite labelled graphs; mathematical ancestry",
      fieldGroup: "Combinatorics",
      significance: 6,
      significanceNote:
        "Alexander's 2026 Section 6 asks for alternative constraints to common ancestry in maximal-cluster existence, and this answers that direction with one particular constraint, a fixed real founding window, chosen by the submitter. Below the two 2013 Section 6 entries at 8, where Alexander stated the questions themselves, and above the Thue-Morse height entry at 5. The direction was asked for in print; the constraint was not.",
      verificationNote:
        "Checked here on 30 September 2026 to the extent the artefacts allow. Lean 4.33.1 with pinned Mathlib; eight modules contribute 50 selected endpoints for the founder-window chain, permitting only propext, Classical.choice and Quot.sound, and the Verify workflow is green on the correct repository. Not rebuilt here and no independent audit of the informal-to-formal correspondence, so Lean-checked. The source URL was corrected for the repository's trailing dash. Partial, as submitted, and the submitter's own scope statement is kept: the whole class is fixed before maximality is asserted, so this is maximality within the fixed-window class and not unrestricted maximal specieslikeness.",
    },
    reviewNote:
      "Approved 30 Sep 2026: Partial, Lean-checked, 6. Alexander 2026 Section 6 asks for alternative constraints, so the DIRECTION is posed in print even though the fixed-real-window constraint is the submitter's. That is why this publishes at 6 rather than being declined with the four project-formulated ones - it sits between them and the 2013 questions at 8, and the significance note says so. Submitter's scope statement (maximality within the fixed class, not unrestricted) kept verbatim in substance. sourceUrl fixed.",
    message: [
      "Published as Partial, Lean-checked, significance 6.",
      "",
      "This one sat closest to the line. Alexander's Section 6 asks for alternative constraints to common ancestry, so the direction is posed in print; the particular constraint, a fixed real founding window, is yours. That is why it publishes at 6 rather than being declined with the four whose antecedent is a project-formulated question, and why it sits below the two 2013 Section 6 entries at 8, where Alexander stated the questions himself. The significance note says all of that, so the placement is legible rather than arbitrary.",
      "",
      "Your scope statement is kept: the class is fixed before maximality is asserted, so this is maximality within the fixed-window class and not unrestricted maximal specieslikeness. Partial reflects that.",
      "",
      "Lean-checked for the same reasons as your other published entries, and the sourceUrl was corrected for the trailing dash.",
    ].join("\n"),
  },
  {
    slug: "compact-range-vietoris-powers-from-omega-1-to-all-countable-ordinals-above-omega",
    action: "approve",
    reason: "edited",
    edits: {
      field: "General topology; covering and selection properties",
      fieldGroup: "Geometry & topology",
      significance: 12,
      significanceNote:
        "Question 1 of a 2025 arXiv paper, asked by the authors who introduced the Vietoris power for ordered compact sets, and singled out by them at $\\alpha = \\omega+1$; the answer covers every countable $\\alpha$ above $\\omega$. Level with the all-level NANUQ entry at 12, another Section-6-style question from a recent paper answered in full, and below the magnitude-continuity entry at 16 for a smaller following.",
      verificationNote:
        "Audited here on 30 September 2026 by reading the repository at the reviewed snapshot d2e73e4. Lean 4.19.0 with mathlib pinned at c44e0c8e. The principal theorem is VietorisOrdinals.ordinal_full (a : Ordinal) (hlo : omega < a) (hhi : a < omega_1), concluding MainClaim (OrdinalSpace a) together with the failure of the Menger property, and the hypotheses are exactly the range the question asks about with nothing extra. The fidelity check that matters was done by the repository itself and was confirmed here: FullAudit.lean restates the three conclusions - second countable, Lindelof, not sigma-compact - in a bare `example` that does not pass through the MainClaim abbreviation, so a definition quietly shadowing the claim would show up. Lean-checked rather than Lean-verified: the site did not rebuild the project, the submitter reports that a full package build was not completed locally because of resource limits, and the statement is anchored only by the author's own repository. The submitter's note that a further AI review is additional AI checking and not independent human endorsement is correct and is why this stays a Candidate.",
    },
    reviewNote:
      "Approved 30 Sep 2026: Candidate, Lean-checked, 12. Caruvana-Holshouser arXiv:2507.17936v3 Question 1 p.11 confirmed as the posing. Lean read at d2e73e4: ordinal_full has hypotheses omega < a and a < omega_1 and nothing extra; FullAudit.lean re-derives second-countable + Lindelof + not-sigma-compact through a bare `example` bypassing the MainClaim abbreviation, which is the anti-shadowing check - best-built artefact in this batch. Lean 4.19.0, mathlib c44e0c8e. Not rebuilt here; submitter reports the full package build did not complete locally on resource limits, and says plainly that the extra AI review is not independent human endorsement - both recorded. Candidate on that basis.",
    message: [
      "Published as Candidate, Lean-checked, significance 12.",
      "",
      "The Lean is the best-built artefact in today's batch of twelve, and the reason is FullAudit.lean. Restating the three conclusions in a bare `example` that does not pass through the MainClaim abbreviation is exactly the check that catches a definition quietly shadowing the claim, which is the failure mode a reviewer worries about most in a single-author formalisation. It was confirmed here, along with ordinal_full carrying the hypotheses $\\omega < \\alpha$ and $\\alpha < \\omega_1$ and nothing extra.",
      "",
      "Candidate and Lean-checked rather than more, for the three reasons you state yourself: the site did not rebuild the project, your full package build did not complete locally on resource limits, and the further AI review is additional AI checking rather than independent human endorsement. Saying that last part unprompted is the reason the entry could be written without hedging anywhere else.",
      "",
      "The two stages are presented as you asked - the $\\omega+1$ case and the theorem for all countable ordinals above $\\omega$ as one entry answering one question, not as duplicates. The field and field group were filled and the significance set at 12 with its reasoning.",
      "",
      "A completed package build on a machine with room, or a topologist reading the manuscript, would move this.",
    ].join("\n"),
  },
  {
    slug: "finite-offspring-sampling-reverses-a-genetic-epigenetic-barrier-ordering",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "Declined 30 Sep 2026, no-open-question. posedBy: \"Project finite special case of Planidin et al. ... finite-population research direction.\" Planidin et al. (2025) list finite-population extensions as future work; the specific comparison, with one diploid adult per deme, two demes, m=1/4, s=1/2, r=1/2 and a single preselection pulse, is the project's own. The Lean is real (Lean 4.33.1, 34 selected declarations, kernel-checked integer identities, no sorryAx/custom axioms/native_decide) and the submitter explicitly asks for editorial assessment and says novelty of the exact comparison is unestablished. One of four declined from this account today on identical reasoning; four others published. sourceUrl also 404s (trailing dash).",
    message: ["Declined, and the reason is the provenance of the question rather than the work."].concat(SELF_POSED_TAIL).join("\n"),
  },
  {
    slug: "identical-genome-copy-transmission-histories-with-opposite-organism-level-iap",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "Declined 30 Sep 2026, no-open-question. posedBy says outright that \"the constrained inverse-observation question is formulated in this project\". Alexander's 2026 paper defines IAP and specieslike clusters but does not ask this question, which the submitter states. Real Lean (31 modules, 77 public theorem declarations audited at 1ba951e4, hosted runs 36298049178 and 36298049071 both green at head 4ab00a2 - verified here on the correctly-spelled repository). One of four declined on identical reasoning.",
    message: ["Declined, and the reason is the provenance of the question rather than the work."].concat(SELF_POSED_TAIL).join("\n"),
  },
  {
    slug: "an-exact-ownership-sampling-criterion-for-delayed-split-identical-ancestry",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "Declined 30 Sep 2026, no-open-question. posedBy: \"Project observation-recovery follow-up to the constrained diploid IAP construction (2026)\" - that is a follow-up to the project's own preceding submission, which was itself declined today for the same reason, so the antecedent chain never reaches a question anyone else asked. Lean audit at c071d4b8 with 20 selected axiom reports is real. One of four declined on identical reasoning.",
    message: ["Declined, and the reason is the provenance of the question rather than the work."].concat(SELF_POSED_TAIL).join("\n"),
  },
  {
    slug: "exact-sampled-family-recovery-from-independent-binary-inheritance-blocks",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "Declined 30 Sep 2026, no-open-question. posedBy: \"Project one-generation follow-up to Kim, Mossel, Ramnarayan and Turner, Efficient Reconstruction of Stochastic Pedigrees.\" That paper proves REC-GEN; the one-generation specialisation with disjoint parental pairs, distinct parental symbols and independent fair copying is the project's own, and the submitter says so and asks not to be read as formalising the known theorem. Lean audit at ae0beee8, seven modules, 31 declarations. One of four declined on identical reasoning.",
    message: ["Declined, and the reason is the provenance of the question rather than the work."].concat(SELF_POSED_TAIL).join("\n"),
  },
  {
    slug: "an-effective-method-for-matrix-mutation-non-equivalence-fomin-zelevinsky-problem",
    action: "decline",
    reason: "other",
    reviewNote:
      "Declined 30 Sep 2026, other. Same account as the PMAD submission declined 27 Sep; source is a commit in the same repository and the claimed module is PMADLean/Vorticity.lean, read here in full (3,077 lines). To its credit the file does define the genuine Fomin-Zelevinsky rule, mutate_matrix_real and mutate_matrix_real_seq, so this was assessed on the mathematics rather than dismissed. Three findings, each fatal on its own: (1) there is no theorem of the form \"invariants differ therefore not mutation equivalent\" anywhere in the repository, so nothing certifies non-equivalence; (2) variety_invariant is defined by transport along the supplied mutation path, so it is a function of the path and not of the mutation class - the two \"invariance under mutation\" theorems are bookkeeping identities about evaluate_chart_path, one discharged by a single rw; (3) variety_invariant_is_sufficient_classification binds PhaseVorticityTensor as a hypothesis parameter, shadowing the module's own definition of that name, so it is not a statement about the construction it appears to concern, and it additionally assumes h_omega_global (all frequencies equal) and a coupling-cancellation hypothesis. FZ 2.8.2 asks for an effective method; no algorithm with a termination or correctness claim is supplied. Reason is \"other\" and not no-open-question: Problem 2.8.2 is real and open, and the gap is in the claim.",
    message: [
      "Declined. The problem is real and open, so this is not the judgement you got on Sunday about scope: it is about what the Lean establishes.",
      "",
      "Credit first. PMADLean/Vorticity.lean does define the genuine Fomin-Zelevinsky mutation rule, mutate_matrix_real and its iterate, over a real matrix. That is why it was read properly, all three thousand lines, rather than turned away on the framework's name.",
      "",
      "Three findings, and each would be enough on its own.",
      "",
      "First, there is no theorem of the form \"the invariants differ, therefore the two matrices are not mutation equivalent\". That implication is the whole content of an obstruction, and without it nothing in the development certifies non-equivalence of anything.",
      "",
      "Second, variety_invariant is defined by transporting a chart along the mutation path it is given. It is therefore a function of the path, not of the mutation class, and a quantity that changes with the path cannot separate classes. The two theorems named for invariance under mutation are bookkeeping identities about evaluate_chart_path - one of them is discharged by a single rewrite - rather than proofs that a class function is well defined.",
      "",
      "Third, variety_invariant_is_sufficient_classification takes PhaseVorticityTensor as a bound hypothesis parameter, which shadows the module's own definition of the same name. The theorem is thus quantified over an arbitrary function and says nothing about the tensor the construction actually builds. It also assumes that all frequencies are equal and that a coupling sum cancels between every pair, which are severe restrictions.",
      "",
      "Fomin and Zelevinsky ask for an effective method. An effective method needs an algorithm with a termination argument and a correctness proof; neither is here. If you can prove that some quantity is genuinely invariant under a single mutation and then under all finite sequences, that lemma alone would be worth submitting, and everything else would follow from it.",
    ].join("\n"),
  },
];

async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string, ...args: unknown[]) => Promise<T>;
}): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const d of DECISIONS) {
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 60)}`);
    const n = charLength(canonical(d.message));
    console.log(`  message : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const c = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && c > lim;
        console.log(`  ${k.padEnd(17)}: ${c}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    if (d.reviewNote) console.log(`  reviewNote        : ${charLength(canonical(d.reviewNote))} (curator table, no cap)`);
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: d.links ?? [] });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  const pub = DECISIONS.filter((d) => d.action === "approve").length;
  console.log(`${pub} publish, ${DECISIONS.length - pub} decline, ${DECISIONS.length} total`);
  if (DECISIONS.length !== 12) { console.log("COUNT MISMATCH: expected 12"); bad++; }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `\n${localBad} local violation(s)` : "\nlocal checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, status: true, name: true, sourceUrl: true, submittedById: true, links: { select: { label: true, url: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const src = (d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl;
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: src });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 52)} -> merged check: ${v.length ? "FAILED" : "ok"}${d.links?.length ? `  +${d.links.length} links` : ""}${d.edits?.sourceUrl ? "  [sourceUrl fixed]" : ""}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true, _count: { select: { links: true } } },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      const n = cur._count.links;
      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } } : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`${d.action}: ${d.slug}`);
      if (cur.submittedById) {
        await prisma.directMessage.create({
          data: {
            userId: cur.submittedById,
            senderId: curator.id,
            senderName: curator.pseudonym,
            kind: "decision",
            reason: d.reason,
            body: d.message.slice(0, MESSAGE_MAX),
            problemId: cur.id,
          },
        });
        console.log(`messaged: ${d.slug}`);
      }
      await prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      });
      if (d.reviewNote) {
        await prisma.reviewNote.create({
          data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: d.reviewNote },
        });
        console.log(`review note: ${d.slug}`);
      }
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and stats lag");
    console.log("by up to an hour, or until a deploy. Declined rows are not public.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
