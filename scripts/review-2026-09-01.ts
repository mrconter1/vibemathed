// Review of the three submissions pending on 1 Sep 2026.
//
// Written as a script rather than done in the UI because two of the three need
// field edits before they go live, and the review dialog approves as-is.
//
// WHAT THIS DOES NOT DO, and why it matters: the real server actions in
// src/app/actions/submit-problem.ts end with updateTag("problems") and friends.
// updateTag only works inside a Next request, so a script cannot call it. The
// DB rows below are correct the moment they land; the PUBLIC pages keep serving
// their cached copy until the cacheLife window turns over (1h stale / 1d expire
// on the entry routes) or a deploy resets the cache. Redeploy after running.
//
// sendDirectMessage is likewise unusable here - it opens with auth() and
// returns early when there is no admin session - so the DirectMessage rows are
// written directly, in the same shape it would have produced.
//
// ---------------------------------------------------------------------------
// 1. Bugeaud Problem 10.61 (rwst / Ralf Stephan) - APPROVE with edits.
//
// Verified independently: Palomar PALOMAR-2026-08-31-000013 is real, status
// registered, trust high, author Ralf Stephan, pinned to commit d61132ff,
// mirrored to PalomarArchive. Seventeen comparator-checked theorems, and all
// seventeen are in the axiom-free lane - the repo's one cited axiom,
// LY.entropyRate_floor, is consumed by two theorems that are NOT registered.
// The 2+sqrt3 instance is registered in its axiom-free form.
//
// Edits: publication preprint -> announcement (paper.pdf lives in the repo, and
// formalization.yaml itself calls it machine-written notes, not a prior paper);
// verification note expanded from "Palomar-checked." to what the comparator
// actually checks, which the methodology requires for cited inputs; statement
// into TeX, with the second instance at 2+sqrt5 restored and a comma splice
// fixed; slug shortened from an 80-char truncation; significance set, which is
// curator-only and which all 643 published entries carry.
//
// 2. Unrestricted multiplicative complexity of Mul4 (Gregory Morse) - APPROVE.
//
// Verified: arXiv 2608.30238 is cs.CC by Morse (ELTE) and carries its own "AI
// assistance disclosure" section matching the entry's aiRole, so the disclosure
// is in the primary source and not just the submitter's word. Actions run
// 33354439833 is a success on commit 1533276b - the exact commit claimed - at
// 24m26s against a claimed 24m22s. Release n4-arxiv-v2 exists. The Boyar-Find
// question is genuinely posed, with the general (n,m) case open.
//
// Edits are curator-side only: https on the source, a slug that is not
// truncated mid-word, and significance.
//
// 3. "Bernd Johannes" / exotic S2xS2 (Saul Schleimer) - REJECT.
//
// Not a judgement on the mathematics. Model and aiRole are both "Not
// disclosed", and arXiv 2608.17267 never mentions AI, an LLM or a model, so the
// entry fails the scope test's last clause outright. The paper is also filed
// under math.GM and the submitter says it has not been checked or noticed, but
// neither of those is the reason - the missing AI is.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

type Decision = {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
};

