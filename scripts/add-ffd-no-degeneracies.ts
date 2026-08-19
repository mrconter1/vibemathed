// Free fermions in disguise without exponential degeneracies, arXiv:2606.09462.
// Submitted by the author in conversation, 19 Aug 2026.
//
// The abstract says "research assistant", which is bottom-rung language and
// would have put this out of scope. The Supplemental Material says something
// quite different, and it is the most precise AI-use disclosure this site has
// assessed. In the author's own words the AI:
//
//   * performed the algebraic computations for a classification of
//     medium-range spin chains, generating the lists of integrable
//     Hamiltonians in which this model appeared in the first place;
//   * discovered the quadratic cross-relations between the generators of H1
//     and H2, from which their commutativity follows;
//   * found the correct recipe for open boundary conditions, which is the
//     step that makes an FFD solution possible at all, and recognised the
//     relations as similar to those of Fendley-Pozsgay;
//   * and proved Theorem 5.1, of which the author writes: "Theorem 5.1 is
//     central in this work, and its proof is entirely the result of the AI."
//
// Co-developed rather than discovered, and the supplement is why in both
// directions. Each step is a subproblem the author formulated and the model
// solved, the overall strategy was the author's, and the author ran a control:
// asked cold, with no context, whether it could construct such a model, the AI
// produced two general ideas and concrete models that all fell into the
// uninteresting family. It could not do this unprompted. The author's own
// summary is that "both the author and the AI played an essential role", which
// is co-developed exactly.
//
// In scope: the question predates the work and is the author's own. "The
// author was interested in the question of whether Hamiltonians that fall
// under the broad umbrella term free fermions in disguise can have a
// non-degenerate spectrum. The author was unable to find such a model."
// Self-posed questions are admitted and score near the floor.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient, type Prisma } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "ffd-without-exponential-degeneracies";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const FIELDS: Record<string, unknown> = {
  name: "Free Fermions in Disguise without Exponential Degeneracies",
  shortName: "FFD without exponential degeneracies",
  fieldGroup: "Mathematical physics",
  field: "Integrable spin chains",
  statement:
    "A number of spin chains are solvable by hidden free-fermionic structures that go beyond the Jordan-Wigner transformation, the family known as \"free fermions in disguise\". Every example in the literature shared an awkward feature: degeneracies growing exponentially with the volume, and homogeneous across the spectrum, so every energy level carried the same degeneracy.\n\nThe question is whether that feature is forced. Can a model in this family have a spectrum free of exponential degeneracies, or does the hidden structure always impose them?\n\nThis exhibits one. The model is a particular perturbation of two Ising chains, and can equally be read as an interpolation between a Jordan-Wigner solvable chain and Fendley's original FFD model. For generic coupling constants its spectrum has no exponential degeneracies.",
  posedBy: "Balázs Pozsgay",
  yearPosed: 2026,
  solveType: "proved",
  resolution: "resolved",
  resolutionMethod: "construction",
  solveDate: "2026-06-08",
  model: "ChatGPT 5.4 Pro, ChatGPT 5.5 Pro",
  modelMaker: "OpenAI",
  humanCollaborators: ["Balázs Pozsgay"],
  aiRole:
    "The abstract says \"research assistant\". The Supplemental Material is far more specific, and it is what this classification rests on. The AI performed the algebraic computations for a classification of medium-range spin chains, producing the lists of integrable Hamiltonians in which this model first appeared; discovered the quadratic cross-relations between the generators of the two commuting halves; found the recipe for open boundary conditions, which is what makes a free-fermionic solution possible at all; and proved the paper's central theorem. In the author's words: \"Theorem 5.1 is central in this work, and its proof is entirely the result of the AI.\"\n\nCo-developed rather than discovered, for reasons the author supplies himself. Each step is a subproblem he formulated and the model solved, the overall strategy was his, and he ran a control: asked cold, with no context, whether it could construct such a model, the AI returned two general ideas and concrete models that all fell into the uninteresting family. It could not do this unprompted. His summary is that \"both the author and the AI played an essential role\".",
  aiContribution: "ai-co-developed",
  verification: "unreviewed",
  verificationNote:
    "An arXiv preprint, unrefereed, with no independent endorsement, and no mathematics was checked here.\n\nThe AI attribution was checked, and it is the reason this entry exists at all. The abstract's \"research assistant\" sits at or below the bottom of the contribution ladder, which would have put the paper out of scope; the Supplemental Material names four specific contributions and attributes the central theorem's proof outright. Reading it is what moved the classification, and it is linked below so a reader can do the same.\n\nThe author is unusually candid in two directions at once. He writes that the proof strategy is \"relatively simple and relatively standard\" and that \"human researchers would have found this proof\", and he separately reports a cold-start control in which the model failed to construct such a model without context. Both cut against his own result being read as more autonomous than it was.",
  significance: 7,
  significanceNote:
    "A question the author posed and answered in the same work, so it sits near the floor by construction. Above the anchor at 5 for a one-paper question, because the exponential degeneracy is a known property of the whole free-fermions-in-disguise family rather than a feature of one paper, and that family has an active recent literature: Fendley, Elman-Chapman-Flammia, Fendley-Pozsgay, Vernier-Piroli. Below 10, because nobody had set it down in print as an open problem.",
  resultNote:
    "An existence question settled by exhibiting an object, not a general theorem: one model in the family has no exponential degeneracies for generic couplings, and nothing here says which others do.\n\nThe route is worth recording because it is not the one anyone was looking down. The author had tried and failed to find such a model directly. It surfaced instead from an unrelated classification of medium-range spin chains, where the AI's computations produced a list of integrable Hamiltonians and one of them combined two terms of a standard XY chain with two of Fendley's FFD model, a combination nobody had considered. The author noticed it in the list; the rest followed from asking the model a sequence of increasingly specific questions.",
  publication: "preprint",
  sourceUrl: "https://arxiv.org/abs/2606.09462",
  sourceName: "Free fermions in disguise without exponential degeneracies",
  renownLangs: 0,
};

const LINKS = [
  {
    label: "Supplemental Material: the author's itemised account of what the AI contributed",
    url: "https://arxiv.org/src/2606.09462v1/anc/ffdxy-suppm.pdf",
    kind: "other",
  },
  {
    label: "Fendley and Pozsgay, Free fermions beyond Jordan and Wigner (SciPost 2024)",
    url: "https://arxiv.org/abs/2310.19897",
    kind: "paper",
  },
  {
    label: "Elman, Chapman and Flammia, Free fermions behind the disguise (CMP 2021)",
    url: "https://arxiv.org/abs/2012.07857",
    kind: "paper",
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
  for (const l of LINKS) if (l.label.length > 120) { console.log(`  link label OVER: ${l.label}`); bad++; }

  console.log(`new entry: ${SLUG}\n`);
  for (const [key, value] of Object.entries(FIELDS)) {
    const s = value === null ? "(null)" : String(value);
    console.log(`  ${key}: ${s.length > 90 ? `${s.slice(0, 90)}...` : s}`);
  }
  if (bad) throw new Error("fix the flagged fields before applying");
  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

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
  const mp = await prisma.problem.count({ where: { status: "published", fieldGroup: "Mathematical physics" } });
  console.log(`APPLIED - ${await prisma.problem.count({ where: { status: "published" } })} published, ${mp} mathematical physics`);
}

main().finally(() => prisma.$disconnect());
