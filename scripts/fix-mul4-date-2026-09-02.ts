// Gregory Morse's Mul4 entry had solveDate "2026-08", month precision. The
// list sorts solve dates as strings, and "2026-08" sorts below every
// "2026-08-DD" and below "2026-07-31" too, so an August result sat at rank
// 163 of 647 - page 7 - and he could not find it. The sort itself is fixed in
// the same commit (src/lib/list-settings.ts); this corrects the date, which
// was imprecise rather than wrong: arXiv v1 was posted 31 Aug 2026 and the
// verification CI run he cites is dated the same day.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "unrestricted-multiplicative-complexity-mul4";
const NEXT = "2026-08-31";

async function main() {
  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");
  const cur = await prisma.problem.findUnique({ where: { slug: SLUG }, select: { id: true, solveDate: true, status: true } });
  if (!cur) throw new Error("entry not found");
  console.log(`${SLUG}: solveDate ${cur.solveDate} -> ${NEXT} (status ${cur.status})`);
  if (cur.solveDate === NEXT) { console.log("already set"); return; }
  if (!APPLY) { console.log("DRY RUN - pass --apply to write"); return; }
  await prisma.$transaction([
    prisma.problem.update({ where: { id: cur.id }, data: { solveDate: NEXT } }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "updated", field: "Solve date", oldValue: cur.solveDate, newValue: NEXT },
    }),
  ]);
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
