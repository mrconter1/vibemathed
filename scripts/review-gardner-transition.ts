// Approve the Gardner transition submission as a candidate, with a claim-issue
// flag and the contribution tier lowered one rung. 25 Aug 2026.
//
// This is the first entry in the catalog where the AUTHOR HIMSELF disclaims
// having checked the load-bearing mathematics, and that fact drives the whole
// review.
//
// Source verified: arXiv:2608.06523v1 [math.PR], 6 Aug 2026, "On the Gardner
// Transition in the Ising Pure p-Spin Glass II", Yuxin Zhou, sole author, 166
// pages. Sequel to the same author's arXiv:2408.14630. Not a duplicate.
//
// The acknowledgment, quoted verbatim from the paper: "The proofs in the
// appendix were drafted by large language models and have not yet received
// their final authorial revision. The author will carefully verify, revise,
// and rewrite these proofs in a subsequent version and assumes full
// responsibility for their correctness and presentation."
//
// So the AI role is disclosed and substantive - drafting proofs is
// mathematics, not copy-editing - and the entry is in scope. But no model is
// named anywhere, which is why the model field honestly reads "not explicitly
// stated" rather than guessing one.
//
// Structure checked, because the submission's justification for
// ai-discovered rested on it. The claim that "the 10 page main paper only
// contains introduction and statement of the result" is overstated - sections
// 3 and 4 are titled "Proof of 1-RSB Phase" and "Proof of FRSB Phase" and do
// carry the argument skeleton. But the substance of that skeleton is deferred:
// of 166 pages, roughly 11 are main body and 155 are appendices A-G, and the
// main body says of its key inputs "Its full proof is included in Appendix B"
// and "Its complete proof is included in Appendix C". So the load-bearing
// proofs really are the LLM-drafted, author-unverified ones.
//
// aiContribution ai-discovered -> ai-co-developed. The disclosure credits the
// models with DRAFTING the appendix proofs, not with finding the strategy,
// locating the second critical temperature, or designing the programme - this
// is part II of the author's own line of work, continuing his own paper I, and
// the abstract's framing is "we determine the rest of the phase diagram".
// Substantial AI labour on the hardest technical parts of a human-designed
// programme is co-development. The site's rule is to take the disclosure at
// face value and give a vague one the lower tier; this one is specific about
// drafting and silent about discovery.
//
// claimIssueNote ADDED, and this is the point of the entry. The field exists
// for "a documented problem with the claim itself - rare, loud", and an author
// stating in print that the proofs carrying his theorem have not yet been
// verified by him is exactly that. resolution stays candidate, which the
// submitter had already set correctly and unprompted.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "the-gardner-transition-in-the-ising-pure-p-spin-glass";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  field: "Spin glasses; probability",
  posedBy: "Elizabeth Gardner",
  resolutionMethod: "argument",
  aiContribution: "ai-co-developed",
  statement:
    "For the Ising pure $p$-spin glass with $p\\ge3$, Gardner predicted in 1985 that the Parisi measure passes through two transitions as the inverse temperature $\\beta$ grows: replica symmetric (RS), then one-step replica symmetry breaking (1-RSB), then full replica symmetry breaking (FRSB). The author's earlier paper established the RS phase for $0<\\beta\\le\\beta_1^p$ and the 1-RSB phase on a nonempty interval immediately above $\\beta_1^p$, leaving the rest of the phase diagram open. This sequel claims the remainder: a unique second critical inverse temperature $\\beta_2^p>\\beta_1^p$, with the measure 1-RSB throughout $\\beta_1^p<\\beta\\le\\beta_2^p$, and for $\\beta>\\beta_2^p$ supported on $\\{0\\}\\cup[\\underline q,\\overline q]$ with a smooth density on the interior, hence FRSB.",
  claimIssueNote:
    "The author states in the paper's acknowledgments that the appendix proofs \"were drafted by large language models and have not yet received their final authorial revision\", and that he will \"verify, revise, and rewrite these proofs in a subsequent version\". Those appendices are where the theorem's weight sits: of 166 pages roughly 11 are main body and 155 are appendices A-G, and the main body defers its key inputs to them explicitly (\"Its full proof is included in Appendix B\", \"Its complete proof is included in Appendix C\"). So the load-bearing proofs are, by the author's own account, not yet checked by anyone - not by him, not by a referee, and not by a machine. That is unusually candid and it is why this is filed as a candidate rather than resolved.",
  verificationNote:
    "Nobody has checked this, including the author, who says so himself - see the claim-issue note. An arXiv preprint (v1, 6 August 2026, math.PR), unrefereed, with no formalization and no computational certificate, so there is nothing mechanical to check either. Verified here on 25 August 2026: the paper exists at arXiv:2608.06523 with the title, sole author and phase-diagram statement this entry describes; its acknowledgment carries the LLM-drafting disclosure quoted verbatim above; its sequel relationship to the author's arXiv:2408.14630 is as described; and the page structure supports the claim that the appendices carry the substance. No model is named anywhere in the paper, which is why the model field says so rather than guessing.",
  significance: 28,
  significanceNote:
    "A 1985 prediction of Elizabeth Gardner, forty-one years standing, inside the Parisi replica-symmetry-breaking picture that took the 2021 Nobel - so the surrounding theory is celebrated even though this particular phase diagram is specialist. Above the FullRSB jamming identity at 20 for the age and the named-prediction status, level with the ellipsoid fitting conjecture at 30 and a little below it, and well below the Krauth-Mezard perceptron capacity at 35, which is the more famous single question in this corner.",
};

