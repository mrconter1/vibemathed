// Approve the Dubickas Problem 3 submission, with two downgrades.
//
// The scope gate passes: Problem 3 of Dubickas, Bull. LMS 38 (2006) 70-80, is
// a stated question in a published paper, and Mahler's 3/2 problem sits at the
// same alpha.
//
// The Lean was audited here rather than trusted: 4415 lines over eleven
// modules with zero sorry, zero declared axioms and no native_decide;
// Challenge.lean's ten sorries are the comparator placeholders that file is
// supposed to carry; comparator.json permits only propext, Quot.sound and
// Classical.choice; and the MahlerZ and S definitions match the informal
// statement.
//
// verification drops lean-verified -> lean-checked. That rung wants
// kernel-checked AND an independently anchored statement, and this has
// neither: the repository has zero CI workflows and zero runs, so nothing has
// compiled it, and Challenge.lean is written by the author of the proof, so
// there is no external anchor of the kind formal-conjectures gave Erdos 501.
// The repository's own README also flags that the thickness computation of
// section 4.1 and all of section 8 are not formalized, and the paper's
// abstract says it is the case m = 3 that is verified in Lean - a
// qualification the submission did not carry.
//
// resolution drops resolved -> candidate, purely for consistency: a 79-page
// disproof of Yau-Tian-Donaldson is filed as a candidate, so a same-day
// unrefereed self-deposit cannot outrank it.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "question-3-of-dubickas-2006-3";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  name: "Problem 3 of Dubickas (2006): Is $\\sqrt{3} \\in \\mathcal{Z}$?",
  shortName: "Dubickas Problem 3",
  field: "Distribution mod 1; Mahler Z-numbers",
  statement:
    "Dubickas splits $(1,+\\infty)$ into the set $\\mathcal{Z}$ of those $\\alpha$ for which some nonzero real $\\xi$ makes every integral part $\\lfloor \\xi\\alpha^n \\rfloor$ even, and its complement $\\mathcal{S}$; at $\\alpha = 3/2$ the question of which side one lies on is Mahler's. His Problem 3 asks which side $\\sqrt{3}$ is on. Answered: $\\sqrt{3} \\in \\mathcal{Z}$, with the explicit witness $\\xi = 1.34160899796112665163\\ldots$, and more generally $\\sqrt{m} \\in \\mathcal{S}$ if and only if $m = 2$. The mechanism is Cantor-set arithmetic rather than Diophantine approximation: since $\\sqrt{m}^{\\,2}$ is an integer, the two-scale problem collapses to a base-$m$ covering induction on restricted-digit expansions.",
  posedBy: "Artūras Dubickas",
  yearPosed: 2006,
  solveType: "proved",
  resolution: "candidate",
  resolutionMethod: "construction",
  humanCollaborators: ["Ralf Stephan"],
  aiContribution: "ai-discovered",
  aiRole:
    "The author's account: \"The mathematical discovery is the Fable-5 agent's; the formalization is the Fable-5 and Opus-5 agents'; the agents also drafted the prose of the companion paper, which the author revised; the direction and the review are the author's, who is responsible for the mathematical content.\" The Lean development carries the same framing in its copyright line, \"in collaboration with Claude Code\".",
  verification: "lean-checked",
  verificationNote:
    "The Lean was read here on 22 August 2026, at github.com/rwst/Square-Roots: eleven modules totalling 4415 lines with zero sorry, zero declared axioms and no native_decide, comparator.json permitting only propext, Quot.sound and Classical.choice, and the MahlerZ and S definitions faithful to the statement above. Challenge.lean's ten sorries are the placeholders a comparator challenge is meant to carry, and it imports nothing from the development. Recorded lean-checked rather than lean-verified, which the submission claimed, because that rung wants kernel-checking AND an independent anchor and this has neither: the repository has no CI workflow and no runs, so nothing has compiled it, and the challenge file is written by the author of the proof. The README also flags that the thickness computation of section 4.1 and all of section 8 are not formalized, and the paper's abstract says it is the case m = 3 that is verified in Lean.",
  significance: 20,
  significanceNote:
    "A specific numbered question from a 2006 Bulletin of the LMS paper, twenty years standing, in a corner of distribution mod 1 that borrows its interest from Mahler's 3/2 problem sitting at the same kind of alpha. Level with the Oddtown anchor at 20: a real named question, narrow readership.",
  resultNote:
    "Answers Problem 3 and generalizes it: the classification $\\sqrt{m} \\in \\mathcal{S} \\iff m = 2$ covers every square root, and a further theorem replaces parity by divisibility by any $p \\ge 2$. Note the scope of the machine-checking, which is narrower than the paper: the author states that the case $m = 3$ is what is verified in Lean, and the repository flags the thickness computation of section 4.1 and all of section 8 as not formalized.",
  publication: "preprint",
  sourceName: "Even integral parts of powers of square roots (doi:10.13140/RG.2.2.32215.43682)",
};

const EXTRA_LINK = {
  label: "Dubickas, Arithmetical properties of powers of algebraic numbers (Problem 3)",
  url: "https://doi.org/10.1112/S0024609305017728",
  kind: "problem-record",
};

const DECISION = `Published, with two downgrades and one addition. The submission was strong and the Lean is careful work - I read all eleven modules rather than taking the claim on trust, and found 4415 lines with no sorry, no declared axioms and no native_decide, a comparator config permitting only Lean's three standard axioms, and MahlerZ and S defined faithfully. Challenge.lean importing nothing from the development is exactly right.

verification goes from lean-verified to lean-checked. That rung wants two things, kernel-checking and a statement anchored independently of the proof, and this has neither yet. The repository has no CI workflow and no runs, so nothing has actually compiled it, and Challenge.lean is written by the same person as the proof, so there is no external anchor of the kind formal-conjectures provided for Erdos 501. Add a CI job that runs lake test and I will happily revisit.

The related point is one your submission did not carry but the repository does: the README flags the thickness computation of section 4.1 and all of section 8 as unformalized, and the paper's abstract says it is the case m = 3 that is verified in Lean. That is now in the result note, because a reader who sees a Lean badge will otherwise assume the whole classification is machine-checked.

resolution goes from resolved to candidate. Nothing to do with quality: a 79-page disproof of the Yau-Tian-Donaldson conjecture is filed as a candidate here, so a same-day unrefereed deposit cannot rank above it. It moves up as review happens.

Also filled: Ralf Stephan as the human author, significance 20, and a link to the Dubickas paper the problem comes from.

One thing I could not check. The source 403s automated requests and is not on arXiv, so I never opened the PDF. If you can put a copy somewhere openly readable, that would close the last gap.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, name: true, verification: true, resolution: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

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
  if (DECISION.length > MESSAGE_MAX) throw new Error(`decision over by ${DECISION.length - MESSAGE_MAX}`);

  console.log(`${SLUG} (${cur.status})`);
  console.log(`  name         : ${cur.name}\n              -> ${NEXT.name}`);
  console.log(`  verification : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  resolution   : ${cur.resolution} -> ${NEXT.resolution}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +1 link, status -> published`);
  console.log(`  decision     : ${DECISION.length}/${MESSAGE_MAX} chars`);

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
        links: { create: { ...EXTRA_LINK, position: nLinks } },
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
