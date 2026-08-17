// Review of VividMarten473's U_30 autocorrelation submission, 17 Aug 2026.
//
// The premise checked out verbatim, which is worth recording because it is the
// thing most likely to be wrong on an entry whose problem was posed and solved
// in the same year. Pulling the arXiv source of 2604.13310 (main.tex, the
// sentence immediately after the displayed integer pair):
//
//   "Unlike in the case of Z_6, this construction does not account for all such
//    pairs of functions, and we conjecture that it is not even a complete
//    classification on this particular support; this is because we are not
//    using the largest field we have access to on this support, namely
//    Q(zeta_30)."
//
// So there is a genuine, precisely stated conjecture in a real paper, and this
// answers it. In scope.
//
// Three independent checks, written from the entry's statement rather than run
// out of the submitter's repository, so a bug in their harness could not hide a
// bug in the claim:
//
//  1. Converse direction. Building f and g from a chosen alpha in Q(zeta_30)
//     and z = w/wbar in Q(zeta_6): both inverse transforms are rational at all
//     30 points (recovered exactly, e.g. f = 2/15, 1/5, 2/5, -3/10, ...), the
//     support is exactly U_30, the pair agrees through order five and differs
//     at order six by 1.27, and substituting a sixth root of unity for z
//     restores order-six agreement. That is the claimed z^6 = 1 boundary,
//     landing exactly where the entry says it does. The zero-sum reduction used
//     for orders 4-6 was validated against brute-force autocorrelation tensors
//     at orders 2 and 3 before being trusted.
//
//  2. The phase lattice, recomputed from scratch via Smith normal form of the
//     zero-sum multiset lattice. Free rank of Z^8/L by order: 8, 4, 4, 1, 1, 0.
//     A one-parameter ambiguity survives order five and is killed at order six
//     - the shape the classification requires. Torsion at order six is Z/30,
//     not Z/6, which is not a discrepancy: that is the full translation group
//     before the rationality cut, and zeta_30^s lies in Q(zeta_6) exactly when
//     5 | s, which is six values. Incidental find worth passing on: orders four
//     and five generate the same lattice, so the classification is settled at
//     order four.
//
//  3. The known example. Agulnick-Busick-Warner print an explicit integer pair;
//     if the "complete classification" failed to contain it the theorem would be
//     dead. Its Fourier ratio is Galois-equivariant (z on u = 1 mod 6, zbar on
//     u = 5 mod 6, all eight matching), |z| = 1, z + zbar = 13/7 and z*zbar = 1,
//     so z = (13 +- 3*sqrt(-3))/14, which is in Q(zeta_6). It fits.
//
// What none of that establishes is completeness - that no OTHER pair exists -
// and completeness is the whole novelty. So verification stays Unreviewed, which
// is what the submitter asked for and for the reason they gave.
//
// Edits are deliberately minimal: the submitter asked that the exact-support and
// no-priority qualifications be preserved, and they are all defensible.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "complete-rational-classification-of-fifth-order-autocorrelation-ambiguities-on-u";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    // "P45" is an internal manuscript label; it means nothing to a reader.
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Agulnick and Busick-Warner exhibited a family of fifth-order ambiguities on the exact unit support $U_{30}$ and conjectured that it was not a complete classification because it did not use the full field $\\mathbb Q(\\zeta_{30})$. This work proves the complete classification. The larger field enlarges the common amplitude $\\alpha$, while every relative ambiguity remains a norm-one parameter in $\\mathbb Q(\\zeta_6)$. The result is a specialization of a theorem for every exact unit support $U_{6m}$.\n\nThe entry does not claim a complete parametrization for arbitrary supports: on the 255 automorphism-stable supports treated elsewhere in the paper, the broader result is a closing-degree classification. It does not treat noisy data or noncyclic groups, and it makes no novelty, priority, or firstness claim.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "No named independent domain expert has endorsed the theorem. The repository carries exact symbolic checks, fail-closed verification scripts, frozen manifests and an adversarial review report, but those are author-side and agent-side assurance, so this stays Unreviewed and Candidate.\n\nThis site ran its own checks, written from the statement rather than from the repository's scripts. Building a pair from a chosen $\\alpha$ and $z$: both inverse transforms are rational at all 30 points, the support is exactly $U_{30}$, the pair agrees through order five and differs at order six, and replacing $z$ by a sixth root of unity restores order-six agreement - the claimed $z^6=1$ boundary, exactly. The phase lattice was recomputed independently by Smith normal form: $\\mathbb Z^8/L$ has free rank 1 through order five and rank 0 at order six, so a one-parameter ambiguity survives order five and dies at six. And the Agulnick-Busick-Warner pair itself fits the classification - its Fourier ratio is Galois-equivariant with $z+\\bar z=13/7$ and $z\\bar z=1$, so $z=(13\\pm3\\sqrt{-3})/14$ lies in $\\mathbb Q(\\zeta_6)$.\n\nNot checked: completeness itself, which is the novelty. The converse direction, the lattice skeleton and the known example are all consistent with it without establishing it.",
  },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A support-specific conjecture stated in one April 2026 paper and answered four months later. Precisely posed and genuinely open - Agulnick and Busick-Warner write that they \"conjecture that it is not even a complete classification on this particular support\" - but with no literature behind it and a narrow specialist audience. Level with the other 2026 conjecture-in-a-recent-paper entries at 4.",
  },
  { field: "Significance", key: "significance", value: 4 },
];

