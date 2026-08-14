// Review of ZestyWombat854's 4-color Rado submission, 14 Aug 2026.
//
// Submitted with the WRONG NAME AND SLUG - the form was pre-filled from
// their a >= 4 dihedral entry and never retitled, so the pending row is
// called "Dihedral Ramsey numbers of the alternating a-path..." while the
// content is entirely Rado. Renamed here, slug included: safe only because
// the entry is unpublished, so nothing links to it. Publishing under the
// accidental slug would have pinned a Rado entry to a dihedral URL forever.
//
// Verified here, independently of the repo's code:
//   - all 28 coloring certificates re-checked by an own-code scanner over
//     every monochromatic triple: 28/28 valid, so every lower bound holds;
//   - five base cells (c = 0, 2, 3, 4, 5) fully re-solved with an own
//     encoder (own layout, own sound color-precedence symmetry breaking):
//     SAT at n-1, UNSAT at n, matching R(0)=45 and 40c+41 exactly
//     (c = 1, 6, 10 were still solving at review; note says what landed);
//   - the scaling lemma, sharpness argument, synthesis theorem and
//     prime-reduction corollary verified by hand - the algebra is elementary
//     and correct, including the strong induction's case split;
//   - the literature verified: ABEMRS16 exists with the exact bibliographic
//     data (Math. Comp. 85, 2047-2064, doi:10.1090/mcom3034, crossref);
//     Myers' Conjecture 4.9 found VERBATIM in the Rutgers thesis PDF
//     ("The 4-color Rado number R4(x+y+c=z) with c >= 2 is 40c+41");
//     Malo's thesis is real (Open Prairie etd2/760 - South Dakota State,
//     not San Diego as the repo says) with the R(1..3) values in its
//     abstract, and its full text is bot-gated, so the submitter's hedge
//     is accurate and unresolvable from here too;
//   - the claimed absence of 2016-2026 overlap spot-checked: the active
//     2026 x+y+c=z papers are two-color off-diagonal, as they said.
//
// One axis correction: Resolved -> Partial. The entry's problem is Myers
// 4.9 / ABEMRS16 section 5.5, and that conjecture remains open (smallest
// open case c = 88); two thirds of cases plus a reduction to primes is a
// partial resolution by the site's own definition.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const OLD_SLUG = "dihedral-ramsey-numbers-of-the-alternating-a-path-versus-k-b-for-every-a-4-1-a-1-2";
const NEW_SLUG = "four-color-rado-number-of-x-y-c-z-40c-41";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Name",
    key: "name",
    value: "The 4-Color Rado Number of $x+y+c=z$: $R(c)=40c+41$ Whenever $c+1$ Is Divisible by 3, 4, 5 or 7",
  },
  { field: "Short name", key: "shortName", value: "4-color Rado R(c)=40c+41, 66% of cases" },
  { field: "Status", key: "resolution", value: "partial" },
  { field: "Publication", key: "publication", value: "announcement" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced in substance by this site on 14 August 2026, independently of the repo's code. All 28 coloring certificates were re-checked by an own-code scanner over every monochromatic triple: 28/28 valid, so every lower bound holds outright. Five base cells were fully re-solved with an independently written encoder (own variable layout, own symmetry breaking): satisfiable at $n-1$ and unsatisfiable at $n$ for $c = 0, 2, 3, 4, 5$, matching $R(0)=45$ and the $40c+41$ line exactly. The scaling lemma, its sharpness against the universal lower bound, the synthesis theorem and the prime-reduction corollary were verified by hand; the algebra is elementary and correct. The literature was verified independently: ABEMRS16 is Math. Comp. 85 (2016) 2047-2064 with exactly the claimed authors; Myers' Conjecture 4.9 appears verbatim in the Rutgers thesis; Malo's 2000 thesis is real (Open Prairie, South Dakota State) with $R(1..3)$ in its public abstract, and its full text is bot-gated - so the submitter's hedge about the scaling lemma possibly being Malo's is accurate and could not be resolved from here either. The 2026 papers on this equation were spot-checked and are two-color, as claimed. Not reproduced: the nineteen prime-case UNSAT certificates ($n$ up to 3321), which rest on the bundle's kissat DRAT proofs, drat-trim VERIFIED, with a second independent encoder agreeing on every instance both ran; and no human peer review exists - produced and refereed by AI agents in one pipeline.",
  },
  { field: "Significance", key: "significance", value: 8 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A ten-year-old conjecture with real standing - posed independently in a Math. Comp. paper and a Rutgers thesis, in the Schur/Rado tradition - advanced to two thirds of all cases with a clean reduction of the remainder to primes. Specialist territory, and the conjecture itself stays open, which caps it: level with the a >= 4 dihedral theorem (8), above the finite-cell bundles (5), below the Erdos entries at 10.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Posed twice independently: Myers' Rutgers thesis (2015, Conjecture 4.9) and ABEMRS16 (Math. Comp. 85, submitted 2014), whose section 5.5 asks it for c >= 7. Malo's 2000 masters thesis had already settled two of the four congruence classes per its abstract - a fragmentation across three mutually unaware sources that this entry is the first to close.",
  },
];

