// Review of the Albertson-Berman submission pending on 12 Aug 2026.
//
// Same shape as scripts/review-batch-2026-08-12.ts: field edits are logged as
// "updated" activity, the decision flips `status` and writes the review
// fields, an "approved" activity row is added, and the submitter gets a
// "decision" direct message. `updateTag` is a Next.js runtime API and cannot
// be called from here; every affected read is `cacheLife("minutes")`.
//
// The verdict is not a judgement call. The refutation is one finite graph, so
// it was rebuilt from the paper's definitions and its induced-forest number
// computed exactly by two independent methods, both giving a(T) = 15 against
// the 15.5 the conjecture demands. The author's own script never does this -
// it certifies the gadget profile and the sphere structure and takes a(T)
// from the symbolic transfer law.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Edit {
  field: string; // human label, as the changelog shows it
  key: string; // Prisma column
  value: unknown;
}

const SLUG = "albertson-berman-induced-forest-conjecture";

const EDITS: Edit[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "Albertson and Berman conjectured that for every simple planar graph $G$ on $n$ vertices, the largest vertex set inducing a forest has size at least $n/2$. The standing lower bound since the same year has been Borodin's $2n/5$, from his acyclic five-colour theorem. False: there is an explicit $31$-vertex simple $3$-connected maximal planar graph $T$ whose largest induced forest has exactly $15$ vertices, and an infinite family $M_k$ on $31k$ vertices with induced-forest number exactly $15k$, giving the ratio $15/31 < 1/2$ even for triangulations of minimum degree five.",
  },
  { field: "Status", key: "resolution", value: "resolved" },
  { field: "Verification", key: "verification", value: "site-confirmed" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced by this site on 12 August 2026. The refutation is a single finite object, so it is checkable outright rather than on trust. We rebuilt the 31-vertex seed T from the paper's own definitions - the 14-vertex gadget's cyclic neighbour lists, the pentagonal-bipyramid base, the decorated rim edges 01 and 23, the stated vertex labelling, and the two completion edges 6-12 and 6-20 - without running the author's code. That yields a simple 3-connected planar graph with 31 vertices and 87 = 3n-6 edges, hence a triangulation, with the paper's degree multiset 4^1 5^17 6^6 7^7. Its maximum induced forest was then computed exactly by two independent algorithms: an ILP with lazy cycle-elimination cuts, and a branch-and-bound minimum feedback vertex set with no LP involved. Both give a(T) = 15, equivalently a minimum feedback vertex set of exactly 16, against the 15.5 the conjecture requires. We separately brute-forced the two finite inputs to the symbolic argument - the terminal profile (6,6,6,5) over all 2^12 internal subsets, and beta = 3 over all 2^7 subsets of the seven-vertex core - and confirmed that J plus the edge bf is the icosahedral graph, that the paper's 15-vertex witness induces the stated path, and that M_k for k = 2..5 is planar on 31k vertices with 93k-6 edges, minimum degree five, and every seed induced. Worth noting what the author's shipped verifier does not do: it certifies the gadget embedding, the profile, beta and the sphere certificates, but it never computes a(T) or a(M_k) and says so. That computation is the one this site supplied. The preprint is not peer-reviewed, is not on arXiv, and no independent expert has reviewed it; site-confirmed here means the counterexample is finite and we checked it ourselves, not that the community has weighed in.",
  },
  { field: "AI contribution", key: "aiContribution", value: "ai-co-developed" },
  {
    field: "AI role",
    key: "aiRole",
    value:
      'The paper\'s "Acknowledgments and AI disclosure" section states that the two-terminal gadget "was discovered, and substantial parts of the proof strategy were developed, through interaction with OpenAI GPT-5.6 Sol", while the author "selected the research problem, directed the computational search and subsequent proof development, and checked the resulting mathematical arguments and computational certificates". GPT-5.6 Sol also assisted in preparing the manuscript and the verification code.',
  },
  { field: "Model maker", key: "modelMaker", value: "OpenAI" },
  { field: "Collaborators", key: "humanCollaborators", value: ["Heejae Jung"] },
  { field: "Publication", key: "publication", value: "preprint" },
  {
    field: "Source name",
    key: "sourceName",
    value:
      "Zenodo - A 15/31 Family of Maximal Planar Graphs Disproving the Albertson-Berman Conjecture",
  },
  { field: "Significance", key: "significance", value: 30 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named 1979 conjecture carried on the standard open-problem pages for planar graphs (Bojan Mohar's list, Douglas West's list), with a continuing literature on partial cases - girth 4 and 5, triangle-free, bipartite, 2-outerplanar, multigraphs - and a gap between the conjectured n/2 and Borodin's 2n/5 that stood for 47 years. Placed above a specialist named conjecture such as Simon's extendable shellability (25) because it is older and more widely tracked, and well below a household problem such as the cycle double cover conjecture (55).",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Posed in 1979 and open for 47 years. A paper on the same quantity, Makarov's Large induced forests in planar multigraphs, still described the conjecture as open in its revision of 9 August 2026, two days before this preprint appeared.",
  },
  {
    field: "Renown note",
    key: "renownNote",
    value:
      "No Wikipedia article, but the conjecture appears on both Bojan Mohar's and Douglas West's open-problem pages for planar graphs and is cited by name in the current literature.",
  },
  {
    field: "Result note",
    key: "resultNote",
    value:
      "The ratio 15/31 is not claimed to be optimal, and the paper makes no claim that 31 vertices is the smallest possible counterexample. The construction produces separating triangles by design, so it says nothing about the 4-connected case.",
  },
];

