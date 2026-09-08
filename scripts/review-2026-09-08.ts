// Review of the eight submissions pending on 8 September 2026.
//
// What was checked, per submission:
//   - Sphere packing (Simkin): Klartag's c*d^2*2^-d confirmed as the current
//     all-dimensional state of the art (Quanta coverage, Kalai and Ellenberg
//     posts, arXiv 2606.13313 exposition). The claim is an unbounded
//     improvement ON that bound, with no expert review and no formalization.
//   - Depth-two affine incidence (Babanskyy): all three cited arXiv papers
//     fetched and confirmed real and as described - Laba-Trainor 2403.05719
//     records the residue-ring rank question, Dvir 2604.25822 is the later
//     bounds paper. Prior art is accurately identified.
//   - YAH arctic obstruction: read the submitter's own scope statement, which
//     says the subquestion "was not separately posed in the cited paper" and
//     that the scalar lemma alone is routine. YAH 2105.14697 confirmed real.
//   - f(732): OEIS baseline and the Erdos Frontier Atlas P302 gap are as
//     described; the Lean uses bv_decide with its LRAT checker axiom, so the
//     submitter's own lean-checked tier is the right one and stays.
//   - Erdos-Borwein: PrimeInputs.lean read directly. The two hypotheses are
//     AGP (Alford-Granville-Pomerance, in Vandehey's Proposition 2.1 form) and
//     a standard PNT consequence on primes in (L, 2L). Both are PUBLISHED
//     theorems, not conjectures, so the mathematics is conditional only on
//     known results - but they are hypotheses of the Lean theorem, and the
//     statement has no independent anchor, so the tier drops one rung.
//   - Measures on partial orders: arXiv 2609.02021 fetched. Author is Andrew
//     Snowden and the comments field reads "ChatGPT was used to obtain many
//     arguments. The writing was done entirely by the author." The submission
//     describes this accurately.
//   - Both Gilburg entries: repository tree listed. The shared 96-file
//     SierpinskiFormal directory is a common library (the name is inherited
//     from an earlier project, not evidence of a copied proof); each entry has
//     genuine theorem-specific modules. mortality/FiniteMortalityBound.lean
//     read in full: exists_short_zero_word_of_finite_real_monoid states
//     exactly the claimed 2^(n-1) + (2^(n-1)-1)*n(n+1)/2 bound under the
//     finite-word-range hypothesis, with no sorry and no axiom declarations,
//     and Audit.lean prints axioms for each endpoint. Neither statement is
//     anchored to a canonical tracker, so neither earns tier 1.
//
// Frontier check: none of these is a tracked quantity with a direction. The
// sphere-packing claim WOULD be, if it were ever admitted.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

type LinkIn = { label: string; url: string; kind: string };
type Decision = {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: LinkIn[];
};