const LINKS = [
  {
    label: "Zhou, On the Gardner transition in the Ising pure p-spin glass (paper I, the RS and partial 1-RSB phases)",
    url: "https://arxiv.org/abs/2408.14630",
    kind: "paper",
  },
];

const DECISION = `Published as a candidate, with one tier lowered and one flag added. Filing it as a candidate rather than resolved was the right call, and made this review straightforward.

The flag first, because it is the whole story here. The acknowledgment says the appendix proofs were drafted by large language models and "have not yet received their final authorial revision". I checked what that covers: of 166 pages, 11 are main body and 155 appendices, and the main body hands its key inputs to them outright - "Its full proof is included in Appendix B", "Its complete proof is included in Appendix C". So the proofs carrying the theorem have been checked by nobody: not the author, not a referee, no machine. That now sits in the claim-issue note, the loudest field on an entry page. Zhou deserves credit for saying so in print rather than leaving it to be found.

AI contribution goes from AI-discovered to AI co-developed. The rule is to take the disclosure at face value, and this one credits the models with drafting the appendix proofs - not with finding the strategy, locating the second critical temperature, or designing the programme. It is part II of the author's own line of work and the abstract says "we determine the rest of the phase diagram". Substantial AI labour on the hardest technical parts of a human-designed programme is co-development. If a later version attributes a specific conceptual step to a model, that changes.

One correction to your reasoning, not your conclusion: the main paper is not "only introduction and statement of the result" - sections 3 and 4 are titled as proofs and carry the argument skeleton. It is the substance beneath that skeleton which lives in the appendices.

Also filled: field, Elizabeth Gardner as the poser, resolution method, significance 28, a statement carrying the actual phase diagram, and a link to paper I. The model field stays "not explicitly stated" - the paper names no system, and that is worth recording rather than guessing.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, aiContribution: true, resolution: true, significance: true },
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
    if (l.label.length > LINK_LABEL_MAX) { console.log(`  LABEL OVER BY ${l.label.length - LINK_LABEL_MAX}`); bad++; }
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  aiContribution : ${cur.aiContribution} -> ${NEXT.aiContribution}`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  significance   : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  claimIssueNote : ADDED`);
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
