// Review of VibeGene's submission of arXiv:2608.18068, 19 Aug 2026.
//
// The submission is accurate; the edits are mostly shape. Two things were
// worth checking rather than taking on trust, and both held.
//
// First, the AI claim. The arXiv abstract says nothing about AI, so the whole
// attribution rests on the paper body. It is there, under the heading
// "Artificial Intelligence Statement", and it is more specific than the
// submission's paraphrase: a coordinated first attempt (a Sol agent plus the
// Danus and Rethlas reasoning agents, both on OpenAI Sol, plus a Polya-style
// agent) produced only partial results; ChatGPT Sol then produced a torus
// route the authors judged too complicated; and the decisive step was the
// second author prompting Claude Opus 5.0 for a direct Euclidean proof, whose
// response "provided the basis for the proof idea used in the present paper".
// So the entry names Opus 5.0 first, which the submission did not.
//
// Second, that the problem is real and was open. It is, and the checkable
// trail is unusually clean: Spector and Stockdale - the second and third
// authors here - wrote the 2020 paper reducing this exact question to Dirac
// masses, and it states there that Janakiraman's c log n was the best known.
// The paper's own AI statement says the first author started from that paper.
// This is a continuation of the authors' own six-year program, not a claim
// arriving from nowhere.
//
// Nothing mathematical was checked here: twelve pages of obstacle-problem and
// fractional-Sobolev analysis with no finite certificate to re-run. Stays
// Unreviewed, and the note says exactly that.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "stein-s-dimension-free-weak-1-1-riesz-transform-problem";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "The Riesz transforms $R_1,\\ldots,R_n$ on $\\mathbb{R}^n$ are the Fourier multipliers $-i\\xi_j/|\\xi|$, the natural higher-dimensional Hilbert transforms. Stein proved in 1983 that their $L^p$ bounds can be taken independent of the dimension for every $1 < p < \\infty$. At the 1986 ICM he asked whether the same holds at the endpoint $p=1$: is there an absolute constant $C$, independent of $n$, with\n$$|\\{x : |Rf(x)| > \\lambda\\}| \\le \\frac{C}{\\lambda}\\,\\|f\\|_{L^1(\\mathbb{R}^n)}$$\nfor every $\\lambda > 0$? The Calderon-Zygmund route gives a constant that grows with the dimension, and the best known was Janakiraman's $c\\log n$.\n\nThis paper answers yes, with $C = 2$, for the vector transform $R = (R_1,\\ldots,R_n)$ - so the same constant serves every single component $R_j$ uniformly in $n$.",
  },
  { field: "Posed by", key: "posedBy", value: "Elias M. Stein" },
  { field: "Year posed", key: "yearPosed", value: 1986 },
  { field: "Model", key: "model", value: "Claude Opus 5.0, GPT-5.6 Sol" },
  { field: "Model maker", key: "modelMaker", value: "Anthropic, OpenAI" },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      'From the paper\'s "Artificial Intelligence Statement": "The proof strategy was developed by Large Language Models (LLMs), through a combination of ChatGPT (GPT-5.6 Sol), Codex CLI and web interface, mathematical reasoning agents, and Claude Opus 5.0, in dialogues with the authors."\n\nThe sequence is specific. The first author started from the second and third authors\' 2020 paper and ran a coordinated attempt - a Sol agent with the Danus and Rethlas automated reasoning agents (both deployed on OpenAI Sol agents) and a Polya "How to Solve It" style agent - which reached only partial results. Further dialogue with ChatGPT Sol gave an attempted complete solution via variational inequalities on the torus and a transference principle, much more complicated than what was published. The second and third authors judged that a direct Euclidean proof should be possible; the second author prompted Claude Opus 5.0 to try it, and "the response was a longer document that provided the basis for the proof idea used in the present paper".\n\nThe authors then checked and rewrote the proofs, did the literature review, wrote the introduction, and state they "independently verified, validated, and rewritten all parts of the paper influenced by LLM-generated material" and take full responsibility for the mathematics.',
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "A one-day-old arXiv preprint, unrefereed, with no independent endorsement on record, so this stays Unreviewed. Nothing was checked here either: the proof is twelve pages of obstacle-problem and fractional-Sobolev analysis, with no finite certificate to re-run.\n\nThe setting was checked and holds up. Stein's question is real and was open, and the trail is unusually clean: the second and third authors wrote \"On the dimensional weak-type $(1,1)$ bound for Riesz transforms\" (arXiv:2004.03382, Comm. Contemp. Math. 23, 2021), which reduces this exact question to finite sums of Dirac masses and records Janakiraman's $c\\log n$ as the best known. This paper is a continuation of their own program, and the AI statement says the first author started from it. The claim is also unusually falsifiable for its kind: an absolute constant 2, not an asymptotic. It clears the known lower bound - in $n=1$ the transform is the Hilbert transform, whose weak-type $(1,1)$ norm is Davis's constant, about 1.347.\n\nAgainst that: forty-year-old endpoint problems do not usually fall in twelve pages, and the strategy came from a model, so the argument has had less human incubation than its length suggests.",
  },
  { field: "Significance", key: "significance", value: 38 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Posed by E. M. Stein at the 1986 ICM, at the endpoint of his own celebrated dimension-free $L^p$ theorem for Riesz transforms, and one of the recognised open questions of modern harmonic analysis: four decades of documented attack, including Janakiraman's $c\\log n$, Banuelos-Osekowski's sharp martingale bounds, and Spector-Stockdale's reduction to Dirac masses. Above Talagrand's convexity problem at 37 on provenance - an ICM question by Stein sitting on a celebrated theorem of his own. Below Sendov at 40, which carries a far larger dedicated literature.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The theorem is the vector-valued endpoint bound $\\|Rf\\|_{L^{1,\\infty}} \\le 2\\|f\\|_{L^1}$ for $R = (R_1,\\ldots,R_n)$, so the constant 2 also serves each component $R_j$ uniformly in the dimension; the best previously known component bound grew like $c\\log n$.\n\nThe mechanism is a decomposition theorem stated as Theorem 1.2: for every nonnegative $f \\in L^1 \\cap L^2$ and every $\\lambda > 0$, write $f = \\mu + (-\\Delta)^{\\alpha/2}u$ with $\\mu \\le \\lambda$ and $u$ in the fractional Sobolev space $H^\\alpha$, obtained from an obstacle problem for the fractional Laplacian together with a Lewy-Stampacchia type estimate on an unbounded domain. That replaces the Calderon-Zygmund decomposition, whose cube geometry is where the dimensional loss enters.",
  },
  {
    field: "Source name",
    key: "sourceName",
    value: "A dimension-free weak-type (1,1) bound for the vector Riesz transform on R^n",
  },
];

