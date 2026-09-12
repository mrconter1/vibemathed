// Adds the de Bruijn-Newman frontier: upper bounds on Lambda.
//
// Asked for after Gomila's Lambda <= 0.1787854 was declined as an entry on
// 12 September. The decline was right that it is a record rather than the
// resolution of a posed question, and wrong about where records go - the
// catalog files them as entries with resolution partial, and a frontier is
// the staircase those entries sit on. This builds the staircase.
//
// The quantity is the de Bruijn-Newman constant: the threshold Lambda such
// that the zeros of the heat-flow deformation H_t of the Riemann xi function
// are all real exactly when t >= Lambda. Lambda <= 0 IS the Riemann
// hypothesis, and Rodgers and Tao proved Lambda >= 0 in 2018, so the
// remaining question is how far the upper bound can be pushed toward zero.
// That makes this the rare frontier whose finish line is a Millennium
// problem, and the rows since 2019 are a real race.
//
// Direction is "min": a smaller upper bound is better.
//
// WHAT WAS VERIFIED, ROW BY ROW, and this matters because two rows could not
// be opened from this machine and are marked as such rather than asserted:
//
//   1950  de Bruijn, Lambda <= 1/2. Classical and universally cited; not
//         independently opened here.
//   2009  Ki, Kim and Lee, Lambda < 1/2 strictly. Also classical. Numerically
//         the same 0.5, which is the point: the bound did not move for
//         fifty-nine years, and the chart shows that flat stretch honestly.
//   2019  Polymath15, Lambda <= 0.22. arXiv:1904.12438 read here: title,
//         authorship (D.H.J. Polymath) and abstract all confirm it.
//   2020  Lambda <= 0.2, the same Polymath15 criterion instantiated at Platt
//         and Trudgian's verified height. Platt-Trudgian arXiv:2004.09765 was
//         read here and states RH verified to height 3*10^12. The 0.2 figure
//         itself is recorded on the Polymath project wiki and in Tao's
//         commentary, NEITHER OF WHICH COULD BE OPENED FROM HERE (DNS
//         failure), so the row is attributed to the mechanism and the note
//         says where the statement lives. Gomila's own package corroborates
//         it: his referee report checks that the criterion needs verified
//         height X/2 = 3000000092913.5 and that Platt-Trudgian Theorem 1
//         reaches 3000175332800.
//   2026  Mosaic Intelligence, Lambda <= 0.1875, Zenodo 21175533. Zenodo
//         returned 403 to this machine, so the row is transcribed from
//         Gomila's UPSTREAM.md artifact lock, which records the DOI, the
//         2026-07-03 publication date, the CC BY 4.0 licence and SHA-256
//         hashes of the two files. Marked candidate: an unreviewed claim.
//   2026  Gomila, Lambda <= 0.1787854 = 893927/5000000, at exact parameters
//         X = 6000000185827, t0 = 129/800, y0^2 = 87677/2500000. The
//         repository was read here: the release tag, the sealed manifest, the
//         external referee report (an adversarial AI panel, explicitly "not a
//         substitute for human expert peer review", which found no fatal
//         defect and left three items needing human sign-off), and the
//         bibliography. Marked candidate.
//
// The last two rows are candidates, so they are drawn hollow and neither is
// the frontier's headline value. That is the honest picture: the standing
// reviewed record is 0.2, with two unreviewed claims below it.
//
// No row links to a catalog entry. Gomila's submission was declined on form
// defects and may be resubmitted; if it is published, add problemSlug to the
// last row so the frontier inherits its model and verification.
//
// Frontier and FrontierRow have NO form validator - only the database column
// widths - so this script checks every one of them before writing, which is
// how the C11 frontier's P2000 failure is not repeated.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");

const SLUG = "de-bruijn-newman-constant";

