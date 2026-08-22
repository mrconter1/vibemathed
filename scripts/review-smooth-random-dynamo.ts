// Approve VibeGene's smooth random fast dynamo submission.
//
// Unusually little to correct. The submitter set variant rather than resolved,
// matching the sibling Niebel entry, wrote an aiRole that traces the actual
// provenance, and flagged the relationship to the entry already in the
// catalog. The classification was right on arrival.
//
// What changes: title casing to match the sibling; the statement rewritten to
// pose the problem rather than paste the abstract, which is how every other
// entry reads; posedBy tightened; significance set to 30, level with Niebel,
// since the two are complementary halves of the same open problem; and the
// relation the submitter described in a private note made into a real
// relation, which is the mechanism that survives on the page.
//
// Verified: arXiv:2608.20105, Keefer Rowan, 12pp, titled "An AI-discovered
// smooth random fast dynamo on T^3" with the comments field reading "AI
// discovered; human written", and the abstract ending "The central proof idea
// was generated autonomously by ChatGPT 5.6 Sol Ultra; the manuscript was
// written (and verified) by the author." ai-discovered is the paper's own word
// in its own title.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "smooth-random-fast-dynamo-on-the-three-torus";
const SIBLING = "autonomous-lipschitz-fast-dynamo-on-the-three-torus";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  name: "Smooth Random Fast Dynamo on the Three-Torus",
  shortName: "Smooth random fast dynamo",
  statement:
    "Arnold's fast-dynamo problem asks for a smooth divergence-free velocity field on $\\mathbb{T}^3$, chosen independently of the magnetic diffusivity, that drives exponential growth of the magnetic field at every sufficiently small diffusivity. This constructs a genuinely $C^\\infty$ field with that behaviour: random and time-dependent, refreshing iid on finite time blocks, for which the almost sure exponential growth rate is at least $1/2$ at each fixed small enough resistivity, with a time-uniform lower bound whose random prefactor has a resistivity-uniform inverse-moment bound. The field is neither autonomous nor deterministic, so Arnold's smooth autonomous problem on $\\mathbb{T}^3$ remains open.",
  posedBy: "Arnold's fast-dynamo problem (1994); the random formulation has no single named proposer",
  yearPosed: null,
  significance: 30,
  significanceNote:
    "Level with the Lipschitz autonomous entry at 30, deliberately: the two are complementary halves of one problem that has organised mathematical MHD for decades, each surrendering a different hypothesis, and neither is obviously the nearer miss. Arnold's problem carries a monograph and a sustained literature while staying invisible outside that community.",
  sourceName: "arXiv:2608.20105 - An AI-discovered smooth random fast dynamo on the three-torus",
  verificationNote:
    "Checked by this site on 22 August 2026 against the paper (arXiv:2608.20105, Keefer Rowan, 12pp): the abstract is as submitted, the paper is titled \"An AI-discovered smooth random fast dynamo on T^3\" and its comments field reads \"AI discovered; human written\", so the contribution tier is the author's own framing rather than an inference. The mathematics was not checked here. Days-old preprint, no independent review, and the result is recorded as a variant because the velocity field is random and time-dependent where Arnold's problem asks for an autonomous deterministic one.",
};

const RELATION_NOTE =
  "Complementary halves of Arnold's problem: Niebel keeps autonomy and determinism but only Lipschitz regularity, Rowan keeps C-infinity but goes random and time-dependent. Neither settles it.";

const DECISION = `Approved, and thank you - this is the most carefully prepared submission the site has had. You set variant rather than resolved, which is the call most submitters get wrong on a result this quotable, and your note on the relationship to the Niebel entry was accurate enough that I used it almost verbatim.

Five small changes, none of them disagreements. The title is now title-cased to match its sibling. The statement now poses the problem before describing the result, which is how the rest of the catalog reads; your text was the abstract, which is right for a paper and slightly wrong for an entry. posedBy is tightened. Significance is set to 30, level with Niebel, on the reasoning that the two are complementary halves of one problem and neither is obviously the nearer miss.

The one that matters: your relationship note was in the submitter field, which is private and never renders. I have made it a real relation between the two entries instead, so a reader arriving at either one sees the other and learns which hypothesis each surrenders. That is worth having on the page rather than in a note only reviewers read.

Verified before publishing: the paper is titled "An AI-discovered smooth random fast dynamo on T^3", its comments field reads "AI discovered; human written", and the abstract closes with the sentence you quoted. So ai-discovered is Rowan's own framing, not an inference, which is exactly the evidence this tier should rest on.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, name: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const sib = await prisma.problem.findUnique({ where: { slug: SIBLING }, select: { id: true, name: true } });
  if (!sib) throw new Error("sibling entry not found");

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      throw new Error(`${k} over by ${v.length - lim} (${v.length}/${lim})`);
    }
  }
  if (RELATION_NOTE.length > 200) throw new Error(`relation note over by ${RELATION_NOTE.length - 200}`);
  if (DECISION.length > MESSAGE_MAX) throw new Error(`decision over by ${DECISION.length - MESSAGE_MAX}`);

  console.log(`${SLUG} (${cur.status})`);
  console.log(`  name    : ${cur.name}\n         -> ${NEXT.name}`);
  console.log(`  relation: related -> ${sib.name.slice(0, 52)} (${RELATION_NOTE.length}/200 chars)`);
  console.log(`  ${Object.keys(NEXT).length} fields set, status -> published`);
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX} chars`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, status: "published", reviewedAt: new Date(), reviewMessage: DECISION } as never,
    }),
    prisma.problemRelation.create({
      data: { fromId: cur.id, toId: sib.id, kind: "related", note: RELATION_NOTE, position: 0 },
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: {
        userId: cur.submittedById!,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "decision",
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
