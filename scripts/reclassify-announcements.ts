/// One-off: promote existing links that are announcements to the new kind.
///
/// Runs the real `inferLinkKind` rather than a copy of its regexes, so this
/// agrees with what a newly submitted link would be classified as. Only
/// promotions TO `announcement` are applied - re-inferring every link would
/// silently rewrite curation decisions that were made by hand.
///
///   npx tsx scripts/reclassify-announcements.ts          # dry run
///   npx tsx scripts/reclassify-announcements.ts --apply

import { PrismaClient } from "@prisma/client";
import { inferLinkKind } from "../src/lib/link-kinds";

const apply = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const links = await db.problemLink.findMany({
    include: { problem: { select: { slug: true, status: true } } },
  });

  const moves = links.filter(
    (l) => l.kind !== "announcement" && inferLinkKind(l.url, l.label) === "announcement",
  );

  for (const l of moves) {
    console.log(`${l.problem.status.padEnd(9)} ${l.problem.slug}`);
    console.log(`  ${l.kind} -> announcement   "${l.label}"`);
    console.log(`  ${l.url}`);
  }
  console.log(`\n${moves.length} link(s) to promote${apply ? "" : "  (dry run, pass --apply)"}`);

  if (apply) {
    for (const l of moves) {
      await db.problemLink.update({ where: { id: l.id }, data: { kind: "announcement" } });
    }
    console.log("applied");
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
