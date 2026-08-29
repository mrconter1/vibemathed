// Publish "Sparse domination implies convex body domination". 29 Aug 2026.
//
// Source verified: arXiv:2608.24802v1 [math.CA], 25 Aug 2026, Aapo Laukkarinen
// and Emiel Lorist - both collaborators match, and the submitter's address is
// Lorist's, so this is an author submitting his own work. Not a duplicate.
//
// The attribution link also checks out: arXiv:1701.01907v3, "Convex body
// domination and weighted estimates with matrix weights", Nazarov, Petermichl,
// Treil and Volberg, 2017, all four names as recorded.
//
// THE SUBMITTER'S NOTE IS EXACTLY RIGHT, and I verified it against NPTV rather
// than taking it on trust. Section 3.1 of NPTV reads: "Informally speaking, if a
// scalar operator T can be dominated by a sparse one, the same should hold for
// its vector-valued version T (x) Id. Unfortunately, we are not able to prove a
// general theorem to that extend. However we are able to prove that a scalar
// induction step ... implies the corresponding induction step for vector valued
// operators." So it is a stated principle the authors could not prove, never
// labelled a numbered conjecture. That belongs in an age note rather than being
// left to the submitter's private note, so it is recorded on the entry.
//
// ONE PLACE THE SUBMISSION UNDERSTATES ITSELF, which is the only substantive
// edit. The entry presents the result as holding "for 1 <= r,s < infinity with
// 1/r + 1/s > 1", which reads as though the conjecture were only partly settled.
// It is not: NPTV posed the principle for the classical sparse setting, and the
// hypothesis is satisfied there with room to spare. The (r,s) range is
// Laukkarinen-Lorist's own generalization BEYOND what was asked, and the
// restriction bites only inside that extra generality - the regime
// 1/r + 1/s <= 1, which is real and occurs for rough singular integrals and
// Bochner-Riesz. The paper says so itself: "In this paper we provide a proof of
// the full general statement." Resolution therefore stays `resolved`, and the
// result note now separates what was conjectured from what was added.
//
// Also worth recording: the abstract states the theorem with NO (r,s)
// hypothesis at all, while Theorem A carries "1 <= r,s < infinity with
// 1/r + 1/s > 1". The submission followed Theorem A, which is the correct
// reading; the abstract is the loose one. Noted in the verification note so a
// reader comparing the two is not confused.
//
// ai-co-developed is exactly right, and for once the disclosure makes the tier
// unambiguous. From the dedicated "AI disclosure statement": a long initial
// conversation produced a proof for the commutator case; then "After we
// suggested replacing the role of the function b in that proof by Rademacher
// random variables, a rough version of the proof of Theorem 2.6 was found in
// collaboration with ChatGPT 5.6. The proof in its final form, and its extension
// to the non-dyadic setting, was fully developed, verified, and written by the
// authors." The decisive idea is the humans'; the model built inside it. That is
// the co-developed definition almost word for word - not discovered, because the
// randomization idea that makes it work came from the authors.
//
// verification stays unreviewed: no formalization, no certificate, nothing
// mechanical to re-run, and the argument is harmonic analysis that was not
// checked here.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "sparse-domination-implies-convex-body-domination";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  significance: 27,
  resultNote:
    "If a bilinear form admits an $(r,s)$-sparse bound, its coordinate-wise extension to $\\mathbb C^n$-valued functions admits an $(r,s)$-convex body sparse bound, for $1\\le r,s<\\infty$ with $\\tfrac1r+\\tfrac1s>1$. It holds both in a fixed dyadic lattice (Theorem 2.6, constants independent of the ambient dimension) and for arbitrary cubes (Theorem 3.4), via a randomization of the good part of the form.\n\nOn scope, two things separate. What Nazarov, Petermichl, Treil and Volberg proposed was the principle for the classical sparse setting, and that is settled outright, the hypothesis holding comfortably there. The $(r,s)$ range is the authors' own generalization beyond what was asked, and the restriction bites only inside it, leaving $\\tfrac1r+\\tfrac1s\\le1$ open. Their summary: \"we provide a proof of the full general statement\".\n\nIt also gives sparse domination for iterated commutators directly from that of the underlying form. The dependence on $n$ is not claimed optimal.",
  verificationNote:
    "Unreviewed: an arXiv preprint (v1, 25 August 2026, math.CA), unrefereed, with no formalization and no computational certificate, so there was nothing mechanical to re-run and none of the analysis was checked here. What was verified on 29 August 2026: the paper exists at arXiv:2608.24802 with this title and both authors; Theorem A and Corollary B are as the entry describes them; the AI disclosure is a dedicated section, quoted in the AI-role note; and the attribution is sound - arXiv:1701.01907 is Nazarov, Petermichl, Treil and Volberg's 2017 paper, and its Section 3.1 states the principle and says the authors could not prove it, in the words quoted in the age note.\n\nOne discrepancy a reader may hit, flagged rather than silently smoothed: the abstract states the implication with no hypothesis on $(r,s)$, while Theorem A in the body requires $1\\le r,s<\\infty$ with $\\tfrac1r+\\tfrac1s>1$. This entry follows Theorem A.",
  ageNote:
    "Dated 2017 from Nazarov, Petermichl, Treil and Volberg's convex body domination paper, though never a numbered conjecture. Section 3.1 states it and concedes the gap in the same breath: \"if a scalar operator $T$ can be dominated by a sparse one, the same should hold for its vector-valued version $T\\otimes\\mathrm{Id}$. Unfortunately, we are not able to prove a general theorem to that extend.\"",
  significanceNote:
    "Convex body domination is the technique that unlocked matrix-weighted estimates for Calderón-Zygmund operators, and whether scalar sparse domination automatically upgrades to it has sat open since 2017, posed by four authors central to the area. Settling it is structural rather than a single new bound: it converts any existing sparse bound into a convex body bound for free, and yields sparse domination for iterated commutators. Held short of the top band as a days-old unrefereed preprint with $\\tfrac1r+\\tfrac1s\\le1$ untouched. Placed at 27, beside the specialist analysis entries there.",
};

