// Priority correction to the Borsuk N=63 entry, 12 Aug 2026.
//
// The submitter (WildWalrus807) reported after publication that the same
// result was obtained ~2.5 months earlier: github.com/maaxgrin/
// borsuk-63-counterexample, by Max Grinsztajn, with GPT-5.5 Pro assistance.
//
// Verified here rather than taken on trust:
//  - the repo is real and its GitHub creation date is 2026-05-26, which
//    unlike commit dates cannot be backdated; the 16-commit history over
//    26-27 May is coherent and includes a "Disclose GPT assistance" commit;
//  - the README states "The construction and proof were obtained with
//    assistance from GPT-5.5 Pro" and cites the same G2(4) lineage;
//  - the repo's exact verifier (pure Python over F16, read before running)
//    passes locally: "all exact verification checks passed";
//  - decisively, Terence Tao's optimization-problems ledger (constant 28a)
//    already lists the 63 bound as "[Gri2026] Grinsztajn, Max", citing that
//    repository as the current best - the canonical tracker records the May
//    result, not the August one.
//
// The catalog records problems first solved with AI in the loop, and both
// solves are AI-in-the-loop, so the entry is re-centred on the May solve:
// solve date, model, collaborator and source move to Grinsztajn's, and the
// Konz + Claude work becomes what it was - an independent rediscovery three
// months later, verified by this site in its own right and kept in the entry
// with links and credit.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "borsuk-conjecture-lowest-ever-counterexample-n-63";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "Borsuk's conjecture asked whether every bounded set in $\\mathbb{R}^n$ can be partitioned into $n+1$ subsets of smaller diameter. It is false in dimension 63: there is a set of 321 points in $\\mathbb{R}^{63}$ whose smaller-diameter subsets have at most 5 points, so at least $\\lceil 321/5\\rceil = 65 > 64$ parts are required. The previous record dimension was 64 (Jenrich-Brouwer, 2014), and the first failing dimension remains open for $4 \\le n \\le 62$. The construction modifies Bondarenko's $G_2(4)$ two-distance set: a 320-point rank-63 subconfiguration plus one added scaled projected point, which makes the set three-distance - precisely why it was not reachable inside the two-distance framework in which all previous work took place.",
  },
  { field: "Solve date", key: "solveDate", value: "2026-05-26" },
  { field: "Model", key: "model", value: "GPT-5.5 Pro" },
  { field: "Model maker", key: "modelMaker", value: "OpenAI" },
  { field: "Collaborators", key: "humanCollaborators", value: ["Max Grinsztajn"] },
  {
    field: "Source",
    key: "sourceUrl",
    value: "https://github.com/maaxgrin/borsuk-63-counterexample",
  },
  { field: "Source name", key: "sourceName", value: "Max Grinsztajn's proof note and certificates" },
  { field: "Publication", key: "publication", value: "preprint" },
  { field: "AI contribution", key: "aiContribution", value: "ai-assisted" },
  {
    field: "AI role",
    key: "aiRole",
    value:
      'For the first solve, Grinsztajn\'s README states: "The construction and proof were obtained with assistance from GPT-5.5 Pro", with a dedicated "Disclose GPT assistance" commit; no finer division of labour is given, so the tier is the floor for an unspecific disclosure. The independent August 2026 rediscovery by Nicholas Konz with Claude (Fable 5 and Opus 5) carries a much fuller disclosure - Claude produced the counterexample and an exact certificate over $\\mathbb{Q}(\\sqrt{222})$ - and would rate ai-discovered on its own, but the entry\'s tier follows the solve it records, which is the first one.',
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Both derivations reproduced by this site on 12 August 2026, independently of each other. For the first solve (Grinsztajn, May 2026): the repository's exact verifier - pure Python integer arithmetic over F16, read before running - was executed locally and passes all checks: it rebuilds the G2(4) strongly regular graph with parameters (416,100,36,20), the B1/B2/B3/C partition and degree data behind the dimension drop, and the clique obstructions forcing every smaller-diameter subset to size at most 5. The repo's GitHub creation date of 2026-05-26 is not forgeable after the fact, and Terence Tao's optimization-problems ledger (constant 28a) independently credits the 63 bound to Grinsztajn, citing this repository. For the August rediscovery (Konz + Claude): we ran the author's stand-alone verifier against the published 321x63 coordinate file and confirmed affine dimension exactly 63, the squared-distance spectrum (53-sqrt(222))/156, 1/4 and 1/3, and independence number 5 for the diameter graph by Bron-Kerbosch, forcing ceil(321/5) = 65 parts where Borsuk allows 64; the distance-class gap is far wider than any float tolerance. Neither write-up is peer-reviewed; neither is on arXiv.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Priority: the result was first obtained by Max Grinsztajn with GPT-5.5 Pro assistance, published 26 May 2026 and recorded as the current best bound on Tao's optimization-problems ledger. The same construction was found again independently in August 2026 by Nicholas Konz working with Claude, with a different derivation and a fuller AI disclosure; the two efforts were evidently unaware of each other, and the submitter of this entry surfaced the earlier work themselves after publication. Dimension 63 is the current record; whether Borsuk's conjecture fails for any dimension in 4..62 remains open.",
  },
  { field: "Significance", key: "significance", value: 30 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Borsuk's conjecture is a famous named problem with a Wikipedia article and a 90-year history; the conjecture itself was already refuted by Kahn-Kalai in 1993, so what this entry records is the current record for the smallest failing dimension, 64 to 63, a serious but incremental step on a well-known question (the record has moved six times since 1993). Scored level with the Hadamard order-668 construction: both are the current record instance of a famous conjecture rather than the conjecture itself.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Borsuk posed the conjecture in 1933; Kahn and Kalai refuted it in dimension 1325 in 1993. The record dimension stood at 64 from Jenrich-Brouwer (2014) until this construction (May 2026). The first failing dimension is open for 4 <= n <= 62.",
  },
];

