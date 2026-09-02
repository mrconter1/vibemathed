// Consistency pass, 2 Sep 2026, over the published entries whose human
// collaborator is Jihao Liu (thirteen after the Yau-Tian-Donaldson hold).
//
// All thirteen are correctly at Unreviewed. What varied was the wording: some
// verification notes said "checkable directly" or "arXiv preprint, not
// peer-reviewed" without saying that nobody independent has in fact checked
// them. "Checkable" and "checked" are different claims, and on entries whose
// proofs the author's own agent systems produced (Rethlas, Danus), the
// difference is the whole point of the tier. Every note that does not already
// say "independent" gets one leading sentence: "No independent check."
//
// Nothing else changes. Recorded in each entry's public changelog as an edit
// to the verification note, like any other curator edit.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const PREFIX = "No independent check. ";
const MAX = 1500;

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const rows = await prisma.problem.findMany({
    where: { status: "published", humanCollaborators: { has: "Jihao Liu" } },
    orderBy: { solveDate: "asc" },
    select: { id: true, slug: true, verification: true, verificationNote: true },
  });
  console.log(`${rows.length} published entries with Jihao Liu as collaborator`);

  let changed = 0;
  for (const r of rows) {
    if (r.verification !== "unreviewed") throw new Error(`${r.slug} is ${r.verification} - stop and look`);
    const note = r.verificationNote ?? "";
    if (/independent/i.test(note)) {
      console.log(`  keep   ${r.slug}`);
      continue;
    }
    const next = (PREFIX + note).trim();
    if (next.length > MAX) throw new Error(`${r.slug}: note would exceed ${MAX}`);
    console.log(`  change ${r.slug}: "${note.slice(0, 60)}..." -> "${next.slice(0, 60)}..."`);
    changed++;
    if (!APPLY) continue;
    await prisma.$transaction([
      prisma.problem.update({ where: { id: r.id }, data: { verificationNote: next } }),
      prisma.problemActivity.create({
        data: {
          problemId: r.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: "updated",
          field: "Verification note",
          oldValue: note.slice(0, 500),
          newValue: next.slice(0, 500),
        },
      }),
    ]);
  }
  console.log(`\n${changed} to change. ${APPLY ? "APPLIED." : "DRY RUN - pass --apply to write"}`);
}

main().finally(() => prisma.$disconnect());
