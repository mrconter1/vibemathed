// Conway's refinement conjecture moves from Lean-verified to Site-confirmed,
// on evidence this site produced rather than on the repository's own CI.
//
// What was run, on 4 Sep 2026: gaearon/conway-refinement at commit
// 264445c93b78554c408e99e4e7f663693b4e91ab, the commit the entry cites, on
// the toolchain the repository pins (leanprover/lean4:v4.31.0), with its
// CombinatorialGames dependency. `lake build` over every module (3145 jobs,
// the Mathlib cache did not cover CombinatorialGames so that part compiled
// from source), then the project's own scripts/Axioms.lean, then
// `lake env leanchecker` replaying the whole ConwayRefinement environment.
// Run 33843993855, 06:21 to 06:58 UTC, every step green.
//
// Both formulations of the conjecture reported the three standard axioms and
// nothing else:
//
//   ConwayRefinement.Standalone.Oz.ConwayConjecture.proof
//   ConwayRefinement.Standalone.InlineConwayRefinement.Surreal.ConwayConjecture.proof
//     depends on axioms: [propext, Classical.choice, Quot.sound]
//
// No sorryAx, no project axiom.
//
// It stays at Candidate. The kernel checks the proof against the statement
// the author wrote, and whether that statement is Conway's is the one thing
// the author himself flags as unchecked. Nobody without a stake has read it.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { recordProvenance } from "../src/lib/provenance";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "conway-s-refinement-conjecture-for-omnific-integers";
const RUN = "https://github.com/mrconter1/vibemathed/actions/runs/33843993855";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  verification: "site-confirmed",
  verificationNote:
    "Site-confirmed: rebuilt here on 4 September 2026, not taken from the repository's CI. This site's verify-lean workflow checked out gaearon/conway-refinement at commit 264445c9, the commit the entry cites, installed the toolchain it pins (leanprover/lean4:v4.31.0) with its CombinatorialGames dependency, ran $\\texttt{lake build}$ over every module (3145 jobs), then the project's own scripts/Axioms.lean, then $\\texttt{lake env leanchecker}$ replaying the whole ConwayRefinement environment. 37 minutes, every step green.\n\nBoth formulations of the conjecture - the one over the CombinatorialGames $\\texttt{Surreal}$ type and the Mathlib-only one with the surreal definitions inlined - report $\\texttt{propext}$, $\\texttt{Classical.choice}$ and $\\texttt{Quot.sound}$ and nothing else. No $\\texttt{sorryAx}$, no project axiom.\n\nStill Candidate rather than Resolved, and the reason is the one the author gives himself: a kernel checks the proof against the statement as written, and whether that statement is Conway's conjecture is a reading a surreal-number specialist has to do. The definition used is Conway's own cut $x = \\{x - 1 \\mid x + 1\\}$ and the statement is a few lines, so it is an afternoon's work for the right reader. Nobody without a stake has done it yet.",
};

const LINKS = [
  {
    label: "Rebuilt here: lake build, axiom audit and leanchecker replay",
    url: RUN,
    kind: "independent",
  },
];

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, verification: true, _count: { select: { links: true } } },
  });
  if (!cur) throw new Error("entry not found");
  if (cur.status !== "published") throw new Error(`status is ${cur.status}`);

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (typeof v === "string" && lim) {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  const existing = await prisma.problemLink.findMany({ where: { problemId: cur.id }, select: { url: true } });
  const add = LINKS.filter((l) => !existing.some((e) => e.url === l.url));

  console.log(`\n${SLUG}`);
  console.log(`  verification: ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  +${add.length} link(s)`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const n = cur._count.links;
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        links: { create: add.map((l, i) => ({ ...l, position: n + i })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: {
        problemId: cur.id,
        userId: curator.id,
        userName: curator.pseudonym,
        type: "updated",
        field: "Verification",
        oldValue: cur.verification,
        newValue: NEXT.verification as string,
      },
    }),
  ]);

  await recordProvenance(prisma, cur.id, ["verificationNote"], {
    model: "Claude Fable 5.1 (via Claude Code)",
    source: `verify-lean run 33843993855 on gaearon/conway-refinement@264445c9`,
    userId: curator.id,
    userName: curator.pseudonym,
  });

  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
