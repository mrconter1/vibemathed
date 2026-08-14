// Review of LucidManta102's SOP_2 = SOP_3 submission, 14 Aug 2026.
//
// Verified against the paper's LaTeX source (arXiv:2608.13291, fetched):
//   - the paper is real: 5 pages, math.LO, posted 13 Aug 2026, author Artem
//     Chernikov - a leading model theorist in exactly this area;
//   - the AI disclosure is verbatim as submitted: "The proof was found using
//     ChatGPT 5.6 and simplified and streamlined by the author";
//   - the attribution checks: Dzamonja-Shelah introduced SOP_1/SOP_2 and
//     asked whether either implication SOP_3 => SOP_2 => SOP_1 reverses;
//     Mutchnik's breakthrough proved SOP_2 = SOP_1, and the paper's intro
//     confirms SOP_2 =? SOP_3 was "repeatedly highlighted" with partial
//     results by Conant, Kaplan-Ramsey-Simon and Mutchnik. This result
//     completes the collapse SOP_1 = SOP_2 = SOP_3;
//   - the acknowledgements record comments by Kaplan and Mutchnik on the
//     preliminary version - expert eyes, but pre-review comments, so the
//     tier stays Unreviewed.
//
// The tier question: "found using ChatGPT 5.6" reads close to ai-discovered,
// but it is one sentence and says nothing about how interactive the search
// was; the site's rule is to pick the lower tier when the disclosure is
// vague, so the submitter's ai-co-developed stands.
//
// Also adds the submitter's suggested field taxonomy: new fieldGroup
// "Logic & foundations" (broader than their "Mathematical logic", so set
// theory and computability land here too), field detail "Model theory".
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "sop-2-sop-3";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "Name", key: "name", value: "$SOP_2 = SOP_3$" },
  { field: "Short name", key: "shortName", value: "SOP_2 = SOP_3" },
  { field: "Field", key: "fieldGroup", value: "Logic & foundations" },
  { field: "Field detail", key: "field", value: "Model theory" },
  { field: "Collaborators", key: "humanCollaborators", value: ["Artem Chernikov"] },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Checked by this site on 14 August 2026 against the paper's LaTeX source. The paper is real - five pages, math.LO, posted 13 August - and its author, Artem Chernikov, is a leading model theorist in exactly this area. The AI disclosure is verbatim as the entry quotes it. The history checks out in the paper's own introduction: Dzamonja and Shelah introduced the tree configurations $SOP_1$ and $SOP_2$ and asked whether either implication $SOP_3 \\Rightarrow SOP_2 \\Rightarrow SOP_1$ reverses; Mutchnik's breakthrough proved $SOP_2 = SOP_1$, and the question $SOP_2 = SOP_3$ was repeatedly highlighted afterwards, with partial results by Conant, Kaplan-Ramsey-Simon and Mutchnik. This result completes the collapse $SOP_1 = SOP_2 = SOP_3$. The acknowledgements record comments by Itay Kaplan and Scott Mutchnik on a preliminary version - expert eyes, but comments on a draft are not independent verification, and the manuscript is one day old and unrefereed, so the tier is Unreviewed. The proof itself - five pages of tree-indiscernible manipulation - was not checked here; it needs a model theorist.",
  },
  { field: "Significance", key: "significance", value: 35 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "One of the two 2004 Dzamonja-Shelah questions that organized two decades of classification theory, repeatedly highlighted in the NSOP_1 literature, and the surviving half after Mutchnik's celebrated SOP_1 = SOP_2. Resolving it collapses the bottom of the SOP hierarchy outright, with consequences for Keisler-order maximality. Central within model theory, little known outside it: placed at 35 with the field-famous specialist band (Feige, Krauth-Mezard), above HRT at 33.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The new content is $SOP_2 \\Rightarrow SOP_3$; the converse implication was known from the start. Dzamonja and Shelah asked whether either implication in $SOP_3 \\Rightarrow SOP_2 \\Rightarrow SOP_1$ reverses: Mutchnik answered the second ($SOP_1 = SOP_2$), and this answers the first, collapsing the bottom of the hierarchy to $SOP_1 = SOP_2 = SOP_3$. The $SOP_n$ hierarchy for $n \\ge 3$ remains, as does everything above it.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Posed by Dzamonja and Shelah in 2004 alongside its sibling question SOP_1 = SOP_2, which Mutchnik answered in a celebrated 2022 preprint. Open 22 years.",
  },
];

const MESSAGE = `Published, with the field taxonomy you asked for - though slightly broader than you suggested.

There is now a "Logic & foundations" field group, and this entry is its first member, with field detail "Model theory". Broader than "Mathematical logic" on purpose: set theory, computability and proof theory results should land in the same bucket rather than each wanting a group of their own, and the site's other groups are broad the same way.

Your submission verified cleanly against the paper's LaTeX. The disclosure is quoted verbatim; the history is exactly as the introduction tells it - the two 2004 Dzamonja-Shelah questions, Mutchnik's SOP_1 = SOP_2 breakthrough, and this completing the collapse; and the acknowledgements record Kaplan and Mutchnik commenting on a preliminary version, which I noted in the verification note as expert eyes short of verification.

On the AI tier: "the proof was found using ChatGPT 5.6" reads close to ai-discovered, but it is one sentence and says nothing about how interactive the search was, and the site's rule is to take the lower tier when a disclosure is vague - so your ai-co-developed stands. If Chernikov ever says more about the sessions, the tier can move.

I filled in what the submission left empty: a verification note, significance 35 (one of the two questions that organized two decades of classification theory, the surviving half after Mutchnik - central within model theory, little known outside), a result note placing it against Mutchnik's half, an age note, and Chernikov as the human collaborator. Thanks for a clean submission and a good taxonomy catch.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) =>
    v === null || v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);

  let bad = 0;
  for (const e of EDITS) {
    const limit = LIMITS.get(e.key);
    if (limit && typeof e.value === "string" && e.value.length > limit) {
      console.log(`  ${e.key} OVER BY ${e.value.length - limit}`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 85 ? `${s.slice(0, 85)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  unchanged: resolution=${p.resolution}, ai=${p.aiContribution}, publication=${p.publication}`);
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
