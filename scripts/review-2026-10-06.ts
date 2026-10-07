// 6 October 2026: six pending submissions, one contact message, and three
// follow-ups on entries published on 4 October.
//
// Sources were opened and checked on 6 October; where a checker could be run
// or an independent computation written in minutes, it was, and the entry's
// verification note says what ran.
//
// 1. PERIOD-DOUBLING PREFIX PALINDROMIC LENGTH - published, Candidate,
//    Unreviewed, 6. Frid-Laborde-Peltomaki, arXiv 2009.02934v2, Section 5.1,
//    Conjecture 17: d_pd is not 2-automatic, so PPL_pd is not 2-regular.
//    Statement matches exactly (0->01, 1->00 is their a->ab, b->aa). RE-RUN
//    HERE: both of the submission's checkers PASS (2,460 states / 173 ends;
//    independent-review checker 1,593 states / 101 ends, hashes match the
//    README). A separate eertree computation of P(n) for n <= 2^20 confirmed
//    the lift lemma for every m < 2^19, the N(a,b) formula, and the growing
//    windowed 2-kernel (3, 7, 15, 30, 60, 118, 226, 415, ...). The hand proof
//    was not checked. The "independent review" is the same agent (dot). A
//    concurrent preregistration of the same conjecture (the-omega-institute,
//    4 Oct 18:56Z) is later than this submission (12:34Z).
//
// 2. RECOVERY BALANCE AND DUALITY - published, Resolved, Lean-checked, 6.
//    Gruica-Bar-Lev-Ravagnani-Yaakobi Conjecture 1 (arXiv 2401.15722v3,
//    Section 5.3, first in v2 of 30 Sep 2024): C recovery balanced iff its
//    dual is. Proved via a_i(C) + a_i(C^perp) = n. Lean (mathlib, 15 files)
//    grep-clean; codeDual is the real orthogonal complement, recovery is
//    proved equivalent to the paper's column-in-span condition, expectation
//    is the correct tail sum. No CI; not rebuilt. A random-code check
//    written here (68 codes over GF(2), GF(3), GF(5), n <= 7) agrees with
//    the identity. 26 citing papers scanned; none resolves it. Close to
//    classical BEC EXIT duality, which the submitters say themselves.
//
// 3. ARNOSTI'S RANDOM-VERTEX VS RANKING - published, Candidate, Lean-checked,
//    7. Arnosti, Stochastic Systems 2022 (April 2021 author version): "We
//    conjecture that RANDOM-VERTEX continues to yield a stochastically larger
//    matching when all days have identical capacity C_d = C > 2." The equal
//    capacity is part of the conjecture (footnote 6), so the submission is
//    the whole of it; the name is changed so it does not read as a special
//    case. Lean (91 modules, mathlib) grep-clean; SourceModel's definitions
//    match the paper's model. No CI; not rebuilt. An exact DP written here
//    over 600 random small instances found no violation.
//
// 4. FLOURI ET AL. MSCI IDENTIFIABILITY - published, Variant, Unreviewed, 5.
//    The 2020 paper's Discussion: "We speculate that the MSci model is
//    identifiable on such data of sequence alignments as long as it is
//    identifiable when the data consist of gene trees with coalescent
//    times"; Yang-Flouri 2022 restate it as a conjecture. The submission
//    proves it under clock-JC with sufficiently long finite loci, which
//    removes most of the difficulty of "multiple sites per locus", and
//    excludes unphased data and locus-rate variation the source's own
//    analyses use. A nearby question, answered: Variant. Its compiler check
//    PASS; the hand proof was not read.
//
// 5. HKKP QUESTION 6.24 - published, Candidate, Unreviewed, 8. Oren
//    Ben-Bassat, arXiv 2610.01694 (1 Oct 2026, sole author, established in
//    non-archimedean geometry): harmonic norms on quiver representations
//    over any complete non-archimedean field. Question 6.24 of Haiden-
//    Katzarkov-Kontsevich-Pandit (arXiv 2609.00978, 1 Sep 2026) verified in
//    their TeX, directly after Theorem 6.23; both implications answered.
//    AI statement in the paper: "roughly equal contributions of the author
//    and the AI" (ChatGPT-6.0 Sol). Not landmark: a one-month-old question
//    removing one hypothesis. Typos fixed (polysable, feilds, sperically);
//    fieldGroup Analysis -> Algebra.
//
// 6. CNOT 13x13 MINIMUM - declined, no-open-question. The article's own
//    provenance section says Sodhani-Parhi (arXiv 2607.04462) report an
//    achieved 19-gate count and pose nothing; the matrix is a local
//    reconstruction. RE-RUN HERE anyway (WSL, g++ -O3): COMPLETED 363
//    sectors, VERIFIED_FIXED_MATRIX_MINIMUM_19, totals identical to the
//    recorded 27 Sep run. The same account's contact message only added
//    links; the decision answers it and it is marked handled.
//
// FOLLOW-UPS on 4 October entries:
//  - JOSHI-RUST 3.8: an edit on 5 October converted the statement to math
//    markup and changed the first formula to i(2^{n+1}) = 3.2^{2n} - 2^{n-1}.
//    Conjecture 3.8 says i(2^n+1) = 3.2^{2n} - 2^n - 1. Restored, keeping the
//    markup.
//  - EQUIDISTANT LINES: on 4 Oct evening the submitter raised the tier to
//    Lean-checked and appended a pointer to a new Lean development. REBUILT
//    HERE: commit 065e5e2 (Lean 4.32.1 + mathlib, ~6,760 lines), clean
//    clone, lake build no warnings (1,614 jobs), leanchecker --fresh passed,
//    #print axioms from our own probe = propext, Classical.choice,
//    Quot.sound for thm_1_1 and cor_1_2_upper. Definitions read: explicit
//    Euclidean distance, lines = finrank-1 direction, setDist = sInf; no
//    general-position or catalogue hypothesis; the analytic lemmas are
//    formalised and the catalogue replaced by a kernel-checked enumeration.
//    -> Site-confirmed and Resolved. Not Lean-verified: statement audit is
//    ours alone. The note is rewritten (it said "No Lean formalisation" above
//    the submitter's update). The 7-line half is BLR 2015, not in Lean.
//  - VIETORIS POWERS: the submitter asks for Resolved on the strength of a
//    screenshot of a private email from Caruvana. Not a record anyone can
//    check; a reply explains what would be, and keeps the entry as it is.
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
const EXPECTED = 6;

