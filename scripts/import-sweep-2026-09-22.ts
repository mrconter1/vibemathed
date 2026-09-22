// Import of the 22 September sweep: fourteen entries from the 8-22 September
// finder window (plus the 29 Aug - 8 Sep backfill, which yielded nothing new).
//
// The window caught a cluster nobody could have predicted in August: GPT-6
// Astra's proof of the Erdős-Sós conjecture, already in the catalog as
// erdos-problem-548, has been followed within two weeks by a dozen further
// named conjectures answered the same way, several by established
// mathematicians who say plainly in the paper that the model found the proof.
//
// Every source was opened: abstract, introduction, AI-disclosure paragraph and
// reference list. Attributions below come from the papers' own reference
// lists, not from memory.
//
// THINGS THE TITLES GET WRONG, and why each matters:
//
//   * "Proof of the Pach-Tardos conjecture" (2609.20726) does NOT prove the
//     conjecture in its original form. Pach and Tardos conjectured
//     Ex(n,P) <= n polylog(n) for acyclic P; Pettie and Tardos REFUTED that in
//     2024 with a lower bound n 2^Omega(sqrt(log n)). This paper proves the
//     weaker form Ex(n,P) <= n^{1+o(1)}, which the authors call "arguably one
//     of the main open problems in the area". The entry says so; a reader who
//     only saw the title would be misled.
//
//   * "Kusner's conjecture is false for p>4" (2609.14794) is not the catalog's
//     existing Kusner entry. That one (2608.14013, significance 30) found a
//     single failing exponent and placed the infimum in [4,5). This disproves
//     it for EVERY p>4, and with Swanepoel (1<p<2) and Ge-Xu-Zhou (2<=p<=4)
//     that closes Kusner's 1983 conjecture across the whole range. Strictly
//     stronger, so a separate entry, cross-linked.
//
//   * "A non-trivial bound for 3AP-intersecting families" (2609.18870) is
//     PARTIAL, not a resolution: it is the first non-trivial progress towards
//     the Simonovits-Sós conjecture, which asks for 2^{n-3} and is untouched.
//
//   * "Tuza's Ryser-conjecture claim..." (2609.14281) closes one case,
//     (r,nu) = (4,2), of Ryser's conjecture. Also partial.
//
// NOT ENTERED, deliberately:
//
//   * arXiv:2609.15893 (Riordan and Scott, a short proof of Erdős-Sós) and
//     arXiv:2609.17877 (Wood, an expository account). Neither used AI: they
//     are humans reproving and explaining what Astra proved. They are the
//     best corroboration the Erdős-Sós entry could have, so they belong in
//     that entry's result note as independent confirmation, not as entries of
//     their own. A one-line addition is made to erdos-problem-548 for that.
//
//   * The two hits from the 29 Aug - 8 Sep backfill (2609.00419 many-one
//     degrees, 2608.12678 gap of finite posets). Both are real AI-discovered
//     results but neither answers a named, previously-posed question; they
//     sit below the methodology's bar in the same way the 2026 one-paper
//     conjectures do. Recorded here so the next sweep does not re-triage them.
//
// VERIFICATION is "unreviewed" on every entry: all are preprints between two
// days and three weeks old with no referee and no formal proof. 2609.11802 is
// the closest to an exception - Aristotle checked its computational verifier
// in Lean - and its note says exactly that rather than claiming more.
//
// Dry run by default. Pass --apply to write.

import { guardedPrisma } from "./lib/guarded-prisma";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

interface Entry {
  slug: string;
  fields: Record<string, unknown>;
  links: { label: string; url: string; kind: string }[];
}

