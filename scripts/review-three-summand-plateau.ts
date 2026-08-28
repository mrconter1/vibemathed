// Publish the three-summand Tu-Deng resubmission. 28 Aug 2026.
//
// Rejected yesterday on three counts. All three are fixed in the artifact, at
// commit 2f044d8 "Disclose AI authorship; re-aim the claim; correct the Lean
// billing", and the fixes are real rather than cosmetic.
//
// 1. DISCLOSURE. Yesterday a grep of the whole repository for GPT, Claude,
//    Opus, Sol, OpenAI, Anthropic, LLM and "language model" returned zero hits.
//    Now 16 files name the systems: paper.tex, README.md, literature-review.md,
//    all eight Lean files and all five verifiers. The manuscript carries an
//    author-line footnote ("The mathematics in this manuscript was produced
//    principally by AI systems, and the human author contributed no mathematical
//    content") and a dedicated Section 10 attributing specific theorems: GPT-5.6
//    Sol at high reasoning for the transfer matrix, the carry-layer coefficients,
//    the balancing arguments, the bounded-correlation principle, the kernel
//    theorems, the certificate programs and the Lean; Claude Opus 5 at high
//    reasoning for direction and the prior-art search. That is more specific than
//    most published disclosures, and ai-discovered now rests on the artifact.
//
// 2. THE CLAIM IS RE-AIMED. The abstract now leads with the terminal theorem -
//    "Our terminal result is an exact all-width evaluation: if t has exactly two
//    nonadjacent zero digits, then F_k(t)=(k+23)3^(k-4)" - and states the limits
//    in the same breath: the balancing results are finite-layer, the all-mass
//    extension is Conjecture 8.1, and "we classify no global maximizer of F_k".
//    The k=12 witness from my rejection is in the introduction. The entry's
//    statement now asks the question the theorem answers.
//
//    So the stated question IS fully answered, and two fields move accordingly:
//      resolution       partial -> resolved
//      resolutionMethod computation -> argument
//    The second because the plateau proof is structural, not certified: Prop 3.1
//    classifies carry supports in one paragraph, the corollary substitutes z=2,
//    w=k-2, r=2, done. The certificates carry the OTHER results, which stay open
//    or finite-layer. The paper says so itself: "The proof is structural rather
//    than computational." The submitter left both fields low rather than upgrade
//    after a rejection and asked me to set them if the re-aim earned it. It did.
//
// 3. THE LEAN BILLING IS CORRECTED, thoroughly. New Section 9.1 states every
//    point from the rejection in the paper's own voice, including the one I cared
//    most about: "the bridge from F_k to the formal objects is assumed, not
//    formalized ... Nothing in the development ties CarryConfig to the counting
//    problem defining F_k", and "The development should therefore be read as a
//    machine-checked account of the carry algebra, not as a formalization of
//    Theorem 1.1." zeroLayer-is-a-definition, oneLayerBySupport-is-hand-supplied,
//    twoZeroCount-builds-in-the-admission, and 4*5*4*3*5=1200-is-arithmetic are
//    all named explicitly.
//
// VERIFICATION unreviewed -> site-confirmed. Both halves of that rung happened.
//   Re-ran their certificate suite from a clean checkout, 27-28 Aug, Python 3.14:
//     33a census                       pass
//     33c --kmax 12                    pass, 1 m 14 s
//     33d frontier                     pass, 8 m 10 s, 3,750 + 40,500 = 44,250 cells
//     33e insertion                    pass, 50,400 cells / 151,200 sign checks
//     33f six-to-seven                 NOT finished; 9 insertion types clean before
//                                      it was stopped, no failure in any of them
//   And re-derived the result independently, in exact integer arithmetic, from the
//   entry's statement alone rather than from their code: F_k(t)=(k+23)3^(k-4) is
//   exact for k=4..11 on two distinct nonadjacent-two-zero targets each. Also
//   independently confirmed the two new numeric claims in the revision -
//   F_12(110101101010)=293,499 against the plateau's 229,635, and the Section 3
//   isolation example where balancing gaps (1,2,3) to (2,2,2) at k=6 DROPS the
//   count 231 -> 216 - and the order-five factorization identity in sympy.
//
//   What that does not establish, and the note says so: the theorem is stated for
//   all k and I checked k=4..11, so this confirms instances plus the paper's own
//   certificates, not the all-width statement. The Lean build was not run (no elan
//   here; the revision is uncompiled by the submitter's own account too).
//
// SIGNIFICANCE 4. The self-posed precedent is the tournament Paper I entry, which
// sits at 3, the floor. This earns a notch above it for being exact at every width
// with no error term and independently reproduced, and stays far below the Tu-Deng
// conjecture entry at 15: it evaluates a chamber rather than settling anything
// anyone had asked.
//
// RELATION: the builds-on link to /problem/tu-deng-conjecture, asked for twice and
// correctly argued both times, is created here.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "an-exact-all-width-plateau-for-the-three-summand-tu-deng-count-modulo-2-k-1";
const TU_DENG = "tu-deng-conjecture";
const RELATION_NOTE_MAX = 200;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  resolution: "resolved",
  resolutionMethod: "argument",
  verification: "site-confirmed",
  significance: 4,
  aiRole:
    "Disclosed in the artifact, on the author line and in a dedicated Section 10. The footnote reads \"The mathematics in this manuscript was produced principally by AI systems, and the human author contributed no mathematical content\", and Section 10 attributes the work: GPT-5.6 Sol at high reasoning effort \"did the majority of the mathematics\" - the three-state cyclic-carry transfer matrix, the carry-mass regrading, the exact carry-layer coefficients through mass five, the primary and secondary balancing exchange arguments, the bounded-correlation principle, the receiver-boundary compensation and receiver-opening kernel theorems, the certificate programs, and the Lean 4 development. Claude Opus 5 at high reasoning \"supplied direction rather than derivations\": framing the problem as the first multisummand case after Tu-Deng, selecting which sub-questions to attack, enforcing the line between proved and conjectured, and running the prior-art search.\n\nThe unusual part is what is left over. The human author is anonymous and, on the manuscript's own account, \"framed no argument, supplied no proof step, and contributed no mathematical content; the role was to run the systems, collect the output, and publish it.\" The directing role that would ordinarily be a person's was played by a second model. Section 10 also states that no step has been checked by hand by a human mathematician.",
  verificationNote:
    "Site-confirmed: this site reproduced it, not just the authors. Two things were run here, 27-28 August 2026.\n\nTheir certificate suite, from a clean checkout, exact integer arithmetic throughout: 33a passes; 33c at --kmax 12 passes in 1 min 14 s; 33d passes its 44,250 frontier cells in 8 min 10 s; 33e passes at 151,200 sign checks. 33f (1,377,000 signs) was not carried to completion - nine insertion types cleared with no failure before it was stopped - as the submission volunteered.\n\nAnd an independent re-derivation, from the problem statement rather than their code: $F_k(t)=(k+23)3^{k-4}$ is exact for every $k$ from 4 to 11, on two distinct nonadjacent-two-zero targets each. The revision's two new numbers check out too: $F_{12}(110101101010)=293{,}499$ against the plateau's $229{,}635$, and the Section 3 example where balancing the zero gaps $(1,2,3)$ to $(2,2,2)$ at $k=6$ lowers the count from 231 to 216.\n\nWhat this does not establish. The theorem is stated for all $k$ and instances $k=4,\\dots,11$ were checked, so what is confirmed is the certificates plus a finite range of the claim, not the all-width statement, whose proof is the paper's own short argument. The Lean was not built here, and is uncompiled by the submitter's account too. It is also narrower than its file names suggest, as Section 9.1 now says: the bridge from $F_k$ to the formal objects is assumed, not formalized, CarryConfig taking the digit equation as a hypothesis with next an arbitrary permutation.",
  ageNote:
    "No poser and no year, because the question is posed by the work that answers it. Not a named open problem: it is the two-nonadjacent-zeros chamber of the three-summand analogue of the Tu-Deng count, formulated and evaluated in one manuscript. A self-posed question with a terminal theorem answering it is in scope here, but it has no interval of being open, and the significance reflects that.",
  significanceNote:
    "An exact all-width evaluation with no error term is a clean result, and it was independently reproduced here. But it is a narrow one. The question is self-posed, it evaluates a single chamber rather than settling anything anyone had asked, and the proof is two paragraphs once the grading law restricts a two-zero target to carry masses zero and one. It is explicitly not extremal - the plateau value is not the maximum, as the paper's own $k=12$ witness shows. Placed at 4, a notch above the self-posed tournament classification at the floor of 3 and far below the Tu-Deng conjecture entry at 15.",
};

