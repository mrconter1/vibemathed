// The link rules the forms enforce, applied to what scripts wrote. 13 Aug 2026.
//
// `parseLinks` refuses two things that Prisma does not: a link repeating the
// entry's own primary source, and a label over 120 characters. Twelve rows
// broke one or the other, all written by curator scripts.
//
// The eight duplicates carry no information - the entry page already renders
// `sourceUrl` above the link list, so each was the same document listed twice,
// which is exactly the failure the rule exists to prevent. The four long
// labels are all on the Gamow entry, where the annotation after the citation
// ran away.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { sameDocument } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

/// Entries carrying a link that repeats their own primary source.
const DEDUPE = [
  "phelps-rodriguez-conjecture",
  "gamow-liquid-drop-minimizer-conjecture",
  "treglown-equitable-acyclic-colouring-conjecture",
  "seymour-second-neighborhood-conjecture-dense-case",
  "teschner-s-bondage-number-conjecture",
  "borsuk-conjecture-lowest-ever-counterexample-n-63",
  "word-length-spectral-triples-compact-quantum-metric-spaces",
  "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path",
];

/// Old label -> new label, for the rows over 120 characters.
const RELABEL = new Map<string, string>([
  [
    "Agostiniani and Mazzieri, Monotonicity formulas in potential theory (Calc. Var. 2020) - the estimate the capacitary argument sharpens",
    "Agostiniani-Mazzieri, Monotonicity formulas in potential theory (2020) - the estimate the capacitary argument sharpens",
  ],
  [
    "Schulz, An improved nonexistence bound for the liquid drop model (arXiv:2608.09000) - the V >= 7.5 bound from two days earlier",
    "Schulz, An improved nonexistence bound for the liquid drop model (2026) - the V >= 7.5 bound, two days earlier",
  ],
  [
    "Frank, Killip and Nam, Nonexistence of large nuclei in the liquid drop model (Lett. Math. Phys. 2016) - the V > 8 bound the nonexistence proof reduces to",
    "Frank-Killip-Nam, Nonexistence of large nuclei (2016) - the V > 8 bound the nonexistence proof reduces to",
  ],
  [
    "Frank and Nam, Existence and nonexistence in the liquid drop model (Calc. Var. 2021) - existence up to the threshold, used by the proof",
    "Frank-Nam, Existence and nonexistence in the liquid drop model (2021) - existence up to V_*, used by the proof",
  ],
]);

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  for (const [, v] of RELABEL) {
    if (v.length > 120) throw new Error(`replacement label still ${v.length} chars: ${v}`);
  }

  const deletes: { id: string; slug: string; label: string; url: string }[] = [];
  const relabels: { id: string; slug: string; from: string; to: string }[] = [];

  for (const slug of DEDUPE) {
    const p = await prisma.problem.findUnique({ where: { slug }, include: { links: true } });
    if (!p) throw new Error(`no entry ${slug}`);
    const dups = p.links.filter((l) => sameDocument(l.url, p.sourceUrl));
    if (!dups.length) throw new Error(`${slug} has no link repeating its source`);
    for (const d of dups) deletes.push({ id: d.id, slug, label: d.label, url: d.url });
  }

  const withLong = await prisma.problemLink.findMany({ include: { problem: true } });
  for (const l of withLong) {
    if (l.label.length <= 120) continue;
    const to = RELABEL.get(l.label);
    if (!to) throw new Error(`unmapped long label on ${l.problem.slug}: ${l.label}`);
    relabels.push({ id: l.id, slug: l.problem.slug, from: l.label, to });
  }

  console.log(`DELETE ${deletes.length} links that repeat their entry's primary source:\n`);
  for (const d of deletes) console.log(`  ${d.slug}\n    "${d.label}"\n    ${d.url}`);
  console.log(`\nRELABEL ${relabels.length} links over 120 chars:\n`);
  for (const r of relabels) {
    console.log(`  ${r.slug}\n    - [${r.from.length}] ${r.from}\n    + [${r.to.length}] ${r.to}`);
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const d of deletes) {
    await prisma.problemLink.delete({ where: { id: d.id } });
  }
  for (const r of relabels) {
    await prisma.problemLink.update({ where: { id: r.id }, data: { label: r.to } });
  }

  // One changelog row per entry touched, rather than per link: the reader
  // cares that the link list changed, not which id moved.
  const touched = new Set([...deletes.map((d) => d.slug), ...relabels.map((r) => r.slug)]);
  for (const slug of touched) {
    const p = await prisma.problem.findUnique({ where: { slug } });
    if (!p) continue;
    const dropped = deletes.filter((d) => d.slug === slug).length;
    const renamed = relabels.filter((r) => r.slug === slug).length;
    await prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "Links",
        oldValue: [
          dropped ? `${dropped} link repeating the primary source` : null,
          renamed ? `${renamed} label over 120 characters` : null,
        ]
          .filter(Boolean)
          .join("; "),
        newValue: "removed / shortened to satisfy the link rules",
      },
    });
  }
  console.log(`APPLIED - ${deletes.length} deleted, ${relabels.length} relabelled`);
}

main().finally(() => prisma.$disconnect());