const LINKS = [
  {
    label: "Grinsztajn's proof note, exact verifier and DIMACS certificates (first solve, May 2026)",
    url: "https://github.com/maaxgrin/borsuk-63-counterexample",
    kind: "code",
  },
  {
    label: "Tao's optimization-problems ledger, constant 28a - credits the 63 bound to Grinsztajn",
    url: "https://teorth.github.io/optimizationproblems/constants/28a.html",
    kind: "problem-record",
  },
  {
    label: "Independent rediscovery by Konz + Claude, August 2026: write-up, coordinates and verifier",
    url: "https://nickk124.github.io/borsuk/",
    kind: "independent",
  },
  {
    label: "Wikipedia: Borsuk's conjecture",
    url: "https://en.wikipedia.org/wiki/Borsuk%27s_conjecture",
    kind: "wikipedia",
  },
];

const REPLY_TO = "WildWalrus807";
const REPLY = `Thank you for surfacing this - you were right, and it took integrity to flag it against your own submission. I verified the priority claim before acting on it, since a repo can be backdated in its commits: GitHub's repository creation date cannot be, and it reads 2026-05-26. I also ran Grinsztajn's exact verifier locally (all checks pass, same G2(4) structure, same size-5 obstruction), and found that Tao's optimization-problems ledger already credits the 63 bound to "[Gri2026] Grinsztajn, Max", citing that repository. So the priority is real and independently recorded.

The entry is corrected accordingly. It now records the May 2026 Grinsztajn + GPT-5.5 Pro solve as the first, with solve date, model and source moved over, and the Konz + Claude work as what it turned out to be: an independent rediscovery three months later, still verified by this site in its own right, kept in the entry with an independent-work link and full credit in the notes. AI contribution moved to AI-assisted, because Grinsztajn's disclosure ("obtained with assistance from GPT-5.5 Pro") is unspecific and the tier follows the solve the entry records - the notes say explicitly that the Konz + Claude derivation would rate AI-discovered on its own.

Also filled the significance field (30) while I was in there, with a written rationale.`;

const COMMENT = `Priority correction: this result was first obtained by Max Grinsztajn with GPT-5.5 Pro assistance on 26 May 2026 (github.com/maaxgrin/borsuk-63-counterexample), roughly ten weeks before the Konz + Claude derivation this entry originally recorded. The submitter surfaced the earlier work themselves after publication. This site verified the priority claim (unforgeable repo creation date, exact verifier passes locally, and Tao's optimization-problems ledger already credits the bound to Grinsztajn) and re-centred the entry on the first solve. The Konz + Claude work remains in the entry as a verified independent rediscovery with a different derivation and a fuller AI disclosure.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({
    where: { slug: SLUG },
    include: { links: true },
  });
  if (!p) throw new Error(`no problem ${SLUG}`);

  const submitter = p.submittedById
    ? await prisma.user.findUnique({ where: { id: p.submittedById } })
    : null;
  if (submitter?.pseudonym !== REPLY_TO) {
    throw new Error(`submitter is ${submitter?.pseudonym}, expected ${REPLY_TO}`);
  }
  const rootMsg = await prisma.directMessage.findFirst({
    where: { problemId: p.id, kind: "decision", userId: p.submittedById! },
    orderBy: { createdAt: "desc" },
  });
  if (!rootMsg) throw new Error("no decision message to thread the reply under");

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

  console.log(`${SLUG}: priority correction\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 85 ? `${s.slice(0, 85)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  reply to ${REPLY_TO} (${REPLY.length} chars)`);
  console.log(`  comment (${COMMENT.length} chars)\n`);

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
      },
    }),
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
    prisma.directMessage.create({
      data: {
        userId: p.submittedById!,
        senderId: admin.id,
        senderName: admin.pseudonym ?? null,
        kind: "reply",
        body: REPLY,
        problemId: p.id,
        parentId: rootMsg.id,
      },
    }),
    prisma.comment.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        body: COMMENT,
      },
    }),
  ]);
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
