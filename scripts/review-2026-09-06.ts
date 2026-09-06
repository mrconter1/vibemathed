// Review of the eighteen submissions pending on 6 September 2026.
//
// What was read, per group:
//   - Seven GPT-6 Astra Lean results from Epoch AI's runs (tadamcz/*): every
//     repository cloned and inspected (line counts, sorry outside the statement
//     stubs, axiom declarations, native_decide/unsafe), the Challenge.lean
//     provenance lines read. For the five Erdős problems, erdosproblems.com
//     itself now shows PROVED (LEAN) / DISPROVED (LEAN) with Thomas Bloom's
//     proof expositions (pages last edited 3-4 September), and Epoch's
//     FrontierMath Erdős announcement lists them. The two non-Erdős statements
//     (Ibragimov-Iosifescu, gamma-theta) come from an AI-autoformalized
//     "wikipedia" run, so they take the statement-unaudited tier.
//   - Seven arXiv preprints: PDFs downloaded and grepped for their AI
//     disclosures (all seven have one), abstracts/intros read for the question
//     each answers and who posed it.
//   - Kolosov's two GitHub manuscripts: repositories cloned, the exact
//     verifiers replayed here (both PASS), the PDFs read for disclosure and
//     for the posed question (Gonzalez's Conjecture 16; GSY's Question 3.2,
//     confirmed in arXiv 2603.07808).
//   - The streaming-parity claim: cstheory.SE question 27748 (2014-12-08,
//     score 18) confirmed; the only artefact is a chatgpt.com share link.
//
// Frontier check: none of these is a tracked quantity with a direction.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

type LinkIn = { label: string; url: string; kind: string };
type Decision = {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: LinkIn[];
};

const EPOCH = "https://epoch.ai/latest/announcing-frontiermath-erdos";
const ASTRA = "GPT-6 Astra (pre-release)";

const erdosLinks = (n: number, repo: string): LinkIn[] => [
  {
    label: `erdosproblems.com/${n}: status and Thomas Bloom's proof exposition`,
    url: `https://www.erdosproblems.com/${n}`,
    kind: "problem-record",
  },
  {
    label: "Challenge.lean: the compared statement",
    url: `https://github.com/tadamcz/${repo}/blob/main/Challenge.lean`,
    kind: "lean-statement",
  },
  {
    label: "Solution.lean and the Lean development",
    url: `https://github.com/tadamcz/${repo}/blob/main/Solution.lean`,
    kind: "lean-proof",
  },
  {
    label: "Epoch AI, Announcing FrontierMath Erdős (1 September 2026)",
    url: EPOCH,
    kind: "announcement",
  },
];

/// Shared verification text for the five Erdős results: what was checked here
/// and what erdosproblems.com says. `extra` carries the per-problem facts.
const erdosVerification = (
  repo: string,
  lines: string,
  tip: string,
  tracker: string,
  extra: string,
) =>
  `Lean-verified. Checked here on 6 September 2026 from a clone of tadamcz/${repo} at ${tip}: ${lines} lines of Lean, zero sorry outside the statement stubs, zero axiom declarations, no native_decide, unsafe or implemented_by; Comparator configuration present and CI runs it with only propext, Quot.sound and Classical.choice. ${extra} erdosproblems.com, the field's own record, marks the problem ${tracker} with a proof exposition by Thomas Bloom, which is why this is Resolved rather than Candidate: the canonical tracker has accepted it.`;

