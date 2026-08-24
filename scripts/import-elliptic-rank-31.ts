// The rank >= 31 elliptic curve, from the ICARM rank leaderboard - the same
// project's own rank >= 30 record (elliptic-curve-rank-record-thirty),
// superseded three days later.
//
// A new entry, not an edit of the sibling: this catalog's precedent for a
// record beaten by a follow-up result is a fresh entry related back
// ("continues"), as with the dihedral Ramsey a>=4 slice against its a=3
// sibling, not a silent rewrite of the old numbers. The sibling entry gets a
// short addition noting it has been superseded, mirroring that same
// precedent's own cross-reference.
//
// Independently verified here (see scripts, not committed - the checks: all
// 31 points satisfy the curve equation exactly (rational, not floating-point,
// arithmetic, handling the fractional-coordinate points), all 31 distinct,
// the discriminant recomputed from the a-invariants matches the published
// value exactly, and all 20 listed bad primes divide it and multiply out to
// account for the WHOLE discriminant with nothing left over, each of them a
// probable prime under Miller-Rabin. What is asserted but not independently
// checked, same as the sibling entry: that the 31 points are independent in
// E(Q) modulo torsion (the leaderboard's stated site-wide practice is exact
// 2-descent, no floating point in the decision - not reproduced here), and
// that GRH+BSD pin the rank at exactly 31 rather than merely bounding it from
// below (the submitter's own commentary asserts this; unlike the sibling
// record, no announcement article or numeric derivation - a Bober-bound delta,
// a root number - has been published for this specific curve, so none is
// invented here).
//
// The disclosure is thinner even than the sibling's: "found by Claude, Levent
// Alpöge, and Ava Howell" is the entire attribution, with no comment from a
// third party this time. Classified the same as the sibling regardless,
// ai-co-developed, since the underlying evidence quality has not changed.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { RELATION_NOTE_MAX } from "../src/lib/relation-kinds";

// Not covered by EDITABLE_FIELDS/CURATOR_FIELDS (those are Problem columns):
// ProblemLink.label is @db.String(120), ProblemRelation.note is
// @db.String(200) - a lesson from the Haglund review script, which failed at
// the driver on exactly this gap.
const LINK_LABEL_MAX = 120;

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "elliptic-curve-rank-record-thirty-one";
const SIBLING_SLUG = "elliptic-curve-rank-record-thirty";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const FIELDS: Record<string, unknown> = {
  name: "A Rank-$31$ Record for an Elliptic Curve over $\\mathbb{Q}$",
  shortName: "Elliptic curve rank record (31)",
  fieldGroup: "Number theory",
  field: "Elliptic curves",
  statement:
    "How large can the Mordell-Weil rank of an elliptic curve over $\\mathbb{Q}$ be? Whether ranks are unbounded is open, and progress is measured by explicit records, tabulated by Dujella: rank $\\ge 28$ from 2006, raised to $\\ge 29$ by Elkies and Klagsbrun in 2024, and to $\\ge 30$ three days before this one by the same team (see the related entry). Now $\\ge 31$, witnessed by an explicit curve $y^2 + xy + y = x^3 + x^2 + a_4 x + a_6$ with $a_4$ of 67 digits and $a_6$ of 99, carrying thirty-one independent rational points.",
  posedBy: "Classical; rank records tabulated by Andrej Dujella",
  yearPosed: null,
  solveType: "proved",
  resolution: "partial",
  resolutionMethod: "construction",
  solveDate: "2026-08-23",
  model: "Claude",
  modelMaker: "Anthropic",
  humanCollaborators: ["Levent Alpöge", "Ava Howell"],
  aiRole:
    "The credit, in full, is the leaderboard's own commentary field on this entry: \"BSD + GRH certified to rank 31, found by Claude, Levent Alpöge, and Ava Howell.\" No paper, no third-party comment of the kind the sibling record drew, no statement of division of labour, no account of what the model searched or proposed. Thinner disclosure than the sibling entry, which is already the weakest provenance in this catalog; classified the same regardless, since the evidence quality has not changed, only its brevity.",
  aiContribution: "ai-co-developed",
  verification: "unreviewed",
  verificationNote:
    "Recomputed by this site on 24 August 2026 from the leaderboard's own JSON, in exact rational arithmetic: all 31 witness points satisfy the curve equation with residual exactly zero (nine carry fractional coordinates, handled exactly rather than as floating point), all 31 are pairwise distinct, and the discriminant recomputed from the a-invariants matches the published value exactly. All 20 listed bad primes divide that discriminant and multiply out to account for the whole of it with nothing left over, and each passed a Miller-Rabin probable-primality check, including the 80-digit one. What was NOT checked, same limitation as the sibling entry: that the 31 points are independent in $E(\\mathbb{Q})$ modulo torsion. The leaderboard states its site-wide practice is exact 2-descent with no floating point in the decision; that computation was not reproduced. Also unlike the sibling entry, no announcement article or public numeric derivation of the GRH+BSD argument (a Bober-bound $\\Delta$, a root number) exists for this specific curve at time of writing - the \"exactly 31\" claim rests on the submitters' commentary alone.",
  significance: 50,
  significanceNote:
    "The next rung of the same ladder as the sibling entry (Elliptic curve rank record, at 50): the record advanced roughly once a decade until 2024, and has now moved twice in three days from the same source, but the problem's weight - whether ranks are unbounded, tied to BSD - has not changed since the sibling entry was assessed, so the score has not either.",
  resultNote:
    "Two tiers, and only the first is the record. Rank $\\ge 31$ is unconditional: 31 explicit points, independence asserted via the leaderboard's stated general practice of exact 2-descent (not reproduced here - see the verification note). Rank exactly 31 is conditional on GRH and BSD, per the submitters' commentary, in the same style as the sibling record's Bober-bound argument; no numeric derivation has been published for this curve specifically. The entry is a partial result because the open question - whether ranks are unbounded at all - remains unanswered by any single record.",
  publication: "announcement",
  sourceUrl: "https://elliptic-rank.icarm.cloud/curve/302",
  sourceName: "Elliptic Curve Rank Leaderboard, curve #302",
  renownLangs: 0,
};