const BUGEAUD_EDITS: Record<string, unknown> = {
  slug: "bugeaud-problem-10-61",
  name: "$(\\xi\\alpha^n)_{n\\ge1}$ is not uniformly distributed modulo one for Pisot $\\alpha$ and $\\xi$ in the Cantor set $C(\\alpha)$",
  shortName: "Bugeaud Problem 10.61",
  posedBy: "Michel Mendès France",
  publication: "announcement",
  sourceName: "rwst/Pisot-Cantor-61 (paper.pdf)",
  humanCollaborators: ["Ralf Stephan"],
  significance: 22,

  statement:
    "Bugeaud's Problem 10.61, due to Michel Mendès France in 1967: for a Pisot number $\\alpha > 2$ and the Cantor set $C(\\alpha) = \\{(\\alpha-1)\\sum_{k\\ge1}\\varepsilon_k\\alpha^{-k} : \\varepsilon_k \\in \\{0,1\\}\\}$, no $\\xi \\in C(\\alpha)$ has $(\\xi\\alpha^n)_{n\\ge1}$ uniformly distributed modulo one.\n\nThe problem itself remains open. What is proved is a set of criteria for it, and two instances. The criteria: a reduction to symbolic dynamics that is an equivalence; a pressure criterion; and a covering criterion which, for a quadratic setup of norm $b$, applies exactly when $(\\log_2\\alpha - 1)(\\log_2(\\alpha/|b|) - 1) > 1$, a condition that reduces to $\\alpha > 4$ for units. The two instances are both quadratic: at $\\alpha = 2+\\sqrt5$ in the strong form, an explicit interval that every orbit misses at every time, and at $\\alpha = 2+\\sqrt3$ by a confinement-gap certificate.",

  aiRole:
    "Directed by a human, the model planned and executed the discovery, the formalization and the write-up. The repository's formalization.yaml records the work as \"(C) 2026 Ralf Stephan, in collaboration with Claude Code\", and describes paper.pdf there as machine-written notes documenting the Lean development rather than a prior paper the formalization followed.",

  verificationNote:
    "Lean-checked, statement unaudited. Registered in the Palomar registry as PALOMAR-2026-08-31-000013: status registered, trust high, pinned to commit d61132ff, mirrored to PalomarArchive.\n\nSeventeen statements are compared with leanprover/comparator, which checks three things per theorem - that the statement in Solution is definitionally the same statement as in the trusted Challenge module, compared constant by constant; that the proof uses no axiom outside a permitted list; and that the resulting environment is re-accepted by the Lean kernel. All seventeen registered theorems sit in the axiom-free lane, permitting only propext, Quot.sound and Classical.choice.\n\nThe repository maintains a second lane permitting one cited literature input, LY.entropyRate_floor. Two theorems consume it and neither is among the registered seventeen; the $\\alpha = 2+\\sqrt3$ instance is registered in its axiom-free form.\n\nNot Lean-verified, on the anchoring half. A Palomar listing is a strong precondition rather than the anchoring itself: it makes the audit cheap, but nobody without a stake has checked that the formal statements say what Problem 10.61 says, and Palomar states plainly that a listing is not a certificate of novelty or relevance.",

  resultNote:
    "The problem is open, and the repository says so: what is proved are criteria for it and two instances, not the general case.\n\nEvery compared statement that concludes Problem 10.61 does so for a quadratic setup - a real root $\\alpha > 1$ of $X^2 - aX - b$ whose conjugate has modulus below one - and both instances are quadratic. The arbitrary-degree material is conditional ingredients: for the family $X^d - aX^{d-1} - 1$ the real root exceeding $a$ is shown to be Pisot for $a \\ge 3$, with a conjugate-modulus bound and a numerical inequality. No compared statement carries those above degree two, because the covering criterion is proved only for quadratic setups.\n\nThe covering criterion also leaves quadratic $\\alpha$ with route-A exponent at least one undecided, about which nothing is claimed.",

  significanceNote:
    "A numbered problem in Bugeaud's 2012 Cambridge tract on distribution modulo one, originally posed by Mendès France in 1967, so nearly sixty years standing in a standard reference for the field. Placed just above Problem 3 of Dubickas (2006) at 20, which sits in the same corner of distribution mod 1 but is twenty years old and lives in a journal problem list rather than a tract. Well below the Lonely Runner Conjecture at 30, which is famous across two fields and carries its own Wikipedia article.",

  ageNote:
    "Posed by Michel Mendès France in 1967, and restated as Problem 10.61 in Bugeaud's Distribution Modulo One and Diophantine Approximation (Cambridge, 2012), which is where it is usually cited from.",
};

const MUL4_EDITS: Record<string, unknown> = {
  slug: "unrestricted-multiplicative-complexity-mul4",
  sourceUrl: "https://arxiv.org/abs/2608.30238",
  significance: 12,
  significanceNote:
    "The Boyar-Find question - whether quadratic vector-valued Boolean functions over F2 are always computed optimally by quadratic circuits - is a real open question in circuit complexity, and AND-gate count is the cost metric that matters in secure computation and FHE. But this settles one instance, the four-term case, not the classification. Tied with the (2,1)-gapped consecutive-ones case at 12, likewise a single open parameter case of a broader classification with a specialist audience. Below the Tu-Deng conjecture at 15, a named conjecture with its own trail of partial results.",
};

