// Review of the four submissions that arrived 10-11 September 2026.
// Three approved with edits, one declined. The two older ones in the same
// queue (xi normality, Gromov-Hausdorff) are decided in review-2026-09-10.ts,
// which runs first and refuses if either is no longer pending.
//
// ---------------------------------------------------------------------------
// HILBERT-UMD SHARPNESS (Lorist, van Neerven; arXiv 2609.10444) - approved,
// Lean-verified, ai-co-developed, significance 25.
//
// The claim: the classical quadratic comparisons between the Hilbert
// transform constant and the UMD constant, h <~ beta^2 and beta <~ h^2, are
// both sharp. Two explicit families of 2^n-dimensional spaces, X_n with
// h ~ n and beta ~ sqrt(n), Y_n the reverse. The paper says "it has long been
// an open problem whether these can be improved to linear bounds", cites
// Burkholder's 2001 Handbook survey, and records Wenzel's summation operators
// as earlier candidates for exactly this separation.
//
// Checked at the level the Lean tier requires, on the pinned commit 055d95e:
//
//   1. Statement. Main/PaperStatement.lean states Theorem11Bounds: the two
//      dimensions and all eight inequalities, with n and sqrt(n) literally
//      as in the paper and universal constants c, C. hbar and beta are
//      abbreviations of hilbertConstant and umdConstant on the identity.
//   2. The two constants are project definitions - Mathlib has no UMD
//      constant - so they are the trust surface, and both were read.
//      umdConstant is the infimum of C over ALL sigma-finite sample spaces,
//      filtrations, L^p martingales and unimodular coefficients such that
//      the martingale transform is bounded by C times the difference sum;
//      hilbertConstant is the infimum of C over all C^1 compactly supported
//      f such that a principal-value Hilbert transform exists in L^p with
//      norm at most C times the norm of f. Those are the textbook notions.
//      A universe-independence theorem transports beta between universes
//      with the same coefficients.
//   3. Counted: no sorry, no axiom declarations, no native_decide, no unsafe
//      anywhere in the sources. tests/AxiomAudit.lean walks EVERY project
//      declaration transitively and fails on any admission or any axiom
//      beyond propext, Classical.choice, Quot.sound.
//   4. Independent of the authors' machines: GitHub Actions ran the build
//      and the audit on ubuntu and windows at the reviewed commit, both
//      green.
//
// What the formalisation does not cover, and the entry says so: Corollary
// 1.3 (every p other than 2, via extrapolation) and the exact coefficients of
// Remark 1.2, where the Lean development proves the same growth rates with
// different numbers. The submitter's own verification note already said
// this, accurately.
//
// Dating: 1983 kept. Bourgain 1983 and Burkholder 1983 established the
// quadratic bounds and so opened the sharpness question, the same shape as
// dating Navier-Stokes from Leray; the 2001 survey is where it is written
// down as a problem. posedBy now says both. The submitter had flagged this
// exact distinction in their note.
//
// Significance 25, level with kalton-peck-space-hyperplanes and
// mazya-maximal-operator-banach-space, below Stein's dimension-free Riesz
// problem at 38: a long-standing question with its own literature (Wenzel,
// Petermichl, Domelevo-Petermichl reduce it to a dyadic shift) inside one
// research community.
//
// ---------------------------------------------------------------------------
// ENTROPY-METHOD CEILING FOR UNION-CLOSED (Moffat) - approved, Lean-checked,
// ai-discovered, significance 18.
//
// Two unconditional barrier theorems: every single-letter certificate whose
// classes contain product laws certifies at most 1 - h(1/sqrt 2)/sqrt 2 =
// 0.383099..., and every certificate using the i.i.d. protocol whose other
// classes admit component hiding certifies at most 0.382885... The refined
// ceiling sits 1.8e-4 above Liu's record 0.382709. Frankl's conjecture is
// not claimed and the entry says so twice.
//
// Was the question posed? Not as a numbered problem, but it was live in
// print: Cambie's 2022 paper (arXiv 2212.12500) says it focuses "on the
// intuition behind this entropy approach and its boundaries" and argues the
// constant "cannot be significantly improved" by Sawin's question; Liu 2023
// raises "a natural question" about other couplings. Cambie solved the
// ceiling of one specific certificate form (Sawin's, 0.3823455); nothing
// found gives a ceiling over the whole single-letter framework. That is the
// new content, and it is not a duplicate of anything in the catalog.
//
// Tier: Lean-checked, not Lean-verified, and the distinction is exactly the
// one the tier exists for. The two ceiling theorems ARE machine-checked -
// lean/ builds with no sorry and the standard three axioms, check.sh
// enforces both, and the lean and verify workflows are green at HEAD - but
// what Lean proves is a theorem about `Certifies`, the author's own
// finite-model definition of "single-letter certificate". Whether every
// certificate in the literature is an instance is Lemma 3.3, whose
// maximal-correlation case is paper-only, and Gilmer's reduction is a
// hypothesis in the development. So the artifact compiles and the statement
// it proves is faithful to the paper's framework; the framework's fidelity
// to the informal claim "the entropy method cannot reach 1/2" was not
// audited here. That is lean-checked by the site's definition.
//
// Publication: announcement, not preprint. The README says "Not yet on arXiv
// (endorsement pending)"; the version of record is a GitHub release. The
// site's definition puts a repository-hosted manuscript at announcement, and
// it flips the day arXiv accepts it. sourceUrl pinned to the v1.2 release.
//
// ai-discovered stands on the author's own account and logs: the lead
// model selected the problem and found both theorems, including the
// component-hiding idea; the human set the goal, checked, and decided what
// to publish. Referee-round reports and the campaign log are in the repo.
//
// Significance 18: below the Oddtown anchor at 20, which is a named
// question, above boppana-entropy-generalization at 8; the audience is the
// small group that has been pushing this method since 2022, and they had
// asked this out loud.
//
// ---------------------------------------------------------------------------
// LAMBDA <= 0.1787854 (Gomila) - declined, reason no-open-question.
//
// The submission form took the submitter's name as the entry name, and has
// no statement, no field and no links; but the substance is clear from the
// repository: a computer-assisted improvement of the upper bound on the de
// Bruijn-Newman constant from 0.2 (Platt-Trudgian, via Polymath 15) to
// 0.1787854, not peer reviewed, with an external referee report in the repo
// and a named expert reworking the exposition.
//
// That is a numeric record, not the resolution of a posed question - the
// posed question here is Newman's conjecture Lambda = 0, which this does not
// touch. This site tracks records of exactly this kind as Frontiers (Shannon
// capacity of C11, prime gaps, the matrix multiplication exponent), not as
// entries, and there is no de Bruijn-Newman frontier yet. Declined as an
// entry with the reason spelled out and the frontier route named; whether to
// open that frontier is the curator's decision and is flagged separately.
//
// ---------------------------------------------------------------------------
// subDMQ ARITHMETIC IS TRIVIAL (GPT-6 Astra; Simonelli) - approved,
// ai-discovered, verification downgraded to unreviewed, significance 10.
//
// Same submitter and same shape as signed-depth-relevance-of-subdl (reviewed
// 24 Aug), and the same call for the same reason. The paper's author line is
// the model, with a footnote crediting Simonelli for initiating and guiding
// the conversation: ai-discovered stands. The question was public: Ripley's
// slides on the restricted-quantification proposal (joint with Weber) say
// "naive set theory in subDMQ is not known to be trivial" and that the
// programme works "without a net: no nontriviality proofs". This answers
// it: number-restricted induction restores contraction, and with naive
// comprehension and Curry fixed points that is triviality.
//
// The downgrade. The submission says Ripley confirmed the result. The only
// public trace is the paper's own footnote 3: "I thank Ellie Ripley for
// confirming that the argument poses a problem for the intended programme,
// and for feedback on an earlier draft". That is a stronger trace than the
// subDL case - it records agreement rather than a correction - and Ripley
// is the right person, the proposer of the system, confirming a result
// against their own proposal. But it is still the author's report of a
// private exchange, not the expert's own words a reader can follow; the
// expert-verified rung's worked example is a published statement by the
// experts themselves. Unreviewed, with the note recording exactly what the
// footnote says, so it does not read as "nobody looked".
//
// Significance 10, one step above the subDL entry at 7: that one settled a
// relevance property of a logic; this one shows a proposed foundation
// proves everything, which forces a revision of the programme. Still a
// community of a few dozen.
//
// ---------------------------------------------------------------------------
// Pass --lint to run every local check (field limits, the form's own rules,
// message lengths) without touching a database. Dry run by default. Pass
// --apply to write. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const LINK_LABEL_MAX = 120;

