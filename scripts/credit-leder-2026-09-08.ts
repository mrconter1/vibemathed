// Replaces the submitter's paraphrase of the AI role on the percolation entry
// with the repository's own words, and records the disclosed wall time.
//
// This started as "credit the directing human", which turned out to be
// unnecessary: humanCollaborators already reads ["Justin Leder"], supplied by
// the submitter. What is left is precision of attribution rather than the
// presence of it.
//
// The name and the role were checked against three first-party places in
// anthropics/formal-math at the pinned commit rather than taken from the
// submitter, who is an anonymous account:
//
//   NOTICE            "Responsible author and maintainer: Justin Leder. The
//                     Lean sources in this repository were written by an AI
//                     system (Anthropic's Claude models) working autonomously
//                     under his direction."
//   README.md         "Author. Justin Leder (@jleder3)."
//   formalization.yaml the human-role and prompting-notes blocks quoted below.
//
// Also adds the repository's own guide to the proof as a link. Its README
// calls summary.pdf "the guide to the proof" and warns that the library
// docstrings "were machine-written as working notes... they are not an
// exposition", so pointing a reader at the summary rather than at the sources
// is the useful thing to do.
//
// ageNote records the wall time, because a problem open since 1960 in the hard
// dimensions and closed in about a week of compute is the fact a reader will
// want, and it is disclosed in the repository rather than inferred.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { Prisma, PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { texToHtml } from "../src/components/TeX";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const SLUG =
  "absence-of-critical-bernoulli-bond-percolation-on-z-d-in-every-dimension-d-2";
const PIN = "795efb86f191735c5481675763537cfb4ff37e55";
const BASE = `https://github.com/anthropics/formal-math/blob/${PIN}/percolation`;

const EDITS: Record<string, unknown> = {
  aiRole:
    'The repository\'s own provenance section: the Lean sources, "definitions, statements and proofs, together with Challenge.lean, Solution.lean and the metadata", "were written by an AI system (Anthropic\'s Claude models) working autonomously under the direction of Justin Leder; no human wrote or edited the Lean code." Its formalization.yaml records the split: "Discovery, informal proof and Lean formalization were all produced by the AI system operating autonomously. Human role (Justin Leder): problem selection, direction, reading of the statement file and metadata, and responsibility for this submission", the author having "posed the problem, set the acceptance standard (kernel-checked proof with the standard axioms, plus adversarial review of the statements) and directed priorities." The same file states that the only review so far was by AI systems, adversarial reads of the formal statements and of the proof chain against the cited literature, and the README asks readers to satisfy themselves that Challenge.lean states the intended theorem rather than relying on the kernel for that - which is the audit recorded under verification here.',

  ageNote:
    "The repository discloses about one week of wall time in August 2026, on cloud CPU machines for Lean elaboration plus API inference, with spend not tracked. The problem it closes had been open in dimensions 3 to 10 since Harris settled the planar case in 1960.",
};

const LINKS = [
  {
    label: "summary.pdf: the repository's own guide to the proof",
    url: `${BASE}/summary.pdf`,
    kind: "paper",
  },
  {
    label: "formalization.yaml: provenance, cost and disclosed divergences",
    url: `${BASE}/formalization.yaml`,
    kind: "other",
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

  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: {
      id: true,
      status: true,
      humanCollaborators: true,
      aiRole: true,
      ageNote: true,
      _count: { select: { links: true } },
    },
  });
  if (!cur) throw new Error(`not found on ${db}: ${SLUG}`);
  console.log(`status: ${cur.status}`);
  console.log(
    `humanCollaborators before: ${JSON.stringify(cur.humanCollaborators)}`,
  );
  console.log(`ageNote before           : ${cur.ageNote ?? "(empty)"}`);
  console.log(`aiRole before            : ${cur.aiRole?.slice(0, 90)}...\n`);

  let bad = 0;
  for (const [k, v] of Object.entries(EDITS)) {
    const lim = LIMITS.get(k);
    if (typeof v === "string" && lim) {
      const over = v.length > lim;
      console.log(
        `  ${k.padEnd(19)}: ${v.length}/${lim}${over ? "  OVER" : ""}`,
      );
      if (over) bad++;
      // aiRole and ageNote both render through <TeX>, so a stray "$" would
      // either swallow prose or produce a katex-error span.
      if (v.includes("$")) {
        const html = texToHtml(v);
        if (html.includes("katex-error")) {
          console.log("      katex-error");
          bad++;
        }
      }
    } else {
      console.log(`  ${k.padEnd(19)}: ${JSON.stringify(v)}`);
    }
  }
  for (const l of LINKS) {
    console.log(
      `  link               : ${l.label.length}/${LINK_LABEL_MAX}  ${l.kind}`,
    );
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  if (bad) throw new Error(`${bad} problem(s) - nothing written`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const n = cur._count.links;
  await prisma.problem.update({
    where: { id: cur.id },
    data: {
      ...EDITS,
      links: { create: LINKS.map((l, i) => ({ ...l, position: n + i })) },
    } as unknown as Prisma.ProblemUpdateInput,
    select: { id: true },
  });
  console.log(
    "APPLIED. The entry page is cached under problem-<slug> with cacheLife hours, so the public page catches up within an hour or on the next deploy.",
  );
}

main().finally(() => prisma.$disconnect());
