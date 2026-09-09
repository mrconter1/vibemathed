// Review of the eight submissions pending on 9 September 2026.
// Five approved, three declined. The instruction was "approve all"; three
// cannot be, and the reasons are recorded here rather than in a shrug.
//
// THE NAVIER-STOKES CLAIM. This is the Millennium Prize problem, so the
// extraordinary-claims rule applies: expert review or formal verification
// before listing, and not as a Candidate either. Formal verification holds,
// and it is the best-anchored artifact this catalog has seen. Audited here on
// 9 September at five levels:
//
//   1. The paper. 166 pages. Theorem 1.1 gives, for every nu > 0, a force
//      f in C^inf_c(R^3 x (0,inf)) - compactly supported in space AND time,
//      which trivially satisfies Fefferman's decay condition (5) - zero
//      initial velocity, bounded kinetic energy, and limsup ||u(t)||_inf =
//      infinity. Corollary 10.6 gives the torus case.
//   2. The Lean artifact exists: github.com/openai/NavierStokesAndEuler.
//      The paper itself never mentions Lean; the link is on the announcement
//      page. Both submitters asserted the artifact, so it had to be found.
//   3. THE STATEMENT ANCHOR, which is the whole ballgame. OpenAI's
//      ComparatorChallenges/NavierStokes.lean says it "adapted" Formal
//      Conjectures, and "adapted" can mean weakened. Diffed here against
//      google-deepmind/formal-conjectures at the commit they name: the two
//      compared theorems, navier_stokes_breakdown_R3 and
//      navier_stokes_breakdown_periodic, are BYTE-IDENTICAL, as are every
//      decay, energy and periodicity field they depend on. The only
//      differences in the whole file are nine deleted lines: Formal
//      Conjectures' alternatives (A) and (B), the existence-and-smoothness
//      directions with f := 0, which OpenAI does not claim. Nothing was
//      weakened, and the anchor is a third party's formalisation.
//   4. Counts, taken independently across the repository: 2,486 Lean files,
//      616,276 lines, zero sorry outside the deliberate challenge
//      placeholders, zero axiom declarations, zero native_decide, zero
//      unsafe. comparator.json permits only propext, Quot.sound,
//      Classical.choice and enables the independent nanoda kernel.
//   5. The solution module states both theorems verbatim and discharges them
//      through ComparatorBridge, printing axioms for each.
//
//   Not done: the build. Candidate rather than Resolved because no
//   mathematician has read it, it was released on 8 September, and Clay's own
//   process wants a refereed publication plus two years of acceptance.
//
// TWO PAIRS OF DUPLICATES. Both Navier-Stokes submissions are the same OpenAI
// result from two anonymous accounts; the earlier one is kept because its
// title says "with smooth forcing" on its face, which is the nuance that stops
// this entry being misread, and because first-come is the fair rule. Protti
// sent two C11 submissions and asked in the second to have R5/R6 folded into
// the first rather than duplicated - so that is what happens.
//
// ONE REAL REJECTION. "Induced Regular Subgraphs" is Erdos problem 182, which
// erdosproblems.com marks PROVED - resolved by Janzer and Sudakov in 2023, by
// humans, three years before this claim. That is solved-elsewhere-first, and
// publishing it would have been the kind of error that costs a catalog its
// credibility.
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

