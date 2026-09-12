// Read-only: everything waiting on a curator, in one pass.
//
// dump-pending.ts covers submissions only, so a report or a contact message
// could sit unseen while the submission queue looked empty. There are three
// surfaces that can be waiting and they are easy to forget individually:
//
//   Problem.status = "pending"        reader submissions
//   ProblemReport.status = "open"     "report a problem" on an entry or frontier
//   SiteMessage.status = "open"       the contact form, including anonymous
//
// Submissions print in full because reviewing one needs every field. Reports
// and messages print with the entry they point at, since a report body alone
// ("the date is wrong") is not actionable without knowing which date.
//
// Reads only. Kept general rather than dated: this is the command to run
// before any review session.

import { guardedPrisma } from "./lib/guarded-prisma";

const prisma = guardedPrisma();

async function connectWithRetry(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

function rule(title: string) {
  console.log(`\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}`);
}

async function main() {
  const db = await connectWithRetry();
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}`);

  const pending = await prisma.problem.findMany({
    where: { status: "pending" },
    include: { links: true },
    orderBy: { createdAt: "asc" },
  });
  rule(`PENDING SUBMISSIONS: ${pending.length}`);
  for (const p of pending) {
    console.log(JSON.stringify(p, null, 2));
    console.log("-".repeat(72));
  }

  const reports = await prisma.problemReport.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
    include: {
      problem: {
        select: {
          slug: true,
          name: true,
          status: true,
          sourceUrl: true,
          yearPosed: true,
          posedBy: true,
          solveDate: true,
          verification: true,
          resolution: true,
          significance: true,
        },
      },
      frontier: { select: { slug: true, name: true } },
    },
  });
  rule(`OPEN REPORTS: ${reports.length}`);
  for (const r of reports) {
    console.log(JSON.stringify(r, null, 2));
    console.log("-".repeat(72));
  }

  const messages = await prisma.siteMessage.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
  });
  rule(`OPEN CONTACT MESSAGES: ${messages.length}`);
  for (const m of messages) {
    console.log(JSON.stringify(m, null, 2));
    console.log("-".repeat(72));
  }

  rule("TOTALS");
  console.log(
    `submissions ${pending.length}   reports ${reports.length}   messages ${messages.length}`,
  );
}

main().finally(() => prisma.$disconnect());
