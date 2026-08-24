// Approve the Haglund k=1 zero-trajectory submission as a candidate, with the
// contribution tier downgraded and the missing certificate flagged.
// 24 Aug 2026.
//
// Scope gate passes, and the attribution was checked at the source rather than
// taken from the submission. Haglund's Conjecture 4, read from the paper
// itself (arXiv:0910.5228, CEJM 9 (2011) 302-318), is: "For k >= 1, the
// imaginary part of each non-real zero of Xi_k(z) + t Phi_{k+1}(z) decreases
// monotonically (i.e. continuously) as t goes from 0 to 1." Xi_1 = Phi_1, so
// the paper's pencil Phi_1 + t Phi_2 is exactly the k=1 case. Note what
// Conjecture 4 does NOT say: nothing about collisions or about staying real
// afterwards. Those two statements are the paper's own additions, so the
// statement field now attributes them to the author rather than to Haglund.
//
// Lean read here at mbaccaro-dev/mathematical-proofs: the Solution import
// closure has no sorry, admit or declared axiom, pinned to Lean 4.33.0 and
// mathlib db584cd, with CI replaying Comparator, Lean4export, the kernel and
// NanoDa. Challenge.lean's single sorry is the comparator hole that file is
// meant to carry. What it proves is one abstract theorem - right-real
// persistence of the full local root multiset at a finite-order analytic
// collision - and the repository's own certificate says the interval atlas,
// the incomplete-gamma estimates, the global non-real continuation and the
// assembly into the k=1 theorem are not Lean consequences of it.
//
// The flag: part (i) of the main theorem rests on the paper's certified
// first-quadrant proposition, which the paper attributes to a companion
// verification archive of 238 patches and 60,930 source evaluations. That
// archive is published nowhere - Zenodo carries only the PDF, the repository
// carries the manuscript, the Lean project and a Lean preflight script - so
// for a claim filed under the computation method, nobody can replay the
// computation it rests on. That goes in claimIssueNote.
//
// ai-discovered -> ai-co-developed. The paper's disclosure is substantive but
// names no model and attributes no specific step, and the site's rule is that
// a vague disclosure takes the lower tier. The "Codex produced the central
// proof strategy" account exists only in the submission form.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "haglund-s-zero-trajectory-conjecture-for-the-first-riemann-xi-approximant";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  resolution: "candidate",
  aiContribution: "ai-co-developed",
  statement:
    "Haglund's Conjecture 4 reads: for $k\\ge1$, the imaginary part of each non-real zero of $\\Xi_k(z)+t\\Phi_{k+1}(z)$ decreases monotonically as $t$ goes from 0 to 1, where the $\\Phi_n$ are the incomplete-gamma summands of Riemann's series for $\\Xi$ and $\\Xi_k=\\sum_{n\\le k}\\Phi_n$. This work proves the case $k=1$, the pencil $\\Phi_1+t\\Phi_2$: every non-real zero in the closed first quadrant is simple and the imaginary part of its analytic branch strictly decreases. It adds two statements Conjecture 4 does not itself assert - no non-real branch escapes to infinity on a bounded forward parameter interval, and at a real collision of any finite multiplicity the full local Weierstrass-Puiseux multiset stays real to the right. The cases $k\\ge2$ remain open, and nothing is claimed about the zeros of $\\Xi$ or the Riemann hypothesis.",
  resultNote:
    "Proves Haglund's Conjecture 4 for $k=1$: every non-real first-quadrant zero of $\\Phi_1+t\\Phi_2$ is simple with strictly decreasing imaginary part, no branch escapes forward, and every finite-multiplicity real collision stays real afterwards. The cases $k\\ge2$ remain open. Two readings worth separating: Conjecture 4 asserts the monotone descent alone, so the no-escape and stays-real statements are this paper's own additions rather than Haglund's text, and they are the stronger part of the theorem. The descent itself, part (i), is the part that rests on the unavailable interval-arithmetic certificate.",
  claimIssueNote:
    "Part (i) of the main theorem rests on the paper's certified first-quadrant proposition, which the paper attributes to a companion verification archive of 238 patches and 60,930 source evaluations. That archive is published nowhere: the Zenodo record carries only the PDF, and the repository carries the manuscript, the Lean project and a Lean preflight script. For a claim filed under the computation method, no reader can replay the computation it rests on.",
  aiRole:
    "The paper's disclosure, in full: \"AI systems were used extensively in mathematical derivation, Lean proof development, literature discovery, organization, and typesetting. The author remains responsible for every mathematical statement, proof, citation, and submission decision.\" That is substantive - mathematical derivation, not just writing - but it names no model and attributes no specific step, so under this site's rule that a vague disclosure takes the lower tier it supports co-development rather than the AI-discovered tier the submission claimed. The stronger account, that Codex produced the central proof strategy and the analytic arguments connecting the interval certificate to the global theorem, was given to this site on submission and appears nowhere in the paper. The model string is the submitter's as well: the manuscript names no system at all.",
  verification: "unreviewed",
  verificationNote:
    "The Lean was read here on 24 August 2026 at mbaccaro-dev/mathematical-proofs: the Solution import closure (Factorization, RootMultiset, RadialEnergy, AbstractRealPersistence) carries no sorry, no admit and no declared axiom, pinned to Lean 4.33.0 and mathlib commit db584cd, with a CI job replaying Comparator, Lean4export, the Lean kernel and NanoDa; the single sorry in Challenge.lean is the comparator hole that file exists to carry. What it verifies is one abstract theorem: right-real persistence of the complete local root multiset at a finite-order analytic collision with inward positive real fibres. The repository's own certificate states that the interval atlas, the literal incomplete-gamma estimates, the global non-real continuation and the assembly into the $k=1$ theorem are not Lean consequences of it, and those are the parts carrying the result. Lean was not compiled here. Unrefereed, and deposited two days before review.",
  ageNote: "The general conjecture was posed in 2009; this entry is its k=1 case.",
  significance: 8,
  significanceNote:
    "Conjecture 4 of Haglund's 2009 paper (Central European Journal of Mathematics 9 (2011) 302-318), supported there by exploratory computation and revisited once since, in a 2012 Penn master's thesis with Maple plots. No Wikipedia article, essentially no literature beyond those two items, and the paper is explicit that nothing about the zeros of $\\Xi$ itself or the Riemann hypothesis follows. Below the typical numbered Erdős problem at 10, level with the small named graph conjectures, and this entry is the $k=1$ case of it.",
};

