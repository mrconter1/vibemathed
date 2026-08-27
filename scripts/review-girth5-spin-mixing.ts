// Approve the girth-5 spin-system mixing submission, with two honest
// additions. 27 Aug 2026.
//
// Source verified: arXiv:2608.25491v1 [cs.DS], 26 Aug 2026, "A Spectral
// Local-to-Global Principle for Spin Systems on Graphs with Girth At Least
// Five", Xiaoyu Chen (MIT) and Kuikui Liu. Both collaborators match. Not a
// duplicate.
//
// Disclosure in the abstract and in a dedicated section 1.2, "Discussions
// about experiments with AI". The submission's aiRole is accurate.
// ai-co-developed is also right, and the paper's own wording supports it over
// ai-discovered: the humans set the frame (following Gobel et al.'s Bochner
// approach), asked the model to redo known trickle-down proofs, and observed
// the local-gadget pattern themselves - "With these proofs, we observe that
// the Bochner identity is useful for reducing a global spectral-gap estimate to
// estimates on local gadgets". The model then "proposed an affirmative proof
// strategy" for the girth-5 question and the humans "verified the argument,
// generalized the proof with further assistance from GPT". The abstract calls
// it "several rounds of interaction", which is collaboration, not discovery.
//
// TWO ADDITIONS.
//
// 1. The mixing rate. The submission says this "improves the previous near-
// Delta threshold result from girth at least 11 to girth at least 5", which IS
// in the paper - it spells the number "eleven", which is why a naive search for
// "11" misses it. But the comparison is only about girth. Hayes-Vigoda [HV03]
// and then Jain-Mizgerd-Vigoda [JMV26] get OPTIMAL O(n log n) mixing at girth
// eleven; this paper gets spectral gap Omega(1/n) and t_mix = O(n^2 log q + n
// log(1/eps)). So the girth hypothesis improves a great deal and the mixing
// bound gets weaker. That trade belongs in the result note, and was not there.
//
// 2. The AI negative result, which is rare enough to be worth recording. Remark
// 7: "We asked GPT-5.6 Sol Ultra to work on triangle-free graphs with the
// Bochner identity, but it did not find a proof after ~20 hours." And the
// authors report the model claims a further generalization to graphs without
// spanning 4-cycles, which they omitted "since we did not find any new ideas in
// it". A paper documenting where the model failed, and declining to bank a
// claim it made, is unusual and should be visible.
//
// posedBy Mark Jerrum / 1995 kept - that is the standard citation - but the
// paper calls it "a long-standing folklore conjecture ... [Jer95]", so nobody
// posed it as such. Recorded in the ageNote rather than changing the field.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "rapid-mixing-for-spin-systems-on-graphs-of-girth-at-least-five";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  aiRole:
    "From the paper's section 1.2, \"Discussions about experiments with AI\". The authors first asked GPT-5.6 Sol Ultra to redo several known trickle-down results via the Bochner identity, and drew the pattern themselves: \"With these proofs, we observe that the Bochner identity is useful for reducing a global spectral-gap estimate to estimates on local gadgets.\" They then brought the girth-5 colorings question to the model, \"which proposed an affirmative proof strategy. The human authors then verified the argument, generalized the proof with further assistance from GPT, and streamlined the paper.\" GPT-5.6 was also used for exposition and typographical checking. The abstract's own framing is \"several rounds of interaction\", which is why this is co-developed rather than AI-discovered: the model supplied the strategy for the main theorem inside a frame the humans built and after an observation they made.\n\nThe paper also records where the model failed, which is rare enough to note. Remark 7: \"We asked GPT-5.6 Sol Ultra to work on triangle-free graphs with the Bochner identity, but it did not find a proof after $\\sim$20 hours.\" The authors add that the model claims a proof generalizing the theorem to all graphs without spanning 4-cycles, which they deliberately left out \"since we did not find any new ideas in it\".",
  resultNote:
    "For fixed $\\delta\\in(0,1)$ and all sufficiently large $\\Delta$ depending only on $\\delta$, Glauber dynamics for proper $q$-colorings mixes rapidly on every graph of girth at least $5$ whenever $q\\ge(1+\\delta)\\Delta$: spectral gap $\\Omega_\\delta(1/n)$ and $t_{\\mathrm{mix}}(\\varepsilon)=O_\\delta(n^2\\log q+n\\log(1/\\varepsilon))$. An analogous theorem holds for the anti-ferromagnetic Potts model at $q\\ge(1+\\delta)(1-\\beta)\\Delta$.\n\nWhat it does and does not improve. On girth it is a large gain: previous results near the $(1+\\delta)\\Delta$ threshold needed girth at least eleven (Hayes-Vigoda, extended to constant degrees by Jain-Mizgerd-Vigoda). On the mixing rate it is weaker - those give optimal $O(n\\log n)$, this gives $O(n^2\\log q)$. It does not touch the folklore conjecture that mixing is rapid on every graph for $q\\ge\\Delta+2$; Remark 7 names spanning 4-cycles as the obstruction.",
  verificationNote:
    "An arXiv preprint (v1, 26 August 2026, cs.DS), unrefereed, with no formalization and no computational certificate, so nothing here was mechanically checkable and no mathematics was checked. Verified on 27 August 2026: the paper exists at arXiv:2608.25491 with the title and both authors this entry lists; the statement and the quantitative claims above are its abstract and Theorem 1; the AI disclosure appears in the abstract and in section 1.2, quoted above; and the prior work is correctly characterised - Jerrum 1995 for the folklore conjecture and the $q>2\\Delta$ result, Hayes-Vigoda 2003 for the girth-eleven regime, Jain-Mizgerd-Vigoda for its extension to constant degree, and Carlson-Vigoda for the current $1.809\\Delta$ state of the art on general graphs.",
  ageNote:
    "Dated from Jerrum's 1995 paper, which is the standard citation and where the $q>2\\Delta$ bound was proved. Strictly, nobody posed the target as their own: the paper calls $q\\ge\\Delta+2$ \"a long-standing folklore conjecture\" and cites [Jer95] for it, so Jerrum is recorded here as the canonical reference rather than as an individual proposer.",
  significance: 30,
  significanceNote:
    "The rapid-mixing threshold for Glauber dynamics on proper colorings is a headline question in approximate counting, with a celebrated ladder behind it - Jerrum's $2\\Delta$, Vigoda's $11\\Delta/6$, Carlson-Vigoda's $1.809\\Delta$. This entry is a restricted slice of it: girth at least five, large degree, and a non-optimal mixing bound. That places it around the semi-streaming matching and linear-extensions band at 28-35 rather than higher: a real step in a famous line, not the line's resolution.",
};