const LINKS = [
  { label: "Curve data as JSON, including all thirty-one witness points", url: "https://elliptic-rank.icarm.cloud/curve/302.json", kind: "code" },
  { label: "Dujella's history of elliptic curve rank records", url: "https://web.math.pmf.unizg.hr/~duje/tors/rankhist.html", kind: "problem-record" },
  { label: "Bober, conditionally bounding analytic ranks", url: "https://arxiv.org/abs/1112.1503", kind: "paper" },
];

const RELATION = {
  kind: "continues",
  note: "The same team's own rank >= 30 record, superseded three days later. Together they show the ladder moving twice in under a week after moving only once between 2006 and 2024.",
};

// The sibling entry's own note gets one added sentence marking it superseded,
// mirroring how the dihedral a=3 entry was updated when its a>=4 sibling
// closed the wider claim.
const SIBLING_APPEND =
  " Superseded three days later by this project's own rank $\\ge 31$ record (see the related entry); left unedited otherwise as a record of what was known at the time.";

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  let bad = 0;
  for (const [k, v] of Object.entries(FIELDS)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      console.log(`  ${k} OVER BY ${v.length - lim} (${v.length}/${lim})`);
      bad++;
    }
  }

  const existing = await prisma.problem.findUnique({ where: { slug: SLUG } });
  const sibling = await prisma.problem.findUnique({
    where: { slug: SIBLING_SLUG },
    select: { id: true, resultNote: true },
  });
  if (!sibling) throw new Error("sibling entry not found");

  const newSiblingNote = (sibling.resultNote ?? "") + SIBLING_APPEND;
  const siblingLimit = LIMITS.get("resultNote");
  if (siblingLimit && newSiblingNote.length > siblingLimit) {
    console.log(`  sibling resultNote OVER BY ${newSiblingNote.length - siblingLimit}`);
    bad++;
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) {
      console.log(`  LINK LABEL OVER BY ${l.label.length - LINK_LABEL_MAX}: ${l.label}`);
      bad++;
    }
  }
  console.log(`  relation note: ${RELATION.note.length}/${RELATION_NOTE_MAX}`);
  if (RELATION.note.length > RELATION_NOTE_MAX) {
    console.log(`  RELATION NOTE OVER BY ${RELATION.note.length - RELATION_NOTE_MAX}`);
    bad++;
  }

  console.log(`### ${SLUG}${existing ? "  (EXISTS - skip)" : ""}`);
  console.log(`    ${FIELDS.name}`);
  console.log(
    `    ${FIELDS.solveType}/${FIELDS.resolution}  sig=${FIELDS.significance}  ` +
    `ai=${FIELDS.aiContribution}  ver=${FIELDS.verification}  ` +
    `method=${FIELDS.resolutionMethod}  pub=${FIELDS.publication}`,
  );
  console.log(`    ${LINKS.length} links, 1 relation to ${SIBLING_SLUG}`);
  console.log(`    sibling note: +${SIBLING_APPEND.length} chars (${newSiblingNote.length}/${siblingLimit})`);

  if (bad) throw new Error("limits exceeded");
  if (existing) return;
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.create({
      data: {
        slug: SLUG,
        ...(FIELDS as object),
        status: "published",
        links: { create: LINKS.map((l, position) => ({ ...l, position })) },
        relationsFrom: {
          create: [{ toId: sibling.id, kind: RELATION.kind, note: RELATION.note, position: 0 }],
        },
      } as never,
    }),
    prisma.problemActivity.create({
      data: {
        problem: { connect: { slug: SLUG } },
        user: { connect: { id: admin.id } },
        userName: admin.pseudonym ?? null,
        type: "created",
      },
    }),
    prisma.problem.update({
      where: { id: sibling.id },
      data: { resultNote: newSiblingNote },
    }),
    prisma.problemActivity.create({
      data: {
        problem: { connect: { slug: SIBLING_SLUG } },
        user: { connect: { id: admin.id } },
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "What was actually shown",
        oldValue: sibling.resultNote,
        newValue: newSiblingNote,
      },
    }),
  ]);
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`    CREATED - ${published} published`);
}

main().finally(() => prisma.$disconnect());
