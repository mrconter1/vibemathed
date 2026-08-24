// Approve the Erdos-Kac law for base-b palindromes and reversed primes,
// largely as submitted. 24 Aug 2026.
//
// Not a duplicate: no entry names palindromes, reversed primes or an
// Erdos-Kac law for either family, and none of the three source URLs appear
// on any published or pending entry.
//
// This is the strongest submission reviewed under this queue so far, and it
// is largely correct about itself. Checked independently rather than taken
// on trust:
//
// - Lean: 7851 lines across 21 files (README/VERIFICATION counted in that
//   file list too; the .lean files alone are ~7.8k lines), Lean 4.33.0. No
//   sorry, no admit, no native_decide anywhere. The one "axiom" hit outside
//   Cited.lean is a comment, not a declaration. axiom_audit.txt shows all 27
//   theorems drawing only Lean's three standard axioms plus a subset of the
//   eight declared axioms - matching the paper's own citation structure
//   theorem by theorem, exactly as VERIFICATION.md claims.
// - The eight cited results are real and correctly described: Col (Acta
//   Arith. 137, 2009), Banks-Shparlinski (Period. Math. Hungar. 51, 2005),
//   Dartyge-Rivat-Swaenepoel (arXiv:2506.21642, June 2025 - confirming the
//   claim that "the level of distribution the argument needs became
//   available only in 2025"), Granville-Soundararajan (arXiv:math/0606039).
//   Spot-read Main.lean: pal_EK_omega and rev_EK_omega are Tendsto statements
//   of the empirical CDF to Phi(t) with centring/scaling LL b lam and its
//   square root, which is Theorem 1.1/1.2 as stated in the manuscript.
// - The manuscript's own "Declaration on the use of AI tools" names Claude
//   Fable 5 and Claude Opus 5 (Anthropic) and matches the submission's aiRole
//   almost verbatim, including which two contributions were decisive
//   (locating Col's theorem; the Granville-Soundararajan modification). This
//   is public, specific and self-consistent - unlike both other submissions
//   handled today, where the detailed account existed only in the submission
//   form.
// - posedBy/yearPosed blank with a stated reason (no named poser; the
//   question was implicit in the literature, not previously posed) has
//   ample precedent: 109 published entries carry a null posedBy, including
//   the closest analog, "Almost All Primes are Partially Regular"
//   (lean-checked, sig 15, also no named poser).
// - verification stays lean-checked, which is what the submission
//   deliberately chose rather than what it could have overclaimed: the tier
//   requires the kernel check AND an independent audit of the informal-to-
//   formal correspondence, and reading Cited.lean plus spot-checking Main.lean
//   is not that audit. Appended what was independently confirmed rather than
//   silently trusting the submission's own account.
//
// significance 12, calibrated against "Almost All Primes are Partially
// Regular" (15, no named poser, similarly specialist) and "Lower Bounds for
// Multivariate Independence Polynomials" (12, extends a documented question,
// specialist reach) - this extends known Erdos-Kac results to two digitally
// defined families for the first time, one of them newly accessible.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "an-erdos-kac-law-for-base-b-palindromes-and-for-reversed-primes";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  significance: 12,
  significanceNote:
    "No named poser: the typical value of $\\omega$ on palindromes and any Erdős-Kac law for reversed primes were simply absent from the literature rather than posed as a question, and reversed primes were not analytically accessible until the 2025 Dartyge-Rivat-Swaenepoel input. Level with Lower Bounds for Multivariate Independence Polynomials (12): a specialist analytic number theory result extending a known theorem family (Erdős-Kac laws, previously established for fixed digit sum and missing-digit sets) to two families for the first time, invisible outside the field.",
  verificationNote:
    "Read independently here on 24 August 2026 at github.com/vibefrtz/vibemath, in addition to the submission's own detailed VERIFICATION.md, which this confirms rather than repeats. All 21 Lean files (about 7850 lines) carry no sorry, no admit and no native_decide; the sole textual match for \"axiom\" outside Cited.lean is a comment, not a declaration. axiom_audit.txt shows every one of the 27 theorems drawing only Lean's three standard axioms plus a subset of the eight declared in Cited.lean, matching the paper's citation structure theorem by theorem. Spot-checked Main.lean against the manuscript: pal_EK_omega and rev_EK_omega are Tendsto statements of the empirical distribution to Phi(t) with centring and scaling LL b lam and its square root, matching Theorems 1.1 and 1.2 as stated. Of the eight cited results, Col, Banks-Shparlinski, Dartyge-Rivat-Swaenepoel and Granville-Soundararajan were confirmed to exist with the stated venues; Dartyge-Rivat-Swaenepoel (arXiv:2506.21642) is from June 2025, corroborating the submission's claim that the reversed-prime argument's input became available only that year. This is a sampling audit, not the full informal-to-formal correspondence review the lean-verified tier requires, so the tier stays where the submission itself placed it.",
};

const DECISION = `Published as submitted, essentially unedited - this is careful work, filed at the tier its own evidence actually supports rather than the one it could have claimed. I read the sources independently rather than taking the account on trust: all 21 Lean files build clean (no sorry, no admit, no native_decide), the axiom audit output matches the paper's citation structure theorem by theorem, and the four literature results I could check by title all exist exactly as cited - including Dartyge-Rivat-Swaenepoel's June 2025 paper, which backs your claim that the reversed-prime argument only became possible last year. I also spot-checked Main.lean against the manuscript's Theorems 1.1 and 1.2 and they match.

Your own "Declaration on the use of AI tools" names both models and the two decisive contributions specifically, and it is public in the manuscript itself - a level of disclosure this queue does not usually see, and it is what let this classify at the tier you asked for without a downgrade.

Added: significance 12, calibrated against the two closest published anchors for an unnamed specialist analytic number theory result. verificationNote now also records what I checked independently, alongside your own account.

Filed deliberately at lean-checked, as you asked - the audit of statement correspondence you flagged is the one thing between this and lean-verified, and I did not do a full line-by-line audit, only a sample. If a second reader does that audit, or the axiom transcriptions get checked against Col's original (the one you flagged as unreachable), tell me.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, significance: true, verification: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      throw new Error(`${k} over by ${v.length - lim} (${v.length}/${lim})`);
    }
    if (lim && typeof v === "string") console.log(`  ${k}: ${v.length}/${lim}`);
  }
  if (DECISION.length > MESSAGE_MAX) throw new Error(`decision over by ${DECISION.length - MESSAGE_MAX}`);

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  verification : ${cur.verification} (unchanged)`);
  console.log(`  ${Object.keys(NEXT).length} fields set, status -> published`);
  console.log(`  decision     : ${DECISION.length}/${MESSAGE_MAX} chars`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: DECISION,
        reviewReason: "as-submitted",
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
        reason: "as-submitted",
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
