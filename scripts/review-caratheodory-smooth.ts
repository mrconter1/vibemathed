// Approve the smooth Carathéodory submission, with corrections.
//
// Three changes to what was submitted, each evidenced:
//
// 1. The title said "$\mathbb{C}^\infty$", which is complex n-space. The
//    conjecture is about C^infinity smoothness. A mathematical error in the
//    one field every reader sees first.
//
// 2. aiContribution drops from ai-co-developed to ai-assisted. The
//    formalization's own module docstring says the announcement "credits
//    John-Paul Smith and Claude with checking the construction", and the Lean
//    development was done with Codex. Checking a human construction and then
//    formalizing it is assistance; the methodology excludes formalizations of
//    human results from counting as the contribution.
//
// 3. Missing fields filled from Ghomi's problem list, which the formalization
//    itself cites: Problem 8.1 (Carathéodory, 1922), earliest references via
//    Struik in Cohn-Vossen, Blaschke and Hamburger; Hamburger settled the
//    analytic case in 1940-41.
//
// Verified before approving, at the commit the formal_proof attribute pins
// (7aa855b in google-deepmind/formal-conjectures):
//   - the formalized hypothesis IS the classical one, not a weakened variant:
//     IsConvexSphereOfClass demands Topology.IsEmbedding and range F =
//     frontier K for a compact convex K with nonempty interior. "Parametrized"
//     is the Gauss-parametrization technique, not an immersion loophole.
//   - the pinned line 75 is not_caratheodoryConjectureOfClass_infty, i.e. the
//     smooth statement, and the proof tree is 8013 lines with zero sorry,
//     zero declared axioms and no native_decide.
//   - that commit is NOT merged: it is diverged from main, ahead 11 behind 26,
//     and both upstream PRs (#5066 statements, #5070 proof) are drafts whose
//     author writes "I'm currently checking this ... please ignore".
// Hence lean-checked rather than lean-verified, and candidate rather than
// resolved.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "mathbb-c-infty-caratheodory-conjecture";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  name: "The $C^\\infty$ Carathéodory Conjecture on Umbilic Points",
  shortName: "Carathéodory conjecture (smooth)",
  fieldGroup: "Geometry & topology",
  field: "Differential geometry",
  statement:
    "Carathéodory's conjecture, Problem 8.1 of Ghomi's list and traceable to 1922, asks whether every closed convex surface in $\\mathbb{R}^3$ has at least two umbilic points. Hamburger settled the real-analytic case in 1940-41 and it stands. The $C^\\infty$ case is false: an explicit support function gives a smoothly embedded two-sphere bounding a convex body with exactly one umbilic point. The same family disproves the smooth Loewner conjecture, whose member at $k=1$ has an isolated trace-free Hessian zero of winding number three.",
  posedBy: "Constantin Carathéodory",
  yearPosed: 1922,
  solveType: "disproved",
  resolution: "candidate",
  resolutionMethod: "construction",
  model: "Claude, Codex",
  modelMaker: "Anthropic, OpenAI",
  humanCollaborators: ["Levent Alpöge", "John-Paul Smith"],
  aiRole:
    "Two distinct roles, neither of them the discovery. The formalization's module docstring records that Alpöge's announcement \"credits John-Paul Smith and Claude with checking the construction\", so the model's part was verifying a human construction. Separately, the Lean development was, in its author's words, \"developed with Codex and parallel proof-review agents\" - a formalization of a human result, which the methodology does not count as the contribution. Recorded as assisted rather than co-developed for that reason; the submission proposed co-developed.",
  aiContribution: "ai-assisted",
  verification: "lean-checked",
  verificationNote:
    "Audited by this site on 21 August 2026 at the commit the formal_proof attribute pins (7aa855b, google-deepmind/formal-conjectures). The formalized hypothesis is the classical statement and not a weakened one: IsConvexSphereOfClass requires Topology.IsEmbedding together with range F = frontier K for a compact convex K of nonempty interior, so \"parametrized\" names the Gauss parametrization rather than admitting mere immersions. The pinned line is not_caratheodoryConjectureOfClass_infty, the smooth statement, and the proof tree is 8013 lines carrying zero sorry, zero declared axioms and no native_decide. Not lean-verified, because that commit is NOT merged - it is diverged from main by 11 commits and behind by 26, and both upstream pull requests are drafts, #5070 saying \"I'm currently checking this ... please ignore\". The Lean was read here, not compiled, and the announcement itself is an X post.",
  significance: 55,
  significanceNote:
    "A named conjecture of 1922 that stood 104 years, whose analytic half is a celebrated theorem of Hamburger, and the counterexample takes the smooth Loewner conjecture with it. Set level with the cycle double cover and sum-product anchors at 55: unmistakably a landmark inside differential geometry, without the cross-field currency of the Jacobian conjecture at 65.",
  resultNote:
    "Only the smooth case falls. Hamburger's real-analytic theorem is untouched, and the counterexample is explicitly a $C^\\infty$ object, so the conjecture's classical analytic form remains true. The gap between the two is the whole content of the result.",
  publication: "announcement",
  sourceName: "Levent Alpöge, X announcement of the smooth counterexample",
};

