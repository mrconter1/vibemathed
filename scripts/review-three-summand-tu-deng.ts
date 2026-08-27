// Reject the three-summand Tu-Deng submission: the artifact discloses no AI.
// 27 Aug 2026.
//
// This is a rejection on scope, not on the mathematics, and the mathematics was
// checked hard before deciding. Everything below was run from a clean clone of
// avg-netizen/three-summand-cyclic-carries (HEAD d3c0eb4, four commits, MIT-less,
// pushed 27 Aug).
//
// WHAT PASSED HERE, 27 August 2026, Python 3.14.0:
//   33a-three-summand-census.py       brute-force census, exit 0, ~17 s
//   33c-orbit-exchange.py --kmax 12   exit 0, 1 m 14 s. Ends with the full audit
//                                     block; carry-mass exchange table shows
//                                     mass 3 alone has 13 negative moves while
//                                     carry-2-plus-3 and carry-2-through-4 have
//                                     zero, which is exactly the finite-layer
//                                     caveat the submission owns up to.
//   33d-boundary-mass-two-frontier.py exit 0, 8 m 10 s, "boundary-mass-two
//                                     frontier certificate passed", 3,750 +
//                                     40,500 = the stated 44,250 cells.
//   33e / 33f                         still running at decision time, as the
//                                     submission predicted for 33f.
//
// AND INDEPENDENTLY, not using their code at all: I brute-forced F_k(t) in my own
// script from the entry's statement alone, and the plateau F_k(t)=(k+23)3^(k-4)
// is exact for every k from 4 to 11, on two distinct nonadjacent-two-zero targets
// each. The order-five characteristic factorization in ReceiverKernel.lean also
// expands to zero difference in sympy. The headline theorem is true.
//
// THE BLOCKER. The artifact contains no AI disclosure anywhere. A case-insensitive
// grep of paper.tex, README.md, literature-review.md, all seven .lean files and all
// five verifiers for GPT, Claude, Opus, Sol, OpenAI, Anthropic, LLM, "language
// model", "artificial intelligence" and "AI-generated/assisted/discovered" returns
// zero hits. The manuscript is an "Anonymous draft" dated 15 August and its novelty
// statement reads "to the author's knowledge", singular. So the entire AI provenance
// of this entry lives in the aiRole textarea and nowhere a reader can open.
//
// The inclusion test needs a model substantively in the loop. Precedent here is the
// Haglund k=1 entry: its disclosure named no model and attributed no step, so it was
// filed a rung lower, and the tier moved the same day the disclosure was rewritten to
// name the systems. That rule reads the artifact, not the form. An artifact that says
// nothing cannot clear a bar that a vague artifact only half cleared. Publishing on an
// unverifiable assertion would make assertion sufficient, which is the one thing the
// verification ladder exists to prevent.
//
// TWO FURTHER PROBLEMS, both fixable, sent as a threaded follow-up:
//
// 1. The stated question is not the question answered. The entry asks which t maximise
//    F_k(t) and whether balancing raises the count. No global maximizer is classified
//    (33a's own k=12 maximizer 010101101011 has five zeros and value 293,499, well
//    above the two-zero plateau's 229,635), and balancing is finite-layer with the
//    all-mass case left as Conjecture 8.1 which the paper says does not follow from
//    Theorem 1.2. There IS a terminal theorem - the exact all-width plateau - and the
//    tournament Paper I precedent shows a self-posed question with a theorem answering
//    it is publishable at the floor. Re-aimed, this clears the gate.
//
// 2. The Lean coverage claim is materially overstated. The README lists 14 items the
//    Lean "proves", and several are definitional:
//      zeroLayer w := 3 ^ w                  so "the zero-carry count 3^w" is rfl
//      oneLayerBySupport w r := ...          hand-supplied; the theorem is its algebra
//      twoZeroCount k := zeroLayer (k-2) + oneLayerBySupport (k-2) 2
//                                            bakes in that only masses 0 and 1 are
//                                            admitted, so the plateau theorem reduces
//                                            to 9 + (k+14) = k+23 times 3^(k-4)
//      first_row_frontier_cardinality : 4 * 5 * 4 * 3 * 5 = 1200 := by decide
//                                            advertised as "the exact 1,200/3,600
//                                            frontier cardinalities"; it is a product
//    The genuine Lean content is elsewhere and deserves the billing instead:
//    summed_digit_equation, inputWeight_eq_targetWeight_add_carryMass, the budget
//    equivalence, zero_anchor's pigeonhole, active_coefficient_step and
//    active_cone_reconstruction, the two reconstruction lemmas,
//    dominating_neighbor_absorbs, receiver_tail_margin, and the order-five
//    factorization. Those are theorems about arbitrary inputs. No sorry, no admit,
//    no native_decide and no declared axiom anywhere, which I did confirm; the build
//    was not run here (no elan on this machine, and the pinned toolchain is
//    v4.32.0-rc1 against an installed v4.33.0-rc1).
//
// The requested BUILDS ON relation to /problem/tu-deng-conjecture is not created: a
// rejected entry is not public, so there is nothing to relate. Noted in the reply for
// when it comes back.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "finite-layer-balancing-and-an-exact-plateau-for-the-three-summand-tu-deng-count-";