const UMD_REPO = "https://github.com/elorist/UMD_Hilberttransform";
const UMD_SHA = "055d95e55fe97988d1e94f6a5d11d126eb5e3a3d";
const UC_REPO = "https://github.com/moffatstudio/union-closed-constant";

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
}

const DECISIONS: Decision[] = [
  {
    slug: "the-hilbert-transform-umd-dependence-problem",
    action: "approve",
    reason: "edited",
    edits: {
      name: "The Hilbert transform-UMD dependence problem",
      statement:
        "For fixed $1<p<\\infty$ and a Banach space $X$, Burkholder and Bourgain showed in 1983 that the UMD property is equivalent to boundedness of the Hilbert transform on $L^p(\\mathbb{R};X)$, with the quadratic comparisons $\\hbar_{p,X}\\lesssim\\beta_{p,X}^{2}$ and $\\beta_{p,X}\\lesssim\\hbar_{p,X}^{2}$ between the Hilbert transform constant and the UMD constant. What is the optimal dependence between $\\hbar_{p,X}$ and $\\beta_{p,X}$, uniformly over all UMD spaces $X$: can either quadratic bound be improved, in the best case to a linear one?",
      posedBy:
        "Implicit in Burkholder's and Bourgain's 1983 quadratic bounds; stated as an open problem in Burkholder's 2001 Handbook survey",
      resultNote:
        "Neither exponent can be lowered. Theorem 1.1 constructs explicit $2^{n}$-dimensional spaces $X_n$ and $Y_n$ with $\\hbar_{2,X_n}\\asymp n$, $\\beta_{2,X_n}\\asymp\\sqrt n$ and $\\beta_{2,Y_n}\\asymp n$, $\\hbar_{2,Y_n}\\asymp\\sqrt n$, with universal comparison constants, so both quadratic comparisons are sharp at $p=2$; Corollary 1.3 extends the growth rates to every fixed $1<p<\\infty$ by extrapolation, with constants depending on $p$. The spaces are built from the summation operators Wenzel had proposed as candidates for exactly this separation. The Lean formalisation covers Theorem 1.1 at $p=2$ over both real and complex scalars; the extrapolation to other $p$ and the exact coefficients of Remark 1.2 are outside it.",
      verificationNote:
        "Checked here on 12 September 2026 by reading the repository at commit 055d95e. Main/PaperStatement.lean states the theorem as the two dimensions and all eight inequalities, with $n$ and $\\sqrt n$ literally as in the paper and universal constants. Mathlib has no UMD constant, so the two constants are project definitions and are the trust surface; both were read. umdConstant is the infimum of $C$ over all $\\sigma$-finite sample spaces, filtrations, $L^p$ martingales and unimodular coefficients for which the martingale transform is bounded by $C$ times the difference sum, and hilbertConstant is the infimum of $C$ over all $C^1$ compactly supported $f$ admitting a principal-value Hilbert transform in $L^p$ with norm at most $C\\,\\|f\\|_p$; these are the standard notions. No sorry, no axiom declarations, no native_decide anywhere; tests/AxiomAudit.lean walks every project declaration transitively and fails on any admission or any axiom beyond propext, Classical.choice and Quot.sound. GitHub Actions ran the build and that audit on Ubuntu and Windows at the reviewed commit, both green, which puts the kernel check on machines other than the authors'. The build was not repeated here. Not formalised: Corollary 1.3 and the exact coefficients of Remark 1.2.",
      aiRole:
        "The paper's AI disclosure: \"The examples proving the quadratic dependencies were found in conversations with OpenAI's Astra model. All statements and proofs in the final manuscript have been reviewed by the authors and subsequently proof-checked in Lean 4 using OpenAI's Astra model.\" The repository README adds that the Lean code, documentation, scripts and tests were generated with GPT-6 Astra under human direction. Co-developed: the decisive constructions came out of conversations with the model, and two named authors reviewed and take responsibility for the manuscript.",
      significance: 25,
      significanceNote:
        "A long-standing question with its own literature inside vector-valued harmonic analysis: the paper calls it a long-open problem, Burkholder's 2001 survey states it, Wenzel proposed candidate operators for the separation, and Domelevo and Petermichl reduced it to a dyadic shift. Level with the Kalton-Peck hyperplane and Maz'ya maximal-operator entries at 25, and below Stein's dimension-free Riesz transform problem at 38, which is known well beyond one community.",
      sourceName: "arXiv 2609.10444, v1 (9 September 2026)",
    },
    links: [
      {
        kind: "lean-statement",
        label: "PaperStatement.lean: Theorem 1.1 as formalised, at the reviewed commit",
        url: `${UMD_REPO}/blob/${UMD_SHA}/HilbertUMD/Main/PaperStatement.lean`,
      },
      {
        kind: "other",
        label: "GitHub Actions: build and whole-project axiom audit, Ubuntu and Windows",
        url: `${UMD_REPO}/actions`,
      },
    ],
    message: [
      "Approved and published at Lean-verified.",
      "",
      "What was checked rather than taken on trust: PaperStatement.lean states all eight inequalities with n and sqrt(n) as in the paper; the two constants are project definitions, since Mathlib has no UMD constant, so both were read - umdConstant quantifies over all sigma-finite sample spaces, filtrations, L^p martingales and unimodular coefficients, hilbertConstant over C^1 compactly supported tests with a principal-value transform - and they are the standard notions. No sorry or extra axiom anywhere, AxiomAudit.lean walks every declaration transitively, and the Actions runs on Ubuntu and Windows at commit 055d95e are green. I did not rebuild locally.",
      "",
      "Your verification note was accurate about the formalisation's scope, and the entry keeps that: Theorem 1.1 at p = 2, not Corollary 1.3, and coefficients that differ from Remark 1.2 without changing the growth rates.",
      "",
      "Dating: 1983 kept, and your note on it was the honest way to handle it. The quadratic bounds of Bourgain and Burkholder are what opened the sharpness question, which is the same convention this site uses for Navier-Stokes from Leray; posedBy now says that and names the 2001 Handbook survey as where it is written down as a problem.",
      "",
      "Significance 25, level with the Kalton-Peck and Maz'ya entries and below Stein's Riesz problem at 38. Two links added: the formal statement file at the reviewed commit, and the Actions page, so a reader can see the cross-platform audit without cloning.",
    ].join("\n"),
  },
  {
    slug: "the-ceiling-of-the-single-letter-entropy-method-for-the-union-closed-sets-conjec",
    action: "approve",
    reason: "edited",
    edits: {
      posedBy:
        "Raised in the entropy-method literature after Gilmer (2022): Cambie (2022) studies the approach's boundaries, Liu (2023) asks whether other couplings can improve it",
      verification: "lean-checked",
      verificationNote:
        "Filed at Lean-checked rather than Lean-verified, and the distinction is the one that tier exists for. The two unconditional ceiling theorems are machine-checked: the lean/ project builds with no sorry and only propext, Classical.choice and Quot.sound, check.sh enforces both, and the lean and verify workflows were green at HEAD on 10 September. What Lean proves, though, is a theorem about Certifies, the author's own finite-model definition of a single-letter certificate. Whether every certificate in the literature is an instance is Lemma 3.3, whose maximal-correlation case is paper-only, and Gilmer's reduction from union-closed families to the certificate is a hypothesis in the development rather than a theorem. So the artifact compiles and proves what the paper's framework says; the framework's fidelity to the informal claim that the entropy method cannot reach $1/2$ was not audited here. The computer-assisted constant $0.38284$ is conditional on two numerically verified hypotheses of the same kind as those behind Liu's record, and is not in the formalisation. Not peer reviewed and not checked by a named expert; four rounds of referee reports were produced by the author's own model agents and are in the repository.",
      publication: "announcement",
      significance: 18,
      significanceNote:
        "Not a numbered question, but one the people pushing this method had asked in print: Cambie's 2022 paper studies the approach's boundaries and argues Sawin's question cannot move the constant far, and Liu 2023 asks whether other couplings can. Nothing found gives a ceiling over the whole single-letter framework, which is what this settles. Below the Oddtown anchor at 20, a named question, and above the Boppana entropy generalisation at 8; the readership is the small group that has worked this method since 2022, and Frankl's conjecture itself is untouched.",
      sourceUrl: `${UC_REPO}/releases/tag/v1.2`,
      sourceName:
        "GitHub release v1.2, the stated version of record: paper, code, logs, referee reports and Lean",
    },
    links: [
      {
        kind: "paper",
        label: "The paper, 31 pages with the Lean appendices, at v1.2",
        url: `${UC_REPO}/blob/v1.2/paper/paper.pdf`,
      },
      {
        kind: "lean-proof",
        label: "lean/: Theorems 3.1 and 3.4 machine-checked, with check.sh",
        url: `${UC_REPO}/tree/v1.2/lean`,
      },
      {
        kind: "problem-record",
        label: "Cambie 2022, which studies the entropy approach's boundaries",
        url: "https://arxiv.org/abs/2212.12500",
      },
    ],
    message: [
      "Approved and published, as the ceiling theorems, exactly as you framed it - not as a partial on Frankl. The two ceilings are the result; the constant is context, and the entry keeps that order.",
      "",
      "Three changes, all explained on the entry.",
      "",
      "Verification is Lean-checked rather than Unreviewed, which is a step up, but not Lean-verified, which you did not claim. The two theorems are machine-checked - no sorry, the standard three axioms, check.sh enforcing both, CI green at HEAD - and that is real. What Lean proves is a theorem about Certifies, your own definition of a single-letter certificate; whether every certificate in the literature is an instance is Lemma 3.3, part of which is paper-only, and Gilmer's reduction is a hypothesis in the development. That is the definition of Lean-checked on this site: the artifact compiles and matches the paper's framework, and the framework's match to the informal claim was not audited here.",
      "",
      "Publication is Announcement, not Preprint. Your README says it: not yet on arXiv, endorsement pending. The site's definition puts a repository-hosted manuscript there, and it flips to Preprint the day the arXiv posting exists - tell me and it changes. The source URL is pinned to the v1.2 release you named as the version of record.",
      "",
      "posedBy is expanded from \"implicit\" to the two places it was actually raised in print: Cambie 2022 on the approach's boundaries, Liu 2023 on whether other couplings help. Cambie's paper is linked as the problem record. That is also why this is not a duplicate: Cambie solved the ceiling of one certificate form, Sawin's; nothing found gives one over the whole framework.",
      "",
      "Significance 18: below the Oddtown anchor at 20, since nobody numbered this question, and above the Boppana entropy generalisation at 8.",
      "",
      "The repository is a model of how to make a claim checkable: the referee rounds, the re-certification from the written statement alone, the withdrawn claims left in place and marked.",
    ].join("\n"),
  },
  {
    slug: "jude-gomila",
    action: "reject",
    reason: "no-open-question",
    message: [
      "Thanks for sending this, and for the care in the repository: the sealed manifests, the fail-closed certificates, the external referee report and the open review questions are all more than most submissions here carry. This is declined as an entry, for a reason about scope rather than about the work.",
      "",
      "The site's inclusion test is a precisely stated open question whose answer is now a proved or disproved theorem. Lambda <= 0.1787854 is a new upper bound - an improvement of a record from 0.2 - and the posed question in this area is Newman's conjecture that Lambda = 0, which this does not settle. Records of exactly this kind are tracked here as Frontiers, not as entries: the Shannon capacity of C11, prime gaps, the matrix multiplication exponent each have a staircase page with one row per improvement and a source pinned for each. There is no de Bruijn-Newman frontier yet. Opening one is a curator decision and I have flagged it; if it opens, this bound would be its most recent row, marked as it is marked in your own README - computer-assisted, not yet peer reviewed - with the Platt-Trudgian 0.2 and Polymath's 0.22 above it.",
      "",
      "Two things worth knowing if it comes to that. A frontier row needs a pinned source: a release tag or a commit rather than a moving branch, which your sealed SHA256SUMS already make natural. And the entry form took your name as the entry name, and had no statement or field, so nothing from this submission was reusable as text; that is a form usability problem on our side as much as anything.",
      "",
      "Nothing here is a judgement on the mathematics, which nobody at this site is placed to make.",
    ].join("\n"),
  },
  {
    slug: "nontriviality-of-number-restricted-arithmetic-over-subdmq",
    action: "approve",
    reason: "downgraded",
    edits: {
      shortName: "subDMQ arithmetic is trivial",
      statement:
        "Weber's programme of paraconsistent mathematics keeps unrestricted comprehension and revises the logic of inference so that contradictions do not make every statement provable. Ripley and Weber's 2026 proposal restricts induction to numbers as part of a strategy for blocking paradox, and Ripley's presentation of it records that the resulting theory is not known to be trivial, the programme working \"without a net: no nontriviality proofs\". Is number-restricted arithmetic over subDMQ nontrivial: does it, together with naive comprehension and induction over the combined language, avoid proving everything?",
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      verification: "unreviewed",
      verificationNote:
        "Filed as Unreviewed rather than the submitted Expert-verified, for the same reason as this submitter's earlier subDL entry, and the trace is stronger this time. The paper's footnote 3 reads: \"I thank Ellie Ripley for confirming that the argument poses a problem for the intended programme, and for feedback on an earlier draft that helped to clarify and shorten this note.\" Ripley is exactly the right person - the proposer of subDMQ and of the restricted-induction strategy, confirming a result against their own proposal - and that footnote records agreement, not merely a correction. But it is the author's report of a private exchange, not the expert's own words a reader can follow to the source, and the Expert-verified rung's worked example is a published statement by the experts themselves. A public statement from Ripley would lift it. The paper supplies finite Hilbert-style proof certificates replayed by a custom Python checker and Isabelle replay scripts that the submitter reports have not been executed; neither was run here. This site checked the surrounding facts, not the derivations: Ripley's slides state the question as open, and the paper's source comparison pins Ripley's formalisation to the commit it examined.",
      aiRole:
        "The paper's author line is \"GPT-6 Astra (context 1e44c278f25b)\", dated 10 September 2026, with a footnote: \"Ryan Simonelli initiated and guided the research conversation that produced this note. The argument emerged from repeated unsuccessful attempts, at his prompting, to find an elegant sequent calculus with syntactic cut elimination for Ripley's reconstruction of Weber's mathematics.\" The submitter adds that after those attempts failed, the model instead established that the intended theory is trivial, and produced the proof constructions, the manuscript, the proof certificates and the checking code; Simonelli directed the investigation and assessed the outputs. Discovered rather than co-developed on that record: the model is credited as the author, and the human role was direction and assessment.",
      significance: 10,
      significanceNote:
        "One step above this submitter's subDL entry at 7. That one settled a relevance property of a logic; this shows a proposed foundation proves everything once number-restricted induction and naive comprehension are combined, which forces a revision of the programme it was meant to support. The question was stated as open by the proposers. The community is the few dozen people working in paraconsistent mathematics, which is what keeps it at the level of a typical numbered Erdos problem rather than above it.",
    },
    message: [
      "Approved and published. Verification goes from Expert-verified to Unreviewed, same as with your subDL entry, and the reasoning is spelled out on the entry because the call is closer this time.",
      "",
      "Footnote 3 of the paper is a genuinely stronger trace than the subDL acknowledgment was: Ripley, the proposer of the system, confirming that the argument poses a problem for the intended programme is agreement against their own interest, not a correction of a draft. But it is still your report of a private exchange rather than Ripley's own words a reader can follow to the source, and the Expert-verified rung needs the latter. If Ripley says it anywhere public - a note, a slide, a line in the repository - send the link and the tier changes.",
      "",
      "Other edits: the statement now poses the question rather than answering it in its own last sentence, with Ripley's slides quoted for the \"not known to be trivial\" framing; the short name is \"subDMQ arithmetic is trivial\"; model and maker are filled in as GPT-6 Astra and OpenAI. AI role stays Discovered, on the author line. Significance 10, one step above the subDL entry at 7, for the reason you gave: this forces a revision of the programme rather than settling a property inside it.",
      "",
      "The Isabelle replay scripts you said were not executed were not executed here either; the note says so.",
    ].join("\n"),
  },
];

