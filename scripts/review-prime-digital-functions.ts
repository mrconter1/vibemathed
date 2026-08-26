// Approve the prime-values-of-digital-functions submission, with posedBy
// nulled and the prior art made explicit. 26 Aug 2026.
//
// Scope gate: PASSES, and worth spelling out because the submitter flagged the
// worry themselves. The gate is a precisely stated open question that is now a
// theorem - it does not require a named poser. "Is A052034 infinite?" is
// precisely stated, and the repository says "We have not located anywhere a
// proof, or an assertion, that the sequence is infinite." Same handling as
// this submitter's Erdos-Kac entry, where the question was likewise absent
// from the literature rather than posed, and 109 published entries already
// carry a null posedBy.
//
// But posedBy "P. De Geest (OEIS A052034)" has to go: the submitter's own note
// says the infinitude was never posed, so the field contradicted the
// submission. De Geest recorded a sequence; he did not ask the question.
// Nulled, with the 1999 recording kept as the dating and explained in the
// ageNote - the same shape as the Aldous 1992 dating on the random-assignment
// CLT.
//
// Sources all verified. Zenodo 22093372 exists with this title. The one
// literature input is real and correctly cited: Martin, Mauduit and Rivat,
// "Proprietes locales des chiffres des nombres premiers", J. Inst. Math.
// Jussieu 18 (2019), 189-224, and the preprint the audit compares against
// (mmrp3-v7.pdf on Bruno Martin's LMPA page) resolves and is 498 kB.
//
// Lean audited directly: 16 files, ~1550 lines, Lean 4.33.0, no sorry, no
// admit, no native_decide, and exactly one axiom declaration, confined to
// DigSq/Cited.lean as claimed. The committed axiom_audit.txt matches the
// submission's numbers exactly - I counted: 32 results on Lean's three
// built-ins alone, 8 on those plus `mmr`, 40 total, with A052034_infinite in
// the second group. Cited.lean is unusually disciplined: it quotes Theoreme 1
// in French verbatim, lists the source's standing conventions, and carries a
// "Quantifier order" note explaining that the encoding must be
// forall-eps-exists-C-forall-x because "forall x, exists C" would make the
// axiom vacuous - it calls that line "the crux of the whole development",
// which is exactly right.
//
// SOURCE_AUDIT.md has a "Residual caveats" section that volunteers two things
// against itself: the comparison is against the preprint rather than the
// paywalled published text, and the source PDF "was read by a model, not by a
// human eye on the printed page", with the note that its own section 5 "exists
// because the first such reading was wrong". Both now recorded in the entry.
//
// The prior art needed strengthening, not because the submission hid it - it
// says "sharpens Harman's theorems for the digit sum" - but because the paper
// is blunter than that. For g = s_b, Harman (2012) already proved the
// infinitude AND a Mertens formula; the new information there is only that the
// remainder tends to a limit rather than being O(1), and the iterated version
// for g = s is "contained, in a stronger and quantitative form, in Harman".
// What is genuinely new is the generalization to all strongly b-additive g and
// hence the A052034 case. The result note now says so.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "prime-values-of-digital-functions-along-the-primes";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  posedBy: null,
  resultNote:
    "For every integer-valued strongly $b$-additive $g$ with $\\gcd(g(1),\\dots,g(b-1))=1$ and digit mean $\\mu_g\\ge0$: $g(p)$ is prime for infinitely many primes $p$. For $\\mu_g>0$, $\\sum 1/p$ over $p<X$ with $g(p)$ prime is $(d_g/\\varphi(d_g))\\log_3X + C_{g,1} + O(1/\\log\\log X)$, likewise for the first $j$ iterates. Also $\\#\\{p\\le x: g(p)\\text{ prime}\\}\\ll\\pi(x)/\\log\\log x$, of that exact order on a large set of $x$, and $\\omega(g(p))$ has normal order $\\log_3 p$.\n\nWhat is new and what is not. For the digit sum $g=s_b$, Harman (2012) already proved both the infinitude and a Mertens formula; the new information there is the remainder tending to a limit rather than being $O(1)$, and the iterated version for $g=s$ is, in the paper's words, \"contained, in a stronger and quantitative form, in Harman\". The new content is the generalization to every such $g$, which delivers the running example $g=S$, the sum of squared decimal digits, and so the infinitude of OEIS A052034.",
  verificationNote:
    "Lean-checked, and audited here on 26 August 2026 rather than taken on trust. Sixteen files, about 1550 lines, Lean 4.33.0: no sorry, no admit, no native_decide, and exactly one axiom declaration, confined to DigSq/Cited.lean as claimed. The committed axiom_audit.txt matches its own summary exactly - counted here as 32 results resting on Lean's three built-in axioms alone and 8 resting on those plus `mmr`, 40 in all, with the headline A052034_infinite in the second group. Cited.lean quotes Théorème 1 of Martin-Mauduit-Rivat in French verbatim and carries a quantifier-order note explaining that the encoding must be $\\forall\\varepsilon\\,\\exists C\\,\\forall x$, since $\\forall x\\,\\exists C$ would make the axiom vacuous; that reasoning is correct and is the right thing to have worried about. The cited source is real (J. Inst. Math. Jussieu 18 (2019), 189-224) and the preprint the audit compares against resolves.\n\nThree limits, two of them volunteered by the repository itself. Only phases 1-2 are formalised: the Mertens formula, the counting bounds and the normal order are not. The axiom was compared against the preprint, not the paywalled published text. And the source was read by a model rather than a human, with the audit noting that its own §5 \"exists because the first such reading was wrong\". Lean was not compiled here, and axiom_audit.txt is labelled expected output rather than a captured transcript.",
  ageNote:
    "No poser: the infinitude of A052034 was never formally asked, as the repository says plainly - \"We have not located anywhere a proof, or an assertion, that the sequence is infinite\", the OEIS citations being to the recreational literature. Dated instead from 1999, when De Geest recorded the sequence and so made the question available to ask.",
  significance: 11,
  significanceNote:
    "The headline example comes from the recreational literature by way of an OEIS entry, and the digit-sum case of the general theorem was already Harman's in 2012, so what is new is the generalization and the sharpening rather than the breaking of a barrier. Level with this catalog's other digit-function entries in the 10-12 band, and just under the same author's Erdős-Kac palindromes entry at 12, which established a limit law where none existed rather than widening a known theorem.",
};

