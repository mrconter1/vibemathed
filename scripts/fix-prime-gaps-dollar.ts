// `{,}` is a math-mode thousands separator. In my statement it sits in TEXT, so
// once the renderer stops mis-pairing the escaped dollar the braces become
// visible: "$10{,}000". Plain comma instead.
//
// The renderer fix in src/lib/tex-tokens.ts is what repairs the cascade; this
// only cleans up the one string that would still read wrong afterwards.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "tilted-residue-class-construction-for-long-prime-free-intervals";

(async () => {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, statement: true, resultNote: true, significanceNote: true },
  });
  if (!cur) throw new Error("entry not found");
  if (!cur.statement) throw new Error("entry has no statement");

  const next = cur.statement.replace(/\{,\}/g, ",");
  if (next === cur.statement) { console.log("nothing to change"); return; }

  console.log(`  statement: ${cur.statement.length} -> ${next.length}`);
  console.log(`  before: ${cur.statement.slice(120, 210)}`);
  console.log(`  after : ${next.slice(120, 210)}`);

  // The other two notes were written with a plain comma already - confirm rather
  // than assume, since they carry the same amount.
  for (const [name, v] of [["resultNote", cur.resultNote], ["significanceNote", cur.significanceNote]] as const) {
    console.log(`  ${name} still contains "{,}": ${v?.includes("{,}") ?? false}`);
  }

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }
  await prisma.problem.update({ where: { id: cur.id }, data: { statement: next } });
  console.log("\nAPPLIED");
})().finally(() => prisma.$disconnect());
