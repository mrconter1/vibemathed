// Review of QuietNarwhal605's Erdős 390 submission, 17 Aug 2026.
//
// Submitted with placeholder identity fields ("Sentos", "sent234", statement
// "Erdos Problem #390"), a resolved status, and a one-line verification note
// reading "The result compiles." Underneath that is one of the more serious
// formalization artifacts this site has seen, so the review is mostly a matter
// of finding out which parts of the claim survive checking.
//
// What was checked here.
//
//  1. The tracker. erdosproblems.com/390 still reads OPEN, with "1 claimed
//     proof for this problem" and no accepted solution. The paper's own title
//     is "A Proposed Solution to Erdős Problem 390". So the status is
//     Candidate, not Resolved - that is the site's word for exactly this.
//
//  2. Statement fidelity, which is the half of the Lean-verified tier a kernel
//     cannot supply. The repository ships a `FormalConjecturesBridge` module
//     containing a namespaced copy of the Formal Conjectures extremal
//     function. Diffed against
//     google-deepmind/formal-conjectures FormalConjectures/ErdosProblems/390.lean:
//
//       FC:     sInf {m | ∃ k, ∃ f : ℕ → ℕ, StrictMono f ∧ n < f 0 ∧
//                          f (k-1) = m ∧ ∏ i < k, f i = n !}
//       bridge: sInf {m | ∃ k, ∃ g : ℕ → ℕ, StrictMono g ∧ n < g 0 ∧
//                          g (k-1) = m ∧ ∏ i < k, g i = n.factorial}
//
//     Identical up to the bound variable's name and the factorial notation.
//     `formalF_rhs` is then character-for-character the right-hand side of
//     FC's `erdos_390`, which upstream carries `@[category research open]`.
//     So the thing proved is the thing asked, not a neighbour.
//
//  3. The kernel evidence. The Erdos 390 CI run of 28 July 2026 (id
//     30332889070) is green at 61325b1, and nothing has touched 390/lean since
//     - the only later commit adds a LICENSE. Reading the log rather than the
//     badge: 8,635 targets built in 54 minutes, zero "declaration uses 'sorry'"
//     lines against a lakefile with warningAsError = true, and the audit step
//     printing
//       'FormalConjecturesBridge.formalF_rhs' depends on axioms:
//         [propext, Classical.choice, Quot.sound]
//     with the workflow asserting that exact string. The workflow also greps
//     the sources for sorry/admit/axiom/opaque/sorryAx/unsafe and fails on a
//     hit, and the WIP dependency PrimeNumberTheoremAnd reports `MediumPNT`
//     axiom-clean in the same log. No project axiom declarations exist in the
//     tree (grep: zero).
//
//  4. Where the constant comes from, which looked alarming and is not. C0 =
//     4029639598/25970038185 is defined in the Lean as A13/S23: thirteen row
//     masses over nine small primes, both plainly truncations. The same
//     rational is on erdosproblems.com in a 2 May 2026 comment as a lower
//     bound on the liminf, whose author writes "This does not prove an upper
//     bound, nor does it prove that an asymptotic constant exists." Reading
//     the paper resolves it: the lower bound is credited to Mausberg, and the
//     entire novelty is a matching upper bound. So the claim is that the
//     thirteen-layer bound is tight. That is the result, not a defect in it,
//     but it is the one thing a reader has to know, so it leads the result
//     note.
//
// Not checked: the mathematics of the upper bound, and the build was not
// re-run here (no Lean toolchain on this machine, and the artifact is 8,635
// targets against Mathlib). The verification note says so.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "sentos";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "Name", key: "name", value: "Erdős Problem #390: the second-order constant for $f(n)-2n$" },
  { field: "Short name", key: "shortName", value: "Erdős #390" },
  {
    field: "Statement",
    key: "statement",
    value:
      "Let $f(n)$ be the least $m$ for which $n!$ can be written as $a_1\\cdots a_k$ with $n < a_1 < \\cdots < a_k = m$ - the smallest possible largest factor in a factorization of $n!$ into distinct integers all exceeding $n$. Erdős, Guy and Selfridge proved $f(n) - 2n \\asymp n/\\log n$. Erdős asked whether there is a constant $c$ with\n$$f(n) - 2n \\sim c\\,\\frac{n}{\\log n},$$\nand what it is.\n\nThis preprint answers yes and names the constant:\n$$\\lim_{n\\to\\infty}\\frac{(f(n)-2n)\\log n}{n} = \\frac{4029639598}{25970038185} \\approx 0.15516.$$",
  },
  { field: "Year posed", key: "yearPosed", value: 1980 },
  {
    // erdosproblems.com still lists #390 as open with the claim unaccepted,
    // and the paper is titled "A Proposed Solution".
    field: "Status",
    key: "resolution",
    value: "candidate",
  },
  {
    // A finite allocation certificate is one input, but the decisive step is
    // the upper-bound construction, and the tracker notes the problem cannot
    // be settled by a finite computation.
    field: "Method",
    key: "resolutionMethod",
    value: "argument",
  },
  {
    // A 117-page manuscript that lives only in a GitHub repository.
    field: "Publication",
    key: "publication",
    value: "announcement",
  },
  { field: "Model maker", key: "modelMaker", value: "OpenAI" },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The headline is the constant, and its two halves have different histories. The lower bound, $\\liminf (f(n)-2n)/(n/\\log n) \\ge 4029639598/25970038185$, is not new here: it is Mausberg's thirteen-layer valuation cut, posted to the erdosproblems.com forum in May 2026 and credited as such in the paper. Its author wrote there that it \"does not prove an upper bound, nor does it prove that an asymptotic constant exists.\"\n\nThe novelty is the matching upper bound, so the claim is that the thirteen-layer bound is exactly tight. It is assembled from an exact cofactor-allocation certificate, central-binomial anchors, a guarded rough-signature selector, a friable-number covariance bridge, a finite-band tangent correction, and column-sparse rounding. That construction is what a reader should scrutinize; everything else is inherited or machine-checked.\n\nerdosproblems.com still lists #390 as open, and the paper calls itself a proposed solution.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Both halves of the top tier are present, and both were checked here rather than taken on trust.\n\nStatement fidelity: the repository ships a bridge module holding a namespaced copy of the Formal Conjectures extremal function. Diffed against `FormalConjectures/ErdosProblems/390.lean` upstream, the two definitions are identical up to a bound variable's name, and the bridge's terminal `formalF_rhs` is character-for-character the right-hand side of FC's `erdos_390`, which upstream is still marked open. So the formal statement is the problem as posed, pinned in a community-reviewed repository.\n\nKernel check: the project's CI run of 28 July 2026 is green at the commit that is still the state of `390/lean` today - the only later commit adds a LICENSE. Reading the log rather than the badge: 8,635 targets, zero `declaration uses 'sorry'` warnings against `warningAsError = true`, a source grep that fails the build on sorry, admit, axiom, opaque, sorryAx or unsafe, and an audit step printing `formalF_rhs depends on axioms: [propext, Classical.choice, Quot.sound]` with the workflow asserting that exact string. The work-in-progress dependency PrimeNumberTheoremAnd reports `MediumPNT` axiom-clean in the same log, and the tree declares no axioms of its own.\n\nWhat this site did not do is re-run the build: the kernel evidence above is the author's public CI, read at the exact commit. And no human has reviewed the mathematics of the upper bound.",
  },
  { field: "Significance", key: "significance", value: 13 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Above the anchor at 10 for a typical numbered Erdos problem, on the reference trail rather than on judgment. #390 has a published theorem behind it (Erdos, Guy and Selfridge 1982, the paper whose title asks about 239), an OEIS sequence, a formalized statement in Formal Conjectures, an active forum thread, a substantive comment from Terence Tao setting out the obstruction argument, and a 2026 seven-author paper on its sibling #391. That is a denser trail than the large tie at 10. Below Erdos #1196 at 15, which sits in a better-populated corner of the subject.",
  },
];

