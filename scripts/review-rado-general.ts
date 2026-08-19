// Review of ZestyWombat854's general-case Rado submission, 19 Aug 2026.
//
// This is the strongest-documented submission the site has had. CLAIMS.md maps
// all fifteen public claims to the artifact backing each one and marks which
// rest on literature it pins but does not rehost. Checked here: CI green,
// lean/Rado.lean is 354 lines with no sorry, no axiom declarations and no
// native_decide, and the theorem shape matches the prose - `upper` takes the
// three finite facts as hypotheses, so Lean proves the reduction and SAT
// discharges the leaves. That is what the submission says it does.
//
// Two edits, both toward the submitter's own words rather than away from them.
//
// Resolution goes to candidate, not resolved. The site's candidate tier is "a
// full solution is claimed and publicly checkable, but authoritative review is
// still pending", and CLAIMS.md row 1 says exactly that: "Candidate proof - no
// human review yet". The submitter labelled their own repository more
// conservatively than they labelled the entry, and the repository is right.
//
// Publication was null and is an announcement: a GitHub repository is named in
// the methodology as an announcement venue, not a preprint.
//
// Verification stays Unreviewed, as submitted. What was NOT done here is worth
// stating: the two DRAT proofs were not re-verified (drat-trim takes 998 s and
// 1125 s by the repo's own logs), the SAT solves were not re-run, and the Lean
// was not rebuilt. Those are the checks that would earn site-confirmed, and
// they are a couple of hours of compute rather than a judgement call.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "the-4-color-rado-number-of-x-y-c-z-general-case";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "For a constant $c$, the 4-colour Rado number $R(c)$ is the least $N$ such that every colouring of $\\{1,\\ldots,N\\}$ in four colours contains a monochromatic solution to $x + y + c = z$. Myers (Rutgers thesis, 2015, Conjecture 4.9) and Ahmed, Boza, Emamy-Khansary, Marin, Revuelta and Sanz (Math. Comp. 85, 2016, §5.5) conjectured\n$$R(c) = 40c + 41$$\nfor all sufficiently large $c$, with the small values $R(0) = 45$ and $R(1) = 83$ as exceptions. Previous methods reached individual values but not the general case.\n\nThis claims the conjecture for every $c \\ge 2$, by reducing it to three finite facts: the single base value $R(2) = 121$ and the unsatisfiability of two \"spoke\" templates. The reduction is formalised in Lean 4 and holds for every $D \\ge 1$; the two templates are settled by SAT with DRAT certificates.",
  },
  { field: "Status", key: "resolution", value: "candidate" },
  { field: "Publication", key: "publication", value: "announcement" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Unreviewed: AI-produced, no peer review, and no authoritative tracker has accepted it. The artifact is unusually well organised, though, and some of it was checked here.\n\nChecked: the repository's CI is green on the verification workflow (CNF regeneration, hash checks, Lean reduction check); lean/Rado.lean is 354 lines with no sorry, no axiom declarations and no native_decide; and the theorem structure matches the prose, in that `upper` takes the three finite facts as explicit hypotheses, so Lean proves the reduction and the SAT work discharges the leaves rather than the Lean claiming the whole theorem.\n\nNot checked here: the two DRAT proofs were not re-verified, the SAT solves were not re-run, and the Lean was not rebuilt. By the repository's own logs drat-trim takes 998 s and 1125 s on the two templates, so this is compute rather than judgement, and it is exactly what site-confirmed would require.\n\nWorth noting in the submission's favour: a second, independently written encoder reproduces both unsatisfiability results from the definitions, the templates are regenerated from the Lean definitions and hash-checked against pins, and R(88) = 3561 was solved directly as a positive control.",
  },
  { field: "Significance", key: "significance", value: 8 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A specialist conjecture from two 2015-16 sources, Myers's thesis and the ABEMRS Math. Comp. paper, in the small corner of Rado numbers for a single equation. Real, documented and narrowly read. Level with the partial entry for the same conjecture, because significance scores the problem rather than how much of it a given entry settles.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The claim is $R(c) = 40c+41$ for every $c \\ge 2$, reduced to three finite facts: the base value $R(2) = 121$, and the unsatisfiability of a 321-position and a 521-position spoke template. The reduction is Lean-checked and holds for every $D \\ge 1$; the two unsatisfiability results carry DRAT proofs.\n\nThis completes the partial entry for the same conjecture, which proved it for roughly two thirds of integers via a scaling lemma; that lemma is now one of three legs, covering the branch where $d$ is divisible by 3.\n\nThe supporting results are worth more than the headline for anyone deciding whether to believe it: the paper also shows every band relaxation is satisfiable, which is why previous attempts stalled, and that the affine method alone is exactly sharp and can never finish.",
  },
  {
    field: "Source name",
    key: "sourceName",
    value: "R(c)=40c+41 for every c>=2: SAT certificates, five-solver verdicts, second encoder, Lean-checked reduction",
  },
];

