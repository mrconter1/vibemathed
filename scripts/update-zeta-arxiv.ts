// Bring the zeta-proportion entry up to date with the arXiv version, and
// replace the shallow Lean check with a real source audit. 19 Aug 2026.
//
// The entry was written on 10 August from Anthropic's announcement and its CDN
// PDF. The paper went to arXiv on 13 August as arXiv:2608.13637, under Levent
// Alpöge and Ralph Furman, with the AI statement on the title page. A CDN PDF
// is not a citable primary source and can move; the arXiv version is, so it
// becomes the source and the PDF stays as a link.
//
// Two things the arXiv version says that the entry did not have.
//
// 1. What was actually open, precisely. §1.3: Goldston and Suriajaya "isolated
//    the remaining obstacle as the termwise positivity that fails off the line,
//    and asked what would follow if it could be removed. Theorem A removes it."
//    That is a sharper account than "the standard measure of progress", and it
//    names a question someone posed rather than a record someone held.
//
// 2. The prior records, exactly: 5/12 for simple-and-on-the-line and 0.6603
//    for distinct. The entry had the first and not the second.
//
// The verification note is the substantial change. What was there rested on
// "the repository is real and substantial, 329 Lean files". This audit read the
// sources at v1.0 (commit of 18 Aug):
//
//   * no `sorry` under Zeta23/ - the three grep hits are comment prose about a
//     truncated PrimeNumberTheoremAnd port. The 27 real ones are all in
//     comparator/Challenge*.lean, which state the theorems with placeholder
//     proofs by design.
//   * zero real `axiom` declarations. grep finds `axiom qc : ℚ` and
//     `axiom hqc : qc = 2*qc` in FromPNTPlus/Tactic/AdditiveCombination.lean,
//     but they are inside a ``` fence in the tactic's docstring, not
//     declarations. Worth stating because it is exactly the sort of thing a
//     shallow check gets wrong in either direction.
//   * no native_decide. The single grep hit is a comment saying `decide
//     +kernel` is used instead.
//   * and the one that changes the entry's meaning: the headline theorems are
//     UNCONDITIONAL. Zeta23.thmA₀ takes no hypotheses. PaperInputs is
//     discharged by PaperInputs.of_EF applied to WeilEF.EF_lit_zetaZeroConfig,
//     i.e. Weil's explicit formula is proved in Lean from Mathlib's functional
//     equation, not assumed - along with Riemann-von Mangoldt,
//     Montgomery-Vaughan, Stirling and Chebyshev-Mertens. So this is not a
//     formalization "modulo named literature inputs".
//
// The tier does not move. Lean-checked is about statement anchoring, and the
// trusted statement files are authored in the same repository by the same
// team. What is new is that the repo ships a leanprover/comparator layer built
// for exactly that outside audit, so the note can now say what a promotion
// would take rather than just that it has not happened.
//
// Not run here: the kernel. No Lean toolchain on this machine, and installing
// elan plus a Mathlib build is not something to do unasked. The axiom lines
// remain the repository's own record; the note says so.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "more-than-67-of-riemann-zeta-zeros-are-on-the-critical-line";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "The Riemann hypothesis asserts that every nontrivial zero of the zeta function lies on the critical line. Short of proving it, the standard measure of progress is the proportion of zeros known unconditionally to lie there: Selberg established a positive proportion, Levinson reached a third in 1974, Conrey two fifths in 1989, and the record stood at $\\tfrac{5}{12}$ for zeros that are simple and on the line, and $0.6603$ for distinct zeros.\n\nUnder the Riemann hypothesis, Montgomery deduced $\\tfrac23$ simple from the pair-correlation second moment in 1973. His prime-side evaluation was already unconditional; RH entered only to read the zero side as a positive sum over real ordinates. Goldston and Suriajaya isolated that termwise positivity as the remaining obstacle and asked what would follow if it could be removed.\n\nThis removes it, proving unconditionally that at least $\\tfrac23$ of zeros are simple and on the line and at least $\\tfrac56$ are distinct - $67.25\\ldots\\%$ and $0.83625$ with the Montgomery-Taylor window.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "A sorry-free Lean 4 / Mathlib formalization accompanies the paper, with the statements built from Mathlib's own riemannZeta and analyticOrderAt rather than an assumed form of the result. This site audited the sources at tag v1.0: no sorry under Zeta23/, the 27 real ones all in the comparator/Challenge files that state the theorems with placeholder proofs by design; no native_decide; no axiom declarations - the two a plain grep reports sit inside a tactic's docstring.\n\nOne finding changes the entry's meaning: the headline theorems are unconditional, not modulo literature inputs. Zeta23.thmA0 takes no hypotheses, because Weil's explicit formula is itself proved in Lean from Mathlib's functional equation, as are Riemann-von Mangoldt, Montgomery-Vaughan, Stirling and Chebyshev-Mertens.\n\nStill held at the unaudited rung, for the reason that tier exists: the trusted statement files are written in the same repository by the same team, so nobody independent has checked the Lean statement against the paper's claim. The repository ships a leanprover/comparator challenge-and-solution split built for exactly that audit - running it is what a promotion would take. The kernel was not re-run here; the axiom lines are the repository's own record.\n\nOn human review: two Anthropic mathematicians validated the work, and Brian Conrey and Dan Goldston examined the paper. Examination is not endorsement, and Goldston is an author of the prior work this builds on.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "An unconditional record, not a resolution: the Riemann hypothesis is untouched, and Anthropic states it does not expect these techniques to lead to a proof of it. The paper is explicit that these are lower bounds only - the remaining third of the zeros are not shown to be off the line, merely not reached by the certificate.\n\nWhat it does settle is a question that was posed. Goldston and Suriajaya had reduced Montgomery's conditional $\\tfrac23$ to a single obstruction, the termwise positivity that fails for zeros off the line, and asked what would follow without it. Theorem A replaces that positivity with a rank-trace inequality on a finite compression of Weil's Hermitian form, with Sylvester's law of inertia handling off-line pairs; reading the negative index of truncations as a count of off-line pairs is Bombieri's device. The paper also proves the bound sharp for this route: improving on $\\tfrac23$ this way would need pair-correlation information beyond Fourier support 1.",
  },
  { field: "Source URL", key: "sourceUrl", value: "https://arxiv.org/abs/2608.13637" },
  {
    field: "Source name",
    key: "sourceName",
    value:
      "More than two thirds of the zeros of the Riemann zeta function are simple and on the critical line",
  },
];