const DECISION = `Turning this down, and not on the mathematics - I checked that hard and it holds up.

From a clean clone on 27 August: 33a passes, 33c at --kmax 12 passes in 1m14s, and 33d passes its 3,750 + 40,500 = 44,250 cells in 8m10s. 33e and 33f were still running when I wrote this, as you said 33f would be. Then I went outside your code entirely: I brute-forced F_k(t) in my own script from the statement alone, and the plateau F_k(t) = (k+23)3^(k-4) is exact for every k from 4 to 11, on two distinct nonadjacent-two-zero targets each. Your order-five factorization also expands to zero in sympy. The headline theorem is true, and your caveats are accurate - 33c's table shows mass 3 alone has 13 negative moves while carry-2-plus-3 has none, exactly the finite-layer boundary you describe.

The blocker is that the artifact discloses no AI at all. I grepped paper.tex, README.md, literature-review.md, all seven Lean files and all five verifiers for GPT, Claude, Opus, Sol, OpenAI, Anthropic, LLM and "language model". Zero hits. The manuscript is an "Anonymous draft" whose novelty statement says "to the author's knowledge", singular. So the AI provenance of this entry is the aiRole box you typed, and nothing a reader can open.

Precedent is the Haglund k=1 entry: its disclosure named no model and attributed no step, so it was filed a rung lower, and the tier moved the day the disclosure named the systems. That rule reads the artifact, not the form. Publishing on an assertion nobody can check would make assertion enough, which is the one thing the ladder is for.

This is a one-paragraph fix and you have already written the paragraph. Put your aiRole text into paper.tex - GPT-5.6 Sol at high reasoning for the transfer matrix, the layer coefficients, the balancing arguments, the kernel theorems, the certificates and the Lean; Claude Opus 5 for direction and the prior-art search - and resubmit. Two other things to change while you are in there; they are in my next message.`;

const FOLLOWUP = `Two fixes for the resubmission, both worth doing anyway.

Re-aim the claim. Your statement asks which t maximise F_k(t) and whether balancing raises the count. Neither is answered. You classify no global maximizer - 33a's own k=12 maximizer 010101101011 has five zeros and value 293,499, above the two-zero plateau's 229,635 - and balancing is finite-layer, the all-mass case left as Conjecture 8.1 which your paper says does not follow from Theorem 1.2. What you do have is a terminal theorem: the exact all-width plateau. Lead with that and it clears the inclusion test. A self-posed question is fine here when a theorem answers it.

Trim the Lean claim. Your note says the Lean covers the counts 3^w and 3^(w-2)(w+8r), the plateau, and the 1,200/3,600 cardinalities. It does not. zeroLayer w := 3^w is a definition, so that count is rfl. oneLayerBySupport is hand-supplied and the theorem is its algebra. twoZeroCount bakes in that only masses 0 and 1 are admitted, so the plateau theorem reduces to 9 + (k+14) = k+23. And first_row_frontier_cardinality is 4*5*4*3*5 = 1200 by decide, a product rather than a frontier.

Not padding, because the real content is right there and beats the billing: summed_digit_equation, the grading law, the budget equivalence, zero_anchor's pigeonhole, active_coefficient_step with active_cone_reconstruction, dominating_neighbor_absorbs, receiver_tail_margin, the order-five factorization. Those quantify over arbitrary inputs, and are the ones to list. I confirmed no sorry, admit, native_decide or declared axiom; I could not run the build, no elan here.

Also say that the bridge from the triple count to CarryConfig is assumed, not formalized: the structure takes the digit equation as a hypothesis and next is any permutation, not the cyclic successor, so nothing in Lean ties it to F_k.

The BUILDS ON link to the Tu-Deng entry I have not created, only because a rejected entry is not public. Ask again on resubmission; your reading of it is right.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, name: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [n, s] of [["decision", DECISION], ["follow-up", FOLLOWUP]] as const) {
    console.log(`  ${n}: ${s.length}/${MESSAGE_MAX}`);
    if (s.length > MESSAGE_MAX) { console.log(`  OVER BY ${s.length - MESSAGE_MAX}`); bad++; }
  }
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG}`);
  console.log(`  status   : ${cur.status} -> rejected`);
  console.log(`  reason   : no-ai-contribution`);
  console.log(`  messages : 1 decision root + 1 threaded reply`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.problem.update({
    where: { id: cur.id },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewMessage: DECISION,
      reviewReason: "no-ai-contribution",
    } as never,
  });
  const root = await prisma.directMessage.create({
    data: {
      userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym,
      kind: "decision", reason: "no-ai-contribution", body: DECISION, problemId: cur.id,
    },
  });
  await prisma.directMessage.create({
    data: {
      userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym,
      kind: "reply", body: FOLLOWUP, problemId: cur.id, parentId: root.id,
    },
  });
  console.log("\nREJECTED, decision + follow-up sent");
}

main().finally(() => prisma.$disconnect());