/// The serverless cluster refuses the first connection after idling; every
/// older script retries and the first production run of this one did not.
async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string) => Promise<T>;
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
    console.log(
      `${d.action === "reject" ? "DECLINE" : "APPROVE"}  ${d.slug.slice(0, 64)}`,
    );
    const mlen = charLength(canonical(d.message));
    console.log(
      `  message : ${mlen}/${MESSAGE_MAX}${mlen > MESSAGE_MAX ? "  OVER" : ""}`,
    );
    if (mlen > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const n = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && n > lim;
        console.log(`  ${k.padEnd(17)}: ${n}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    for (const l of d.links ?? []) {
      const n = l.label.length;
      console.log(`  link (${l.kind}) ${n}/${LINK_LABEL_MAX}: ${l.label}`);
      if (n > LINK_LABEL_MAX) bad++;
    }
    // The form's own rules on the edits alone; the merged link check needs
    // the stored links and runs in the dry run.
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {} });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `${localBad} local violation(s)` : "local checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    let bad = 0;
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: {
          id: true,
          status: true,
          name: true,
          sourceUrl: true,
          submittedById: true,
          links: { select: { label: true, url: true } },
        },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending")
        throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({
        specs: SPECS,
        fields: d.edits ?? {},
        links: merged,
        sourceUrl:
          ((d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl) || null,
      });
      console.log(
        `${d.action.toUpperCase().padEnd(7)}  ${cur.name.slice(0, 60)}  -> merged check: ${v.length ? "FAILED" : "ok"}`,
      );
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      bad += v.length;
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }
    if (bad) throw new Error(`${bad} violation(s) - nothing written`);

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    // One statement at a time on the guarded client rather than inside
    // $transaction, so the form's rules run on every write. Re-running after
    // a partial failure is safe: the pending check above refuses an entry
    // that has already been decided.
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
          ...(d.links?.length
            ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`updated: ${d.slug}`);

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
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and");
    console.log("stats lag by up to an hour, or until a deploy.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
