// Review of the two submissions pending on 10 September 2026.
// One approved with edits, one held.
//
// ---------------------------------------------------------------------------
// XI NORMALITY - approved, tier kept, framing corrected.
//
// Claim: the value at 1/2 of Dibag's logarithm localized at the primes 2 and 3,
//
//     xi = sum over m = 2^a 3^c of 1/(m 2^m) = 0.68562264189340237754...
//
// is normal in base two. Summing the same terms over EVERY positive integer
// instead of the 3-smooth ones gives log 2, which is what "localized" means
// here and why the constant is not arbitrary.
//
// Checked rather than trusted, at the level the Lean tier requires:
//
//   1. Statement fidelity. Challenge.lean imports only
//      Mathlib.Analysis.Real.OfDigits. It writes the constant out in full as
//      the double sum and states normality directly - for every length l and
//      every j < 2^l, the proportion of starting positions n < M whose shifted
//      fractional part lands in [j/2^l, (j+1)/2^l) tends to 2^-l. There is no
//      project-defined normality predicate and no project-defined constant in
//      it, which is the place a faithful-looking statement could have been
//      quietly weakened. Overlapping occurrences are counted, which is the
//      strong reading.
//   2. The bridge. Solution.lean derives exactly that statement from the
//      development by unfolding definitions, and comparator.json compares
//      XiComparator.normality with only propext, Classical.choice and
//      Quot.sound permitted.
//   3. Smuggled hypotheses. Statement takes no arguments beyond l, j and
//      j < 2^l, so there is no slot for an unproven input passed as a theorem
//      argument - the failure mode that demoted the Erdos-Borwein entry.
//   4. Counted, not assumed: no sorry anywhere outside the deliberate
//      placeholder in ComparatorChallenge.lean, no axiom declarations, no
//      native_decide, no unsafe.
//   5. Independent of the author's machine. Audit.lean pins the axiom lists
//      with #guard_msgs, so a changed list is a build ERROR rather than an
//      informational line, and GitHub Actions ran the whole pipeline twice on
//      9 September from the pinned toolchain (Lean 4.34.0-rc2) and pinned
//      mathlib commit and passed both times. That is more than most Lean
//      submissions here can show.
//
// Not done: rebuilding it here. mathlib from source is not reproducible on
// this machine, so "the kernel accepted this" rests on the CI record.
//
// THE ONE CORRECTION, and it is to the submitter's note rather than the paper.
// The note says the real point is normality for a "natural" constant, "a
// number not constructed with the purpose of being normal". The paper is more
// careful and says the opposite of the strong reading: the one-prime values
// "already belong to an established normal family", citing Stoneham 1973 and
// Bailey-Crandall 2002 as an exact precedent, and it states that it has not
// located an earlier published conjecture about xi. So the entry records what
// this is - the mixed-prime extension of the Stoneham programme, where all the
// indices 2^a 3^c contribute at once - rather than a first normality proof for
// a natural constant. Real work, different claim.
//
// Significance 15, placed against named neighbours as the methodology asks:
// below reciprocal-fermat-constant-is-nonnormal at 18 (a named constant with a
// literature behind it), well below the-erdos-borwein-constant-is-2-dense at 25
// (answers a 2002 question of Crandall), above the machine-generated band
// because the target is recognisable inside a cited programme. Nobody had
// posed this question, and that axis measures how much mathematics cared
// before the solve.
//
// sourceUrl is repointed from the mutable main branch to commit 0696181, the
// one reviewed and the one CI built, following the percolation precedent. The
// repository is the entire evidentiary basis here - there is no arXiv posting -
// so a branch that can move is not good enough.
//
// aiContribution stays ai-discovered, the submitter's own account of their own
// project, but aiRole now says exactly what does and does not back it: the
// repository credits describe "an AI-assisted mathematical project" and
// attribute the submission documentation to Codex without separating model
// from human, and the paper carries no author byline.
//
// ---------------------------------------------------------------------------
// GROMOV-HAUSDORFF - held under the extraordinary-claims rule.
//
// Ishiki, arXiv 2609.09639: the Gromov-Hausdorff space M is homeomorphic to
// separable infinite-dimensional Hilbert space. 87 pages, version 1, posted
// 9 September, one day old at review.
//
// The submitter asked directly whether the site's independent-verification
// requirement applies. It does. A complete topological classification of M is
// a major result by any metric geometer's standard, and the methodology says
// such a claim is not published at Unreviewed and not published as a Candidate
// either, because a listing here puts the site's name beside a claim it has
// not read. Nobody has read this one - here or anywhere, in a day.
//
// Nothing about the submission is wrong. Its verificationNote already says
// author checking alone does not meet the bar; its note about Antonyan (2020)
// recording the questions rather than establishing an earliest date is the
// honest way to put it; the AI disclosure it summarises is verbatim accurate
// against the paper ("Use of AI. OpenAI Codex, based on GPT-6, was used to
// explore and develop the mathematical constructions and proofs... The author
// has verified all mathematical arguments... and takes full responsibility").
// The rule is about the size of the claim, not the credentials or the care of
// whoever brings it, and it has already been applied to a Yau-Tian-Donaldson
// disproof and a positive-curvature claim.
//
// One data defect fixed while holding: the row stores fieldGroup
// "Geometry &amp; topology", HTML-escaped, where the allowed option is
// "Geometry & topology". Left alone it is a choice-field violation that would
// refuse the entry on any later edit - exactly the class of stale-value trap
// the guarded client exists to stop. All 706 published entries are clean of
// HTML entities, so this is new and the submission path is worth a look; the
// server action does no escaping, so it arrived escaped.
//
// Everything else on the row is kept untouched so that, when the claim has
// stood up, the entry can be published as it stands.
//
// ---------------------------------------------------------------------------
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const LINK_LABEL_MAX = 120;

