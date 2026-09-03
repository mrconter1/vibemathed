// Answers the open report on "The Proportion of Zeta Zeros on the Critical
// Line", and marks it handled.
//
// The question: why is the zeta entry off the significance-vs-age scatter?
// The reporter guessed "because it is only a partial result". That is right,
// and it is the first of two reasons.
//
//   1. ReferencesChart plots resolved and candidate entries only. A partial
//      improves a bound, so "age at resolution" is not defined for it - the
//      problem is not resolved. 117 entries are out for this reason.
//   2. The entry has no yearPosed, and could not honestly have one: its
//      posedBy field reads "Bernhard Riemann (1859) for the hypothesis; the
//      proportion ladder runs from Hardy and Selberg through Levinson and
//      Conrey". There is no single year in which "what proportion of zeros
//      lie on the line" was posed. 151 of the 535 resolved-or-candidate
//      entries are out for this reason.
//
// So it would be off the plot even if it were marked resolved.
//
// The report also found a real defect, which is fixed in the same commit.
// The chart's footnote read "N of M entries lack a posed year or a score",
// with M the whole catalog - so it quietly attributed the partials'
// exclusion to missing data and made the number look wrong. It now states
// the two reasons separately.
//
// handleReport() cannot be called from a script (it opens with auth()), so
// the update and the reply are written directly in the shape it would have
// produced.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const REPLY = `Good question, and your guess is right - with a second reason behind it.

The scatter plots resolved and candidate entries only. A partial result improves a bound rather than closing the problem, so "age at resolution" is not defined for it: there is no resolution to date. 117 entries are off the plot for that reason, and the zeta entry is one of them. Its own result note is blunt about why it is partial - "an unconditional record, not a resolution: the Riemann hypothesis is untouched".

The second reason would keep it off even if it were marked resolved. The plot needs a posed year, and this entry has none, because it could not honestly have one. Its "posed by" field reads: Bernhard Riemann (1859) for the hypothesis; the proportion ladder runs from Hardy and Selberg through Levinson and Conrey. There is no single year in which "what proportion of zeros lie on the critical line" was asked. 151 of the 535 resolved-or-candidate entries are missing a posed year for similar reasons, so it is in ordinary company.

You also found a real defect, and thank you for it. The chart's footnote said "N of M entries lack a posed year or a score", counting against the whole catalog - which silently blamed missing data for the partials' exclusion and made the figure look wrong. It now states the two reasons separately, so the next person does not have to ask. That is live shortly.

Nothing about the entry itself changes: significance 68, Lean-checked, partial. It is on the site, it is just not a point on that particular plot.`;

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const report = await prisma.problemReport.findFirst({
    where: { status: "open", problem: { name: { contains: "Zeta Zeros", mode: "insensitive" } } },
    select: {
      id: true,
      body: true,
      userId: true,
      problemId: true,
      user: { select: { pseudonym: true } },
      problem: { select: { name: true } },
    },
  });
  if (!report) throw new Error("no open report on that entry");

  console.log(`report on: ${report.problem.name}`);
  console.log(`from     : ${report.user?.pseudonym ?? "anonymous"}`);
  console.log(`body     : ${report.body.slice(0, 90)}`);
  console.log(`reply    : ${REPLY.length}/${MESSAGE_MAX}${REPLY.length > MESSAGE_MAX ? "  OVER" : ""}`);
  if (REPLY.length > MESSAGE_MAX) throw new Error("reply too long");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.problemReport.update({
    where: { id: report.id },
    data: { status: "handled", handledAt: new Date() },
  });
  if (report.userId) {
    await prisma.directMessage.create({
      data: {
        userId: report.userId,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "report",
        body: REPLY.slice(0, MESSAGE_MAX),
        problemId: report.problemId,
      },
    });
  }
  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
