// Review of the "Petersen Coloring Conjecture" submission, 12 Aug 2026.
//
// Same shape as scripts/review-albertson-berman.ts.
//
// Verification done here: the 112-vertex graph was rebuilt from the paper's
// own appendix edge table, its SHA-256 digest reproduced against Theorem 1.1,
// its stated properties re-derived, and the non-existence of a Petersen
// coloring re-proved with an independently written CNF encoding solved by
// CaDiCaL through PySAT - not by replaying the paper's DRAT certificates.
// Five controls that must be colorable, including the Petersen graph itself
// (a snark, so it also rules out the encoding accidentally testing
// 3-edge-colorability), all came back SAT, which is what makes the UNSAT on
// the counterexample meaningful.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const SLUG = "petersen-coloring-conjecture";

const EDITS: Edit[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "Jaeger conjectured that every bridgeless cubic graph $G$ admits a Petersen coloring: a map $\\varphi\\colon E(G)\\to E(P)$ into the edges of the Petersen graph $P$ such that, for every vertex $v$ of $G$, the three edges at $v$ are sent to three edges meeting at a common vertex of $P$. Equivalently, by Jaeger's theorem, every bridgeless cubic graph has a normal 5-edge-coloring. The conjecture implies both the Berge-Fulkerson conjecture and the 5-cycle-double-cover conjecture. False: there is an explicit simple connected bridgeless cubic graph on $112$ vertices, of girth five and edge- and vertex-connectivity three, with no Petersen coloring.",
  },
  { field: "Year posed", key: "yearPosed", value: 1985 },
  {
    field: "AI role",
    key: "aiRole",
    value:
      'The paper\'s "Computational provenance and responsibility" section states in full: "OpenAI language-model systems were used extensively in the discovery, computational search, verification, and preparation of this work. The author reviewed the final claims and artifacts and accepts responsibility for the contents." No product name, model version or division of labour is given, so which of discovery, search, verification and write-up the model actually carried is not recoverable from the paper. The catalog records the model as ChatGPT because that is this catalog\'s convention for an unnamed OpenAI system; the paper itself names none.',
  },
  { field: "Verification", key: "verification", value: "site-confirmed" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced by this site on 12 August 2026, independently of the paper's certificates. The 112-vertex graph was rebuilt from the edge table in the paper's own appendix, and the SHA-256 digest of its normalized sorted edge list reproduces the digest in Theorem 1.1 exactly, which pins the object under review to the one the paper claims. Every property in that theorem re-derived here: 112 vertices, 168 edges, simple, cubic, connected, bridgeless, girth five, edge-connectivity three, vertex-connectivity three. Non-existence of a Petersen coloring was then re-proved with a CNF encoding written here from the definition - each edge carries one of the 15 edges of the Kneser graph KG(5,2), each vertex selects one of the 10 target stars, the three edges at a vertex land in that star and are pairwise distinct - and solved with CaDiCaL via PySAT. The result is UNSAT, so no Petersen coloring exists. This is a different route from the paper's: it re-derives the unsatisfiability rather than replaying the shipped DRAT certificates, and the encoding was written without reference to the paper's encoder, though it independently came out at the same 3640 variables. The controls matter as much as the result. K4, K3,3, the 3-cube, the prism, the Desargues graph and the Petersen graph itself were all put through the same encoder and all came back satisfiable. The Petersen graph control is the important one, since it is a snark, so a coloring found for it rules out the encoder having quietly tested 3-edge-colorability instead. As a further consistency check the graph was confirmed not 3-edge-colorable, which it must not be: every 3-edge-colorable cubic graph has a Petersen coloring, so any counterexample has to be a snark. What has not been checked here: the second, D3-symmetric counterexample H, the normal-5-edge-coloring formulation (equivalent by Jaeger's theorem, which the paper proves), and the shipped DRAT proofs themselves. arXiv preprint, four days old at review, not peer-reviewed and with no independent expert commentary yet.",
  },
  { field: "Significance", key: "significance", value: 40 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Jaeger's conjecture is one of the central conjectures on cubic graphs: the Open Problem Garden entry calls it an extraordinary conjecture, and it implies both the Berge-Fulkerson conjecture and the 5-cycle-double-cover conjecture, with a substantial literature on normal edge-colorings and sublinear approximations built around it. Placed above a well-tracked specialist conjecture and below the cycle double cover conjecture itself (55), which is more widely known outside the area.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Posed by Jaeger in 1985, in 'On five-edge-colorings of cubic graphs and nowhere-zero flow problems'; often cited as 1988 via his nowhere-zero flow survey. Open for 41 years, and verified by computer for all bridgeless cubic graphs up to 34 vertices, so a 112-vertex counterexample is well clear of the searched range.",
  },
  {
    field: "Renown note",
    key: "renownNote",
    value:
      "No Wikipedia article of its own, but it is a listed Open Problem Garden problem, standard background in the snark and cubic-graph literature, and the subject of a continuing stream of papers on normal edge-colorings.",
  },
  {
    field: "Result note",
    key: "resultNote",
    value:
      "The implication runs one way: the Petersen coloring conjecture implies Berge-Fulkerson and the 5-cycle-double-cover conjecture, so refuting it leaves both of those open. The paper does not claim 112 is minimum, and it supplies a second, nonisomorphic D3-symmetric 112-vertex counterexample. Combined with a theorem of Ma, Mattiolo, Steffen and Wolf, one counterexample yields infinitely many.",
  },
];

