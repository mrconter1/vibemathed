// Review of VibeGene's submission of arXiv:2608.17802, 19 Aug 2026.
//
// This is the rare analysis paper whose theorem statements are all finite
// sums and one-dimensional integrals, so they can be evaluated directly and
// hunted for counterexamples even though the proofs cannot be checked.
// scripts/check_rademacher.py does exactly that, and all three headline
// statements survive:
//
//   Theorem 1.1  E|S|^p <= mu_p - (mu_p - 1) sum a_i^4 for p >= 4.
//                18,960 coefficient vectors (flat families, one spike plus a
//                flat sea, and random vectors of every sparsity) across
//                twelve exponents from 4 to 13. No violation. Equality at
//                q = 1 holds exactly, as stated.
//
//   Prop 4.3     the same inequality must FAIL on 2 < p < 4, which is what
//                makes Jakimiuk's originally conjectured range wrong. At
//                S_2 = (eps_1+eps_2)/sqrt2 it reduces to 2^{p/2} <= mu_p + 1;
//                that fails strictly on (2,4) and is an exact equality at
//                both endpoints p = 2 and p = 4. Confirmed to 1e-9.
//
//   Theorem 1.3  x -> ||x+S_n||_p/||x+S_n||_4 strictly decreasing on
//                [1,inf) for p >= 5. 32,000 evaluations over eight exponents
//                and n = 1..10. No increase anywhere.
//
// That is a statement check, not a proof check, so the tier stays Unreviewed.
// It is still worth a lot: a wrong constant or a wrong threshold in a paper
// like this would show up immediately, and it did not.
//
// Both cited conjectures were also checked at source. Jakimiuk is
// arXiv:2503.07001, in Bernoulli 32 (2026); BMNO is arXiv:2503.11869, March
// 2025. The paper's account of what each conjectured is faithful, including
// that BMNO stated theirs for p >= 5 - so proving it for p >= 5 settles it
// rather than being a partial result. First names verified, since the
// submission gave them and the paper does not.
//
// The one thing the submission understates is that Jakimiuk's Conjecture 1 is
// FALSE as posed. The result note now leads with that.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "fourth-moment-conjectures-for-rademacher-sums";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "Field", key: "field", value: "Khintchine inequalities" },
  {
    field: "Statement",
    key: "statement",
    value:
      "Let $\\varepsilon_1,\\ldots,\\varepsilon_n$ be independent Rademacher signs, let $\\sum a_i^2 = 1$, write $S = \\sum a_i\\varepsilon_i$ and $q = \\sum a_i^4$, and let $\\mu_p = \\mathbb{E}|G|^p$ for a standard Gaussian $G$. Two 2025 conjectures say that $q$ alone governs how far $S$ falls short of Gaussian.\n\nJakimiuk proved $\\mathbb{E}|S|^p \\le \\mu_p - c_p q$ for $p \\ge 3$ and conjectured the optimal constant is $c_p = \\mu_p - 1$ throughout that range; separately he conjectured a dimension-free quadratic stability bound at the critical exponent $p = 3$.\n\nBaranski, Murawski, Nayar and Oleszkiewicz reduced the finite-dimensional $L_p/L_4$ Khintchine constant for $p \\ge 5$ to $\\sup_{x \\ge 1}\\|x + \\varepsilon_1 + \\cdots + \\varepsilon_N\\|_p / \\|x + \\varepsilon_1 + \\cdots + \\varepsilon_N\\|_4$ and conjectured the supremum is attained at $x = 1$ - that is, the flat coefficient vector is the extremizer.",
  },
  { field: "Year posed", key: "yearPosed", value: 2025 },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      "From the paper's \"Statement of AI use\": \"Initial versions of the proofs of the sharp Gaussian stability inequality and the finite-dimensional $L_p$-$L_4$ constant theorem were developed with assistance from ChatGPT 5.6 Sol. The authors checked and revised the arguments, take full responsibility for their mathematical content, and independently verified the extensions presented here.\" The abstract puts it as \"The proofs are discovered with substantial assistance from ChatGPT 5.6 Sol.\"\n\nCo-developed rather than discovered, and the disclosure is why: it credits the model with initial versions of two of the paper's four theorems, inside a paper the humans led, and this site gives a disclosure phrased as assistance the lower tier. The two theorems named are Theorem 1.1 and Theorem 1.3, which are the two conjectures being settled. Neither the counterexample below $p = 4$ nor the third-moment theorem is attributed to the model.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Unreviewed: a one-day-old arXiv preprint, unrefereed, with no independent endorsement, and none of the proofs were checked here.\n\nThe statements were, and all three survived. Every theorem here is an inequality between finite sums and one-dimensional integrals, so it can be evaluated directly and hunted for counterexamples. Theorem 1.1 was tested on 18,960 coefficient vectors - flat families, one spike plus a flat sea, and random vectors of every sparsity - across twelve exponents from 4 to 13, with no violation, and the stated equality case $q=1$ holds exactly. Proposition 4.3 requires the same inequality to fail for every $2 < p < 4$: at $S_2 = (\\varepsilon_1+\\varepsilon_2)/\\sqrt2$ it reduces to $2^{p/2} \\le \\mu_p + 1$, which fails strictly across that range and is an exact equality at both endpoints. Theorem 1.3's strict monotonicity held in 32,000 evaluations over eight exponents and $n \\le 10$.\n\nThat is a check of the statements, not of the proofs, so the tier does not move. It is not nothing: a wrong constant or a misplaced threshold would have shown up at once. The script is scripts/check_rademacher.py in this site's repository.",
  },
  { field: "Significance", key: "significance", value: 8 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Two conjectures stated in March 2025 papers, inside the long-running program on optimal constants in Khintchine's inequality that runs back through Haagerup and Szarek. Real questions by established probabilists - one of the source papers is in Bernoulli - but a year old, with no literature of attack behind them yet. Above the anchor at 5, which covers machine-generated conjectures and one-off questions: these are named conjectures within a recognised program. Below the anchor at 10 for a typical numbered Erdos problem, which carries decades more standing.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Four results, and the first is partly a refutation. Jakimiuk conjectured $c_p = \\mu_p - 1$ is optimal for every $p \\ge 3$; the paper proves that for $p \\ge 4$ and gives a counterexample for every $2 < p < 4$, so the conjecture is false as posed and the corrected range is $p \\ge 4$. The witness is the two-coordinate vector $S_2 = (\\varepsilon_1+\\varepsilon_2)/\\sqrt2$.\n\nThe Baranski-Murawski-Nayar-Oleszkiewicz flat-point conjecture is proved outright, in the stronger form that $x \\mapsto \\|x+S_n\\|_p/\\|x+S_n\\|_4$ is strictly decreasing on $[1,\\infty)$ for every real $p \\ge 5$; that range is the one they conjectured, so nothing is left over. Jakimiuk's second conjecture, dimension-free quadratic stability at $p = 3$, is proved with an explicit constant, though the optimal constant there is only bracketed and stays open. The paper also records the exact fixed-$q$ moment and Laplace-transform envelopes, from which coefficient-sensitive tail bounds follow.",
  },
  { field: "Source name", key: "sourceName", value: "Fourth-Moment Geometry of Rademacher Sums" },
];

