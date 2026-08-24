// Approve the random-assignment CLT submission, with several blanks filled
// and one real correction. 24 Aug 2026.
//
// Source verified: arXiv:2608.05123, "A central limit theorem for the random
// assignment problem", Gilles Mordant, v1 5 Aug 2026. Title, author and the
// limiting variance 4*zeta(2)-4*zeta(3) all match the submission. Not a
// duplicate - neither the DOI nor the arXiv id appears anywhere in the
// catalog, and no entry covers the assignment problem.
//
// The AI disclosure is real, first-party, and unusually good: section 1.1,
// placed BEFORE the mathematics rather than buried at the end (which is where
// the Kong-Zhu disclosure sat, and where an abstract-only check would have
// missed it). It is quoted in full in aiRole rather than paraphrased, because
// it is precise about the division of labour in a way most disclosures are
// not - the geometric intuition is claimed by the author, who describes having
// to steer the model off a Stein-method tangent, while "AI was then used to
// complete the proofs, catch mistakes and verify the paper". Completing proofs
// is substantive mathematics, so ai-co-developed stands as submitted.
//
// The correction: yearPosed was 2026, which would make the problem zero years
// old. That is wrong on the submission's own account - its statement credits
// Aldous 1992. There is no single proposer (the paper names none; the CLT is
// the natural question after the mean, not a formally stated conjecture), so
// posedBy stays null - which has ample precedent, 109 published entries carry
// a null posedBy - and yearPosed becomes 1992 with an ageNote explaining the
// dating rather than inventing a proposer to go with it.
//
// Novelty rests on the paper's own history section, read here in full: it
// surveys Kurtzberg, Walkup, Karp, Aldous, Linusson-Wastlund,
// Nair-Prabhakar-Sharma, Talagrand, Wastlund, Chatterjee and Cao, and states
// that none of the first-order, concentration, exact-moment or replica results
// supplies the CLT for bounded uniform costs. That is the author's own
// characterization, recorded as such - no independent literature search was
// run here, and the mathematics was not checked.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "central-limit-theorem-for-the-random-assignment-problem";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  field: "Random combinatorial optimization",
  yearPosed: 1992,
  resolutionMethod: "argument",
  modelMaker: "OpenAI; Anthropic",
  statement:
    "Let $C_n$ be the minimum cost of a perfect matching in an $n\\times n$ matrix of independent uniform random variables. Aldous proved in 1992 that $\\mathbb{E}[C_n]$ converges, later identifying the limit as $\\zeta(2)$ via the Poisson-weighted infinite tree; Parisi's exact finite-$n$ formula for exponential costs was then proved by Linusson-Wästlund and independently by Nair, Prabhakar and Sharma. The fluctuations resisted. Talagrand applied product-space concentration, Wästlund computed the exponential model's variance as $4\\zeta(2)-4\\zeta(3)+O(n^{-2})$, and Chatterjee proved an order-$n^{-1/2}$ lower bound under tail hypotheses that exclude the bounded uniform law - but no central limit theorem for $C_n$ was known. This paper claims one: $\\sqrt{n}\\,(C_n-\\zeta(2)) \\Rightarrow \\mathcal{N}(0,\\,4\\zeta(2)-4\\zeta(3))$.",
  resultNote:
    "Claims the central limit theorem for the bipartite random assignment problem with bounded uniform costs: $\\sqrt{n}\\,(C_n-\\zeta(2)) \\Rightarrow \\mathcal{N}(0,\\,4\\zeta(2)-4\\zeta(3))$. The limiting constant is not itself new - Wästlund had computed exactly $4\\zeta(2)-4\\zeta(3)$ for the mean-one exponential model, and Malatesta, Parisi and Sicuro derived the non-bipartite analogue by replicas - but neither is a proof for the bounded bipartite model, and Wästlund's zero-free-disk conjecture, which would imply a Gaussian limit, remains open. So the value was expected; the proof of convergence to it is what is claimed. The route is an exact change of variables on an optimal dual potential, after which the residual dependence is a single directed-tree factor whose matrix-tree determinant becomes triangular once the potentials are ordered.",
  aiRole:
    "The paper carries its AI disclosure as section 1.1, before the mathematics rather than buried after it, and it is precise enough to be worth quoting rather than paraphrasing: \"This proof is not a one-prompt exploit: I have been working for quite some time on optimal transport and matching problems. I somehow forced the AI to help me explore a geometric intuition that I had come up with a few months ago, even before the models reached their current level. Funnily, during the interaction, I had to force the AI not to drift to attempts involving the Stein method and force it to stick to my ideas. AI was then used to complete the proofs, catch mistakes and verify the paper (both via numerical simulations and general 'thinking'), as well as to improve the exposition. The models ChatGPT 5.6 and Opus 5 (as well as previous versions) were used.\" The conceptual core is claimed by the author and the steering was his, including steering the model away from a wrong direction; completing the proofs is substantive mathematics, which is why this sits at co-developed rather than assisted.",
  verification: "unreviewed",
  verificationNote:
    "An arXiv preprint (v1, 5 August 2026), unrefereed and with no independent endorsement. No mathematics was checked here, and there is nothing mechanical to check it against: a long probabilistic argument with no formalization and no computational certificate. What was verified on 24 August 2026: the paper exists at arXiv:2608.05123, its title, author and limiting variance match this entry, and its AI disclosure is genuine, first-party and quoted above in full. Its history section was read to establish novelty - it surveys Kurtzberg, Walkup, Karp, Aldous, Linusson-Wästlund, Nair-Prabhakar-Sharma, Talagrand, Wästlund, Chatterjee and Cao, and states that none of the first-order, concentration, exact-moment or replica results supplies the central limit theorem for bounded uniform costs. That is the author's own characterization of what was open, recorded as such; no independent literature search was run here.",
  ageNote:
    "No single proposer and no formal posing date: the central limit theorem is the natural question left once the mean is known, not a conjecture anyone stated, and the paper names nobody. Dated from Aldous's 1992 convergence theorem for the mean, which is where the submission's own framing starts and the point from which the fluctuation question was there to ask.",
  significance: 32,
  significanceNote:
    "The random assignment problem is a celebrated line - Mézard and Parisi's replica prediction of $\\zeta(2)$, Parisi's exact finite-$n$ conjecture, Aldous's PWIT proof, then Linusson-Wästlund and Nair-Prabhakar-Sharma - but this entry is the fluctuation question, a rung below that headline result in fame. Above the 30-cluster (Matrix Spencer, Ellipsoid Fitting) because Chatterjee, Cao and Wästlund each attacked it by name without closing it; below Feige and Krauth-Mezard at 35, which are named conjectures in their own right.",
};