const DECISION = `Published, with your classification intact and one edit that moves in your favour.

I checked your submitter note against NPTV rather than trusting it, and it is precisely right. Section 3.1 reads "if a scalar operator T can be dominated by a sparse one, the same should hold for its vector-valued version T (x) Id. Unfortunately, we are not able to prove a general theorem to that extend." A principle its authors could not prove, never a numbered conjecture. That belonged on the entry rather than in a private note, so it is now an age note quoting them.

The edit. Your entry gives the result as holding "for 1 <= r,s < infinity with 1/r + 1/s > 1", which reads as though the conjecture were only partly settled. It undersells you. NPTV proposed the principle for the classical sparse setting, where the hypothesis holds with room to spare, so that is settled outright. The (r,s) range is your own generalization beyond what was asked, and the restriction bites only inside it, leaving 1/r + 1/s <= 1 open. The result note now separates the two. Status stays Resolved, which your summary supports: "we provide a proof of the full general statement".

Flagged rather than smoothed over: your abstract states the implication with no hypothesis on (r,s), while Theorem A carries 1/r + 1/s > 1. The entry follows Theorem A and says so. Worth aligning in v2.

AI co-developed is right, and your disclosure is one of the few making the tier unambiguous rather than a judgement call. The model built the commutator proof with you, but the move that makes the theorem work - replacing b by Rademacher random variables - is yours, as are the final proof and the non-dyadic extension.

Verification stays Unreviewed, which is no comment on the mathematics: no formalization and no certificate, so nothing was mechanically checkable and I checked none of the analysis. The note lists only what I verified - paper, authors, theorems, disclosure, NPTV attribution. Also filled: significance 27.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: {
      id: true, status: true, submittedById: true, significance: true,
      aiContribution: true, resolution: true, verification: true,
    },
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
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}${DECISION.length > MESSAGE_MAX ? `  OVER BY ${DECISION.length - MESSAGE_MAX}` : ""}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  verification   : ${cur.verification} (unchanged)`);
  console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
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
      data: {
        userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym,
        kind: "decision", reason: "edited", body: DECISION, problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
