// Import of the 3SUM and APSP hypothesis refutations, arXiv:2610.06783
// (Josh Alman and Virginia Vassilevska Williams, 5 October 2026), as two
// entries from one source, the catalog's convention for a paper that settles
// two named problems.
//
// Checked here on 6 October 2026:
//
//   * Theorem 2: on a word RAM with O(log n)-bit words, deterministic
//     O(n^1.9992) 3SUM and O(n^2.9995) APSP (and (min,+)-product) for integers
//     of absolute value n^O(1); Exact Triangle in O(n^2.9983). Las Vegas real-RAM
//     versions too. The introduction states both hypotheses in their standard
//     forms ([GO95, Pat10] for 3SUM; [RZ04, VW10, VW18, AV14] for APSP), so the
//     result refutes exactly what the literature calls the 3SUM and APSP
//     hypotheses, not a variant.
//   * AI disclosure, abstract: "Claude, an AI model developed by Anthropic,
//     discovered the algorithm that refutes the 3SUM, APSP, and Exact Triangle
//     hypotheses." The methodology section: an internal research model, set
//     to verify cryptographic constructions based on Zero-k-Clique hardness,
//     developed the algorithm in one 16M-token session with no human input;
//     the authors simplified, strengthened and extended it.
//   * Lean: github.com/anthropics/formal-math, folder 3sum-apsp, commit
//     e1a4e65 (5 Oct): about 102k lines, Lean 4.33.1 with mathlib, explicit
//     word-RAM programs proved correct with their running times. The five
//     headline claims sit in a 139-line import-free EndStatement.lean. No
//     sorry outside the Challenge folder (by design), no axiom declarations,
//     native_decide, implemented_by or unsafe. NOT rebuilt here, no Comparator
//     run recorded, and the statement file is Anthropic's own: nothing anchors
//     it independently, which is why these are Lean-checked rather than
//     Lean-verified.
//
// PUBLISHED AS CANDIDATE, on the curator's decision (6 October), rather than
// held under the extraordinary-claims rule. The hold criteria were not met (no
// uninvolved expert yet, the Lean statement is not independently anchored);
// what tipped it is that the claim comes with a machine-checked development of
// the algorithms themselves and from the two leading researchers of the area.
// The verification notes say plainly what has and has not been checked. Move
// to Lean-verified after an independent audit of EndStatement.lean against the
// standard hypotheses plus a rebuild or Comparator run; to Resolved when an
// uninvolved fine-grained-complexity researcher confirms in public.
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

interface Entry {
  slug: string;
  fields: Record<string, unknown>;
  links: { label: string; url: string; kind: string }[];
}

const SOURCE = "https://arxiv.org/abs/2610.06783";
const LEAN = "https://github.com/anthropics/formal-math/tree/e1a4e65/3sum-apsp";
const SHARED = {
  solveType: "disproved",
  resolution: "candidate",
  resolutionMethod: "construction",
  solveDate: "2026-10-05",
  model: "Claude (internal Anthropic research model, unnamed)",
  modelMaker: "Anthropic",
  humanCollaborators: ["Josh Alman", "Virginia Vassilevska Williams"],
  aiRole:
    "From the abstract: \"Claude, an AI model developed by Anthropic, discovered the algorithm that refutes the 3SUM, APSP, and Exact Triangle hypotheses.\" The methodology section adds that an Anthropic employee had set an internal research model to verify and improve cryptographic constructions based on the average-case hardness of Zero-k-Clique; instead it developed this algorithm, first for the average case and then the worst case, in one session of 16 million output tokens with no human input. Anthropic shared it with the authors in September 2026. Alman and Vassilevska Williams simplified, strengthened and extended it, derived further consequences and wrote the paper; an internal model later produced the Lean formalisation.",
  aiContribution: "ai-discovered",
  verification: "lean-checked",
  verificationNote:
    "Read here on 6 October 2026, not rebuilt. The paper's Theorem 2 was compared with the standard hypotheses as its own introduction states them (word RAM with O(log n)-bit words, integers of absolute value n^O(1)) and matches. The Lean development (anthropics/formal-math, folder 3sum-apsp, commit e1a4e65; Lean 4.33.1 with mathlib, about 102,000 lines) proves correctness and running time of explicit programs on a word-RAM machine defined in Lean, a weaker machine than the standard word RAM, which only strengthens upper bounds. Its five headline claims are stated in a 139-line file with no imports. No sorry outside the deliberate Challenge folder, no axiom declarations, native_decide, implemented_by or unsafe. The statement file was written by the same party as the proof and has not been audited independently, and no Comparator run is recorded. No uninvolved expert has commented yet; the authors are the leading researchers of the area and are not independent reviewers.",
  publication: "preprint",
  sourceUrl: SOURCE,
  sourceName: "arXiv:2610.06783, Alman and Vassilevska Williams (5 October 2026)",
  renownLangs: 0,
};

