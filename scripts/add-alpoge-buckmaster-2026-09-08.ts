// Adds the three Alpöge-Buckmaster forced-blowup entries, released 8 September
// 2026: 3D incompressible Euler, inviscid Boussinesq, and IPM.
//
// What was read before writing:
//   - All three papers, downloaded and read: euler.pdf (112pp, Theorem 1.1),
//     boussinesq.pdf (76pp, and its section 2 "AI statement" in full), and
//     ipm.pdf (57pp, Theorem 2.1 and the prior-art discussion).
//   - Buckmaster's public statement (statement.pdf), all four pages.
//   - The Lean repository tristanbuckmaster/fluid_lean: the file tree, the
//     three READMEs, and euler-blowup/Challenge.lean in full.
//   - Fefferman's official Clay problem description, to settle whether any of
//     this is the Millennium problem. It is not, and the entries say so.
//
// The Millennium question, since every reader arriving from social media will
// ask it. Fefferman's alternatives (C) and (D) DO permit a smooth forcing term
// obeying rapid space-time decay, so the forced route is a legitimate path to
// the prize - but only for Navier-Stokes with viscosity nu > 0, and his
// description closes with: "These problems are also open and very important
// for the Euler equations (nu = 0), although the Euler equation is not on the
// Clay Institute's list of prize problems." Euler, Boussinesq and IPM are all
// outside the prize. Each resultNote states this explicitly.
//
// Tiers. Euler and Boussinesq are lean-verified rather than lean-checked: the
// statement lives in its own Challenge.lean written against plain Mathlib, and
// leanprover/comparator is configured to type-check that statement
// independently, confirm the solution inhabits exactly it, restrict axioms to
// propext/Classical.choice/Quot.sound, and replay the proof. That separation
// of statement from proof is what tier 1 asks for. IPM has no Lean project in
// the repository at all, so it takes unreviewed.
//
// AI contribution is ai-co-developed for all three, not ai-discovered. The
// models produced the proofs - the authors say so plainly - but the program is
// Córdoba and Martínez-Zoroa's, the targets and the fed-in prior work were the
// authors', and Buckmaster is emphatic in public about where the credit sits.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { Prisma, PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const STATEMENT_URL = "https://cims.nyu.edu/~tristanb/statement.pdf";
const LEAN_REPO = "https://github.com/tristanbuckmaster/fluid_lean";

/// The authors' own AI account, quoted from section 2 of the Boussinesq paper.
/// The Euler paper carries no AI statement and no author line - it was
/// released before it was ready, which Buckmaster apologises for in public -
/// so the Euler entry cites this and the public statement instead of
/// paraphrasing something the Euler paper does not say.
const AI_STATEMENT =
  'The Boussinesq paper devotes its section 2 to an "AI statement": "We happily used both Claude and Codex to iterate on our proof. We had, using Claude, our first blowup solution, but not this one, on 8/15/26, and we Lean verified it on 8/22/26. This involved inputting ideas from previous joint work of ours on blowup for the IPM equation following Córdoba-Martínez-Zoroa and a number of other works of ours and others, as well as iteration with the model on various ansätze, eventually leading to blowup in Boussinesq. The first writeup that we produced iterating with Claude was, in our opinion, the worst writeup we had ever seen in the history of mathematics (topped soon after by the writeups for 3d Euler and then for hypodissipative Navier-Stokes)."';

const MODELS = "Claude, Codex with GPT-5.6 Sol";
const COLLABORATORS = ["Levent Alpöge", "Tristan Buckmaster"];

/// Repeated verbatim on each entry. A reader who arrives from a thread saying
/// "AI solved a Millennium problem" should be corrected on the entry page
/// itself, not in a note somewhere else.
const NOT_CLAY =
  "Not the Clay Millennium problem: that problem is Navier-Stokes with viscosity, and Fefferman's official description states that the Euler equation \"is not on the Clay Institute's list of prize problems\".";

const commonLinks = (leanDir: string) => [
  {
    label: "Lean formalisation, comparator-checked against Challenge.lean",
    url: `${LEAN_REPO}/tree/main/${leanDir}`,
    kind: "lean-proof",
  },
  {
    label: "Challenge.lean: the trusted statement, in plain Mathlib",
    url: `${LEAN_REPO}/blob/main/${leanDir}/Challenge.lean`,
    kind: "lean-statement",
  },
  {
    label: "Buckmaster's public statement on the work and its release",
    url: STATEMENT_URL,
    kind: "announcement",
  },
];