const ENTRIES: Entry[] = [
  {
    slug: "uniform-turan-density-of-the-tetrahedron",
    fields: {
      name: "The uniform Turán density of the tetrahedron",
      shortName: "Uniform Turán density of $K_4^{(3)}$",
      fieldGroup: "Combinatorics",
      field: "Extremal hypergraph theory",
      statement:
        "The uniform Turán density $\\pi_u(H)$ of a 3-uniform hypergraph $H$ is the smallest $d$ such that every sufficiently large hypergraph in which all linear-sized subsets induce density above $d$ contains $H$. Erdős and Sós asked in the 1982 paper that founded the subject for the value of $\\pi_u(K_4^{(3)})$, the complete 3-graph on four vertices, and for $\\pi_u(K_4^{(3)-})$. The second was settled at $1/4$ in 2018 by Glebov, Kráľ and Volec; the tetrahedron itself resisted for forty-four years, with $1/2$ the conjectured value from a known lower-bound construction. What is $\\pi_u(K_4^{(3)})$?",
      posedBy: "Paul Erdős and Vera T. Sós, in the 1982 paper that introduced uniform Turán densities",
      yearPosed: 1982,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-10",
      model: "ChatGPT 6 Pro; Aristotle",
      modelMaker: "OpenAI; Harmonic",
      humanCollaborators: ["Matija Bucić"],
      aiRole:
        "From the paper's declaration of AI use: identity (6) in the proof was found by ChatGPT 6 Pro, after an early draft containing the author's ideas was uploaded to it. Separately, the paper relies on a computational verifier; besides the author hand-checking that verifier's correctness, Aristotle was used to check it in Lean and to run a separate audit. The mathematical frame, the reduction and the write-up are the author's; the model supplied one identity inside it.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.11802: the abstract states the value $1/2$ and that it answers a question of Erdős and Sós from the founding 1982 paper, and the introduction names that paper and the companion question about $K_4^{(3)-}$. The AI declaration is quoted as written. The mathematics was not checked here. Aristotle's Lean check covers the computational verifier used inside the proof, not the proof as a whole, so this is not a formalisation of the theorem and the entry does not claim one. Twelve days old, no referee.",
      significance: 48,
      significanceNote:
        "One of the two questions the founding paper of uniform Turán density asked, open for forty-four years, with the companion question ($K_4^{(3)-}$, settled at $1/4$ in 2018) regarded as a landmark when it fell. Well known across extremal combinatorics without being a household name outside it: below the Erdős-Sós conjecture at 58, which is older and more central, and above the Bilu-Linial signing conjecture at 35.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.11802",
      sourceName: "The uniform Turán density of the tetrahedron, arXiv:2609.11802 (10 September 2026)",
      resultNote:
        "$\\pi_u(K_4^{(3)}) = 1/2$, matching the long-known lower-bound construction. The AI contribution is one identity inside the argument rather than the argument, which is why this is recorded as AI-assisted; it is included in the catalog because the identity is a step of the proof, not a matter of exposition.",
      renownLangs: 0,
    },
    links: [
      { label: "Glebov, Kráľ and Volec, the companion question settled in 2018", url: "https://arxiv.org/abs/1705.10740", kind: "paper" },
    ],
  },
  {
    slug: "weak-pach-tardos-conjecture-acyclic-matrix-patterns",
    fields: {
      name: "The weak Pach-Tardos conjecture for acyclic matrix patterns",
      shortName: "Weak Pach-Tardos conjecture",
      fieldGroup: "Combinatorics",
      field: "Extremal combinatorics; forbidden 0-1 matrices",
      statement:
        "For a 0/1 pattern $P$, let $\\mathrm{Ex}(n,P)$ be the largest number of 1-entries in an $n \\times n$ 0/1 matrix containing no copy of $P$; $P$ is acyclic when its bipartite incidence graph is a forest. Pach and Tardos conjectured in 2005 that $\\mathrm{Ex}(n,P) \\le n\\,\\mathrm{polylog}(n)$ for every acyclic $P$. Pettie and Tardos refuted that in 2024, exhibiting acyclic patterns with $\\mathrm{Ex}(n,P) \\ge n\\,2^{\\Omega(\\sqrt{\\log n})}$. The weaker form survives and is, in the authors' words, arguably one of the main open problems in the area: is $\\mathrm{Ex}(n,P) \\le n^{1+o(1)}$ for every acyclic $P$?",
      posedBy: "János Pach and Gábor Tardos (2005); the weak form is what survives Pettie and Tardos's 2024 refutation of the original",
      yearPosed: 2005,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-17",
      model: "ChatGPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Lior Gishboliner", "Xiangyu Li"],
      aiRole:
        "The paper's declaration of AI use, in full: \"The proof was found by ChatGPT-6 Astra, with substantial input and guidance from the authors. The authors then rewrote the proof and take full responsibility for its correctness.\"",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.20726. The introduction was read and states the distinction this entry turns on: Pach and Tardos conjectured the polylog bound, Pettie and Tardos refuted it, and what is proved here is the weaker $n^{1+o(1)}$ form, restated as Theorem 1 for ordered bipartite trees and Corollary 2 as $\\mathrm{Ex}(n,P) \\le n^{1+O_P(1/\\log\\log n)}$. The AI declaration is quoted verbatim. The mathematics was not checked here; five days old, no referee.",
      significance: 35,
      significanceNote:
        "A 2005 conjecture at the centre of forbidden-matrix theory, which feeds Davenport-Schinzel theory, the Stanley-Wilf line of work and the twin-width parameter; the authors call the weak form arguably the main open problem of the area. The original form's refutation in 2024 raised rather than lowered the stakes on what remained. Level with the Bilu-Linial entry at 35 and below the uniform Turán density entry at 48, which is older and more widely followed.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.20726",
      sourceName: "Proof of the Pach-Tardos conjecture, arXiv:2609.20726 (17 September 2026)",
      resultNote:
        "Proved, in the weak form: for every acyclic pattern $P$, $\\mathrm{Ex}(n,P) \\le n^{1+O_P(1/\\log\\log n)}$, hence $n^{1+o(1)}$. Stated as Theorem 1 in the language of ordered bipartite graphs: for all $s,t \\ge 1$ and $\\varepsilon>0$ there is $n_0$ such that every $n \\times n$ ordered bipartite graph with $n \\ge n_0$ and at least $n^{1+\\varepsilon}$ edges contains a copy of every $s \\times t$ ordered bipartite tree. The paper does NOT restore the original polylog conjecture, which stays refuted.",
      claimIssueNote:
        "The title says \"Proof of the Pach-Tardos conjecture\" without qualification, but the conjecture in its published 2005 form was disproved by Pettie and Tardos in 2024. What is proved is the weaker $n^{1+o(1)}$ statement. The paper's own introduction is explicit about this; the title alone is not.",
      renownLangs: 0,
    },
    links: [
      { label: "Pettie and Tardos, the 2024 refutation of the original form", url: "https://arxiv.org/abs/2407.02638", kind: "paper" },
    ],
  },
  {
    slug: "kahns-flow-conjecture",
    fields: {
      name: "Kahn's flow conjecture",
      shortName: "Kahn's flow conjecture",
      fieldGroup: "Combinatorics",
      field: "Extremal set theory",
      statement:
        "Chvátal conjectured in 1974 that among the intersecting subfamilies of any downset (a family closed under taking subsets), one of maximum size can be taken to be a star: all sets containing some fixed element. Kahn's flow conjecture is a strengthening, phrased as the existence of a flow between the family and a star, which implies Chvátal's statement. Is Kahn's flow conjecture true?",
      posedBy: "Jeff Kahn, as a strengthening of Vašek Chvátal's 1974 conjecture on intersecting subfamilies of a downset",
      yearPosed: 1974,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-20",
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Peter Keevash"],
      aiRole:
        "The paper's statement on AI use: the proof was found by GPT-6 Astra, following an approach suggested by the author. The author supplied the route and the surrounding write-up; the model produced the argument along it.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.23595: the abstract states that Kahn's flow conjecture is proved and describes it as a strong form of Chvátal's conjecture, and the reference list confirms the attribution chain (Chvátal 1974, Hypergraph Seminar, LNM 411; Friedgut, Kahn, Kalai and Keller, JCTA 156 (2018), on Chvátal's conjecture and correlation inequalities). The mathematics was not checked here. Two days old, no referee. A separate September 2026 preprint (arXiv:2609.19123, Chang, Liu and Liu) proves Chvátal's conjecture itself by a correlation inequality and is cited here; the two are independent.",
      significance: 40,
      significanceNote:
        "Chvátal's conjecture is a fifty-year-old named problem of extremal set theory that Kleitman, Fishburn and later Friedgut, Kahn, Kalai and Keller all wrote on; Kahn's flow form is the natural strengthening specialists track. Known by name across combinatorics without reaching outside it: level with the catalog's Talagrand convolution entry at 37 and a little above it for age, below the uniform Turán density entry at 48.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.23595",
      sourceName: "On Kahn's flow conjecture, arXiv:2609.23595 (20 September 2026)",
      renownLangs: 0,
    },
    links: [
      { label: "Friedgut, Kahn, Kalai and Keller on Chvátal's conjecture", url: "https://doi.org/10.1016/j.jcta.2018.01.001", kind: "paper" },
    ],
  },
  {
    slug: "kusner-conjecture-false-for-all-p-greater-than-4",
    fields: {
      name: "Kusner's conjecture is false for every $p>4$",
      shortName: "Kusner's conjecture for $p>4$",
      fieldGroup: "Geometry & topology",
      field: "Discrete geometry; equilateral sets",
      statement:
        "An equilateral set in $\\ell_p^n$ is a set of points at equal pairwise distance. Kusner conjectured in 1983 that the largest such set has exactly $n+1$ points for every $1<p<\\infty$, as in the Euclidean case. Swanepoel disproved it for $1<p<2$ and Ge, Xu and Zhou proved it for $2 \\le p \\le 4$, leaving $p>4$ open, where the catalog's earlier entry had found a single failing exponent and placed the infimum of failing exponents in $[4,5)$. Does the conjecture fail for every $p>4$?",
      posedBy: "Robert Kusner (1983)",
      yearPosed: 1983,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-13",
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Nathan Xiong"],
      aiRole:
        "From the acknowledgements: the construction was found by OpenAI's GPT-6 Astra model, with the author taking responsibility for correctness.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.14794. The abstract gives the construction explicitly - for every $p>4$ an equilateral set of $8m$ points in $\\mathbb R^{8m-2}$ for an $m$ depending on $p$ - and states that combining it with Swanepoel and with Ge, Xu and Zhou resolves Kusner's conjecture across the whole range $1<p<\\infty$. The attribution of the conjecture to Kusner was confirmed in the paper's introduction. The mathematics was not checked here; nine days old, no referee.",
      significance: 35,
      significanceNote:
        "The same 1983 conjecture as the catalog's earlier entry, but this closes it: every $p>4$, not one exponent, and with the two prior results the full range. Set above that entry's 30 for completing the picture, and below the uniform Turán density entry at 48 for a smaller literature.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.14794",
      sourceName: "Kusner's conjecture is false for $p>4$, arXiv:2609.14794 (13 September 2026)",
      resultNote:
        "False for every $p>4$. This is strictly stronger than the catalog's August entry (arXiv:2608.14013, significance 30), which exhibited $n+2$ equilateral points for a single exponent and only located the infimum of failing exponents in $[4,5)$. Together with Swanepoel for $1<p<2$ and Ge, Xu and Zhou for $2 \\le p \\le 4$, Kusner's conjecture is now settled for all $1<p<\\infty$: true exactly on $[2,4]$.",
      renownLangs: 0,
    },
    links: [
      { label: "The earlier, weaker counterexample already in this catalog", url: "https://arxiv.org/abs/2608.14013", kind: "paper" },
    ],
  },
  {
    slug: "talagrand-operator-cotype-problem",
    fields: {
      name: "Talagrand's operator cotype problem",
      shortName: "Talagrand's operator cotype problem",
      fieldGroup: "Analysis",
      field: "Banach space theory; stochastic processes",
      statement:
        "For a bounded operator $U$ between Banach spaces, write $C_q^r(U)$ for its Rademacher cotype-$q$ constant, $C_q^g(U)$ for its Gaussian cotype-$q$ constant and $\\|U\\|_{q,1}$ for its $(q,1)$-summing norm. Talagrand asked, as a research problem in his book on upper and lower bounds for stochastic processes, whether there is a universal constant $L$ with $C_q^r(U) \\le L\\max\\{C_q^g(U), \\|U\\|_{q,1}\\}$ for every such $U$. Is the Rademacher cotype of an operator controlled in this way?",
      posedBy: "Michel Talagrand, Research Problem 19 in Upper and Lower Bounds for Stochastic Processes (2nd edition, 2021)",
      yearPosed: 2021,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-17",
      model: "ChatGPT (GPT-5.6)",
      modelMaker: "OpenAI",
      humanCollaborators: ["Xinglong Wu"],
      aiRole:
        "Stated in the abstract itself, not only in a disclosure paragraph: \"The counterexample was discovered by ChatGPT (GPT-5.6).\"",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.19731: the abstract and introduction both state the problem as Talagrand's and give the negative answer at $q=2$, and the reference list confirms the source as Talagrand's Upper and Lower Bounds for Stochastic Processes, second edition, Springer 2021, where it is a numbered research problem. The mathematics was not checked here; five days old, no referee.",
      significance: 32,
      significanceNote:
        "A numbered research problem in Talagrand's own book, in the area his Fields-level work defined; specialists in Banach space geometry would recognise it, few outside would. Just below the catalog's Talagrand convolution conjecture at 37, which is older and more widely cited, and above the abelian-envelope entry at 22.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.19731",
      sourceName: "A Counterexample to Talagrand's Operator Cotype Problem, arXiv:2609.19731 (17 September 2026)",
      resultNote: "No: the answer is negative already for $q=2$, so no such universal constant exists.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "periodicity-conjecture-for-finite-dimensional-algebras",
    fields: {
      name: "The periodicity conjecture for finite-dimensional algebras",
      shortName: "Periodicity conjecture",
      fieldGroup: "Algebra",
      field: "Representation theory of algebras",
      statement:
        "A module is periodic when it is isomorphic to one of its own higher syzygies, and an algebra is periodic when it is periodic as a bimodule over itself. The periodicity conjecture, studied by Erdmann and Skowroński in their work on periodic and weighted surface algebras, asks whether a finite-dimensional algebra must be periodic whenever all of its simple modules are. Is it true?",
      posedBy: "Karin Erdmann and Andrzej Skowroński, in their programme on periodic algebras and blocks of group algebras",
      yearPosed: 2015,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-09",
      model: "GPT-6 Astra; Claude Opus 5",
      modelMaker: "OpenAI; Anthropic",
      humanCollaborators: ["Haruhisa Enomoto"],
      aiRole:
        "From the paper's use-of-AI section: the counterexample and its proof were found by GPT-6-Astra in research directed by the author, and the first draft of the manuscript was written by GPT-6-Astra; Claude Opus 5 reviewed the exposition; the author set the structure and takes responsibility.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.09732: the abstract states the conjecture and gives a 36-dimensional counterexample whose simple modules have period four and which carries a 2-dimensional nonperiodic module, so the algebra itself is not periodic. The reference list confirms the Erdmann-Skowroński attribution (Colloq. Math. 138 (2015) on the periodicity conjecture for blocks of group algebras; J. Algebra 505 (2018) on weighted surface algebras). The mathematics was not checked here; thirteen days old, no referee.",
      significance: 25,
      significanceNote:
        "A conjecture with a decade of work behind it in the Erdmann-Skowroński programme on periodic algebras, and a clean finite counterexample against it. A specialist problem inside representation theory of algebras: level with the catalog's Auslander-Reiten-Smalø entry at 20 plus a little for the conjecture having a name and a literature, below Talagrand's cotype problem at 32.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.09732",
      sourceName: "A counterexample to the periodicity conjecture for finite-dimensional algebras, arXiv:2609.09732 (9 September 2026)",
      resultNote: "False: an explicit 36-dimensional algebra whose simple modules all have period four, but which has a 2-dimensional nonperiodic module and so is not itself periodic.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "tachikawa-second-conjecture-implies-auslander-reiten",
    fields: {
      name: "Does Tachikawa's second conjecture imply the Auslander-Reiten conjecture?",
      shortName: "Tachikawa second implies Auslander-Reiten",
      fieldGroup: "Algebra",
      field: "Representation theory of artin algebras",
      statement:
        "A family of homological conjectures for artin algebras - the Nakayama conjecture, the generalized Nakayama conjecture, the Auslander-Reiten conjecture, the Auslander-Gorenstein conjecture, the Gorenstein-projective conjecture and Tachikawa's first and second conjectures - has been known since the 1970s to sit in a web of one-way implications, with the question of which are equivalent left open. Does Tachikawa's second conjecture imply the Auslander-Reiten conjecture?",
      posedBy: "Maurice Auslander and Idun Reiten, in their work on the generalized Nakayama conjecture; Tachikawa's conjectures date from the same period",
      yearPosed: 1975,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-14",
      model: "GPT-6 Astra; Claude Opus 5",
      modelMaker: "OpenAI; Anthropic",
      humanCollaborators: ["Haruhisa Enomoto"],
      aiRole:
        "From the paper's use-of-AI section: the proof was found by GPT-6-Astra in research directed by the author, and the first draft of the manuscript was written by GPT-6-Astra; Claude Opus 5 revised the exposition; the author set the structure and takes responsibility.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.19172: the abstract states the implication for artin algebras over a commutative artinian ring, by way of the two-fold trivial extension, and draws the consequence that six of the conjectures in the family become equivalent and that Tachikawa's second implies his first. The introduction confirms the Auslander-Reiten attribution. The mathematics was not checked here; eight days old, no referee. Same author and same AI process as the periodicity-conjecture entry of five days earlier.",
      significance: 30,
      significanceNote:
        "Collapses six named homological conjectures of the 1958-1975 era into one equivalence class, which is the kind of structural result the field has wanted for decades; the Nakayama conjecture itself is old and well known inside homological algebra. Above the periodicity-conjecture entry at 25 because it settles relations among several named conjectures rather than one, and below Kahn's flow conjecture at 40 for a narrower audience.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.19172",
      sourceName: "Tachikawa's second conjecture implies the Auslander-Reiten conjecture, arXiv:2609.19172 (14 September 2026)",
      resultNote:
        "Yes. With the known implications it follows that the Auslander-Reiten conjecture, the generalized Nakayama conjecture, the Auslander-Gorenstein conjecture, the Nakayama conjecture, the Gorenstein-projective conjecture and Tachikawa's second conjecture are all equivalent, and that Tachikawa's second implies his first. None of them is thereby proved.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "petrykowski-conjecture-bounded-orbit-definable-amenability",
    fields: {
      name: "Petrykowski's conjecture on bounded orbits and definable amenability",
      shortName: "Petrykowski's conjecture",
      fieldGroup: "Logic & foundations",
      field: "Model theory",
      statement:
        "For a definable group in a first-order theory, Petrykowski proposed that admitting a global type whose left-translation orbit is bounded should suffice for the group to be definably amenable; Newelski recorded the conjecture and proved it under stronger hypotheses. Does a bounded left-translation orbit imply definable amenability?",
      posedBy: "Marcin Petrykowski; recorded as a conjecture by Ludomir Newelski, who proved it under stronger hypotheses",
      yearPosed: 2012,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-04",
      model: "ChatGPT 5.6",
      modelMaker: "OpenAI",
      humanCollaborators: ["Artem Chernikov"],
      aiRole:
        "From the paper's AI disclosure: ChatGPT 5.6 was used to establish parts of the general model-companion construction and to use finite quotients to construct the bounded orbit. The framing, the extension of the earlier seven-author construction and the write-up are the author's.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.05711: the abstract states the counterexample as a simple expansion of the theory of nonabelian free groups with a global type of bounded left-translation orbit that is not definably amenable, extending the construction of Chernikov, Hrushovski, Kruckman, Krupiński, Moconja, Pillay and Ramsey. The introduction credits Petrykowski for the proposal and Newelski for recording it, and the reference list carries Newelski, Isr. J. Math. 187 (2012), and Newelski-Petrykowski in JLMS. The mathematics was not checked here; eighteen days old, no referee.",
      significance: 20,
      significanceNote:
        "A named conjecture in the definable-amenability corner of model theory, recorded in print by Newelski and worked on by a small group. Level with the catalog's other model-theory entries and its Auslander-Reiten-Smalø entry at 20; below the periodicity conjecture at 25 for a shorter recorded history.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.05711",
      sourceName: "A counterexample to Petrykowski's conjecture, arXiv:2609.05711 (4 September 2026)",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "bilu-linial-signing-conjecture-counterexample",
    fields: {
      name: "The Bilu-Linial signing conjecture for regular graphs",
      shortName: "Bilu-Linial signing conjecture",
      fieldGroup: "Combinatorics",
      field: "Spectral graph theory",
      statement:
        "Bilu and Linial asked whether every connected $d$-regular graph admits a signing of its edges by $\\pm 1$ whose signed adjacency matrix has all eigenvalues in $[-2\\sqrt{d-1}, 2\\sqrt{d-1}]$, the Ramanujan interval. A positive answer would give an iterative construction of Ramanujan graphs of every degree; Marcus, Spielman and Srivastava proved the one-sided version, which yields bipartite Ramanujan graphs. Does every regular graph have such a signing?",
      posedBy: "Yonatan Bilu and Nathan Linial (2004, 2006)",
      yearPosed: 2006,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-14",
      model: "ChatGPT",
      modelMaker: "OpenAI",
      humanCollaborators: ["Zhiqiang Xu"],
      aiRole:
        "From the paper: the counterexample and its proof strategy were developed with the assistance of ChatGPT, and the author states that all AI-generated text was reviewed and the mathematics verified. The model is not named more precisely in the disclosure.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.15591: the abstract gives a finite connected simple cubic graph $F$ every signing of which has an eigenvalue outside $[-2\\sqrt2, 2\\sqrt2]$, and states the limitation plainly - $F$ is not Ramanujan, so the conjecture restricted to Ramanujan base graphs remains open. The reference list confirms Bilu and Linial (CPC 13 (2004) and Combinatorica 26 (2006)) and the Marcus-Spielman-Srivastava line. The mathematics was not checked here; eight days old, no referee.",
      significance: 35,
      significanceNote:
        "The conjecture behind one of the most celebrated lines in spectral graph theory: Marcus, Spielman and Srivastava's bipartite Ramanujan construction came out of attacking it, and it is stated in every survey of expanders. Level with the weak Pach-Tardos entry at 35 and below the uniform Turán density entry at 48; the restriction to Ramanujan base graphs, which is the case that would have given the iterative construction, survives.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.15591",
      sourceName: "A 3-regular counterexample to the Bilu-Linial signing conjecture, arXiv:2609.15591 (14 September 2026)",
      resultNote:
        "False for general regular graphs: an explicit cubic graph $F$ for which every signing produces an eigenvalue outside the Ramanujan interval. $F$ is not itself Ramanujan, and the conjecture restricted to Ramanujan base graphs - the form that would yield Ramanujan graphs of every degree by iteration - remains open.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "abelian-envelope-without-the-quotient-property",
    fields: {
      name: "Does every abelian envelope have the quotient property?",
      shortName: "Abelian envelopes and the quotient property",
      fieldGroup: "Algebra",
      field: "Tensor categories",
      statement:
        "An abelian envelope of a monoidal category is a universal abelian tensor category receiving it. Coulembier, Etingof, Ostrik and Pauwels conjectured in 2023 that every abelian envelope has the quotient property, and proved that the universal rigid monoidal category on one object cannot have an abelian envelope with that property. Does every abelian envelope have the quotient property?",
      posedBy: "Kevin Coulembier, Pavel Etingof, Victor Ostrik and Bregje Pauwels (2023)",
      yearPosed: 2023,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-15",
      model: "GPT-6 Astra; Claude Opus 5",
      modelMaker: "OpenAI; Anthropic",
      humanCollaborators: ["Johannes Flake", "Jonathan Gruber", "Thorsten Heidersdorf"],
      aiRole:
        "From the paper's use-of-AI section: the first version of the proof was found by GPT-6 Astra on 5 September 2026; the authors then simplified and checked it and wrote it up by hand, before using GPT-6 Astra and Claude Opus to check the document. The abstract says outright that AI was used to find these results.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.17467: the abstract states that the universal rigid monoidal category on one object does have an abelian envelope, which disproves the conjecture because Coulembier, Etingof, Ostrik and Pauwels had shown it cannot have one with the quotient property. The candidate envelope comes from monoidal Ringel duality and the universal property is established with Coulembier-Etingof continuants. The mathematics was not checked here; seven days old, no referee.",
      significance: 22,
      significanceNote:
        "A 2023 conjecture from a paper by four leading tensor-category theorists, answered three years later; young, and followed by a small community. Above the catalog's 2026 conjecture-in-a-recent-paper entries and below the periodicity conjecture at 25, which has a decade of work behind it.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.17467",
      sourceName: "An abelian envelope without the quotient property, arXiv:2609.17467 (15 September 2026)",
      resultNote: "No. The universal rigid monoidal category on one object has an abelian envelope, which by the 2023 no-go result cannot have the quotient property.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "simonovits-sos-3ap-intersecting-families",
    fields: {
      name: "The Simonovits-Sós conjecture on 3AP-intersecting families",
      shortName: "3AP-intersecting families",
      fieldGroup: "Combinatorics",
      field: "Extremal set theory",
      statement:
        "A family $F$ of subsets of $[n]$ is 3AP-intersecting if any two members meet in a set containing a non-trivial three-term arithmetic progression. Simonovits and Sós conjectured that the largest such family has size $2^{n-3}$, attained by fixing a progression. Before this work nothing better than the trivial bound $\\tfrac12 2^n$ was known. What is the maximum size?",
      posedBy: "Miklós Simonovits and Vera T. Sós, by personal communication to Chung, Graham, Frankl and Shearer, who recorded it in their 1986 paper",
      yearPosed: 1986,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-09-16",
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Peter Keevash"],
      aiRole:
        "From the paper's statement on AI use: the proof was found by GPT-6 Astra following a hint by the author, who then simplified and rewrote it.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.18870: the abstract calls this the first non-trivial progress towards the Simonovits-Sós conjecture and states the bound $(\\tfrac12 - c)2^n$ for an absolute $c>0$, generalised to $H$-intersecting families for any 3-graph $H$ of bounded codegree, with a clique showing the codegree hypothesis cannot be dropped. The introduction attributes the conjecture to Simonovits and Sós by personal communication to the authors of reference [1], which is Chung, Graham, Frankl and Shearer, J. Combin. Theory Ser. A 43 (1986), so it dates to 1986 or earlier. Entered as Partial on the paper's own framing. The mathematics was not checked here; six days old, no referee.",
      significance: 25,
      significanceNote:
        "A forty-year-old conjecture of two of extremal combinatorics' senior figures, recorded in Chung, Graham, Frankl and Shearer's 1986 paper, with a long-standing conjecture of Alon in the same family, and the first time anyone has beaten the trivial bound. Scored for the problem: level with the periodicity conjecture at 25. The step is partial - the conjectured $2^{n-3}$ is untouched - which the resolution field records rather than the score.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.18870",
      sourceName: "A non-trivial bound for 3AP-intersecting families, arXiv:2609.18870 (16 September 2026)",
      resultNote:
        "Partial: any 3AP-intersecting family has size at most $(\\tfrac12 - c)2^n$ for an absolute constant $c>0$, the first bound below the trivial one. The conjectured maximum $2^{n-3}$ is not established. The same bound is proved for $H$-intersecting families whenever $H$ is a 3-graph on $[n]$ with bounded codegrees, and a clique shows the codegree assumption cannot be removed.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "ryser-conjecture-four-partite-matching-number-two",
    fields: {
      name: "Ryser's conjecture for four-partite hypergraphs with matching number two",
      shortName: "Ryser's conjecture, case $(4,2)$",
      fieldGroup: "Combinatorics",
      field: "Hypergraph covering",
      statement:
        "Ryser's conjecture states that every $r$-partite $r$-uniform hypergraph $H$ satisfies $\\tau(H) \\le (r-1)\\nu(H)$, where $\\tau$ is the vertex-cover number and $\\nu$ the matching number. It is known for $r \\le 3$ (Aharoni) and open in general. Tuza claimed the case $r=4$, $\\nu=2$, giving $\\tau \\le 6$, in an unpublished 1979 manuscript but never published a proof; the best bound in print was $\\tau \\le 7$. Does $\\tau \\le 6$ hold for four-partite four-uniform hypergraphs with matching number two?",
      posedBy: "Herbert J. Ryser (conjecture, via Henderson's 1971 thesis); the case $(4,2)$ was claimed without proof by Zsolt Tuza in an unpublished 1979 manuscript",
      yearPosed: 1971,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-09-13",
      model: "GPT-5.6 Sol; Claude Sonnet 4",
      modelMaker: "OpenAI; Anthropic",
      humanCollaborators: ["Patrick White"],
      aiRole:
        "From the paper's methods section: the proof was found through four rounds of structured reasoning with GPT-5.6 Sol (model gpt-5.6-sol-pro), each round building on verified output of the previous one, with wrong turns recorded; Claude (claude-sonnet-4) served throughout in a framing and checking role.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.14281: the abstract states $\\tau(H) \\le 6$ for four-partite four-uniform $H$ with $\\nu(H)=2$, confirming Tuza's 1979 claim and improving on $\\tau \\le 7$, an integrality consequence of Haxell and Scott (2012); the ingredients named are Gyárfás's intersecting-case theorem, a projection lemma and Kőnig's matching theorem. The reference list confirms Tuza's unpublished 1979 manuscript and his 1983 Ars Combinatoria paper. Entered as Partial: one case of Ryser's conjecture, which stays open. The mathematics was not checked here; nine days old, no referee.",
      significance: 20,
      significanceNote:
        "Ryser's conjecture is a well-known problem of hypergraph covering with a fifty-year literature, but this settles one case of it, $(r,\\nu)=(4,2)$, and confirms a claim that has been cited from an unpublished manuscript since 1979. Scored for the case rather than the conjecture: level with the Petrykowski entry at 20.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.14281",
      sourceName: "Tuza's Ryser-conjecture claim for four-partite hypergraphs with matching number two, arXiv:2609.14281 (13 September 2026)",
      resultNote:
        "Yes, $\\tau \\le 6$, closing the case $(r,\\nu) = (4,2)$ and putting a proof behind a claim cited from Tuza's unpublished 1979 manuscript for forty-seven years. Ryser's conjecture itself remains open for $r \\ge 4$ in general.",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "erdos-sos-for-digraphs",
    fields: {
      name: "A directed Erdős-Sós theorem for Eulerian digraphs",
      shortName: "Erdős-Sós for digraphs",
      fieldGroup: "Combinatorics",
      field: "Extremal graph theory",
      statement:
        "The Erdős-Sós conjecture, proved in 2026, says that a graph on $n$ vertices with more than $\\tfrac{k-1}{2}n$ edges contains every tree with $k$ edges. The directed analogue asks for the arc bound forcing an Eulerian digraph on $n$ vertices to contain every oriented tree with $t$ edges. No tight bound was known, even for directed paths. Does more than $(t-1)n$ arcs suffice?",
      posedBy: "Not posed under a name; the directed analogue of the Erdős-Sós conjecture, with tight bounds previously unknown even for directed paths",
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-10",
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Dhruv Mubayi", "Jacques Verstraëte"],
      aiRole:
        "The abstract states it directly: \"The result was proved by GPT-6 Astra.\" The authors supplied the problem and the write-up.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.10987: the abstract states that every Eulerian digraph on $n$ vertices with more than $(t-1)n$ arcs contains every oriented tree with $t$ edges, that the bound is sharp for each fixed oriented tree by disjoint unions of complete bidirected graphs, and that tight bounds were not previously known even for directed paths. It is described there as a directed analogue of the recently proved Erdős-Sós conjecture, which this catalog records as erdos-problem-548. The mathematics was not checked here; twelve days old, no referee.",
      significance: 20,
      significanceNote:
        "A sharp directed analogue of a famous conjecture, following it within weeks and by the same model, but not itself a problem anyone had posed under a name; the entry is here because the theorem is new, sharp and AI-proved, not because the question had standing. Below the Erdős-Sós entry at 58 by a wide margin, and level with the Ryser case entry at 20.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.10987",
      sourceName: "Erdős-Sós for digraphs, arXiv:2609.10987 (10 September 2026)",
      renownLangs: 0,
    },
    links: [
      { label: "The Erdős-Sós conjecture this generalises, also proved by GPT-6 Astra", url: "https://vibemathed.com/problem/erdos-problem-548-erdos-sos-conjecture", kind: "other" },
    ],
  },
  {
    slug: "kalai-conjecture-for-tight-trees",
    fields: {
      name: "Kalai's conjecture for tight trees",
      shortName: "Kalai's tight-tree conjecture",
      fieldGroup: "Combinatorics",
      field: "Extremal hypergraph theory",
      statement:
        "Kalai proposed in 1984, in a form recorded by Frankl and Füredi, a hypergraph generalisation of the Erdős-Sós conjecture: for a suitable notion of a tight tree $T$ with $t$ edges in an $r$-uniform hypergraph, every $r$-graph on $n$ vertices with more than $\\tfrac{t-1}{r}\\binom{n}{r-1}$ edges should contain $T$. The case $r=2$ is the Erdős-Sós conjecture, proved in 2026. Does the conjecture hold for all $r$?",
      posedBy: "Gil Kalai (1984), recorded by Péter Frankl and Zoltán Füredi; the $r=2$ case is the Erdős-Sós conjecture",
      yearPosed: 1984,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-09-07",
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Dhruv Mubayi", "Jacques Verstraëte"],
      aiRole:
        "From the paper: the proof was found by GPT-6 Astra, extending its own method of proof for the Erdős-Sós conjecture to the hypergraph setting. The authors supplied the framing and the write-up.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026 against arXiv:2609.08012: the introduction states that Kalai proposed the hypergraph generalisation in 1984, recorded by Frankl and Füredi, that the $r=2$ case is the Erdős-Sós conjecture, and that the conjecture is proved here via a shadow bound whose equivalence to Kalai's conjecture was established by Füredi, Jiang, Kostochka and the authors. The mathematics was not checked here; fifteen days old, no referee. Same authors and same model as the digraph entry three days later.",
      significance: 45,
      significanceNote:
        "A forty-two-year-old named conjecture of Kalai's generalising Erdős-Sós to hypergraphs, tracked in the extremal-hypergraph literature since Frankl and Füredi recorded it. Below the Erdős-Sós conjecture itself at 58, which is older and better known, and just below the uniform Turán density entry at 48; well above the directed analogue at 20, which nobody had posed.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2609.08012",
      sourceName: "Kalai's Conjecture for Tight Trees, arXiv:2609.08012 (7 September 2026)",
      renownLangs: 0,
    },
    links: [
      { label: "The Erdős-Sós conjecture, the $r=2$ case, also proved by GPT-6 Astra", url: "https://vibemathed.com/problem/erdos-problem-548-erdos-sos-conjecture", kind: "other" },
    ],
  },
];

/// The two human follow-ups to the catalogued Erdős-Sós entry. They used no
/// AI, so they are not entries; a human reproving the theorem independently
/// is the strongest corroboration that entry can have, so it is recorded
/// there instead.
const ERDOS_SOS_SLUG = "erdos-problem-548-erdos-sos-conjecture";
const ERDOS_SOS_APPEND =
  "\n\nIndependent human corroboration, September 2026: Riordan and Scott gave a short proof of the conjecture (arXiv:2609.15893) and Wood published an expository account of the argument (arXiv:2609.17877). Neither used AI. Mubayi and Verstraëte then extended the method, with GPT-6 Astra, to Kalai's 1984 hypergraph conjecture (arXiv:2609.08012) and to a sharp directed analogue (arXiv:2609.10987), both catalogued separately.";

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
      `posed=${e.fields.yearPosed ?? "n/a"}  ${e.links.length} link(s)`,
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

  // The Erdős-Sós corroboration note, appended once and only once.
  const es = await prisma.problem.findUnique({
    where: { slug: ERDOS_SOS_SLUG },
    select: { id: true, resultNote: true },
  });
  if (!es) {
    console.log(`\nWARNING: ${ERDOS_SOS_SLUG} not found - corroboration note NOT added`);
  } else if ((es.resultNote ?? "").includes("2609.15893")) {
    console.log(`\n${ERDOS_SOS_SLUG}: corroboration note already present, skipping`);
  } else {
    const next = (es.resultNote ?? "") + ERDOS_SOS_APPEND;
    const lim = LIMITS.get("resultNote");
    console.log(`\n${ERDOS_SOS_SLUG}: resultNote ${(es.resultNote ?? "").length} -> ${next.length}${lim ? `/${lim}` : ""}`);
    if (lim && next.length > lim) {
      console.log("  OVER LIMIT - note NOT added; trim ERDOS_SOS_APPEND");
    } else if (APPLY) {
      await prisma.problem.update({ where: { id: es.id }, data: { resultNote: next } });
      console.log("  APPENDED");
    }
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`\ndone - ${published} published`);
}

main().finally(() => prisma.$disconnect());