interface Decision {
  slug: string;
  action: "approve" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DECISIONS: Decision[] = [
  {
    slug: "period-doubling-prefix-palindromic-length-is-not-2-regular",
    action: "approve",
    reason: "edited",
    edits: {
      statement:
        "Let $u$ be the fixed point beginning with 0 of the substitution $0\\to01$, $1\\to00$ (the period-doubling word). Let $P(n)$ be the least number of nonempty palindromes whose concatenation is the length-$n$ prefix of $u$, with $P(0)=0$, and put $d(n)=P(n+1)-P(n)$. Frid, Laborde and Peltomäki conjectured that $d$ is not 2-automatic, and so $P$ is not 2-regular. Is that true?",
      model: "OpenAI assistant (dot; underlying model unspecified)",
      sourceName: "Research Commons (GitHub)",
      verificationNote:
        "Re-checked by this site on 6 October 2026. Both of the submission's checkers passed: the local tiling automaton (2,460 states, 3,092 transitions, 173 eligible ends) and the second checker (1,593 states, 101 eligible ends), with hashes matching the README. A separate computation written here (eertree dynamic programming, not the submission's code) found P(n) for every n up to 2^20 and confirmed the proof's exact lift lemma for every m below 2^19, its N(a,b) formula in all cases in range, and that the windowed 2-kernel keeps growing. These are finite checks. The all-length statement rests on the hand proof (backward lifting and the diagonal obstruction), which was not checked here. The package's review is by the same AI agent and is not independent. No Lean formalisation.",
      significance: 6,
      significanceNote:
        "A numbered conjecture in a 2021 TCS paper; the authors note it would be a rare natural example of a non-regular function of an automatic word. Narrow audience. Level with the Joshi-Rust and Shallit-Shur-Zorcic conjectures from combinatorics on words at 6, above the Thue-Morse matching-heights entry at 5.",
    },
    reviewNote:
      "Conj 17 (arXiv v2 5.1) quoted, matches. Both checkers + own eertree to 2^20 agree. Hand proof unchecked. Model: source says only 'dot (OpenAI)'; 'OpenAI Codex' not sourced. Concurrent omega-institute issue #13100 later (18:56Z vs 12:34Z).",
    message: [
      "Published as Candidate, Unreviewed, significance 6.",
      "",
      "Conjecture 17 was read in Section 5.1 of arXiv v2 and your statement matches it. Re-checked here on 6 October: both checkers pass with the hashes in your README, and a separate computation of P(n) up to 2^20 agrees with the lift lemma, the N(a,b) formula and the growing 2-kernel. The verification note says these are finite checks and that the hand proof was not checked here.",
      "",
      "Edits: the statement is now the conjecture alone (the sentence about global minima versus greedy factorizations belongs to the result, which already says it). The model field: your files say \"dot (OpenAI)\" and nothing names Codex, so the field now says that; if dot runs a specific model, tell us and it changes. sourceName shortened.",
      "",
      "As with the earlier two, the package's review is by the same agent and is not counted as independent. Anna Frid or Jarkko Peltomäki reading it would be what moves it.",
    ].join("\n"),
  },
  {
    slug: "recovery-balance-is-preserved-by-duality",
    action: "approve",
    reason: "edited",
    edits: {
      humanCollaborators: [],
      yearPosed: 2024,
      posedBy:
        "Gruica, Bar-Lev, Ravagnani and Yaakobi, A Combinatorial Perspective on Random Access Efficiency for DNA Storage, Conjecture 1 (arXiv:2401.15722v2, Sep 2024; IEEE Trans. Inf. Theory 2025)",
      sourceName: "GitHub",
      verificationNote:
        "Read by this site on 6 October 2026, not rebuilt. Fifteen Lean files with mathlib, Lean 4.34.0; no sorry, admit, axiom declarations, native_decide, opaque, unsafe or implemented_by. The headline theorem codeRecoveryBalanced_dual_iff holds over any field; codeDual is the actual orthogonal complement, recovery is proved equivalent to the paper's column-in-span condition, and the expected number of reads is the correct tail sum. The repository's axiom log lists only propext, Classical.choice and Quot.sound. It has no CI; the build logs are the author's. A separate exact-arithmetic check written here on 68 random codes over GF(2), GF(3) and GF(5) of length up to 7 confirmed a_i(C) + a_i(C^perp) = n in every case. No independent expert has audited the formal statement.",
      significance: 6,
      significanceNote:
        "A conjecture in a 2024 information-theory paper on DNA storage, open about two years, and close to classical binary-erasure EXIT-function duality, as the submitters say. Level with Lorieau's Gasoline conjecture at 6, well below the Pinwheel Kernel Conjecture at 12.",
    },
    reviewNote:
      "Conj 1 quoted (v3 5.3; absent v1, in v2 30 Sep 2024). Lean read, faithful, not rebuilt. Own 68-code check. 26 citing papers, none resolves. humanCollaborators had the account handle; emptied as on 4 Oct.",
    message: [
      "Published as Resolved, Lean-checked, significance 6.",
      "",
      "Conjecture 1 was read in Section 5.3 and your statement matches it. The Lean was read on 6 October, not rebuilt (no CI, mathlib): the dual is the real orthogonal complement, recovery is proved equivalent to the paper's span condition, and the expectation is the right tail sum, so nothing in the definitions weakens the claim. A separate check written here on 68 random codes over three fields agrees with a_i(C) + a_i(C^perp) = n.",
      "",
      "Edits: year posed 2024 (the conjecture first appears in arXiv v2, September 2024) and the IEEE publication added to posedBy; humanCollaborators held the account's handle and is now empty, as on your earlier entries; sourceName is \"GitHub\".",
      "",
      "A GitHub Actions workflow that builds the package and prints the axioms would let the site confirm the build without trusting the logs, and is the quickest route up a rung.",
    ].join("\n"),
  },
  {
    slug: "arnosti-s-equal-capacity-greedy-matching-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Arnosti's RANDOM-VERTEX versus RANKING conjecture for greedy matching",
      verificationNote:
        "Read by this site on 6 October 2026, not rebuilt. 91 modules with mathlib, Lean 4.34.0. Outside deliberately negative control files, no sorry, admit, axiom declarations or native_decide. The final theorem source_matching_tail_comparison assumes only degree at most m; its definitions match the paper's model: independent uniform neighbourhoods of the prescribed degrees, a uniform arrival order, one shared uniform priority order for RANKING, uniform choice among available feasible bins for RANDOM-VERTEX, and equal capacities. The repository's axiom log lists only propext, Classical.choice and Quot.sound. No CI; the build logs are the author's. A separate exact computation written here over 600 random instances with capacity 1 to 4 found no violation of the tail inequality, strict dominance in 241 of them and equality at capacity 1, as Arnosti's Theorem 2 predicts. The 91-module proof itself was not read.",
      significance: 7,
      significanceNote:
        "A stated conjecture in a 2022 Stochastic Systems paper, open about five years, with a modest citation trail and a long proof. Above the Gasoline and DNA-duality conjectures at 6, well below the Pinwheel Kernel Conjecture at 12.",
    },
    reviewNote:
      "Quoted from Arnosti's April 2021 author PDF; journal p.136 not opened. Equal capacity is IN the conjecture (fn 6), so full, renamed. Lean definitions checked vs model. Own DP 600 instances clean. Could move to Resolved/Site-confirmed after a rebuild.",
    message: [
      "Published as Candidate, Lean-checked, significance 7.",
      "",
      "The conjecture was read in Arnosti's author version: \"RANDOM-VERTEX continues to yield a stochastically larger matching when all days have identical capacity C_d = C > 2\". Equal capacity is part of the conjecture itself, so your result is the whole of it. The name said \"equal-capacity\" in a way that reads like a special case, so it is now \"Arnosti's RANDOM-VERTEX versus RANKING conjecture for greedy matching\".",
      "",
      "The Lean was read on 6 October, not rebuilt: the model's definitions in SourceModel match the paper's, and the final theorem carries no extra premise. A separate exact computation over 600 small instances agrees. The verification note says all of this.",
      "",
      "Candidate rather than Resolved, as you proposed, because nobody independent has read the proof or rebuilt it. A CI build that prints the axioms of source_matching_tail_comparison, or a reply from Arnosti, would move it.",
    ].join("\n"),
  },
  {
    slug: "flouri-et-al-msci-identifiability-transfer-under-the-homogeneous-clock-jc-observ",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Flouri et al.'s MSci identifiability conjecture, for clock-JC data with long loci",
      resolution: "variant",
      model: "OpenAI assistant (dot; underlying model unspecified)",
      sourceName: "Research Commons (GitHub)",
      verificationNote:
        "Read by this site on 6 October 2026. The source sentence was checked in the 2020 paper (Discussion, Identifiability of MSci models) and in Yang and Flouri's 2022 restatement. The submission's event-compiler check passed when re-run here; it verifies small rational routing compositions, not identifiability. The identifiability transfer rests on a written proof (bridge/THEOREM.md) that was not read here. Both review records are by the same AI agent. No Lean formalisation.",
      significance: 5,
      significanceNote:
        "The source states it as a one-sentence speculation (2020), named a conjecture in 2022; real and cited, within phylogenetics. Scored for the variant answered, which fixes the clock-JC channel and allows long loci. Level with the Sun conjectures at 5.",
    },
    reviewNote:
      "Source: 2020 Discussion 'We speculate...'; 2022 restates as conjecture. No substitution model or locus length named in source. Long-locus cutoff removes most of the hard part; excludes unphased + rate variation used in the source's analyses -> Variant. Hand proof unread.",
    message: [
      "Published as Variant, Unreviewed, significance 5.",
      "",
      "The source was read: the 2020 Discussion speculates that the MSci model is identifiable from sequence alignments with multiple sites per locus as long as it is identifiable from gene trees with coalescent times, and Yang and Flouri restate that as a conjecture in 2022. Neither names a substitution model or a locus length.",
      "",
      "Variant rather than Candidate, and the reason is the long-locus quantifier. Allowing a sufficiently long finite locus is what makes alignments pin down the timed genealogy, which is most of what the speculation is about; your note is honest that unphased data and locus-rate variation, both used in the source's own analyses, are outside it. The uniform cutoff is a real addition, and the entry says what was answered. The name now says so too.",
      "",
      "Edits: the model field records dot, as your files do; sourceName shortened. The compiler check was re-run here and passes; the bridge proof was not read, and the verification note says so.",
    ].join("\n"),
  },
  {
    slug: "polysable-representations-of-finite-quivers-over-non-archimedean-fields-admit-sp",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Harmonic norms on quiver representations without spherical completeness (Haiden-Katzarkov-Kontsevich-Pandit Question 6.24)",
      shortName: "HKKP Question 6.24",
      field: "Representation theory; non-archimedean geometry",
      fieldGroup: "Algebra",
      statement:
        "Haiden, Katzarkov, Kontsevich and Pandit (Towards Categorical Kähler Geometry, arXiv:2609.00978, Theorem 6.23) prove that over a spherically complete non-archimedean field $K$, a polystable finite-dimensional representation of a finite quiver admits a harmonic norm, and a representation admitting one is semistable. Their Question 6.24 asks: can the spherical completeness assumption on $K$ be omitted in Theorem 6.23?",
      posedBy: "Fabian Haiden, Ludmil Katzarkov, Maxim Kontsevich and Pranav Pandit, Towards Categorical Kähler Geometry (arXiv:2609.00978, September 2026), Question 6.24",
      resultNote:
        "Yes, for finite quivers: over any complete non-archimedean field, every polystable finite-dimensional representation admits a split harmonic norm, and a representation admitting a harmonic norm is semistable, so both implications of Theorem 6.23 hold without spherical completeness. The norm produced is split (diagonalisable), which is the natural form here, since without spherical completeness norms need not diagonalise.",
      verificationNote:
        "Read by this site on 6 October 2026: Question 6.24 was checked in the source of arXiv:2609.00978, where it follows Theorem 6.23 directly, and the paper's main theorem was compared with it and covers both implications for every complete non-archimedean field. The proof was not refereed here. Single-author preprint, posted 1 October 2026; no expert reaction or later discussion found.",
      significance: 8,
      significanceNote:
        "A technical question from a September 2026 outline paper by four well-known authors, answered within a month: removing one hypothesis from one theorem. The askers are famous; the question is young and specialised. Below a typical Erdős problem at 10, level with the 8s from recently posed questions in print.",
    },
    reviewNote:
      "Author Oren Ben-Bassat (established non-archimedean geometer), sole author. AI disclosure in paper: 'roughly equal contributions of the author and the AI' (ChatGPT-6.0 Sol). Q6.24 verified in HKKP TeX. Not landmark (one-month-old hypothesis-removal question). Typos fixed (polysable, feilds, sperically).",
    message: [
      "Published as Candidate, Unreviewed, significance 8.",
      "",
      "Question 6.24 was checked in the source of Haiden, Katzarkov, Kontsevich and Pandit's paper, and the main theorem of arXiv:2610.01694 answers it in full for finite quivers: both implications of their Theorem 6.23 without spherical completeness. The AI statement in the paper is unusually clear about the division of labour, and it is quoted in the entry.",
      "",
      "Edits, the mathematics untouched: \"polysable\" was a typo for polystable in the name and statement, as were \"feilds\" and \"sperically\". The statement now gives the question as posed rather than paraphrasing the theorem. The field group is Algebra rather than Analysis, and posedBy has the authors' full names and the paper. The name now leads with what was asked.",
      "",
      "Candidate rather than Resolved only because the paper is five days old and nobody independent has read it yet. A response from any of the four authors, or a specialist's reading, moves it.",
    ].join("\n"),
  },
  {
    slug: "exact-minimum-cnot-length-of-an-explicit-13-13-binary-transformation",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "No poser: article's own provenance section says Sodhani-Parhi (arXiv 2607.04462) report an achieved 19-gate count, not an open minimality question, and the matrix is a local reconstruction. Verifier re-run here (WSL g++ -O3): COMPLETED 363, VERIFIED_FIXED_MATRIX_MINIMUM_19, totals identical to their 27 Sep run. Contact message ec8cee00 (extra links) answered by this decision.",
    message: [
      "Declined, as a scope decision. The computation itself holds up: your verifier was built and run here on 6 October and finished with VERIFIED_FIXED_MATRIX_MINIMUM_19 over all 363 sectors, with family totals identical to your recorded run of 27 September. Thank you also for the reproducibility links you sent through the contact form; they were used for this.",
      "",
      "The reason is the first part of the scope test: the catalog records answers to questions someone else asked first. Your own provenance section says Sodhani and Parhi report a 19-gate circuit as an achieved count, not an open question about its minimality, and that the matrix is your reconstruction rather than their benchmark data. Your note is candid that no source posing this question has been found. An exact optimum for one explicit operator, with no question attached, falls outside what the site lists.",
      "",
      "What would change it: if Sodhani and Parhi, or anyone working on encoder synthesis, has asked in print whether 19 is optimal, submit it again with that citation. A result on a question the CNOT-synthesis literature has posed, such as exact optima for a whole family of encoders, would also be in scope.",
    ].join("\n"),
  },
];

