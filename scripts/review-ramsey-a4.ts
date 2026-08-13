// Review of ZestyWombat854's a >= 4 dihedral Ramsey submission, 13 Aug 2026.
//
// Verified here from the pinned statement alone (statement.md), with the
// proof's machinery, both referee reports and the shipped CNFs deliberately
// unread by the checker:
//   - orbit anchor: |Dih(a)-orbit of P_a^alt| = a for a = 3..14;
//   - the Ramsey value at nine cells, both directions: exhaustively over
//     every 2-coloring at (4,2),(5,2),(6,2),(7,2),(4,3), and via an
//     independently written CNF encoding + CaDiCaL at (8,2),(5,3),(6,3),(4,4);
//   - the Aggregate Sum Theorem by a third implementation, from the P/Q
//     definitions rather than the recursion, on all 33,868 labeled graphs
//     with up to six vertices: zero violations, minimum slack 0 (tight);
//   - the prose proof read in full, every algebraic step traced;
//   - Conjecture 4.9 confirmed dihedral-only in the source paper's LaTeX
//     (label palt_k_dih_conj), so the "resolves 4.9 for a >= 3" scope claim
//     is accurate.
// The Lean package was source-audited (0 sorry/admit/axiom/native_decide,
// with comments stripped) but NOT compiled: it pins v4.30.0 + Mathlib, the
// local toolchain differs, and the repo has no CI runs to lean on. It covers
// four side lemmas by its own declaration; the entry's tier does not rest
// on it.
//
// Also updates the sibling a = 3 entry's now-superseded result-note line, as
// the submitter asked, and draws the first user-visible relation edge
// between the two.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { RELATION_NOTE_MAX } from "../src/lib/relation-kinds";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "dihedral-ramsey-numbers-of-the-alternating-a-path-versus-k-b-for-every-a-4-1-a-1";
const SIBLING = "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Verification", key: "verification", value: "site-confirmed" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced by this site on 13 August 2026, working from the pinned statement alone - the proof's machinery, both referee reports and the shipped CNFs were not consulted by the checker. Confirmed independently: the orbit anchor ($|Dih(a)$-orbit of $P_a^{alt}| = a$ for a = 3..14); the Ramsey value at nine (a,b) cells in both directions - a good coloring exists at $n = (a-1)(b-1)$ and none at $n+1$ - exhaustively over every 2-coloring at (4,2), (5,2), (6,2), (7,2) and (4,3), and via an independently written CNF encoding solved with CaDiCaL at (8,2), (5,3), (6,3) and (4,4); and the proof's load-bearing inequality, the Aggregate Sum Theorem, by a third implementation built from the P/Q definitions rather than the recursion, over all 33,868 labeled graphs on up to six vertices - zero violations, minimum slack 0, so the bound is tight. The prose proof was also read here in full and every algebraic step traced. Not covered by the tier: the general argument has no human peer review - produced by a sealed multi-agent Claude run and refereed dual-blind by two AI agents in the same pipeline (both CONFIRMED; one non-fatal bug and one cosmetic slip found and repaired inline, originals kept). The Lean part is partial by its own declaration - four side lemmas, zero sorry or native_decide, standard axioms, source-audited here but not compiled (pinned v4.30.0 + Mathlib, no CI runs). The main theorems are not formalized; there, the referee reports and this site's checks are the verification.",
  },
  { field: "Significance", key: "significance", value: 8 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Resolves the dihedral side of a conjecture posed five weeks earlier in a single paper with no independent citations yet - a young question in a niche new area, permutational Ramsey theory. Above the a = 3 slice (5), which fell to a group coincidence plus a citation, because this is the general theorem with a genuinely new combinatorial inequality behind it; below the Erdos entries at 10, which are decades-old problems with real literatures.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The dihedral case only, for every $a \\ge 4$ and $b \\ge 1$; the substance is the upper bound, which the source paper's own computations could not reach. Together with the sibling a = 3 entry this proves Conjecture 4.9's claim $1+(a-1)(b-1)$ for all $a \\ge 3$; the conjecture's trivial a = 1, 2 cases are unaddressed by either entry, and the cyclic analogue $R_{cyc}(P_a^{alt}, K_b)$ for $a \\ge 4$ remains open. The engine is a self-contained inequality of independent interest: for any graph on a linearly ordered vertex set, the alternating-path reach statistics satisfy $\\sum_m [P(m)+Q(m)] \\ge 2|E(G)|$, from which the theorem falls out by averaging and a pivot decomposition.",
  },
];

const LINKS = [
  {
    label: "Damnjanovic and Djordjevic, Computation of small reflective and dihedral Ramsey numbers (Conjecture 4.9)",
    url: "https://arxiv.org/abs/2607.06817",
    kind: "problem-record",
  },
];

