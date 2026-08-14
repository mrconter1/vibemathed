// Rework the Crouzeix entry around the Townsend-Greenbaum account, 14 Aug 2026.
//
// The entry recorded the Lorist-Schwenninger proof (ai-assisted, candidate)
// with a result note saying Jin's earlier concurrent proof "carries no AI
// disclosure known to us, so the first proof of Crouzeix's conjecture may not
// be an AI-assisted one". Townsend and Greenbaum's SIAM News essay (14 Aug,
// alextownsend.net/essays/SIAMNews_CrouzeixConjecture.pdf, fetched and read
// in full) overturns exactly that sentence: Jin told them the key result
// (Theorem 2 of his preprint) emerged during an approximately sixteen-hour
// AUTONOMOUS run of GPT-5.6 Sol in ChatGPT Work mode, with a public prompt
// adapted from the Cycle Double Cover run, no web access, and no human
// intervention during the run - and the essay closes: "it was difficult to
// imagine an AI system contributing the decisive idea in a proof of a major
// conjecture. Now it has happened in our field."
//
// The essay also carries the strongest verification statement the catalog
// has for this problem: "Both authors of this article, as well as Michel
// Crouzeix himself, have checked the proof thoroughly and believe that
// Dr. Jin's manuscript is correct." Townsend and Greenbaum are leading
// figures on this exact conjecture (Greenbaum co-organized the 2017 AIM
// workshop on it; Crouzeix-Greenbaum is the standard survey), so this is
// independent expert verification, publicly on record.
//
// Jin's repo (jinshanmu/CrouzeixConjecture, cloned at 9df0783) was audited
// here: 82 Lean files with zero sorry/admit, zero axiom declarations, zero
// native_decide (comments stripped), toolchain v4.28.0, an Annals-formatted
// manuscript, and the full prompt - it is also the repo whose axiom-audit
// convention other submissions have started copying.
//
// Per the methodology's own worked example, concurrent proofs share ONE
// entry. It now records Jin's proof as primary (first, and the stronger AI
// claim) with Lorist-Schwenninger as the named independent second.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "crouzeix-s-conjecture";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "Crouzeix conjectured in 2004 that for every square complex matrix $A$ and every polynomial $p$, $\\lVert p(A)\\rVert \\leq 2 \\max_{z \\in W(A)} |p(z)|$, where $W(A)$ is the numerical range of $A$ - that is, the numerical range is a 2-spectral set. Crouzeix proved a constant of 11.08 in 2007 and Crouzeix and Palencia lowered it to $1+\\sqrt{2}$ in 2017; the conjectured constant 2 is attained by $2\\times 2$ matrices. Jin proves the sharp bound by a function-theoretic route whose key theorem reduces the problem, via a sampling strategy, to a positivity condition; Lorist and Schwenninger independently prove it days later by combining double-layer potential machinery with a perturbation lemma for 2-dilations.",
  },
  { field: "Status", key: "resolution", value: "resolved" },
  { field: "Verification", key: "verification", value: "expert-verified" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Independently expert-verified, publicly on record: Townsend and Greenbaum's essay of 14 August 2026 states that both authors and Michel Crouzeix himself \"have checked the proof thoroughly and believe that Dr. Jin's manuscript is correct\" - the conjecture's own poser among the verifiers, and Greenbaum co-organized the 2017 AIM workshop on the problem. This site read that essay in full and audited Jin's repository (commit 9df0783): 82 Lean files with zero sorry, zero axiom declarations and zero native_decide with comments stripped, on toolchain v4.28.0, alongside an Annals-formatted manuscript and the complete autonomous-run prompt - though the Lean was not compiled here and its statement-to-conjecture correspondence not audited, so the tier rests on the expert endorsement, not the formalization. The independent second proof by Lorist and Schwenninger (arXiv:2608.03841) has no comparable public endorsement yet and the essay stops short of vouching for it. Neither manuscript is refereed.",
  },
  { field: "Solve date", key: "solveDate", value: "2026-07-27" },
  { field: "Model", key: "model", value: "GPT-5.6 Sol; ChatGPT 5.6 Pro" },
  {
    field: "Collaborators",
    key: "humanCollaborators",
    value: ["Shanmu Jin", "Emiel Lorist", "Felix L. Schwenninger"],
  },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      "For the first proof: Jin, a neurosurgery resident with no specialized mathematical training, reports that the key result (Theorem 2) emerged during an approximately sixteen-hour autonomous run of GPT-5.6 Sol in ChatGPT Work mode - a public prompt adapted from the Cycle Double Cover run, web access denied, a branching portfolio of subagent strategies under adversarial audit, and no human intervention once started. Jin then simplified and verified the output; the repository publishes the prompt, successive manuscripts, a Lean formalization and an axiom audit. For the independent second proof, Lorist and Schwenninger disclose that ChatGPT 5.6 Pro was used to explore proof strategies, with the note entirely written by the authors.",
  },
  { field: "AI contribution", key: "aiContribution", value: "ai-discovered" },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Two independent proofs within eight days, both with AI in the loop. Jin's (posted 27 July, preprints.org, submitted to Annals) is the first: its decisive theorem came out of an autonomous GPT-5.6 Sol run, and it is the proof Townsend, Greenbaum and Crouzeix have checked. Lorist and Schwenninger's five-page argument (arXiv, 4 August) is a genuinely different route - double-layer potentials plus a perturbation lemma for 2-dilations - produced with ChatGPT 5.6 Pro exploring proof strategies. The entry's headline axes record Jin's proof; the earlier version of this entry recorded Lorist-Schwenninger's as primary while Jin's AI provenance was still unknown.",
  },
  { field: "Significance", key: "significance", value: 35 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named 2004 conjecture at the centre of matrix analysis and operator theory: two decades of partial results, its own AIM workshop (2017), its own survey, and Wikipedia articles in two languages. Field-famous rather than household - level with Feige and Krauth-Mezard at 35, above the strong specialist band at 30 where it previously sat; the AIM workshop and the constant-lowering literature are the concrete differentiators.",
  },
  { field: "Source URL", key: "sourceUrl", value: "https://www.preprints.org/manuscript/202607.1919" },
  {
    field: "Source name",
    key: "sourceName",
    value: "Jin, The Numerical Range Is a 2-Spectral Set",
  },
];

