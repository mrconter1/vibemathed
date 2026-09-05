// Review of the six submissions pending on 5 September 2026 after the two of
// 4 September (K7-e, Latin squares) were applied from review-2026-09-04-d.ts.
//
// Sources were read, not skimmed. For the two GPT-6 Astra disproofs the repos
// were cloned and the Lean sources inspected (line counts, `sorry`, `axiom`,
// `native_decide`); the compared statements were checked against the Formal
// Conjectures originals and the mathlib definition they lean on
// (`TwoSidedIdeal.matrix` is "all entries in the ideal"). For the K8-e release
// the provenance and status files at the frozen commit were read. For the
// cycle-residue preprint the 82-page PDF was text-extracted and its
// introduction and disclosure read; the earlier Zenodo record it supersedes
// returns 410 Gone. For the tree paper the arXiv full text was read.
//
// Frontier check for the batch: none of these is a tracked quantity with a
// direction. Köthe and Smale are yes/no conjectures now answered no; the
// hat-guessing values are a sequence of exact values with no direction; the
// cycle-residue result is a classification. No frontier rows.
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

const ASTRA_LINKS = (repo: string, fc: string): LinkIn[] => [
  {
    label:
      "Challenge.lean: the compared statement, copied from Formal Conjectures",
    url: `https://github.com/tadamcz/${repo}/blob/main/Challenge.lean`,
    kind: "lean-statement",
  },
  {
    label: "Solution.lean and the Lean development",
    url: `https://github.com/tadamcz/${repo}/blob/main/Solution.lean`,
    kind: "lean-proof",
  },
  {
    label: "Formal Conjectures source statement (Google DeepMind)",
    url: `https://github.com/google-deepmind/formal-conjectures/blob/main/FormalConjectures/Wikipedia/${fc}.lean`,
    kind: "lean-statement",
  },
  {
    label: "Epoch AI LeanOpenProblems, the evaluation the run was part of",
    url: "https://github.com/epoch-research/LeanOpenProblems",
    kind: "other",
  },
];

