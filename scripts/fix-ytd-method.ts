// YTD entry: resolutionMethod argument -> construction, after VibeGene's
// comment that the paper says "we construct".
//
// The change is the curator's call. Recording the reasoning honestly, because
// the obvious justification does not hold: the catalog is NOT uniformly
// construction for counterexamples. Of 192 disproved entries, 168 are
// construction, 15 are argument and 9 computation, so a disproof filed as
// argument is an established pattern (Kontsevich asphericity, Schiffer /
// Pompeiu, Ross's nondeficient numbers among them) and YTD was not an
// outlier. The case for construction is the plain reading of the field: the
// resolution exhibits an explicit fivefold. The case for argument was the
// paper's own appendix, which says candidates of this shape have been
// available since 2008 and that the mathematical content is the proof that
// the mechanism works. Both are defensible; the first is what the field asks.
//
// The resultNote asserted the old value in so many words, so it changes too -
// a stale note is worse than no note.
//
// Mirrors updateProblem: one changelog row per changed field.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "yau-tian-donaldson-conjecture-csck";

const NEXT_NOTE =
  "The paper's appendix draws a distinction worth keeping: a counterexample may reduce to a finite certificate, checkable once the object is written down, or it may itself be a theorem quantified over all degenerations. This is the second kind. The method field records construction, because the resolution exhibits an explicit fivefold, but the difficulty lay elsewhere - candidate manifolds of this shape have been available since 2008, and what was missing was the proof that the mechanism works.";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, resolutionMethod: true, resultNote: true },
  });
  if (!cur) throw new Error("entry not found");

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const next = { resolutionMethod: "construction", resultNote: NEXT_NOTE };
  for (const [k, v] of Object.entries(next)) {
    const lim = LIMITS.get(k);
    if (lim && v.length > lim) throw new Error(`${k} over by ${v.length - lim}`);
  }

  const changes = Object.entries(next)
    .filter(([k]) => cur[k as "resolutionMethod" | "resultNote"] !== next[k as keyof typeof next])
    .map(([field, newValue]) => ({
      field,
      oldValue: cur[field as "resolutionMethod" | "resultNote"],
      newValue,
    }));

  console.log(`${SLUG} (${cur.status})\n`);
  for (const c of changes) {
    const o = (c.oldValue ?? "null").slice(0, 70);
    const n = c.newValue.slice(0, 70);
    console.log(`  ${c.field}`);
    console.log(`    old: ${o}${(c.oldValue ?? "").length > 70 ? "..." : ""}`);
    console.log(`    new: ${n}${c.newValue.length > 70 ? "..." : ""}`);
  }
  console.log(`\n  changelog rows: ${changes.length}, by ${curator.pseudonym}`);

  if (!changes.length) {
    console.log("\nnothing to change");
    return;
  }
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({ where: { id: cur.id }, data: next }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: cur.id,
        userId: curator.id,
        userName: curator.pseudonym,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
  ]);
  console.log("\nWRITTEN");
}

main().finally(() => prisma.$disconnect());