const SHA = "06961817c7f61181ed9a5c73badb8d908d6ccdcc";
const REPO = "https://github.com/CaptainSude/xi-normality";

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DECISIONS: Decision[] = [
  {
    slug: "binary-normality-of-localized-logarithm-value",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Binary normality of a localized logarithm value",
      field: "Normal numbers and digit expansions",
      statement:
        "Let $\\xi=\\sum_{a,c\\ge 0}\\frac{1}{2^{a}3^{c}\\,2^{2^{a}3^{c}}}$, the value at $1/2$ of Dibag's logarithm localized at the primes $2$ and $3$; summing the same terms over every positive integer rather than only the $3$-smooth ones gives $\\log 2$. Is $\\xi$ normal in base two, that is, does every finite binary word of length $l$ occur in its binary expansion with limiting frequency $2^{-l}$, counting overlapping occurrences?",
      resultNote:
        "Yes. Every finite binary word occurs with its expected limiting frequency, overlapping occurrences counted. The one-prime members of this family were already known to be normal: $\\alpha_{b,p}=\\sum_{k\\ge1}p^{-k}b^{-p^{k}}$ is Stoneham's constant, proved normal under primitive-root hypotheses by Stoneham in 1973 and unconditionally for coprime parameters by Bailey and Crandall in 2002. The new content is the mixed-prime support, where all the indices $2^{a}3^{c}$ contribute at once and the argument turns on the largest power of three in the truncation denominator surviving addition. The paper states that it has not located an earlier published conjecture about $\\xi$, so this settles no previously posed question. The Lean development covers qualitative normality of this constant only; the paper's quantitative discrepancy bound and its extension to larger finite sets of primes are outside the formalisation.",
      verificationNote:
        "Checked here on 10 September 2026 by reading the repository at commit 0696181. Challenge.lean imports only Mathlib.Analysis.Real.OfDigits, writes the constant out in full as the double sum, and states normality directly: for every length $l$ and every $j<2^{l}$, the proportion of starting positions $n<M$ whose shifted fractional part lands in $[j/2^{l},(j+1)/2^{l})$ tends to $2^{-l}$. No project-defined normality predicate and no project-defined constant appears in it, which is where a faithful-looking statement could have been quietly weakened, and the statement takes no extra hypotheses that could carry an unproven input. Solution.lean derives that statement from the development, and comparator.json compares XiComparator.normality with only propext, Classical.choice and Quot.sound permitted. Audit.lean pins the axiom lists with #guard_msgs, so a changed list fails the build rather than printing a note. GitHub Actions built the project twice on 9 September from the pinned toolchain (Lean 4.34.0-rc2) and the pinned mathlib commit and passed, which puts the kernel check on a machine other than the author's. The build was not repeated here, and the repository's README records that no external statement audit has been made.",
      aiRole:
        "The submitter states that ChatGPT-6 Astra chose the problem, proved it and produced the Lean formalisation. The repository's own credits are less specific: they describe an AI-assisted mathematical project, attribute the submission documentation and interface to OpenAI Codex, and do not separate what a model did from what a person did. The paper carries no author byline. Nothing found in review corroborates the autonomy claim beyond the submitter's word, and nothing contradicts it; it is recorded as their account rather than as an established fact.",
      significance: 15,
      significanceNote:
        "Normality of a constant nobody had asked about: the paper states it found no earlier published conjecture concerning this value. Below the catalog's reciprocal-Fermat nonnormality entry at 18, which concerns a named constant with a literature behind it, and well below the Erdos-Borwein 2-density entry at 25, which answers a 2002 question of Crandall. Above the machine-generated band, because the mixed-prime case is a recognisable target inside the Stoneham and Bailey-Crandall programme of explicit normal values that the paper cites as its closest precedent.",
      sourceUrl: `${REPO}/tree/${SHA}`,
      sourceName: "GitHub repository, pinned to the reviewed commit",
    },
    links: [
      {
        kind: "paper",
        label: "The nine-page paper",
        url: `${REPO}/blob/${SHA}/paper/localized-logarithm-normality.pdf`,
      },
      {
        kind: "lean-statement",
        label: "Challenge.lean: the trusted statement, Mathlib only",
        url: `${REPO}/blob/${SHA}/Challenge.lean`,
      },
      {
        kind: "lean-proof",
        label: "The proof development, module by module",
        url: `${REPO}/tree/${SHA}/XiNormality`,
      },
      {
        kind: "other",
        label: "GitHub Actions: pinned build and axiom audit, passed 9 Sep 2026",
        url: `${REPO}/actions/runs/34369628677`,
      },
      {
        kind: "other",
        label: "Dibag 1989, where the localized logarithms come from",
        url: "https://doi.org/10.1016/0021-8693(89)90180-4",
      },
    ],
    message: [
      "Approved and published, and thank you for building it so it could actually be checked.",
      "",
      "What I verified rather than took on trust: Challenge.lean imports only Mathlib, writes the constant out in full and states normality with no project-defined predicate to hide behind; the statement takes no extra hypothesis that could carry an unproven input; Solution.lean bridges to the development; Audit.lean pins the axiom lists with #guard_msgs so a changed list is a build error rather than a note; and the GitHub Actions run of 9 September built the whole pipeline from the pinned toolchain and mathlib commit and passed. That last point does real work - it puts the kernel check on a machine other than yours, which most Lean submissions here cannot show. I did not rebuild it locally.",
      "",
      "One correction, and it is to your note rather than to the paper. You wrote that the real point is normality for a natural constant, a number not constructed with the purpose of being normal. The paper is more careful: it says the one-prime values already belong to an established normal family, names Stoneham 1973 and Bailey-Crandall 2002 as the exact precedent, and states it has not located an earlier published conjecture about this value. So the entry records the result as the mixed-prime extension of that programme. That is not a small thing - every index 2^a 3^c contributing at once is the hard part - but it is a different claim from the one your note makes, and the paper does not make it.",
      "",
      "Significance is 15. That axis measures how much mathematics cared about the question before it was answered, and nobody had posed this one, so it sits below the site's reciprocal-Fermat nonnormality entry at 18 and the Erdos-Borwein 2-density entry at 25, both about constants with a literature behind them.",
      "",
      "Two housekeeping notes. The source URL is pinned to commit 0696181 rather than to main, because the repository is the whole evidentiary basis here and a branch can move. And your AI-role claim is recorded as your account: the repository credits describe an AI-assisted project without separating model from human, and the paper has no byline, so the entry says that in as many words rather than asserting autonomy the public record does not show.",
    ].join("\n"),
  },
  {
    slug: "the-topology-of-gromov-hausdorff-space",
    action: "reject",
    reason: "held",
    edits: {
      // HTML-escaped ampersand, which is not an allowed choice value and would
      // refuse any later edit of the entry. Fixed now so the row is publishable
      // on the day the claim stands up.
      fieldGroup: "Geometry & topology",
    },
    reviewNote:
      "Held 10 Sep 2026 under the extraordinary-claims rule: arXiv 2609.09639 v1, 87 pages, one day old, claiming the Gromov-Hausdorff space is homeomorphic to l^2. Nothing on the row is wrong and nothing was changed except status, reason, message and one data fix - fieldGroup arrived HTML-escaped as \"Geometry &amp; topology\", which is not an allowed choice value and would have refused any later edit. Re-publish as submitted once a named expert with no stake has checked the argument, the paper is accepted, or a machine-checked proof exists; watch arXiv 2609.09639 for v2 and for commentary. Ishiki is established in exactly this area and the AI disclosure is exemplary, so this is a timing decision, not a doubt.",
    message: [
      "Held rather than declined, and this is not a judgement on the mathematics.",
      "",
      "You asked directly whether the site's independent-verification requirement applies here. It does. The methodology's extraordinary-claims rule says a claim that would be a major result by any expert's standard is not published at Unreviewed, and not published as a Candidate either, because a listing here puts the site's name beside a claim it has not read. A complete topological classification of the Gromov-Hausdorff space is such a claim, and it arrived as an 87-page version 1 that was one day old. Nobody has read it yet, here or anywhere.",
      "",
      "The rule is about the size of the claim, not about the author or the submitter. Ishiki is established in exactly this area, the KAKENHI support and the earlier work the paper builds on are real, and the AI disclosure is exemplary: it names Codex on GPT-6, says what the model was used for, and states that the author verified every argument and takes full responsibility. Your submission was accurate about all of it, including the part where author checking alone does not meet the bar. The same rule has already held back a disproof of the Yau-Tian-Donaldson conjecture and a positive-curvature claim, both by established authors.",
      "",
      "The way back, any one of these:",
      "- a named expert with no stake in the work says publicly that they have checked the argument;",
      "- the paper is accepted by a journal;",
      "- a machine-checked proof of the main theorem exists.",
      "",
      "Send it again on any of those and it goes in at the tier it has earned. Your text is kept on the row, so nothing has to be written twice.",
      "",
      "Two things worth saying about the submission itself. Flagging that Antonyan (2020) records the questions rather than being an independently established earliest date was exactly right, and I would have had to write that caveat myself otherwise. And separating the main classification theorem from the absolute-retract theorem and the intermediate constructions is the correct division; if this comes back, that is the shape the entry will take.",
    ].join("\n"),
  },
];