// The CNOT submitter's contact message only adds links to that submission; it
// is answered by the decision message and marked handled.
const CONTACT_ID = "ec8cee00";

// ---------------------------------------------------------------------------
// Follow-ups on published entries. Each edit is diffed against the live row
// and written with an "updated" activity row, as an ordinary curator edit.

interface Amend {
  slug: string;
  edits: { key: string; field: string; value: unknown }[];
  /// Optional in-app note to the entry's submitter explaining the change.
  note?: string;
}

const AMENDS: Amend[] = [
  {
    slug: "thue-morse-all-three-joshi-rust-first-occurrence-formulas",
    edits: [
      {
        key: "statement",
        field: "Statement",
        value:
          "Let $t(j)$ be the parity of the binary digit sum of $j$, with indexing from zero. Let $A(d)$ be the greatest length of a monochromatic arithmetic progression of positive difference $d$ in $t$, and let $i(d)$ be the least starting index attaining $A(d)$. Joshi–Rust Conjecture 3.8 asks for the three first-occurrence identities: $i(2^n+1)=3\\cdot 2^{2n}-2^n-1$ for $n\\ge2$; $i(2^{2n}-1)=3\\cdot 2^{4n}-2^{2n}+1$ for $n\\ge1$; and $i(2^{2n+1}-1)=2^{2n+1}-1$ for $n\\ge0$. The ranges are explicit: the first formula excludes $n=1$, where the previously recorded value is $i(3)=45$.",
      },
    ],
  },
  {
    slug: "maximum-number-of-pairwise-equidistant-lines-in-mathbb-r-3",
    edits: [
      { key: "verification", field: "Verification", value: "site-confirmed" },
      { key: "resolution", field: "Resolution", value: "resolved" },
      {
        key: "verificationNote",
        field: "Verification note",
        value:
          "Rebuilt by this site on 6 October 2026. The Lean development added on 4 October (commit 065e5e2; Lean 4.32.1 with mathlib, about 6,760 lines) was built from a clean clone with no warnings, passed a fresh leanchecker kernel replay, and #print axioms gives only propext, Classical.choice and Quot.sound for thm_1_1 and cor_1_2_upper. No sorry, axiom declarations, native_decide or implemented_by; finite steps use decide +kernel. The statement was read: no eight affine lines in R^3 have pairwise distance 1, with lines as affine subspaces of one-dimensional direction and distance the infimum of explicit Euclidean point distances; the corollary covers any n >= 8 and any d > 0. No general-position, non-parallel or catalogue hypothesis. The proof formalises the parallel and coplanar direction lemma, the four-line circuit condition and the five-line obstruction, and replaces Finschi's catalogue with a self-contained kernel-checked enumeration. Separately, on 4 October the Python verifier at 9c37327 was re-run here and passed (135 classes, 1,027 metric certificates). Not formalised: the seven-line construction of Bozoki, Lee and Ronyai, which is published. The statement audit is this site's alone.",
      },
    ],
    note: [
      "Your Lean development has been rebuilt here, and the entry is now Resolved and Site-confirmed.",
      "",
      "What ran on 6 October: commit 065e5e2 from a clean clone, lake build with no warnings, a fresh leanchecker kernel replay, and #print axioms on thm_1_1 and cor_1_2_upper from our own probe file, giving only the three standard axioms. The definitions were read too: the explicit Euclidean distance rather than mathlib's sup metric was the right call, and nothing in them assumes away part of the problem. With the analytic lemmas now in the kernel alongside the self-contained enumeration, the reason for Candidate is gone.",
      "",
      "The verification note has been rewritten to say all of this in one piece; the earlier text said \"No Lean formalisation\" above your update, which read oddly. It is not Lean-verified yet, because the statement audit is ours alone. Adding a GitHub Actions workflow that builds and prints the axioms, or a discrete geometer reading the formal statement in public, would take it there.",
      "",
      "One small thing for next time: raising a tier on your own entry is allowed, but a line in a comment saying what changed makes it easier for a curator to follow up quickly.",
    ].join("\n"),
  },
];

