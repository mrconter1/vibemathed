// Review of the three submissions pending on the morning of 13 September 2026.
// Two in, one declined.
//
// ---------------------------------------------------------------------------
// ERDOS MATCHING CONJECTURE, r = 4 (Babanskyy) - approved, Partial,
// unreviewed, ai-assisted, significance 40.
//
// Both sources read at source, and both hold exactly:
//
//   erdosproblems.com/1020 carries the conjecture in the submitted form,
//   f(n;r,k) = max(C(rk-1,r), C(n,r) - C(n-k+1,r)), still marked OPEN. The
//   tracker's forbidden-matching parameter is k where the submission uses
//   s+1, which the submission itself flags; substituting k = s+1 turns the
//   tracker's formula into the entry's, so the transcription is right.
//
//   Hou, Hu and Liu, arXiv:2605.26060, "A finite-board reduction for the
//   Erdos Matching Conjecture and the 4-uniform case via exact certificates":
//   "We prove the 4-uniform Erdos Matching Conjecture for every matching
//   number s >= 6961." So the standing state of r = 4 really was "all
//   sufficiently large s", and the claimed advance is closing the remaining
//   finite range - a well-defined thing to claim, and checkable.
//
// Partial is right and is what the submitter chose: this is one uniformity of
// a conjecture stated for all r >= 3.
//
// Significance 40 scores the PROBLEM, not this case. A named Erdos conjecture
// from 1965 with sixty years of partial results - Erdos-Gallai, Kleitman,
// Frankl, Frankl-Rodl-Rucinski, Frankl-Kupavskii. Tied with the planar
// unit-distance problem, Sendov and Petersen colouring at 40, below Erdos
// #1's distinct subset sums at 50 and Erdos-Sos at 58. Ties are deliberate
// here.
//
// Note for the record: this is the submitter whose affine Hjelmslev
// submission was declined yesterday for a self-posed question. Both of
// today's carry a genuine external poser, and both say so in their own
// fields. The feedback was taken, and the reply says so.
//
// ---------------------------------------------------------------------------
// RC-INVARIANT DECYCLING SETS (Babanskyy) - approved, Partial, unreviewed,
// ai-assisted, significance 12.
//
// The posed question is real and was read at source. Marcais, Elder and
// Kingsford, "k-nonical space: sketching with reverse complements",
// Bioinformatics 40(11), Section 6, verbatim:
//
//   "Being a symmetric decycling set is a strong condition that is still not
//    well understood theoretically (e.g. the minimum size of a symmetric
//    decycling set is unknown)."
//
// That is exactly the quantity the paper bounds, and the submitter's quote of
// it is accurate.
//
// Partial, as submitted: Theorem 1.1 settles attainability of the ordinary
// minimum completely - tau_RC(q,k) = N_q(k) exactly when k is even - and for
// odd k gives only a lower bound of N_q(k) + q. The exact odd optimum is open,
// so the posed question is answered for half its cases.
//
// Significance 12. A question raised in passing, in one applied paper, two
// years old, with essentially no literature behind it; the practical
// motivation (DNA sketching, where a k-mer and its reverse complement are one
// object) and the clean classical counterpart N_q(k) lift it just above the
// typical numbered Erdos problem at 10.
//
// ---------------------------------------------------------------------------
// SHIFTED GCD SUM (Hirsch) - declined, no-open-question.
//
// posedBy reads "GPT-5.6 Sol, during an investigation directed by Krystal
// Hirsch", yearPosed 2026, solved 2026-09-04 in the same project and
// published in one preprint. The paper's own result note says it "does not
// claim to settle a previously famous or longstanding conjecture".
//
// The interesting part is that a machine-generated conjecture is NOT
// automatically out here - the catalog holds about eighteen at significance
// 5, from Graffiti, Written on the Wall II and TxGraffiti, and one posed by
// Claude Fable 5 under Lionel Levine's direction. What those share, and what
// this lacks, is that the conjecture was PUBLISHED AS AN OPEN PROBLEM before
// anyone answered it: a numbered Graffiti conjecture, a WOW number, or in the
// Fable case a curated open-problems list, whose significance note says so in
// as many words ("a machine-posed 2026 problem from a curated
// open-problems list"). The question existed independently of its answer, and
// somebody could have answered it first.
//
// Here the conjecture and its proof arrive together, from one team, in one
// document. That is ordinary mathematics - notice a pattern, prove it - and
// it is the same ground the affine Hjelmslev submission was declined on
// yesterday. The decline says all of this, and names the two routes back.
//
// ---------------------------------------------------------------------------
// --lint runs every local check with no database. Dry run by default. Pass
// --apply to write. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const LINK_LABEL_MAX = 120;

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
}

