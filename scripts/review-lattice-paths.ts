// Review of GoldenMongoose827's Gerver-Ramsey lattice-path submission,
// 17 Aug 2026.
//
// Verified against the paper's LaTeX (arXiv:2607.02832, Korsky, 2 July):
//   - the abstract matches the entry, with one honest simplification: the
//     paper's upper bound is exp((2/e + o(1))(k-1)^2), which the entry
//     rounds to exp(O(k^2));
//   - the AI acknowledgement is verbatim - but the entry's quote of it
//     DROPPED its most important sentence, "The main construction ideas...
//     were due to the author". That sentence is what pins the tier, so it
//     goes back in;
//   - the model's named contribution is traceable in the text: using the two
//     Farey neighbours of order k-1 with their mediant improves the density
//     increment from (1/8-o(1))(k-1)^-2 to (1/4-o(1))(k-1)^-2, which is what
//     yields the 2/e constant. So it improved the CONSTANT inside the k^2
//     bound, not the exponent - ai-assisted is exactly right, as submitted.
//
// The bibliography also raises the problem's standing above what the entry
// claimed: it is a named problem ("the Gerver-Ramsey collinearity problem",
// Lidbetter 2024), catalogued in Brass-Moser-Pach's Research Problems in
// Discrete Geometry, with work as recent as 2026 (Barnoff-Bright, Adv. Appl.
// Math.). Scored at 15 rather than the numbered-problem band.
//
// Also fixes the statement's \[ ... \] display math: this site's renderer
// splits on $ and $$ only (src/components/TeX.tsx), so bracket delimiters
// render as literal backslash-bracket. Nothing on the site would have shown
// those two displayed formulas.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "north-east-lattice-paths-with-few-collinear-vertices";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "Let $A(k)$ be the largest possible number of moves in a north-east lattice path whose visited vertices contain no $k$ collinear points. Gerver (1979) and Gerver and Ramsey (1979) bounded $A(k)$ by\n$$\\exp\\left(\\Omega\\left(\\log(k)^2\\right)\\right) \\le A(k) \\le \\exp\\left(O\\left(k^4\\right)\\right),$$\nand determining the true growth rate has been open since. Both bounds are improved to\n$$\\exp\\left(\\Omega\\left(k^{1/3}\\right)\\right) \\le A(k) \\le \\exp\\left(O\\left(k^2\\right)\\right),$$\nwith the upper bound proved in the sharper form $\\exp\\left(\\left(\\tfrac{2}{e}+o(1)\\right)(k-1)^2\\right)$.",
  },
  { field: "Field detail", key: "field", value: "Discrete geometry - lattice paths" },
  { field: "Posed by", key: "posedBy", value: "Joseph L. Gerver, L. Thomas Ramsey" },
  { field: "Source name", key: "sourceName", value: "North-East Lattice Paths with Few Collinear Vertices (arXiv)" },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      "The acknowledgement in full: the author was assisted by GPT-5.5 Pro in preparing the paper, but \"the main construction ideas, including the dyadic-interval random variables in the lower bound and the density-increment framework in the upper bound, were due to the author\". AI tools checked computations, assisted with drafting, and improved the upper-bound constant by suggesting the use of the mediant of the relevant Farey fractions. That last contribution is traceable in the text: it lifts the density increment from $(1/8-o(1))(k-1)^{-2}$ to $(1/4-o(1))(k-1)^{-2}$, which is what produces the $2/e$ constant. So the model sharpened the constant inside the new upper bound rather than the exponent, which is the lower tier by this site's definition.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Checked by this site on 17 August 2026 against the paper's LaTeX (arXiv:2607.02832, Korsky, 2 July 2026). The abstract matches this entry, and the acknowledgement is verbatim as the AI-role note now quotes it - including the sentence attributing the main construction ideas to the author, which the submission's quote had omitted. The model's named contribution was traced through the text to the density-increment step it actually improves. The prior bounds attribute correctly: Gerver, Pacific J. Math. 83 (1979) 349-355, and Gerver-Ramsey, same volume, 357-363. The proofs themselves - a dyadic slope-field random construction and a Farey-mediant density increment - were not checked here and need a discrete geometer. Unrefereed preprint, no independent review.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Both bounds move, and the gap stays enormous: the lower bound rises from $\\exp(\\Omega(\\log^2 k))$ to $\\exp(\\Omega(k^{1/3}))$ and the upper falls from $\\exp(O(k^4))$ to $\\exp(O(k^2))$, so $A(k)$ is still undetermined between an exponent of $k^{1/3}$ and one of $k^2$. The paper's own closing discussion argues its lower-bound construction is near the limit of the method and that beating it needs additional randomness, a sharper line-counting step, or a different model entirely.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Posed in a pair of 1979 Pacific J. Math. papers by Gerver and by Gerver and Ramsey, and catalogued in Brass, Moser and Pach's Research Problems in Discrete Geometry. Open 47 years, with the bounds improved by Lidbetter in 2024 and the small cases attacked by SAT solvers by Barnoff and Bright in 2026.",
  },
  { field: "Significance", key: "significance", value: 15 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named problem - the Gerver-Ramsey collinearity problem - from two 1979 Pacific J. Math. papers, catalogued in Brass-Moser-Pach's standard problem book and still drawing work in 2024 and 2026. Forty-seven years open with a genuine literature, but firmly inside discrete geometry: the named specialist band at 15.",
  },
];

