// The first four records, seeded on 4 September 2026 to try the feature on
// staging. Every historical row carries the source it was read from; nothing
// here is from memory. Where a source gives only a year, the row says so.
//
// Long gaps and elliptic rank are rank-ordered (the values are expressions,
// or an integer with a "≥"); matrix multiplication and the critical-line
// proportion are numeric. Both shapes need to render before this is real.
//
// Idempotent: records are upserted by slug, rows are replaced wholesale per
// record. Refuses to run against anything but vibemathed_staging until the
// feature is approved - the guard is the same as scripts/schema-lock.mjs.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

type Row = {
  date: string;
  valueTex: string;
  valueNumeric?: number;
  rank?: number;
  attribution: string;
  sourceUrl?: string;
  status?: "published" | "candidate" | "historical" | "retracted";
  note?: string;
  /// Slug of the catalog entry this row IS, when it is one.
  problemSlug?: string;
};

type Rec = {
  slug: string;
  name: string;
  shortName: string;
  quantity: string;
  statement: string;
  direction: "min" | "max";
  field: string;
  fieldGroup: string;
  significance: number;
  significanceNote: string;
  historyNote: string;
  rows: Row[];
};

const WIKI_MATMUL = "https://en.wikipedia.org/wiki/Computational_complexity_of_matrix_multiplication";
const DUJELLA = "https://web.math.pmf.unizg.hr/~duje/tors/rankhist.html";
const WIKI_RH = "https://en.wikipedia.org/wiki/Riemann_hypothesis";
const WIKI_GAP = "https://en.wikipedia.org/wiki/Prime_gap";
const ERDOS4 = "https://www.erdosproblems.com/4";