const DECISIONS: Decision[] = [
  {
    slug: "erdos-matching-conjecture-the-four-uniform-case",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 40,
      significanceNote:
        "Scores the Erdos matching conjecture itself, not the four-uniform case this entry settles. A named 1965 conjecture of Erdos with sixty years of partial results behind it - Erdos-Gallai for graphs, then Kleitman, Frankl, Frankl-Rodl-Rucinski and Frankl-Kupavskii across successive ranges of n and of the matching number. Tied at 40 with the planar unit-distance problem, Sendov's conjecture and Petersen colouring, all named problems famous inside their communities; below Erdos #1 on distinct subset sums at 50 and Erdos-Sos at 58.",
      verificationNote:
        "Checked here on 13 September 2026, at the sources rather than from the submission. erdosproblems.com/1020 carries the conjecture in the form stated and still marks it open; the tracker's forbidden-matching parameter is $k$ where this entry uses $s+1$, and substituting turns one formula into the other, so the transcription is faithful. Hou, Hu and Liu (arXiv:2605.26060) state in their abstract \"We prove the 4-uniform Erdos Matching Conjecture for every matching number $s\\ge 6961$\", so the standing state of the four-uniform case really was all sufficiently large $s$, and the claimed advance - closing the remaining finite range - is well defined.\n\nThe mathematics was not checked. The author's own audit of 12 September records replay of all 27 computational obligations including the eight retained Hou-Hu-Liu searches, 52 tests, 12 receipt-integrity mutation controls, a matching PDF rebuild and an anonymous clone matching all 97 reviewed files. That supports reproducibility and the declared finite computations; it does not validate the written reduction and induction, and no independent domain expert endorsement or formal proof is supplied. Announcement reflects repository-only publication.",
    },
    message: [
      "Approved and published as Partial at Unreviewed, significance 40.",
      "",
      "Both of your sources were read at source rather than taken from the submission, and both hold. The tracker carries #1020 in the form you state and still marks it open; your note that its forbidden-matching parameter is k where you use s+1 is correct, and substituting turns one formula into the other. Hou, Hu and Liu say in their abstract exactly what you attribute to them: the four-uniform conjecture for every matching number s at least 6961. So the standing state of r = 4 really was all sufficiently large s, and closing the remaining finite range is a well-defined claim a reader can check.",
      "",
      "Significance 40 scores the conjecture, not the case. A named 1965 Erdos conjecture with sixty years of partial results is tied with the planar unit-distance problem, Sendov and Petersen colouring, and sits below Erdos #1 at 50 and Erdos-Sos at 58. Partial is right and is what you chose: one uniformity of a conjecture stated for all r.",
      "",
      "Worth saying directly, since your Hjelmslev submission was declined yesterday: both of today's carry a genuine external poser and both say so plainly in their own fields, which is the whole difference. Crediting Hou-Hu-Liu's framework and retaining their eight computations, rather than quietly re-deriving them, is also the right way to present this.",
      "",
      "The mathematics was not checked here and the note says so. Your audit record covers reproducibility and the finite computations; the written reduction and induction remain unreviewed until a specialist reads them.",
    ].join("\n"),
  },
  {
    slug: "minimum-reverse-complement-invariant-decycling-sets",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 12,
      significanceNote:
        "A question raised in passing in a single applied paper two years ago, with essentially no literature behind it. Marcais, Elder and Kingsford note it as an aside while reporting ILP results, not as a headline problem. Just above the typical numbered Erdos problem at 10 rather than level with it, because the question has a practical driver - sketching DNA, where a k-mer and its reverse complement are one object - and a clean classical counterpart in the unconstrained minimum $N_q(k)$.",
      verificationNote:
        "The posed question was read at source. Marcais, Elder and Kingsford, \"k-nonical space: sketching with reverse complements\", Bioinformatics 40(11), Section 6: \"Being a symmetric decycling set is a strong condition that is still not well understood theoretically (e.g. the minimum size of a symmetric decycling set is unknown).\" That is the quantity this paper bounds, and the submitter's quotation of it is accurate.\n\nThe mathematics was not checked here. The public 15-page manuscript carries analytical proofs, LaTeX source and an exact binary replay using only the standard library; the author's audit of 12 September records an anonymous clone matching all 50 reviewed files and a finite panel over binary $k=2,4,6,8,10,12$ with 612 legal firings and 14 mutations rejected. A finite panel does not establish the uniform $q$-ary theorem, and no independent specialist endorsement or formal proof is supplied. Partial because the question is answered for half its cases: every even order is settled exactly, and odd orders get a lower bound rather than the optimum.",
    },
    message: [
      "Approved and published as Partial at Unreviewed, significance 12.",
      "",
      "I read the Marcais-Elder-Kingsford paper rather than taking your citation on trust, and your quotation is exact. Section 6: \"Being a symmetric decycling set is a strong condition that is still not well understood theoretically (e.g. the minimum size of a symmetric decycling set is unknown).\" That is precisely the quantity your Theorem 1.1 bounds, so the entry rests on a question somebody else posed in print.",
      "",
      "Partial is right and is what you proposed. Even orders are settled exactly, odd orders get N_q(k) + q as a lower bound rather than the optimum, so the posed question is answered for half its cases. The entry says that in those terms.",
      "",
      "Significance 12. The question is real but was raised as an aside in one applied paper two years old, with no literature behind it. It sits just above the typical numbered Erdos problem at 10 rather than level with it, because it has a practical driver and a clean classical counterpart in the unconstrained minimum.",
      "",
      "Two things you did that made this quick to review: flagging that the parity criterion is your theorem rather than a conjecture attributed to the 2024 authors, and pinning the source to a commit rather than a branch. The PUBLIC_CLAIM_BOUNDARY document is a good habit and it is linked on the entry.",
    ].join("\n"),
  },
  {
    slug: "sharp-bound-for-a-shifted-gcd-sum-over-divisors",
    action: "reject",
    reason: "no-open-question",
    message: [
      "Declined, and the reason is narrower than it may look, so it is worth setting out properly.",
      "",
      "A machine-generated conjecture is not out of scope here. The catalog holds about eighteen of them: numbered Graffiti conjectures, Written on the Wall II numbers, a TxGraffiti conjecture refuted by Claude, and one posed by Claude Fable 5 under Lionel Levine's direction. They sit at significance 5, which is a low score but a real place on the ladder.",
      "",
      "What all of those share, and what this one lacks, is that the conjecture was published as an open problem BEFORE anybody answered it. A Graffiti conjecture has a number. The Fable one was on a curated open-problems list, and the entry's note says so in as many words. In each case the question existed independently of its answer, and somebody else could have got there first.",
      "",
      "Here the conjecture and the proof arrive together: GPT-5.6 Sol generated it during your investigation, GPT-6 Astra proved it in the same project, and both appear in one preprint. Your own result note puts it plainly - it does not claim to settle a previously famous or longstanding conjecture. That is ordinary mathematics, noticing a pattern and proving it, and it is the same ground an affine Hjelmslev submission was declined on yesterday, where the author had likewise formulated the question in the manuscript that answered it.",
      "",
      "Two routes back, and the first may already be open. Shifted gcd sums over divisors sit next to a real literature - Pillai's gcd-sum function and its descendants, surveyed by Toth and by Broughan. If A(n), or a bound of this exact shape, has been asked about there by somebody else, the entry goes in on that citation and the work is unchanged. It is worth an hour of searching before anything else. Failing that: post the conjecture on its own, let it stand as an open problem, and an answer to it later is squarely in scope.",
      "",
      "None of this is a judgement on the mathematics, which was not assessed.",
    ].join("\n"),
  },
];