const LINKS = [
  {
    label: "The evidence repository: proof, Lean reduction, certificates and claim map",
    url: "https://github.com/ZestyWombat854/rado-number-4color-general",
    kind: "code",
  },
  {
    label: "CLAIMS.md - every public claim mapped to the artifact backing it",
    url: "https://github.com/ZestyWombat854/rado-number-4color-general/blob/main/CLAIMS.md",
    kind: "other",
  },
  {
    label: "The Lean 4 reduction (core Lean, no Mathlib)",
    url: "https://github.com/ZestyWombat854/rado-number-4color-general/blob/main/lean/Rado.lean",
    kind: "lean-proof",
  },
];

const MESSAGE = `Published as a candidate, significance 8, matching the partial entry.

The one change worth explaining: I moved the status from Resolved to Candidate, and I did it because your own repository is more conservative than your submission was. CLAIMS.md row 1 says "Candidate proof - no human review yet", and the site's candidate tier is defined as a full solution that is claimed and publicly checkable with authoritative review still pending. That is this, exactly. If a referee or a tracker picks it up, it moves.

What I checked: CI is green on the verification workflow, lean/Rado.lean is 354 lines with no sorry, no axiom declarations and no native_decide, and the theorem shape matches the prose - "upper" takes the three finite facts as hypotheses, so the Lean is honestly a reduction and does not pretend to carry the SAT.

What I did not check, and the note says so: I did not re-verify the two DRAT proofs, re-run the solves, or rebuild the Lean. By your own logs that is about 35 minutes of drat-trim alone. Those are the checks that would earn Site-confirmed, and they are compute rather than judgement, so it is a matter of finding the machine time rather than of doubting anything.

Two things I pulled forward into the entry because they do more for a sceptical reader than the headline does: the second independently written encoder reproducing both UNSATs from the definitions, and Theorem C on band relaxations being satisfiable, which explains why earlier attempts stalled. The R(88) positive control is in there too.

Publication was blank and is now Announcement, since a repository is an announcement venue rather than a preprint under our labels.

CLAIMS.md is the best-organised evidence file anyone has sent this site. Please keep writing them that way.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");
  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}`);

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
  for (const l of LINKS) if (l.label.length > 120) { console.log(`  link label OVER: ${l.label}`); bad++; }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  message: ${MESSAGE.length}/${MESSAGE_MAX}`);
  if (MESSAGE.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");
  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null,
        type: "updated" as const, field: c.field, oldValue: c.oldValue, newValue: c.newValue,
      })),
    }),
    prisma.problemActivity.create({
      data: { problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null, type: "approved" },
    }),
    ...(p.submittedById
      ? [prisma.directMessage.create({
          data: { userId: p.submittedById, senderId: admin.id, senderName: admin.pseudonym ?? null,
            kind: "decision", reason: "edited", body: MESSAGE, problemId: p.id },
        })]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
