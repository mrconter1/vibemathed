// Approve the affine-case Erdos 270 submission as a candidate, 24 Aug 2026.
//
// Scope gate passes: Erdos and Graham's Problem 270 is a stated question, the
// affine subclass is a precise sub-question of the part still open, and the
// claim is a proved theorem rather than a programme.
//
// Read at the source rather than trusted (clambro/erdos-270-transcendence):
// the five proof modules total 977 lines with no sorry, admit, declared axiom
// or native_decide on Lean 4.33.1, and the elementary irrationality theorem
// for a >= 1, 0 <= b <= a is unconditional. The transcendence theorem is not
// formalized. Salikhov, Salikhov-Viskina, Beukers and Levelt-Turrittin are
// passed as Lean hypotheses instead of hidden as axioms, which is the honest
// construction, but for the novel range b > a the hypothesis
// BeyondStripInput.pair IS the conclusion, so the Lean lends the new claim
// nothing.
//
// Two corrections the submission did not carry. Problem 270 as posed was
// already answered NO by Crmaric and Kovac (Colloquium Mathematicum, 2025):
// for any alpha > 0 there is f(n) -> infinity summing to alpha. The surviving
// open question is the non-decreasing case, which is where the affine family
// sits. And the checkable parts here were already known - the base-case
// irrationality argument is Crmaric and Kovac's, credited in the repo, and
// base-case transcendence follows a 2023 MathOverflow argument.
//
// resolution partial -> candidate, this catalog's label for an unrefereed
// self-deposit. AI contribution stays ai-discovered on the author's own
// detailed account (the submitter IS the author), but the manuscript's only
// public disclosure is one line about writing and checking, which read at face
// value would put the work out of scope entirely. That discrepancy is
// recorded in aiRole and asked about in the decision message.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "transcendence-in-the-affine-case-of-erdos-problem-270";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  resolution: "candidate",
  aiRole:
    "The author's account, given to this site on submission rather than in the manuscript: OpenAI Codex independently rediscovered the elementary denominator argument, connected Crmarić and Kovač's Gaussian integral representation with a MathOverflow Siegel-Shidlovsky argument to obtain base-case transcendence, and developed the claimed extension to all positive affine cases using hypergeometric E-functions, Euler-operator reductions and a formal-at-infinity resonance argument. It located the relevant results of Salikhov, Salikhov-Viskina and Beukers, drafted the manuscript, and produced most of the Lean formalization; further AI reviews identified gaps and prompted revisions. The manuscript's own disclosure is a single line - \"This manuscript was written and checked using generative AI\" - which names no model and describes only writing and checking. The tier here follows the detailed account because the submitter is the author, but a reader following the source link will not find it there.",
  verificationNote:
    "Read here on 24 August 2026 at github.com/clambro/erdos-270-transcendence. The elementary irrationality theorem for $a\\ge1$, $0\\le b\\le a$ is unconditional, and the five proof modules total 977 lines with no sorry, no admit, no declared axiom and no native_decide on Lean 4.33.1. The general transcendence theorem is not formalized. Salikhov, Salikhov-Viskina, Beukers, the Levelt-Turrittin decomposition and the step from the resonance calculation to functional minimality are passed as explicit Lean hypotheses rather than hidden behind axiom declarations, which is the honest construction; but for the novel range $b>a$ the hypothesis BeyondStripInput.pair is the conclusion itself, so the formalization lends the new claim no independent weight. Lean was not compiled here. The manuscript is unrefereed, self-published in a GitHub repository, and two days old at review.",
  resultNote:
    "The manuscript claims $C_{a,b}$ is transcendental for every $a\\ge1$ and $b\\ge1-a$, settling the positive integer-valued affine subclass of Erdős Problem 270. Two pieces of context matter. Problem 270 as Erdős and Graham posed it, for every $f(n)\\to\\infty$, was already answered no by Crmarić and Kovač in 2025: for any $\\alpha>0$ some such $f$ makes the series sum to $\\alpha$. What survives is the non-decreasing case, and the affine family sits inside it. Separately, the checkable parts here were already known - the short irrationality proof for $C_{1,0}$ is Crmarić and Kovač's, posted by Kovač on the Erdős Problems forum in July 2026 and credited in the repository, and base-case transcendence follows a 2023 MathOverflow argument. The new content is the extension to the whole affine family, which is the part with neither formalization nor review.",
  significance: 12,
  significanceNote:
    "A numbered Erdős-Graham problem with more recent traffic than most: Crmarić and Kovač published on it in Colloquium Mathematicum in 2025, Kovač spoke on the surrounding Ahmes-series irrationality problems at CANT 2025, and it has an active forum thread. No Wikipedia article in any language. Slightly above the typical numbered Erdős problem at 10 for that activity, and this entry is one subclass of it rather than the whole problem.",
};

const EXTRA_LINKS = [
  {
    label:
      "Crmarić and Kovač, On the irrationality of certain super-polynomially decaying series - answers Problem 270 as posed",
    url: "https://arxiv.org/abs/2504.18712",
    kind: "independent",
  },
  {
    label: "Erdős Problem #270",
    url: "https://www.erdosproblems.com/270",
    kind: "problem-record",
  },
];

const DECISION = `Published as a candidate. I read the repository rather than taking it on trust, and the Lean is careful work: the five proof modules carry no sorry, no admit, no declared axiom and no native_decide, and passing Salikhov, Salikhov-Viskina and Beukers as explicit hypotheses instead of burying them in axiom declarations is exactly how a conditional formalization should be written. Two changes and two additions.

resolution goes from partial to candidate. That is this catalog's label for an unrefereed self-published claim, not a judgement on the work - a 79-page disproof of Yau-Tian-Donaldson is filed the same way - and it moves up as review happens. The affine-only scope is still stated in the result note.

The result note now also records that Problem 270 as Erdos and Graham posed it was answered no by Crmaric and Kovac in 2025, so the surviving open question is the non-decreasing case. Without that, "the affine subclass of Problem 270" reads as progress on the headline problem. Your credit to them for the base case and the Gaussian representation is kept, and their paper is now linked.

One request, and it is why the entry carries a note about provenance. The manuscript's disclosure is one line: "This manuscript was written and checked using generative AI." Read at face value that is writing and proofreading, which this site treats as out of scope entirely. What you told us on submission is a different claim altogether - that Codex rediscovered the denominator argument and developed the affine extension. I have classified the entry AI-discovered on your account, because you are the author, but a reader following the source link cannot see any of it. You have already written the text; putting it in the README or the manuscript would make the top-tier classification checkable by anyone. Tell me when it is there.

Also filled: significance 12.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, resolution: true, aiContribution: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      throw new Error(`${k} over by ${v.length - lim} (${v.length}/${lim})`);
    }
    if (lim && typeof v === "string") console.log(`  ${k}: ${v.length}/${lim}`);
  }
  if (DECISION.length > MESSAGE_MAX) throw new Error(`decision over by ${DECISION.length - MESSAGE_MAX}`);

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  resolution     : ${cur.resolution} -> ${NEXT.resolution}`);
  console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +${EXTRA_LINKS.length} links, status -> published`);
  console.log(`  decision       : ${DECISION.length}/${MESSAGE_MAX} chars`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: DECISION,
        reviewReason: "edited",
        links: { create: EXTRA_LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: {
        userId: cur.submittedById!,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "decision",
        reason: "edited",
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
