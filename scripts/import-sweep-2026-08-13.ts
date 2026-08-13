// Sweep of 10-13 Aug 2026: three entries.
//
// Five candidates survived triage of the 687 papers the finder scanned; two
// were dropped on reading the full text rather than the snippet, which is
// the same lesson as the last sweep:
//
//  - arXiv:2510.10272 (resolvent degree, Gomez-Gonzales). The AI mention is
//    an acknowledgement thanking two OTHER people "for pointing out
//    non-local improvements to the obliteration strategy found using the AI
//    tool Claude Fable 5". The paper makes no AI-use disclosure of its own,
//    the contribution is at one remove, and no named problem is resolved -
//    it improves a bound. Out of scope.
//  - arXiv:2603.16988 (Kochen-Specker, Kernaghan). The disclosure is
//    strong - "all computations, proofs, and manuscript text were generated
//    by a large language model (Claude, Anthropic) under the author's
//    direction", with three named verification layers - but the paper is a
//    computational survey that settles no named open question, and its own
//    abstract says "whether the three-mechanism classification is complete
//    remains open". It also refutes a pattern it had claimed in its own
//    versions 1-8, which is admirable and still not a catalog entry.
//
// Every disclosure quoted below was read out of the paper's own full text.
// For 2510.10272 that mattered twice over: the mention appears in v3 and not
// in the v2 HTML, so a single-version fetch would have missed it entirely.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Entry {
  slug: string;
  name: string;
  shortName: string;
  field: string;
  fieldGroup: string;
  statement: string;
  posedBy: string | null;
  yearPosed: number | null;
  solveType: string;
  solveDate: string;
  model: string;
  modelMaker: string;
  humanCollaborators: string[];
  aiRole: string;
  verification: string;
  verificationNote: string;
  publication: string;
  resolutionMethod: string;
  resolution: string;
  aiContribution: string;
  significance: number;
  significanceNote: string;
  resultNote: string;
  ageNote: string | null;
  renownLangs: number;
  sourceUrl: string;
  sourceName: string;
  links: { label: string; url: string; kind: string }[];
}

