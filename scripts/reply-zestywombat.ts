// Reply to ZestyWombat854, 13 Aug 2026: the certificate re-check, plus an
// answer to the general question about DRAT proofs too large to distribute.
//
// The policy answer is not invented for the occasion - it is what actually
// earned the Petersen coloring entry its tier three days ago. That paper
// shipped DRAT certificates and this site did not replay them; it wrote an
// independent encoding and re-derived UNSAT, landing on 31,360 clauses
// against the paper's 68,324 at the same variable count. That is the
// difference worth naming: replaying a proof shows their CNF is
// unsatisfiable, while writing your own encoder and getting UNSAT shows the
// mathematics is right.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path";
const REPLY_TO = "ZestyWombat854";

const REPLY = `Re-checked, and the entry is amended: the SAT claim is now substantiated.

I did not replay your DRAT files - replaying a proof you shipped is the weaker check. Instead I re-solved all twelve CNFs with CaDiCaL via PySAT, and every verdict matches your kissat logs: SAT at n = 2b-2, UNSAT at n = 2b-1, for every b = 2..7. I also substituted the six witnesses back into their CNFs clause by clause - all satisfy - and the b = 3 legs agree with the exhaustive enumeration from the original review, which is the useful part: it anchors your encoder against a computation made independently of it.

The regenerated-not-original point costs you nothing, and thanks for volunteering it: I re-derived the verdicts from the instances rather than reading them off your files.

On the 50-100GB question. Do not ship the proof - nobody will check a 100GB DRAT and hosting it buys nothing. Ship what regenerates it: a deterministic encoder, the pinned solver version and command line, and the SHA-256 of each CNF. The hash is load-bearing: it pins which instance you solved, so a later checker with the disk reproduces both CNF and proof and knows they match. Record the drat-trim verdict line verbatim too.

Then the thing that actually moves an entry up a tier: a second independent route to the same conclusion, at a size someone can run. The Petersen coloring entry is the precedent - it shipped DRAT certificates and I never replayed them, writing my own encoding from the definition instead and getting UNSAT at 31,360 clauses against their 68,324. Replaying a proof shows their CNF is unsatisfiable; writing your own encoder and getting UNSAT shows the mathematics is right.

So for your three big instances: an independently written second encoding, a reduction that shrinks them, or exhaustive verification of the smallest case - exactly what your b = 3 leg did here. Any of those is worth more than the 100GB. Without one the entry stays honest at Unreviewed; with one it can reach Site-confirmed.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (!p?.submittedById) throw new Error("no submitter on the entry");
  const submitter = await prisma.user.findUnique({ where: { id: p.submittedById } });
  if (submitter?.pseudonym !== REPLY_TO) {
    throw new Error(`submitter is ${submitter?.pseudonym}, expected ${REPLY_TO}`);
  }
  const root = await prisma.directMessage.findFirst({
    where: { problemId: p.id, kind: "decision", userId: p.submittedById },
    orderBy: { createdAt: "asc" },
  });
  if (!root) throw new Error("no decision message to thread under");

  console.log(`reply to ${REPLY_TO} on ${SLUG}`);
  console.log(`  ${REPLY.length} chars (max ${MESSAGE_MAX})`);
  if (REPLY.length > MESSAGE_MAX) throw new Error(`over by ${REPLY.length - MESSAGE_MAX}`);
  if (!APPLY) {
    console.log("\n" + REPLY + "\n");
    console.log("DRY RUN - pass --apply to write");
    return;
  }
  await prisma.directMessage.create({
    data: {
      userId: p.submittedById,
      senderId: admin.id,
      senderName: admin.pseudonym ?? null,
      kind: "reply",
      body: REPLY,
      problemId: p.id,
      parentId: root.id,
    },
  });
  console.log("SENT");
}

main().finally(() => prisma.$disconnect());