const ENTRIES: Entry[] = [
  {
    slug: "3sum-hypothesis",
    fields: {
      ...SHARED,
      name: "The 3SUM hypothesis: is 3SUM solvable in truly subquadratic time?",
      shortName: "3SUM hypothesis",
      fieldGroup: "Theoretical computer science",
      field: "Fine-grained complexity; algorithms",
      statement:
        "Given $n$ integers in $[-n^c, n^c]$, decide whether three of them sum to zero. The 3SUM hypothesis asserts that no algorithm on a word RAM with $O(\\log n)$-bit words solves this in $O(n^{2-\\varepsilon})$ time for any $\\varepsilon > 0$. Hundreds of conditional lower bounds in computational geometry and fine-grained complexity rest on it. Is there a truly subquadratic algorithm?",
      posedBy:
        "Anka Gajentaan and Mark Overmars (3SUM-hardness, 1995); the integer word-RAM form as used today is Patrascu's (2010)",
      yearPosed: 1995,
      resultNote:
        "Yes: a deterministic $O(n^{1.9992})$ algorithm for 3SUM on polynomially bounded integers on the word RAM, refuting the hypothesis, and a Las Vegas $O(n^{1.998})$ algorithm for real inputs using only additions, subtractions and comparisons. The core is a new algorithm for wanted entries of thin matrix products (a modified Coppersmith rectangular algorithm with a Schönhage identity), which solves Lopsided All-Edges Sparse Triangle; known reductions give 3SUM. The same paper refutes the APSP hypothesis, catalogued separately. The constants are enormous, so the impact is on the theory: the conditional lower bounds built on 3SUM no longer stand as stated. SETH and Orthogonal Vectors are unaffected.",
      significance: 50,
      significanceNote:
        "The central hardness assumption of computational geometry and one of the three pillars of fine-grained complexity for three decades, with hundreds of conditional lower bounds resting on it. Just below the APSP hypothesis at 55, refuted in the same paper, which carries the older textbook question, and below the matrix-multiplication exponent at 55; far above every other TCS entry, such as the SETH-hardness of furthest pair at 20.",
    },
    links: [
      { label: "Lean formalisation of the algorithms and running times (anthropics/formal-math)", url: LEAN, kind: "lean-proof" },
      { label: "The APSP hypothesis, refuted in the same paper", url: "https://vibemathed.com/problem/apsp-hypothesis", kind: "other" },
    ],
  },
  {
    slug: "apsp-hypothesis",
    fields: {
      ...SHARED,
      name: "The APSP hypothesis: are all-pairs shortest paths computable in truly subcubic time?",
      shortName: "APSP hypothesis",
      fieldGroup: "Theoretical computer science",
      field: "Fine-grained complexity; graph algorithms",
      statement:
        "Given a directed graph on $n$ vertices with integer edge weights in $[-n^c, n^c]$ and no negative cycles, compute all pairwise shortest-path distances. Floyd-Warshall does it in $O(n^3)$ time, and decades of improvements removed only subpolynomial factors. The APSP hypothesis asserts that no algorithm on a word RAM with $O(\\log n)$-bit words runs in $O(n^{3-\\varepsilon})$ time for any $\\varepsilon > 0$; a large class of problems is subcubically equivalent to it. Is there a truly subcubic algorithm?",
      posedBy:
        "Virginia Vassilevska Williams and Ryan Williams (subcubic equivalences, FOCS 2010); the question of truly subcubic APSP is as old as Floyd-Warshall (1962)",
      yearPosed: 2010,
      ageNote:
        "Dated from the hypothesis as formulated by Vassilevska Williams and Williams in 2010; whether APSP admits a truly subcubic algorithm had been asked since Floyd-Warshall in 1962. Vassilevska Williams, who co-posed the hypothesis, co-authored the refutation.",
      resultNote:
        "Yes: deterministic $O(n^{2.9995})$ algorithms for APSP and for the (min,+)-product with polynomially bounded integer weights on the word RAM (the Lean development states $n^{2.99942}$), and Exact Triangle in $O(n^{2.9983})$, refuting the APSP and Exact Triangle hypotheses; a Las Vegas $O(n^{2.998})$ version works for real weights. The core is a new thin-matrix-product algorithm solving Lopsided All-Edges Sparse Triangle, with known reductions giving the rest. The same paper refutes the 3SUM hypothesis, catalogued separately. The constants are enormous; the impact is on the theory of subcubic equivalences, not on practice. SETH and Orthogonal Vectors are unaffected.",
      significance: 55,
      significanceNote:
        "Truly subcubic APSP was a textbook open question from Floyd-Warshall in 1962, and the 2010 hypothesis anchors a whole class of subcubically equivalent problems. Level with the matrix-multiplication exponent at 55, a subfield-defining question of the same kind; above the 3SUM hypothesis at 50, refuted in the same paper; below the unforced Euler blowup entry at 80.",
    },
    links: [
      { label: "Lean formalisation of the algorithms and running times (anthropics/formal-math)", url: LEAN, kind: "lean-proof" },
      { label: "The 3SUM hypothesis, refuted in the same paper", url: "https://vibemathed.com/problem/3sum-hypothesis", kind: "other" },
    ],
  },
];

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const e of ENTRIES) {
    console.log(e.slug);
    for (const [k, v] of Object.entries(e.fields)) {
      if (typeof v !== "string") continue;
      const c = charLength(canonical(v));
      const lim = limit.get(k);
      const over = lim !== undefined && c > lim;
      if (lim) console.log(`  ${k.padEnd(17)}: ${c}/${lim}${over ? "  OVER" : ""}`);
      if (over) bad++;
      if (/—/.test(v)) {
        console.log(`  ${k}: EM DASH`);
        bad++;
      }
    }
    const v = checkStoredEntry({ specs: SPECS, fields: e.fields, links: e.links, sourceUrl: e.fields.sourceUrl as string });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
  }
  return bad;
}

