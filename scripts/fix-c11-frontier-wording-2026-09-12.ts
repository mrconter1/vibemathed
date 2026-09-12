// Handles the open report on the C11 frontier from Matthew Protti
// (10 September 2026, report 8eecc7da).
//
// The request, verbatim from the report: replace "by exact integer powers at
// matched dimension" in the 10 August 2026 BPZ row and in the closing
// source/provenance paragraph with "by exact integer comparisons, using
// cross-powers when dimensions differ". His reason: the staircase mixes
// dimension 207 (BPZ, R3) and dimension 213 (R5, R6, R9, R10), and comparing
// N_a^(1/d_a) against N_b^(1/d_b) across dimensions is done by the exact
// integer comparison N_a^(d_b) versus N_b^(d_a). "Matched dimension" was
// therefore wrong for the rows that matter; the correction changes no bound
// and claims no new audit.
//
// The mathematics of the request is right - for positive bases and
// dimensions, N_a^(1/d_a) < N_b^(1/d_b) iff N_a^(d_b) < N_b^(d_a) - and the
// phrase occurs exactly twice on the live page, in the two places he names:
// the `note` of the FrontierRow dated 2026-08-10 and the frontier's
// `historyNote`. Both are edited; nothing else on the frontier is touched.
//
// Frontier and FrontierRow have no form and so no validator to mirror - only
// the column widths (note 400, historyNote 600), which is how the C11
// frontier hit P2000 when it was created. The replacement is 21 characters
// longer than the original, so both lengths are checked here before any
// write, and the script refuses if either would overflow. That is the whole
// point of doing the length arithmetic in a dry run rather than finding out
// from the database.
//
// The report is then marked handled, and the reporter gets a message saying
// what was changed. He is the same contributor who built the C11 entry and
// the releases the frontier transcribes, so the reply is short.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");

const FRONTIER = "shannon-capacity-c11";
const ROW_DATE = "2026-08-10";
const REPORT_ID = "8eecc7da-b698-40ce-9b66-a18473c3efcd";
const OLD = "by exact integer powers at matched dimension";
const NEW = "by exact integer comparisons, using cross-powers when dimensions differ";
const NOTE_MAX = 400;
const HISTORY_MAX = 600;

const REPLY =
  "Done, both places: the 10 August 2026 row note and the closing provenance paragraph now read \"by exact integer comparisons, using cross-powers when dimensions differ\". Your reasoning is right - the staircase mixes dimensions 207 and 213, and the honest description of how N_a^(1/d_a) is compared with N_b^(1/d_b) is the exact integer comparison N_a^d_b against N_b^d_a - and the earlier wording was wrong for exactly the rows that matter. No bound or attribution was changed. The frontier page can take up to an hour to show it, or until the next deploy. Thanks for reporting it precisely enough that the fix was a single phrase.";

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

async function main() {
  const db = await connectWithRetry();
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const frontier = await prisma.frontier.findUnique({
    where: { slug: FRONTIER },
    select: {
      id: true,
      name: true,
      historyNote: true,
      rows: { where: { date: ROW_DATE }, select: { id: true, note: true, attribution: true } },
    },
  });
  if (!frontier) throw new Error(`frontier not found on ${db}: ${FRONTIER}`);
  const [row, ...more] = frontier.rows;
  if (!row) throw new Error(`no row dated ${ROW_DATE}`);
  if (more.length) throw new Error(`${more.length + 1} rows dated ${ROW_DATE}; expected one`);

  const report = await prisma.problemReport.findUnique({
    where: { id: REPORT_ID },
    select: { id: true, status: true, userId: true, userName: true, frontierId: true },
  });
  if (!report) throw new Error(`report not found: ${REPORT_ID}`);
  if (report.status !== "open") throw new Error(`report is ${report.status}, not open`);
  if (report.frontierId !== frontier.id) throw new Error("report is not about this frontier");

  console.log(`frontier : ${frontier.name}`);
  console.log(`row      : ${ROW_DATE}  ${row.attribution}`);
  console.log(`report   : ${report.status}, from ${report.userName ?? "(anonymous)"}\n`);

  let bad = 0;
  const plan: { what: string; before: string | null; after: string; max: number }[] = [
    { what: "row.note", before: row.note, after: (row.note ?? "").replace(OLD, NEW), max: NOTE_MAX },
    {
      what: "frontier.historyNote",
      before: frontier.historyNote,
      after: (frontier.historyNote ?? "").replace(OLD, NEW),
      max: HISTORY_MAX,
    },
  ];
  for (const p of plan) {
    const hits = (p.before ?? "").split(OLD).length - 1;
    const n = charLength(canonical(p.after));
    console.log(`${p.what}: ${hits} occurrence(s); after ${n}/${p.max}${n > p.max ? "  OVER" : ""}`);
    if (hits !== 1) {
      console.log(`  expected exactly one occurrence of the phrase - refusing`);
      bad++;
    }
    if (n > p.max) bad++;
    console.log(`  before: ${p.before}`);
    console.log(`  after : ${p.after}\n`);
  }
  const rlen = charLength(canonical(REPLY));
  console.log(`reply: ${rlen}/${MESSAGE_MAX}${rlen > MESSAGE_MAX ? "  OVER" : ""}`);
  if (rlen > MESSAGE_MAX) bad++;
  if (!report.userId) console.log("NOTE: anonymous report, no reply can be sent");
  if (bad) throw new Error(`${bad} problem(s) - nothing written`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found on this database");

  await prisma.frontierRow.update({ where: { id: row.id }, data: { note: plan[0].after } });
  await prisma.frontier.update({
    where: { id: frontier.id },
    data: { historyNote: plan[1].after },
  });
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
        body: REPLY,
      },
    });
  }
  console.log("\nAPPLIED. The frontier page lags by up to an hour, or until a deploy.");
}

main().finally(() => prisma.$disconnect());
