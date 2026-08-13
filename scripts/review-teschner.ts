// Review of the Teschner bondage-number submission, 13 Aug 2026.
//
// The counterexample is a single 18-vertex graph, so it was checked here in
// full rather than trusted. The edge list was transcribed from equation
// (3.1) of the preprint and everything else recomputed independently, with
// the paper's own verifier neither read nor run:
//
//   - the graph is connected, cubic, bipartite with the stated parts,
//     18 vertices and 27 distinct edges, so Delta = 3;
//   - gamma(G) = 6, by exhaustive search over subsets in increasing size;
//   - it has exactly 297 minimum dominating sets - the paper's stated count,
//     reproduced independently;
//   - every one of the 27 + 351 + 2925 + 17550 = 20,853 edge subsets of size
//     at most four leaves some minimum dominating set intact, so b(G) >= 5;
//   - deleting {06, 0-10, 0-16, 1-8, 1-11} raises the domination number to 7,
//     recomputed from scratch on the reduced graph rather than via the
//     bundle criterion, so b(G) <= 5.
//
// Hence b(G) = 5 > 4.5 = (3/2)Delta(G) and the conjecture is false. The
// lower-bound search is the whole content of the claim and it is finite, so
// this is a complete verification, not a spot check.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "teschner-s-bondage-number-conjecture";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Status", key: "resolution", value: "resolved" },
  { field: "Verification", key: "verification", value: "site-confirmed" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced in full by this site on 13 August 2026. The counterexample is a single 18-vertex graph, so the claim is finite and was checked exhaustively rather than sampled. The edge list was transcribed from equation (3.1) of the preprint and every quantity recomputed independently, without reading or running the author's own verifier. Confirmed: the graph is connected, cubic and bipartite with the stated parts, on 18 vertices and 27 distinct edges, so Delta(G) = 3; its domination number is 6 by exhaustive search over vertex subsets in increasing size; and it has exactly 297 minimum dominating sets, which is the count the paper states, arrived at here independently. For the lower bound, all 20,853 edge subsets of size at most four (27 + 351 + 2925 + 17,550) were tested by the bundle criterion, and every single one leaves at least one minimum dominating set intact, so b(G) >= 5. For the upper bound, deleting the five edges 0-6, 0-10, 0-16, 1-8 and 1-11 raises the domination number to 7, and that was recomputed from scratch on the reduced graph rather than inferred from the criterion, so b(G) <= 5. Therefore b(G) = 5 > 4.5 = (3/2)Delta(G) and Teschner's conjecture is false. The lower-bound enumeration is the entire mathematical content of the claim, so this constitutes a complete independent check. Caveats that remain: the preprint is two days old, is hosted on figshare rather than arXiv, and has no peer review; the author's acknowledgements name Eric Hou (UBC) as an independent verifier, but that is a private check recorded in the paper, not a public endorsement by a domination-theory specialist.",
  },
  { field: "Significance", key: "significance", value: 15 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named conjecture in domination theory, posed by Teschner in 1995 and carried as an open problem in Xu's 2013 bondage-number survey and on Wikipedia's bondage number article. Real and long-standing, but firmly within a specialist subfield: there is no Wikipedia article for the conjecture itself, and the surrounding literature is a corner of graph theory rather than a mainstream target. Scored with the resolved specialist problems near 15, well below the named conjectures with their own broad literature such as Albertson-Berman (30).",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Teschner's universal bound b(G) <= (3/2)Delta(G) is false: the 18-vertex cubic bipartite graph has b(G) = 5 against a bound of 4.5. What survives is the restricted statement Teschner actually proved, that the bound holds for graphs of domination number at most three, and Gagarin and Zverovich's 2013 result that it holds for almost all graphs. The counterexample does not suggest a replacement bound, and the correct general upper bound for b(G) in terms of Delta(G) remains open.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Fink, Jacobson, Kinch and Roberts introduced the bondage number in 1990 and conjectured b(G) <= Delta(G) + 1; Teschner disproved that in 1993 and proposed the weaker (3/2)Delta(G) bound in his 1995 Australasian Journal of Combinatorics paper, having proved it for domination number at most three. Open for 31 years.",
  },
  {
    field: "Renown note",
    key: "renownNote",
    value:
      "No Wikipedia article of its own; the conjecture appears in the Wikipedia article on the bondage number, which still described it as open when checked on 13 August 2026, and is stated as an open problem in Xu's 2013 survey.",
  },
];

const LINKS = [
  {
    label: "Yavari, A Counterexample to Teschner's Bondage-Number Conjecture (figshare preprint)",
    url: "https://doi.org/10.6084/m9.figshare.33198777",
    kind: "paper",
  },
  {
    label: "ChatGPT conversation in which the counterexample was produced",
    url: "https://chatgpt.com/share/6a7a08fe-9fd8-83e8-b3b4-392282dc501a",
    kind: "transcript",
  },
  {
    label: "Xu, On Bondage Numbers of Graphs: A Survey with Some Comments (2013)",
    url: "https://doi.org/10.1155/2013/595210",
    kind: "paper",
  },
  {
    label: "Gagarin and Zverovich, The bondage number of graphs on topological surfaces and Teschner's conjecture (2013)",
    url: "https://doi.org/10.1016/j.disc.2012.11.005",
    kind: "paper",
  },
  {
    label: "Wikipedia: Bondage number",
    url: "https://en.wikipedia.org/wiki/Bondage_number",
    kind: "wikipedia",
  },
];

const MESSAGE = `Published, and moved up two tiers: Resolved and Site-confirmed, because I was able to check the whole thing.

The counterexample is one 18-vertex graph, so the claim is finite and I verified it exhaustively rather than sampling it. I transcribed the edge list from equation (3.1) and recomputed everything myself, without reading or running the author's verifier. The graph is connected, cubic, bipartite with the stated parts, 27 edges, Delta = 3. Domination number 6 by exhaustive search. It has exactly 297 minimum dominating sets - the paper's own stated count, reached independently here, which is a good sign the two computations are of the same object.

Then the lower bound, which is the actual content: all 20,853 edge subsets of size at most four leave at least one minimum dominating set intact, so b(G) >= 5. And deleting 0-6, 0-10, 0-16, 1-8, 1-11 takes the domination number to 7, which I recomputed from scratch on the reduced graph rather than inferring from the bundle criterion. So b(G) = 5 > 4.5 and the conjecture is false. That enumeration is the entire mathematical claim, so this is a complete check rather than a spot check.

One correction to your note: the acknowledgements do name the verifier, Eric Hou at UBC. I still recorded it as a private check rather than a public endorsement by a domination-theory specialist, which I think is what you meant.

Your 1995 attribution was right and I kept it - reference [2] in the preprint is Teschner's Australasian J. Combin. 12 (1995) paper, matching Xu's survey. AI-discovered is right too; the disclosure says the counterexample "was generated using" GPT-5.6 Sol Max and that Yavari revised and edited afterwards, which is exactly that tier.

Added significance 15 with a rationale, result, age and renown notes, and links to Xu's survey, Gagarin-Zverovich and the Wikipedia article. Genuinely good submission - the note did most of my background work for me.`;

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
      s === null ? "(empty)" : s.length > 95 ? `${s.slice(0, 95)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: aiContribution=${p.aiContribution}, model=${p.model}, yearPosed=${p.yearPosed}`);
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
