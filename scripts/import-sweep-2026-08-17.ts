// Import of the 17 Aug three-day scan's nine qualifying candidates.
//
// All nine sources fetched and their AI disclosures read verbatim from the
// LaTeX; every posed-problem attribution checked in the paper's own text
// (Kusner 1983; the char-p MMP program; HC_4 as the one open Hessian
// dimension; the identity-third-block ADMM subclass stated open; Tarizadeh's
// published Conjecture 5.8; Reading Problem 9.3 / Segovia; Sivaraman's
// question answered negatively by the model-found P(17); Neuen-Grohe's open
// problem; Pavez-Signe's length-control question). Direction of the two
// question-answers confirmed in the text (14519 negative, 14432 affirmative
// with an epsilon-room threshold, hence Partial).
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
  relations?: { toSlug: string; kind: string; note: string }[];
}

const ENTRIES: Entry[] = [
  {
    slug: "kusner-conjecture-equilateral-sets-counterexample",
    fields: {
      name: "Kusner's Conjecture on Equilateral Sets in $\\ell_p^n$",
      shortName: "Kusner equilateral sets",
      fieldGroup: "Geometry & topology",
      field: "Discrete geometry",
      statement:
        "Kusner conjectured in 1983 that the maximum number of points in $\\mathbb{R}^n$ that are pairwise at $\\ell_p$-distance one is exactly $n+1$ for every $2 < p < \\infty$, as in the Euclidean case. False: an explicit configuration of $n+2$ equilateral points exists for some exponent, placing the infimum of exponents at which the conjecture fails in $[4,5)$. The configuration is the unique solution of an explicit polynomial system with rational coefficients in a rational box, established in exact arithmetic.",
      posedBy: "Robert B. Kusner",
      yearPosed: 1983,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-08-14",
      model: "GPT-5.6 Sol, Claude Fable 5",
      modelMaker: "OpenAI, Anthropic",
      humanCollaborators: ["Logan R. Chalmers"],
      aiRole:
        "The paper's disclosure: GPT-5.6 Sol assisted in implementing the computational search strategy in code, and Claude Fable 5 was used as a tool in drafting. No mathematical step is attributed to a model by name, but the search that produced the configuration is the load-bearing computation.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14013): the disclosure is verbatim as quoted, Kusner's 1983 attribution is in the introduction, and the data is deposited on Zenodo (10.5281/zenodo.21911503). The exact-arithmetic certificate was not re-run here. Days-old preprint, no independent review.",
      significance: 30,
      significanceNote:
        "A named 1983 conjecture in discrete geometry with a real literature (Alon-Pudlak among others) and forty-three years of standing. Well known within convexity and discrete geometry, less so outside - level with the named-conjecture band at 30.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14013",
      sourceName: "A counterexample to Kusner's conjecture on equilateral sets",
      renownLangs: 0,
    },
    links: [
      { label: "Zenodo data and verification package", url: "https://doi.org/10.5281/zenodo.21911503", kind: "code" },
    ],
  },
  {
    slug: "cone-theorem-effective-fourfold-pairs-char-p",
    fields: {
      name: "The Cone Theorem for Effective Fourfold Pairs in Characteristic $p > 5$",
      shortName: "Cone theorem, fourfolds, char p>5",
      fieldGroup: "Algebra",
      field: "Birational geometry (positive characteristic)",
      statement:
        "Extending the minimal model program beyond threefolds in positive characteristic is a standing goal of birational geometry. Assuming the log resolution conjecture for all log pairs birational to $X$, the cone theorem holds for projective log canonical, $\\mathbb{Q}$-factorial fourfold pairs $(X, \\Delta)$ with $K_X + \\Delta \\equiv M \\ge 0$, over bases of positive and mixed characteristic $p > 5$.",
      posedBy: "The char-p minimal model program (Birkar, Hacon, Xu, Waldron and others)",
      yearPosed: null,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-08-14",
      model: "ChatGPT 5.6 Sol, Codex",
      modelMaker: "OpenAI",
      humanCollaborators: ["Joe Waldron"],
      aiRole:
        "The paper's AI statement, in the author's words: he worked out the outline with all essential ingredients in Spring 2025, but one gap remained that he could not repair; he gave the unfinished proof to ChatGPT 5.6 Sol in Summer 2026 asking it to fill the gap, and it modified the approach to avoid the issue, which after further editing by hand and with Codex became the current version.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14236, Waldron, Michigan State): the AI statement is verbatim as quoted - among the frankest in the catalog, a professional birational geometer crediting the model with repairing a gap he could not. The result is conditional on the log resolution conjecture and is recorded as Partial for that reason. The proof was not checked here; days-old preprint, no independent review.",
      significance: 25,
      significanceNote:
        "The minimal model program in positive characteristic is a central program of modern algebraic geometry, and the cone theorem for fourfolds is a real step it has been waiting for - conditional on log resolution, which keeps it below the unconditional band.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14236",
      sourceName: "The cone theorem for effective fourfold pairs in characteristic p>5",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "quartic-hessian-conjecture-dimension-four",
    fields: {
      name: "The Quartic Hessian Conjecture in Dimension Four",
      shortName: "Quartic Hessian, $n=4$",
      fieldGroup: "Algebra",
      field: "Polynomial automorphisms",
      statement:
        "The Hessian conjecture $HC_n$ asks whether every polynomial $f$ with $\\det \\mathrm{Hess}(f) \\in \\mathbb{C}^\\times$ has a polynomial gradient inverse. It is known for $n \\le 3$, false for $n \\ge 5$, and open exactly in dimension four, where it implies the plane Jacobian conjecture. Proved for every quartic polynomial in dimension four: the quartic case reduces to $f = P(x_1,x_2,x_3) + x_4 Q(x_1,x_2,x_3) + a x_4^2$ with $\\deg Q \\le 2$, and every constant-Hessian polynomial of this form has a polynomial gradient inverse.",
      posedBy: "The Hessian conjecture (de Bondt, van den Essen line)",
      yearPosed: null,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-08-14",
      model: "GPT-5.6 Sol, GPT-5.6 Luna, Claude Fable 5, DeepSeek V4 Pro",
      modelMaker: "OpenAI, Anthropic, DeepSeek",
      humanCollaborators: ["Zixiang Ni"],
      aiRole:
        "The acknowledgement credits four systems - GPT-5.6 Sol, GPT-5.6 Luna, Claude Fable 5 and DeepSeek V4 Pro - with exploring candidate arguments, adversarial proof review, algebraic checking and editorial assistance, with the author independently reviewing all arguments. No individual step is attributed, so the lower tier applies.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14217): the acknowledgement is verbatim as quoted, and the introduction's status summary (known for n <= 3 by Dillen and de Bondt, false for n >= 5, open for n = 4, HC_4 implies the plane Jacobian conjecture) matches the literature, including the n >= 5 counterexample recorded as this catalog's sibling entry. Sole-author preprint, days old, not checked here, no independent review.",
      significance: 15,
      significanceNote:
        "The quartic slice of the one open Hessian dimension, whose full resolution would imply the plane Jacobian conjecture. A real partial advance on a recognisable target - specialist band at 15.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14217",
      sourceName: "The Quartic Hessian Conjecture in Dimension Four",
      renownLangs: 0,
    },
    links: [],
    relations: [
      {
        toSlug: "hessian-conjecture-five-variable-counterexample",
        kind: "related",
        note: "Two sides of the same Hessian conjecture: that entry disproves it in dimension five, this one proves its quartic case in dimension four - the single dimension still open.",
      },
    ],
  },
  {
    slug: "three-block-admm-identity-block-counterexample",
    fields: {
      name: "Convergence of Three-Block ADMM with Identity Third Block",
      shortName: "3-block ADMM, identity block",
      fieldGroup: "Algorithms & optimization",
      field: "Optimization - splitting methods",
      statement:
        "After Chen-He-Ye-Yuan's counterexample to direct three-block ADMM, the subclass in which the third constraint block is the identity matrix remained unresolved: the literature contained neither a convergence proof nor a counterexample. Disproved: an explicit rational counterexample exists in which the first two blocks are strongly convex quadratics and direct three-block ADMM produces a bounded nonconvergent orbit of period 66, verified by exact checks along a piecewise-affine reduction path.",
      posedBy: "Open subclass left by Chen, He, Ye, Yuan (2016)",
      yearPosed: 2016,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-08-14",
      model: "GPT-5.6 Sol (Codex)",
      modelMaker: "OpenAI",
      humanCollaborators: ["Kenan Xu", "Xiangfeng Wang"],
      aiRole:
        "The paper is framed as AI-assisted discovery in its own title: using Codex with GPT-5.6 Sol, the authors construct the explicit rational counterexample candidate and verify it along a piecewise-affine reduction path, with exact checks establishing the period-66 nonconvergent orbit; the same Codex workflow guides a further study.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14396): the open status of the identity-third-block subclass is stated in the abstract and introduction, and the construction-and-verification account is as quoted. The exact checks were not re-run here. Days-old preprint, no independent review.",
      significance: 15,
      significanceNote:
        "The convergence of multi-block ADMM is a well-known question in optimization since Chen-He-Ye-Yuan's celebrated 2016 counterexample, and the identity-third-block case was the natural surviving hope. Specialist but widely recognisable in the field.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14396",
      sourceName: "AI-Assisted Discovery and Construction of a Counterexample to the Convergence of Three-Block ADMM",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "purely-prime-not-purely-maximal-counterexample",
    fields: {
      name: "Tarizadeh's Conjecture on the Maximality of Purely-Prime Ideals",
      shortName: "Purely-prime vs purely-maximal",
      fieldGroup: "Algebra",
      field: "Commutative algebra",
      statement:
        "Every purely-maximal ideal of a commutative ring is purely-prime, and the converse holds for several important classes of rings; Tarizadeh conjectured (Conjecture 5.8 of his earlier published paper) that in a commutative ring every purely-prime ideal is purely-maximal. False: there is a commutative ring with a purely-prime ideal that is not purely-maximal.",
      posedBy: "Abolfazl Tarizadeh",
      yearPosed: null,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-08-14",
      model: "ChatGPT Pro",
      modelMaker: "OpenAI",
      humanCollaborators: ["Abolfazl Tarizadeh"],
      aiRole:
        "In the author's words: after years without progress on his own conjecture, \"by using an advanced model of AI (ChatGPT Pro), a counterexample is found to this conjecture\". The counterexample is the paper's content; the conjecture's own poser credits the model with finding it.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14251): the abstract and introduction say what the entry says, including that the conjecture is the author's own published Conjecture 5.8 which resisted for years. The construction was not checked here. Days-old preprint by the conjecture's poser, no independent review.",
      significance: 8,
      significanceNote:
        "A published conjecture in commutative algebra that stood for some years, disproved by its own poser with a model finding the counterexample. Narrow literature - between the week-old floor and the numbered-problem band.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14251",
      sourceName: "A counterexample to a question on the maximality of purely-primes",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "order-dimension-beyond-rank-simplicial-arrangements",
    fields: {
      name: "Reading's Problem 9.3: Order Dimension Versus Rank for Simplicial Arrangements",
      shortName: "Order dimension beyond rank",
      fieldGroup: "Combinatorics",
      field: "Posets / hyperplane arrangements",
      statement:
        "Reading computed the order dimension of the poset of regions for most finite Coxeter arrangements, observed that an exceptional type whose dimension exceeds its rank would be the first known simplicial arrangement with that property, and recorded the general guess that every simplicial region poset has dimension equal to its rank (Problem 9.3 of his 2016 chapter); Segovia later asked the analogous question for oriented-poset lattices. False: the order dimension of the poset of regions can exceed the rank - the Coxeter arrangements $H_4$ and $E_6$ satisfy $\\dim W(H_4) \\ge 5$ and $\\dim W(E_6) \\ge 7$.",
      posedBy: "Nathan Reading; Segovia",
      yearPosed: 2016,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-08-14",
      model: "ChatGPT 5.6 Sol Ultra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Daria Poliakova"],
      aiRole:
        "The declaration, in full: \"The small obstruction subgraphs were found by ChatGPT 5.6 Sol Ultra. The human input was the belief that the rank guess is incorrect, and one should look for counterexamples.\" The obstruction subgraphs are the entire content of the disproof, so the model produced the central objects under human direction.",
      aiContribution: "ai-discovered",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14092): the declaration is verbatim, and the problem attribution is precise - Reading's Problem 9.3 (2016) with the H_4/E_6 background from his 2003 computations, plus Segovia's analogous question. The obstruction subgraphs were not re-verified here. Days-old preprint, no independent review.",
      significance: 15,
      significanceNote:
        "A recorded problem of Reading's from the standard reference chapter on posets of regions, open ten years, answered with the first simplicial arrangements whose region posets have dimension above rank. Specialist band at 15.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14092",
      sourceName: "Order dimension beyond rank for simplicial hyperplane arrangements",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "sivaraman-perfect-divisibility-question-p17",
    fields: {
      name: "Sivaraman's Perfect-Divisibility Characterization Question",
      shortName: "Perfect divisibility vs chi-bound",
      fieldGroup: "Combinatorics",
      field: "Graph theory - chi-boundedness",
      statement:
        "Sivaraman asked whether perfect divisibility is characterized by its chromatic consequence: is a graph $G$ perfectly divisible if and only if $\\chi(H) \\le \\binom{\\omega(H)+1}{2}$ for every induced subgraph $H$ of $G$? False: the Paley graph $P(17)$ satisfies the chromatic bound hereditarily but is not perfectly divisible.",
      posedBy: "Vaidy Sivaraman",
      yearPosed: 2026,
      solveType: "disproved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-08-14",
      model: "ChatGPT",
      modelMaker: "OpenAI",
      humanCollaborators: ["Zhiyu Wang", "Weihao Xia"],
      aiRole:
        "The acknowledgement states that the Paley graph P(17) - the counterexample witness - was identified during exploratory use of ChatGPT and subsequently verified by the authors, with ChatGPT also used for language polishing and generating the verification code. All arguments and computations were checked by the authors.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14519, Wang-Xia): the question is stated as Question 1 with attribution to Sivaraman by personal communication, the negative answer via P(17) is Theorem-level, and the acknowledgement is verbatim as quoted. The P(17) computation was not re-run here. The paper's larger content - perfect and linear divisibility of chair-free graphs - is human work outside this entry's claim. Days old, no independent review.",
      significance: 4,
      significanceNote:
        "A natural characterization question, but posed by personal communication in 2026 and answered within the year. Below the Graffiti anchor; the value is the clean witness.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14519",
      sourceName: "Perfect Divisibility, Linear Divisibility and Chair-Free Graphs",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "tournament-isomorphism-bounded-vc-dimension",
    fields: {
      name: "Neuen-Grohe Problem: Isomorphism of Tournaments with Bounded VC Dimension",
      shortName: "Tournament isomorphism, bounded VC",
      fieldGroup: "Theoretical computer science",
      field: "Graph isomorphism",
      statement:
        "Among classes of tournaments for which neither hardness nor polynomial-time solvability of isomorphism was known, bounded VC dimension stood out as an open problem of Neuen and Grohe. Resolved: isomorphism of tournaments of VC dimension $d$ is decidable in time $n^{O(d \\log d)}$, so automorphism groups of bounded-VC tournaments are computable in polynomial time; isomorphism of tournaments of bounded chromatic number is also polynomial-time decidable.",
      posedBy: "Daniel Neuen, Martin Grohe",
      yearPosed: null,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "argument",
      solveDate: "2026-08-14",
      model: "Claude Sonnet 5",
      modelMaker: "Anthropic",
      humanCollaborators: ["Simon Rassmann", "Pascal Schweitzer"],
      aiRole:
        "The statement of AI use names two specific steps: the proof of one preliminary lemma (the tournament VC-dimension lemma) was provided by Claude Sonnet 5, and the proof of a second bound was simplified by it. Named model-contributed lemmas inside a human-led argument.",
      aiContribution: "ai-co-developed",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14486, Rassmann-Schweitzer): the statement of AI use is verbatim, with the two lemmas identified by reference, and the abstract states the Neuen-Grohe attribution. The algorithm was not checked here. Days-old preprint, no independent review.",
      significance: 12,
      significanceNote:
        "A posed open problem in the graph-isomorphism literature after Babai's quasipolynomial breakthrough, from named experts, with a clean parameterized resolution. Specialist - just above the numbered-problem band.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14486",
      sourceName: "Isomorphism of tournaments with bounded VC dimension",
      renownLangs: 0,
    },
    links: [],
  },
  {
    slug: "pavez-signe-length-control-spanning-subdivisions",
    fields: {
      name: "Pavez-Signe's Length-Control Question for Spanning Subdivisions",
      shortName: "Balanced spanning subdivisions",
      fieldGroup: "Combinatorics",
      field: "Extremal graph theory - digraphs",
      statement:
        "Pavez-Signe (2024) conjectured a Dirac-type condition for spanning $H$-subdivisions and asked whether the subdivision paths can additionally be required to have similar lengths; Lee (2025) resolved the existence conjecture in the stronger digraph setting. Answered affirmatively with epsilon-room: for every $\\varepsilon > 0$ there is $C_0$ such that every $n$-vertex digraph $D$ with $n \\ge C_0 h$ and minimum semi-degree $\\delta^0(D) \\ge (1/2+\\varepsilon)n$ contains a spanning $H$-subdivision whose path lengths differ by at most one, for every digraph $H$ with $h$ arcs and no isolated vertices.",
      posedBy: "Matias Pavez-Signe",
      yearPosed: 2024,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-08-14",
      model: "ChatGPT 5.6",
      modelMaker: "OpenAI",
      humanCollaborators: ["Zhilan Wang", "Shuo Wei", "Jin Yan"],
      aiRole:
        "The acknowledgement states the authors used ChatGPT 5.6 to assist in the development of the probabilistic partition argument in one named lemma, plus language polishing, with all arguments independently verified by the authors.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2608.14432, Wang-Wei-Yan): the attribution chain (Pavez-Signe's conjecture and question, Lee's resolution of existence) is in the abstract, the answer carries an epsilon in the semi-degree threshold rather than the exact conjectured bound - hence Partial, and the paper's own closing question asks for the exact threshold - and the AI acknowledgement is verbatim as quoted. Not checked here; days old, no independent review.",
      significance: 8,
      significanceNote:
        "A 2024 question in the Dirac-type spanning-structures literature, answered in approximate form two years later. Real but young and specialist.",
      publication: "preprint",
      sourceUrl: "https://arxiv.org/abs/2608.14432",
      sourceName: "Nearly balanced spanning subdivisions in dense digraphs",
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
    for (const r of e.relations ?? []) {
      if (r.note.length > 200) {
        console.log(`  ${e.slug} relation note OVER BY ${r.note.length - 200}`);
        bad++;
      }
    }
  }
  if (bad) throw new Error("limits exceeded");

  for (const e of ENTRIES) {
    const existing = await prisma.problem.findUnique({ where: { slug: e.slug } });
    console.log(`\n### ${e.slug} ${existing ? "(EXISTS - skip)" : ""}`);
    console.log(`  ${e.fields.name}`);
    console.log(`  ${e.fields.solveType}/${e.fields.resolution} sig=${e.fields.significance} ai=${e.fields.aiContribution}`);
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
    // Relations second, after the row exists.
    for (const [position, r] of (e.relations ?? []).entries()) {
      const from = await prisma.problem.findUnique({ where: { slug: e.slug }, select: { id: true } });
      const to = await prisma.problem.findUnique({ where: { slug: r.toSlug }, select: { id: true } });
      if (!from || !to) throw new Error(`relation endpoint missing for ${e.slug}`);
      await prisma.problemRelation.create({
        data: { fromId: from.id, toId: to.id, kind: r.kind, note: r.note, position },
      });
    }
    console.log("  CREATED");
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`\ndone - ${published} published`);
}

main().finally(() => prisma.$disconnect());
