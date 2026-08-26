// Approve the generically-stable Keisler measures submission, essentially as
// written, with the posing date corrected. 26 Aug 2026.
//
// Source verified: arXiv:2608.24605v1 [math.LO], 25 Aug 2026, "GENERICALLY
// STABLE KEISLER MEASURES", Gabriel Conant, Kyle Gannon and James E. Hanson.
// The submission's statement is the paper's abstract, near verbatim, and all
// three authors are correctly listed as collaborators. Not a duplicate.
//
// The AI disclosure here is the most prominent this queue has seen: it is in
// the ABSTRACT, not only in an acknowledgment - "The primary focus of this
// paper is the reverse implications (iii) => (ii) => (i), which we obtain
// through the use of AI models." The dedicated AI Acknowledgment then reads,
// verbatim: "A proof of Theorem 1.1[(iii) => (ii) => (i)] was initially
// obtained from a ChatGPT 5.5 query focusing on the case when T is discrete.
// We were also able to independently find proofs using Kimi K3 and Claude
// Fable 5. These arguments were heavily reorganized and rewritten by the
// authors with further assistance from ChatGPT 5.6 Sol. Theorem 5.1 was
// obtained by the authors by modifying a different result found by ChatGPT
// while attempting Question 5.3."
//
// ai-discovered stands and is well earned: the proof was obtained FROM a
// model, then independently reproduced by two other models from different
// vendors. Three independent systems finding the same argument is unusual
// corroboration of the AI attribution itself, quite apart from the
// mathematics.
//
// yearPosed 2025 -> 2020. The submission paired posedBy "Conant, Gannon" with
// 2025, which does not hang together: the 2025 paper ([9], J. Math. Log.) is
// by all three authors including Hanson, whereas the question originates in
// the 2020 Conant-Gannon paper ([7], Ann. Pure Appl. Logic 171). The intro is
// explicit - the 2020 observation "motivated an extended investigation into
// the question of whether fim is the 'right' analogue of generic stability for
// Keisler measures", and [9] then "proposed two other such analogues" and
// proved one direction. So 2020 with Conant and Gannon as posers is the
// consistent pairing, and the 2025 setup goes in the ageNote.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "equivalence-of-generic-stability-notions-for-keisler-measures";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  yearPosed: 2020,
  aiRole:
    "The disclosure is in the abstract itself, not only in an acknowledgment: \"The primary focus of this paper is the reverse implications $(iii)\\Rightarrow(ii)\\Rightarrow(i)$, which we obtain through the use of AI models.\" The dedicated AI Acknowledgment gives the detail, verbatim: \"A proof of Theorem 1.1[(iii) $\\Rightarrow$ (ii) $\\Rightarrow$ (i)] was initially obtained from a ChatGPT 5.5 query focusing on the case when $T$ is discrete. We were also able to independently find proofs using Kimi K3 and Claude Fable 5. These arguments were heavily reorganized and rewritten by the authors with further assistance from ChatGPT 5.6 Sol. Theorem 5.1 was obtained by the authors by modifying a different result found by ChatGPT while attempting Question 5.3.\" Worth noting what that describes: the proof came out of a model, and was then independently reproduced by two further models from different vendors. The authors' own labour is reorganizing and rewriting.",
  verificationNote:
    "An arXiv preprint (v1, 25 August 2026, math.LO), unrefereed and with no independent endorsement. No mathematics was checked here and there is nothing mechanical to check it against - no formalization, no certificate. Verified here on 26 August 2026: the paper exists at arXiv:2608.24605 with the title and all three authors this entry lists; the statement above is its abstract near verbatim; the AI disclosure appears both in the abstract and in a dedicated AI Acknowledgment, quoted in full above; and the prior work it builds on is real and correctly characterised - Conant and Gannon, Ann. Pure Appl. Logic 171 (2020) for the originating observation, and Conant, Gannon and Hanson, J. Math. Log. (2025) for the chain of implications this paper reverses.",
  ageNote:
    "Dated from the 2020 Conant-Gannon paper whose observation, in the authors' words, \"motivated an extended investigation into the question of whether fim is the 'right' analogue of generic stability for Keisler measures\". The three-way equivalence was set up in their 2025 paper with Hanson, which proved one direction; this paper adds the reverse implications and continuous logic.",
  significance: 20,
  significanceNote:
    "The authors call it \"a definitive resolution\" of a question their own programme has pursued since 2020, and it settles what generic stability should mean for Keisler measures - a real object in NIP model theory going back to Hrushovski, Pillay and Simon. Specialist even by model-theory standards, and well below the $SOP_2=SOP_3$ entry at 35, which is a famous Shelah-lineage problem; level with the named-conjecture band around 20 for a programme objective resolved by the people who set it.",
};

const DECISION = `Published essentially as you wrote it, with one date corrected. This was an accurate submission.

The correction is yearPosed, 2025 to 2020, because 2025 did not pair with your posedBy. The 2025 paper is by all three authors including Hanson, whereas you credited Conant and Gannon - and they are exactly right for the question's origin, which is their 2020 Annals of Pure and Applied Logic paper. The intro says the 2020 observation "motivated an extended investigation into the question of whether fim is the 'right' analogue of generic stability for Keisler measures". The 2025 paper set up the specific three-way equivalence and proved one direction; that now sits in an age note, so both stages are recorded.

Everything else held. Your statement is the abstract near verbatim, the author list is right, and the AI-role summary matches the paper.

Two things about the disclosure worth drawing out, which I have put in the entry. First, it is in the abstract - "which we obtain through the use of AI models" - and not just buried in an acknowledgment, which is the most prominent placement this queue has seen. Second, and more striking: the proof was initially obtained from ChatGPT 5.5, and the authors then independently found proofs using Kimi K3 and Claude Fable 5. Three systems from three vendors converging on the same argument is unusual corroboration of the AI attribution itself, separately from whether the mathematics holds. AI-discovered stands comfortably.

Also filled: verification note, age note, significance 20. Nothing was checked mathematically - no formalization, no certificate - and the entry says so.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, yearPosed: true, significance: true },
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
  console.log(`  yearPosed    : ${cur.yearPosed} -> ${NEXT.yearPosed}`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
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