const DECISIONS: Decision[] = [
  // ---------------------------------------------------------------- K8-e
  {
    slug: "the-proper-hat-guessing-number-of-k-8-e",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 7,
      significanceNote:
        "One value of one graph parameter, fourth in a series after K5 - e, K6 - e and K7 - e from the same author over four days. The ceiling comes from Adriaensen et al.'s bound n + chi(G) - 1 = 14 and the work shows it is attained. Level with the three siblings deliberately: the same method one vertex larger does not gain weight per rung, and the question was posed this year with no accumulated literature.",
      verificationNote:
        "Unreviewed on this site's ladder. The frozen commit bacb79e3 carries STATUS.json with headline status PROVED_COMPUTER_ASSISTED and project review ACCEPTED, an AI_USE_AND_PROVENANCE.md naming the model and the division of labour, and a C++ sweep of all 138,378,240 proper fourteen-colourings with zero coverage failures across 48,510 residual orbits. The Gate 2/3 Hall-obstruction archive was reviewed as ACCEPT_WITH_EXPLICIT_REPAIRS and the repairs applied. The 2^380 shared-completion companion is a separate claim whose independent review is still pending and is not part of this entry. As with the siblings: a real adversarial review of an artefact, not a named expert or a proof assistant, and this site has not rebuilt it.",
    },
    message:
      "Published, at Candidate and Unreviewed as you set them, at significance 7 level with K5 - e, K6 - e and K7 - e.\n\nChecked at the frozen commit bacb79e3: STATUS.json claims HG_P(K8-e) = 14 with headline status PROVED_COMPUTER_ASSISTED and project review ACCEPTED; AI_USE_AND_PROVENANCE.md names GPT-5.6 Pro and says what it did and what you did; THEOREM.md gives the PGL(2,13)-equivariant construction with 990 twin rules and the 53,460 clique rules; the ceiling checks out, 8 + 7 - 1 = 14. The 138,378,240-colouring sweep with zero failures is the load-bearing check and the verification note now says so.\n\nTwo things I want on the record. The Gate 2/3 archive went through review as ACCEPT_WITH_EXPLICIT_REPAIRS; that is fine and it is stated, but a reader should know a repair happened. And the 2^380 shared-completion companion is not part of this entry: you labelled its review as pending and I have kept it out of the claim rather than letting it inherit the headline's status, exactly as your reviewer note asked.\n\nThe provenance file is what the Latin-squares hold yesterday was missing. Thank you for making it a habit; it is why this one took an hour and not a day.\n\nSignificance stays at 7 for the reason given on K7 - e: one more vertex is not a heavier result. Four values of one family in four days is still a shape this site does not present well, and grouping them is on the roadmap.",
  },

  // ------------------------------------------------- Smale mean value K=1
  {
    slug: "smale-s-mean-value-conjecture-k-1",
    action: "approve",
    reason: "downgraded",
    edits: {
      resolution: "candidate",
      model: "GPT-6 Astra (pre-release)",
      significance: 45,
      significanceNote:
        "Smale posed the mean value conjecture in 1981 alongside his proof with constant 4, and listed the problem among his eighteen problems for the twenty-first century. It has a Wikipedia article, a forty-five-year literature lowering the constant toward 1 (Beardon-Minda-Ng, Fujikawa-Sugawa and others), and was verified for degree at most 10 by Sendov and Marinov. A named conjecture of that standing, from a Fields medallist's problem list, sits at the Connes-rigidity level here; below the Jacobian conjecture, which spans far more of mathematics.",
      verificationNote:
        "Lean-verified on this site's ladder: kernel-checked, and the statement was written independently of the prover. Checked here on 5 September 2026 from a clone of the repository at f99ab98: 2,266 lines of Lean across the development, zero `sorry` outside the Challenge.lean stub, zero `axiom` declarations, no `native_decide`, `unsafe` or `implemented_by`; the mathlib revision is pinned; CI runs Comparator against the trusted statement allowing only propext, Quot.sound and Classical.choice. The compared statement is byte-identical to Formal Conjectures' `mean_value_problem` at commit 9cbe1d3c, which is Smale's K = 1 form exactly: the quantified K is unused there, and the division convention in Lean (x/0 = 0) only makes the conjecture easier to satisfy, so it cannot help a disproof. Candidate rather than resolved because, two days after the run, no mathematician outside it has read the proof; the witness is a nonconstructive limiting perturbation of large unspecified degree and violates the bound by a small margin, which is consistent with everything known. The proof account was machine-generated and is unaudited.",
    },
    links: ASTRA_LINKS("mean-value-problem", "MeanValueProblem"),
    message:
      "Published at Lean-verified, and moved from Resolved to Candidate. That is the one change, and it is the same treatment the ten OpenAI Astra results of August received here.\n\nWhat I checked rather than took on trust: cloned the repository at f99ab98 and read the Lean. 2,266 lines, no sorry outside the stub, no axioms, no native_decide, mathlib pinned, Comparator in CI with the three standard axioms. Then the statement itself, because that is where a disproof of a famous conjecture can go wrong: Challenge.lean is byte-identical to Formal Conjectures' mean_value_problem at 9cbe1d3c, and that statement is Smale's K = 1 form exactly. Its quantified K is unused, which is a quirk of the source and harmless; and Lean's x/0 = 0 convention makes the conjecture easier, not the disproof, since a critical point equal to z would satisfy the inequality for free. The witness has p(0) = 0 and p'(0) = 1, so nothing of that kind is in play.\n\nSo the mathematics is settled in the only sense a proof assistant can settle it, and Lean-verified is the right tier: the statement came from DeepMind's human-curated repository, not from the prover. Candidate is about something else. Sendov and Marinov verified this conjecture through degree ten; the counterexample is a nonconstructive limit of very large degree, obtained in fifteen hours by a model nobody has yet caught up with, and as of today no analyst has read the proof account, which the repository itself says was machine-generated and unchecked by a human. The site's word for that state is Candidate. It flips to Resolved the moment a named mathematician in the area says the argument is right.\n\nAdded four links so a reader can audit the same surface I did: the compared statement, the development, the Formal Conjectures source, and Epoch's evaluation repository. Model field normalised to the pre-release name. Significance 45: a Smale problem with forty-five years of literature, level with Connes rigidity.",
  },

  // ------------------------------------------------------- Köthe conjecture
  {
    slug: "kothe-conjecture",
    action: "approve",
    reason: "downgraded",
    edits: {
      resolution: "candidate",
      model: "GPT-6 Astra (pre-release)",
      significance: 60,
      significanceNote:
        "Köthe's conjecture (1930) is the central open problem of noncommutative ring theory: whether the sum of two nil left ideals is nil, equivalently whether every ring has a largest nil ideal. It has a Wikipedia article, a ninety-six-year literature, and a web of equivalent forms due to Krempa (1972) and others; Amitsur settled it over uncountable fields and Smoktunowicz's refutation of the related Amitsur conjecture (2000) is a landmark of the subject. Level with the non-sofic groups result here, which likewise answered a decades-old structural question in the negative.",
      verificationNote:
        "Lean-verified on this site's ladder: kernel-checked, and the statement was written independently of the prover. Checked here on 5 September 2026 from a clone at b052755: 3,331 lines of Lean, zero `sorry` outside the Challenge.lean stub, zero `axiom` declarations, no `native_decide`, `unsafe` or `implemented_by` (two uses of `decide` on small numerals), mathlib pinned, Comparator in CI with the three standard axioms. The compared statement is byte-identical to Formal Conjectures' `KotherConjecture.variants.general_matrix` at 9cbe1d3c, and its one nontrivial ingredient, mathlib's `TwoSidedIdeal.matrix`, is the ideal of matrices whose every entry lies in I, so the statement is Krempa's matrix form as intended. What the kernel has certified is therefore: a ring with a nil ideal I and a non-nilpotent matrix in M_2(I). That Köthe's original statement implies the matrix form is an elementary argument (M_n(I) is a sum of n nil column left ideals) stated in the repository and not formalized; Formal Conjectures opened a PR on 4 September relating the formulations. Candidate because no ring theorist has read it yet, and the machine-generated proof account is unaudited.",
    },
    links: ASTRA_LINKS("koethe", "Koethe"),
    message:
      "Published at Lean-verified, and moved from Resolved to Candidate, the same as the ten Astra results of August and the Smale entry you submitted alongside it.\n\nThis is the largest claim the site has carried, so I went further than usual. Cloned the repository at b052755 and read the Lean: 3,331 lines, no sorry outside the stub, no axioms, no native_decide, mathlib pinned, Comparator in CI. Then the statement, twice. Challenge.lean is byte-identical to Formal Conjectures' general_matrix variant at 9cbe1d3c. Its only nontrivial ingredient is mathlib's TwoSidedIdeal.matrix, which I checked in mathlib's source: it is the two-sided ideal of matrices whose every entry lies in I. So the kernel has certified exactly Krempa's matrix form: a ring, a nil two-sided ideal I, and a 2 x 2 matrix over I that is not nilpotent.\n\nThe step from there to Köthe as Köthe stated it is the easy direction and it is not in Lean. If the sum of two nil left ideals were always nil, M_n(I) would be nil as a sum of n nil column ideals; so a non-nilpotent matrix over a nil I refutes the original. That is three lines and the repository says them; the verification note records that it is prose, not kernel. Formal Conjectures opened a PR on 4 September to relate the formulations, which suggests someone there is closing that gap formally.\n\nCandidate is not doubt about the Lean. It is that a ninety-six-year-old conjecture in ring theory was refuted in twenty-six hours by a pre-release model, the proof account was generated by another model and no human has checked it, and as of today no ring theorist has said a word. Smoktunowicz's refutation of Amitsur's conjecture took years to absorb. The site's word for a kernel-checked claim the field has not absorbed is Candidate; it becomes Resolved when a named ring theorist reads it and agrees. If that happens this month I would not be surprised; please tell me.\n\nAdded the four audit links, normalised the model name, significance 60, level with non-sofic groups.",
  },

  // ---------------------------------------------- cycle residues, version 1
  {
    slug: "cycle-residue-stability-at-minimum-degree-five",
    action: "reject",
    reason: "duplicate",
    message:
      "Closed as superseded, at your request: your second submission of the same theorem replaces this one, and the Zenodo record this entry points to (10.5281/zenodo.22309592) now returns 410 Gone, so there is no artefact left to list. Nothing else is implied by this decision; the result itself is handled on the other entry.",
  },

  // ---------------------------------------------- cycle residues, version 2
  {
    slug: "cycle-residue-stability-at-minimum-degree-five-2",
    action: "approve",
    reason: "downgraded",
    edits: {
      aiContribution: "ai-co-developed",
      model: "GPT-5.6 Sol, GPT-6 Astra",
      posedBy:
        "Luo, Ma and Zhao, whose stability theorem covers every k >= 6 and leaves k = 5",
      yearPosed: 2026,
      significance: 20,
      significanceNote:
        "The stability companion to the k = 5 case of Dean's conjecture: Luo, Ma and Zhao proved the classification of graphs missing a residue for every modulus k >= 6 earlier in 2026, so k = 5 is the one odd modulus left open, and this settles it. A completed classification in a live line of work in extremal graph theory, but a corollary-sized question next to Dean's conjecture itself (32 here), and it rests on the author's own Dean-5 theorem, which is still a candidate on this site.",
      verificationNote:
        "Unreviewed. The 82-page preprint (Zenodo 10.5281/zenodo.22311785, version 1.0.0 of 4 September 2026) was text-extracted and its introduction, main theorem and disclosure read here; the computational supplement (10.5281/zenodo.22311412) reports 23 passing operations and was not replayed on this site, unlike the Dean-5 supplement, which was. Two dependencies a reader should hold in mind: the proof imports the author's own modulus-five Dean theorem, version 1.0.1, which is itself Candidate here pending independent review; and the earlier Zenodo version of this preprint was withdrawn by the author for errors before this one, which is stated in the submission and matches the deleted record. Tier changed from AI-discovered to AI co-developed: the paper's own disclosure says the results were obtained \"with substantial assistance from large language models\" and that the author reviewed the arguments and takes responsibility, which is the co-developed pattern on this site, not discovery.",
    },
    message:
      "Published, at Candidate and Unreviewed as you set them, with two changes and a note on scope.\n\nScope first, because it was the open question for me: a classification theorem can be an author's own strengthening, which this site does not list. Your introduction settles it. Luo, Ma and Zhao proved the stability classification for every k >= 6 and the theorem here is the missing odd modulus, so the question was posed by their result, and the entry now records that as posedBy with year 2026.\n\nThe tier moves from AI-discovered to AI co-developed. Your disclosure section reads: the principal results were obtained \"with substantial assistance from large language models, principally GPT-5.6 Sol, and GPT-6 Astra\", with you reviewing the arguments and taking responsibility. On this site that wording is co-developed; discovered is reserved for the model producing the central mathematics on its own, which is a stronger claim than your paper makes about itself. If you think the models did more than assist, the remedy is in the paper, not here: say specifically what they found.\n\nThe verification note now records two dependencies a reader should see: the proof imports your Dean-5 theorem, which is still a candidate here, and the previous Zenodo version was withdrawn for errors, which you were straightforward about and which speaks well of the process. I did not replay the 23-operation supplement this time; the Dean-5 one was replayed in full and that is why it carries Site-confirmed and this does not. If you want the same here, say so and I will schedule it.\n\nSignificance 20: a completed classification in a live line, a rung below Dean's conjecture itself.",
  },

  // ---------------------------------------------- 32-leaf tree, l-infinity
  {
    slug: "a-32-leaf-tree-requiring-six-coordinates-for-an-isometric-ell-infty-embedding",
    action: "approve",
    reason: "edited",
    edits: {
      model: "GPT-5.6 Sol",
      modelMaker: "OpenAI",
      aiContribution: "ai-assisted",
      resolutionMethod: "construction",
      field:
        "Metric geometry; tree metrics; isometric embeddings into l-infinity",
      posedBy:
        "Fitzpatrick and Nowakowski (Problem 43, 2000); conjectured by Brigham, Chartrand, Dutton and Zhang (2005)",
      statement:
        "Every tree metric with $t$ leaves embeds isometrically into $\\ell_\\infty^{t-1}$, and the least dimension needed is at least $\\lceil \\log_2 t \\rceil$. Fitzpatrick and Nowakowski asked in 2000 whether the logarithmic bound is always attained, and Brigham, Chartrand, Dutton and Zhang conjectured in 2005 that every tree with $t$ leaves embeds isometrically into $\\ell_\\infty^{\\lceil \\log_2 t \\rceil}$, verifying it through $t = 21$. Aksoy, Kilic and Kocak posed a sharp leaf-threshold version for weighted metric trees in 2020.",
      resultNote:
        "Disproved. An explicit 32-leaf tree has least isometric $\\ell_\\infty$-dimension six, not the conjectured five, and keeps dimension six under every assignment of positive edge lengths, so the weighted sharp-threshold conjecture falls too. Every tree with at most 31 leaves does attain $\\lceil \\log_2 t \\rceil$, so 32 is the first failure; Brigham et al. had checked through 21. The proof is finite and exact: six explicit orientation masks cover all leaf pairs, and a recurrence on rooted branches rules out any five-orientation cover.",
      aiRole:
        "The paper's disclosure: \"OpenAI's GPT-5.6 Sol assisted in implementing the computational search strategy and with drafting this manuscript. The author takes full responsibility for the content of the article.\" The search that found the tree and the proof that no five-orientation cover exists are the author's; the model wrote code and prose. That is the assisted tier on this site.",
      verificationNote:
        "Unreviewed. arXiv 2608.16288 (17 August 2026, six pages) read in full here; the abstract's claims match the theorems. The counterexample is an exact finite argument with the covering masks printed in the paper and ancillary verification code deposited on Zenodo, which this site has not run. No peer review, no independent expert statement.",
      significance: 12,
      significanceNote:
        "A question asked in 2000 and a conjecture from 2005 with a small but real literature (Brigham et al., Aksoy-Kilic-Kocak), refuted by the first counterexample. Clean and final, but a single embedding-dimension question in metric graph theory rather than a structural conjecture; a rung above a numbered Erdős problem.",
    },
    links: [
      {
        label: "arXiv 2608.16288",
        url: "https://arxiv.org/abs/2608.16288",
        kind: "paper",
      },
    ],
    message:
      "Published, at Resolved and Unreviewed, with the tier set to AI-assisted and most of the entry written by me, so please check it.\n\nYou submitted a title, a model, a source and a date and left the statement, the AI role, the notes and the field empty. I read the paper and filled them: the 2000 question of Fitzpatrick and Nowakowski, the 2005 conjecture of Brigham, Chartrand, Dutton and Zhang, the weighted version of Aksoy, Kilic and Kocak, the theorem, and the exact finite proof. If anything there misstates the paper, edit it or tell me.\n\nThe tier is AI-assisted rather than a higher one because that is what the paper says about itself: GPT-5.6 Sol \"assisted in implementing the computational search strategy and with drafting this manuscript\", and the author takes full responsibility. The mathematics is the author's; the model wrote code and text. This site takes an author's disclosure at face value in both directions.\n\nOne link added, to the arXiv record. The Zenodo ancillary code is mentioned in the paper without a DOI I could pin; if you know it, add it.",
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
    "SELECT current_database() AS db",
  );
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
      `${d.action === "reject" ? "REJECT " : "APPROVE"}  ${cur.name.slice(0, 58)}  [${d.reason}]`,
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