const DECISION = `Published as a partial result, with your classification intact and two things added.

Your AI-role summary matches the paper, and AI co-developed is the right call - I checked the reasoning rather than just the label. The humans built the frame from Gobel et al., asked the model to redo known trickle-down proofs, and drew the local-gadget observation themselves before bringing the girth-5 question to it. The model proposed the strategy; the humans verified and generalized. The abstract's own "several rounds of interaction" is collaboration language, not discovery.

First addition, the one that matters. Your result note says this improves the near-Delta threshold "from girth at least 11 to girth at least 5" - correct, and in the paper, which spells "eleven", so it is easy to miss. But that comparison is only about girth. Hayes-Vigoda, and Jain-Mizgerd-Vigoda after them, get optimal O(n log n) mixing at girth eleven; this paper gets O(n^2 log q). So girth improves a great deal while the mixing bound weakens, and "improves from 11 to 5" alone reads as a strict improvement. Both directions are now stated.

Second, I pulled Remark 7 into the AI-role note, because it is the rarest thing in this submission. The paper records that the model was asked to handle triangle-free graphs and did not find a proof after about twenty hours, and that it claims a further generalization to graphs without spanning 4-cycles which the authors deliberately omitted "since we did not find any new ideas in it". Papers almost never document where the model failed, or decline to bank a claim it made. That deserves to be visible.

One attribution note rather than a change: posedBy Jerrum and 1995 stay, since that is the standard citation, but the paper calls the q >= Delta+2 target "a long-standing folklore conjecture", so nobody posed it as their own. That is now in an age note.

Also filled: verification note, significance 30. Nothing was checked mathematically and the entry says so.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, significance: true, aiContribution: true, resolution: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  significance   : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, status: "published", reviewedAt: new Date(), reviewMessage: DECISION, reviewReason: "edited" } as never,
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: { userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym, kind: "decision", reason: "edited", body: DECISION, problemId: cur.id },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