const LINKS = [
  {
    label: "Zenodo artifact record v1.1.0 (CNFs, DRAT certificates, hashes)",
    url: "https://doi.org/10.5281/zenodo.21845291",
    kind: "code",
  },
  {
    label: "Open Problem Garden: Petersen coloring conjecture",
    url: "http://www.openproblemgarden.org/op/petersen_coloring_conjecture",
    kind: "problem-record",
  },
  {
    label: "Ma, Mattiolo, Steffen, Wolf - Sets of r-graphs that color all r-graphs",
    url: "https://doi.org/10.1007/s00493-025-00144-4",
    kind: "paper",
  },
];

const MESSAGE = `Published as Resolved and moved up to Site-confirmed, because I re-proved it here rather than trusting the certificates.

I rebuilt the 112-vertex graph from the edge table in the paper's appendix. The SHA-256 of its normalized sorted edge list reproduces the digest in Theorem 1.1 exactly, so the object I tested is provably the one claimed, and every property in that theorem checks out: simple, cubic, connected, bridgeless, girth five, both connectivities three.

Then I wrote my own CNF encoding from the definition - each edge takes one of the 15 edges of KG(5,2), each vertex picks one of the 10 target stars, the three edges at a vertex land in that star and are pairwise distinct - and ran CaDiCaL through PySAT. UNSAT. That re-derives the unsatisfiability rather than replaying the shipped DRAT proofs. My encoding landed on the same 3640 variables as yours, which was reassuring.

The controls are what make this worth anything. K4, K3,3, the 3-cube, the prism, Desargues and the Petersen graph itself went through the same encoder and all came back satisfiable. The Petersen graph is the one that counts: it is a snark, so a coloring found for it rules out my encoder having quietly tested 3-edge-colorability instead. I also confirmed the graph is not 3-edge-colorable, which it had better not be.

Edits. The statement field was the abstract pasted in; I replaced it with the conjecture itself plus what it implies. Year posed 1988 to 1985, matching your own citation to Ars Combinatoria 20-B. Significance 40, above a specialist named conjecture since Jaeger's implies Berge-Fulkerson and 5-CDC, below cycle double cover. The result note now makes that implication's direction explicit: refuting Petersen coloring leaves both open.

Left at AI-co-developed. "Used extensively in the discovery, computational search, verification, and preparation" names discovery but does not say the model produced the counterexample, and an unspecific disclosure gets the lower tier here.

Not checked: the D3 second counterexample, the normal-5-edge-coloring formulation, the DRAT proofs. Excellent submission.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({
    where: { slug: SLUG },
    include: { links: true },
  });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];

  const fmt = (v: unknown) =>
    v === null || v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);

  for (const e of EDITS) {
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 100 ? `${s.slice(0, 100)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, aiContribution=${p.aiContribution}, model=${p.model}`);
  console.log(`\n  message (${MESSAGE.length} chars)\n`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: {
          deleteMany: {},
          create: LINKS.map((l, position) => ({ ...l, position })),
        },
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    ...(changes.length
      ? [
          prisma.problemActivity.createMany({
            data: changes.map((c) => ({
              problemId: p.id,
              userId: admin.id,
              userName: admin.pseudonym ?? null,
              type: "updated" as const,
              field: c.field,
              oldValue: c.oldValue,
              newValue: c.newValue,
            })),
          }),
        ]
      : []),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "approved",
      },
    }),
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "decision",
              reason: "edited",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