const EXTRA_LINKS = [
  {
    label: "Manuscript source, Lean project and verification certificate",
    url: "https://github.com/mbaccaro-dev/mathematical-proofs/tree/main/MathematicalProofs/HaglundK1ZeroTrajectory",
    kind: "code",
  },
  {
    // Kept under 120 characters: ProblemLink.label is @db.String(120), and the
    // field specs the loop below checks say nothing about link labels, so a
    // long one fails at the driver rather than at the guard.
    label: "Ahn, On the Zeros of Component Functions of the Riemann Xi Approximates (Penn MA thesis, 2012)",
    url: "https://www2.math.upenn.edu/~jhaglund/thesis/Shirley.pdf",
    kind: "problem-record",
  },
];

const LINK_LABEL_MAX = 120;

const DECISION = `Published as a candidate, with two downgrades and one flag. The Lean is genuine work and I read it rather than trusting the certificate: the Solution closure has no sorry, no admit and no declared axiom, it is pinned to a specific mathlib commit, and CI replays Comparator, Lean4export, the kernel and NanoDa. Challenge.lean's single sorry is exactly where it belongs. Thank you also for a paper that states its own limits plainly; putting Xi's zeros and the Riemann hypothesis outside the theorem usually has to be added at review.

resolution goes from partial to candidate, this catalog's label for an unrefereed self-deposit, not a comment on quality. The k=1 scope stays in the statement and result note.

AI contribution goes from AI-discovered to AI co-developed. Classification here follows the authors' own published disclosure, and a vague one takes the lower tier. Yours is substantive and I have quoted it in full, but it names no model and attributes no specific step, so it cannot carry the top tier; the account you gave on submission, that Codex produced the central proof strategy, appears nowhere in the paper. Name the system and say what it did in the disclosure section and I will revisit the same day.

The flag is what I would fix first. Part (i) rests on your certified first-quadrant proposition, which the paper attributes to a companion verification archive with 238 patches and 60,930 evaluations. That archive is neither in the repository nor on Zenodo, so nobody can replay it, and the entry says so. Publishing it turns the load-bearing step from unverifiable in principle into checkable, and it matters more than anything else here given the entry is filed under the computation method.

One correction. I read Conjecture 4 in Haglund's paper: it asserts the monotone descent alone. The no-escape and stays-real statements are yours, which is more than the conjecture asks, so they are now credited to you.

Also filled: significance 8 and a link to Ahn's thesis.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, resolution: true, aiContribution: true },
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
  for (const l of EXTRA_LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) {
      throw new Error(`link label over by ${l.label.length - LINK_LABEL_MAX}: ${l.label}`);
    }
  }

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  resolution     : ${cur.resolution} -> ${NEXT.resolution}`);
  console.log(`  aiContribution : ${cur.aiContribution} -> ${NEXT.aiContribution}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +${EXTRA_LINKS.length} links, status -> published`);
  console.log(`  decision       : ${DECISION.length}/${MESSAGE_MAX} chars`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

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
        links: { create: EXTRA_LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
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
