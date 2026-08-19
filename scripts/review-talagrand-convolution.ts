// Review of VibeGene's submission of arXiv:2608.15515, 19 Aug 2026.
//
// The one thing worth real work here was the chain. A claim that removes the
// last log log from someone else's near-miss is only as good as the near-miss,
// and the two cited predecessors are named in the abstract only by number. So
// both were pulled:
//
//   Chen, "Talagrand's convolution conjecture up to loglog via perturbed
//   reverse heat", arXiv:2511.19374, Nov 2025 - real. Yuansi Chen, ETH
//   Zurich. Gets the conjecture up to a dimension-free (log log)^{3/2}.
//   v2 exists because it "corrected a mistake in the previous draft which
//   was kindly pointed out by Joseph Lehec".
//
//   Xiang and Zhang, "Layerwise terminal discrepancy in Chen's reverse-heat
//   coupling on the Boolean cube", arXiv:2606.04573, June 2026 - real. Cuts
//   the loss to log log.
//
// Both exist and say what this paper says they say, and the target bound
// matches Talagrand's own suggested C_a/sqrt(log u). The provenance of the
// conjecture was checked at source too, not from memory: O'Donnell's "Open
// Problems in Analysis of Boolean Functions" (arXiv:1204.6447) carries it as
// "Talagrand's 'Convolution with a Biased Coin' Conjecture", cites Talagrand's
// 1989 Israel J. Math paper, records the $1000 prize and records that even the
// Gaussian special case was open in 2012.
//
// What could not be checked at all is Odin. The paper's entire AI disclosure
// is two sentences and no description: no vendor, no base model, no account of
// how it was steered. Taken at face value, as the methodology requires, but
// the aiRole field says plainly how thin it is.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "talagrand-s-convolution-conjecture";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "Field", key: "field", value: "Analysis of Boolean functions" },
  { field: "Field group", key: "fieldGroup", value: "Probability & statistics" },
  {
    field: "Statement",
    key: "statement",
    value:
      "On the Boolean hypercube $G = \\{-1,1\\}^n$ with uniform measure $\\lambda$, let $T_\\mu f(x) = \\int_G f(x \\odot y)\\,d\\mu(y)$ be convolution by a finite positive measure $\\mu$, and set\n$$\\psi_\\mu(u) = \\sup\\{u\\,\\lambda(\\{T_\\mu f \\ge u\\}) : f \\ge 0,\\ \\|f\\|_1 = 1\\},$$\nwhich measures how much better than Markov's inequality convolution makes the tail. In 1989 Talagrand conjectured that for the biased-coin product measure $\\mu_a = (\\tfrac{1+a}{2}\\delta_1 + \\tfrac{1-a}{2}\\delta_{-1})^{\\otimes n}$ with $0 < a < 1$,\n$$\\psi_{\\mu_a}(u) \\le \\frac{C_a}{\\sqrt{\\log u}} \\qquad (u > 1),$$\nwith $C_a$ depending on $a$ alone and not on the dimension $n$. He offered a \\$1000 prize for a proof. The Gaussian analogue was settled by Eldan and Lee; the hypercube case, the original, stayed open.\n\nThis paper claims the conjectured bound.",
  },
  { field: "Model maker", key: "modelMaker", value: null },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      'The paper\'s disclosure is two sentences, in the abstract and again under a heading "The role of AI in this proof": "Odin Automatic AI Research Agent was used to discover the proof. The final proofs were reorganized by the authors."\n\nTaken at face value, as this site\'s classification rule requires, that is an AI-discovered claim: the model produced the proof and the humans wrote it up. It is also thinner than any other entry at this tier. The paper says nothing about what Odin is, who builds it, which models it runs on, how it was steered, or how much of the manuscript is the agent\'s, and no public record of an "Odin Automatic AI Research Agent" could be found from this site - so the model maker field is left empty rather than guessed at.\n\nThe contribution being credited is a single idea: the power coupling that splits each reverse edge ratio into two geometric powers, which is what removes the iterated-logarithmic loss from the framework the paper inherits. The three named humans are Junwei Lu (Harvard T.H. Chan School of Public Health), Shengtao Guo and Ethan X. Fang.',
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "A three-day-old arXiv preprint with no independent endorsement, so Unreviewed, and no mathematics was checked here.\n\nThe chain it sits in was checked, and it holds. Talagrand's hypercube conjecture was open - O'Donnell's problem list still carries it, and even the Gaussian special case was open as of 2012. Yuansi Chen (arXiv:2511.19374, Nov 2025) proved it up to a dimension-free $(\\log\\log)^{3/2}$ factor; Yanjin Xiang and Zhihua Zhang (arXiv:2606.04573, June 2026) cut that to $\\log\\log$; this paper claims to remove the loss entirely. Both predecessors exist, are by identifiable people, and say what this paper says they say, and the target bound matches Talagrand's own suggested $C_a/\\sqrt{\\log u}$ rather than something adjacent.\n\nTwo things cut the other way. Chen's paper needed a v2 to fix \"a mistake in the previous draft which was kindly pointed out by Joseph Lehec\" - that is what scrutiny in this corner looks like, and it is what this paper has not yet had. And the proof is attributed to an agent nobody outside the paper can identify, with no account of how it was run, so the process cannot be weighed either.",
  },
  { field: "Significance", key: "significance", value: 37 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named 1989 conjecture of Talagrand (Israel J. Math. 68, \"A conjecture on convolution operators\"), carrying his own \\$1000 prize, listed in O'Donnell's \"Open Problems in Analysis of Boolean Functions\", and with a celebrated Gaussian counterpart settled by Eldan and Lee in Duke. Known across probability, Boolean analysis and geometric functional analysis for thirty-five years and invisible outside them. Level with Talagrand's convexity problem at 37, which has the same standing - a prized Talagrand problem on a recognised list. Above Feige at 35, below Sendov at 40.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The claim is the exact conjectured decay: $\\psi_{\\mu_a}(u) \\le C_a/\\sqrt{\\log u}$ for every $u > 1$ and every $n$, with $C_a$ dimension-free - concretely $\\lesssim \\kappa_a^2(\\log\\frac{\\kappa_a}{\\kappa_a-1})^{1/2}$ where $\\kappa_a = (1+a)/(1-a)$.\n\nWhat is new is one step in a three-paper chain rather than a proof from scratch, and the paper is explicit about it. Chen's reverse-heat and Boolean-bridge framework and Xiang-Zhang's localized terminal-discrepancy method are taken as given; the addition is a power coupling that splits each reverse edge ratio into two geometric powers, producing a switched exponential weight that restores the exact reverse jump rate of the perturbed coordinate. Because the frozen exponent then has a fixed numerator, no growing stopping buffer is needed and the $\\log\\log u$ factor disappears. That last $\\log\\log$ is what stood between the previous work and Talagrand's statement.",
  },
  { field: "Source name", key: "sourceName", value: "Weak-Type Bounds for Convolution on the Boolean Hypercube" },
];

