// Follow-up on the "Composites among [ξ7ⁿ]" review, 17 Aug 2026.
//
// The first review made a factual error: it said no public Lean repository was
// linked. LucidKestrel185 replied that it is linked, in appendix A of the
// paper. They were right - the review checked the entry's links and not the
// paper - so this corrects the public note rather than quietly editing it out.
//
// Source audit of github.com/rwst/On-Composites at 2e49c4d (17 .lean files,
// comments stripped before counting, so a `sorry` inside a doc comment cannot
// inflate the count):
//
//   sorry 18, admit 0, axiom 0, native_decide 3, decide 55
//
// All 18 `sorry` are in Challenge.lean, and nothing imports it. That is the
// leanprover/comparator "statement of record" pattern: the file re-declares
// the definitions against Mathlib alone and states the certified theorems with
// `sorry`, so comparator can check the solution's constants are definitionally
// identical, its axiom profile is within the permitted set, and its
// environment is re-accepted by the kernel from a fresh export with no .olean
// loaded. The sorries are the point of the file, not a gap in the proof.
//
// What DOES cap the tier is not what the first review guessed. All five
// comparator configs permit exactly propext, Quot.sound, Classical.choice
// (std3). The two theorems THIS ENTRY CLAIMS - Cycles.infinite_composites_seven
// and no_infiniteTruncatablePrime_seven - appear in no config, because they
// rest on three native_decide calls (Rungs.chkAll_true, Y31.checkDet_true,
// Cycles.chkCyc_true). The repository documents that quarantine itself, at
// length, rather than glossing it. So native_decide really is load-bearing for
// the headline claims - the first review's conclusion was right for the wrong
// reason, and the note now gives the right one.
//
// Two mitigations worth recording, because they bound the risk:
//   - floorPow, CompositeInt and InfiniteTruncatablePrime are verbatim
//     identical between Challenge.lean and the development, and comparator
//     certifies those same constants at std3 for bases 3-6 (truncatable.json
//     proves the 3-6 cases from the very module holding the b=7 theorem, so
//     the evaluator provably does not leak into them). Definitional drift -
//     the failure mode a statement-of-record exists to catch - is ruled out
//     even for the quarantined pair.
//   - cond.c, cycles.c and compress.py recompute the same core and cycle set
//     outside Lean, so the two computational hypotheses are re-checkable.
//
// Not built here: there is no Lean toolchain on this machine and the repo has
// no CI, so "compiles" rests on the author's word. Lean-checked is therefore a
// source audit, and the note says so.
import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();

const PROBLEM_ID = "4cd207c4-b1f7-47a3-a387-c89d14757ccf";
const LINK_ID = "a9583d56-c415-4558-ab9a-5bb2f5852757";
const THREAD_ROOT = "3c952fa3-6e24-432f-b0f9-d82dd17cd6be";
const RECIPIENT = "LucidKestrel185";

const VERIFICATION_NOTE = `Reviewed and corrected 17 August 2026. The first review said no public Lean repository was linked; that was wrong - it is linked in appendix A of the paper. The error is recorded here rather than quietly dropped.

Source audit of github.com/rwst/On-Composites at commit 2e49c4d, 17 files, comments stripped before counting: no sorry, admit or axiom anywhere on the proof path. The 18 sorry occurrences are all in Challenge.lean, which nothing imports - the leanprover/comparator "statement of record", which re-declares the definitions against Mathlib alone so the solution's constants, axiom profile and fresh-export kernel re-acceptance can be checked.

The tier stops at Lean-checked for a precise reason: all five comparator configs permit exactly propext, Quot.sound and Classical.choice, and the two theorems this entry claims - infinite_composites_seven and no_infiniteTruncatablePrime_seven - are in none of them, because they rest on three native_decide calls, which decide via the compiled evaluator rather than the kernel. The repository documents that quarantine itself.

Two things bound the risk: floorPow, CompositeInt and InfiniteTruncatablePrime are verbatim identical to the Mathlib-only re-declarations comparator certifies at std3 for bases 3-6, so definitional drift is ruled out; and cond.c, cycles.c and compress.py recompute the hypotheses outside Lean. Not built here - no toolchain, and the repo has no CI - so this is a source audit, not a compile.`;

const REPLY = `You did not miss a field - I missed the link. It is in appendix A exactly as you say, and my review checked the entry's links without reading the paper's appendix. The entry's verification note now records that correction openly instead of quietly dropping the claim.

The field does exist for next time: "More links" on the submission form, kind "Lean proof". That surfaces the development as a first-class artifact on the entry rather than leaving it inside the PDF, which is what went wrong here.

I audited the repo at 2e49c4d and moved the tier to Lean-checked. Comments stripped before counting: no sorry, admit or axiom on the proof path, and the 18 sorry are all in Challenge.lean, which nothing imports. The comparator statement-of-record pattern is a good one and more provenance than most submissions carry.

What holds it below Lean-verified is not what my first review guessed. It is that the two theorems this entry claims are precisely the two you exclude from every comparator config, on the three native_decide calls - and your Challenge.lean explains that boundary more plainly than most papers explain anything. The honesty is noted; it is why the audit was quick.

Two things I credited in the note. floorPow, CompositeInt and InfiniteTruncatablePrime are verbatim identical to the Mathlib-only re-declarations comparator certifies at std3 for bases 3-6, and truncatable.json proves the 3-6 cases from the same module as the b=7 theorem, so the evaluator provably does not leak - definitional drift is ruled out even for the quarantined pair. And cond.c, cycles.c and compress.py recompute the hypotheses outside Lean.

One honest gap: I have no Lean toolchain here and the repo has no CI, so Lean-checked rests on a source audit rather than a compile. CI running lake test plus the five comparator configs would close it.`;

async function main() {
  for (const [label, text, cap] of [
    ["verificationNote", VERIFICATION_NOTE, 1500],
    ["reply", REPLY, MESSAGE_MAX],
  ] as const) {
    console.log(`${label}: ${text.length}/${cap}${text.length > cap ? "  ** OVER **" : ""}`);
    if (text.length > cap) process.exitCode = 1;
  }
  if (process.exitCode) return;

  const user = await prisma.user.findFirst({
    where: { pseudonym: RECIPIENT },
    select: { id: true },
  });
  if (!user) throw new Error(`no user ${RECIPIENT}`);

  // The curator signature, taken from the thread root rather than hardcoded,
  // so this cannot post under the wrong name.
  const root = await prisma.directMessage.findUnique({
    where: { id: THREAD_ROOT },
    select: { senderId: true, senderName: true, userId: true },
  });
  if (!root?.senderId) throw new Error("thread root has no sender");
  if (root.userId !== user.id) throw new Error("thread root is not this reader's");

  await prisma.problem.update({
    where: { id: PROBLEM_ID },
    data: { verification: "lean-checked", verificationNote: VERIFICATION_NOTE },
  });

  // "github repo" says nothing about what is in it or why it matters.
  await prisma.problemLink.update({
    where: { id: LINK_ID },
    data: { label: "Lean development, data and generating programs" },
  });

  await prisma.directMessage.create({
    data: {
      userId: user.id,
      senderId: root.senderId,
      senderName: root.senderName,
      kind: "reply",
      problemId: PROBLEM_ID,
      parentId: THREAD_ROOT,
      body: REPLY,
    },
  });

  console.log("\nverification -> lean-checked, note rewritten, link relabelled, reply sent.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
