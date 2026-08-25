// Approve the bounded-mass-property counterexample, cleaning up mangled math
// and filling the blanks. 25 Aug 2026.
//
// Source verified: arXiv:2608.21053v1 [math.CV], 21 Aug 2026, "A
// counterexample to the bounded mass property", Mingchen Xia and Kewei Zhang.
// Title, authors, Hopf-threefold statement and solve date all match the
// submission. Not a duplicate.
//
// The AI disclosure is real and the submitter's paraphrase of it is accurate.
// The paper's acknowledgments read, verbatim: "The initial counterexample was
// constructed with the Rethlas agent (improved by Felix Ye), using the
// gpt-5.6-sol model. The authors then simplified the construction and improved
// the presentation, and are fully responsible for all assertions in this
// paper." For a disproof the counterexample IS the result, and the agent built
// it; ai-discovered stands, on the authors' own account rather than on an
// inference from vague wording.
//
// model string changed from "ChatGPT 5.6 Sol" to "Rethlas (GPT-5.6 Sol)" -
// this is a harness, not a bare model, and the catalog already has a
// convention for exactly that (see MODEL_FAMILIES' own worked example, and the
// Boucksom Local Analytic Bertini entry, which uses this precise string with
// maker OpenAI). It also makes the entry count toward both the agent-systems
// and OpenAI families in the stats rather than only the latter.
//
// The statement and result note arrived with rendering artifacts - zero-width
// spaces, orphaned subscripts, integrals broken into loose characters -
// evidently pasted from a rendered page rather than written as TeX. Rewritten
// as proper math, with the substance unchanged and the problem's standing
// added from the paper's own introduction.
//
// That introduction also supplies what the entry was missing about why the
// question matters: finiteness of the mass is the starting point for the
// theory of volumes of Bott-Chern classes in [BGL25] and a standing hypothesis
// in recent Hermitian pluripotential theory, so a negative answer removes
// something other work is built on. That is now in the result note and drives
// the significance.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "bounded-mass-property-for-compact-complex-manifolds";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  model: "Rethlas (GPT-5.6 Sol)",
  modelMaker: "OpenAI",
  statement:
    "A compact complex manifold $X$ of dimension $n$ has the bounded mass property if, for one (equivalently every) Hermitian form $\\omega$, the Monge-Ampère masses $\\int_X(\\omega+dd^c\\varphi)^n$ are uniformly bounded over all smooth $\\varphi$ with $\\omega+dd^c\\varphi>0$. On a compact Kähler manifold Stokes' theorem makes that mass independent of $\\varphi$ outright; for a merely Hermitian $\\omega$, which is not closed, it genuinely depends on $\\varphi$, and controlling it is a recurring theme of Hermitian pluripotential theory. The property is known to hold in dimension $n\\le2$ and on manifolds of Fujiki class. Boucksom, Guedj and Lu left open whether it holds on every compact complex manifold, raising the question explicitly for Hopf manifolds of dimension at least three. This paper answers it in the negative on the Hopf threefold $X=(\\mathbb{C}^3\\setminus\\{0\\})/\\langle z\\mapsto e^{-1}z\\rangle$.",
  resultNote:
    "Disproved on the Hopf threefold $X=(\\mathbb{C}^3\\setminus\\{0\\})/\\langle z\\mapsto e^{-1}z\\rangle$: Xia and Zhang construct a smooth Hermitian form $\\omega$ and smooth functions $\\varphi_j$ with $\\omega+dd^c\\varphi_j>0$ whose Monge-Ampère masses tend to infinity, so the universal bounded mass property fails already in complex dimension three. The construction uses the Hopf threefold's elliptic fibration, an exact mass identity reducing excess Monge-Ampère mass to a fibrewise Dirichlet energy, and heat-kernel regularizations of Green functions that make that energy diverge while preserving positivity. What the negative answer removes is load-bearing rather than incidental: finiteness of this mass is the starting point for the theory of volumes of Bott-Chern classes, and it enters as a standing hypothesis in recent Hermitian pluripotential theory.",
  aiRole:
    "The paper's acknowledgments, in full: \"The initial counterexample was constructed with the Rethlas agent (improved by Felix Ye), using the gpt-5.6-sol model. The authors then simplified the construction and improved the presentation, and are fully responsible for all assertions in this paper.\" For a disproof the counterexample is the entire result, and the agent produced it; what the authors describe adding is simplification and presentation. So AI-discovered here rests on the authors' own account of what the system did, not on an inference drawn from vague wording. Felix Ye is credited with improving the agent rather than with the mathematics, so he is not listed as a collaborator.",
  verificationNote:
    "An arXiv preprint (v1, 21 August 2026, math.CV), unrefereed and with no independent endorsement. No mathematics was checked here, and there is nothing mechanical to check it against - no formalization, no computational certificate. Verified on 25 August 2026: the paper exists at arXiv:2608.21053, and its title, authors, Hopf-threefold statement and date match this entry; its acknowledgments carry the AI disclosure quoted above word for word; and the reference it answers is real - Boucksom, Guedj and Lu, \"Volumes of Bott-Chern classes\" (arXiv:2406.01090, Peking Math. J. 2025). The paper's introduction is the source for the problem's standing - bounded mass known for $n\\le2$ and for Fujiki class, the question raised explicitly for Hopf manifolds of dimension at least three in [BGL25, Example 1.19] - which is the authors' characterization of what was open rather than an independent literature search run here.",
  significance: 16,
  significanceNote:
    "A question raised explicitly in a 2025 paper of Boucksom, Guedj and Lu, answered in the negative a year later. Sits beside Boucksom's Local Analytic Bertini conjecture at 15, its closest sibling in this catalog, and one above it because what fails here is load-bearing: finiteness of the Monge-Ampère mass is the starting point for the theory of volumes of Bott-Chern classes and a standing hypothesis in recent Hermitian pluripotential theory, so the answer constrains work already resting on it. Specialist throughout, in non-Kähler complex geometry.",
};