const LINKS = [
  { label: "Lean proof, sorry-free at the pinned commit", url: "https://github.com/google-deepmind/formal-conjectures/blob/7aa855bb344450777d9b19fe1cf11f2f5f9fae09/FormalConjectures/Other/CaratheodoryLoewnerCounterexample.lean", kind: "lean-proof" },
  { label: "The informal proof accompanying the formalization", url: "https://github.com/google-deepmind/formal-conjectures/blob/7aa855bb344450777d9b19fe1cf11f2f5f9fae09/FormalConjectures/Other/CaratheodoryLoewnerCounterexample.md", kind: "paper" },
  { label: "Lean statement of the smooth and analytic conjectures", url: "https://github.com/google-deepmind/formal-conjectures/pull/5066", kind: "lean-statement" },
  { label: "Ghomi, Open Problems in Geometry of Curves and Surfaces (Problem 8.1)", url: "https://ghomi.math.gatech.edu/Papers/op.pdf", kind: "problem-record" },
];

const DECISION = `Approved, with three corrections. Thank you for it - this is a significant entry and the source held up under checking.

The title said $\\mathbb{C}^\\infty$, which is complex n-space; the conjecture is about $C^\\infty$ smoothness, so that is fixed. I also filled the fields your submission left empty, from Ghomi's problem list that the formalization itself cites: Carathéodory, 1922, with Hamburger settling the real-analytic case in 1940-41.

The one substantive change is the contribution tier, from co-developed down to assisted. The formalization's own docstring says the announcement "credits John-Paul Smith and Claude with checking the construction", and the Lean was "developed with Codex and parallel proof-review agents". Checking a human construction and then formalizing it is assistance; the methodology does not count a formalization of a human result as the contribution. If the announcement says more than that about where the construction came from, point me at it and I will revisit.

What I verified rather than assumed: the formalized hypothesis is the real conjecture, not a weakened one - it demands a topological embedding whose range is the frontier of a compact convex body - and the pinned proof tree is 8013 lines with no sorry, no declared axioms and no native_decide. It stays a candidate at lean-checked because that commit is not merged, both upstream PRs are drafts, and #5070's author writes that he is still checking it.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, name: true, aiContribution: true },
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
  }
  if (DECISION.length > MESSAGE_MAX) throw new Error(`decision over by ${DECISION.length - MESSAGE_MAX}`);

  console.log(`${SLUG} (${cur.status})`);
  console.log(`  name : ${cur.name}\n      -> ${NEXT.name}`);
  console.log(`  ai   : ${cur.aiContribution} -> ${NEXT.aiContribution}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, ${LINKS.length} links, status -> published`);
  console.log(`  decision message: ${DECISION.length}/${MESSAGE_MAX} chars`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: DECISION,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
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
        body: DECISION,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