const LINKS = [
  {
    label: "A Proposed Solution to Erdős Problem 390 (117-page manuscript)",
    url: "https://github.com/ShouqiaoW/erdos/blob/main/390/paper.pdf",
    kind: "paper",
  },
  {
    label: "The Lean 4 development, with the Formal Conjectures bridge",
    url: "https://github.com/ShouqiaoW/erdos/tree/main/390/lean",
    kind: "lean-proof",
  },
  {
    label: "Formal Conjectures: the upstream statement of Erdős 390, still marked open",
    url: "https://github.com/google-deepmind/formal-conjectures/blob/main/FormalConjectures/ErdosProblems/390.lean",
    kind: "lean-statement",
  },
  {
    label: "erdosproblems.com #390 - still listed open",
    url: "https://www.erdosproblems.com/390",
    kind: "problem-record",
  },
  {
    label: "Forum thread: Tao on the obstruction, and Mausberg's thirteen-layer lower bound",
    url: "https://www.erdosproblems.com/forum/thread/390",
    kind: "discussion",
  },
  {
    label: "The green CI run whose log this review read (28 July 2026)",
    url: "https://github.com/ShouqiaoW/erdos/actions/runs/30332889070",
    kind: "code",
  },
];

const MESSAGE = `Published as Candidate, verification kept at Lean-verified, significance 13. The identity fields were placeholders ("Sentos", "sent234") and are now written out.

Status first: erdosproblems.com still lists #390 as open, your proof recorded as claimed and not accepted, and your paper is titled "A Proposed Solution". Candidate is this site's word for a full solution that is publicly checkable with review pending. Not a judgment on the work.

I kept Lean-verified, which needs a kernel check and an anchored statement, and checked both rather than taking "The result compiles" as given. Your FormalConjecturesBridge is why the tier holds: I diffed formalF against FormalConjectures/ErdosProblems/390.lean and they are identical up to a bound variable, and formalF_rhs is character-for-character the RHS of FC's erdos_390 - closing the gap a kernel cannot. For the kernel side I read the log of run 30332889070 rather than the badge: 8,635 targets, no sorry warnings under warningAsError, the audit printing exactly [propext, Classical.choice, Quot.sound], MediumPNT clean too. It sits at the commit still holding 390/lean. I did not rebuild it, and the note says so.

One thing gave me pause and now leads the result note. C0 is A13/S23, two visible truncations, and that rational is on the erdosproblems forum as a lower bound whose author says it "does not prove an upper bound, nor that an asymptotic constant exists." The paper resolved it: you credit Mausberg for the lower bound, so the novelty is the matching upper bound and the claim is that the thirteen-layer cut is tight. That belongs at the top, since it says where to look.

Method is now Argument: the decisive step is the upper-bound construction, and the tracker notes no finite computation settles this. Publication is now Announcement, since a manuscript living only in a repository is not a preprint. Year posed is 1980, per the tracker's [ErGr80]. If erdosproblems.com accepts the proof, tell me and it moves to Resolved.`;

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
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}: ${l.label}`);
      bad++;
    }
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: verification=${p.verification}, ai=${p.aiContribution}, model=${p.model}, problemNumber=${p.problemNumber}, solveDate=${p.solveDate}`);
  console.log(`  message: ${MESSAGE.length}/${MESSAGE_MAX}`);
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
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
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
    prisma.problemActivity.create({
      data: { problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null, type: "approved" },
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
