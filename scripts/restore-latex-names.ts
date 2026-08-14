// Restore the nine LaTeX names stripped on 13 Aug. 14 Aug 2026.
//
// Yesterday's cleanup treated titles as one thing; they are two. The full
// name renders through the KaTeX pipeline on every HTML surface and always
// did - stripping its math traded "$L_p$ renders beautifully on the entry
// page" for "Lp reads flat everywhere". What actually breaks on math in
// titles is the plain-text surfaces, and those all degrade through deTeX
// (title tag and OG already did; the RSS feed and relation picker are fixed
// alongside this script).
//
// The SHORT names stay ASCII: they render on chart axes, which are SVG text
// and cannot carry markup. That split - name renders math, shortName is
// plain - is now what the field specs enforce.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const RESTORE: { slug: string; to: string }[] = [
  { slug: "strichartz-tse-radon-nikodym-integrability", to: "Strichartz-Tse $L^p$-Integrability on the Sierpinski Gasket" },
  { slug: "t-edge-balanced-existence", to: "Existence of $t$-Edge-Balanced Graphs for $t \\ge 3$" },
  { slug: "covering-number-c-12-6-4", to: "The Covering Number $C(12,6,4)$" },
  { slug: "e-log-concavity-chromatic-quasisymmetric", to: "$e$-Log-Concavity of Chromatic Quasisymmetric Functions" },
  { slug: "fulek-l3-linear-extremal-bound", to: "Fulek's Question on the Extremal Function of $L_3$" },
  { slug: "k-antichains-unit-cube", to: "Conjecture on $k$-Antichains in the Unit Cube" },
  { slug: "primariness-lp-l1", to: "Primariness of the Mixed-Norm Space $L_p(L_1)$" },
  { slug: "ghasemi-kopparty-sparse-decoding-polynomials", to: "Ghasemi-Kopparty Problem on Sparse $S$-Decoding Polynomials" },
  { slug: "hadwiger-debrunner-line-arrangements", to: "General Position for Planar Line Arrangements and $HD_2(p,3)$" },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const plan: { id: string; slug: string; before: string; after: string }[] = [];
  for (const r of RESTORE) {
    const p = await prisma.problem.findUnique({ where: { slug: r.slug } });
    if (!p) throw new Error(`no entry ${r.slug}`);
    if (p.name === r.to) {
      console.log(`  ${r.slug}: already restored, skipping`);
      continue;
    }
    if (p.name.includes("$")) throw new Error(`${r.slug} name already has $ but differs - inspect`);
    plan.push({ id: p.id, slug: r.slug, before: p.name, after: r.to });
  }

  for (const w of plan) console.log(`${w.slug}\n  - ${w.before}\n  + ${w.after}`);
  console.log(`\n${plan.length} names restored; short names stay ASCII`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  for (const w of plan) {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: w.id }, data: { name: w.after } }),
      prisma.problemActivity.create({
        data: {
          problemId: w.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated",
          field: "Name",
          oldValue: w.before,
          newValue: w.after,
        },
      }),
    ]);
  }
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