const LINKS = [
  {
    label: "Boucksom, Guedj, Lu - Volumes of Bott-Chern classes, where the question is raised",
    url: "https://arxiv.org/abs/2406.01090",
    kind: "problem-record",
  },
];

const DECISION = `Published, with the mathematics re-typeset and the blanks filled. No downgrade - this one is accurate about itself.

The statement and result note arrived with rendering artifacts: zero-width spaces, orphaned subscripts, and integrals broken into loose characters. They had clearly been pasted from a rendered page rather than written as TeX, and would have displayed badly. Both are now proper math, with the substance unchanged.

I verified the source rather than trusting it: arXiv:2608.21053v1, Xia and Zhang, 21 August, title and Hopf-threefold statement matching. Your AI-role summary is accurate - I read the acknowledgments and they say exactly what you said they say, so I replaced the paraphrase with the verbatim quote. AI-discovered stands, and for the right reason: in a disproof the counterexample is the whole result, and the authors say the agent built it while they simplified and presented.

One change worth explaining. The model string goes from "ChatGPT 5.6 Sol" to "Rethlas (GPT-5.6 Sol)", because Rethlas is a harness rather than a bare model and this catalog has a convention for that - the Boucksom Local Analytic Bertini entry uses this exact string. It also makes the entry count toward both the agent-systems and OpenAI families in the stats instead of only OpenAI.

I also pulled one thing from the paper's introduction that your notes did not draw out, because it changes how much the result matters: finiteness of this mass is the starting point for the theory of volumes of Bott-Chern classes and a standing hypothesis in recent Hermitian pluripotential theory. So the negative answer removes something other work rests on, rather than closing an isolated curiosity. That is now in the result note, and it is why significance is 16 rather than level with the neighbouring Boucksom entry at 15.

Also filled: verification note, and a link to the Boucksom-Guedj-Lu paper (arXiv:2406.01090, verified).`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, model: true, significance: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) { console.log(`  LABEL OVER`); bad++; }
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG} (${cur.status})`);
  console.log(`  model        : ${cur.model} -> ${NEXT.model}`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  ${Object.keys(NEXT).length} fields set, +${LINKS.length} link, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

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
        links: { create: LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
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