const LINKS = [
  {
    label: "Chen, Talagrand's convolution conjecture up to loglog via perturbed reverse heat (Nov 2025)",
    url: "https://arxiv.org/abs/2511.19374",
    kind: "paper",
  },
  {
    label: "Xiang and Zhang, Layerwise terminal discrepancy in Chen's reverse-heat coupling (June 2026)",
    url: "https://arxiv.org/abs/2606.04573",
    kind: "paper",
  },
  {
    label: "O'Donnell's open-problem list, where the conjecture and its $1000 prize are recorded",
    url: "https://arxiv.org/abs/1204.6447",
    kind: "problem-record",
  },
];

const MESSAGE = `Published, significance 37. Your fields were accurate; the work here went into the chain and the disclosure.

The chain, because a claim that removes the last log log from someone else's near-miss is only as good as the near-miss, and the abstract names both predecessors by number only. Both are real. Chen, arXiv:2511.19374 (Yuansi Chen, ETH Zurich, Nov 2025), gets the conjecture up to a dimension-free (log log)^{3/2}. Xiang and Zhang, arXiv:2606.04573 (June 2026), cut that to log log. Both are now linked, and the result note says plainly that this paper is the last step of a three-paper chain rather than a proof from scratch - which is what the paper itself says.

The provenance I checked at source rather than from memory: O'Donnell's "Open Problems in Analysis of Boolean Functions" carries it as Talagrand's "Convolution with a Biased Coin" Conjecture, cites the 1989 Israel J. Math. paper, records the $1000 prize, and notes that even the Gaussian special case was open in 2012. That list is linked too, and it is what the significance rests on.

One correction to the statement: you had C_a/log u, and it is C_a/sqrt(log u). Worth fixing - the square root is the whole conjecture.

On the AI side I left the model as Odin and the tier as AI-discovered, taking the disclosure at face value as the methodology requires, but cleared the maker field: the paper says nothing about what Odin is, who builds it, or what it runs on, and I could find no public record of it. The role field says that outright, because a reader should see that this is the thinnest AI-discovered claim in the catalog.

Two honest marks against it are in the verification note. Chen's paper needed a v2 to fix a mistake Joseph Lehec pointed out - that is what scrutiny here looks like, and this paper is three days old and has had none.`;

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
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}: ${l.label}`);
      bad++;
    }
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, method=${p.resolutionMethod}, verification=${p.verification}, ai=${p.aiContribution}, model=${p.model}, publication=${p.publication}`);
  console.log(`  message: ${MESSAGE.length}/${MESSAGE_MAX}`);
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
