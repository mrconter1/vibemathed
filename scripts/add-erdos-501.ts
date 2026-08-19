// Erdős Problem #501, the first entry to use solveType "independent".
//
// Checked rather than taken from the announcement:
//
// * The new mathematics is real, so this is not an out-of-scope formalization
//   of known work. Hechler (1972) had the CH counterexample and NPS (1987) the
//   closed case; Sungchul Lee had a positive answer from a real-valued
//   measurable cardinal. What was missing was dropping the large cardinal, and
//   that is the part credited to Glazer and Sol in 2026.
//
// * The artifact holds up. CI green at 12:09 today; Solution.lean has no sorry
//   and no axiom declarations; the only sorries in the repo are the deliberate
//   placeholders in the two Challenge statement files (8 in Challenge.lean),
//   which is the comparator convention. The repo's own audit records every
//   target depending on propext, Classical.choice and Quot.sound alone, with
//   no native_decide.
//
// * The anchoring was verified here, not trusted. The README claims the
//   sentence is "verbatim the proposition of google-deepmind/formal-
//   conjectures". Reading both: erdos501_sentence_faithful uses
//   Bornology.IsBounded (A x), volume.toOuterMeasure (A x) < 1 and
//   X.Pairwise (fun x y => x ∉ A y), and FormalConjectures/ErdosProblems/
//   501.lean states erdos_501 with those same three predicates in the same
//   shape. That is a community-reviewed repository pinning the statement,
//   which is exactly what the methodology asks of the top rung, so this goes
//   in lean-verified rather than lean-checked.
//
// Tier is ai-co-developed, not ai-discovered, and the README is the reason:
// Glazer calls the remaining step "routine" transfer by "standard technology",
// the surrounding results are human, and Sol is a co-author of that step
// rather than the source of the whole argument.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient, type Prisma } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "erdos-501-infinite-independent-sets";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const FIELDS: Record<string, unknown> = {
  name: "Erdős Problem #501: infinite independent sets for families of small outer measure",
  shortName: "Erdős #501",
  problemNumber: 501,
  fieldGroup: "Logic & foundations",
  field: "Set theory / forcing",
  statement:
    "For every $x \\in \\mathbb{R}$ let $A_x \\subset \\mathbb{R}$ be a bounded set of Lebesgue outer measure $< 1$. Must there be an infinite independent set, that is an infinite $X \\subseteq \\mathbb{R}$ with $x \\notin A_y$ for all distinct $x, y \\in X$?\n\nErdős and Hajnal proved that arbitrarily large finite independent sets exist. Hechler showed in 1972 that the answer is no under the continuum hypothesis, so any positive answer had to come from a model where CH fails, and Sungchul Lee later derived one from a real-valued measurable cardinal.\n\nThe answer is that neither side is provable. Dropping Lee's large cardinal by transferring his argument to the extension of a model of CH by random reals gives a model where the answer is yes; Hechler's construction gives one where it is no. The question is independent of ZFC.",
  posedBy: "Paul Erdős",
  yearPosed: 1961,
  solveType: "independent",
  resolution: "resolved",
  resolutionMethod: "argument",
  solveDate: "2026-08-19",
  model: "Sol, Claude",
  modelMaker: "OpenAI, Anthropic",
  humanCollaborators: ["Elliot Glazer"],
  aiRole:
    "The formalization's metadata lists two authors, Elliot Glazer and Sol, and Glazer credits \"Sol and Claude\" for the work. The step they share is the one that was actually missing: transferring Sungchul Lee's real-valued-measurable argument to the extension of a model of CH by $\\mathfrak{c}^+$ random reals, which removes the large-cardinal hypothesis and leaves a positive answer consistent with ZFC.\n\nCo-developed rather than discovered, on the author's own framing. The README describes that transfer as \"routine\" for $\\Pi^2_1$ consequences and as \"applying that standard technology\", and the surrounding pieces are human: Hechler's 1972 counterexample, the Newelski-Pawlikowski-Seredynski closed case, Lee's relative result (itself assisted by GPT-5.5 Pro) and Nat Sothanaphan's observation that the two halves give independence.",
  verification: "lean-verified",
  verificationNote:
    "Both halves of the top rung are present, and both were checked here rather than taken from the announcement.\n\nKernel side: CI was green at the audited commit, Solution.lean contains no sorry and declares no axioms, and the only sorries in the repository are the deliberate placeholders in the two Challenge statement files, which is how a comparator challenge is meant to look. The repo ships an axiom audit recording every one of the seven targets as depending on propext, Classical.choice and Quot.sound alone, with no native_decide and no project axioms.\n\nStatement side: the development proves erdos501_sentence_faithful, that its sentence is equivalent in Mathlib's ZFSet to the Mathlib statement of the first question. That claim was checked against the source rather than believed: the target uses Bornology.IsBounded (A x), volume.toOuterMeasure (A x) < 1 and X.Pairwise (fun x y => x ∉ A y), and FormalConjectures/ErdosProblems/501.lean states erdos_501 with the same three predicates in the same shape. Formal Conjectures is a community-reviewed repository, so the statement is anchored outside the proof's own authors.\n\nThe independence itself is stated semantically, as the existence of models of ZFC on both sides, and restated a second time in proof-theoretic terms via a Lean port of Flypitch.",
  significance: 14,
  significanceNote:
    "A numbered Erdős problem with a denser trail than most: posed in 1961, restated as Problem 38 of Erdős and Hajnal's 1971 survey, then attacked by Hechler in 1972, Newelski-Pawlikowski-Seredynski in 1987 and Sungchul Lee more recently. Above the anchor at 10 for a typical numbered problem on that trail, and below Erdős #1196 at 15. Scored on the problem as it stood, so the fact that its resolution is the first formally verified independence result for an Erdős problem does not count toward it.",
  resultNote:
    "Independent of ZFC, which is why this entry is the first to carry that result rather than proved or disproved. Both directions are formalized: Hechler's 1972 construction gives a model where the answer is no, and adding $\\mathfrak{c}^+$ random reals over a model of CH gives one where it is yes.\n\nThe credit is shared and mostly human. Newelski, Pawlikowski and Seredynski settled the problem's second question in 1987, and it is formalized here without the boundedness hypothesis. Hechler supplied one direction in 1972. Sungchul Lee derived a positive answer from a real-valued measurable cardinal, assisted by GPT-5.5 Pro, and Nat Sothanaphan observed that the two halves together give independence. What Glazer and Sol added is the removal of the large cardinal.\n\nerdosproblems.com still lists #501 as open at the time of writing.",
  publication: "announcement",
  sourceUrl: "https://github.com/ElliotGlazer/erdos501",
  sourceName: "Erdős Problem #501 in Lean 4: the closed case and the independence of the first question",
  renownLangs: 0,
};

