// Import of the 21 Aug scan's twelve qualifying candidates.
//
// Every source was fetched and its AI disclosure read from the paper itself,
// not from the finder's snippet - the snippets misled on this batch, putting
// the strongest papers in the weakest bucket. Attributions checked in each
// paper's own text (Yau/Tian/Donaldson via the cscK formulation; Marton 1979;
// Kara-Por-Wood 2005 with "first open case since 2009"; the five Zeilberger
// challenges named individually; Koivisto's Dagstuhl 2013 question; Minc's
// 1987 survey Conjecture 41; King-Gosset-Kothari-Babbush Conjecture 13 in PRX
// Quantum 6 010336 (2025); NSUCRYPTO 2019, proposer undisclosed).
//
// One paper, arXiv:2608.11290, resolves five distinct challenges and so gets
// five entries sharing a source - the same shape as the Kourovka cluster.
//
// The Kasami paper is entered as Partial on its own words: "The general case
// remains open." Its Lean artifact is recorded lean-checked, not
// lean-verified, because the companion repository is not linked in the HTML
// and nobody has audited it for sorry or axioms.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

interface Entry {
  slug: string;
  fields: Record<string, unknown>;
  links: { label: string; url: string; kind: string }[];
}

const ZEIL_SOURCE = "https://arxiv.org/abs/2608.11290";
const ZEIL_NAME =
  "Solutions to Five Challenge Problems in Enumerative and Algorithmic Combinatorics";
const ZEIL_AI =
  "The paper's division of labour, in its own words: the model \"generated the mathematical ideas, the proofs, and the verification code\", while the author \"selected the problems and determined when a line of attack should be abandoned; executed all computations, on hardware the system could not access; designed and enforced the verification protocol\". It adds that neither role was passive: the system did not merely formalise ideas supplied to it, and the author did not merely execute instructions.";
const ZEIL_VERIF =
  "Checked by this site on 21 August 2026 against the paper (arXiv:2608.11290v2): the division of labour is verbatim as quoted, all five challenges are reported fully solved, and two further problems are reported only partial and are NOT entered here. The paper states a four-principle verification protocol that distinguishes proved, machine-verified and supported claims, and ships code and verification scripts. Those scripts were not re-run here. Days-old preprint, no independent review.";
const ZEIL_LINKS = [
  { label: "Code, data and verification scripts", url: "https://arxiv.org/abs/2608.11290", kind: "code" },
];

