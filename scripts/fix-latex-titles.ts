// Strip LaTeX from entry titles. 13 Aug 2026.
//
// Titles render in plain-text surfaces the statement never reaches - browser
// tabs, RSS, OG tags, search matching, the relation picker, hover cards - and
// on every one of them "$L_p$" shows as raw source. Fifteen entries carried
// $...$ in the name or short name; from now the parsers refuse a "$" there
// (see `plainText` on the field specs), and these rewrites bring the stock
// into line, in the ASCII math notation most short names already use
// (L^p, n=5, H_125).
//
// One of the sixteen was never LaTeX at all: "Erdős #707 ($1000)" is the
// problem's prize. It is reworded anyway, because a validator with one
// exception is a validator nobody can predict.
//
// Slugs are untouched - the slug is URL identity and never derived from the
// name after creation.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Fix {
  slug: string;
  field: "name" | "shortName";
  to: string;
}

const FIXES: Fix[] = [
  { slug: "strichartz-tse-radon-nikodym-integrability", field: "name", to: "Strichartz-Tse L^p-Integrability on the Sierpinski Gasket" },
  { slug: "t-edge-balanced-existence", field: "name", to: "Existence of t-Edge-Balanced Graphs for t ≥ 3" },
  { slug: "t-edge-balanced-existence", field: "shortName", to: "t-edge-balanced graphs" },
  { slug: "covering-number-c-12-6-4", field: "name", to: "The Covering Number C(12,6,4)" },
  { slug: "e-log-concavity-chromatic-quasisymmetric", field: "name", to: "e-Log-Concavity of Chromatic Quasisymmetric Functions" },
  { slug: "erdos-707-sidon-perfect-difference", field: "shortName", to: "Erdős #707 (1000-dollar prize)" },
  { slug: "symmetrically-colored-k-ap-bound", field: "shortName", to: "Symmetric k-AP colorings" },
  { slug: "kirby-4-37-irreducible-projective-plane", field: "shortName", to: "Irreducible projective plane in S^4" },
  { slug: "fulek-l3-linear-extremal-bound", field: "name", to: "Fulek's Question on the Extremal Function of L_3" },
  { slug: "double-covers-discrete-box", field: "shortName", to: "Double covers of {0,1,2}^d" },
  { slug: "hessian-conjecture-five-variable-counterexample", field: "shortName", to: "Hessian conjecture, n=5" },
  { slug: "k-antichains-unit-cube", field: "name", to: "Conjecture on k-Antichains in the Unit Cube" },
  { slug: "primariness-lp-l1", field: "name", to: "Primariness of the Mixed-Norm Space L_p(L_1)" },
  { slug: "primariness-lp-l1", field: "shortName", to: "Primariness of L_p(L_1)" },
  { slug: "davenport-constant-heisenberg-125", field: "shortName", to: "Davenport, H_125" },
  { slug: "ghasemi-kopparty-sparse-decoding-polynomials", field: "name", to: "Ghasemi-Kopparty Problem on Sparse S-Decoding Polynomials" },
  { slug: "hadwiger-debrunner-line-arrangements", field: "name", to: "General Position for Planar Line Arrangements and HD_2(p,3)" },
];

const LABEL: Record<string, string> = { name: "Name", shortName: "Short name" };
const CAP: Record<string, number> = { name: 200, shortName: 60 };

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const plan: { id: string; slug: string; field: string; before: string; after: string }[] = [];
  for (const f of FIXES) {
    if (f.to.includes("$")) throw new Error(`replacement still has a $ on ${f.slug}`);
    if (f.to.length > CAP[f.field]) throw new Error(`${f.slug}.${f.field} over ${CAP[f.field]}`);
    const p = await prisma.problem.findUnique({ where: { slug: f.slug } });
    if (!p) throw new Error(`no entry ${f.slug}`);
    const before = p[f.field];
    if (!before.includes("$")) throw new Error(`${f.slug}.${f.field} has no $ - already fixed?`);
    plan.push({ id: p.id, slug: f.slug, field: f.field, before, after: f.to });
  }

  // The list above must be exhaustive, or the stock stays half-cleaned.
  const remaining = await prisma.problem.findMany({
    where: {
      status: "published",
      OR: [{ name: { contains: "$" } }, { shortName: { contains: "$" } }],
      slug: { notIn: [...new Set(FIXES.map((f) => f.slug))] },
    },
    select: { slug: true },
  });
  if (remaining.length) {
    throw new Error(`unfixed titles remain: ${remaining.map((r) => r.slug).join(", ")}`);
  }

  for (const w of plan) {
    console.log(`${w.slug}.${w.field}\n  - ${w.before}\n  + ${w.after}`);
  }
  console.log(`\n${plan.length} rewrites`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  for (const w of plan) {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: w.id }, data: { [w.field]: w.after } }),
      prisma.problemActivity.create({
        data: {
          problemId: w.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated",
          field: LABEL[w.field],
          oldValue: w.before,
          newValue: w.after,
        },
      }),
    ]);
  }
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