const LINKS = [
  {
    label: "The Lean 4 development, laid out as a comparator challenge",
    url: "https://github.com/ElliotGlazer/erdos501",
    kind: "lean-proof",
  },
  {
    label: "Palomar registry listing",
    url: "https://palomar-registry.org/entry?id=PALOMAR-2026-08-19-000002&version=1",
    kind: "palomar",
  },
  {
    label: "Formal Conjectures: the upstream statement the faithfulness target is checked against",
    url: "https://github.com/google-deepmind/formal-conjectures/blob/main/FormalConjectures/ErdosProblems/501.lean",
    kind: "lean-statement",
  },
  {
    label: "erdosproblems.com #501 - still listed open",
    url: "https://www.erdosproblems.com/501",
    kind: "problem-record",
  },
  {
    label: "Forum thread: Lee's relative result, Sothanaphan's observation, the random-real transfer",
    url: "https://www.erdosproblems.com/forum/thread/501",
    kind: "discussion",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");
  if (await prisma.problem.findUnique({ where: { slug: SLUG } })) throw new Error(`${SLUG} exists`);

  let bad = 0;
  for (const [key, value] of Object.entries(FIELDS)) {
    const lim = LIMITS.get(key);
    if (lim && typeof value === "string" && value.length > lim) {
      console.log(`  ${key} OVER BY ${value.length - lim} (${value.length}/${lim})`);
      bad++;
    }
  }
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}: ${l.label}`);
      bad++;
    }
  }

  console.log(`new entry: ${SLUG}\n`);
  for (const [key, value] of Object.entries(FIELDS)) {
    const s = value === null ? "(null)" : String(value);
    console.log(`  ${key}: ${s.length > 100 ? `${s.slice(0, 100)}...` : s}`);
  }
  console.log(`\n  links: ${LINKS.length}`);
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const data = {
    slug: SLUG,
    ...FIELDS,
    status: "published",
    reviewedAt: new Date(),
    links: { create: LINKS.map((l, position) => ({ ...l, position })) },
  } as unknown as Prisma.ProblemCreateInput;

  const created = await prisma.problem.create({ data });
  await prisma.problemActivity.create({
    data: { problemId: created.id, userId: admin.id, userName: admin.pseudonym ?? null, type: "approved" },
  });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${SLUG} created, ${published} published`);
}

main().finally(() => prisma.$disconnect());
