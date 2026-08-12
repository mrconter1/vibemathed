// Correction to the Hadamard 668 entry, same day as its review.
//
// The review published it as Candidate/Unreviewed with a claim-issue flag,
// because the announcement's sign string contained no order-668 seed in any
// standard encoding and roughly 19k of its characters were undecoded. A
// reader (LucidHawk551, the submitter) then pointed at what was missed:
// Alpoge's REPLY to his own post is a sed-obfuscated decoder for the payload.
//
// Reproduced here from primary sources, not from the reader's account: the
// thread was pulled via a mirror, the decoder reply extracted, its sed
// transformation reimplemented in Python, the decoded shell script READ
// before running (pure sed/sh text manipulation, no network, writes only
// /tmp), then run on the 23,828-sign payload. It emits twelve blocks; the
// header table inside the decoder lists twelve records whose builder-g
// entries are exactly the four Goethals-Seidel orders the review had already
// found raw in the string, cross-validating both decodings. Every block was
// verified in exact integer arithmetic: entries in {-1,+1} and H H^T = nI
// for n = 668, 716, 892, 1132, 1244, 1388, 1436, 1676, 1772, 1916, 1948,
// 1964 - all twelve previously-open admissible orders below 2000.
//
// So the entry's own claim now verifies, the claim-issue flag comes off,
// and the tier moves to site-confirmed / resolved. AI contribution stays
// ai-assisted: the thread's credit line ("weekend fun w @tehwalris, Saul
// Reynolds-Haertle, and of course claude:)) i only claim bad suggestions!!")
// corroborates the collaborators but still says nothing about which steps
// were Claude's.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "hadamard-matrix-of-order-668";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Status", key: "resolution", value: "resolved" },
  { field: "Verification", key: "verification", value: "site-confirmed" },
  { field: "Claim issue", key: "claimIssueNote", value: null },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Fully reproduced by this site on 12 August 2026, in two passes. The announcement is a single X long-post holding 23,828 characters of \"+\" and \"-\": no prose, no separators. The first pass scanned the raw string for standard seed shapes and found three consecutive Goethals-Seidel quadruples (orders 892, 1132, 1244), verified exactly, but no order-668 seed - correctly, it turns out, because the payload is not a seed list. The key the first pass missed is that Alpoge's own reply to the post is a decoder: a sed-obfuscated shell script whose header table declares twelve records and five builder routines. This site reimplemented the reply's sed transformation in Python, read the decoded script before executing anything (it is pure sed/sh text manipulation - no network, writes only under /tmp), and ran it on the payload. It emits twelve sign blocks. The decoder's own header table independently names the four Goethals-Seidel orders the raw scan had already found, cross-validating both decodings. Every block was then checked in exact integer arithmetic: entries in {-1,+1} and H H^T = nI on the nose, for n = 668, 716, 892, 1132, 1244, 1388, 1436, 1676, 1772, 1916, 1948 and 1964 - which is all twelve previously-open admissible orders below 2000, exactly as the thread claims. The order-668 matrix in particular has diagonal 668 everywhere and maximum absolute off-diagonal entry 0. The submitter reports an equivalent independent reproduction; theirs and ours were done separately. No independent expert review or published write-up exists yet, and site-confirmed here records this site's own exact-arithmetic reproduction, not community acceptance.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Explicit construction of a Hadamard matrix of order 668, the smallest previously unresolved order, verified exactly by this site from the announcement plus its decoder reply. The same post encodes matrices for all twelve previously-open admissible orders below 2000 (668, 716, 892, 1132, 1244, 1388, 1436, 1676, 1772, 1916, 1948, 1964), and this site verified every one of them. The entry records the order-668 existence question, which this fully resolves; the general Hadamard conjecture - existence for ALL admissible orders - remains open, with the smallest unknown order now 2004 or beyond.",
  },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      'The announcement itself is a bare sign string, but Alpoge\'s thread carries a credit line: "weekend fun w @tehwalris, Saul Reynolds-Haertle, and of course claude:)) i only claim bad suggestions!!" - which corroborates the three named collaborators (@tehwalris is Philippe Voinov) and confirms Claude was part of the working group, with Alpoge playfully disclaiming the good ideas. Which mathematical, computational or search steps were Claude\'s is still not stated anywhere, and no model version is given, so the tier stays at the floor the methodology prescribes for an unspecific disclosure.',
  },
];

const REPLY_TO = "LucidHawk551";
const REPLY = `You were right, and the entry is now corrected: Resolved, Site-confirmed, claim-issue flag removed.

I did not take the report on trust, in fairness to both of us. I pulled the thread through a mirror, extracted Alpoge's decoder reply myself, reimplemented its sed layer in Python, read the decoded script before running anything, and ran it on the 23,828-sign payload. First output block: 668 lines of 668 signs. HH^T = 668I exactly, entries all in {-1,+1}, max off-diagonal 0.

I went further than 668: the decoder's header table declares twelve records, and all twelve blocks verify exactly - orders 668, 716, 892, 1132, 1244, 1388, 1436, 1676, 1772, 1916, 1948, 1964. That is every previously-open admissible order below 2000, precisely as Alpoge's thread claims. Satisfying detail: the header's builder-g records are exactly the four Goethals-Seidel orders I had found raw in the string during the first review, so the two decodings cross-validate.

One note for the record: your .npy SHA-256 (d91e1228...) does not match mine (8e20bc5d...). Both matrices verify, so nothing hangs on it, but if you want to compare artifacts we would need to agree a canonical serialization first - the sign-row text itself would be better than .npy bytes.

Your explanation of my miss was also exactly right: the payload is decoder input, not a seed list, which is why no standard order-167 seed shape appears in it. Thanks for pushing on this - the entry is materially better for it.`;

const COMMENT = `Update from review: the entry has been corrected to Resolved / Site-confirmed. Alpoge's reply to his own announcement is a decoder for the sign string; this site reproduced the decode independently and verified all twelve emitted matrices in exact integer arithmetic, including the order-668 one (HH^T = 668I exactly).

On the Partial question raised here: LucidHawk551 has it right. This entry records the existence of a Hadamard matrix of order 668, and that question is fully resolved by the construction, so Resolved is the accurate status. The general Hadamard conjecture - existence for every admissible order - is a different, broader problem that remains open (the smallest unknown order is now 2004 or beyond), and the entry's result note says so explicitly.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "published") throw new Error(`${SLUG} is ${p.status}`);

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

  console.log(`${SLUG}: correction\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(cleared)" : s.length > 90 ? `${s.slice(0, 90)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  reply to ${REPLY_TO} (${REPLY.length} chars), threaded under ${rootMsg.id}`);
  console.log(`  comment on the entry (${COMMENT.length} chars)\n`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({ where: { id: p.id }, data }),
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