const LINKS = [
  {
    label: "Preprint PDF",
    url: "https://zenodo.org/records/21883880/files/Disproving_the_Albertson_Berman_Conjecture.pdf",
    kind: "paper",
  },
  {
    label: "Author's verification script",
    url: "https://zenodo.org/records/21883880/files/verify_stronger_ab_family.py",
    kind: "code",
  },
  {
    label: "Mohar's open problem list: induced forests in planar graphs",
    url: "https://www.sfu.ca/~mohar/Problems/P0208InducedForestPlanar.html",
    kind: "problem-record",
  },
  {
    label:
      "Makarov, Large induced forests in planar multigraphs - calls the conjecture open, revised 9 Aug 2026",
    url: "https://arxiv.org/abs/2601.04637",
    kind: "other",
  },
];

const MESSAGE = `Published, and this one got the full treatment because the claim is large: a 47-year-old conjecture, refuted in an unrefereed preprint that nobody has cited yet.

The good news is that it holds up. The refutation is one finite graph, so I did not have to trust the write-up. I rebuilt the 31-vertex seed from the paper's own definitions - gadget neighbour lists, pentagonal bipyramid, decorated edges 01 and 23, the labelling, the two completion edges - without running the author's code, and then computed its maximum induced forest exactly by two independent algorithms: an ILP with lazy cycle cuts, and a branch-and-bound minimum feedback vertex set with no LP anywhere in it. Both say a(T) = 15. The conjecture needs 15.5. That single graph refutes it; the M_k family only widens the deficit.

That is worth stressing because the author's own verifier does not do this. It checks the gadget profile, beta, and the sphere certificates, and it is explicit that it never computes a(T). So the one computation the claim actually rests on was missing from the bundle. It checks out, but somebody had to run it.

Three edits worth flagging:

Verification is now Site-confirmed, not Unreviewed - earned by the reproduction above rather than claimed.

Status moved from Candidate to Resolved. A finite counterexample that verifies is not a candidate.

AI contribution moved from AI-discovered down to AI-co-developed. The disclosure credits the model with the gadget and "substantial parts of the proof strategy", but says the author selected the problem and directed the search and the proof development. That is a named essential step inside a human-led proof, which is the co-developed tier. Site policy is that a disclosure gets read at face value and the lower tier when it is not clear-cut.

I also added the author as a collaborator, set significance to 30, and attached the Mohar problem page plus the verifier.

Good submission. Thank you.`;

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

  for (const e of EDITS) {
    const before = row[e.key];
    const fmt = (v: unknown) =>
      v === null || v === undefined
        ? null
        : Array.isArray(v)
          ? v.join(", ")
          : String(v);
    if (fmt(before) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(before), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 110 ? `${s.slice(0, 110)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`\n  message (${MESSAGE.length} chars):`);
  console.log(MESSAGE.split("\n").map((l) => `    ${l}`).join("\n"));
  console.log();

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
    // sendDirectMessage skips delivery when there is no account behind the
    // submission; the same guard belongs here rather than a non-null cast.
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