const LINKS = [
  {
    label: "Jakimiuk, Stability of Khintchine inequalities with optimal constants (Bernoulli 32, 2026)",
    url: "https://arxiv.org/abs/2503.07001",
    kind: "problem-record",
  },
  {
    label: "Baranski, Murawski, Nayar, Oleszkiewicz - On the optimal Lp-L4 Khintchine inequality",
    url: "https://arxiv.org/abs/2503.11869",
    kind: "problem-record",
  },
  {
    label: "This site's numerical check of Theorems 1.1 and 1.3 and of Proposition 4.3",
    url: "https://github.com/mrconter1/vibemathed/blob/main/scripts/check_rademacher.py",
    kind: "code",
  },
];

const MESSAGE = `Published, significance 8, with one substantive change to what the entry claims.

Jakimiuk's Conjecture 1 is false as posed, and the entry now leads with that rather than mentioning it in passing. He conjectured the optimal constant for every p >= 3; this paper proves it for p >= 4 and gives a counterexample for every 2 < p < 4, so the honest summary is "corrected and proved above 4, refuted below". You did say the original range fails - I have just moved it to the front, because a reader skimming "settles the conjectures of Jakimiuk and of BMNO" would otherwise take it for a clean proof of both.

The BMNO side is clean, and I checked the thing that could have made it partial: they stated their flat-point conjecture for p >= 5, so proving it for p >= 5 settles it and nothing is left over. Both source papers are now linked, and I verified the first names you supplied against them (arXiv:2503.07001 and arXiv:2503.11869 - Jacek Jakimiuk, and Adam Baranski with Murawski, Nayar and Oleszkiewicz).

Something worth telling you: this paper is unusually checkable, and I checked it. Every headline statement is an inequality between finite sums, so I evaluated them and went looking for counterexamples. Theorem 1.1 held on 18,960 coefficient vectors across twelve exponents. Proposition 4.3's failure on (2,4) reduces to 2^{p/2} <= mu_p + 1, which does fail strictly across that interval and is an exact equality at both endpoints, which is a nice sign the threshold is real and not fudged. Theorem 1.3's strict monotonicity held in 32,000 evaluations. Script is linked on the entry.

That checks the statements, not the proofs, so it stays Unreviewed - but it is a lot more than most one-day-old preprints get, and it is in the verification note.

AI co-developed kept, as you had it. The disclosure credits the model with initial versions of two of the four theorems and is phrased as assistance, which is the lower tier by our rule.`;

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