const ENTRIES: Entry[] = [
  {
    slug: "yau-tian-donaldson-conjecture-csck",
    fields: {
      name: "The Yau–Tian–Donaldson Conjecture for Constant Scalar Curvature Kähler Metrics",
      shortName: "Yau–Tian–Donaldson",
      fieldGroup: "Geometry & topology",
      field: "Kähler geometry",
      statement:
        "The Yau–Tian–Donaldson conjecture predicts that a polarized manifold carries a canonical Kähler metric in its polarization class exactly when it is K-polystable. Settled for Kähler–Einstein metrics on Fano manifolds, it remained open for constant scalar curvature. False: there is a polarized smooth projective fivefold that is K-polystable but admits no extremal Kähler metric in $c_1(A)$, so K-polystability does not imply existence.",
      posedBy: "Shing-Tung Yau, Gang Tian and Simon Donaldson",
      yearPosed: 1993,
      solveType: "disproved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-08-19",
      model: "Fable 5, GPT-5.6-sol, Danus",
      modelMaker: "Anthropic, OpenAI",
      humanCollaborators: ["Jihao Liu"],
      aiRole:
        "Appendix A, joint with Bin Dong and Guoxiong Gao, is the fullest disclosure in this catalog. Exploring open problems with Claude Code the author found initial signs of a breakthrough, then had Claude Code (Fable 5), Codex (GPT-5.6-sol) and Danus work in collaboration; \"the three systems together produced the counterexample and its proof\". Human input was crucial once: the author saw the example must refute either Codogni–Stoppa or cscK YTD and directed the agents to settle which. An improved Danus, given only the original problem and none of the earlier findings, then re-derived a counterexample and a complete proof alone in 5 hours 29 minutes.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 21 August 2026 against the paper (arXiv:2608.19301v1, 79pp): the AI appendix is verbatim as quoted and the theorem is the extremal-metric statement, which is stronger than the abstract's cscK wording. The mathematics was NOT checked here and is beyond quick verification - the authors report that six other agent systems, given the counterexample and asked only to prove it is one, produced no complete proof in twelve hours. Days-old preprint, no independent review. Recorded as a candidate for that reason.",
      significance: 60,
      significanceNote:
        "One of the central conjectures of Kähler geometry, carrying three of the field's best-known names and three decades of work, with the Fano case a landmark theorem in its own right. Set just below the Jacobian anchor at 65: comparable standing inside geometry, slightly less currency outside it.",
      resultNote:
        "The paper's appendix draws a distinction worth keeping: a counterexample may reduce to a finite certificate, or it may itself be a theorem quantified over all degenerations. This is the second kind, which is why the resolution method is recorded as argument rather than construction - the candidate manifold's shape has been available since 2008, and the mathematical content is the proof that it works.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.19301",
      sourceName: "Disproof of the Yau–Tian–Donaldson conjecture",
      renownLangs: 0,
    },
    links: [
      { label: "Danus agent source", url: "https://github.com/frenzymath/Danus", kind: "code" },
    ],
  },
  {
    slug: "marton-inner-bound-capacity-region",
    fields: {
      name: "Whether Marton's Inner Bound Achieves the Broadcast Channel Capacity Region",
      shortName: "Marton's inner bound",
      fieldGroup: "Theoretical computer science",
      field: "Network information theory",
      statement:
        "Marton's inner bound, proposed in 1979, is the best known achievable region for a general discrete memoryless broadcast channel, and whether it always achieves the capacity region had been open ever since. It does not: there is a finite two-receiver discrete memoryless broadcast channel whose two-letter Marton value strictly exceeds twice its one-letter value, so the complete one-letter Marton region is strictly contained in the capacity region.",
      posedBy: "Katalin Marton",
      yearPosed: 1979,
      solveType: "disproved",
      resolution: "candidate",
      resolutionMethod: "computation",
      solveDate: "2026-08-20",
      model: "GPT-5.6 Sol, Claude Fable 5, Claude Opus 5",
      modelMaker: "OpenAI, Anthropic",
      humanCollaborators: ["Mian Huang", "Yanxiao Liu", "Yi Liu"],
      aiRole:
        "The paper's statement: \"The numerical search relied heavily on the assistance of AI models.\" It credits each contribution individually - GPT-5.6 Sol assisted Yanxiao Liu in finding a counterexample to the Markovity conjecture of Gohari, Liu and Nair and, independently, assisted Mian Huang via elimination geometry; Claude Fable 5 assisted in finding a counterexample to the local tensorization test and a fixed-input counterexample; Opus 5 assisted in the fixed-input construction. The theory that turns a numerical gap into an unconditional theorem, gradient shaping and constraint removal, is the authors'.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 21 August 2026 against the paper (arXiv:2608.19869v1): the AI statement and the per-author credits are as quoted, and the result is unconditional rather than resting on the Markovity conjecture, which the paper shows fails and then works around. The authors certify the gap with interval arithmetic and outward-rounded MPFR at more than 1.88e-6 nats; that computation was not re-run here. Days-old preprint, no independent review.",
      significance: 50,
      significanceNote:
        "The oldest problem in this batch by two decades and a central one in network information theory: the canonical achievable region for the general broadcast channel, open since 1979. Below the Connes anchor at 45 in name recognition outside its field, above it in standing within, so set at 50.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.19869",
      sourceName: "Sub-optimality of Marton's Inner Bound for the Two-Receiver Broadcast Channel",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "big-line-big-clique-four-collinear-or-six-clique",
    fields: {
      name: "The Kára–Pór–Wood Big-Line-Big-Clique Conjecture: Four Collinear Points or a Six-Clique",
      shortName: "Big-line-big-clique (4, 6)",
      fieldGroup: "Combinatorics",
      field: "Discrete geometry",
      statement:
        "The big-line-big-clique conjecture of Kára, Pór and Wood asserts that for all $k, \\ell$ there is an $n$ such that every finite point set of at least $n$ points contains $\\ell$ collinear points or $k$ points that pairwise see each other. True for $\\ell = 4$, $k = 6$, the first case left open: every finite point set of size at least $10^{11055931}$ has four collinear points or six pairwise visible points.",
      posedBy: "Jan Kára, Attila Pór and David R. Wood",
      yearPosed: 2005,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-08-19",
      model: "GPT-5.6 Sol Pro",
      modelMaker: "OpenAI",
      humanCollaborators: ["Édouard Bonnet"],
      aiRole:
        "The paper's disclosure, in full: \"After one fruitless attempt and the now customary generic encouragement, a relatively detailed proof of Theorem 1 was provided by GPT-5.6 Sol Pro after pondering for 222 minutes. The author's contributions were limited to checking the proof, simplifying some parts, and eventually writing the paper in a way that would give the author (and hopefully other human readers) a more pleasant reading experience.\"",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 21 August 2026 against the paper (arXiv:2608.19468v1, 7pp): the disclosure is verbatim as quoted, the conjecture's 2005 attribution is in the text, and the paper states this is the first open case resolved since 2009. The proof was not checked here. The threshold is astronomical but the statement is unconditional. Days-old preprint, no independent review.",
      significance: 28,
      significanceNote:
        "A named conjecture in discrete geometry with a real literature, open since 2005 and with no case resolved since 2009 - a seventeen-year standstill broken. Level with the named-conjecture band around 30, a little under it on breadth of recognition.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.19468",
      sourceName: "Large Finite Point Sets Have 4 Collinear Points or a 6-Clique",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "second-computational-chomp-challenge",
    fields: {
      name: "The Second Computational Chomp Challenge of Ekhad and Zeilberger",
      shortName: "Computational Chomp II",
      fieldGroup: "Combinatorics",
      field: "Combinatorial game theory",
      statement:
        "Ekhad and Zeilberger's second computational Chomp challenge asks for a Chomp position with three winning opening moves. Answered by exhibiting a bar with three winning opening moves.",
      posedBy: "Shalosh B. Ekhad and Doron Zeilberger",
      yearPosed: null,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "computation",
      solveDate: "2026-08-11",
      model: "Claude",
      modelMaker: "Anthropic",
      humanCollaborators: ["Jaideep Sai Padhi"],
      aiRole: ZEIL_AI,
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote: ZEIL_VERIF,
      significance: 12,
      significanceNote:
        "One of Zeilberger's posted challenges: precisely stated, publicly open, and answered by a named search rather than by a general theorem. Real but narrow, a little above the Graffiti anchor at 5 and well below the named-conjecture band.",
      publication: "preprint",
      sourceUrl: ZEIL_SOURCE,
      sourceName: ZEIL_NAME,
      renownLangs: 0,
    },
    links: ZEIL_LINKS,
  },
  {
    slug: "spahn-zeilberger-holonomicity-restricted-permutations",
    fields: {
      name: "Spahn and Zeilberger's Third Challenge: Holonomicity of the Restricted Permutation Counts",
      shortName: "Spahn–Zeilberger holonomicity",
      fieldGroup: "Combinatorics",
      field: "Enumerative combinatorics",
      statement:
        "Spahn and Zeilberger's third challenge asks whether the restricted permutation counts $a_{r,s}$ and $b_{r,s}$ are holonomic for all $r, s > 1$. Answered affirmatively.",
      posedBy: "Evan Spahn and Doron Zeilberger",
      yearPosed: null,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-08-11",
      model: "Claude",
      modelMaker: "Anthropic",
      humanCollaborators: ["Jaideep Sai Padhi"],
      aiRole: ZEIL_AI,
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote: ZEIL_VERIF,
      significance: 15,
      significanceNote:
        "A holonomicity question over a whole two-parameter family, so the answer is a structural theorem rather than a single computation - the most substantial of the five challenges settled in this paper. Below the named-conjecture band on recognition.",
      publication: "preprint",
      sourceUrl: ZEIL_SOURCE,
      sourceName: ZEIL_NAME,
      renownLangs: 0,
    },
    links: ZEIL_LINKS,
  },
  {
    slug: "first-rigorous-solid-standard-young-tableaux-challenge",
    fields: {
      name: "The First Rigorous Solid Standard Young Tableaux Challenge",
      shortName: "Solid SYT challenge I",
      fieldGroup: "Combinatorics",
      field: "Enumerative combinatorics",
      statement:
        "The first rigorous solid standard Young tableaux challenge asks for a proof of a conjectured second-order recurrence for the number of solid standard Young tableaux. The conjectured recurrence is proved.",
      posedBy: "Doron Zeilberger and collaborators",
      yearPosed: null,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-08-11",
      model: "Claude",
      modelMaker: "Anthropic",
      humanCollaborators: ["Jaideep Sai Padhi"],
      aiRole: ZEIL_AI,
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote: ZEIL_VERIF,
      significance: 14,
      significanceNote:
        "A conjectured recurrence promoted to a theorem, which is the shape of progress this corner of enumerative combinatorics is built from. Narrow audience, so set near the lower challenge band.",
      publication: "preprint",
      sourceUrl: ZEIL_SOURCE,
      sourceName: ZEIL_NAME,
      renownLangs: 0,
    },
    links: ZEIL_LINKS,
  },
  {
    slug: "five-dimensional-geode-challenge",
    fields: {
      name: "The Five-Dimensional Geode Challenge of Amdeberhan, Kauers and Zeilberger",
      shortName: "Geode challenge (5-dim)",
      fieldGroup: "Combinatorics",
      field: "Enumerative combinatorics",
      statement:
        "The five-dimensional case of the Geode challenge of Amdeberhan, Kauers and Zeilberger, concerning the geode factor attached to a family of multivariate generating functions. Settled in dimension five.",
      posedBy: "Tewodros Amdeberhan, Manuel Kauers and Doron Zeilberger",
      yearPosed: null,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "computation",
      solveDate: "2026-08-11",
      model: "Claude",
      modelMaker: "Anthropic",
      humanCollaborators: ["Jaideep Sai Padhi"],
      aiRole: ZEIL_AI,
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote: ZEIL_VERIF,
      significance: 14,
      significanceNote:
        "A named challenge from three authors, settled in the specific dimension posed. Real and precisely stated, narrow in reach - the lower challenge band.",
      publication: "preprint",
      sourceUrl: ZEIL_SOURCE,
      sourceName: ZEIL_NAME,
      renownLangs: 0,
    },
    links: ZEIL_LINKS,
  },
  {
    slug: "kauers-zeilberger-conjectures-2a-2b",
    fields: {
      name: "Conjectures 2a and 2b of Kauers and Zeilberger",
      shortName: "Kauers–Zeilberger 2a, 2b",
      fieldGroup: "Combinatorics",
      field: "Lattice walk enumeration",
      statement:
        "Conjectures 2a and 2b of Kauers and Zeilberger, on the asymptotics of a family of restricted lattice walks. Both are obtained from a local limit theorem for excursions of Markov-modulated random walks in cones.",
      posedBy: "Manuel Kauers and Doron Zeilberger",
      yearPosed: null,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-08-11",
      model: "Claude",
      modelMaker: "Anthropic",
      humanCollaborators: ["Jaideep Sai Padhi"],
      aiRole: ZEIL_AI,
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote: ZEIL_VERIF,
      significance: 16,
      significanceNote:
        "Settled not by computation but by proving a local limit theorem for excursions of Markov-modulated random walks in cones - a general probabilistic tool built to answer them, which is why this rates highest of the five challenges here.",
      publication: "preprint",
      sourceUrl: ZEIL_SOURCE,
      sourceName: ZEIL_NAME,
      renownLangs: 0,
    },
    links: ZEIL_LINKS,
  },
  {
    slug: "counting-linear-extensions-below-two-to-the-n",
    fields: {
      name: "Counting Linear Extensions Below the $2^n$ Barrier",
      shortName: "Linear extensions, $2^n$ barrier",
      fieldGroup: "Algorithms & optimization",
      field: "Exact exponential algorithms",
      statement:
        "Koivisto asked at Dagstuhl in 2013 whether the linear extensions of an arbitrary $n$-element poset can be counted exactly in time $O^*(c^n)$ for some $c < 2$. Yes: a deterministic exact algorithm runs in $O^*(1.89^n)$, breaking the $2^n$ barrier for the general problem.",
      posedBy: "Mikko Koivisto, at Dagstuhl",
      yearPosed: 2013,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-08-19",
      model: "Claude Opus 5, ChatGPT 5.6 Sol",
      modelMaker: "Anthropic, OpenAI",
      humanCollaborators: ["Keigo Oka"],
      aiRole:
        "The paper's disclosure: \"The core mathematical ideas underlying the new part of the algorithm and proof were discovered by Claude Opus 5 (Anthropic) during AI-assisted mathematical exploration\" - naming the first-upper-element pattern representation, multiplicity-profile decoding, the deadline dynamic program and the state-counting strategy of Sections 3 to 5. The chain-partition bound of Section 2 refines Kozma and is not new. The research prompt supplied to Claude Opus 5 was itself generated by ChatGPT 5.6 Sol, modelled on OpenAI's publicly released prompt for their cycle double cover work.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 21 August 2026 against the paper (arXiv:2608.19505v1): the disclosure is verbatim as quoted and Koivisto's Dagstuhl 2013 question is cited in the abstract. This is an exact deterministic algorithm with a proved worst-case bound, not a heuristic, so it clears the methodology's exclusion. The ancillary Python script cross-checks correctness against brute force on small posets and does not certify the running time; it was not re-run here. Days-old preprint, no independent review.",
      significance: 28,
      significanceNote:
        "Breaking $2^n$ for a natural counting problem is the currency of exact exponential algorithms, and this question was posed explicitly and stood thirteen years. Level with the named-conjecture band around 30 inside its field, narrower outside it.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.19505",
      sourceName: "Breaking the $2^n$ Barrier for Counting Linear Extensions with a Short Elementary Algorithm",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "foregger-sinkhorn-tie-point-conjecture",
    fields: {
      name: "The Foregger–Sinkhorn Tie-Point Conjecture",
      shortName: "Foregger–Sinkhorn tie-point",
      fieldGroup: "Combinatorics",
      field: "Combinatorial matrix theory",
      statement:
        "The Foregger–Sinkhorn tie-point conjecture, Conjecture 41 in Minc's survey, asserts that if a nearly decomposable doubly stochastic matrix minimizes the permanent on a face and the permanental cofactor at a prescribed zero exceeds its permanent, then that zero is a tie point. False: an explicit $8 \\times 8$ counterexample exists, built on the unique root $\\beta$ of $7t^3 - 13t^2 + 12t - 4$ in $(59/100, 3/5)$.",
      posedBy: "T. H. Foregger and Richard Sinkhorn",
      yearPosed: 1987,
      solveType: "disproved",
      resolution: "candidate",
      resolutionMethod: "construction",
      solveDate: "2026-08-13",
      model: "GPT-5.6-sol, Claude Fable 5",
      modelMaker: "OpenAI, Anthropic",
      humanCollaborators: ["Yair Lavi"],
      aiRole:
        "The paper's acknowledgement, in full: \"The proof of Theorem 1 was carried out by GPT-5.6-sol and Claude Fable 5, under the guidance of the author. The author has reviewed the resulting proof arguments. Responsibility for the final text rests with the author.\"",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Independently recomputed by this site on 21 August 2026 from the paper's own data (arXiv:2608.13025v1), at 60-digit precision: $\\beta$ is the unique root of the stated cubic in the stated bracket, on which the cubic is monotone; the matrix is doubly stochastic and nonnegative; its 19-entry support is nearly decomposable, being fully indecomposable while the removal of any single support entry destroys that; the permanent agrees with the paper's closed form to 1e-61; the cofactor gap agrees with its closed form to 4e-61 and exceeds the claimed 2047/240100; and the prescribed zero is not a tie point, with exactly one witnessing support entry. The conjecture's hypothesis also holds: the face is four-dimensional, and a 6561-point grid plus 61 local descents found nothing on it with a smaller permanent. Still a days-old preprint with no independent review, hence a candidate.",
      significance: 12,
      significanceNote:
        "A named conjecture in permanent theory, listed in Minc's survey and standing since, but specialist even within combinatorial matrix theory. Above the Graffiti anchor at 5 as a stated conjecture with attribution, well below the named-conjecture band.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.13025",
      sourceName: "A counterexample to the Foregger-Sinkhorn tie-point conjecture",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "fractional-colouring-pauli-shadow-tomography",
    fields: {
      name: "The Fractional Colouring Conjecture for Triply Efficient Pauli Shadow Tomography",
      shortName: "Shadow tomography $\\chi_f$ bound",
      fieldGroup: "Quantum information & computing",
      field: "Shadow tomography",
      statement:
        "Conjecture 13 of King, Gosset, Kothari and Babbush asserts that for the set $B_\\varepsilon(\\rho)$ of Pauli observables with expectation value at least $\\varepsilon$ in magnitude, the fractional chromatic number of the induced anticommutation graph is $O(\\varepsilon^{-2})$; it would give a triply efficient Pauli shadow tomography algorithm. False: there are states and observables for which no finite constant bounds $\\chi_f \\varepsilon^2$.",
      posedBy: "Robbie King, David Gosset, Robin Kothari and Ryan Babbush",
      yearPosed: 2025,
      solveType: "disproved",
      resolution: "candidate",
      resolutionMethod: "construction",
      solveDate: "2026-08-20",
      model: "GPT Sol 5.6",
      modelMaker: "OpenAI",
      humanCollaborators: ["Jędrzej Stempin", "Santiago Llorens", "Felix Huber"],
      aiRole:
        "The arXiv comments field reads \"Found with GPT Sol 5.6\", and the paper's AI statement says the model was used to derive the main results, Theorem A and Theorem B. The construction amplifies fractional chromatic numbers, beta numbers and expectation values through lexicographic graph products.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 21 August 2026 against the paper (arXiv:2608.20113v1, 14pp): the refuted statement is Conjecture 13 of King, Gosset, Kothari and Babbush in PRX Quantum 6, 010336 (2025), and the AI statement is as quoted. The constructions were not checked here. Days-old preprint, no independent review.",
      significance: 16,
      significanceNote:
        "A precisely stated conjecture from a published PRX Quantum paper, whose truth would have delivered a triply efficient shadow tomography algorithm - so the stakes were concrete. Only posed in 2025, which caps it: a year-old conjecture has not yet earned the standing of the named-conjecture band.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.20113",
      sourceName: "Counterexamples to the fractional coloring conjecture for triply efficient shadow tomography",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "kasami-apn-function-triple-count-conjecture",
    fields: {
      name: "A Conjecture on Triple Counts for the Kasami APN Function",
      shortName: "Kasami APN triple counts",
      fieldGroup: "Algebra",
      field: "Finite fields and APN functions",
      statement:
        "For the Kasami APN function $F(x) = x^{4^k - 2^k + 1}$ on $\\mathrm{GF}(2^n)$ with $\\gcd(k, n) = 1$, the conjecture asserts that for $\\Delta = \\{F(b) + F(b+1) + 1\\}$ and all distinct nonzero $v_1, v_2$, the number of triples in $\\Delta^3$ with $v_1 x + v_2 y + (v_1 + v_2) z = 0$ is exactly $2^{2n-3}$. Proved for $k \\bmod n \\in \\{1, 2, n-2, n-1\\}$ and verified exhaustively for $n \\le 13$; the general case remains open.",
      posedBy: "Proposed anonymously at the NSUCRYPTO cryptographic olympiad",
      yearPosed: 2019,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-08-19",
      model: "Claude Fable 5, Aristotle",
      modelMaker: "Anthropic, Harmonic",
      humanCollaborators: ["Gábor P. Nagy", "Attila Vajda"],
      aiRole:
        "The paper's statement: \"Every proof in this paper was obtained by the AI assistant Claude Fable 5 and has subsequently been formally verified in the Lean theorem prover by Aristotle (Harmonic).\" The model was prompted with the conjecture statement together with background hints and a pointer to the companion repository.",
      aiContribution: "ai-discovered",
      verification: "lean-checked",
      verificationNote:
        "Checked by this site on 21 August 2026 against the paper (arXiv:2608.18584v1): the AI and Lean statements are verbatim as quoted. Recorded lean-checked rather than lean-verified deliberately - the companion repository is cited but its URL is not exposed in the HTML, so no artifact has been audited here for sorry or for declared axioms, and statement fidelity is unaudited. Entered as Partial on the paper's own words, \"The general case remains open\".",
      significance: 10,
      significanceNote:
        "An olympiad-posed question rather than a literature conjecture, and settled only in special cases. The AI and formal-verification story is the strongest in this batch, but significance scores the problem as it stood, which places this just above the Graffiti anchor at 5.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.18584",
      sourceName:
        "On a conjecture on the Kasami APN function: reductions, structure theorems, a proof for k mod n in {1,2,n-2,n-1}, and exhaustive verification for n<=13",
      renownLangs: 0,
    },
    links: [],
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  let bad = 0;
  for (const e of ENTRIES) {
    for (const [k, v] of Object.entries(e.fields)) {
      const lim = LIMITS.get(k);
      if (lim && typeof v === "string" && v.length > lim) {
        console.log(`  ${e.slug}.${k} OVER BY ${v.length - lim} (${v.length}/${lim})`);
        bad++;
      }
    }
  }
  if (bad) throw new Error("limits exceeded");

  console.log(`${ENTRIES.length} entries\n`);
  for (const e of ENTRIES) {
    const existing = await prisma.problem.findUnique({ where: { slug: e.slug } });
    console.log(`### ${e.slug}${existing ? "  (EXISTS - skip)" : ""}`);
    console.log(`    ${e.fields.name}`);
    console.log(
      `    ${e.fields.solveType}/${e.fields.resolution}  sig=${e.fields.significance}  ` +
      `ai=${e.fields.aiContribution}  ver=${e.fields.verification}  ` +
      `method=${e.fields.resolutionMethod}  posed=${e.fields.yearPosed ?? "n/a"}`,
    );
    if (existing || !APPLY) continue;

    await prisma.$transaction([
      prisma.problem.create({
        data: {
          slug: e.slug,
          ...(e.fields as object),
          status: "published",
          links: { create: e.links.map((l, position) => ({ ...l, position })) },
        } as never,
      }),
      prisma.problemActivity.create({
        data: {
          problem: { connect: { slug: e.slug } },
          user: { connect: { id: admin.id } },
          userName: admin.pseudonym ?? null,
          type: "created",
        },
      }),
    ]);
    console.log("    CREATED");
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`\ndone - ${published} published`);
}

main().finally(() => prisma.$disconnect());