const LINKS = [
  {
    label: "Aldous, The zeta(2) limit in the random assignment problem",
    url: "https://arxiv.org/abs/math/0010063",
    kind: "problem-record",
  },
];

const DECISION = `Published, with the blanks filled and one correction.

The correction is Year posed, which was 2026 - that would make the problem zero years old, and it contradicts your own statement text, which credits Aldous 1992. It is now 1992, dated from Aldous's convergence theorem for the mean, with an age note explaining the dating. Posed by stays blank, correctly: the paper names no proposer, and the CLT is the natural question left once the mean is known rather than a conjecture anyone formally stated. Blank with a reason beats a guess.

I verified the source rather than taking it on trust: arXiv:2608.05123, Mordant, v1 5 August, title/author/variance all matching. Your AI-role summary was accurate, and the disclosure is better than most - section 1.1, before the mathematics, precise about the division of labour. I replaced the paraphrase with the full quote, because the detail that you had to steer the model off a Stein-method tangent is exactly the kind of thing that gets lost in summary and is worth a reader seeing. AI co-developed stands as you set it.

I also read the paper's history section and pulled it into the statement and result note, because two things there change how the claim reads. The limiting constant is not new - Wastlund had already computed 4*zeta(2)-4*zeta(3) for the exponential model - so what is claimed is the convergence, not the value. And the paper's own survey is what establishes novelty; that is now recorded as the author's characterization rather than as an independent check, since I did not run one.

Also filled: field, resolution method, model maker, significance 32, and a link to Aldous's zeta(2) paper.

Nothing was checked mathematically - a long probabilistic argument with no formalization and no certificate to check against. That is what Unreviewed means here, and it is where the entry sits.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, yearPosed: true, significance: true, field: true },
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
      if (v.length > lim) {
        console.log(`  OVER BY ${v.length - lim}`);
        bad++;
      }
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
  console.log(`  yearPosed    : ${cur.yearPosed} -> ${NEXT.yearPosed}`);
  console.log(`  field        : ${cur.field} -> ${NEXT.field}`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +${LINKS.length} link, status -> published`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: DECISION,
        reviewReason: "edited",
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
        reason: "edited",
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