async function main() {
  const bad = lint();
  if (LINT) {
    console.log(bad ? `\n${bad} local violation(s)` : "\nlocal checks ok");
    process.exitCode = bad ? 1 : 0;
    return;
  }
  if (bad) throw new Error(`${bad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) throw new Error("no admin");

    const dup = await prisma.problem.findMany({
      where: { OR: [{ sourceUrl: { contains: "2610.06783" } }, { name: { contains: "3SUM" } }, { name: { contains: "APSP" } }] },
      select: { slug: true, status: true },
    });
    for (const d of dup) console.log(`  existing match: ${d.slug} (${d.status})`);

    for (const e of ENTRIES) {
      const existing = await prisma.problem.findUnique({ where: { slug: e.slug }, select: { status: true } });
      console.log(`### ${e.slug}${existing ? `  (EXISTS, ${existing.status} - skip)` : ""}`);
      console.log(`    ${e.fields.name}`);
      console.log(`    ${e.fields.solveType}/${e.fields.resolution}  sig=${e.fields.significance}  ai=${e.fields.aiContribution}  ver=${e.fields.verification}  posed=${e.fields.yearPosed}  ${e.links.length} link(s)`);
      if (existing || !APPLY) continue;
      await prisma.$transaction([
        prisma.problem.create({
          data: {
            slug: e.slug,
            ...(e.fields as object),
            status: "published",
            links: { create: e.links.map((l, position) => ({ ...l, position })) },
          } as never,
        }),
        prisma.problemActivity.create({
          data: {
            problem: { connect: { slug: e.slug } },
            user: { connect: { id: admin.id } },
            userName: admin.pseudonym ?? null,
            type: "created",
          },
        }),
      ]);
      console.log("    CREATED");
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    console.log("\nAPPLIED. Entry pages render on first request; lists and stats lag up to an hour.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
