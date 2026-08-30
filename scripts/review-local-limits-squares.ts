// Publish "Local limits along squares and prime values of digital functions".
// 30 Aug 2026.
//
// Source verified: Zenodo 10.5281/zenodo.22164902 (v1.2.0, 29 Aug 2026), title
// and pseudonymous author vibefrtz both matching the submitter. The concept DOI
// 22164901 resolves to that version record. Not a duplicate.
//
// NOT a duplicate of the author's published entry
// prime-values-of-digital-functions-along-the-primes either, though the titles
// overlap: that one is about g(p) along the PRIMES, this submits the count of
// squares with a prescribed digit sum. Different theorem, same programme, so a
// `continues` relation is added rather than leaving two entries looking like
// one result filed twice.
//
// LEAN AUDITED HERE, and the submission's account of it is exact.
//   33 files, 10,587 lines. No sorry, no admit, no native_decide anywhere.
//   Exactly TWO declared axioms in the whole development, both in DSS/Cited.lean
//   and both literature citations: `mmr` (Martin-Mauduit-Rivat) and `hhbr`
//   (Halberstam-Heath-Brown-Richert).
//   axiom_audit.txt has 107 lines, and they split exactly as the submitter says:
//     102  [propext, Classical.choice, Quot.sound]        <- Lean's own three
//       3  + hhbr, mmr
//       2  + hhbr
//   The five conditional ones are all p2_count / square_p2 - the almost-prime
//   theorems - which is precisely where the submission says the literature
//   inputs are used.
//
// THE SUBMITTED THEOREM IS AMONG THE UNCONDITIONAL 102, which is the claim that
// mattered most and it holds:
//   'DSS.sq_digit_sum_count' depends on axioms: [propext, Classical.choice, Quot.sound]
// and its binary companion sq_digit_sum_count_two likewise.
//
// STATEMENT CORRESPONDENCE CHECKED, at least for the submitted theorem. The Lean
//   theorem sq_digit_sum_count {b} (hb : 3 ≤ b) {q u} (hq : 2304 * b^4 ≤ q)
//       (hadm : u^2 ≡ q [MOD b-1]) : 2^(Nat.sqrt q / (36*b)) ≤ (sqSols b q).card
// with
//   sqSols b q = filter (fun n => Nat.Coprime n b ∧ sb b (n^2) = q ∧ n^2 ≤ b^(3q))
// matches the entry's statement term for term: coprime to the base, digit sum of
// n² equal to q, size bound b^{3q}, threshold 2304·b⁴, bound 2^(√q/(36b)). The
// admissibility hypothesis is encoded as a supplied u with u² ≡ q (mod b−1),
// which is the right reading of "congruent to a square mod b−1".
//
// TIER STAYS lean-checked, which is what the submitter asked for and is correct.
// Not upgraded to lean-verified for one concrete reason: I did not BUILD it. There
// is no Lean toolchain on this machine, so the axiom closures above are read from
// the committed axiom_audit.txt rather than reproduced from `lake build`. The
// kernel half of lean-verified is therefore unconfirmed here, whatever the
// statement audit shows. Recorded plainly in the note.
//
// Classification otherwise untouched: resolved, argument, ai-co-developed all fit.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "local-limits-along-squares-and-prime-values-of-digital-functions";
const SIBLING = "prime-values-of-digital-functions-along-the-primes";
const RELATION_NOTE_MAX = 200;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  significance: 12,
  verificationNote:
    "Lean-checked, and the development was audited here on 30 August 2026 rather than taken on the submitter's word. What was found matches the submission exactly.\n\n33 files, 10,587 lines, with no $\\texttt{sorry}$, no $\\texttt{admit}$ and no $\\texttt{native\\_decide}$ anywhere. Exactly two declared axioms exist in the whole project, both in $\\texttt{DSS/Cited.lean}$ and both literature citations: Martin-Mauduit-Rivat and Halberstam-Heath-Brown-Richert. The committed $\\texttt{axiom\\_audit.txt}$ has 107 entries splitting 102 / 3 / 2 as claimed, and the five conditional ones are all the almost-prime $\\texttt{p2\\_count}$ and $\\texttt{square\\_p2}$ results - exactly where the paper says those inputs are used.\n\nThe submitted theorem is among the unconditional 102: $\\texttt{DSS.sq\\_digit\\_sum\\_count}$ depends only on $\\texttt{propext}$, $\\texttt{Classical.choice}$ and $\\texttt{Quot.sound}$. Its statement was read against this entry's and matches term for term - $\\texttt{sqSols}$ filters on coprimality to the base, $s_b(n^2)=q$, and $n^2\\le b^{3q}$, with threshold $2304b^4$ and bound $2^{\\lfloor\\sqrt q/36b\\rfloor}$.\n\nNot upgraded to Lean-verified, for one reason: it was not built. No Lean toolchain here, so every axiom closure above is read from the committed audit file rather than reproduced from $\\texttt{lake build}$. The kernel half is unconfirmed whatever the statement audit shows.",
  ageNote:
    "Recreational provenance rather than a posed conjecture. Murthy and Ashbacher recorded in 2005 that a base-ten square exists with any admissible digit sum; proved here is the quantitative all-base version, roots coprime to the base - excluding their trailing-zero trick - with exponentially many representations of controlled size. 2005 dates the observation, not a challenge anyone issued.",
  significanceNote:
    "A quantitative all-base strengthening of a base-ten existence remark, machine-checked unconditionally, from a paper whose wider content (the square local limit theorem, the sieve, the Erdős-Kac law) is not what is submitted here. That places it with this author's other digital-function entries: just above the along-the-primes companion at 11, because the submitted theorem is fully axiom-free in Lean and moves a bare existence claim in one base to an exponential count in every base, and level with the Erdős-Kac palindromes entry at 12.",
};