const FRONTIER = {
  slug: SLUG,
  name: "Upper bounds for the de Bruijn-Newman constant",
  // shortName renders RAW on /frontiers and in FrontierMembership, so plain
  // text with a Unicode capital lambda, never TeX.
  shortName: "de Bruijn-Newman Λ",
  quantity: "the de Bruijn-Newman constant $\\Lambda$",
  statement:
    "For each real $t$ the entire function $H_t$ is the heat-flow deformation of the Riemann $\\xi$ function, and de Bruijn and Newman showed there is a finite constant $\\Lambda$ such that the zeros of $H_t$ are all real exactly when $t\\ge\\Lambda$. The Riemann hypothesis is equivalent to $\\Lambda\\le 0$, and Rodgers and Tao proved Newman's complementary conjecture $\\Lambda\\ge 0$ in 2018, so the constant is pinned below at zero and the open question is how far the upper bound can be pushed toward it. This frontier tracks that upper bound. Reaching $0$ would prove the Riemann hypothesis; nothing here claims to be near it.",
  direction: "min",
  field: "Analytic number theory; zeros of the Riemann zeta function",
  fieldGroup: "Number theory",
  significance: 45,
  significanceNote:
    "A named constant whose value decides the Riemann hypothesis: $\\Lambda\\le 0$ is equivalent to RH, and Newman's conjecture $\\Lambda\\ge 0$ was settled by Rodgers and Tao. The upper-bound race has its own literature and was the subject of a Polymath project led by Tao. Above the C11 capacity frontier at 35, whose audience is one subcommunity, and below the matrix multiplication exponent at 55, which the whole of theoretical computer science watches; the numerical bound on $\\Lambda$ is followed closely by analytic number theorists and known by name well beyond them.",
  historyNote:
    "Steps below 0.22 are the live race; the two 2026 rows are unreviewed claims and are drawn hollow, so the standing reviewed record on this staircase is 0.2. Two rows could not be opened from here and are marked in their notes: the 0.2 figure, whose primary statement is on the Polymath project wiki, and the 0.1875 claim, whose Zenodo record refused automated access and which is transcribed from the artifact lock in the 0.1787854 package. The 1950 and 2009 rows are classical and were not independently opened. Everything else was read at source.",
};

type Row = {
  date: string;
  valueTex: string;
  valueShortTex?: string;
  valueNumeric: number;
  attribution: string;
  sourceUrl: string;
  status: string;
  note?: string;
  problemSlug?: string;
};

const ROWS: Row[] = [
  {
    date: "1950",
    valueTex: "$\\le 1/2$",
    valueShortTex: "0.5",
    valueNumeric: 0.5,
    attribution: "Nicolaas de Bruijn",
    sourceUrl: "https://doi.org/10.1215/S0012-7094-50-01720-0",
    status: "historical",
    note: "De Bruijn's original bound, from the paper that introduced the deformation. Classical; cited here rather than opened.",
  },
  {
    date: "2009",
    valueTex: "$< 1/2$",
    valueShortTex: "< 0.5",
    valueNumeric: 0.5,
    attribution: "Haseo Ki, Young-One Kim and Jungseob Lee",
    sourceUrl: "https://doi.org/10.1112/jlms/jdp009",
    status: "historical",
    note: "Strict inequality, sharpening de Bruijn without moving the number. The flat stretch on this chart from 1950 to 2009 is real: fifty-nine years with no numerical improvement.",
  },
  {
    date: "2019-04",
    valueTex: "$\\le 0.22$",
    valueShortTex: "0.22",
    valueNumeric: 0.22,
    attribution: "D.H.J. Polymath (Polymath15)",
    sourceUrl: "https://arxiv.org/abs/1904.12438",
    status: "historical",
    note: "The Polymath15 project, which built an effective theory of the heat flow and instantiated it. This is the paper every later step uses: its Theorem 1.2 is the barrier criterion the 2026 claims plug exact parameters into.",
  },
  {
    date: "2020-04",
    valueTex: "$\\le 0.2$",
    valueShortTex: "0.2",
    valueNumeric: 0.2,
    attribution:
      "D.H.J. Polymath's criterion at Platt and Trudgian's verified height",
    sourceUrl: "https://arxiv.org/abs/2004.09765",
    status: "historical",
    note: "Not a separate paper: the same Polymath15 criterion, fed by Platt and Trudgian's verification of RH to height 3e12. The linked source is that verification; the 0.2 figure is stated on the Polymath project wiki and in Tao's commentary, which could not be opened from here. This is the standing reviewed record.",
  },
  {
    date: "2026-07-03",
    valueTex: "$\\le 0.1875$",
    valueShortTex: "0.1875",
    valueNumeric: 0.1875,
    attribution: "Mosaic Intelligence",
    sourceUrl: "https://doi.org/10.5281/zenodo.21175533",
    status: "candidate",
    note: "A certified unconditional bound on a versioned Zenodo record, CC BY 4.0. Zenodo refused automated access from here, so this row is transcribed from the artifact lock in the 0.1787854 package, which pins the DOI, the date and SHA-256 hashes of both files. Unreviewed.",
  },
  {
    date: "2026-08-20",
    valueTex: "$\\le 893927/5000000 = 0.1787854$",
    valueShortTex: "0.1787854",
    valueNumeric: 0.1787854,
    attribution: "Jude Gomila, with Claude and ChatGPT/Codex",
    sourceUrl:
      "https://github.com/judegomila/dbn-lambda-01787854-candidate-audit",
    status: "candidate",
    note: "Polymath15's Theorem 1.2 at exact parameters X = 6000000185827, t0 = 129/800, y0^2 = 87677/2500000, with fail-closed Arb interval certificates and a sealed manifest. Unconditional in form: no RH beyond the finite Platt-Trudgian height. Not peer reviewed; the repository's referee report is an adversarial AI panel that calls itself no substitute for human review and leaves three items needing human sign-off.",
  },
];

