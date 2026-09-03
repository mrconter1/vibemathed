// Review of the eight submissions pending on 3 Sep 2026.
//
// Six published, one held, one closed as a duplicate. Every AI disclosure was
// checked in the primary source rather than taken from the submission form -
// four of the six approvals have their disclosure in a dedicated section of
// the paper that the arXiv abstract page does not show, so the abstract alone
// would have failed them wrongly.
//
// ---------------------------------------------------------------------------
// 1. Saxl graphs (VibeGene) - APPROVE.
//
// arXiv 2609.01367, Rizzoli and Thomas. The paper carries a "Declaration of
// generative AI and AI-assisted technologies" section describing exactly the
// history the submission reports: a Codex-assisted attempt to PROVE the
// conjecture, a falsification run over IRREDSOL that produced counterexamples
// instead, then work with Codex, ChatGPT Pro and Claude to generalise them.
// Magma, GAP, C++ and Python code plus a Lean formalisation of Theorem 1.2
// with no sorry, all on Zenodo. Answers Kourovka 21.29 negatively.
//
// 2. Ancheta-Massey (VibeGene) - APPROVE.
//
// arXiv 2608.22837, Yihong Wu. The disclosure is in the abstract itself: "The
// proof was discovered by GPT-5.6 Sol in an interactive process guided by the
// author." Massey's 1978 question, settled for all p < 1/2.
//
// 3. Hat-guessing K5-e (LuckyHawk816) - APPROVE, as submitted.
//
// Self-published GitHub disclosure by Matthew Protti, an independent
// researcher. Unusually honest for a self-published claim: AI_USE_AND_
// PROVENANCE.md names GPT-5.6 Pro and says the F_2^3 construction was
// developed model-assisted rather than copyedited; STATUS.json records
// review_status INDEPENDENT_REVIEW_PENDING and marks four scope items false.
// The source problem is real - Adriaensen et al., arXiv:2603.04909, which
// leaves HG_P(K5-e) in {7,8}.
//
// Kept at Unreviewed and Candidate as submitted. The repository ships a
// dependency-free Python verifier that checks all 8,400 proper colourings,
// and running it would earn Site-confirmed - but running a stranger's code on
// a curator's machine is exactly what the verify-lean workflow exists to
// avoid, and there is no sandboxed equivalent for Python yet. Said plainly in
// the note rather than quietly skipped.
//
// 4. Stable forking, VibeGene's - APPROVE, enriched from the duplicate.
// 8. Stable forking, LucidManta102's - REJECT as duplicate.
//
// Both cite arXiv 2609.00436 (Freitag and Mutchnik), whose abstract opens
// "Using ChatGPT 5.6, we find a counterexample to the stable forking
// conjecture." VibeGene filed first and named the authors; LucidManta102
// (Andrei Sipos) quoted the paper's own AI paragraph verbatim and stated the
// disproved proposition formally. The surviving entry takes the better half
// of each, and the rejection says so.
//
// 5. Colombo determinant (AmberGander937) - APPROVE.
//
// arXiv 2609.00101, Qianli Ma. Disclosure is in a "Use of AI-assisted tools"
// section naming the WuJie agent, DeepSeek, Qwen, Kimi and GPT, and saying
// they "played a substantial role in identifying the proof strategy and
// producing an initial proof draft". Lean 4 formalisation of the new
// odd-exponent branch, 2817 jobs, no sorry, Palomar-registered.
//
// The submitter's own priority note is the methodology's concurrent-proofs
// rule applied without being asked: Ma's arXiv upload postdates Li-Tie-Wang-
// Liu's, but revises an 18 Aug Zenodo deposit that already had the theorem,
// and the methods are genuinely different. The paper's comments field
// confirms both facts. That note is kept as the result note's tail.
//
// 6. theta(p_c) = 0 for percolation (VibeGene) - HELD.
//
// The extraordinary-claims rule, and not a close call.
//
// theta(p_c) = 0 for 3 <= d <= 10 is among the most famous open problems in
// probability theory. But the decisive fact is the source: the entry cites
// commit 795efb8 of anthropics/formal-math, and the percolation directory
// that commit added is GONE from the repository. It is there at 795efb8;
// at HEAD the top level is .github, LICENSE, README and zeta23, the README
// lists only zeta23, and /contents/percolation returns 404. The work was
// withdrawn from the repository it was published in.
//
// Two further reasons, either of which would have been enough on its own.
// The submitted verification note says "no sorry outside the two deliberate
// placeholders in Challenge.lean" - which is to say there are sorries, and
// the entry would have gone up at Lean-checked. And "posed by Justin Leder"
// is wrong: Leder led the formalisation project; the problem is classical.
//
// Held, not rejected on the mathematics, which nobody here is placed to
// judge. If the work returns to a public home and a probabilist reads it, it
// is welcome back.
//
// 7. McKean entropy production (VibeGene) - APPROVE.
//
// arXiv 2609.01753, Luis Silvestre. Section 1.3, "Disclaimer on the use of AI
// tools": a first version of the proof was obtained by ChatGPT 5.6 Sol run in
// Codex Ultra with access to the author's earlier paper and notes, rewritten
// with Claude Code, then reinterpreted and restructured by the author, who
// takes full responsibility. The submission's aiRole tracks that exactly.
//
// ---------------------------------------------------------------------------
// Significance is curator-only and every published entry carries it, so all
// six approvals needed one, placed against named neighbours in the catalog.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

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
  {
    slug: "common-neighbour-conjectures-for-saxl-graphs",
    action: "approve",
    reason: "edited",
    edits: {
      // Was one string containing both names, so the card rendered them as a
      // single collaborator.
      humanCollaborators: ["Aluna Rizzoli", "Adam R. Thomas"],
      significance: 18,
      significanceNote:
        "A named conjecture of Burness and Giudici in permutation group theory, extended by Freedman, Huang, Lee and Rekvenyi, and carrying a Kourovka Notebook number (21.29) - which is the field's own marker that a question is worth recording. Well known inside its area and unknown outside it. Above the Tu-Deng conjecture at 15, a named conjecture with a comparable specialist following but no problem-list number; below Courtade-Kumar at 22, one of the best-known open problems in its own field.",
      verificationNote:
        "Unreviewed: a preprint two days old with no independent check. The counterexamples are explicit groups, so they are checkable directly by anyone with Magma or GAP, and the paper's Lean 4 formalisation of Theorem 1.2 reports no $\\texttt{sorry}$; neither has been rebuilt here.",
    },
    message:
      "Published. I read the paper rather than the abstract page, which matters here: the arXiv abstract shows no AI disclosure at all, and the declaration is a dedicated section further down. It describes exactly what your AI-role field says - the project set out with Codex to PROVE the conjecture and formalise it in Lean, a falsification run over IRREDSOL produced counterexamples instead, and the work turned into generalising them. That history is the most interesting thing about the entry and it is now on the record.\n\nCurator-side edits: the collaborators field held both names in one string, so it rendered as a single person; split. Added the significance score and note, and a verification note saying the counterexamples are directly checkable but nobody independent has checked them.",
  },
  {
    slug: "entropy-of-bernoulli-measures-conditioned-on-affine-subspaces-and-a-problem-of-a",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 15,
      significanceNote:
        "A specific question of James Massey, one of the founding figures of coding theory, open since 1978 and settled at p = 1/2 by Ancheta. Real and old, but narrow: it concerns the optimal rate of linear encoders for one source. Tied with the Tu-Deng conjecture at 15, likewise a named question with a documented trail inside one community. Below Courtade-Kumar at 22, which a larger part of information theory follows.",
      verificationNote:
        "Unreviewed. A short preprint with a self-contained argument, by a researcher who works on exactly this. The author reports that a later literature search found several ingredients had appeared before or followed from earlier work, and says so in the paper; that is a caution about novelty of the components, not about the result. No independent check.",
    },
    message:
      "Published as sent, plus the curator-only fields: significance 15 with its note, and a verification note. The disclosure being in the abstract itself - \"the proof was discovered by GPT-5.6 Sol in an interactive process guided by the author\" - is the cleanest case this queue has seen; no digging required.\n\nOne thing worth recording, and I did: the author's own remark that a later literature search found some ingredients had appeared before. That is a caution about the components rather than the result, and saying so is better than leaving a reader to discover it.",
  },
  {
    slug: "the-proper-hat-guessing-number-of-k-5-e",
    action: "approve",
    reason: "as-submitted",
    edits: {
      significance: 7,
      significanceNote:
        "One value of one graph parameter, from a question posed this year in Adriaensen et al., where the bounds already pinned it to 7 or 8. Narrow by construction and recent, with no accumulated literature. Tied with the automatic-complexity result at 7, which likewise settles a question posed in the paper that introduced it. Well below the Tu-Deng conjecture at 15, which has a decade of partial results behind it.",
    },
    message:
      "Published, at Unreviewed and Candidate exactly as you set them, which is the right call and not a common one for a self-published claim.\n\nWhat made this straightforward to review: AI_USE_AND_PROVENANCE.md says plainly that the F_2^3 construction was developed model-assisted rather than copyedited, STATUS.json records review_status INDEPENDENT_REVIEW_PENDING and marks four scope items false, and the source problem checks out against Adriaensen et al. arXiv:2603.04909, which does leave HG_P(K5-e) in {7,8}. Nothing was overstated, which meant nothing had to be walked back.\n\nOne thing I could not do yet. Your verifier is dependency-free Python that checks all 8,400 proper colourings, and running it here is exactly what Site-confirmed means on this site's ladder. But running a stranger's code on a curator's machine is precisely what we built a sandboxed workflow to avoid for Lean, and there is no Python equivalent yet. The entry says so rather than pretending the option was not there. When that workflow exists, this is the first thing I will point it at.\n\nAdded the significance score and note, which are curator-only. Nothing else changed.",
  },
  {
    slug: "a-counterexample-to-the-stable-forking-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 26,
      significanceNote:
        "The stable forking conjecture is a founding problem of neostability theory, posed by Hart, Kim and Pillay in 1996 and worked on for thirty years; simple theories and forking are the subject's core machinery, so this is close to field-famous within model theory. Just below the Lonely Runner Conjecture and the Polynomial-Time Low-Degree Conjecture at 30, both of which are known well outside their home fields; clearly above Courtade-Kumar at 22.",
      verificationNote:
        "Unreviewed. A preprint three days old. The construction is explicit and the authors give the abstract-independence argument in full, so it is checkable by a model theorist, but none has done so on the record.",
      aiRole:
        "GPT-5.6 Sol generated the counterexample through an interactive, human-guided search. Freitag and Mutchnik prompted it with structural restrictions any counterexample would have to satisfy, including using the Kim-Pillay abstract-independence criterion to prove simplicity and characterise forking, and directed the search toward infinite rank - earlier work having placed severe obstructions on a finite-rank example. They independently wrote the proofs and the manuscript.\n\nThe paper says it plainly, in the abstract and again in the text: \"This is an AI-generated result proven with the help of GPT-5.6 Sol. Specifically, we prompted ChatGPT to construct a counterexample to the stable forking conjecture with a detailed series of prompts which took into account the likely restrictions such a counterexample would have to satisfy.\" They add that \"in retrospect, it seems unlikely that this counterexample would have been found in the near term without the use of generative AI\".",
      resultNote:
        "The paper constructs a simple theory in which forking cannot always be witnessed by a stable formula. Precisely, what fails is: in a simple theory, if $a \\not\\downarrow_C b$ then there is $\\varphi(x,\\bar b) \\in \\mathrm{tp}(a/Cb)$ forking over $C$ whose parameter-free form $\\varphi(x,y)$ is stable.\n\nThe counterexample is an infinite-dimensional vector space over the division ring of fractions of the quantum graph algebra of the random graph. Forking is characterised by an abstract independence relation, and the random graph is encoded into that relation so that it has the order property; stable formulas therefore cannot determine all forking in simple theories.",
    },
    message:
      "Published, with the entry improved using the other submission of the same paper. Andrei Sipos filed it a few hours after you, and each of you had the better half of something: you named Freitag and Mutchnik and gave the construction, he quoted the paper's own AI paragraph verbatim and stated the disproved proposition formally. The published entry takes both, and his submission is closed pointing here.\n\nAlso added the significance score and note. At 26 this is the highest-scored entry in today's queue: a founding problem of neostability theory, thirty years old, close to field-famous inside model theory though not outside it.",
  },
  {
    slug: "colombo-s-difference-power-determinant-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 12,
      significanceNote:
        "A 1928 determinant conjecture of Colombo: genuinely old, and answered completely rather than improved, but obscure - it has no following outside the corner of matrix theory and total positivity that it sits in, and the literature on it is thin. Tied with the (2,1)-gapped consecutive-ones case at 12, likewise a clean settlement of a specific stated question with a specialist audience. Below the Tu-Deng conjecture at 15, which has a decade of partial results behind it.",
    },
    message:
      "Published as submitted. This is the best-documented entry in today's queue and the priority note is the reason.\n\nYou applied the concurrent-independent-proofs rule from the methodology without being asked to, and you were right to: Ma's arXiv upload does postdate Li-Tie-Wang-Liu's, the comments field does confirm it revises an 18 August Zenodo deposit that already contained the strict Pfaffian sign theorem, and the two methods are genuinely different (B-splines and a Pfaffian integral against apolarity and real Waring rank). Inferring priority from upload dates would have been wrong and the entry now says so. Your note is kept as the tail of the result note so a reader meets it rather than having to find it.\n\nI checked the AI disclosure in the paper rather than the form: it is a \"Use of AI-assisted tools\" section naming the WuJie agent along with DeepSeek, Qwen, Kimi and GPT, and saying they played a substantial role in identifying the proof strategy and producing an initial draft. The arXiv abstract page shows none of that.\n\nKept at Lean-checked and Candidate as you set them. Both are defensible and conservative - the Lean covers the new odd-exponent branch and not the classical even one, which your verification note already says.\n\nAdded the significance score and note, which submitters cannot set.",
  },
  {
    slug: "theta-p-c-0-for-bernoulli-bond-percolation-on-z-d-in-all-dimensions-d-2",
    action: "reject",
    reason: "other",
    message:
      "Held rather than published, under the extraordinary-claims rule in the methodology. Not a judgement on the mathematics, which nobody here is placed to make.\n\nThe reason that decided it is the source. The entry cites commit 795efb8 of anthropics/formal-math, and the percolation directory that commit added is no longer in the repository: at that commit the top level has a percolation folder, at HEAD it has .github, LICENSE, README and zeta23, the README lists only zeta23, and /contents/percolation returns 404. The work has been withdrawn from the repository it was published in. Whatever the reason for that, this site should not be the place it stays up.\n\nTwo other things, either of which would have been enough. The verification note says \"no sorry outside the two deliberate placeholders in Challenge.lean\" - which is to say there are sorries, and the entry would have gone up at Lean-checked. And \"posed by Justin Leder\" is not right: Leder led the formalisation; the problem is classical, and theta(p_c) = 0 for 3 <= d <= 10 is one of the most famous open problems in probability theory.\n\nIf the work reappears at a public home and a probabilist has read it, resubmit and it will be reviewed at whatever tier it has earned. Thank you for the other six today - they were a good queue.",
  },
  {
    slug: "mckean-entropy-production-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      shortName: "McKean entropy production",
      significance: 20,
      significanceNote:
        "A question McKean asked in 1966 about the Boltzmann equation, answered negatively for the two physically standard kernels, hard spheres and Maxwell molecules. Sixty years standing and well known in kinetic theory, but not followed outside it. Tied with the Dubickas Z-number question at 20 - a specific named question of comparable age and comparable specialist reach. Below the Lonely Runner Conjecture at 30, which is famous across two fields.",
    },
    message:
      "Published. The disclosure is section 1.3 of the paper, \"Disclaimer on the use of AI tools\", and your AI-role field tracks it exactly: a first version obtained by GPT-5.6 Sol in Codex Ultra with access to the author's earlier paper and notes, rewritten with Claude Code, then reinterpreted and restructured by Silvestre, who takes responsibility for the final proof. The arXiv abstract page shows none of that, so the entry would have failed a lazier review.\n\nYour submitter note doing the work of distinguishing this from Gu-Sellke is the right instinct and is why nobody will file that as a duplicate later.\n\nEdits: shortened the short name, which was cut mid-word at \"McKean Entropy-Productio\"; added the significance score and note.",
  },
  {
    slug: "a-counterexample-to-the-stable-forking-conjecture-2",
    action: "reject",
    reason: "duplicate",
    message:
      "Closing this as a duplicate rather than for anything wrong with it - the same paper, arXiv 2609.00436, was filed a few hours earlier and is now published.\n\nYour version was better in two places and the published entry uses both. You quoted the paper's own AI paragraph verbatim, which is stronger evidence than a paraphrase, and it is now the second half of the entry's AI-role field. And you stated the disproved proposition formally rather than describing it, which is now how the result note opens.\n\nSo it is on the record and it improved the entry. Thank you, and please keep sending them.",
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
      select: { id: true, status: true, name: true },
    });
    if (!cur) throw new Error(`not found: ${d.slug}`);
    if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);

    const verb = d.action === "reject" ? (d.reason === "duplicate" ? "DUPLICATE" : "HOLD") : "APPROVE";
    console.log(`\n${verb.padEnd(9)} ${cur.name.slice(0, 60)}`);
    console.log(`  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`);
    if (d.message.length > MESSAGE_MAX) bad++;

    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(`  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 60)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(`  link             : ${l.label.length}/${LINK_LABEL_MAX}`);
      if (l.label.length > LINK_LABEL_MAX) bad++;
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
      select: { id: true, submittedById: true, _count: { select: { links: true } } },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);
    const n = cur._count.links;

    await prisma.$transaction([
      prisma.problem.update({
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
      }),
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
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
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log("\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.");
}

main().finally(() => prisma.$disconnect());