const ENTRIES: Entry[] = [
  {
    slug: "seymour-second-neighborhood-conjecture-dense-case",
    name: "Seymour's Second Neighborhood Conjecture",
    shortName: "Seymour 2nd neighborhood",
    field: "Graph theory",
    fieldGroup: "Combinatorics",
    statement:
      "Seymour conjectured that every finite oriented graph has a vertex with at least as many exact second outneighbors as outneighbors. Known cases include tournaments (Fisher 1996) and minimum outdegree at most six (Kaneko-Locke 2001), and for dense incomplete graphs a series of results restricting the structure of the missing edges. This work proves the conjecture for every oriented graph of order $n = 2\\delta + 2$, where $\\delta$ is the minimum outdegree, with no prescribed structure on the missing edges; with Fisher's tournament theorem this gives every oriented graph satisfying $n \\le 2\\delta + 2$.",
    posedBy: "Paul Seymour",
    yearPosed: 1990,
    solveType: "proved",
    solveDate: "2026-08-12",
    model: "GPT-5 family, Claude",
    modelMaker: "OpenAI, Anthropic",
    humanCollaborators: ["Jake Brukhman"],
    aiRole:
      'The acknowledgements are unusually specific about the division of labour: "The author initiated and directed the investigation, curated intermediate results, selected the theorem for publication, and edited the final statement and exposition. OpenAI language models (GPT-5 family) carried out the detailed mathematical exploration, implemented counterexample searches and verification tools, discovered the fixed-target capacity argument and its double-counting proof, and drafted the manuscript; Anthropic Claude models performed an adversarial audit of an intermediate draft and assisted with revisions. The author verified the proofs and accepts sole responsibility for the final manuscript and its claims." The model is credited with discovering the central argument by name, which is the discovered tier rather than the co-developed one.',
    verificationNote:
      "arXiv preprint, one day old at cataloguing, not peer-reviewed and with no independent commentary yet. The proof is described by the author as a short counting argument, so it is human-checkable in principle, but this site has not verified it and no expert has publicly endorsed it. What is unusually strong here is the disclosure rather than the verification.",
    verification: "unreviewed",
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "partial",
    aiContribution: "ai-discovered",
    significance: 30,
    significanceNote:
      "Seymour's second neighborhood conjecture is a well-known problem in digraph theory, open since around 1990 and the subject of a continuing literature - Fisher's tournament theorem, the minimum-outdegree results of Kaneko and Locke, and a decade of dense-case work by Fidler-Yuster, Ghazal and Dara-Francis-Jacob-Narayanan. Scored for the problem rather than this increment, level with the other well-tracked named conjectures and below the household ones.",
    resultNote:
      "A dense case, not the conjecture: it remains open in general. The concrete gain is on the size of any counterexample - combined with the known minimum-outdegree results, this raises the best known lower bound on the order of a counterexample from 16 to 17, and to 19 conditional on the 2026 preprint of Sadhukhan, Sandeep and Sen. The novelty against the earlier dense-case work is that no structure is prescribed on the missing edges.",
    ageNote:
      "Posed by Seymour around 1990 as a strengthening of Dean's conjecture for tournaments, and open for some 36 years. Fisher settled the tournament case in 1996.",
    renownLangs: 0,
    sourceUrl: "https://arxiv.org/abs/2608.11530",
    sourceName: "arXiv:2608.11530 - A dense-case theorem for Seymour's second neighborhood conjecture",
    links: [
      {
        label: "arXiv:2608.11530",
        url: "https://arxiv.org/abs/2608.11530",
        kind: "paper",
      },
    ],
  },
  {
    slug: "word-length-spectral-triples-compact-quantum-metric-spaces",
    name: "Word-length spectral triples as compact quantum metric spaces",
    shortName: "Word-length quantum metrics",
    field: "Operator algebras",
    fieldGroup: "Analysis",
    statement:
      "A countable discrete group with a proper length function carries a natural spectral triple on its reduced group C*-algebra. A well-studied question in non-commutative metric geometry asks whether the associated Connes pseudo-metric always recovers the weak-* topology on the state space, making it a compact quantum metric space in Rieffel's sense. It holds for groups of polynomial growth and for word-hyperbolic groups, and it was widely expected that not every word-length function works - but no explicit counterexample was known. False: for every integer $d \\ge 2$ the canonical spectral triple of the Lamplighter group $(\\mathbb{Z}/2\\mathbb{Z}) \\wr \\mathbb{F}_d$, with the word-length function of a finite symmetric generating set, fails to be a spectral metric space.",
    posedBy: "Marc Rieffel",
    yearPosed: 2002,
    solveType: "disproved",
    solveDate: "2026-08-12",
    model: "GPT-5.6 Sol",
    modelMaker: "OpenAI",
    humanCollaborators: ["Mario Klisse"],
    aiRole:
      'The acknowledgements state: "The author acknowledges the use of GPT-5.6 Sol as an exploratory tool to assist in finding the counterexample. The AI was used under the author\'s strict mathematical guidance. All mathematical content and arguments were rigorously reviewed, verified, and substantially revised by the author, who assumes full responsibility for the final manuscript." The model helped find the central object, which is an essential named step, but the framing is explicitly human-led and the author reports substantially revising everything - the co-developed tier rather than the discovered one.',
    verificationNote:
      "arXiv preprint, one day old at cataloguing, not peer-reviewed and with no independent commentary yet. This site has not verified the argument; unlike a finite counterexample, this one is an infinite family and an analytic failure of a topology-recovery property, so it is not settleable by computation.",
    verification: "unreviewed",
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    significance: 20,
    significanceNote:
      "A recognised open question in non-commutative metric geometry, sitting in Rieffel's compact-quantum-metric-space programme, where the positive cases (polynomial growth, word-hyperbolic) were known and the expected negative answer had resisted an explicit witness. Specialist, with no Wikipedia article of its own, so scored with the resolved named problems of a single subfield rather than the broadly tracked conjectures.",
    resultNote:
      "The first explicit counterexample rather than a first suspicion: the abstract is clear that the failure was widely expected and that what was missing was a witness. It gives an infinite family, one for each d >= 2, all Lamplighter groups over free groups.",
    ageNote:
      "The question belongs to Rieffel's compact quantum metric space programme, which dates to his 1998-2004 papers on group C*-algebras as quantum metric spaces; the entry uses 2002 for his 'Group C*-algebras as compact quantum metric spaces'. Sources vary on how to date the question itself, which was folklore in the area rather than a single numbered conjecture.",
    renownLangs: 0,
    sourceUrl: "https://arxiv.org/abs/2608.12080",
    sourceName:
      "arXiv:2608.12080 - Word-Length Spectral Triples of (Z/2Z) wr F_d Are Not Metric",
    links: [
      {
        label: "arXiv:2608.12080",
        url: "https://arxiv.org/abs/2608.12080",
        kind: "paper",
      },
    ],
  },
  {
    slug: "treglown-equitable-acyclic-colouring-conjecture",
    name: "Treglown's equitable acyclic colouring conjecture",
    shortName: "Treglown's conjecture",
    field: "Graph theory",
    fieldGroup: "Combinatorics",
    statement:
      "Treglown conjectured, in a complementary form, that for every positive integer $k$ every digraph $D$ with $\\min\\{d^+(v), d^-(v)\\} \\le k-1$ for all $v$ has an equitable acyclic $k$-colouring. This implies the acyclic colouring versions of the Hajnal-Szemeredi theorem for digraphs proved by Czygrinow, DeBiasio, Kierstead and Molla, which in turn imply the original Hajnal-Szemeredi theorem for graphs. Proved: a short reduction shows the conjecture follows directly from the original Hajnal-Szemeredi theorem, and a modification of it gives a polynomial-time algorithm for finding such a colouring.",
    posedBy: "Andrew Treglown",
    yearPosed: null,
    solveType: "proved",
    solveDate: "2026-08-12",
    model: "ChatGPT 5.6 Sol",
    modelMaker: "OpenAI",
    humanCollaborators: ["Louis DeBiasio", "Hal Kierstead"],
    aiRole:
      'The acknowledgements describe the model producing the argument and then correcting its own novelty claim: "The reduction given in this paper arose during a discussion between the first author and ChatGPT 5.6 Sol attempting to locate the bottleneck in extending the results of [3] to prove Conjecture 1.2. Instead of locating the bottleneck, the chatbot gave a clever proof which shows that Conjecture 1.2 reduces to the original Hajnal-Szemeredi theorem. After further discussion about the originality of this idea, the chatbot identified earlier work of Aboulker, Oijid, Petit, Rocton, and Simon" in which the reduction is implicit. The central idea of the paper came from the model, which places it at the discovered tier, with the caveat about priority recorded in the result note.',
    verificationNote:
      "arXiv preprint, one day old at cataloguing, not peer-reviewed. The authors are established researchers in the area and the paper is short, resting on a reduction to a classical theorem rather than new machinery, but this site has not verified it and no independent commentary exists yet.",
    verification: "unreviewed",
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    significance: 15,
    significanceNote:
      "A named conjecture whose truth implies the digraph acyclic-colouring analogues of Hajnal-Szemeredi, so it sits against a genuinely central classical theorem - but it falls to a short reduction rather than new machinery, and the reduction turns out to be implicit in existing literature. Scored with the resolved specialist problems rather than the long-standing named conjectures.",
    resultNote:
      "The honest reading, which the paper gives itself: the reduction is implicit in earlier work of Aboulker, Oijid, Petit, Rocton and Simon, and the model itself surfaced that reference when asked about originality. So this establishes the conjecture and supplies a polynomial-time algorithm, while the underlying idea is a rediscovery rather than a first. It is a striking record of a model producing an argument and then correcting the novelty claim made for it.",
    ageNote: null,
    renownLangs: 0,
    sourceUrl: "https://arxiv.org/abs/2608.12207",
    sourceName: "arXiv:2608.12207 - The Hajnal-Szemeredi theorem in digraphs revisited",
    links: [
      {
        label: "arXiv:2608.12207",
        url: "https://arxiv.org/abs/2608.12207",
        kind: "paper",
      },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  // Refuse to run if anything would collide, rather than half-importing.
  for (const e of ENTRIES) {
    if (await prisma.problem.findUnique({ where: { slug: e.slug } })) {
      throw new Error(`slug already exists: ${e.slug}`);
    }
    const dupe = await prisma.problem.findFirst({ where: { sourceUrl: e.sourceUrl } });
    if (dupe) throw new Error(`sourceUrl already in catalog (${dupe.slug}): ${e.sourceUrl}`);
  }

  for (const e of ENTRIES) {
    console.log(`${e.slug}`);
    console.log(`   ${e.name} - ${e.solveType}/${e.resolution}/${e.verification}/${e.aiContribution}, significance ${e.significance}`);
    if (!APPLY) continue;
    const { links, ...fields } = e;
    await prisma.$transaction([
      prisma.problem.create({
        data: {
          ...fields,
          status: "published",
          links: { create: links.map((l, position) => ({ ...l, position })) },
        },
      }),
      // Relation-connect and scalar foreign keys cannot be mixed in one
      // Prisma create, so the user goes in by connect too.
      prisma.problemActivity.create({
        data: {
          problem: { connect: { slug: e.slug } },
          user: { connect: { id: admin.id } },
          userName: admin.pseudonym ?? null,
          type: "created",
        },
      }),
    ]);
    console.log("   CREATED");
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`\ndone - ${published} published`);
}

main().finally(() => prisma.$disconnect());