/// The serverless cluster refuses the first connection after idling.
async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string) => Promise<T>;
}): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const d of DECISIONS) {
    console.log(`${d.action === "reject" ? "DECLINE" : "APPROVE"}  ${d.slug.slice(0, 56)}`);
    const n = charLength(canonical(d.message));
    console.log(`  message : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const c = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && c > lim;
        console.log(`  ${k.padEnd(17)}: ${c}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    for (const l of d.links ?? []) {
      console.log(`  link (${l.kind}) ${l.label.length}/${LINK_LABEL_MAX}: ${l.label}`);
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {} });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `${localBad} local violation(s)` : "local checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    let bad = 0;
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: {
          id: true,
          status: true,
          name: true,
          sourceUrl: true,
          submittedById: true,
          links: { select: { label: true, url: true } },
        },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({
        specs: SPECS,
        fields: d.edits ?? {},
        links: merged,
        sourceUrl: ((d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl) || null,
      });
      console.log(
        `${d.action.toUpperCase().padEnd(7)}  ${cur.name.slice(0, 52)}  -> merged check: ${v.length ? "FAILED" : "ok"}`,
      );
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      bad += v.length;
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }
    if (bad) throw new Error(`${bad} violation(s) - nothing written`);

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true, _count: { select: { links: true } } },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      const n = cur._count.links;

      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`updated: ${d.slug}`);

      if (cur.submittedById) {
        await prisma.directMessage.create({
          data: {
            userId: cur.submittedById,
            senderId: curator.id,
            senderName: curator.pseudonym,
            kind: "decision",
            reason: d.reason,
            body: d.message.slice(0, MESSAGE_MAX),
            problemId: cur.id,
          },
        });
        console.log(`messaged: ${d.slug}`);
      }

      await prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      });
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and");
    console.log("stats lag by up to an hour, or until a deploy.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