const DECISIONS: Decision[] = [
  // ---------------------------------------------------------------- 1. HOLD
  // The extraordinary claims rule is explicit that a claim of this kind waits
  // for expert review or formal verification, and is not published as a
  // Candidate either. Klartag's bound is a headline result of the last two
  // years; an unbounded improvement on it, from a GitHub PDF whose only checks
  // are the same model family reviewing itself, is exactly the case the rule
  // was written for. This is a hold on the evidence, not a verdict on the
  // mathematics, and the message says so.
  {
    slug: "an-all-dimensional-improvement-for-lattice-sphere-packing",
    action: "reject",
    reason: "other",
    message: `Thank you for this, and for the unusually careful framing - flagging it as a proof candidate, naming the Klartag and Abuya-Gargava-Zhao baselines correctly, and stating plainly that no specialist has reviewed it. That is the right way to send something like this.

I am holding it rather than listing it, and I want to be exact about why, because it is not a judgement on the mathematics.

The catalog has an explicit rule for claims of this class: famous problems, and problems with decades of failed attempts, wait for expert review or formal verification before being listed - and specifically may not be listed as Candidates in the meantime. The all-dimensional lower bound for lattice sphere packing is squarely in that class. Klartag's c*d^2*2^-d is a headline result of the last two years, and an unbounded multiplicative improvement on it would be significant news in the area. The rule exists so that the catalog is not the first place such news appears.

What would change the answer, either one being enough:

1. A named specialist in lattice packings or high-dimensional convex geometry reads the manuscript and says it holds. That moves it to Independently expert-verified and it goes straight in.
2. A Lean formalization of the main theorem that compiles, so the bound is machine-checked rather than argued in prose.

Two smaller things that would help regardless. Posting to arXiv gives the work a citable record and a version history, which matters for a priority claim. And the phrase "additional model-based review" is doing a lot of work in the current write-up: same-family models checking each other correlate their errors, so it is worth stating separately from human checking rather than alongside it.

Please do resubmit when either of those two conditions is met. I will look again promptly.`,
  },

  // ------------------------------------------------------------- 2. APPROVE
  // Passes the inclusion test cleanly: Laba-Trainor recorded the question as
  // open, this settles the (k,n) = (2,2) case exactly, and the AI is
  // substantively in the loop. Not extraordinary - a two-year-old technical
  // question in finite geometry. Unreviewed is the honest tier and the
  // submitter chose it themselves.
  {
    slug: "exact-rank-and-smith-profile-of-affine-incidence-over-mathbb-z-p-2-mathbb-z",
    action: "approve",
    reason: "other",
    message: `Listed. Thank you - this is a well-made submission.

Three things it got right that reviewers notice. You identified the open question in the literature rather than posing your own, and I checked all three references: Laba-Trainor (arXiv:2403.05719) does record the residue-ring point-hyperplane rank question as open, and Dvir (arXiv:2604.25822) is the later bounds paper you say it is. You picked Unreviewed yourself instead of arguing for a higher tier off the back of your own test suite. And holding the depth-three sequel until this was reviewed was the right call.

It is listed as a Partial result, since the exact rank is settled for (k,n) = (2,2) while the general parameterized problem stays open, which is how you described it.

One note on the write-up, since it applies to the sequel too. The reproducibility work - clean replays, the 59-test suite, adversarial passes within the same workflow - establishes that the artifact is internally consistent and re-runnable. It is not evidence about the mathematics, because a model checking its own output correlates its errors. Your verification note already says this. Keeping that separation as crisp in the sequel will serve you well.

On depth three: send it as its own entry. Consecutive special cases of a parameterized problem are separate results, not an update to this one.`,
    edits: {
      significance: 8,
      significanceNote:
        "A technical question recorded as open by Laba and Trainor in 2024, settled exactly for the depth-two plane. Specialized but genuine: the full Smith profile is more than the rank the question asked for.",
    },
  },

  // -------------------------------------------------------------- 3. DECLINE
  // Fails the inclusion test on the submitter's own account: the subquestion
  // was not posed in the cited paper. They invited exactly this answer.
  {
    slug: "yah-mixed-base-collatz-system-scalar-arctic-first-step-obstruction-2",
    action: "reject",
    reason: "no-open-question",
    message: `Thank you for this, and for asking directly to be declined if the restricted result did not clear the bar. That kind of framing makes a reviewer's job easy and I would rather say so than let it pass unremarked.

Declining, and essentially on the grounds you set out yourself. The inclusion test is a precisely stated open question whose answer is now a proved or disproved theorem. Your own scope statement says the exact scalar subquestion "was not separately posed in the cited paper", that no separately named conjecture was solved, and that the full scalar lemma alone is routine. The open direction that Yolcu-Aaronson-Heule genuinely raise in section 6 is much broader than what is settled here, and a self-posed restriction of it is not the same object.

None of that says the work is bad. The certificate package is careful, the Farkas and RUP replays are real artifacts, and the claim registry with unresolved bridges listed separately is better hygiene than most submissions show.

What would qualify: settling the section 6 direction itself, or a restriction of it that YAH or a later paper states as a question. If you get to dimension two, or to another carrier where the obstruction still holds, that starts to look like an answer to something someone asked rather than to something you scoped.`,
  },

  // ------------------------------------------------------------- 4. APPROVE
  // Thin but sound. The quantity is tracked (OEIS A390395 and the Atlas's
  // P302 view), the theorem is real and Lean-compiled, the tier is honestly
  // self-assigned at lean-checked because bv_decide brings the LRAT axiom,
  // and the dependence on the external f(731) baseline is disclosed. Low
  // significance is the right way to record a small true thing.
  {
    slug: "reciprocal-triple-free-sets-the-finite-plateau-at-732",
    action: "approve",
    reason: "other",
    message: `Listed, as a Partial result at low significance.

This is a small result and you presented it as one, which is why it goes in. The quantity is tracked - OEIS A390395 plus the Frontier Atlas P302 view - so it is not a record on an untracked quantity, which is the exclusion that catches most submissions of this shape. The isolated-component argument is a real theorem, not a search report.

You also chose the correct tier without being asked. bv_decide brings its native LRAT checker axiom, so this is Lean-checked rather than Lean-verified, and you said so along with the fact that the f(731) = 606 baseline is external OEIS data rather than a formal theorem here. Both disclosures are why the entry can be trusted at the tier it claims.

Significance is set to 4. For calibration: a typical Erdos problem sits near 10 and machine-generated conjectures near 5, so a single further term of a finite table under one of them lands where it lands. That is a scale, not a criticism.

If the elementary component argument turns out to be folklore, tell me and I will add a note. Priority on a step this small is not worth a dispute, but the record should be accurate.`,
    edits: {
      significance: 4,
      significanceNote:
        "One further term of a tracked finite table under Erdos problem 302. The theorem is real and the argument is structural rather than a search, but the asymptotic problem is untouched.",
    },
  },

  // ------------------------------- 5. APPROVE, with the tier brought down
  // The submission claimed lean-verified/resolved. Reading PrimeInputs.lean
  // settles what "two prime-distribution estimates" means: AGP in Vandehey's
  // Proposition 2.1 form, and a standard PNT consequence. Both are published
  // theorems, so this is NOT conditional on conjectures - an important
  // distinction, and better than the vague submitted note suggested. But they
  // are hypotheses of the Lean theorem rather than formalized, and the
  // statement has no canonical anchor, so tier 1 does not hold. Candidate,
  // per its definition: full solution claimed, publicly checkable, review
  // pending.
  {
    slug: "the-erdos-borwein-constant-is-2-dense",
    action: "approve",
    reason: "other",
    message: `Listed, with two fields changed. Thank you for sending it, and for linking the earlier entry it builds on.

I read lean/ErdosBorwein/PrimeInputs.lean rather than take the summary as given, and it is worth telling you what I found, because it is better news than your own write-up implied. The two hypotheses are AGP - the Alford-Granville-Pomerance estimate in Vandehey's Proposition 2.1 form - and a standard prime number theorem consequence bounding primes in (L, 2L). Both are published theorems. So the result is not conditional on conjectures, only on known results that are not in Mathlib yet. Your note said "two explicitly stated prime-distribution estimates", which a reader could easily take the wrong way. I have rewritten it to name them.

Two changes:

Verification is now Lean-checked, statement unaudited rather than Lean-verified. The top tier needs the proof machine-checked AND the statement independently anchored - a canonical tracker, or an audited correspondence to someone else's formal statement. Here the statement is your own, and the two estimates enter as theorem arguments, so what the kernel certifies is an implication rather than the theorem outright. That is a real and useful thing, and Lean-checked is exactly the rung for it.

Status is now Candidate rather than Resolved: a full solution claimed and publicly checkable, with authoritative review pending. Disjunctivity of the binary expansion of the Erdos-Borwein constant is a strong claim in a hard area, and no specialist has read this yet.

One request. The entry has no description of what the model actually did, and I would rather leave that blank than invent it. If you can say which parts ChatGPT-6 Astra produced - the construction, the Lean, the paper - send it and I will add it.

The clean way to reach the top tier: formalize the two estimates, or get an analytic number theorist to read the argument.`,
    edits: {
      field: "Analytic number theory; digit distribution of constants",
      verification: "lean-checked",
      resolution: "candidate",
      verificationNote:
        "The Lean development proves disjunctivity of the binary expansion conditional on two hypotheses supplied as theorem arguments, not as axioms: AGP, the Alford-Granville-Pomerance estimate in the form of Vandehey's Proposition 2.1, and PrimeIntervalSupply, a standard prime number theorem consequence bounding the primes in (L, 2L) below by L/(3 log L). Both are published theorems rather than conjectures, so the mathematics is conditional only on known results; neither is formalized here. Read directly from lean/ErdosBorwein/PrimeInputs.lean on 8 September 2026. The audited endpoints depend on propext, Classical.choice and Quot.sound only. Because the statement is the author's own rather than anchored to a canonical tracker, and because what the kernel certifies is the implication, this takes the statement-unaudited tier. No specialist in analytic number theory has read the argument.",
      significance: 25,
      significanceNote:
        "A question of Crandall's from 2002 about a named constant. Full disjunctivity of the binary expansion is substantially stronger than the single-block result the catalog already records, and digit-distribution results for specific constants are historically hard to come by.",
    },
    links: [
      {
        label: "PrimeInputs.lean: the two external estimates, stated exactly",
        url: "https://github.com/CaptainSude/erdos-borwein-disjunctivity/blob/main/lean/ErdosBorwein/PrimeInputs.lean",
        kind: "lean-statement",
      },
      {
        label: "Lean verification record and axiom audit",
        url: "https://github.com/CaptainSude/erdos-borwein-disjunctivity/blob/main/lean/VERIFICATION.md",
        kind: "lean-proof",
      },
    ],
  },

  // ------------------------------------------------------------- 6. APPROVE
  // The strongest submission in the batch. A named, prominent author, on
  // arXiv, disclosing the model's role himself. Verified the disclosure
  // verbatim from the arXiv comments field.
  {
    slug: "measures-on-partial-orders",
    action: "approve",
    reason: "other",
    message: `Listed. This is the clearest submission in the current batch.

I checked arXiv:2609.02021 and the comments field carries the disclosure verbatim: "ChatGPT was used to obtain many arguments. The writing was done entirely by the author." An author of Snowden's standing saying that in the paper itself, rather than leaving it to be inferred, is worth more to this catalog than any amount of third-party description.

Unreviewed is correct and your note explains why precisely: the proofs are conventional and were checked by the author, who is also the person publishing, so this is author verification and not independent expert verification. Flake being thanked for discussions is not the same as an endorsement, and you were right not to read it as one.

The entry has no year posed, which I have left empty rather than guessed at. If the poset case is identified as open in a specific Harman-Snowden paper, that would be worth adding.`,
    edits: {
      significance: 18,
      significanceNote:
        "Completely determines the measures on the Fraisse class of finite posets within the Harman-Snowden program, and is the first case where the space of measures is not equidimensional. A specialized but substantive research result, published by a leading author in the area.",
    },
  },

  // ------------------- 7. APPROVE, fields unswapped and tier brought down
  // The submitted verificationNote contained AI-role text and aiRole was
  // empty, so the fields are put where they belong. On the tier: the Lean is
  // real - FiniteMortalityBound.lean states exactly the claimed bound with no
  // sorry and no axiom declarations - but no canonical anchor exists, so tier
  // 1 does not hold. Partial rather than Candidate: it supplies the
  // exponential alternative of Almeida-Steinberg Question 5.7 while the
  // polynomial alternative stays open, which the submitter says plainly.
  {
    slug: "an-exponential-mortality-bound-for-finite-real-matrix-monoids",
    action: "approve",
    reason: "other",
    message: `Listed, with the fields sorted out and the tier adjusted.

First, a mechanical fix: the text you sent in the verification note was a description of what the model did, and the AI role field was empty. I have moved it to the AI role field and written an actual verification note in its place. Worth knowing for next time, since the two fields are read very differently.

I checked the Lean rather than take the claim on trust. FiniteMortalityBound.lean states exists_short_zero_word_of_finite_real_monoid with the bound 2^(n-1) + (2^(n-1)-1)*n(n+1)/2 under exactly the hypotheses the write-up describes, with no sorry and no axiom declarations, and Audit.lean prints the axioms for each endpoint. The rational specialization is a real corollary via the cast. This is a faithful formalization of the theorem you claimed.

One thing worth recording, since I went looking for a problem and did not find one: both your entries ship a 96-file SierpinskiFormal directory with identical filenames, which initially looked like one scaffold passed off twice. It is a shared library, and each entry has its own modules on top. The name is misleading given neither result concerns Sierpinski, and renaming it would save the next reviewer the same detour.

Two changes:

Verification is Lean-checked, statement unaudited rather than Lean-verified. Tier 1 needs the statement independently anchored - a canonical tracker, or audited correspondence to a formal statement someone else wrote. Here statement and proof were authored together. That is not a criticism of the formalization, which I read and which is sound; it is the difference between checking a proof and checking that the proof is of the right theorem.

Status is Partial result rather than Candidate. You say yourself that this supplies the exponential alternative in Almeida-Steinberg Question 5.7 while the polynomial alternative remains open, so the question is advanced rather than settled.`,
    edits: {
      aiRole:
        "All original mathematical contributions in the manuscript were produced by AI. The research developed a rank-descent argument for mortality under the finite-product-monoid promise: compressed return semigroups yield finite groups of invertible returns, finite-group averaging supplies an invariant symmetric form, and a symmetric-matrix lift converts rank descent into a short-word detection problem. Iterating the resulting rank-decreasing sandwich gives the final bound. The manuscript and the Lean formalization were also AI-produced, while established ingredients and prior results are separately credited. The human publisher selected and organized the research but does not claim subject-matter review.",
      verification: "lean-checked",
      resolution: "partial",
      verificationNote:
        "Checked here on 8 September 2026 from the published tree. mortality/lean/SierpinskiFormal/FiniteMortalityBound.lean states exists_short_zero_word_of_finite_real_monoid with the bound 2^(n-1) + (2^(n-1)-1)*n(n+1)/2, under exactly the hypotheses claimed: dimension positive, the range of the word map finite, and some word equal to zero. No sorry and no axiom declarations in that file; Audit.lean prints the axioms for each of the four endpoints. The rational statement is derived from the real one through the cast, so it is a corollary rather than a separate claim. The statement was authored alongside the proof rather than anchored to a canonical tracker, so this takes the statement-unaudited tier. No human mathematical review of the argument is claimed, and none has taken place.",
      significance: 12,
      significanceNote:
        "Answers the exponential side of a 2009 question of Almeida and Steinberg and improves the Kiefer-Ryzhikov rational bound under the same finite-product promise. A clean quantitative advance in a specialized corner of matrix semigroup theory; the polynomial alternative, which is the interesting half, stays open.",
    },
    links: [
      {
        label: "FiniteMortalityBound.lean: the main theorem as formalized",
        url: "https://github.com/egilburg/aimath/blob/main/mortality/lean/SierpinskiFormal/FiniteMortalityBound.lean",
        kind: "lean-statement",
      },
      {
        label: "Audit.lean: the printed endpoints and their axioms",
        url: "https://github.com/egilburg/aimath/blob/main/mortality/lean/Audit.lean",
        kind: "lean-proof",
      },
    ],
  },

  // ------------------------------- 8. APPROVE, with the tier brought down
  // Best-documented Lean development of the batch, and the audit description
  // is specific rather than promotional. Still tier 4: the statement is the
  // same AI's, with no canonical anchor. Candidate rather than Resolved, on
  // the same footing as the Kothe entry - full solution, publicly checkable,
  // nobody qualified has read it.
  {
    slug: "sharp-finite-markov-order-in-intrinsic-sofic-dimension",
    action: "approve",
    reason: "other",
    message: `Listed, with the tier and status adjusted one rung each.

The verification note here is the most useful of the three Lean submissions in this batch: a pinned toolchain and Mathlib commit, the project-local import closure included, the endpoints audited to propext, Classical.choice and Quot.sound, reproduction instructions and source hashes. It also states its own limits - that Lean establishes the encoded statements and assumptions, not novelty or every prose claim, and that the two-sided extension is discussed rather than proved. Write-ups that bound their own claims are easier to trust, not harder.

Two changes:

Verification is Lean-checked, statement unaudited rather than Lean-verified. The top tier needs both halves: kernel-checked, and the statement independently anchored to a canonical tracker or an audited correspondence with a formal statement written by someone else. Here the same process produced statement and proof. Compare the Kothe entry in the catalog, which holds the top tier because its statement is byte-identical to the Formal Conjectures repository at a named commit - that external anchor is the whole difference, and it is available to you: if the Beal-Juge-Mairesse-Perrin horizon question gets a formal statement anywhere canonical, an audited correspondence would lift this straight up.

Status is Candidate rather than Resolved, since you state that no professional mathematical review is claimed. Candidate means precisely this: a full solution, publicly checkable, authoritative review pending. It is the same status the Kothe disproof carries.

The prior-art paragraph in your note is good practice - naming Beal-Senellart's N(N-1)/2 delay and Trahtman's construction as precedents for the quadratic phenomenon, and not claiming them. Keep doing that.

Same note as on your mortality entry: the shared SierpinskiFormal library name has nothing to do with either result and cost me a detour to rule out a copied proof.`,
    edits: {
      verification: "lean-checked",
      resolution: "candidate",
      significance: 12,
      significanceNote:
        "Replaces the 2^(n^2-1) finite-Markov-order horizon of Beal, Juge, Mairesse and Perrin with the exact value n choose 2, and matches it with a construction. A sharp answer to a 2026 question in a specialized area, with the sharpness half doing most of the work.",
    },
    links: [
      {
        label: "Audit.lean: the printed endpoints and their axioms",
        url: "https://github.com/egilburg/aimath/blob/main/sofic_markov_order/lean/Audit.lean",
        kind: "lean-proof",
      },
    ],
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
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  let bad = 0;
  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, status: true, name: true },
    });
    if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
    if (cur.status !== "pending")
      throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(
      `${d.action === "reject" ? "DECLINE" : "APPROVE"}  ${cur.name.slice(0, 58)}  [${d.reason}]`,
    );
    console.log(
      `  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`,
    );
    if (d.message.length > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(
          `  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`,
        );
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(
        `  link             : ${l.label.length}/${LINK_LABEL_MAX}  ${l.kind}`,
      );
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: {
        id: true,
        submittedById: true,
        _count: { select: { links: true } },
      },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);
    const n = cur._count.links;

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? {
                links: {
                  create: d.links.map((l, i) => ({ ...l, position: n + i })),
                },
              }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      }),
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
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log(
    "\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.",
  );
}

main().finally(() => prisma.$disconnect());