const DECISION = `Published. You did all three, in the artifact rather than the form.

The disclosure is now in 16 files - author-line footnote, Section 10, README, literature review, all eight Lean files, all five verifiers - and Section 10 attributes specific theorems to specific systems. More than most published disclosures manage, and AI-discovered now rests on something a reader can open.

Two fields moved up, which you asked me to set rather than set yourself. Status is now Resolved: the statement asks what F_k(t) is on two-nonadjacent-zero targets, and Theorem 1.1 answers that exactly, at every width, unconditionally. Method is now Argument, not Computation: the plateau proof is Proposition 3.1 plus a substitution, and your abstract calls it structural rather than computational. The certificates carry the finite-layer results.

Verification goes to site-confirmed. I re-ran your suite from a clean checkout: 33a, 33c at --kmax 12, 33d at its 44,250 cells and 33e at 151,200 signs all pass, and 33f cleared nine insertion types with no failure before I stopped it. Separately I re-derived the result from the problem statement rather than your code: the plateau is exact for k = 4 to 11. Your two new numbers check out too, including the k=6 case where balancing (1,2,3) to (2,2,2) drops the count 231 to 216. The note records the limit: those are instances of an all-width theorem, not the theorem.

Section 9.1 deserves a word. Stating plainly that CarryConfig is not tied to F_k, and that the development is "a machine-checked account of the carry algebra, not a formalization of Theorem 1.1", is the opposite of how formalization claims usually get written. It costs nothing real and makes the entry trustworthy.

Significance 4, not a comment on correctness: the question is self-posed, evaluates one chamber, and is explicitly not extremal. The comparable self-posed entry sits at the floor of 3; Tu-Deng is at 15. The BUILDS ON relation to it is created - you argued it right both times.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, significance: true, aiContribution: true, resolution: true, resolutionMethod: true, verification: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const tu = await prisma.problem.findUnique({ where: { slug: TU_DENG }, select: { id: true, status: true } });
  if (!tu || tu.status !== "published") throw new Error("tu-deng entry missing or unpublished");

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  const RELATION_NOTE =
    "F_k is the three-summand analogue of the Tu-Deng count, at the same modulus and the same weight budget, and both are analysed through cyclic carries.";

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  console.log(`  relation note: ${RELATION_NOTE.length}/${RELATION_NOTE_MAX}`);
  if (RELATION_NOTE.length > RELATION_NOTE_MAX) bad++;
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  resolution       : ${cur.resolution} -> ${NEXT.resolution}`);
  console.log(`  resolutionMethod : ${cur.resolutionMethod} -> ${NEXT.resolutionMethod}`);
  console.log(`  verification     : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  aiContribution   : ${cur.aiContribution} (unchanged)`);
  console.log(`  significance     : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  + builds-on relation -> ${TU_DENG}`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, status: "published", reviewedAt: new Date(), reviewMessage: DECISION, reviewReason: "edited" } as never,
    }),
    prisma.problemRelation.create({
      data: { fromId: cur.id, toId: tu.id, kind: "builds-on", note: RELATION_NOTE },
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