const DECISIONS: Decision[] = [
  // =============================== GPT-6 Astra, FrontierMath Erdős =========
  {
    slug: "erdos-problem-548-erdos-sos-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Erdős Problem #548: the Erdős–Sós conjecture",
      model: ASTRA,
      problemNumber: 548,
      significance: 58,
      significanceNote:
        "The Erdős–Sós conjecture (1962) is one of the central conjectures of extremal graph theory: every graph with average degree above k-1 contains every tree on k+1 vertices. Sixty-four years, a large literature of special cases, and an announced-but-never-published asymptotic proof by Ajtai, Komlós, Simonovits and Szemerédi. erdosproblems.com now lists it proved. Level with Köthe and non-sofic groups here; below the Jacobian conjecture.",
      verificationNote: erdosVerification(
        "erdos548",
        "1,311",
        "3766491",
        "PROVED (LEAN)",
        "The statement was autoformalized for the FrontierMath Erdős benchmark and reviewed by Thomas Bloom, and Challenge.lean is copied from that file; it follows erdosproblems.com's phrasing, which differs from the classical one by requiring one extra edge when (t-2)n is odd, a parity margin the repository's README discusses and the internal counting lemma closes.",
      ),
    },
    links: erdosLinks(548, "erdos548"),
    message:
      "Published at Lean-verified and Resolved, significance 58.\n\nChecked here: the repository at 3766491, 1,311 lines, no sorry outside the stubs, no axioms, no native_decide, Comparator in CI. The statement was autoformalized for the benchmark and reviewed by Thomas Bloom; Challenge.lean carries it verbatim. And erdosproblems.com now shows #548 as PROVED (LEAN) with Bloom's own exposition of the permutation-word counting argument, last edited 3 September. That is the field's record-keeper accepting the result, which is why this goes in as Resolved where the Köthe and Smale entries from the same run sit at Candidate.\n\nOne honesty note kept in the verification text: the benchmark statement requires (k-1)n/2 + 1 edges, one more than the classical \"more than (k-1)n/2\" when (k-1)n is odd. The internal lemma proves the sharp bound, so the classical form follows, but the compared theorem is the benchmark's.\n\nName normalised, model set to the pre-release name, problem number recorded so the Erdős share chart counts it, four audit links added.",
  },
  {
    slug: "erdos-problem-571",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Erdős Problem #571: rational exponents for bipartite Turán numbers",
      model: ASTRA,
      problemNumber: 571,
      significance: 52,
      significanceNote:
        "The rational exponents conjecture of Erdős and Simonovits (1974): every rational in [1,2) is the Turán exponent of some single bipartite graph. Bukh and Conlon proved it for finite families in 2018 and a decade of work realised large classes of exponents; the single-graph statement stayed open. Bloom calls the proof the hardest of the five to interpret. A named conjecture with fifty years of literature, a step below Erdős–Sós.",
      verificationNote: erdosVerification(
        "erdos571",
        "10,460",
        "661cc1d",
        "PROVED (LEAN)",
        "The statement was autoformalized for the benchmark and reviewed by Thomas Bloom; it uses mathlib's extremalNumber and IsBipartite and Asymptotics.IsTheta, and the repository's README compares it to the informal statement. One grep hit for the word 'externally' in a docstring is the only match for the risky-feature scan.",
      ),
    },
    links: erdosLinks(571, "erdos571"),
    message:
      'Published at Lean-verified and Resolved, significance 52.\n\nChecked here: the repository at 661cc1d, 10,460 lines, no sorry outside the stubs, no axioms, no native_decide (the one scan hit is the word "externally" in a comment), Comparator in CI. The statement was autoformalized and reviewed by Bloom, and erdosproblems.com shows #571 PROVED (LEAN) with his rough sketch of the strategy, last edited 4 September. Resolved for the same reason as #548: the tracker has accepted it.\n\nYour note that this is the hardest of the five to read is worth keeping visible, and it is in the significance text. A 10,000-line proof nobody has fully digested is exactly the kind of thing readers should know they are looking at, even when the kernel is satisfied.',
  },
  {
    slug: "erdos-problem-1-sum-distinct-sets",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Erdős Problem #1: sum-distinct sets",
      model: ASTRA,
      problemNumber: 1,
      significance: 50,
      significanceNote:
        'Erdős called it "perhaps my first serious problem" and dated it to 1931; it opens his problem collection and carried a $500 prize. Whether a sum-distinct set of n integers must reach about 2^n was believed true for ninety-five years; the answer is no, ineffectively. Level with Smale\'s mean value conjecture here rather than the great structural conjectures, since the question is sharp but narrow.',
      verificationNote: erdosVerification(
        "erdos1",
        "4,608",
        "db6f909",
        "DISPROVED (LEAN)",
        "The statement is copied verbatim from Formal Conjectures' ErdosProblems/1.lean at commit 488aade2, the human-curated formalization the model was given, and the proved theorem is its negation. Two independent runs found essentially equivalent lattice-based arguments. The proof is ineffective: it gives no bound on how large n must be.",
      ),
    },
    links: erdosLinks(1, "erdos1"),
    message:
      "Published at Lean-verified and Resolved, significance 50.\n\nChecked here: the repository at db6f909, 4,608 lines, no sorry outside the stubs, no axioms, no native_decide, Comparator in CI. The statement is Formal Conjectures' own, byte-identical at commit 488aade2, and the theorem is its negation. erdosproblems.com shows #1 DISPROVED (LEAN) with Bloom's exposition, last edited 3 September.\n\nThe ineffectiveness is stated in the verification note, since a reader will want to know that \"arbitrarily large n\" comes with no bound. Problem number recorded, links added, model normalised.",
  },
  {
    slug: "erdos-problem-126-prime-divisors-of-pairwise-sums",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Erdős Problem #126: prime divisors of pairwise sums",
      model: ASTRA,
      problemNumber: 126,
      significance: 35,
      significanceNote:
        "From the first Erdős–Turán paper (1934), with a $250 prize: does the number of primes dividing some pairwise sum of an n-set grow faster than log n? Ninety-two years open, and the answer is not just yes but polynomial, f(n) >> n^(1/2) in the strongest of four independent runs. A precise question rather than a structural conjecture, hence the middle of the scale.",
      verificationNote: erdosVerification(
        "erdos126",
        "7,866",
        "abd4239",
        "PROVED (LEAN)",
        "The statement is copied verbatim from Formal Conjectures' ErdosProblems/126.lean at commit 488aade2. Only the qualitative limit f(n)/log n -> infinity is the compared theorem; the polynomial bounds (exponents 1/8, 1/3, 1/2, 1/5 across four runs) are stronger internal results, and erdosproblems.com's page records the n^(1/2) one.",
      ),
    },
    links: erdosLinks(126, "erdos126"),
    message:
      "Published at Lean-verified and Resolved, significance 35.\n\nChecked here: the repository at abd4239, 7,866 lines, no sorry outside the stubs, no axioms, no native_decide, Comparator in CI; statement byte-identical to Formal Conjectures at 488aade2. erdosproblems.com shows #126 PROVED (LEAN) and notes the n^(1/2) bound, last edited 3 September. This was one of the two problems in the official benchmark score.\n\nThe distinction you drew between the compared theorem (the limit) and the stronger internal bounds is preserved in the verification note.",
  },
  {
    slug: "erdos-problem-74-locally-almost-bipartite-graphs",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Erdős Problem #74: locally almost bipartite graphs of infinite chromatic number",
      model: ASTRA,
      problemNumber: 74,
      significance: 38,
      significanceNote:
        "Erdős, Hajnal and Szemerédi (1982), $500 prize: can a graph of infinite chromatic number have every n-vertex subgraph within f(n) edges of bipartite, for f growing arbitrarily slowly? Rödl had the positive result for f(n) = epsilon n. The answer is no, with an explicit rate log n / log log n reported informally. A well-known question from the infinite-combinatorics side of Erdős's work.",
      verificationNote: erdosVerification(
        "erdos74",
        "11,481",
        "a626ecc",
        "DISPROVED (LEAN)",
        "The statement is copied verbatim from Formal Conjectures' ErdosProblems/74.lean at commit 488aade2 and the theorem is its negation. Six independent resolutions are included; all prove the stronger 3-colourability, while the compared theorem asserts only finite chromatic number. The rate f(n) ~ log n / log log n is not part of the certified theorem.",
      ),
    },
    links: erdosLinks(74, "erdos74"),
    message:
      "Published at Lean-verified and Resolved, significance 38.\n\nChecked here: the repository at a626ecc, 11,481 lines, no sorry outside the stubs, no axioms, no native_decide, Comparator in CI; statement byte-identical to Formal Conjectures at 488aade2, theorem is its negation. erdosproblems.com shows #74 DISPROVED (LEAN) with the log n / log log n rate noted, last edited 3 September. The other of the two official benchmark solves.\n\nThe gap between what is certified (finite chromatic number) and what the informal argument gives (an explicit rate) is recorded in the verification note.",
  },

  // =============================== GPT-6 Astra, other Epoch runs ===========
  {
    slug: "ibragimov-iosifescu-varphi-mixing-clt-conjecture",
    action: "approve",
    reason: "downgraded",
    edits: {
      name: "The Ibragimov–Iosifescu conjecture for φ-mixing sequences",
      model: ASTRA,
      verification: "lean-checked",
      resolution: "candidate",
      significance: 40,
      significanceNote:
        "Ibragimov's 1971 conjecture (Ibragimov–Linnik, problem 3) that a strictly stationary φ-mixing sequence with finite variance and Var(S_n) -> infinity obeys the central limit theorem, with Iosifescu's invariance-principle strengthening, is a standing problem of the dependent-CLT literature: Peligrad's 1990 paper is titled after it and it has a Wikipedia article. Fifty-five years, refuted in the one regime the partial results had left open.",
      verificationNote:
        "Lean-checked, statement unaudited. Checked here on 6 September 2026 from a clone of tadamcz/phi-mixing-clt at 8e08498: 13,047 lines, zero sorry outside the statement stubs, zero axiom declarations, no native_decide, unsafe or implemented_by; the repository's recorded verifier accepted the disproof with the default kernel and only the three standard axioms. The statement, however, was produced by Epoch's AI-autoformalized 'wikipedia' run, not by a human-curated repository, and this site has not audited the formal definitions of strict stationarity and the φ-mixing coefficient against the sources beyond reading the docstring, which is careful about conventions. The repository's own audit finds no mismatch, but that audit is machine-written. No probabilist outside the run has read the 12,900-line construction. Hence Candidate.",
    },
    links: [
      {
        label: "Challenge.lean: the compared statement",
        url: "https://github.com/tadamcz/phi-mixing-clt/blob/main/Challenge.lean",
        kind: "lean-statement",
      },
      {
        label: "The Lean development (submission/Spec.lean)",
        url: "https://github.com/tadamcz/phi-mixing-clt",
        kind: "lean-proof",
      },
      {
        label:
          "Peligrad (1990), On Ibragimov–Iosifescu conjecture for φ-mixing sequences",
        url: "https://doi.org/10.1016/0304-4149(90)90008-6",
        kind: "problem-record",
      },
    ],
    message:
      "Published, moved from Lean-verified/Resolved to Lean-checked/Candidate, significance 40.\n\nThe kernel side is clean and I checked it: 13,047 lines at 8e08498, no sorry outside the stubs, no axioms, no native_decide, standard axioms only. The difference from the five Erdős entries is where the statement came from. Those statements were human-curated (Formal Conjectures) or reviewed by Bloom; this one was produced by Epoch's autoformalized wikipedia run, and the audit that says it matches Ibragimov's conjecture was itself machine-written. On this site's ladder a kernel check against a statement no independent human has audited is Lean-checked, not Lean-verified, and that is the tier here until a probabilist confirms the formal φ-mixing definitions say what the 1971 problem says.\n\nCandidate rather than Resolved for the same reason as Köthe and Smale: two days old, and nobody outside the run has read it. There is no canonical tracker for this conjecture to accept it the way erdosproblems.com did for the Erdős five.\n\nThe mathematics, if it holds, is a genuine surprise in a fifty-five-year-old question, and the significance reflects that.",
  },
  {
    slug: "counterexample-to-the-gamma-theta-conjecture-in-eternal-domination",
    action: "approve",
    reason: "downgraded",
    edits: {
      name: "The γ–θ conjecture in eternal domination",
      model: ASTRA,
      verification: "lean-checked",
      resolution: "candidate",
      significance: 12,
      significanceNote:
        "A 2014 conjecture of Klostermeyer and Mynhardt in the eternal domination literature, reopened after a 2009 proof was found to have a gap, checked exhaustively to 11 vertices in 2022 and proved for planar graphs in 2025. Refuted by a 243-vertex graph known since 1973. A real conjecture in a specialised corner of graph theory; the numbered-Erdős level.",
      verificationNote:
        "Lean-checked, statement unaudited. Checked here on 6 September 2026 from a clone of tadamcz/gamma-theta at d64cce5: 1,987 lines; the only sorry outside Challenge.lean is the unused '.disproof' stub in submission/Spec.lean, which the README explains (the compared theorem asserts the existence of the counterexample); zero axiom declarations, no native_decide; the audit folder's docker logs print the theorem's axioms as the standard three. The statement was AI-autoformalized in Epoch's wikipedia run; the definitions of the eternal dominating family (one-guard model), domination number and clique cover number were read here and look right, but that is one reading, not an audit. The repository's Python check of 5,889,840 attacks was not replayed here.",
    },
    links: [
      {
        label: "Challenge.lean: the compared statement and definitions",
        url: "https://github.com/tadamcz/gamma-theta/blob/main/Challenge.lean",
        kind: "lean-statement",
      },
      {
        label: "The Lean development",
        url: "https://github.com/tadamcz/gamma-theta",
        kind: "lean-proof",
      },
    ],
    message:
      "Published, moved from Lean-verified/Resolved to Lean-checked/Candidate, significance 12.\n\nSame reasoning as the Ibragimov entry: the kernel side checks out (1,987 lines at d64cce5, the one stray sorry is the unused disproof stub the README documents, standard axioms in the audit logs), but the statement was AI-autoformalized rather than human-curated, so it is Lean-checked with the statement unaudited. I read the definitions myself and they match the one-guard eternal domination model, which is why this is a downgrade of one rung and not a hold.\n\nThe novelty question you raised is the other open point: the witness graph is from 1973 and the literature review was targeted. Candidate covers that too.",
  },

  // =============================== Banakh–Banakh (split from Wong) ========
  {
    slug: "is-every-darboux-bijection-of-the-4-sphere-problem-1-7-and-of-the-3-torus-proble",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Darboux injections from closed manifolds: Banakh–Banakh Problems 1.7 and 1.8",
      shortName: "Darboux injections from closed manifolds",
      yearPosed: 2020,
      significance: 15,
      significanceNote:
        "Two problems posed in Banakh and Banakh's 2020 paper on Darboux injections (arXiv 2018): whether every connectedness-preserving self-bijection of the three-torus and of the four-sphere is a homeomorphism. Answered for every closed manifold in every dimension at once. A clean answer to posed questions in a small literature; a rung above the numbered-Erdős level, below the Wong question it accompanies.",
      verificationNote:
        "Unreviewed. The 17-page note (Zenodo 10.5281/zenodo.22347647, dated June 2026, posted 5 September) was read here in full; the theorem, the method (Alexander–Lefschetz duality with F2 coefficients, induction on minimal carriers of Čech cohomology classes, in Banakh–Banakh's framework of n-varieties) and the disclosure match the submission, and Problems 1.7 and 1.8 were confirmed verbatim in arXiv 1809.00401. Nobody outside the author's program has read the argument; the re-derivation by a second model inside the same program is internal corroboration. Candidate as submitted.",
    },
    message:
      "Published, at Candidate and Unreviewed as you set them, significance 15. Thank you for splitting it out as asked.\n\nChecked: the note in full, the two problems verbatim in Banakh and Banakh's paper, and the disclosure. The tier stays AI-discovered on the note's own words: the models \"generated and developed the arguments\", with you selecting and checking. That is the same reading applied to the Wong entry.\n\nOne edit beyond the name: yearPosed 2020, the journal paper the problems are cited from, rather than 2018.",
  },

  // =============================== streaming parity: hold ================
  {
    slug: "linear-lower-bound-on-memory-size-for-streaming-algorithm-solving-permutation-pa",
    action: "reject",
    reason: "source",
    message:
      "Held, on one ground: the only artefact is a chatgpt.com share link, and this site cannot list a result whose proof exists nowhere else.\n\nEverything else is in order. The question is real and was posed publicly: your cstheory.SE question 27748 of 8 December 2014 (score 18) asks exactly for an Omega(n) memory lower bound for streaming permutation parity, and Berendsohn raised it again in 2025. A reduction to Bhangale et al.'s 3-player XOR parallel repetition theorem is a plausible route and you say you checked it. The AI role is clear.\n\nBut a chat transcript is not a source: it is not archived, not citable, can be edited or deleted by its owner, and could not be opened from here at all. What this site needs is the argument written down somewhere durable, even briefly: a two-page note on arXiv or Zenodo, or at minimum an answer posted on your own cstheory question with the reduction spelled out and the AI's contribution acknowledged. Either would take an evening. Resubmit with that as the Source URL and this goes in, most likely at Unreviewed and Resolved.\n\nIf you post it as a cstheory answer, link the transcript from there too; it is useful provenance, just not a primary source.",
  },

  // =============================== Daykin–Frankl =========================
  {
    slug: "daykin-frankl-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      name: "The Daykin–Frankl conjecture on convex subsets of the Boolean lattice",
      model: "GPT-5.6 Sol Pro",
      aiContribution: "ai-discovered",
      humanCollaborators: ["Kada Williams"],
      significance: 25,
      significanceNote:
        "A 1983 conjecture of Daykin and Frankl in extremal set theory, that a convex subset of the Boolean lattice contains an antichain of at least the expected proportion of its size; previously known only for binary downsets. Forty-three years, a short conceptual proof of a stronger product form. A named conjecture with a modest literature, mid-scale.",
      verificationNote:
        "Unreviewed. arXiv 2609.03087 (four pages) read here: the note describes itself as verifying and communicating an LLM-generated proof, credits ChatGPT 5.6 Sol Pro, and gives the induction on dimension with the R x Q_1 convexity lemma in full. Checked by the human author, not by anyone independent; not peer reviewed; no formalization.",
    },
    links: [
      {
        label: "arXiv 2609.03087",
        url: "https://arxiv.org/abs/2609.03087",
        kind: "paper",
      },
    ],
    message:
      'Published at Resolved and Unreviewed, significance 25, with the AI-contribution tier set to AI-discovered, which you had left blank.\n\nThe paper\'s own framing decides the tier: it "verifies and communicates an LLM-generated proof" and commends ChatGPT 5.6 Sol Pro. That is discovery, with a human checking. Kada Williams is recorded as the human collaborator and the model name normalised.',
  },

  // =============================== Kolosov: kissing added-vector code =====
  {
    slug: "optimality-of-the-added-vector-code-in-the-19-dimensional-kissing-construction",
    action: "approve",
    reason: "edited",
    edits: {
      shortName: "Ho's 1280-word code is optimal",
      model: "ChatGPT (OpenAI, model version unstated)",
      aiContribution: "ai-co-developed",
      resolutionMethod: "computation",
      verification: "site-confirmed",
      resolution: "resolved",
      posedBy:
        "Gonzalez, Conjecture 16 (preprint, version 3, 2026), after Ho's 1280-word construction",
      yearPosed: 2026,
      significance: 8,
      significanceNote:
        "A sub-question of the 19-dimensional kissing problem: within Ho's fixed 4096-word ambient code, no distance-5 subcode beats his 1280 words. Gonzalez had bracketed the maximum between 1280 and 1536 and conjectured 1280. Closing that bracket settles one scheme, not the kissing number, and the paper says so; a small, exact result.",
      verificationNote:
        "Site-confirmed: the author's exact verifier (anc/verify_golay_1280_optimality.py, Python standard library, exact arithmetic) was replayed here on 6 September 2026 from a clone of cheptil/kissing-number-19-dimensions at 0a90b8e and passed every check: the five generator identities and rank certificate, the weight distribution of the 16-word subspace, the exact Fourier dual certificate, the independence number 5 of the 16-vertex certificate graph by exact subset DP, the 256 cosets giving 1280, and the explicit matching constructions with minimum distances 6 and 5. The manuscript's Section 5 discloses ChatGPT's role. No independent expert statement; the tier records a replayed certificate, not a referee.",
      aiRole:
        "The manuscript's Section 5: \"ChatGPT (OpenAI) was used for literature search, the optimization-based search for the five-word certificate, development and checking of the proof, preparation of the verification program, and drafting and translation of the manuscript. The mathematical argument and the exact verification data are given explicitly; a language-model output or a numerical solver status is not used as a substitute for proof.\" Certificate found and proof developed with the model under the author's direction: co-developed.",
    },
    message:
      "Published at Resolved and Site-confirmed, significance 8.\n\nSite-confirmed because I cloned the repository and ran your verifier here: every check passed, including the exact independence number of the Clebsch-graph certificate and the two matching constructions. That is a replayed certificate, which is what the tier means; it is not an expert reading the proof, and the note says so.\n\nScope was the question. The paper answers a posed conjecture, Gonzalez's Conjecture 16 in version 3 of his preprint, so it is in; posedBy now says that. The tier is co-developed rather than discovered, on your Section 5: the certificate search, the proof development and its checking were all done with the model under your direction, which is the co-developed pattern here. Model field records that the paper does not name the version.\n\nSignificance 8: this settles one fixed scheme, not the kissing number, exactly as you were careful to say.",
  },

  // =============================== W^{1,1} estimates ======================
  {
    slug: "unbounded-variation-solutions-for-uniformly-elliptic-equations-in-nondivergence-",
    action: "approve",
    reason: "edited",
    edits: {
      model: "GPT-5.6 Sol",
      humanCollaborators: ["Nam Q. Le", "Qi Sun", "Hung V. Tran"],
      significance: 25,
      significanceNote:
        "A 2014 question of Nadirashvili, Tkachev and Vlăduţ (their Problem 1.3.1): is there an interior W^{1,1} estimate for uniformly elliptic equations in nondivergence form in dimension three? Answered in the negative with smooth coefficients, a fixed ellipticity ratio and a limit solution not even of bounded variation. A named open problem in regularity theory, twelve years old, by three established PDE analysts.",
      verificationNote:
        "Unreviewed. arXiv 2608.13380 (version 2, 3 September 2026) read here; the AI-assistance section states that the main results came from chats with ChatGPT 5.6 Sol, that the key strategies were the model's, and that the authors reworked, rewrote, checked and simplified everything and take responsibility. Author-checked, not independently refereed; no formalization.",
    },
    links: [
      {
        label: "arXiv 2608.13380",
        url: "https://arxiv.org/abs/2608.13380",
        kind: "paper",
      },
    ],
    message:
      'Published at Resolved and Unreviewed, AI co-developed as you set it, significance 25.\n\nChecked the disclosure in the PDF: "the key strategies were obtained by ChatGPT" with the authors rewriting and checking all arguments, which is co-developed exactly. The three authors are recorded as collaborators and the model name normalised.',
  },

  // =============================== Courtade's conjecture ==================
  {
    slug: "volume-and-projection-inequalities-i-zonoids-and-courtade-s-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Courtade's conjecture on volumes of Minkowski sums with the ball",
      humanCollaborators: [
        "Matthieu Fradelizi",
        "Alfredo Hubard",
        "Auttawich Manui",
        "Cheikh Saliou Ndiaye",
        "Shouda Wang",
        "Artem Zvavitch",
      ],
      significance: 20,
      significanceNote:
        "Courtade's 2017 conjecture, an inequality between the volumes of B, C and their Minkowski sums with the unit ball, refuted in every dimension from three up, even among zonoids. The paper also disproves a log-submodularity conjecture for zonoid volumes. Named conjectures in convex geometry with a decade of literature, by six established authors; mid-low scale.",
      verificationNote:
        'Unreviewed. arXiv 2608.12681 read here; the section "Acknowledgments and AI assistance disclosure" states that GPT-5.6 Sol was used as an auxiliary mathematical tool to explore examples, test determinant computations and assist preliminary proof development, and that the authors independently verified all arguments. Author-checked; not refereed; no formalization.',
    },
    links: [
      {
        label: "arXiv 2608.12681",
        url: "https://arxiv.org/abs/2608.12681",
        kind: "paper",
      },
    ],
    message:
      "Published at Resolved and Unreviewed, AI-assisted as you set it, significance 20.\n\nThe disclosure section is on page 26 of the PDF and reads as you described: an auxiliary tool for examples and computations, with the authors owning the arguments. Assisted is the right tier for that. Six authors recorded as collaborators.",
  },

  // =============================== Kolosov: RP^6 ==========================
  {
    slug: "a-44-vertex-triangulation-of-mathbb-rp-6",
    action: "approve",
    reason: "edited",
    edits: {
      shortName: "RP^6 on 44 vertices",
      model: "ChatGPT (OpenAI, model version unstated)",
      verification: "site-confirmed",
      resolution: "resolved",
      significance: 10,
      significanceNote:
        "Question 3.2 of Guyer, Steinerberger and Yang (2026): can real projective 6-space be triangulated on fewer than 45 vertices? Yes, 44, by an explicit centrally symmetric 7-polytope. It does not determine the minimum. Level with the 24-vertex RP^5 entry it descends from: a concrete answer to a fresh question in combinatorial topology.",
      verificationNote:
        "Site-confirmed: both of the author's exact-arithmetic verifiers (anc/verify.py with integer Bareiss elimination and anc/verify_rational.py with rational Gaussian elimination, Python standard library) were replayed here on 6 September 2026 from a clone of cheptil/44-vertex-triangulation at 2c62b31. Both pass: every facet's supporting hyperplane, completeness of the facet list, the antipodal disjoint-star condition, f-vector (44, 938, 7024, 22555, 34936, 25914, 7404), quotient Euler characteristic 1, in about 3.5 seconds; the negative controls (perturbed coordinate, missing facet) fail as they should. Question 3.2 confirmed verbatim in arXiv 2603.07808. The manuscript's \"Computational assistance\" section discloses ChatGPT's role and says the two verifiers share one workflow, which is why an independent replay was worth doing.",
      aiRole:
        "The manuscript's Computational assistance section: \"OpenAI's ChatGPT was used in the computational exploration, in the development of the verification programs, and in preparing this manuscript. The two implementations were developed within the same AI-assisted workflow; their agreement is not external independent validation.\" Search assistance, code and prose: the assisted tier.",
    },
    message:
      "Published at Resolved and Site-confirmed, significance 10.\n\nYou asked for the exact checks to be reproduced, so they were: both verifiers cloned and run here, both pass, and the mutation controls fail as designed. Question 3.2 is confirmed in Guyer, Steinerberger and Yang's paper, so the question was posed and is now answered; Resolved rather than Candidate, since the certificate is the proof and it has been replayed independently.\n\nAI-assisted as you set it, on the manuscript's own Computational assistance section. Model field records that the paper does not name the version.",
  },

  // =============================== Fourier-invariant functions ============
  {
    slug: "fourier-invariant-functions-with-dense-zero-sets",
    action: "approve",
    reason: "edited",
    edits: {
      name: "The Radchenko–Viazovska question on Fourier interpolation",
      model: "ChatGPT (OpenAI, model version unstated)",
      humanCollaborators: ["Andriy Bondarenko", "Kristian Seip"],
      significance: 28,
      significanceNote:
        "Question 1 of Radchenko and Viazovska's 2019 Fourier interpolation paper (Publ. Math. IHES): does the interpolation formula for even Schwartz functions extend whenever the series converges absolutely? No: a nonzero Fourier-invariant function vanishing at every sqrt(n). The interpolation formula is a celebrated result and the question was its natural open end; answered by two established analysts.",
      verificationNote:
        'Unreviewed. arXiv 2608.13468 read here; the acknowledgement thanks ChatGPT, "whose exploratory input and calculations were essential in the development of this paper", naming no model version and isolating no step. A complete conventional proof by the authors; not refereed; no formalization.',
    },
    links: [
      {
        label: "arXiv 2608.13468",
        url: "https://arxiv.org/abs/2608.13468",
        kind: "paper",
      },
    ],
    message:
      'Published at Resolved and Unreviewed, AI-assisted as you set it, significance 28.\n\nThe acknowledgement is exactly one sentence and it is what you quoted; "essential" exploratory input without saying what was found is the assisted tier, and your reasoning for choosing it is preserved in the AI-role text. Authors recorded, model field records the unstated version.',
  },

  // =============================== Non-MF groups ==========================
  {
    slug: "non-mf-groups-and-non-finite-full-group-c-algebras",
    action: "approve",
    reason: "edited",
    edits: {
      model: "GPT-5.6 Sol",
      humanCollaborators: ["Caleb Eckhardt"],
      posedBy:
        "Whether a stably finite C*-algebra must be MF, and whether every full group C*-algebra is finite; questions of the C*-algebra literature the paper's introduction cites",
      significance: 25,
      significanceNote:
        "Two questions from the C*-algebra literature answered with explicit examples: a group whose full C*-algebra is not finite, and a stably finite reduced group C*-algebra that is not MF. Existence of the latter followed abstractly from MIP* = RE without an example; here both are concrete, built on Kun and Thom's non-sofic groups. Operator algebras is a small field and these are structural questions within it; mid-scale.",
      verificationNote:
        'Unreviewed. arXiv 2608.28772 (seven pages) read here: "The ideas and proofs were generated by ChatGPT 5.6 Sol, we have only refined their arguments"; Eckhardt internalised and rewrote them and takes responsibility. Willett, Fournier-Facio, Dogon and Shulman are thanked for input and one consequence, which is comment rather than a check of the complete proof; not refereed; Sauer\'s Lean work on related examples is separate.',
    },
    links: [
      {
        label: "arXiv 2608.28772",
        url: "https://arxiv.org/abs/2608.28772",
        kind: "paper",
      },
    ],
    message:
      'Published at Resolved and Unreviewed, AI-discovered as you set it, significance 25.\n\nThe paper is unusually direct: "the ideas and proofs were generated by ChatGPT 5.6 Sol". That is discovery. The posedBy field, which you left empty, now names the two questions as the introduction frames them; if you know the citations for who first asked them, add them.',
  },

  // =============================== Scalar curvature estimates =============
  {
    slug: "interior-curvature-estimates-for-the-graphical-scalar-curvature-equation-in-all-",
    action: "approve",
    reason: "downgraded",
    edits: {
      model: "ChatGPT (OpenAI, model version unstated)",
      aiContribution: "ai-assisted",
      humanCollaborators: ["Guohuan Qiu", "Jin Yan"],
      posedBy:
        "Interior C^2 estimates for the σ_2 (scalar curvature) equation, open above dimension three since Heinz (n = 2) and Warren–Yuan (n = 3)",
      significance: 30,
      significanceNote:
        "Interior curvature estimates for the graphical scalar curvature equation in all dimensions, a long-standing problem of fully nonlinear PDE: Heinz settled n = 2, Warren and Yuan n = 3 (2006), Shankar and Yuan the Hessian case in n = 4, and higher dimensions needed extra assumptions. Resolved on the full Γ_2 branch for every n >= 3. A well-known open problem in a central area of geometric analysis.",
      verificationNote:
        'Unreviewed. arXiv 2609.02581 (38 pages) read here; the authors write that ChatGPT was used "as an exploratory and computational aid to test candidate" comparison and cutoff functions and search for counterexamples to proposed inequalities, and that they "checked, corrected, and rewrote the AI-assisted calculations" and verified every statement. Author-checked; not refereed; no formalization.',
    },
    links: [
      {
        label: "arXiv 2609.02581",
        url: "https://arxiv.org/abs/2609.02581",
        kind: "paper",
      },
    ],
    message:
      'Published at Resolved and Unreviewed, significance 30, with the tier moved from co-developed to AI-assisted.\n\nThe paper\'s own words draw the line: ChatGPT was "an exploratory and computational aid" for testing candidate functions and searching for counterexamples, and the authors made every mathematical decision and rewrote every calculation. On this site that is assisted; co-developed is for arguments produced in dialogue with the model. Your note that the explorations exposed the tangent-space obstruction is kept in the AI-role text, since it is the most informative thing about what the tool actually did.\n\nposedBy, which was empty, now records the lineage Heinz, Warren–Yuan, Shankar–Yuan.',
  },

  // =============================== Graph balancing witness: decline =======
  {
    slug: "minimum-witness-for-the-3-2-configuration-lp-gap-in-two-weight-graph-balancing",
    action: "reject",
    reason: "no-open-question",
    message:
      'Declined on scope, with appreciation for the most complete AI disclosure in this batch.\n\nThis site lists results that settle, or make measurable progress on, a question somebody posed before the work began. The paper is candid that the question here is its own: "we ask how small an instance attaining this gap can be", and "we know of no earlier minimality, uniqueness, or classification result for gap instances". Jansen, Land and Maack established the 3/2 gap in 2016 and did not ask for a minimum witness; the gap value itself is untouched, as your note says. A question first asked and answered in the same paper is not something the catalog can hold, however exact the classification.\n\nWhat would qualify from this line: any narrowing of the open restricted-assignment gap interval [3/2, 11/6], which is a standing question; or a case where a stated conjecture from the scheduling literature is the target.\n\nThe disclosure, naming Claude for the code and computations, Claude and Gemini as adversarial reviewers and Perplexity for literature search, is a model of how to write one.',
  },
];

async function connectWithRetry(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 6; attempt++) {
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

async function main() {
  const db = await connectWithRetry();
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  let bad = 0;
  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, status: true, name: true },
    });
    if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
    if (cur.status !== "pending")
      throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(
      `${d.action === "reject" ? "REJECT " : "APPROVE"}  ${cur.name.slice(0, 58)}  [${d.reason}]`,
    );
    console.log(
      `  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`,
    );
    if (d.message.length > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(
          `  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`,
        );
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(
        `  link             : ${l.label.length}/${LINK_LABEL_MAX}  ${l.kind}`,
      );
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: {
        id: true,
        submittedById: true,
        _count: { select: { links: true } },
      },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);
    const n = cur._count.links;

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? {
                links: {
                  create: d.links.map((l, i) => ({ ...l, position: n + i })),
                },
              }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      }),
      prisma.directMessage.create({
        data: {
          userId: cur.submittedById!,
          senderId: curator.id,
          senderName: curator.pseudonym,
          kind: "decision",
          reason: d.reason,
          body: d.message.slice(0, MESSAGE_MAX),
          problemId: cur.id,
        },
      }),
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log(
    "\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.",
  );
}

main().finally(() => prisma.$disconnect());
