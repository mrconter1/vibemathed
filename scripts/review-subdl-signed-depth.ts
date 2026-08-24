// Approve the subDL signed-depth-relevance submission, with the verification
// tier downgraded. 24 Aug 2026.
//
// Everything about the setup checks out. Ogaard's "subDL is Relevant" (JoLLI,
// published 16 March 2026, doi:10.1007/s10849-026-09462-2) exists and does
// exactly what the submission says: proves signed variable sharing AND depth
// relevance for subDL, leaving the combined signed-depth property open. The
// new paper closes it. Not a duplicate.
//
// The AI provenance is the cleanest this catalog has: the paper's AUTHOR LINE
// IS "GPT-5.6 Sol", dated 22 August 2026, with a footnote "Initially prompted
// by Ryan Simonelli." The model is not thanked in an acknowledgment - it is
// credited as the author. ai-discovered stands, and aiRole is expanded from
// the submission's four-word "Entirely constructed the proof" to record that
// evidence, because it is the strongest first-party AI attribution here.
//
// The downgrade: expert-verified -> unreviewed. That tier wants a named
// domain expert with no stake, checking AND endorsing, and the endorsement has
// to be something a reader can check - the Crouzeix entry sets the bar with a
// published essay saying in as many words that the proof was checked and
// believed correct. Here the submission asserts "The author of the paper in
// which the problem was posed has verified that the proof is correct", but the
// only public trace is the paper's own acknowledgment, which thanks Ogaard
// "for identifying the notational error concerning =>m and -> in an earlier
// draft and for pointing out the relation between the terminal clause and
// Brady's omega-rule". That documents real engagement - he read it closely
// enough to find an error - but it is not an endorsement of the final proof,
// and it is the opposite direction of evidence: it records him correcting a
// draft, not vouching for a result. The submitter is Simonelli himself and may
// well have that endorsement privately; privately is the problem.
//
// The verification note says precisely what Ogaard did do, so "unreviewed"
// here does not read as "nobody looked", which would be its own inaccuracy.
//
// solveDate 2026-08-04 kept despite the paper being dated 22 August: site
// convention is that the date records when the problem fell, not when the
// writeup appeared (see the Gromov entry), and the acknowledgment's reference
// to "an earlier draft" corroborates that drafts predate the 22 August
// version. Flagged in the decision message rather than changed silently.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "signed-depth-relevance-of-subdl";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  modelMaker: "OpenAI",
  verification: "unreviewed",
  verificationNote:
    "Filed as Unreviewed rather than the submitted Expert-verified, and the distinction is narrow enough to spell out. The paper's acknowledgments thank Tore Fjetland Øgaard - who posed the question, and so is both a named domain expert and a person with no stake in this proof - \"for identifying the notational error concerning $\\Rightarrow_m$ and $\\to$ in an earlier draft and for pointing out the relation between the terminal clause and Brady's $\\omega$-rule\". That is genuine engagement by the right person: he read it closely enough to catch an error. It is not an endorsement of the final proof, and it is the only publicly checkable trace of his involvement. The submission states that he has verified the proof correct; that may well be so, but it rests on a private communication a reader cannot follow, and the Expert-verified rung on this site requires a checkable endorsement (its worked example is a published essay stating outright that named experts checked a proof and believe it correct). This site checked the surrounding facts, not the mathematics: Øgaard's paper exists as cited and leaves exactly this question open, and the proof itself - five pages over the Anderson-Belnap matrix $M_0$ - was read but not audited.",
  aiRole:
    "The strongest AI attribution in this catalog, and it is not a disclosure statement but a byline: the paper's author line reads \"GPT-5.6 Sol\", dated 22 August 2026, with a single footnote - \"Initially prompted by Ryan Simonelli.\" The model is credited as the author of the paper, not thanked in an acknowledgment. The submitter, who is Simonelli, describes his own role as having prompted it and summarises the model's as having \"entirely constructed the proof\", which the byline corroborates rather than merely asserts. Øgaard is thanked separately for correcting a notational error in an earlier draft and for observing the connection to Brady's $\\omega$-rule.",
  significance: 7,
  significanceNote:
    "A question left open months earlier in a single 2026 paper (Øgaard, JoLLI, March 2026), inside a small but real research programme - Weber's paraconsistent mathematics, with a lineage running back through Brady, Logan and Anderson-Belnap. Sits with the 2026-posed cluster in this catalog: above the 4-5 band of one-off questions, level with Nathanson's product intersection problems and the dynamical-sampling conjecture at 8, below the Kourovka list problems at 13, which carry a named collection's standing that this does not.",
};

const LINKS = [
  {
    label: "Øgaard, subDL is Relevant (JoLLI, 2026) - where the question is posed",
    url: "https://doi.org/10.1007/s10849-026-09462-2",
    kind: "problem-record",
  },
];

const DECISION = `Published, with one downgrade and the blanks filled.

Verification goes from Expert-verified to Unreviewed, and this is the narrowest call on this queue, so here is the reasoning. Ogaard is exactly the right person - he posed the question, so he is a named expert with no stake in your proof - and the acknowledgments show he engaged seriously, catching a notational error in an earlier draft and spotting the Brady omega-rule connection. But that is the only publicly checkable trace, and it records him correcting a draft rather than vouching for the finished proof. Expert-verified here needs an endorsement a reader can follow to its source; the worked example is a published essay saying in as many words that named experts checked a proof and believe it correct. Your statement that he verified it may well be accurate - I have no reason to doubt it - but it currently lives in a private exchange.

That is a one-message fix: if Ogaard is willing to be quoted, or says so anywhere public, send it and the tier moves the same day.

The verification note records exactly what he did do, so Unreviewed does not read as "nobody looked", which would be its own distortion.

Everything else checked out. Ogaard's paper exists as cited (JoLLI, 16 March 2026) and leaves exactly this question open. And the AI attribution is the strongest in this catalog - not a disclosure paragraph but a byline: the author line is "GPT-5.6 Sol", with your prompting in a footnote. I expanded the four-word AI-role note to record that, because a model credited as author is worth a reader seeing. AI-discovered stands as you set it.

Noticed but not changed: the paper is dated 22 August, your solved date 4 August. Kept yours - the convention here dates when the problem fell, not when the writeup appeared. Say if you meant the paper's date.

Also filled: model maker, significance 7, and a link to Ogaard's paper.`.trim();

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, verification: true, significance: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  verification : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +${LINKS.length} link, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: DECISION,
        reviewReason: "downgraded",
        links: { create: LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
      } as never,
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
        reason: "downgraded",
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