type Entry = {
  slug: string;
  fields: Record<string, unknown>;
  links: { label: string; url: string; kind: string }[];
  /// Names to search for, so a dry run reports any near-duplicate already in
  /// the catalog before anything is written.
  dupTerms: string[];
};

const ENTRIES: Entry[] = [
  // ------------------------------------------------------------------ Euler
  {
    slug: "euler-blowup-smooth-forcing",
    dupTerms: ["Euler", "blowup", "blow-up"],
    fields: {
      name: "Finite-time blowup for the 3D incompressible Euler equations with smooth forcing",
      shortName: "Euler blowup, smooth force",
      fieldGroup: "Differential equations",
      field: "Fluid dynamics; singularity formation for incompressible flow",
      statement:
        "Can a solution of the three-dimensional incompressible Euler equations on $\\mathbb R^3$, started from smooth data and driven by a force that is smooth in space and time up to and including the blowup time, lose regularity in finite time? Finite-time singularity formation from genuinely smooth data is the central open question for the equations. Elgindi obtained blowup for $C^{1,\\alpha}$ solutions in 2021, and Córdoba and Martínez-Zoroa built a multiscale program producing forced blowup for related equations with forces of limited regularity, but no construction reached three-dimensional Euler with a space-time smooth force. Note on the forced formulation, since it is easy to misread: alternatives (C) and (D) of Fefferman's Clay problem description do permit a smooth force obeying rapid space-time decay, so forcing is not a dodge and the forced route is a genuine path to the prize. It is a path for Navier-Stokes with viscosity, however, and not for Euler, which Fefferman's description excludes from the prize list.",
      posedBy:
        "Classical; the breakdown question is recorded in Fefferman's official Clay problem description, which notes it is open and important for Euler though not itself a prize problem",
      yearPosed: 2000,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-08",
      model: MODELS,
      modelMaker: "Anthropic / OpenAI",
      humanCollaborators: COLLABORATORS,
      aiContribution: "ai-co-developed",
      aiRole: `${AI_STATEMENT} Buckmaster's public statement adds that the models used were "Anthropic's Claude, OpenAI's Codex, especially with GPT-5.6 Sol and, more recently, Astra", the last "only used for writeups and auditing our arguments", and that "the first LLM generated proof Levent sent me was the most horrendous I have ever read". He is explicit that the program is not the models': "The credit for the basic idea of this program goes to Diego Córdoba and Luis Martínez-Zoroa... We took their work as a starting point, using Large Language Models to push their program to completion." Co-developed rather than discovered on that account. The Euler paper carries no AI statement of its own.`,
      verification: "lean-verified",
      verificationNote:
        'Formalised in Lean 4 in tristanbuckmaster/fluid_lean (euler-blowup). Checked here on 8 September 2026 by reading the repository: Challenge.lean states the theorem against plain Mathlib and is the only file a reader must trust, Solution.lean derives it from the development, and comparator.json configures leanprover/comparator to type-check the statement independently, confirm the solution inhabits exactly that statement, restrict axioms to propext, Classical.choice and Quot.sound, and replay the proof. Mathlib is pinned by commit; the build is roughly 1,100 modules and the README warns it needs on the order of 100 GB of memory. The Lean statement was read and matches the paper\'s Theorem 1.1, including the divergence of the Beale-Kato-Majda vorticity integral and uniqueness against non-axisymmetric competitors. Not yet peer reviewed: Terence Tao has publicly analysed the result and calls it "a remarkable achievement", but says he is still digesting the proof, so no expert has certified the argument line by line.',
      resultNote: `Yes. Theorem 1.1: for every $r_0>0$ and $z_0$ there are a time $T_*>0$, a divergence-free axisymmetric $u_0\\in C_c^\\infty$ supported in a fixed solid torus with nonzero swirl and zero meridional velocity, and an axisymmetric force $f\\in C^\\infty(\\mathbb R^3\\times[0,T_*])$ supported in that torus, with a solution smooth on $[0,T_*)$ for which circulation and meridional velocity stay bounded while $\\|\\nabla\\Gamma(t)\\|_\\infty$ and $\\|\\omega(t)\\|_\\infty$ tend to infinity and $\\int_0^{T_*}\\|\\omega(t)\\|_\\infty\\,dt=\\infty$, so the blowup is genuine by Beale-Kato-Majda. It is unique among divergence-free locally space-time Lipschitz solutions with the same data, and competitors need not be axisymmetric. ${NOT_CLAY}`,
      significance: 70,
      significanceNote:
        'The strongest result in this catalog. Finite-time singularity formation for three-dimensional incompressible Euler is one of the central problems of mathematical fluid dynamics, and this settles it in the forced smooth category, one category short of the Clay problem. Terence Tao\'s public assessment is that nothing in principle blocks extending the method to Navier-Stokes and that there is "a non-negligible chance that the forcing term could be eliminated entirely". Below the 80s because the force is essential to the result and its removal is exactly the hard part.',
      publication: "preprint",
      sourceUrl: "https://cims.nyu.edu/~tristanb/euler.pdf",
      sourceName:
        "Blowup for the Euler equations with smooth forcing (manuscript)",
      ageNote:
        'Released 8 September 2026, earlier than the authors intended. Their own chronology: a first blowup solution on 15 August 2026, Lean-verified on 22 August, then weeks spent turning a model-generated argument into prose. Buckmaster calls the Euler writeup "AI slop", apologises for its state, and attributes the early release to outside pressure.',
      status: "published",
      reviewReason: "edited",
    },
    links: [
      ...commonLinks("euler-blowup"),
      {
        label: "Terence Tao's assessment of the result and the mechanism",
        url: "https://mathstodon.xyz/@tao/117233527638291447",
        kind: "discussion",
      },
      {
        label: "Buckmaster's announcement, with all three manuscripts",
        url: "https://mastodon.social/@tristanbuckmaster/117233413705701198",
        kind: "announcement",
      },
      {
        label: "Fefferman's official Clay problem description",
        url: "https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf",
        kind: "problem-record",
      },
    ],
  },

  // ------------------------------------------------------------- Boussinesq
  {
    slug: "boussinesq-blowup-smooth-forcing",
    dupTerms: ["Boussinesq"],
    fields: {
      name: "Finite-time blowup for the inviscid Boussinesq system with smooth forcing",
      shortName: "Boussinesq blowup, smooth force",
      fieldGroup: "Differential equations",
      field: "Fluid dynamics; singularity formation for incompressible flow",
      statement:
        "Does the inviscid Boussinesq system on $\\mathbb R^2$ admit finite-time blowup from smooth data with forces that are smooth in both space and time? Córdoba, Laín-Sanclemente and Martínez-Zoroa obtained finite-time singularity for the two-dimensional Boussinesq equation with a force only of class $C^{1,\\sqrt{4/3}-1-\\epsilon}\\cap L^2$, leaving the smooth-force case open.",
      posedBy:
        "Diego Córdoba, Antonio Laín-Sanclemente and Luis Martínez-Zoroa, whose multiscale construction reached a force of limited Hölder regularity",
      yearPosed: 2025,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-08",
      model: MODELS,
      modelMaker: "Anthropic / OpenAI",
      humanCollaborators: COLLABORATORS,
      aiContribution: "ai-co-developed",
      aiRole: `${AI_STATEMENT} The statement continues that after iterating with Claude and Codex on alternative proof architectures, "leading to several different proofs, we arrived at the current simplified argument, which we then iterated on using Claude and Codex, first 5.6 Sol and then Astra once we had access, to arrive at the current writeup modulo our hand editing", and that intermediate writeups were generally fed to Codex "for simplification, ideation, and iteration". Co-developed rather than discovered: the first blowup solution came from Claude, but the multiscale mechanism is Córdoba and Martínez-Zoroa's and the authors fed in their own earlier IPM work.`,
      verification: "lean-verified",
      verificationNote:
        'Formalised in Lean 4 in tristanbuckmaster/fluid_lean, twice over: boussinesq-blowup carries the general theorem and affinecore the normalised construction with explicit odd initial data. Checked here on 8 September 2026 by reading both READMEs: in each, Challenge.lean is the only file a reader must trust, no other file contains a sorry, the proof rests on no axiom beyond propext, Classical.choice and Quot.sound, and leanprover/comparator is configured to type-check the statement independently and confirm the solution inhabits exactly it. Not peer reviewed. Tao\'s public commentary describes the Boussinesq case as the model case whose amplitude-frequency dynamics reduce to "a remarkably simple ODE", but records that he is still working through the arguments.',
      resultNote: `Yes. Blowup for the inviscid Boussinesq system on $\\mathbb R^2$ with forces in $C^\\infty(\\mathbb R^2\\times[0,T_*])$ in both equations, supported in one fixed spatial ball, from smooth compactly supported initial temperature and zero initial velocity. The temperature stays bounded while $\\|\\nabla\\theta(t)\\|_\\infty\\to\\infty$ and the vorticity norm has infinite limsup as $t\\uparrow T_*$. The solution is smooth on every closed interval before blowup and unique in a finite-energy Lipschitz class. This lifts the force from barely $C^1$ to fully smooth, and is the construction the Euler paper then builds on. ${NOT_CLAY}`,
      significance: 45,
      significanceNote:
        "A substantial strengthening in its own right, taking the force from a narrow Hölder class to smooth in space and time, and the stepping stone that made the Euler construction possible: the Euler paper develops this paper's two-field wave calculation on a varying background. Below Euler because Boussinesq in two dimensions is a model system rather than the equations of record.",
      publication: "preprint",
      sourceUrl: "https://cims.nyu.edu/~tristanb/boussinesq.pdf",
      sourceName:
        "Blowup for the Boussinesq equations with smooth forcing (manuscript)",
      status: "published",
      reviewReason: "edited",
    },
    links: [
      ...commonLinks("boussinesq-blowup"),
      {
        label: "affinecore: the second Lean formalisation, normalised data",
        url: `${LEAN_REPO}/tree/main/affinecore`,
        kind: "lean-proof",
      },
    ],
  },

  // -------------------------------------------------------------------- IPM
  {
    slug: "ipm-blowup-spacetime-smooth-forcing",
    dupTerms: ["porous media", "IPM"],
    fields: {
      name: "Finite-time blowup for the IPM equation with a uniformly space-time smooth force",
      shortName: "IPM blowup, space-time smooth force",
      fieldGroup: "Differential equations",
      field: "Fluid dynamics; incompressible porous media equation",
      statement:
        "Córdoba and Martínez-Zoroa proved finite-time singularity formation for the two-dimensional incompressible porous media equation from smooth initial data with a force smooth in space but merely bounded in time, that is in $L^\\infty_t C^\\infty_x$. Their Remark 1 anticipates joint smoothness in space and time but does not prove it. Can the force be taken uniformly smooth in space and time?",
      posedBy:
        "Diego Córdoba and Luis Martínez-Zoroa, Remark 1 of arXiv:2410.22920, where joint space-time smoothness is anticipated but not part of the theorem",
      yearPosed: 2024,
      solveType: "proved",
      resolution: "resolved",
      resolutionMethod: "construction",
      solveDate: "2026-09-08",
      model: MODELS,
      modelMaker: "Anthropic / OpenAI",
      humanCollaborators: [
        "Levent Alpöge",
        "Tristan Buckmaster",
        "Matei P. Coiculescu",
      ],
      aiContribution: "ai-co-developed",
      aiRole:
        'This is the earliest of the three results and the one the authors describe as feeding the others: the Boussinesq AI statement says the Boussinesq work "involved inputting ideas from previous joint work of ours on blowup for the IPM equation following Córdoba-Martínez-Zoroa". Buckmaster\'s public statement covers the whole project: "For most of the past year progress was slow. We worked through the literature and upgraded various preliminary results, up to obtaining finite time blow up for the Incompressible Porous Media equation (with smooth forcing)", using "Anthropic\'s Claude, OpenAI\'s Codex, especially with GPT-5.6 Sol". The IPM paper itself does not break the contribution down per step, and defers a fuller account: "The complete human-readable proofs will be released shortly by the first and second authors, together with an account of the role of artificial intelligence in this work."',
      verification: "unreviewed",
      verificationNote:
        "No independent check. Unlike the Boussinesq and Euler results, this one has no Lean formalisation: tristanbuckmaster/fluid_lean contains projects for Boussinesq (twice) and Euler and none for IPM, confirmed by listing the repository tree on 8 September 2026. The paper is a 57-page manuscript on the second author's university page, not on arXiv and not peer reviewed, and no independent expert reading is on record. It is the most conventional of the three write-ups, being the one the authors had time to prepare.",
      resultNote: `Yes. Theorem 2.1: there are a smooth odd initial density $\\rho_{in}\\in C^\\infty(\\mathbb T^2)$ of zero spatial mean, an odd force $F\\in C^\\infty([0,1]\\times\\mathbb T^2)$, and a solution smooth on $[0,T]$ for every $T<1$ with $\\rho(t)\\to\\rho_*$ in $C^\\eta$ for every $0\\le\\eta<1$, yet $\\|\\nabla\\rho(t)\\|_\\infty$ and $\\|D_xu_{\\mathbb T}(\\rho(t))\\|_\\infty$ both diverging as $t\\uparrow1$. The advance over Córdoba and Martínez-Zoroa is precisely the force class, from $L^\\infty_t C^\\infty_x$ to uniformly space-time smooth, on the torus rather than the plane. ${NOT_CLAY}`,
      significance: 25,
      significanceNote:
        "The narrowest of the three: the equation already had a smooth-data blowup theorem and what changes is the regularity of the force, a gap its own authors had flagged. It earns its place as a stated open question now closed, and as the result the Boussinesq and Euler constructions were built out of, but it is an increment on an existing theorem rather than a new frontier.",
      publication: "announcement",
      sourceUrl: "https://cims.nyu.edu/~tristanb/ipm.pdf",
      sourceName:
        "Extending the Córdoba-Martínez-Zoroa IPM blow-up to uniformly space-time smooth forcing (manuscript)",
      status: "published",
      reviewReason: "edited",
    },
    links: [
      {
        label: "Buckmaster's public statement on the work and its release",
        url: STATEMENT_URL,
        kind: "announcement",
      },
      {
        label:
          "Córdoba and Martínez-Zoroa: the theorem extended, and Remark 1's open case",
        url: "https://arxiv.org/abs/2410.22920",
        kind: "problem-record",
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

  let bad = 0;
  for (const e of ENTRIES) {
    console.log("=".repeat(72));
    console.log(`### ${e.slug}`);
    const exists = await prisma.problem.findUnique({
      where: { slug: e.slug },
      select: { id: true, status: true },
    });
    console.log(`  slug: ${exists ? `EXISTS (${exists.status})` : "free"}`);
    if (exists) bad++;

    const dups = await prisma.problem.findMany({
      where: {
        OR: e.dupTerms.map((t) => ({
          name: { contains: t, mode: "insensitive" as const },
        })),
      },
      select: { slug: true, status: true },
    });
    console.log(
      `  near-duplicates: ${dups.length ? dups.map((d) => `${d.slug} (${d.status})`).join(", ") : "none"}`,
    );

    for (const [k, v] of Object.entries(e.fields)) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(
          `  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`,
        );
        if (over) bad++;
      }
    }
    for (const l of e.links) {
      console.log(`  link             : ${l.label.length}/120  ${l.kind}`);
      if (l.label.length > 120) bad++;
    }
  }
  if (bad) throw new Error(`${bad} problem(s) - nothing written`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const admin = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!admin) throw new Error("curator not found");

  for (const e of ENTRIES) {
    const created = await prisma.problem.create({
      data: {
        slug: e.slug,
        ...e.fields,
        reviewedAt: new Date(),
        links: { create: e.links.map((l, position) => ({ ...l, position })) },
      } as unknown as Prisma.ProblemCreateInput,
      select: { id: true },
    });
    await prisma.problemActivity.create({
      data: {
        problemId: created.id,
        userId: admin.id,
        userName: admin.pseudonym,
        type: "approved",
      },
      select: { id: true },
    });
    console.log(`applied: created ${e.slug}`);
  }

  console.log(
    `\nAPPLIED - published entries now ${await prisma.problem.count({ where: { status: "published" } })}. Public caches lag until the next deploy; entry pages are right immediately.`,
  );
}

main().finally(() => prisma.$disconnect());
