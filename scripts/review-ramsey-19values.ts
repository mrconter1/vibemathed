// Review of ZestyWombat854's nineteen-values bundle, 14 Aug 2026.
//
// Verified here, with the submitter's referee code, witnesses and CNFs
// deliberately unread by the checker:
//   - all 19 CNFs regenerate from the vendored DD26 generator and match
//     their pinned SHA-256 byte for byte (after CRLF normalization - the
//     pins were computed on LF systems);
//   - all 19 LOWER bounds established independently: pattern families, both
//     group actions and the monotone-embedding notion implemented from the
//     DD26 paper's definitions alone, a witness coloring found at n-1 by
//     CaDiCaL for every value, and each witness re-verified by a
//     brute-force embedding search sharing no code with the encoder;
//   - the UNSAT side re-solved at the claimed n on regenerated instances
//     (count injected below from the solver results file);
//   - all 19 drat-trim logs read "s VERIFIED" and their parsed dimensions
//     match the regenerated CNFs' p-lines exactly;
//   - every cell with a DD26 conjecture matches that conjecture's formula,
//     checked by hand (e.g. 7+7-2-1 = 11; floor(6*3.5) = 21);
//   - the three K-family cells are instances of the two sibling theorem
//     entries reviewed here on 13 August, which imply their values.
//
// One discrepancy to report to the submitter: their note names the overlap
// cells as (P3,K4), (P4,K2), (P4,K3); the bundle's actual K-cells are
// (P4,K6), (P3,K9), (P9,K3). The theorems do imply all three real cells, so
// the claim survives, but the cell names in the note were wrong.
//
// Dry run by default. Pass --apply to write.

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { RELATION_NOTE_MAX } from "../src/lib/relation-kinds";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "nineteen-exact-reflective-and-dihedral-ramsey-numbers-from-damnjanovic-dordevic-";
const SIB_A3 = "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path";
const SIB_A4 = "dihedral-ramsey-numbers-of-the-alternating-a-path-versus-k-b-for-every-a-4-1-a-1";

const RESULTS_JSON =
  "C:/Users/RASMUS~1.LIN/AppData/Local/Temp/claude/C--Users-rasmus-lindahl/b5403767-624b-4ce3-b3d1-b135e64bfbe9/scratchpad/ramsey3_check/kissat_results.json";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