const LINKS = [
  {
    label: "Anthropic's announcement",
    url: "https://www.anthropic.com/research/riemann-zeta",
    kind: "announcement",
  },
  {
    label: "The Anthropic PDF the entry was first written from, before the arXiv version",
    url: "https://www-cdn.anthropic.com/564f962e60643842f5fcb4a17c9dbc8f608f1c37.pdf",
    kind: "paper",
  },
  {
    label: "Anthropic's informal note stating the proof concisely",
    url: "https://www-cdn.anthropic.com/23455459f8832d06bb175cc0f88d019aed962ef8.pdf",
    kind: "paper",
  },
  {
    label: "Lean repository - audited at tag v1.0; comparator statements under comparator/",
    url: "https://github.com/anthropics/zeta-23-lean",
    kind: "lean-proof",
  },
  {
    label: "How the argument was found: Claude's account of its own two runs",
    url: "https://www-cdn.anthropic.com/d7f3ecf1d01392d887f8bc974ca187e2a121b1ed.pdf",
    kind: "other",
  },
  {
    label: "Annotated subagent transcripts",
    url: "https://www-cdn.anthropic.com/8a0d1add3c637b858a9a181e98c40e9548c3f44f.pdf",
    kind: "transcript",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "published") throw new Error(`${SLUG} is ${p.status}`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const lim = LIMITS.get(e.key);
    if (lim && typeof e.value === "string" && e.value.length > lim) {
      console.log(`  ${e.key} OVER BY ${e.value.length - lim} (${e.value.length}/${lim})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}: ${l.label}`);
      bad++;
    }
  }

  console.log(`${SLUG}: update (already published)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 110 ? `${s.slice(0, 110)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: significance=${p.significance}, verification=${p.verification}, resolution=${p.resolution}, ai=${p.aiContribution}, publication=${p.publication}`);
  if (bad) throw new Error("fix the flagged fields before applying");
  if (!changes.length) {
    console.log("\nnothing to change");
    return;
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
      },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
  ]);

  console.log(`APPLIED - ${changes.length} fields, ${LINKS.length} links`);
}

main().finally(() => prisma.$disconnect());
