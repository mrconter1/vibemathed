// BraveDingo215's numbered-list rewrite of the SSUF Part III statement, plus a
// reply. 13 Aug 2026.
//
// They asked for this because their list formatting collapsed into one run-on
// paragraph. That was a renderer bug - HTML eats newlines and `texToHtml` was
// passing them straight through - now fixed, so their original dashes would
// have worked too. The numbered list is applied anyway because it is what they
// asked for and it reads well either way.
//
// The separate complaint, that the edit form refused their result caveat as
// too long, was a stale deploy: that field's cap went 200 -> 1000 earlier the
// same day and their note is 900 characters. Nothing for them to compress.
//
// Four changes to their text, all typography inside math, all reversible:
// `>=` and `<=` become \ge and \le (the raw forms render literally, and they
// already use \le elsewhere in the same statement), `41*\sqrt{41}` loses its
// asterisk for \cdot, and `K*` becomes K^*.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "1-17353-planar-lower-bound-and-exact-local-envelopes-for-cost-preserving-single-";

const STATEMENT = String.raw`For a single-source unsplittable flow, find the optimal universal additive constant $C$ s.t. every feasible fractional flow $x$ with arc costs $c$ should admit an unsplittable routing $y$ with $c^\top y \le c^\top x$ and $y_a \le x_a + C \cdot D$ on every arc. We provide several new results on $C$: (1) record lower bound for planar instances (against known ceiling 2):
$$C \ge \frac{58676765987259}{50000000000000} = 1.17353531974518;$$
(2) local envelope ladder (proved): $E(2) = 1$, $E(3) = 9/8$, $E(4) = (299 - 41\cdot\sqrt{41})/32 = 1.13974707\ldots$, attained by the counterexamples from our previous work; record constants of our previous work are now exact local envelopes of the general theory;
(3) global results: every exact-two-path instance with rows touching at most three terminals satisfies $C \le 2$ (first unconditional constant for an unbounded class); interaction arity m gives $\lceil\lfloor 3m/2\rfloor /2\rceil \cdot D$;
(4) classes closed exactly: out-trees 0; two-layer hubs 1; outerplanar two-exit interval spines 1 (sharp); series-parallel $\le 1$;
(5) band merger constant $K^* \ge 2.5652\ldots$ (twice the general lower bound $1.2826\ldots$).`;

const REPLY = `Both done, and the second one was our bug rather than anything you needed to work around.

The line breaks were a renderer fault: HTML collapses newlines and the math renderer was passing them straight through, so any statement written as a list came out as one paragraph. It affected 13 statements, 10 AI-role notes and 8 verification notes, yours included. Fixed at the source - a blank line now renders as a paragraph gap, a single newline as a break, and breaks touching display math are dropped rather than doubled since KaTeX display is already a block. So your original dashes would have rendered correctly too. I applied your numbered list anyway, since you wrote it and it reads well.

Four small changes inside the math, all easy to revert if you disagree. Your $>=$ and $<=$ render literally as two characters, so they are now \\ge and \\le, matching the \\le you already use in the first sentence. The asterisk in $41*\\sqrt{41}$ became \\cdot, and $K*$ became $K^*$.

On the result caveat being rejected as too long: that was a stale deploy, not a limit you were hitting. That field used to be capped at 200 characters and labelled "Result qualifier", which is why yours read as roughly four times over - it is 900. Earlier today the cap went to 1000 and the label to "What was actually shown", because the field had long since outgrown its spec: 31 entries were over the old limit and the entry page has always given it its own prose section. Your edit landed in the few minutes before that deployed. It will accept the full text now, and nothing needs compressing.

Thanks for reporting both. The line-break one had been quietly mangling entries for a while and nobody had said so.`;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (!p?.statement) throw new Error("no entry or no statement");
  if (!p.submittedById) throw new Error("no submitter");

  const cap = LIMITS.get("statement")!;
  console.log(`statement: ${p.statement.length} -> ${STATEMENT.length} (cap ${cap})`);
  console.log(`  numbered items: ${(STATEMENT.match(/\(\d\)/g) || []).join(" ")}`);
  console.log(`  raw >= or <= left: ${/[<>]=/.test(STATEMENT)}`);
  console.log(`reply: ${REPLY.length} chars (max ${MESSAGE_MAX})`);
  if (STATEMENT.length > cap) throw new Error(`statement over by ${STATEMENT.length - cap}`);
  if (REPLY.length > MESSAGE_MAX) throw new Error(`reply over by ${REPLY.length - MESSAGE_MAX}`);

  const root = await prisma.directMessage.findFirst({
    where: { problemId: p.id, kind: "decision", userId: p.submittedById },
    orderBy: { createdAt: "asc" },
  });
  if (!root) throw new Error("no decision message to thread under");

  if (!APPLY) {
    console.log(`\n--- statement ---\n${STATEMENT}\n`);
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({ where: { id: p.id }, data: { statement: STATEMENT } }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "Statement",
        oldValue: p.statement,
        newValue: STATEMENT,
      },
    }),
    prisma.directMessage.create({
      data: {
        userId: p.submittedById,
        senderId: admin.id,
        senderName: admin.pseudonym ?? null,
        kind: "reply",
        body: REPLY,
        problemId: p.id,
        parentId: root.id,
      },
    }),
  ]);
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