async function connectWithRetry(): Promise<string> {
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

async function main() {
  const db = await connectWithRetry();
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

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
    if (cur.status !== "pending")
      throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(
      `${d.action === "reject" ? "HOLD   " : "APPROVE"}  ${cur.name.slice(0, 60)}`,
    );
    console.log(
      `  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`,
    );
    if (d.message.length > MESSAGE_MAX) bad++;

    for (const [k, v] of Object.entries(d.edits ?? {}))
      console.log(
        `  ${k.padEnd(17)}: ${typeof v === "string" ? `${v.length} chars` : JSON.stringify(v)}`,
      );
    for (const l of d.links ?? []) {
      console.log(
        `  link (${l.kind}) ${l.label.length}/${LINK_LABEL_MAX}: ${l.label}`,
      );
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }

    // The same check the guarded client runs on write, against the MERGED
    // result, so the dry run reports what the write would rather than
    // promising success and failing later.
    const merged = [...cur.links, ...(d.links ?? [])];
    const v = checkStoredEntry({
      specs: SPECS,
      fields: d.edits ?? {},
      links: merged,
      sourceUrl:
        ((d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl) || null,
    });
    console.log(`  field check: ${v.length ? "FAILED" : "ok"}`);
    for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
    bad += v.length;
    if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    console.log();
  }
  if (bad) throw new Error(`${bad} violation(s) - nothing written`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  // Written one statement at a time rather than in $transaction: the guard is
  // a query extension, and keeping the writes on the extended client is worth
  // more here than atomicity across three rows. If a later write fails, the
  // failure names which decision and which step, and re-running is safe
  // because the pending check above refuses an already-decided entry.
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

    if (d.reviewNote) {
      await prisma.reviewNote.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          body: d.reviewNote,
        },
      });
      console.log(`review note: ${d.slug}`);
    }
  }

  console.log("\nAPPLIED. Every public surface lags by up to an hour: these are");
  console.log("writes straight to the database, so nothing revalidates a tag.");
  console.log("A deploy clears it.");
}

main().finally(() => prisma.$disconnect());
