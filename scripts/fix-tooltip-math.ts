// The three footnote fields are plain text, so six entries were showing
// literal dollar signs. 13 Aug 2026.
//
// `significanceNote`, `ageNote` and `solveCostNote` all render through
// `StarNote`, which is a CLIENT component - it needs useState and a portal for
// the hover bubble. Every other prose field on an entry goes through `<TeX>`,
// which is a server component precisely so KaTeX never reaches the browser.
// A client component cannot call it, so these three have always been plain
// text; the six notes below were written with $...$ and rendered the
// delimiters verbatim.
//
// Fixed as content rather than code. Wiring math into the bubbles would mean
// pre-rendering the HTML on the server and threading it through the card
// payload for all 560 entries - roughly 170KB on a page that already
// lazy-loads statements to avoid exactly that - to serve six short fragments
// that read perfectly well as Unicode. If a footnote ever genuinely needs
// display math, the field is the wrong home for it.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Fix {
  slug: string;
  field: "significanceNote" | "ageNote" | "solveCostNote";
  from: string;
  to: string;
}

const FIXES: Fix[] = [
  { slug: "t-edge-balanced-existence", field: "significanceNote", from: "$t = 3$", to: "t = 3" },
  { slug: "sum-free-lattice-cube-density", field: "significanceNote", from: "$d = 2$", to: "d = 2" },
  { slug: "sum-free-lattice-cube-density", field: "significanceNote", from: "$d = 3,4$", to: "d = 3,4" },
  { slug: "kac-walk-cutoff-sphere", field: "ageNote", from: "$2n\\log n$", to: "2n log n" },
  { slug: "erdos-1201", field: "ageNote", from: "$n^{1/2-\\epsilon}$", to: "n^(1/2 - ε)" },
  { slug: "crouzeix-s-conjecture", field: "ageNote", from: "$1+\\sqrt{2}$", to: "1 + √2" },
  {
    slug: "a-counterexample-to-the-inverse-generator-problem-and-related-questions",
    field: "ageNote",
    from: "$\\pi/2$",
    to: "π/2",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  // Group by entry, since two fixes land on the same significance note and a
  // second update reading stale text would undo the first.
  const bySlug = new Map<string, Fix[]>();
  for (const f of FIXES) bySlug.set(f.slug, [...(bySlug.get(f.slug) ?? []), f]);

  const writes: { slug: string; field: string; before: string; after: string; id: string }[] = [];

  for (const [slug, fixes] of bySlug) {
    const p = await prisma.problem.findUnique({ where: { slug } });
    if (!p) throw new Error(`no entry ${slug}`);
    const byField = new Map<string, Fix[]>();
    for (const f of fixes) byField.set(f.field, [...(byField.get(f.field) ?? []), f]);

    for (const [field, group] of byField) {
      const before = (p as unknown as Record<string, string | null>)[field];
      if (before === null || before === undefined) throw new Error(`${slug}.${field} is empty`);
      let after = before;
      for (const f of group) {
        if (!after.includes(f.from)) throw new Error(`${slug}.${field} does not contain ${f.from}`);
        after = after.replace(f.from, f.to);
      }
      if (/\$/.test(after)) throw new Error(`${slug}.${field} still has a dollar sign after fixing`);
      writes.push({ slug, field, before, after, id: p.id });
    }
  }

  for (const w of writes) {
    console.log(`${w.slug}.${w.field}`);
    console.log(`  - ${w.before.length > 150 ? w.before.slice(0, 150) + "..." : w.before}`);
    console.log(`  + ${w.after.length > 150 ? w.after.slice(0, 150) + "..." : w.after}`);
  }
  console.log(`\n${writes.length} field(s) on ${bySlug.size} entries`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const w of writes) {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: w.id }, data: { [w.field]: w.after } }),
      prisma.problemActivity.create({
        data: {
          problemId: w.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated",
          field: w.field === "significanceNote" ? "Significance note" : "Age note",
          oldValue: w.before,
          newValue: w.after,
        },
      }),
    ]);
  }
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