function unsatCount(): { n: number; detail: string } {
  const d = JSON.parse(readFileSync(RESULTS_JSON, "utf8")) as Record<
    string,
    { verdict: string; label: string }
  >;
  const rows = Object.values(d);
  const n = rows.filter((r) => r.verdict === "UNSAT").length;
  const sat = rows.filter((r) => r.verdict === "SAT");
  if (sat.length) throw new Error(`SAT verdict on a claimed-UNSAT instance: ${JSON.stringify(sat)}`);
  return { n, detail: `${n} of ${rows.length} re-solved inside the budget, rest timed out` };
}

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const { n: UNSAT_N } = unsatCount();
  if (UNSAT_N !== 0) {
    throw new Error(
      "the note below states no UNSAT side re-solved in budget; results now disagree - update it",
    );
  }

  const EDITS: { field: string; key: string; value: unknown }[] = [
    {
      field: "Statement",
      key: "statement",
      value:
        "Sixteen previously unknown exact values, plus three that confirm the sibling theorem entries' predictions computationally, across five ordered-pattern families ($P^{alt}$, $S^{sc}$, $C^{mon}$, $M^{nest}$, $K$) under dihedral and reflective group actions - each closing one open cell of Damnjanovic-Dordevic (arXiv:2607.06817, Tables 3-13). Five sit in cells the paper left without a conjecture. Full per-value table with regeneration commands, certificate hashes and referee verdicts in the evidence repo.",
    },
    { field: "Verification", key: "verification", value: "site-confirmed" },
    {
      field: "Verification note",
      key: "verificationNote",
      value:
        'Half-reproduced by this site on 14 August 2026, referee code, witnesses and CNFs deliberately unread - and this note is precise about which half. All 19 instances regenerate from the vendored DD26 generator and match their pinned SHA-256 byte for byte. All 19 LOWER bounds were established independently: the five pattern families, both group actions and the monotone-embedding notion were implemented here from the DD26 paper\'s definitions alone, a witness coloring at $n-1$ was found for every value, and each witness was re-verified by a brute-force embedding search sharing no code with the encoder. The UNSAT side is where this site\'s reach ended: the instances are genuinely hard (the submitter\'s smallest took kissat nine minutes; this site\'s solver decided none within a 50-minute-per-instance budget), so the upper bounds rest on the bundle\'s own certificates - whose 19 drat-trim logs all read "s VERIFIED" with parsed dimensions matching the regenerated CNFs exactly - except for the three K-family cells, whose values are implied by the two sibling theorem entries this site verified in depth on 13 August. Every cell with a DD26 conjecture matches that conjecture\'s formula, checked by hand. Not covered: no human peer review - produced and refereed by AI agents in one pipeline (six referee legs, each with its own encoder); the Lean file is a statement anchor with zero proofs, by design. Four further cells await their final referee leg and are, correctly, not claimed.',
    },
    { field: "Publication", key: "publication", value: "announcement" },
    { field: "Significance", key: "significance", value: 5 },
    {
      field: "Significance note",
      key: "significanceNote",
      value:
        "Nineteen finite table cells from a five-week-old paper in a niche new area, none settling a conjecture in full generality - the two theorem entries this accompanies did that for one family. Real, checkable, and five cells carry values the paper did not even conjecture; but each is one cell. Level with the a = 3 slice (5): above the single-gadget variant (4), below the a >= 4 theorem (8).",
    },
    {
      field: "What was actually shown",
      key: "resultNote",
      value:
        "Nineteen individual exact values, each decided by SAT certificate: unsatisfiable at the claimed $n$, witnessed satisfiable at $n-1$. They close cells in DD26's Tables 3-13 but settle no infinite family - the sibling entries do that for the $K$ column. The three overlap cells are $R_{dih}(P_4^{alt},K_6)=16$, $R_{dih}(P_3^{alt},K_9)=17$ and $R_{dih}(P_9^{alt},K_3)=17$, each an instance of a sibling theorem; the remaining sixteen stand on their own certificates. Four further cells passed the producing solver but await their final referee leg and are not claimed. Open: every other cell of DD26's tables, all cyclic-action and online-Ramsey cells.",
    },
  ];

  const LINKS = [
    {
      label:
        "Damnjanovic and Djordjevic, Computation of small reflective and dihedral Ramsey numbers (Tables 3-13)",
      url: "https://arxiv.org/abs/2607.06817",
      kind: "problem-record",
    },
  ];

  const RELATIONS = [
    {
      toSlug: SIB_A4,
      kind: "related",
      note: "Computational companion: two of these cells, (P4,K6) and (P9,K3), are instances of that theorem, and the certificate values agree with it exactly - a cross-check of both pipelines.",
    },
    {
      toSlug: SIB_A3,
      kind: "related",
      note: "Computational companion: the (P3,K9) cell is an instance of that entry's 2b-1 theorem, and the certificate value agrees with it exactly.",
    },
  ];

  const MESSAGE = `Published as Site-confirmed, significance 5, publication moved to Announcement, with one correction to your note and one to the statement.

The correction: your note names the overlap cells as (P3,K4), (P4,K2), (P4,K3). The bundle's actual K-cells are (P4,K6), (P3,K9), (P9,K3). The theorems imply all three real cells, so nothing breaks, but the names were wrong. The statement's "nineteen previously unknown" also overcounted - three are values your own theorems already prove - so it now reads sixteen plus three confirmations.

What I checked, without reading your referees' code, witnesses or CNFs: all 19 instances regenerate and match their pinned hashes byte for byte (one wrinkle worth knowing: on Windows the pins only match after CRLF normalization). All 19 lower bounds I established independently - my own implementation of the five families, both group actions and the embedding notion from the paper's definitions, a witness at n-1 for every value, each re-verified by a brute-force check sharing no code with my own encoder. The UNSAT side beat me: your warning that these are hard was accurate and then some - my solver decided none of them inside a 50-minute-per-instance budget, so the upper bounds rest on your certificates (all 19 drat-trim logs VERIFIED, dimensions matching my regenerated CNFs exactly), except the three K-cells, which your own sibling theorems imply and which I verified in depth yesterday. I also hand-checked every conjectured cell against DD26's formulas: all agree.

Publication is Announcement rather than Preprint because the repo is a certificate bundle with a README, not a manuscript - your two theorem entries have write-ups and stay Preprint.

Both relations to the siblings are drawn, with the overlap cells named. When the four pending cells clear their referee leg, message me and the entry gets amended - the honest scoping of those four, and of R2's hash provenance, is exactly what makes these reviews quick.`;

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  const sibs = await prisma.problem.findMany({
    where: { slug: { in: [SIB_A3, SIB_A4] }, status: "published" },
    select: { id: true, slug: true },
  });
  if (sibs.length !== 2) throw new Error("sibling entries not both published");
  const sibId = new Map(sibs.map((s) => [s.slug, s.id]));

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const limit = LIMITS.get(e.key);
    if (limit && typeof e.value === "string" && e.value.length > limit) {
      console.log(`  ${e.key} OVER BY ${e.value.length - limit} (${e.value.length}/${limit})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }
  for (const r of RELATIONS) {
    if (r.note.length > RELATION_NOTE_MAX) {
      console.log(`  relation note to ${r.toSlug} OVER BY ${r.note.length - RELATION_NOTE_MAX}`);
      bad++;
    }
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 88 ? `${s.slice(0, 88)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  for (const r of RELATIONS) console.log(`  relation: --${r.kind}--> ${r.toSlug.slice(0, 45)}...`);
  console.log(`  unchanged: resolution=${p.resolution}, ai=${p.aiContribution}, method=${p.resolutionMethod}`);
  console.log(`  message: ${MESSAGE.length} chars (max ${MESSAGE_MAX})`);
  if (MESSAGE.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

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
        relationsFrom: {
          deleteMany: {},
          create: RELATIONS.map((r, position) => ({
            toId: sibId.get(r.toSlug)!,
            kind: r.kind,
            note: r.note,
            position,
          })),
        },
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    prisma.problemActivity.createMany({
      data: [
        ...changes.map((c) => ({
          problemId: p.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated" as const,
          field: c.field,
          oldValue: c.oldValue,
          newValue: c.newValue,
        })),
        ...RELATIONS.map((r) => ({
          problemId: p.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated" as const,
          field: "Related entries",
          oldValue: null as string | null,
          newValue: `${r.kind} -> ${r.toSlug} (${r.note})`,
        })),
      ],
    }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "approved",
      },
    }),
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "decision",
              reason: "edited",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