const RECORDS: Rec[] = [
  {
    slug: "matrix-multiplication-exponent",
    name: "Exponent of matrix multiplication",
    shortName: "Matrix multiplication ω",
    quantity: "The exponent $\\omega$: the smallest real number such that two $n \\times n$ matrices can be multiplied in $O(n^{\\omega + \\varepsilon})$ operations for every $\\varepsilon > 0$.",
    statement:
      "Trivially $2 \\le \\omega \\le 3$, and the conjecture is $\\omega = 2$. Every step since Strassen in 1969 has been an upper bound, and since Coppersmith and Winograd in 1990 every step has come from analysing higher powers of one tensor with the laser method. The record moves in the fourth decimal place and each move is a paper.",
    direction: "min",
    field: "Algebraic complexity",
    fieldGroup: "Theoretical computer science",
    significance: 55,
    significanceNote:
      "Sixty years of work and an entire subfield organised around one number: the laser method, tensor rank, the group-theoretic approach. Textbook material. Held below the top band because no step in thirty-five years has changed the second decimal, and the conjecture itself is untouched.",
    historyNote:
      "Historical rows are the timeline table in the Wikipedia article on the computational complexity of matrix multiplication, which cites each paper; years are publication years as given there. Where two bounds share a year (1981) the table's order is kept.",
    rows: [
      { date: "1969", valueTex: "$2.8074$", valueNumeric: 2.8074, attribution: "Strassen", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1978", valueTex: "$2.796$", valueNumeric: 2.796, attribution: "Pan", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1979", valueTex: "$2.780$", valueNumeric: 2.78, attribution: "Bini, Capovani, Lotti and Romani", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1981", valueTex: "$2.522$", valueNumeric: 2.522, attribution: "Schönhage", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1981", valueTex: "$2.517$", valueNumeric: 2.517, attribution: "Romani", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1981", valueTex: "$2.496$", valueNumeric: 2.496, attribution: "Coppersmith and Winograd", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1986", valueTex: "$2.479$", valueNumeric: 2.479, attribution: "Strassen", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "1990", valueTex: "$2.3755$", valueNumeric: 2.3755, attribution: "Coppersmith and Winograd", sourceUrl: WIKI_MATMUL, status: "historical", note: "Stood for twenty years." },
      { date: "2010", valueTex: "$2.3737$", valueNumeric: 2.3737, attribution: "Stothers", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2012", valueTex: "$2.3729$", valueNumeric: 2.3729, attribution: "Vassilevska Williams", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2014", valueTex: "$2.3728639$", valueNumeric: 2.3728639, attribution: "Le Gall", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2020", valueTex: "$2.3728596$", valueNumeric: 2.3728596, attribution: "Alman and Vassilevska Williams", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2022", valueTex: "$2.371866$", valueNumeric: 2.371866, attribution: "Duan, Wu and Zhou", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2024", valueTex: "$2.371552$", valueNumeric: 2.371552, attribution: "Vassilevska Williams, Xu, Xu and Zhou", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2024", valueTex: "$2.371339$", valueNumeric: 2.371339, attribution: "Alman, Duan, Vassilevska Williams, Xu, Xu and Zhou", sourceUrl: WIKI_MATMUL, status: "historical" },
      { date: "2026-08-17", valueTex: "$2.371177$", valueNumeric: 2.371177, attribution: "AlphaEvolve with Dupont, Eisenberger, Kozlovskii, Mehrabian, Ruiz, See, Zhou, Alman, Vassilevska Williams and Balog", problemSlug: "matrix-multiplication-exponent-2371177" },
    ],
  },
  {
    slug: "critical-line-proportion",
    name: "Proportion of zeta zeros on the critical line",
    shortName: "Zeros on the critical line",
    quantity: "The proportion $\\kappa$ of nontrivial zeros of $\\zeta(s)$ proved to lie on the line $\\operatorname{Re}\\, s = 1/2$: $N_0(T) \\ge (\\kappa - o(1))\\, N(T)$.",
    statement:
      "The Riemann hypothesis says the proportion is $1$. Hardy showed infinitely many zeros are on the line, Selberg a positive proportion, and from Levinson in 1974 the record climbed by mollifier refinements from a third to just over two fifths in half a century. The 2026 step is the first not to descend from Levinson's method and the first to pass one half.",
    direction: "max",
    field: "Analytic number theory",
    fieldGroup: "Number theory",
    significance: 68,
    significanceNote:
      "The Riemann hypothesis is the anchor of the significance ladder at 100, and this is the quantitative measure of how much of it is proved. Level with the catalog entry for the 2026 step; the record and its latest step carry the same weight because the step is most of the record's modern history.",
    historyNote:
      "Historical rows follow the account in the Wikipedia article on the Riemann hypothesis (Hardy, Selberg, Levinson, Conrey, Pratt-Robles-Zaharescu-Zeindler) with Levinson's 1974 Advances in Mathematics title as the source of the one-third figure. Hardy's and Selberg's results have no proportion to plot and are recorded as ranks below Levinson.",
    rows: [
      { date: "1914", valueTex: "infinitely many", rank: 1, attribution: "Hardy", sourceUrl: WIKI_RH, status: "historical", note: "Infinitely many zeros on the line; no proportion." },
      { date: "1942", valueTex: "a positive proportion", rank: 2, attribution: "Selberg", sourceUrl: WIKI_RH, status: "historical", note: "A small positive proportion, not made explicit." },
      { date: "1974", valueTex: "$> 1/3$", valueNumeric: 0.3333, attribution: "Levinson", sourceUrl: "https://doi.org/10.1016/0001-8708(74)90074-7", status: "historical", note: "More than one-third of the zeros of Riemann's zeta function are on σ = 1/2." },
      { date: "1989", valueTex: "$> 2/5$", valueNumeric: 0.4, attribution: "Conrey", sourceUrl: WIKI_RH, status: "historical" },
      { date: "2020", valueTex: "$> 5/12 \\approx 41.7\\%$", valueNumeric: 0.4167, attribution: "Pratt, Robles, Zaharescu and Zeindler", sourceUrl: WIKI_RH, status: "historical" },
      { date: "2026-08-10", valueTex: "$> 67.25\\%$", valueNumeric: 0.6725, attribution: "Claude (unreleased research version) with Sumner, Alpöge, Furman and Easley", problemSlug: "more-than-67-of-riemann-zeta-zeros-are-on-the-critical-line" },
    ],
  },
  {
    slug: "elliptic-curve-rank",
    name: "Largest known rank of an elliptic curve over Q",
    shortName: "Elliptic curve rank",
    quantity: "The largest $r$ for which an elliptic curve $E/\\mathbb{Q}$ with $\\operatorname{rank} E(\\mathbb{Q}) \\ge r$ is known, with $r$ independent points exhibited.",
    statement:
      "Whether ranks are bounded is open and experts disagree. The record is a construction race: each row is an explicit curve with that many independent rational points, unconditionally. Exact ranks (rather than lower bounds) usually need GRH and are not what this record tracks. It moved about once a decade until 2024, then twice in three days in August 2026.",
    direction: "max",
    field: "Arithmetic geometry",
    fieldGroup: "Number theory",
    significance: 50,
    significanceNote:
      "A closely watched benchmark tied to the boundedness question and, through analytic rank, to BSD. Level with the sphere-packing upper bounds and just under the matrix multiplication exponent: a real problem, but a record on a construction rather than on a theorem.",
    historyNote:
      "Historical rows are Dujella's History of elliptic curves rank records, the reference table the field itself maintains; years and attributions as given there. Only rows that raised the record are included.",
    rows: [
      { date: "1982", valueTex: "$\\ge 12$", valueNumeric: 12, attribution: "Mestre", sourceUrl: DUJELLA, status: "historical" },
      { date: "1986", valueTex: "$\\ge 14$", valueNumeric: 14, attribution: "Mestre", sourceUrl: DUJELLA, status: "historical" },
      { date: "1992", valueTex: "$\\ge 15$", valueNumeric: 15, attribution: "Mestre", sourceUrl: DUJELLA, status: "historical" },
      { date: "1992", valueTex: "$\\ge 17$", valueNumeric: 17, attribution: "Nagao", sourceUrl: DUJELLA, status: "historical" },
      { date: "1992", valueTex: "$\\ge 19$", valueNumeric: 19, attribution: "Fermigier", sourceUrl: DUJELLA, status: "historical" },
      { date: "1993", valueTex: "$\\ge 20$", valueNumeric: 20, attribution: "Nagao", sourceUrl: DUJELLA, status: "historical" },
      { date: "1994", valueTex: "$\\ge 21$", valueNumeric: 21, attribution: "Nagao and Kouya", sourceUrl: DUJELLA, status: "historical" },
      { date: "1997", valueTex: "$\\ge 22$", valueNumeric: 22, attribution: "Fermigier", sourceUrl: DUJELLA, status: "historical" },
      { date: "1998", valueTex: "$\\ge 23$", valueNumeric: 23, attribution: "Martin and McMillen", sourceUrl: DUJELLA, status: "historical" },
      { date: "2000", valueTex: "$\\ge 24$", valueNumeric: 24, attribution: "Martin and McMillen", sourceUrl: DUJELLA, status: "historical" },
      { date: "2006", valueTex: "$\\ge 28$", valueNumeric: 28, attribution: "Elkies", sourceUrl: DUJELLA, status: "historical", note: "Stood for eighteen years." },
      { date: "2024", valueTex: "$\\ge 29$", valueNumeric: 29, attribution: "Elkies and Klagsbrun", sourceUrl: DUJELLA, status: "historical" },
      { date: "2026-08-20", valueTex: "$\\ge 30$", valueNumeric: 30, attribution: "Claude with Alpöge and Howell", problemSlug: "elliptic-curve-rank-record-thirty" },
      { date: "2026-08-23", valueTex: "$\\ge 31$", valueNumeric: 31, attribution: "Claude with Alpöge and Howell", problemSlug: "elliptic-curve-rank-record-thirty-one" },
    ],
  },
  {
    slug: "long-prime-gaps",
    name: "Lower bound for the largest prime gap",
    shortName: "Long prime gaps",
    quantity: "The best proved lower bound on $G(X) = \\max_{p_{n+1} \\le X} (p_{n+1} - p_n)$, the largest gap between consecutive primes below $X$, for all large $X$.",
    statement:
      "Erdős Problem #4 and the carrier of his largest prize. Rankin's 1938 bound stood, up to the constant, for 76 years; Erdős offered 10,000 dollars for showing the constant could be taken arbitrarily large, paid out to Ford-Green-Konyagin-Tao and Maynard in 2014. The 2018 bound of all five authors was the record until two AI steps in the space of nine days in 2026. Values are expressions and compare by the unbounded factor between them, so this record has no numeric axis.",
    direction: "max",
    field: "Analytic number theory",
    fieldGroup: "Number theory",
    significance: 60,
    significanceNote:
      "Among the most-worked quantitative questions in prime number theory, on the record since 1938, with two prizes attached across its history. Level with both catalog entries on it, which were set at 60 for exactly this reason: the weight is the question's, not any one step's.",
    historyNote:
      "Historical rows follow the Wikipedia article on prime gaps and the erdosproblems.com record for Problem #4. Rankin 1938 and FGKMT 2018 are the two shapes of the bound; the 2014 result (Ford-Green-Konyagin-Tao, and independently Maynard) improved the constant to arbitrarily large rather than the shape, and is recorded as its own row.",
    rows: [
      { date: "1938", valueTex: "$\\gg \\dfrac{\\log X \\, \\log_2 X \\, \\log_4 X}{(\\log_3 X)^2}$", rank: 1, attribution: "Rankin", sourceUrl: WIKI_GAP, status: "historical", note: "Improving Westzynthius and Erdős. The constant was later pushed to any c < e^γ." },
      { date: "2014", valueTex: "same shape, constant arbitrarily large", rank: 2, attribution: "Ford, Green, Konyagin and Tao; independently Maynard", sourceUrl: ERDOS4, status: "historical", note: "Erdős's 10,000 dollar problem: the constant c in Rankin's bound can be taken arbitrarily large." },
      { date: "2018", valueTex: "$\\gg \\dfrac{\\log X \\, \\log_2 X \\, \\log_4 X}{\\log_3 X}$", rank: 3, attribution: "Ford, Green, Konyagin, Maynard and Tao", sourceUrl: WIKI_GAP, status: "historical", note: "Gains a factor of log_3 X over Rankin." },
      { date: "2026-08-25", valueTex: "$\\gg \\dfrac{\\log X \\, \\log_2 X}{\\log_4 X}$", rank: 4, attribution: "GPT 5.6 Sol with DottedCalculator and Alexeev", problemSlug: "tilted-residue-class-construction-for-long-prime-free-intervals" },
      { date: "2026-09-03", valueTex: "$\\gg \\dfrac{\\log X \\, (\\log_2 X)^2 \\, \\log_4 X}{(\\log_3 X)^2}$", rank: 5, attribution: "GPT 6 Astra", problemSlug: "improved-maximal-prime-gap-lower-bound" },
    ],
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  if (db !== "vibemathed_staging") throw new Error(`refusing: connected to "${db}", not vibemathed_staging`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true } });

  // Resolve every entry slug first so a typo fails before anything is written.
  const slugs = RECORDS.flatMap((r) => r.rows.map((x) => x.problemSlug).filter((s): s is string => !!s));
  const found = await prisma.problem.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true, status: true } });
  const byslug = new Map(found.map((p) => [p.slug, p]));
  const missing = slugs.filter((s) => !byslug.has(s));
  if (missing.length) throw new Error(`entries not found: ${missing.join(", ")}`);

  for (const r of RECORDS) {
    const hist = r.rows.filter((x) => !x.problemSlug).length;
    const ai = r.rows.length - hist;
    console.log(`\n${r.slug}  (${r.direction})  ${hist} historical + ${ai} entry rows`);
    for (const x of r.rows) {
      const p = x.problemSlug ? byslug.get(x.problemSlug)! : null;
      const st = x.status ?? (p ? (p.status === "published" ? "published" : "candidate") : "historical");
      console.log(`   ${x.date.padEnd(10)} ${st.padEnd(10)} ${(x.valueNumeric ?? (x.rank !== undefined ? `rank ${x.rank}` : "?")).toString().padStart(10)}  ${x.attribution.slice(0, 50)}${p ? "  -> " + p.slug : ""}`);
      if (!x.problemSlug && !x.sourceUrl) throw new Error(`historical row without a source: ${r.slug} ${x.date} ${x.attribution}`);
    }
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const r of RECORDS) {
    const rec = await prisma.record.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        name: r.name,
        shortName: r.shortName,
        quantity: r.quantity,
        statement: r.statement,
        direction: r.direction,
        field: r.field,
        fieldGroup: r.fieldGroup,
        significance: r.significance,
        significanceNote: r.significanceNote,
        historyNote: r.historyNote,
        createdById: curator?.id ?? null,
      },
      update: {
        name: r.name,
        shortName: r.shortName,
        quantity: r.quantity,
        statement: r.statement,
        direction: r.direction,
        field: r.field,
        fieldGroup: r.fieldGroup,
        significance: r.significance,
        significanceNote: r.significanceNote,
        historyNote: r.historyNote,
      },
    });
    await prisma.recordRow.deleteMany({ where: { recordId: rec.id } });
    await prisma.recordRow.createMany({
      data: r.rows.map((x) => {
        const p = x.problemSlug ? byslug.get(x.problemSlug)! : null;
        return {
          recordId: rec.id,
          date: x.date,
          valueTex: x.valueTex,
          valueNumeric: x.valueNumeric ?? null,
          rank: x.rank ?? null,
          attribution: x.attribution,
          sourceUrl: x.sourceUrl ?? null,
          status: x.status ?? (p ? (p.status === "published" ? "published" : "candidate") : "historical"),
          note: x.note ?? null,
          problemId: p?.id ?? null,
        };
      }),
    });
    console.log(`applied: ${r.slug} with ${r.rows.length} rows`);
  }
  console.log("\nAPPLIED to vibemathed_staging");
}

main().finally(() => prisma.$disconnect());