const LINKS = [
  {
    label: "Spector and Stockdale (2020), the reduction to Dirac masses this paper grew out of",
    url: "https://arxiv.org/abs/2004.03382",
    kind: "paper",
  },
];

const MESSAGE = `Published, significance 38. Your summary was accurate; the edits are mostly shape, plus one correction to the model credit.

The correction first. The arXiv abstract says nothing about AI, so the whole attribution rests on the paper body - I read it. The "Artificial Intelligence Statement" is more specific than your paraphrase, and the order matters: the coordinated first attempt (a Sol agent with the Danus and Rethlas reasoning agents and a Polya-style agent) reached only partial results; ChatGPT Sol then produced a torus-plus-transference route the authors judged too complicated to use; and the decisive step was the second author prompting Claude Opus 5.0 for a direct Euclidean proof, whose "response was a longer document that provided the basis for the proof idea used in the present paper". So the entry lists Claude Opus 5.0 first and GPT-5.6 Sol second, and the role field now carries that sequence rather than a flat list of tools. AI-discovered is right.

The statement field now states Stein's problem rather than reproducing the abstract, which is the house style - the entry should say what was open before it says what the paper did.

I also checked that the problem was open and correctly described. It was, and the trail is clean: Spector and Stockdale, the second and third authors here, wrote the 2020 paper reducing this exact question to Dirac masses and recording Janakiraman's c log n as the best known. That is now linked. This is a continuation of their own program, which is worth something for a claim this size.

Nothing mathematical was checked here, and the verification note says so plainly - twelve pages of obstacle-problem analysis with no certificate to re-run. It stays Unreviewed. What I could say for it is in the note: the constant is an absolute 2 rather than an asymptotic, so it is unusually falsifiable, and it clears the known n=1 lower bound (Davis's constant for the Hilbert transform, about 1.347).`;

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
  console.log(`  unchanged: resolution=${p.resolution}, method=${p.resolutionMethod}, verification=${p.verification}, ai=${p.aiContribution}, publication=${p.publication}`);
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