const DECISION = `Published as lean-checked, with one field cleared and the prior art sharpened. The scope worry you flagged does not sink it.

The gate is a precisely stated open question that is now a theorem - it does not require a named poser. "Is A052034 infinite?" is precisely stated, and your repository is right that no proof or assertion of it exists. Same footing as your Erdos-Kac entry, and 109 published entries already carry a blank posedBy.

But posedBy had to be cleared. It read "P. De Geest (OEIS A052034)", which contradicts your own note: De Geest recorded a sequence in 1999, he did not ask whether it was infinite. I kept 1999 as the date and moved the explanation to an age note, as the random-assignment CLT is dated from Aldous without crediting him with posing anything.

I audited the Lean rather than trusting the README: 16 files, no sorry, no admit, no native_decide, exactly one axiom in exactly the file you say. I counted axiom_audit.txt independently and got your numbers - 32 results on Lean's built-ins alone, 8 on those plus mmr. Cited.lean is the best-argued axiom file this queue has seen; the quantifier-order note naming "forall x, exists C" as the vacuity trap is exactly the right worry.

The one change of substance is the result note. You wrote that the work "sharpens Harman's theorems for the digit sum" - true, but gentler than your own paper, which says Harman had already proved the digit-sum infinitude and Mertens formula, that the new information is the remainder tending to a limit, and that the iterated version for g = s is contained in Harman "in a stronger and quantitative form". The note now says that, so a reader cannot mistake the general theorem for a first proof in the digit-sum case.

Your SOURCE_AUDIT caveats are in the verification note too: preprint rather than published text, and the source read by a model, with your own §5 existing because the first reading was wrong. Volunteering that is why this took one pass. Filled: significance 11.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, posedBy: true, yearPosed: true, significance: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  posedBy      : ${cur.posedBy} -> null`);
  console.log(`  yearPosed    : ${cur.yearPosed} (unchanged)`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, status: "published", reviewedAt: new Date(), reviewMessage: DECISION, reviewReason: "edited" } as never,
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
