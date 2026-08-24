// Approve the DT loop-quiver improved-integrality submission, with the
// resolution axis narrowed. 24 Aug 2026.
//
// This is a well-prepared submission and most of the checking confirmed what
// it already said about itself. Verified independently:
//
// - Both external references are real and say what is claimed. GKS 2015 is
//   arXiv:1504.06327 ("Knots, BPS states, and algebraic curves", CMP 346),
//   and its Conjecture 1.3 is indeed the Improved Integrality conjecture
//   asserting nonzero integers gamma-plus/minus exist. Basor-Conrey-Morrison
//   is arXiv:1703.00990 ("Knots and ones", 2 Mar 2017), whose abstract gives
//   "a number theoretic proof of the integrality of certain BPS invariants of
//   knots" and proves "a conjecture about further divisibility properties" -
//   corroborating the submission's own flag of prior art for m=3 rather than
//   contradicting it. A submission that volunteers the prior art against
//   itself is doing the reviewer's job honestly.
//
// - The Lean was read rather than trusted: Dtformal.lean (27k) has no sorry,
//   no admit, no native_decide and no axiom declarations at all. The classical
//   Kazandzidis congruences are passed as explicit hypotheses (KazOdd p kappa,
//   Kaz2) exactly as the submission describes, and those definitions are
//   faithful transcriptions of the real congruences, not vacuous placeholders:
//   KazOdd is p^(kappa + v_p(N K (N-K) C(N,K))) | C(pN,pK) - C(N,K), and Kaz2
//   carries the (-1)^(K(N-K)) sign the p=2 case actually needs. So the
//   conditional theorems are meaningful. sharp_two, sharp_three and
//   orbit_sum_zero take no such hypothesis, matching the claim that sharpness
//   and the combinatorial core are unconditional.
//
// - Disclosure is first-party and prominent in two places: the paper's author
//   line is \author{Claude (Anthropic)}, and the README carries a Provenance
//   section stating the mathematics "was produced by Claude Fable 5
//   (Anthropic) working autonomously under human direction, in a single
//   supervised session on 2026-07-31 (Lean formalization 2026-08-12)". That
//   corroborates solveDate 2026-07-31 despite the repository being pushed on
//   24 August, so the date stands. It also says outright it has "not yet been
//   peer-reviewed by human mathematicians".
//
// The one edit: resolution resolved -> partial. GKS Conjecture 1.3 is a
// statement about knots generally; this settles it for twist knots, and the
// submission's own result note says the torus-knot case (multi-vertex quivers)
// and the general-knot conjecture remain open. The catalog files that shape as
// partial - Reiner's conjecture in corank 3, the divisible rank-three case of
// Kajitani-Ueno-Miyano - and the entry's own title scopes itself to twist
// knots. The loop-quiver theorem underneath IS complete for all m >= 2, which
// the result note already leads with and which is left untouched.
//
// Not committed to the repo: the output of AxiomCheck.lean. The README asserts
// a clean audit and the file exists to produce one, but unlike the Erdos-Kac
// submission handled earlier today, no audit transcript is checked in. Noted,
// not held against it, since the source itself is clean.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "improved-integrality-of-donaldson-thomas-invariants-of-loop-quivers-gks-conjectu";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  resolution: "partial",
  verificationNote:
    "No independent human review, and the repository says so itself. Evidence in the repo: two structurally independent implementations (plethystic CoHA engine vs. direct cyclic-word enumeration) agreeing on all computed invariants; Theorem 1 checked numerically for $m\\le10$, $n\\le120$ and the Kazandzidis inputs to $n=300$ with sharpness; and a two-round adversarial AI referee report, which is author-side and does not count as independent verification here.\n\nThe Lean was read here on 24 August 2026 rather than taken on trust. Dtformal.lean carries no sorry, no admit, no native_decide and no axiom declarations whatsoever, on Lean 4.33.0. The classical Kazandzidis congruences enter as explicit hypotheses (`KazOdd`, `Kaz2`) rather than as axioms, and those definitions are faithful to the real congruences - `KazOdd` is $p^{\\kappa+v_p(NK(N-K)\\binom{N}{K})}\\mid\\binom{pN}{pK}-\\binom{N}{K}$, and `Kaz2` carries the $(-1)^{K(N-K)}$ sign the $p=2$ case needs - so the conditional theorems are substantive rather than vacuous. `sharp_two`, `sharp_three` and `orbit_sum_zero` take no such hypothesis, matching the claim that sharpness and the combinatorial core are unconditional. Lean was not compiled here, and the output of AxiomCheck.lean is not committed to the repository.",
  significance: 14,
  significanceNote:
    "A numbered conjecture (1.3) from a well-cited 2015 paper of Garoufalidis, Kucharski and Sułkowski in Communications in Mathematical Physics, in the active knots-quivers correspondence programme, and one the authors credit to Kontsevich. Settled here for twist knots only. Level with the degree-six symplectic hypergeometric monodromy entry at 15 and just above the Kreiss-constant separation at 12: a real named conjecture with a genuine literature behind it, in a mathematical-physics and number-theory crossover that is invisible outside its own community.",
};

const LINKS = [
  {
    label: "Garoufalidis, Kucharski, Sułkowski - Knots, BPS states, and algebraic curves (Conjecture 1.3)",
    url: "https://arxiv.org/abs/1504.06327",
    kind: "problem-record",
  },
  {
    label: "Basor, Conrey, Morrison - Knots and ones (the earlier m=3 / figure-eight case)",
    url: "https://arxiv.org/abs/1703.00990",
    kind: "independent",
  },
];

const DECISION = `Published, with one axis narrowed and the rest confirmed as you wrote it.

Resolution goes from Resolved to Partial. GKS Conjecture 1.3 is a statement about knots in general; this settles it for twist knots, and your own result note already says the torus-knot case and the general-knot conjecture remain open. This catalog files that shape as partial - Reiner's conjecture in corank 3, the divisible rank-three case of Kajitani-Ueno-Miyano - and your title scopes itself to twist knots too. The loop-quiver theorem underneath is complete for every m >= 2, and the result note still leads with that; nothing about it was weakened.

Everything else held up. Both references are real and say what you say they say: GKS is arXiv:1504.06327 and its Conjecture 1.3 is the Improved Integrality statement; Basor-Conrey-Morrison is arXiv:1703.00990, whose abstract confirms the earlier divisibility result. Volunteering that prior art against your own claim, and the torus-knot limitation with it, is why this review was quick - it does the reviewer's job rather than leaving it to be discovered.

I read the Lean rather than trusting the README. No sorry, no admit, no native_decide, no axiom declarations at all. More to the point, the Kazandzidis congruences come in as explicit hypotheses and those definitions are faithful to the real congruences - including the (-1)^(K(N-K)) sign at p = 2 - so the conditional theorems are substantive rather than vacuous, and sharp_two, sharp_three and orbit_sum_zero really do stand without them. That is now recorded in the verification note.

One small gap: AxiomCheck.lean exists but its output is not committed. A checked-in transcript would let a reader confirm the audit without a Lean install. Not held against the entry.

Your solved date of 31 July stands despite the 24 August push - the README's provenance note pins the session to that date, which is the convention here.

Also filled: significance 14, and the two links above.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, resolution: true, significance: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) { console.log(`  LABEL OVER BY ${l.label.length - LINK_LABEL_MAX}`); bad++; }
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  resolution   : ${cur.resolution} -> ${NEXT.resolution}`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +${LINKS.length} links, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: DECISION,
        reviewReason: "edited",
        links: { create: LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: {
        userId: cur.submittedById!,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "decision",
        reason: "edited",
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
