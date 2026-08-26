// Approve the Riviere n-Laplace counterexample, swapping two fields that were
// filled the wrong way round. 26 Aug 2026.
//
// Source verified: arXiv:2608.24393v1 [math.AP], 25 Aug 2026, "A Discontinuous
// Solution of the Critical n-Laplace System with Antisymmetric Potential",
// Dominik Schlagenhauf, SOLE author. Not a duplicate.
//
// THE FIX: posedBy and humanCollaborators were exactly swapped. The submission
// had posedBy "Dominik Schlagenhauf" and collaborators ["Tristan Riviere"],
// which inverts the actual situation - Schlagenhauf wrote the paper, Riviere
// posed the question. The abstract says so directly: "This gives a negative
// answer to a regularity question posed by Riviere in [8, Eq. (3.23)], and
// later reformulated in the open Problem 2.5 in the survey paper [9]", where
// [8] is Riviere's 2011 Seminaires et Congres chapter and [9] is
// Schikorra-Strzelecki, EMS Surv. Math. Sci. 4 (2017). Riviere is not an
// author of this paper. yearPosed 2011 was already right and matches [8].
//
// AI disclosure verified verbatim, from the paper's "AI Usage" section: "The
// example was provided by ChatGPT 5.6 Sol while the author was exploring
// possible counterexamples to the regularity problem of weakly n-harmonic maps
// on August 5, 2026. The author identified it as a solution to the more
// general problem with the antisymmetric potential as in (1.1). Furthermore,
// the author simplified the paramters and notations for better readability.
// The proof has been checked by the author and is correct. The work was
// written by the author, however code snippets may occasionally come from LLMs
// including ChatGPT 5.6 Sol or Gemini 3.6 Thinking." It also appears on the
// title page. ai-discovered stands: for a disproof the counterexample is the
// whole result, and the model produced it - the same reading applied to the
// bounded-mass entry.
//
// solveDate moved 2026-08-26 -> 2026-08-05, the one date the paper actually
// documents (when the example was generated). Site convention is that the date
// records when the problem fell rather than when the writeup appeared. The
// nuance - that the author recognised what the object solved some time after
// receiving it - goes in the ageNote rather than being buried.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "riviere-s-regularity-question-for-critical-n-laplace-systems-with-antisymmetric-";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  posedBy: "Tristan Rivière",
  humanCollaborators: ["Dominik Schlagenhauf"],
  solveDate: "2026-08-05",
  aiRole:
    "From the paper's own \"AI Usage\" section, which also appears in condensed form on the title page: \"The example was provided by ChatGPT 5.6 Sol while the author was exploring possible counterexamples to the regularity problem of weakly $n$-harmonic maps on August 5, 2026. The author identified it as a solution to the more general problem with the antisymmetric potential as in (1.1). Furthermore, the author simplified the paramters and notations for better readability. The proof has been checked by the author and is correct. The work was written by the author, however code snippets may occasionally come from LLMs including ChatGPT 5.6 Sol or Gemini 3.6 Thinking.\" For a disproof the counterexample is the entire result, and the model produced it; the author's contributions as he describes them are recognising what it settled, simplifying the parameters, checking the proof and writing the paper. Hence AI-discovered.",
  verificationNote:
    "An arXiv preprint (v1, 25 August 2026, math.AP), unrefereed and with no independent endorsement, and no mathematics was checked here - there is no formalization and no computational certificate. The author states he has checked the proof himself, which is his own assurance rather than an independent one. Verified here on 26 August 2026: the paper exists at arXiv:2608.24393 with the title, sole author and construction this entry describes; its AI-usage section carries the disclosure quoted above word for word; and the question it answers is real and traceable - the abstract cites Rivière's 2011 chapter \"The role of integrability by compensation in conformal geometric analysis\" (Séminaires et Congrès 22) at Eq. (3.23), reformulated as open Problem 2.5 in Schikorra and Strzelecki's 2017 EMS survey on H-systems in higher dimensions.",
  ageNote:
    "The example was generated on 5 August 2026, which is the date recorded here; the author had been looking for counterexamples to a different problem (regularity of weakly $n$-harmonic maps) and recognised afterwards that the object settled Rivière's more general antisymmetric-potential question. The paper appeared on arXiv on 25 August.",
  significance: 30,
  significanceNote:
    "A question of Rivière from his 2011 survey chapter on integrability by compensation, restated as an open problem in Schikorra and Strzelecki's 2017 EMS survey - so fifteen years standing and twice put in print as open, inside Rivière's own well-known programme on conformally invariant systems with antisymmetric potentials. Placed at the lower end of the analysis band, alongside the 30-33 cluster: a genuinely named open problem with a real literature, but one whose interest is confined to geometric analysis.",
};

const DECISION = `Published, with two fields swapped back and one date moved. The mathematics and the AI classification were right as submitted.

The swap is the main thing. posedBy read "Dominik Schlagenhauf" and collaborators read "Tristan Riviere", which is exactly backwards: Schlagenhauf is the sole author of the paper, and Riviere is the person who posed the question. The abstract says so outright - a negative answer to "a regularity question posed by Riviere in [8, Eq. (3.23)], and later reformulated in the open Problem 2.5 in the survey paper [9]". Riviere is not an author here. Your yearPosed of 2011 was already correct and matches that reference, so the pairing now hangs together.

Solved date moves from 26 August to 5 August. That is the one date the paper actually documents - the AI-usage section says the example was provided on August 5, 2026 - and the convention here is that the date records when the problem fell rather than when the writeup appeared. I put the wrinkle in an age note rather than hiding it: the author was hunting counterexamples for a different problem that day and recognised only afterwards that the object settled Riviere's more general question.

Everything else checked out. The disclosure is in two places, the title page and a dedicated AI Usage section, and it says exactly what your summary said. AI-discovered stands, and for the clean reason: in a disproof the counterexample is the whole result, and the model produced it. The author's own account of his part is recognising what it settled, simplifying the parameters, checking the proof and writing it up.

Also filled: verification note, significance 30, and the age note. No verification of the mathematics was done here and the entry says so - the author's statement that he checked the proof is his assurance, not an independent one.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, posedBy: true, humanCollaborators: true, solveDate: true, significance: true },
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
  console.log(`  posedBy      : ${cur.posedBy} -> ${NEXT.posedBy}`);
  console.log(`  collaborators: ${JSON.stringify(cur.humanCollaborators)} -> ${JSON.stringify(NEXT.humanCollaborators)}`);
  console.log(`  solveDate    : ${cur.solveDate} -> ${NEXT.solveDate}`);
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