const DECISIONS: Decision[] = [
  {
    slug: "n-n-1-is-not-uniformly-distributed-modulo-one-for-pisot-and-from-the-cantor-set-",
    action: "approve",
    reason: "edited",
    edits: BUGEAUD_EDITS,
    message:
      "Published, with edits before it went live. Nothing about the mathematics changed.\n\nI expanded the verification note to record what the comparator actually checks and which axiom lane the registered seventeen sit in; moved publication from preprint to announcement, since paper.pdf lives in the repository rather than on a preprint server; put the statement into TeX and restored the second instance at alpha = 2+sqrt5; shortened the slug to bugeaud-problem-10-61; and set the significance score and note, which are curator-only fields.\n\nI verified the Palomar entry independently before publishing: registered, trust high, seventeen theorems, and all seventeen in the axiom-free lane with LY.entropyRate_floor consumed only outside it. That last detail is the reason the tier reads the way it does, and it is a clean piece of work. Tell me if I have misread anything.",
  },
  {
    slug: "unrestricted-boolean-multiplicative-complexity-of-four-term-binary-polynomial-mu",
    action: "approve",
    reason: "edited",
    edits: MUL4_EDITS,
    message:
      "Published. The only changes are curator-side: https on the arXiv link, a slug that was not truncated mid-word, and the significance score and note, which submitters cannot set. Everything you wrote stands as sent.\n\nI checked the artifact claims independently. Actions run 33354439833 is a success on commit 1533276b, the exact commit you named, at 24m26s against your 24m22s, and release n4-arxiv-v2 exists. Kept it at Lean-checked, as you asked.\n\nYour offer to have the site rebuild the pinned release and audit its axioms is a good one and would earn Site-confirmed. I have not done that, so the tier stays where you put it. Preflighting the duplicate check and stating plainly that a negative search is not proof of novelty is exactly the right way to send one of these.",
  },
  {
    slug: "bernd-johannes",
    action: "reject",
    reason: "no-ai-contribution",
    message:
      "Thanks for sending this, and for the note on b_2 = 2, which is the part that would matter if it holds up.\n\nI am closing it on the AI question rather than on the mathematics. The inclusion test here is a precisely stated open question whose answer is now a proved or disproved theorem, with an AI model substantively in the loop, and this entry has both Model and What the AI did set to \"Not disclosed\". I read arXiv 2608.17267 and it does not mention a model, an LLM or any AI assistance anywhere, so there is nothing for the record to say on that axis, and that axis is the whole point of the record.\n\nIf a later version states which system was involved and what it did, it would be worth resubmitting.\n\nOne smaller thing in case you do: the title field holds \"Bernd Johannes\" and the short name \"Wuebben\", which is the author rather than the problem, and the actual title has ended up in the field slot.",
  },
];

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, status: true, name: true, submittedById: true },
    });
    if (!cur) throw new Error(`not found: ${d.slug}`);
    if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(`\n${d.action.toUpperCase()}  ${cur.name.slice(0, 66)}`);
    console.log(`  reason  : ${d.reason}`);
    console.log(`  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`);
    if (d.message.length > MESSAGE_MAX) bad++;

    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(`  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
      }
    }
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, submittedById: true },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      }),
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
      // Written by hand because sendDirectMessage() bails without an admin
      // session. Same shape it would have created.
      prisma.directMessage.create({
        data: {
          userId: cur.submittedById!,
          senderId: curator.id,
          senderName: curator.pseudonym,
          kind: "decision",
          reason: d.reason,
          body: d.message.slice(0, MESSAGE_MAX),
          problemId: cur.id,
        },
      }),
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log("\nAPPLIED. Public pages stay cached until a deploy or the cacheLife window turns over.");
}

main().finally(() => prisma.$disconnect());
