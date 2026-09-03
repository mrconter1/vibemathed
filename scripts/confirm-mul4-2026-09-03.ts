// Mul4 moves from Lean-checked to Site-confirmed, on evidence this site
// produced rather than on the author's own CI badge.
//
// The methodology's Site-confirmed tier means the site reproduced the
// artifact: re-ran a certificate, rebuilt a formalization and audited which
// axioms its theorems really use. That is what the new verify-lean workflow
// does, and run 33722071409 is the first use of it.
//
// What was run, on 3 Sep 2026: the release tag n4-arxiv-v2 of
// GregoryMorse/unrestricted-boolean-mul, commit 2ebc0cf4, on the toolchain
// the repository pins (leanprover/lean4:v4.32.1). `lake build` over every
// module, then AxiomAudit.lean, then `lake env leanchecker` replaying the
// whole UnrestrictedBooleanMul environment. 24m40s, all steps green.
//
// Every headline theorem reported the three standard axioms and nothing else:
//
//   mc_mul_zero, mc_mul_one, mc_mul_two, mc_mul_three,
//   N4.no_eight_gate_circuit, N4.mc_mul_four
//     depends on axioms: [propext, Classical.choice, Quot.sound]
//
// No sorryAx anywhere in the log, no project axiom, no native_decide.
//
// One honest detail the note records: the tag is ONE commit ahead of
// 1533276b, the commit the entry cited from the author's own CI. That commit
// (2ebc0cf4, "Prepare n4-arxiv-v2 release") touches .gitignore, CITATION.cff,
// two READMEs and three checksum/audit text files - no Lean source. So the
// mathematics verified here is the mathematics his run verified; the entry
// now points at the tag, which is what the site actually rebuilt.
//
// NOT Lean-verified, and the reason is unchanged: a kernel check tests the
// proof against the statement the author wrote. Whether that statement says
// what the informal Boyar-Find question says is the anchoring half, and no
// workflow can do it.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { recordProvenance } from "../src/lib/provenance";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "unrestricted-multiplicative-complexity-mul4";
const RUN = "https://github.com/mrconter1/vibemathed/actions/runs/33722071409";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  verification: "site-confirmed",
  verificationNote:
    "Site-confirmed: rebuilt here on 3 September 2026, not taken from the author's CI badge. This site's verify-lean workflow checked out release n4-arxiv-v2 (commit 2ebc0cf4) of GregoryMorse/unrestricted-boolean-mul, installed the toolchain the repository pins (leanprover/lean4:v4.32.1), ran $\\texttt{lake build}$ over every module, then the project's own AxiomAudit.lean, then $\\texttt{lake env leanchecker}$ replaying the whole UnrestrictedBooleanMul environment. 24m40s, every step green.\n\nAll six headline theorems - the exact values for $n = 0,1,2,3$, the eight-gate impossibility and $\\mathrm{MC}(\\mathrm{Mul}\\,4) = 9$ - report $\\texttt{propext}$, $\\texttt{Classical.choice}$ and $\\texttt{Quot.sound}$ and nothing else. No $\\texttt{sorryAx}$, no project axiom, no $\\texttt{native\\_decide}$, no $\\texttt{bv\\_decide}$.\n\nThe release tag is one commit ahead of 1533276b, which the author's own run used; that commit touches only READMEs, a citation file and checksum lists, no Lean source.\n\nNot Lean-verified. The kernel checks the proof against the statement the author wrote; whether that statement expresses the Boyar-Find question is the anchoring half, and nobody without a stake has audited it.",
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

  // The verification note is curator prose drafted with AI assistance from a
  // run this site performed. First use of the provenance table.
  await recordProvenance(prisma, cur.id, ["verificationNote"], {
    model: "Claude Opus 5 (via Claude Code)",
    source: `verify-lean run 33722071409 on ${SLUG} release n4-arxiv-v2`,
    userId: curator.id,
    userName: curator.pseudonym,
  });

  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