const LINKS = [
  {
    label: "Townsend and Greenbaum, The Neurosurgery Resident Who Proved Crouzeix's Conjecture (14 Aug 2026)",
    url: "https://alextownsend.net/essays/SIAMNews_CrouzeixConjecture.pdf",
    kind: "independent",
  },
  {
    label: "Jin's repository: prompt, successive manuscripts, Lean formalization, axiom audit",
    url: "https://github.com/jinshanmu/CrouzeixConjecture",
    kind: "code",
  },
  {
    label: "Lorist and Schwenninger, A solution to Crouzeix's conjecture (arXiv, 4 Aug 2026) - the independent second proof",
    url: "https://arxiv.org/abs/2608.03841",
    kind: "independent",
  },
  {
    label: "AIM workshop on Crouzeix's conjecture (2017)",
    url: "https://aimath.org/pastworkshops/crouzeix.html",
    kind: "problem-record",
  },
  {
    label: "Wikipedia: Crouzeix's conjecture",
    url: "https://en.wikipedia.org/wiki/Crouzeix%27s_conjecture",
    kind: "wikipedia",
  },
];

const MESSAGE = `Your Crouzeix entry has been substantially reworked, and the reason is good news: the open question your result note flagged - whether Jin's earlier proof was AI-assisted at all - has been answered, in the most public way possible.

Townsend and Greenbaum published an essay today (linked on the entry) reporting, from correspondence with Jin, that his key theorem emerged during a roughly sixteen-hour autonomous run of GPT-5.6 Sol - public prompt, no web access, no intervention. They also state that they and Michel Crouzeix himself have checked Jin's proof thoroughly and believe it correct. That is independent expert verification with the conjecture's own poser among the verifiers.

So the entry now records Jin's proof as primary: solve date 27 July, ai-discovered, Expert-verified, Resolved, significance raised to 35. Your Lorist-Schwenninger material is all still there - it is the named independent second proof, with its arXiv link and its own AI disclosure quoted - and your original framing was exactly right for what was knowable when you submitted: you recorded the AI-assisted proof without claiming priority, and the entry's history preserves that.

I also audited Jin's repository myself: 82 Lean files, zero sorry, zero axiom declarations, zero native_decide, plus the full prompt. The tier rests on the expert endorsement rather than the Lean, since I did not compile it - the note says so.

Thanks for the careful original submission; it is what made this update an upgrade rather than a correction.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "published") throw new Error(`${SLUG} is ${p.status}`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) =>
    v === null || v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);

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

  console.log(`${SLUG}: update (published entry)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 85 ? `${s.slice(0, 85)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
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
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "reply",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