const RELATION = {
  kind: "continues",
  note: "The a >= 4 slice of the same Conjecture 4.9, proved five days later by a general argument; together the two entries close the conjecture's dihedral claim for every a >= 3.",
};

const SIBLING_RESULT_NOTE_OLD =
  "The a = 3 slice is settled outright; the parent conjectures, asserting 1 + (a-1)(b-1) for all a, remain open for every a >= 4, where the upper bound is the hard part.";
const SIBLING_RESULT_NOTE_NEW =
  "The a = 3 slice is settled outright. The parent conjecture's dihedral side has since been resolved for every a >= 4 as well (see the related entry), so Conjecture 4.9's claim 1 + (a-1)(b-1) now stands proved for all a >= 3; the trivial a = 1, 2 cases and the cyclic analogue for a >= 4 remain formally unaddressed.";

const MESSAGE = `Published as Site-confirmed, significance 8, and both of your asks are done: the sibling's superseded line is updated, and the two entries are now linked by a typed relation (a feature that went live today - your pair is its first user-visible use).

The tier was earned the same way as last time, not carried over. Working from statement.md alone - your referees' code and CNFs unread - I confirmed the orbit anchor for a = 3..14, then the value itself at nine cells in both directions: exhaustively over every 2-coloring at (4,2), (5,2), (6,2), (7,2) and (4,3), and with my own CNF encoder plus CaDiCaL at (8,2), (5,3), (6,3) and (4,4). That is one more cell than your referees covered, and none of it shares a line of code with them. I also gave the Aggregate Sum Theorem a third implementation, computing P and Q from their definitions by brute force rather than via Lemma 4.1, over all 33,868 labeled graphs to n = 6: zero violations, minimum slack 0 - your inequality is tight, which is what an aggregate bound should be. And I read the proof in full; the Part 5 induction's telescoping and Lemma 3.2's wraparound checks both trace out cleanly.

I checked the source paper's LaTeX too: Conjecture 4.9 (palt_k_dih_conj) is dihedral-only, so your "resolves 4.9 in full for a >= 3" is scoped correctly, and the result note now says what stays open (a = 1, 2, and R_cyc for a >= 4).

One thing I could not do: compile your Lean. It pins v4.30.0 with Mathlib, my toolchain differs, and the repo has no CI runs - worth adding lean_action_ci on a push, which would make the kernel check third-party evidenced the way your sibling entry's is. Since the Lean covers four side lemmas and the tier rests on the mathematics above, nothing hangs on it today.

CLAIMS.md is a genuinely good idea, and row 4's honesty (the a = 3 half rests on the sibling, not this bundle) is exactly the kind of scoping that makes these reviews fast.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  const sib = await prisma.problem.findUnique({ where: { slug: SIBLING } });
  if (!sib) throw new Error(`no sibling ${SIBLING}`);
  if (sib.resultNote !== SIBLING_RESULT_NOTE_OLD) {
    throw new Error("sibling result note is not the expected text - has it been edited?");
  }

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) =>
    v === null || v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);

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
  if (RELATION.note.length > RELATION_NOTE_MAX) {
    console.log(`  relation note OVER BY ${RELATION.note.length - RELATION_NOTE_MAX}`);
    bad++;
  }
  if (SIBLING_RESULT_NOTE_NEW.length > (LIMITS.get("resultNote") ?? 1000)) {
    console.log(`  sibling result note over`);
    bad++;
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  relation: ${SLUG.slice(0, 30)}... --${RELATION.kind}--> ${SIBLING.slice(0, 30)}...`);
  console.log(`  sibling result note: ${sib.resultNote?.length} -> ${SIBLING_RESULT_NOTE_NEW.length}`);
  console.log(
    `  unchanged: resolution=${p.resolution}, ai=${p.aiContribution}, publication=${p.publication}`,
  );
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
        links: {
          deleteMany: {},
          create: LINKS.map((l, position) => ({ ...l, position })),
        },
        relationsFrom: {
          deleteMany: {},
          create: [{ toId: sib.id, kind: RELATION.kind, note: RELATION.note, position: 0 }],
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
        {
          problemId: p.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated" as const,
          field: "Related entries",
          oldValue: null,
          newValue: `${RELATION.kind} -> ${SIBLING} (${RELATION.note})`,
        },
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
    prisma.problem.update({
      where: { id: sib.id },
      data: { resultNote: SIBLING_RESULT_NOTE_NEW },
    }),
    prisma.problemActivity.create({
      data: {
        problemId: sib.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "What was actually shown",
        oldValue: SIBLING_RESULT_NOTE_OLD,
        newValue: SIBLING_RESULT_NOTE_NEW,
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