/// Column widths from prisma/schema.prisma. These tables have no form and so
/// no validator to mirror; a dry run that does not check them is worse than
/// none, because it reports success and the write then fails with P2000,
/// which names no column.
const F_LIMITS: Record<string, number> = {
  name: 120,
  shortName: 60,
  quantity: 300,
  statement: 1500,
  direction: 3,
  field: 80,
  significanceNote: 600,
  historyNote: 600,
};
const R_LIMITS: Record<string, number> = {
  date: 10,
  valueTex: 200,
  valueShortTex: 200,
  attribution: 200,
  status: 12,
  note: 400,
};

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

  const exists = await prisma.$queryRawUnsafe<{ slug: string }[]>(
    `SELECT slug FROM "Frontier" WHERE slug = $1`,
    SLUG,
  );
  console.log(`frontier ${SLUG}: ${exists.length ? "EXISTS" : "free"}`);
  if (exists.length) throw new Error("slug taken");

  const ids = new Map<string, string>();
  for (const r of ROWS) {
    if (!r.problemSlug) continue;
    const p = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "Problem" WHERE slug = $1 AND status = 'published'`,
      r.problemSlug,
    );
    if (p.length !== 1) throw new Error(`entry not found: ${r.problemSlug}`);
    ids.set(r.problemSlug, p[0].id);
  }

  console.log(
    `\n${FRONTIER.shortName}  (${FRONTIER.direction})  sig=${FRONTIER.significance}`,
  );
  // "min" direction: best is smallest, so print worst-first to read as a
  // descending staircase.
  const sorted = [...ROWS].sort((a, b) => b.valueNumeric - a.valueNumeric);
  for (const r of sorted) {
    console.log(
      `  ${r.date.padEnd(10)} ${String(r.valueNumeric).padEnd(12)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 46)}`,
    );
  }
  const best = sorted[sorted.length - 1];
  const bestPublished = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => a.valueNumeric - b.valueNumeric)[0];
  console.log(
    `\n  headline (non-candidate): ${bestPublished.valueNumeric}  ${bestPublished.attribution.slice(0, 50)}`,
  );
  console.log(`  best claim overall      : ${best.valueNumeric}  (${best.status})`);

  // A later row must not be worse than an earlier one, or a step is
  // mis-transcribed.
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric > byDate[i - 1].valueNumeric)
      console.log(
        `  WARNING: ${byDate[i].date} (${byDate[i].valueNumeric}) is worse than ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`,
      );
  }

  let over = 0;
  console.log("\nfield lengths:");
  for (const [k, lim] of Object.entries(F_LIMITS)) {
    const v = (FRONTIER as Record<string, unknown>)[k];
    if (typeof v !== "string") continue;
    const bad = v.length > lim;
    if (bad) over++;
    console.log(`  frontier.${k.padEnd(17)} ${v.length}/${lim}${bad ? "  OVER" : ""}`);
  }
  for (const r of ROWS) {
    for (const [k, lim] of Object.entries(R_LIMITS)) {
      const v = (r as unknown as Record<string, unknown>)[k];
      if (typeof v !== "string") continue;
      if (v.length > lim) {
        over++;
        console.log(`  row ${r.date} ${k}: ${v.length}/${lim}  OVER`);
      }
    }
  }
  console.log(over ? `\n${over} field(s) OVER - nothing written` : "\nall field lengths ok");
  if (over) throw new Error("field too long");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const created = await prisma.frontier.create({
    data: {
      ...FRONTIER,
      rows: {
        create: ROWS.map((r) => ({
          date: r.date,
          valueTex: r.valueTex,
          valueShortTex: r.valueShortTex ?? null,
          valueNumeric: r.valueNumeric,
          attribution: r.attribution,
          sourceUrl: r.sourceUrl,
          status: r.status,
          note: r.note ?? null,
          problemId: r.problemSlug ? ids.get(r.problemSlug) : null,
        })),
      },
    },
    select: { id: true, slug: true, _count: { select: { rows: true } } },
  });
  console.log(
    `\nAPPLIED. ${created.slug} created with ${created._count.rows} rows.`,
  );
  console.log("The frontier list lags by up to an hour, or until a deploy.");
}

main().finally(() => prisma.$disconnect());