const LINKS = [
  {
    label: "ABEMRS16, On the n-color Rado number for x_1+...+x_k+c = x_{k+1} (Math. Comp. 85, section 5.5 poses the conjecture)",
    url: "https://doi.org/10.1090/mcom3034",
    kind: "problem-record",
  },
  {
    label: "Myers, Computational Advances in Rado Numbers (Rutgers Ph.D. thesis, 2015) - Conjecture 4.9",
    url: "https://sites.math.rutgers.edu/~zeilberg/Theses/KellenMyersThesis.pdf",
    kind: "problem-record",
  },
  {
    label: "Malo, Four Color Rado Numbers for x_1+x_2+c=x_3 (South Dakota State M.S. thesis, 2000)",
    url: "https://openprairie.sdstate.edu/etd2/760/",
    kind: "problem-record",
  },
];

const MESSAGE = `Published, with a rename you should double-check me on, one axis moved, and your hedges all verified as accurate.

The rename: your submission came in titled "Dihedral Ramsey numbers of the alternating a-path versus K_b..." - the form was pre-filled from your previous entry and the title never changed. The content is entirely Rado, so it now carries a Rado name and slug. Renaming the slug is normally forbidden, but a pending entry has no inbound links, and publishing a Rado result at a dihedral URL would have been worse.

The axis: Resolved to Partial. The entry's problem is Myers 4.9 / ABEMRS16 section 5.5, and that conjecture is still open - c = 88 is sitting right there. Two thirds of cases plus the prime reduction is a partial resolution by the site's definition, and an honest Partial reads better than an overstated Resolved.

What I verified independently: all 28 coloring certificates re-checked with my own scanner (28/28 valid); five base cells fully re-solved with my own encoder in both directions, matching your values exactly; the lemma, sharpness, synthesis theorem and prime-reduction corollary checked by hand - the induction's case split is correct; ABEMRS16 confirmed via Crossref with exact bibliographic data; Myers' Conjecture 4.9 found verbatim in the thesis PDF; and Malo is real, at South Dakota State (your repo says San Diego - worth fixing), with the full text bot-gated exactly as you said. The 2026 papers on this equation are two-color, as your sweep claimed.

Also moved Publication to Announcement (same reasoning as your 19-values bundle: a repo with a markdown write-up is not a manuscript), and set significance 8 - a ten-year-old conjecture with real standing, advanced but not closed.

Four submissions, four different problem classes, every hedge accurate so far. The clean-room provenance claims I cannot check from outside, and the note says so - but the mathematics keeps surviving contact, which is the part I can check.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: OLD_SLUG }, include: { links: true } });
  if (!p) throw new Error(`no problem ${OLD_SLUG}`);
  if (p.status !== "pending") throw new Error(`${OLD_SLUG} is ${p.status}, not pending`);
  const clash = await prisma.problem.findUnique({ where: { slug: NEW_SLUG } });
  if (clash) throw new Error(`slug ${NEW_SLUG} already taken`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = { slug: NEW_SLUG };
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [
    { field: "URL slug", oldValue: OLD_SLUG, newValue: NEW_SLUG },
  ];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const limit = LIMITS.get(e.key);
    if (limit && typeof e.value === "string" && e.value.length > limit) {
      console.log(`  ${e.key} OVER BY ${e.value.length - limit} (${e.value.length}/${limit})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${OLD_SLUG}\n  -> ${NEW_SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 85 ? `${s.slice(0, 85)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: ai=${p.aiContribution}, method=${p.resolutionMethod}, yearPosed=${p.yearPosed}`);
  console.log(`  message: ${MESSAGE.length} chars (max ${MESSAGE_MAX})`);
  if (MESSAGE.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "approved",
      },
    }),
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "decision",
              reason: "edited",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