const DECISION = `Published as lean-checked at significance 12, classification exactly as you set it.

I audited the Lean rather than taking the note on trust, and it holds. 33 files, 10,587 lines, no sorry, admit or native_decide. Exactly two declared axioms, both in DSS/Cited.lean and both literature citations. axiom_audit.txt has 107 entries splitting 102 / 3 / 2 as you describe, and the five conditional ones are all p2_count and square_p2 - the almost-prime results, exactly where you say those inputs are used.

The claim I most wanted to check holds up best: DSS.sq_digit_sum_count depends on [propext, Classical.choice, Quot.sound] and nothing else, so the submitted theorem really is unconditional. I read its statement against the entry's too - sqSols filters on coprimality to the base, s_b(n²) = q and n² ≤ b^{3q}, with the 2304·b⁴ threshold and 2^(√q/(36b)) bound, term for term what you wrote.

Not upgraded to Lean-verified, for a narrow reason: I did not build it. No Lean toolchain here, so every axiom closure above is read from your committed audit file rather than reproduced from lake build. You offered an upgrade if a reviewer audits the statement correspondence; I have now done that for the submitted theorem, so what is missing is the kernel half, not the statement half. Reproduce the build and that is the upgrade.

One structural addition: a "continues" relation to your along-the-primes entry, since the titles overlap enough to read as one result filed twice.

Also filled: significance 12, an age note recording Murthy-Ashbacher 2005 as a recreational observation rather than a posed conjecture, and a significance note placing this beside your other digital-function entries.

A remark rather than a request: the guard making axiom discipline a build invariant, and VERIFICATION.md listing the deviations and what is not checked, are why this took an hour to review rather than a day. Most submissions claiming a formalisation do not let a reader find the gaps that fast.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, verification: true, aiContribution: true, significance: true, resolution: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const sib = await prisma.problem.findUnique({ where: { slug: SIBLING }, select: { id: true, status: true } });
  if (!sib || sib.status !== "published") throw new Error("sibling entry missing");

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  const RELATION_NOTE =
    "Same programme by the same author: that entry counts prime values along the primes, this one counts squares with a prescribed digit sum.";

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  console.log(`  relation note: ${RELATION_NOTE.length}/${RELATION_NOTE_MAX}`);
  if (RELATION_NOTE.length > RELATION_NOTE_MAX) bad++;
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}${DECISION.length > MESSAGE_MAX ? `  OVER BY ${DECISION.length - MESSAGE_MAX}` : ""}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n${SLUG}`);
  console.log(`  verification   : ${cur.verification} (unchanged)`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
  console.log(`  significance   : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  + continues relation -> ${SIBLING}`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, status: "published", reviewedAt: new Date(), reviewMessage: DECISION, reviewReason: "edited" } as never,
    }),
    prisma.problemRelation.create({
      data: { fromId: cur.id, toId: sib.id, kind: "continues", note: RELATION_NOTE },
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: { userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym, kind: "decision", reason: "edited", body: DECISION, problemId: cur.id },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