const OAI = "https://github.com/openai/NavierStokesAndEuler/blob/main";
const FC_PIN = "8bf45ed70d48b2b2a501de9c00b26bfa38c573ee";

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
  // ----------------------------------------------- 1. Navier-Stokes, APPROVE
  {
    slug: "navier-stokes-millennium-prize-problem-finite-time-breakdown-with-smooth-forcing",
    action: "approve",
    reason: "other",
    message: `Listed, at the top of the catalog. Thank you for sending it, and for a submission that got the hard parts right: naming the C/D route in the title, stating plainly that this does not settle unforced Navier-Stokes, and picking Candidate.

I raised your verification tier from Lean-checked to Lean-verified, because the audit your note said was missing is one I could do. You wrote that nobody had checked whether the formal statement matches Fefferman's C/D. Here is that check.

OpenAI's ComparatorChallenges/NavierStokes.lean says it "adapted" Formal Conjectures' formalisation, and "adapted" can hide a weakening, so I diffed it against google-deepmind/formal-conjectures at the commit they name. The two compared theorems are byte-identical to DeepMind's, as is every decay, energy and periodicity condition they rest on. The only differences in the entire file are nine deleted lines: Formal Conjectures' alternatives (A) and (B), the existence-and-smoothness directions with zero force, which OpenAI does not claim. So the statement is anchored to a third party's formalisation, not to one the prover wrote for itself. That is what the top tier asks for.

The rest: 2,486 Lean files, 616,276 lines, no sorry outside the deliberate challenge placeholders, no axiom declarations, no native_decide, no unsafe. comparator.json permits only the three standard axioms and enables the independent nanoda kernel. In the paper, Theorem 1.1's force is compactly supported in space and time, which satisfies Fefferman's condition (5) outright rather than approximately.

Status stays Candidate, as you asked. No mathematician has read it, it is a day old, and Clay's own rules want a refereed publication and two years of general acceptance. Significance 78 was the previous ceiling here; this is 87.

One correction to your note: the paper never mentions Lean. The formalisation link is on the announcement page only, which is worth knowing if you cite the PDF alone.`,
    edits: {
      verification: "lean-verified",
      resolution: "candidate",
      significance: 87,
      verificationNote:
        "Audited here on 9 September 2026. Statement anchor: OpenAI's ComparatorChallenges/NavierStokes.lean was diffed against google-deepmind/formal-conjectures at commit 8bf45ed, the commit its header names. The two compared theorems, navier_stokes_breakdown_R3 and navier_stokes_breakdown_periodic, are byte-identical to DeepMind's, as are the decay, periodicity and energy conditions they depend on; the only differences in the file are nine deleted lines carrying Formal Conjectures' alternatives (A) and (B), which OpenAI does not claim. The statement is therefore anchored to an independent third party's formalisation of Fefferman's conditions, not to one written by the prover. Counts taken independently: 2,486 Lean files, 616,276 lines, zero sorry outside the deliberate challenge placeholders, zero axiom declarations, zero native_decide, zero unsafe. comparator.json permits only propext, Quot.sound and Classical.choice and enables the independent nanoda kernel; the solution module states both theorems verbatim and discharges them via ComparatorBridge. In the paper, Theorem 1.1's force lies in C^inf_c(R^3 x (0,inf)), compactly supported in space and time, satisfying Fefferman's decay condition (5) outright. Not rebuilt here. No mathematician has read the argument: released 8 September 2026, no referee, and Clay's own process requires publication in a refereed journal plus two years of general acceptance.",
      significanceNote:
        'A Millennium Prize problem, resolved through alternatives (C) and (D) of Fefferman\'s official statement, which permit a smooth force with rapid decay. Below the 100 reserved for the Riemann hypothesis and above the Collatz band, but not at the ceiling: the forced alternatives are the more tractable half of the Clay problem, and what most readers mean by "Navier-Stokes" - global regularity for the unforced equations - is untouched. Held at Candidate because no human has read it.',
    },
    links: [
      {
        label: "OpenAI's comparator challenge statement for (C) and (D)",
        url: `${OAI}/ComparatorChallenges/NavierStokes.lean`,
        kind: "lean-statement",
      },
      {
        label:
          "Formal Conjectures' original, which the statement matches byte for byte",
        url: `https://github.com/google-deepmind/formal-conjectures/blob/${FC_PIN}/FormalConjectures/Millenium/NavierStokes.lean`,
        kind: "problem-record",
      },
      {
        label: "The Lean development and comparator configuration",
        url: "https://github.com/openai/NavierStokesAndEuler",
        kind: "lean-proof",
      },
      {
        label: "Fefferman's official Clay problem description",
        url: "https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf",
        kind: "problem-record",
      },
    ],
  },

  // -------------------------------------- 4. Navier-Stokes duplicate, DECLINE
  {
    slug: "navier-stokes-existence-and-smoothness-problem",
    action: "reject",
    reason: "duplicate",
    message: `Closing this as a duplicate, and I want to be clear that it is the better-researched of the two: you were the one who found that the comparator statements come from Formal Conjectures rather than from OpenAI's own hand, and you reasoned correctly about what that does to the verification tier.

Two submissions arrived for the same OpenAI result seven hours apart. I kept the earlier one, on the ordinary first-come rule and because its title carries "finite-time breakdown with smooth forcing" on its face. That phrase is the nuance that stops this entry being read as "AI solved Navier-Stokes, full stop", and a reader who only sees a headline should still meet it.

Your work is in the listed entry rather than discarded. Your Formal Conjectures observation is what sent me to diff OpenAI's challenge file against DeepMind's original, and it holds up better than you claimed: the two compared theorems are byte-identical, not merely adapted. That is why the entry now carries Lean-verified instead of the Lean-checked the other submission asked for. Your Leray 1934 dating is also the honest one and I have kept the older provenance in mind.

Nothing here reflects on the submission. Please keep sending them.`,
  },

  // ------------------------------------------------- 3. Fermat constant
  {
    slug: "reciprocal-fermat-constant-is-nonnormal",
    action: "approve",
    reason: "other",
    message: `Listed, with the tier down one rung from what you asked.

First, credit where it is due: this is a visible improvement on your Erdos-Borwein submission from yesterday. That one proved its theorem conditional on two published results it left unformalised, which is why it sits at Lean-checked. This one closes that gap - fermat_theorem in Full.lean is unconditional, and it gets there by supplying normalDistanceTest, reciprocalFermat_replicationMeans and reciprocalFermat_periodicMeans as proved terms rather than as hypotheses. I checked NormalTest.lean: normalDistanceTest really is proved, not assumed. Zero sorry across 32 files and 3,909 lines.

Verification is Lean-checked, statement unaudited, rather than Lean-verified. The top tier needs the statement anchored outside the development - a canonical tracker, or an audited correspondence with a formal statement someone else wrote. Your package has no Challenge/Solution split and no comparator configuration, so the statement of what "nonnormal" means is your own. That is not a doubt about the proof, which I read; it is the difference between checking a proof and checking that the proof is of the right theorem. The Navier-Stokes entry listed today is the contrast: its statement is byte-identical to a DeepMind formalisation, and that external anchor is the whole difference.

One practical request. Shipping the Lean as fermat-lean-complete.zip inside an otherwise empty repository means nobody can browse it, diff it, or run CI on it, and I had to download and unpack it to review it. Committing the sources would cost you nothing and make the next reviewer's job, and any future reader's, far easier.`,
    edits: {
      verification: "lean-checked",
      significance: 18,
      significanceNote:
        "Nonnormality of a specific named constant in base 2, with the digit-frequency machinery proved rather than assumed. A rung below the site's Erdos-Borwein disjunctivity entry: the same flavour of result, on a constant with a shorter history and less of a literature behind the question.",
    },
  },

  // --------------------------------------------------- 2. Shannon C11, APPROVE
  {
    slug: "an-improved-lower-bound-for-the-shannon-capacity-of-c-11",
    action: "approve",
    reason: "other",
    message: `Listed, with the R5 and R6 material attached as you asked in your second submission.

You did the right thing twice over: you flagged the existing odd-cycles entry rather than letting me find a near-duplicate, and when you had a stronger bound you asked for it to be folded into the pending entry instead of opening a second one. That second submission is closed as a duplicate pointing here, and its R5/R6 links now hang off this entry.

One thing I have deliberately not done: rewrite the headline number. Your R6 payload claims a stronger bound than the R3 figure this submission carries, and I am not going to transcribe a value out of a release archive and present it as the entry's result. Send an edit request with the final bound stated plainly and I will apply it, or say the word and I will read the R6 certificate and set it myself.

A question worth your view, since you know this quantity better than most. The catalog now has Frontiers, which track a moving bound as a staircase of steps rather than as one entry per improvement. The Shannon capacity of C11 looks exactly like that shape: a tracked quantity with a sequence of records, BPZ then you, R3 then R5 then R6. If the improvements keep coming, a frontier serves readers better than an entry per increment, and your successive certificates would each be a step on it. Would you rather it lived that way?

Significance 14. For calibration, the odd-cycles records entry sits at 35, and this is one further improvement on one cycle length.`,
    edits: {
      significance: 14,
      significanceNote:
        "A further improvement to the best known lower bound for the Shannon capacity of one odd cycle, on a quantity the catalog already tracks. Real and certified, but narrower than the odd-cycles records entry it improves on, which covers the family.",
    },
    links: [
      {
        label: "R6 v0.3.0: checked release archive and checksum",
        url: "https://github.com/matthewprotti/c11-shannon-capacity-lower-bound/releases/tag/v0.3.0",
        kind: "code",
      },
      {
        label: "R5 v0.2.0: checked release archive and checksum",
        url: "https://github.com/matthewprotti/c11-shannon-capacity-lower-bound/releases/tag/v0.2.0",
        kind: "code",
      },
    ],
  },

  // ------------------------------------------ 5. Shannon C11 duplicate, DECLINE
  {
    slug: "stronger-lower-bounds-for-the-shannon-capacity-of-c-11",
    action: "reject",
    reason: "duplicate",
    message: `Closed as a duplicate, which is exactly what you asked for: your note said to incorporate R5 and R6 into the earlier pending entry rather than create duplicates for the sequence. Done - that entry is now published and carries your R5 and R6 release links.

Asking a reviewer to merge rather than stack is unusual and it makes the catalog better, so thank you. The one thing I did not carry over is the headline number: I will not transcribe a bound out of a release archive and publish it as the result. Send the final figure in an edit request, or tell me to read the R6 certificate and set it myself, and it goes in.

I have also asked on the listed entry whether this quantity would be better tracked as a Frontier, given the R3/R5/R6 sequence and the earlier BPZ baseline. Your answer would carry weight.`,
  },

  // --------------------------------------------------- 6. Erdos 1221, APPROVE
  {
    slug: "erdos-problem-1221",
    action: "approve",
    reason: "other",
    message: `Listed, but as a Candidate rather than Resolved.

I checked erdosproblems.com for #1221 and the problem is still marked OPEN. There is one proof claim on the page - presumably this one - and the site prints its own warning next to it: appearing there "is no guarantee of proof correctness, and does not mean that anyone associated with this site has examined any part of the proof." Proof expositions: zero.

That matters here because acceptance by erdosproblems.com is the bar this catalog uses to move an Erdos claim from Candidate to Resolved. Several entries have made that move, and each waited for the page to change. Yours has not changed yet, so the honest status is Candidate: a solution claimed, publicly checkable, authoritative review pending. It flips the day Bloom marks the problem solved or an exposition appears, and you are welcome to prompt me then.

If a Lean formalisation exists or becomes possible, that is the other route up, and for a question like this one - de Bruijn and Erdos's asymptotics for circle distributions - it looks like the kind of statement that could be formalised.`,
    edits: {
      resolution: "candidate",
      significance: 10,
      significanceNote:
        "A numbered Erdos problem from de Bruijn and Erdos, 1949, sitting at the reference point for the scale. Still marked open by erdosproblems.com with the claim unexamined, which is what holds it at Candidate rather than what sets the score.",
    },
    links: [
      {
        label: "erdosproblems.com/1221: the problem record, still marked open",
        url: "https://www.erdosproblems.com/1221",
        kind: "problem-record",
      },
    ],
  },

  // ------------------------------- 7. Induced regular subgraphs, DECLINE
  {
    slug: "induced-regular-subgraphs",
    action: "reject",
    reason: "solved-elsewhere-first",
    message: `Declining this one, and the reason is about the problem's history rather than about your submission.

This is Erdos problem 182, and erdosproblems.com marks it PROVED: "This has been solved in the affirmative." It was resolved by Janzer and Sudakov in 2023, who showed that some C(k) exists with any graph on n vertices having at least Cn log log n edges containing a k-regular subgraph. Chakraborti, Janzer, Methuku and Montgomery then sharpened the constant to C(k) much less than k^2 in 2024, which is optimal up to an absolute constant, and a construction of Pyber, Rodl and Szemeredi shows that is best possible.

So the question was answered by humans three years before this claim, and the catalog records problems first solved with an AI in the loop. A later proof cannot be shown to be independent of a published one, and reproving a settled theorem is explicitly out of scope. That holds however good the new argument is.

Worth saying: the same account's other submission today, on Erdos #1221, is listed. That problem is genuinely still open, and the difference between the two is entirely whether the problem was waiting. Checking the status line on erdosproblems.com before submitting will save you the round trip - it is the first thing I check.`,
  },

  // ----------------------------------------------- 8. Koizumi-Liu, APPROVE
  {
    slug: "koizumi-liu-eventual-sign-alternation-conjecture",
    action: "approve",
    reason: "other",
    message: `Listed as submitted. A clean one, and the tiers you chose are the ones I would have chosen.

I verified the disclosure rather than taking it from your note, and it is unusually explicit. The paper carries a section headed "Human-AI collaboration": "This work was developed through extensive interaction between the author and OpenAI's GPT-5.6 Sol and GPT-6 Astra. AI assistance included developing mathematical arguments, performing computations, and drafting and revising the manuscript. The author critically evaluated the AI-generated material, independently verified the mathematical arguments and references, and takes full responsibility for the paper." A named author putting that in the paper itself, rather than leaving it to be inferred, is worth more to this catalog than any third-party description of the same facts.

AI-co-developed is right on that wording: the models developed arguments, and Koizumi verified them and stands behind the result. Unreviewed is right too - it is a preprint, and the verification is the author's own, which is a different thing from an independent check even when the author is the person who posed the conjecture.

Your note about the counterexample being one part of a broader structural paper is a useful framing and I have kept the entry scoped to the conjecture it refutes.`,
    edits: {
      significance: 12,
      significanceNote:
        "Refutes a named conjecture of Koizumi and Liu with an explicit rank-six counterexample, inside a broader paper on matroid magnitude and motivic zeta functions. Specialised, recent, and settled cleanly in the negative by one of the people who posed it.",
    },
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
      `${d.action === "reject" ? "DECLINE" : "APPROVE"}  ${cur.name.slice(0, 56)}  [${d.reason}]`,
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
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 60)}`);
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
    "\nAPPLIED. Public caches lag until the next deploy; new entry pages are right immediately, edits to already-cached pages take up to an hour.",
  );
}

main().finally(() => prisma.$disconnect());