// Reply on the Vietoris entry, under the submitter's request.
const VIETORIS = {
  slug: "compact-range-vietoris-powers-from-omega-1-to-all-countable-ordinals-above-omega",
  parentBy: "StormyGander827",
  body: [
    "Thank you, and congratulations: agreement from a coauthor of the paper that posed Question 1 is exactly the kind of evidence that moves an entry.",
    "",
    "The rule for Independently expert-verified is that the expert's agreement is on a record anyone can check. A screenshot of a private email, relayed by a third party, is not that, wherever it is posted, because a reader cannot tell what was asked or confirm the sender. The simplest route is for Christopher Caruvana to say it himself in public: a comment on this entry (signing in with Google or GitHub takes a minute), a line on his own page, or a message through the contact form that we can quote with his permission. Any of those, and this becomes Resolved and Independently expert-verified the same day.",
    "",
    "Until then the entry stays Candidate and Lean-checked, and the verification note keeps your account of the email, which is accurate about what it is.",
  ].join("\n"),
};

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
  const measure = (k: string, v: unknown) => {
    if (typeof v !== "string") {
      console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
      return;
    }
    const c = charLength(canonical(v));
    const lim = limit.get(k);
    const over = lim !== undefined && c > lim;
    console.log(`  ${k.padEnd(17)}: ${c}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
    if (over) bad++;
  };
  for (const d of DECISIONS) {
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 60)}`);
    const n = charLength(canonical(d.message));
    console.log(`  message : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) measure(k, v);
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: d.links ?? [] });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  for (const a of AMENDS) {
    console.log(`AMEND    ${a.slug.slice(0, 60)}`);
    for (const e of a.edits) measure(e.key, e.value);
    const v = checkStoredEntry({
      specs: SPECS,
      fields: Object.fromEntries(a.edits.map((e) => [e.key, e.value])),
      links: [],
    });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  console.log(`COMMENT  vietoris reply: ${charLength(canonical(VIETORIS.body))} chars\n`);
  const outgoing = [
    ...DECISIONS.map((d) => d.message),
    VIETORIS.body,
    ...AMENDS.flatMap((a) => a.edits.map((e) => String(e.value))),
  ];
  for (const t of outgoing) {
    if (/—/.test(t)) {
      console.log("EM DASH in outgoing text");
      bad++;
    }
  }
  for (const a of AMENDS) {
    if (!a.note) continue;
    const n = charLength(canonical(a.note));
    console.log(`NOTE     ${a.slug.slice(0, 50)}: ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    if (/—/.test(a.note)) { console.log("EM DASH in note"); bad++; }
  }
  const pub = DECISIONS.filter((d) => d.action === "approve").length;
  console.log(`${pub} publish, ${DECISIONS.length - pub} decline, ${DECISIONS.length} total; ${AMENDS.length} amendment(s); 1 comment`);
  if (DECISIONS.length !== EXPECTED) {
    console.log(`COUNT MISMATCH: expected ${EXPECTED}`);
    bad++;
  }
  return bad;
}