const LINKS = [
  {
    label: "Gerver, Long walks in the plane with few collinear points (Pacific J. Math. 83, 1979)",
    url: "https://doi.org/10.2140/pjm.1979.83.349",
    kind: "problem-record",
  },
  {
    label: "Gerver and Ramsey, On certain sequences of lattice points (Pacific J. Math. 83, 1979)",
    url: "https://doi.org/10.2140/pjm.1979.83.357",
    kind: "problem-record",
  },
  {
    label: "Lidbetter, Improved bound for the Gerver-Ramsey collinearity problem (Discrete Math., 2024)",
    url: "https://doi.org/10.1016/j.disc.2023.113718",
    kind: "paper",
  },
  {
    label: "Barnoff and Bright, North-East lattice paths avoiding k collinear points via satisfiability (2026)",
    url: "https://doi.org/10.1016/j.aam.2026.103112",
    kind: "paper",
  },
];

const MESSAGE = `Published as Partial, significance 15, with your axes kept and three things fixed.

Your ai-assisted call is right, and I traced why rather than taking it on trust: the acknowledgement's named model contribution is the Farey-mediant suggestion, and following it into the text, it lifts the density increment from (1/8-o(1))(k-1)^-2 to (1/4-o(1))(k-1)^-2, which is what produces the 2/e constant. So the model sharpened the constant inside your new upper bound, not the exponent. Exactly the lower tier.

One thing to correct though: your quote of the acknowledgement dropped its most important sentence, "The main construction ideas, including the dyadic-interval random variables in the lower bound and the density-increment framework in the upper bound, were due to the author." That sentence is the one that justifies the tier you picked, so leaving it out understated your own case. It is back in.

The statement had a rendering problem you could not have known about: this site's math renderer handles $inline$ and $$display$$ only, so your \\[ ... \\] blocks would have shown as literal brackets and neither formula would have rendered. Converted to $$.

I also raised the problem's standing above what the entry claimed. Your bibliography told me more than your entry did: this is a named problem (Lidbetter's 2024 paper calls it "the Gerver-Ramsey collinearity problem"), it is catalogued in Brass-Moser-Pach, and it drew fresh work in 2024 and 2026. That is a 47-year-old problem with a real literature, so 15 rather than the numbered-problem band. Added the two 1979 sources plus Lidbetter and Barnoff-Bright as links, and an age note recording the ladder.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const lim = LIMITS.get(e.key);
    if (lim && typeof e.value === "string" && e.value.length > lim) {
      console.log(`  ${e.key} OVER BY ${e.value.length - lim} (${e.value.length}/${lim})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }
  if (/\\\[|\\\]/.test(String(data.statement ?? ""))) {
    console.log("  statement still contains bracket delimiters");
    bad++;
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 80 ? `${s.slice(0, 80)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, ai=${p.aiContribution}, verification=${p.verification}`);
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
      data: { problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null, type: "approved" },
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
