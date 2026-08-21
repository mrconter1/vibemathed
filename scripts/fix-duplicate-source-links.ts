// Remove links that repeat the entry's primary source, which the audit
// (npm run audit:lengths) flags as link-rule breaches: the entry page already
// renders the primary source, so a link with the same URL renders twice.
//
// Nine entries. Five are from the 21 Aug Zeilberger import, where the single
// link labelled "Code, data and verification scripts" pointed at the same
// arXiv abstract as the primary source - a wrong label on a duplicate, my
// mistake. The other four predate it; their labels are richer but describe
// the primary source itself, which sourceName already names on the page.
//
// Each removal gets a changelog row, same shape as updateProblem's.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const norm = (u: string) => u.trim().replace(/\/+$/, "").toLowerCase();

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const rows = await prisma.problem.findMany({
    where: { status: "published" },
    select: {
      id: true,
      slug: true,
      sourceUrl: true,
      links: { select: { id: true, label: true, url: true, kind: true, position: true }, orderBy: { position: "asc" } },
    },
  });

  let entries = 0, removed = 0;
  for (const r of rows) {
    if (!r.sourceUrl) continue;
    const dup = r.links.filter((l) => norm(l.url) === norm(r.sourceUrl!));
    if (!dup.length) continue;
    entries++;
    removed += dup.length;

    const keep = r.links.filter((l) => norm(l.url) !== norm(r.sourceUrl!));
    const before = r.links.map((l) => `${l.label} <${l.url}>`).join("; ") || null;
    const after = keep.map((l) => `${l.label} <${l.url}>`).join("; ") || null;

    console.log(`${r.slug}`);
    for (const d of dup) console.log(`  - [${d.kind}] ${d.label}`);
    if (!APPLY) continue;

    await prisma.$transaction([
      prisma.problemLink.deleteMany({ where: { id: { in: dup.map((d) => d.id) } } }),
      // Close the position gaps so the survivors stay ordered from zero.
      ...keep.map((l, position) =>
        prisma.problemLink.update({ where: { id: l.id }, data: { position } }),
      ),
      prisma.problemActivity.create({
        data: {
          problemId: r.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: "updated",
          field: "links",
          oldValue: before,
          newValue: after,
        },
      }),
    ]);
    console.log("  WRITTEN");
  }

  console.log(`\n${removed} duplicate links across ${entries} entries`);
  if (!APPLY) console.log("DRY RUN - pass --apply to write");
}

main().finally(() => prisma.$disconnect());