const fmt = (v: unknown) =>
  v === null || v === undefined ? null : Array.isArray(v) ? JSON.stringify(v) : String(v);
const short = (s: string | null) => (s === null ? "(empty)" : s.length > 140 ? `${s.slice(0, 140)}...` : s);

interface Change {
  field: string;
  oldValue: string | null;
  newValue: string | null;
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

    // Pre-flight: every lookup happens before any write.
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, status: true, name: true, sourceUrl: true, links: { select: { label: true, url: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: cur.sourceUrl });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 52)} -> merged check: ${v.length ? "FAILED" : "ok"}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
    }

    const amendPlan: { id: string; slug: string; data: Record<string, unknown>; changes: Change[]; note?: string; submittedById: string | null }[] = [];
    for (const a of AMENDS) {
      const p = await prisma.problem.findUnique({ where: { slug: a.slug } });
      if (!p) throw new Error(`no entry ${a.slug}`);
      if (p.status !== "published") throw new Error(`${a.slug} is ${p.status}`);
      const row = p as unknown as Record<string, unknown>;
      const data: Record<string, unknown> = {};
      const changes: Change[] = [];
      for (const e of a.edits) {
        if (fmt(row[e.key]) === fmt(e.value)) continue;
        data[e.key] = e.value;
        changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
      }
      const v = checkStoredEntry({ specs: SPECS, fields: data, links: [], sourceUrl: p.sourceUrl });
      if (v.length) throw new Error(`amend ${a.slug} would be refused: ${v.map((x) => x.problem).join("; ")}`);
      console.log(`\nAMEND    ${a.slug}  (verification=${p.verification}, resolution=${p.resolution})`);
      for (const c of changes) console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
      if (!changes.length) console.log("  nothing to change");
      if (a.note) console.log(`  note to submitter: ${p.submittedById ? "yes" : "NO SUBMITTER"}`);
      amendPlan.push({ id: p.id, slug: a.slug, data, changes, note: a.note, submittedById: p.submittedById });
    }

    const vp = await prisma.problem.findUnique({ where: { slug: VIETORIS.slug }, select: { id: true } });
    if (!vp) throw new Error("vietoris entry missing");
    const parent = await prisma.comment.findFirst({
      where: { problemId: vp.id, userName: VIETORIS.parentBy, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });
    if (!parent) throw new Error("vietoris parent comment missing");
    const already = curator
      ? await prisma.comment.findFirst({ where: { parentId: parent.id, userId: curator.id }, select: { id: true } })
      : null;
    console.log(`\nCOMMENT  reply under ${VIETORIS.parentBy}'s comment ${parent.id} (${parent.createdAt.toISOString()})${already ? "  ALREADY REPLIED - skipped" : ""}`);

    const msgRows = await prisma.$queryRawUnsafe<{ id: string; status: string }[]>(
      `SELECT id::text AS id, status FROM "SiteMessage" WHERE id::text LIKE $1 || '%'`,
      CONTACT_ID,
    );
    if (msgRows.length !== 1) throw new Error(`contact ${CONTACT_ID}: ${msgRows.length} rows`);
    const msg = msgRows[0];
    console.log(`CONTACT  ${msg.id} (${msg.status}) -> answered by the CNOT decision, mark handled`);

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
      }
    }

    for (const a of amendPlan) {
      if (!a.changes.length) continue;
      await prisma.$transaction([
        prisma.problem.update({ where: { id: a.id }, data: a.data as never }),
        prisma.problemActivity.createMany({
          data: a.changes.map((c) => ({
            problemId: a.id,
            userId: curator.id,
            userName: curator.pseudonym,
            type: "updated" as const,
            field: c.field,
            oldValue: c.oldValue,
            newValue: c.newValue,
          })),
        }),
      ]);
      console.log(`amended: ${a.slug} (${a.changes.map((c) => c.field).join(", ")})`);
      if (a.note && a.submittedById) {
        await prisma.directMessage.create({
          data: {
            userId: a.submittedById,
            senderId: curator.id,
            senderName: curator.pseudonym,
            kind: "note",
            body: a.note.slice(0, MESSAGE_MAX),
            problemId: a.id,
          },
        });
        console.log(`noted: ${a.slug}`);
      }
    }

    if (!already) {
      await prisma.comment.create({
        data: { problemId: vp.id, userId: curator.id, userName: curator.pseudonym, body: VIETORIS.body, parentId: parent.id },
      });
      console.log("replied on the Vietoris entry");
    }

    if (msg.status === "open") {
      await prisma.siteMessage.update({ where: { id: msg.id }, data: { status: "handled", handledAt: new Date() } });
      console.log(`contact handled: ${msg.id}`);
    }

    console.log("\nAPPLIED. New entries render on first request; lists, stats and edited");
    console.log("entry pages lag by up to an hour, or until a deploy.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