const LINKS = [
  {
    label: "Repository: manuscript source, verification scripts and frozen manifests",
    url: "https://github.com/aconsciousfractal/FCIG-Autocorrelation-Phase-Lattices-on-Cyclic-Groups",
    kind: "code",
  },
  {
    label: "Agulnick and Busick-Warner, Higher-Order Autocorrelations on Finite Abelian Groups (arXiv:2604.13310)",
    url: "https://arxiv.org/abs/2604.13310",
    kind: "paper",
  },
  {
    // Was filed as "Independent work", which on this site means someone else's
    // proof of a neighbouring result. It is the submitter's own protocol.
    label: "Gate-Disciplined Computational Mathematics - the author's own working protocol",
    url: "https://github.com/aconsciousfractal/Gate-Disciplined-Computational-Mathematics",
    kind: "other",
  },
];

const MESSAGE = `Published as Candidate, significance 4, with your axes kept and two small fixes.

Your framing survived checking, which is not the usual outcome. I pulled the arXiv source of Agulnick-Busick-Warner and found the conjecture verbatim - "we conjecture that it is not even a complete classification on this particular support; this is because we are not using the largest field we have access to on this support, namely Q(zeta_30)". Your result note describes that accurately and stands as written, apart from "P45", an internal label that means nothing to a reader; it now reads "This work".

I also ran my own checks, written from your statement rather than out of your repository, so a bug in your harness could not hide one in the claim. Building a pair from a chosen alpha and z: rational at all 30 points, exact support U_30, agrees through order five, differs at order six, and a sixth root of unity for z restores order-six agreement. I recomputed the phase lattice by Smith normal form and got free rank 1 through order five collapsing to 0 at order six. And your classification correctly contains A-BW's own published pair - its Fourier ratio is Galois-equivariant with z+zbar = 13/7 and z*zbar = 1, so z = (13 +- 3*sqrt(-3))/14 in Q(zeta_6). One incidental find you may want: orders four and five generate the same lattice, so the classification is really settled at order four.

Verification stays Unreviewed, as you asked and for your reason. What I verified is the converse direction, the lattice skeleton and the known example - all consistent with completeness, none of them establishing it, and completeness is the novelty.

One link change worth explaining: the Gate-Disciplined protocol was filed as "Independent work", which here means someone else's proof of a neighbouring result. It is your own methodology, so it now reads as Other. Filing it as independent made your own framework look like third-party corroboration, which undercuts the care shown everywhere else here.`;

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

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, ai=${p.aiContribution}, verification=${p.verification}, publication=${p.publication}`);
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
