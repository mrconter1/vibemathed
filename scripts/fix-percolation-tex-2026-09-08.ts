// The percolation entry came in with ASCII mathematics - "Z^d", "theta(p)",
// "d >= 2" - so the entry page showed them literally instead of typeset.
// This rewrites the fields that are actually TeX-rendered.
//
// Which fields may carry TeX, checked in the components rather than assumed:
//   name, statement, resultNote, verificationNote, aiRole  -> <TeX>, safe.
//   significanceNote -> <StarNote text={...}> which calls renderBold, NOT
//     TeX. A "$" here would render as a literal dollar sign, so this field is
//     left in Unicode.
//   shortName -> deTeX in cards and meta titles, texToHtml in RelatedEntries,
//     but printed RAW in FrontierMembership, the frontiers page and stats. It
//     therefore cannot carry TeX either, and gets Unicode instead.
//
// verificationNote is left alone on purpose: its mathematics is Lean source
// being quoted (SimpleGraph.hasse, Fin d → ℤ, Iff.rfl, propext), and setting
// code as TeX would be wrong, not prettier.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { texToHtml } from "../src/components/TeX";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const SLUG =
  "absence-of-critical-bernoulli-bond-percolation-on-z-d-in-every-dimension-d-2";

const EDITS: Record<string, string> = {
  name: "Absence of critical Bernoulli bond percolation on $\\mathbb Z^d$ in every dimension $d \\ge 2$",

  // Unicode, not TeX: this string is printed raw in several places.
  shortName: "Critical percolation: θ(p_c) = 0",

  statement:
    "For nearest-neighbour Bernoulli bond percolation on $\\mathbb Z^d$, let $\\theta(p)$ be the probability that the open cluster of the origin is infinite, and let $p_c$ be the critical parameter. Is $\\theta(p_c) = 0$ for every integer $d \\ge 2$?",

  resultNote:
    "Claims $\\theta(p_c) = 0$ for every $d \\ge 2$, by proving Kozma-Nitzan Conjecture 3 and its reduction to critical percolation. The previously open dimensions $3 \\le d \\le 10$ are included. The formal statement concerns vanishing at $p_c$; continuity of $\\theta$ on the whole interval is a classical consequence rather than the formal target. No claim is intended concerning site percolation or other lattices.",
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
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const cols = Object.keys(EDITS)
    .map((c) => `"${c}"`)
    .join(", ");
  const [before] = await prisma.$queryRawUnsafe<Record<string, string>[]>(
    `SELECT ${cols} FROM "Problem" WHERE slug = $1`,
    SLUG,
  );
  if (!before) throw new Error(`not found on ${db}: ${SLUG}`);

  let bad = 0;
  for (const [k, v] of Object.entries(EDITS)) {
    const lim = LIMITS.get(k);
    const over = lim ? v.length > lim : false;
    console.log(
      `--- ${k}${lim ? `  ${v.length}/${lim}` : ""}${over ? "  OVER" : ""}`,
    );
    console.log(`  before: ${before[k]}`);
    console.log(`  after : ${v}`);
    if (over) bad++;

    // Every field that carries TeX must render without a KaTeX error, and the
    // formulas must actually be recognised as formulas. A silent
    // katex-error span is how a "$" typo ships.
    if (v.includes("$")) {
      const html = texToHtml(v);
      const spans = html.match(/class="katex"/g)?.length ?? 0;
      const err = html.includes("katex-error");
      console.log(`  katex : ${spans} formula(s)${err ? "  ERROR" : ""}`);
      if (err || spans === 0) bad++;
    } else if (/\^|_[a-z]|>=|<=/.test(v)) {
      console.log(
        "  note  : no TeX here by design (rendered raw or bold-only)",
      );
    }
    console.log();
  }
  if (bad) throw new Error(`${bad} problem(s) - nothing written`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.problem.update({
    where: { slug: SLUG },
    data: EDITS as never,
    select: { id: true },
  });
  console.log(
    "APPLIED. Public caches lag until the next deploy; the entry page is right immediately.",
  );
}

main().finally(() => prisma.$disconnect());
