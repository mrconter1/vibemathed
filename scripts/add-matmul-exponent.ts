// arXiv:2608.16884, omega < 2.371177 with AlphaEvolve. 19 Aug 2026.
//
// Partial, not resolved, and that is the whole filing decision. A better upper
// bound on omega does not settle what omega is, and "is omega = 2?" is exactly
// as open as it was. Same shape as the zeta-zeros entry, which is also a
// record improvement filed as partial.
//
// Tier is ai-co-developed. The paper lists three improvements and AlphaEvolve
// is the third: reformulating the optimization problem, designing a new
// optimization algorithm with ML, then refining that algorithm with
// AlphaEvolve. That is a named essential step inside a human-led paper, not a
// model handed a conjecture. It also matches how nine of the twelve existing
// AlphaEvolve entries are tiered.
//
// Significance 55. The band for 50 to 60 is "conjectures with textbooks and
// subfields organized around them", and the matrix multiplication exponent has
// precisely that: the laser method, tensor rank, the group-theoretic approach,
// sixty years from Strassen. Above every current theoretical-computer-science
// entry (the highest is 39) because those are single questions inside
// subfields, where this is the one the subfield is built around. Below the
// zeta proportion at 68, which is attached to the Riemann hypothesis.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient, type Prisma } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "matrix-multiplication-exponent-2371177";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const FIELDS: Record<string, unknown> = {
  name: "The Matrix Multiplication Exponent",
  shortName: "Matrix multiplication exponent",
  fieldGroup: "Theoretical computer science",
  field: "Algebraic complexity",
  statement:
    "The matrix multiplication exponent $\\omega$ is the infimum of all $t$ for which two $n \\times n$ matrices can be multiplied in $O(n^t)$ arithmetic operations. Strassen showed in 1969 that $\\omega < 3$, and sixty years of work has driven the upper bound down without anyone knowing the true value. Whether $\\omega = 2$ is one of the central open questions of algebraic complexity.\n\nThe current bounds come from the laser method as refined by combination loss analysis. This paper attacks the optimization problem at the core of that refinement, reformulating it so it can be solved in a larger setting, designing a new optimization algorithm for it, and then refining that algorithm with AlphaEvolve.\n\nThe result is $\\omega < 2.371177$, improving the previous best of $2.371339$.",
  posedBy: "Volker Strassen",
  yearPosed: 1969,
  solveType: "proved",
  resolution: "partial",
  resolutionMethod: "computation",
  solveDate: "2026-08-17",
  model: "AlphaEvolve",
  modelMaker: "Google DeepMind",
  humanCollaborators: [
    "Emilien Dupont",
    "Marvin Eisenberger",
    "Borislav Kozlovskii",
    "Abbas Mehrabian",
    "Francisco J. R. Ruiz",
    "Abigail See",
    "Renfei Zhou",
    "Josh Alman",
    "Virginia Vassilevska Williams",
    "Matej Balog",
  ],
  aiRole:
    "The paper describes three improvements to the optimization problem at the heart of combination loss analysis, and AlphaEvolve is the third of them. In the authors' own order: they reformulate the problem so it can be solved in a larger setting than was previously possible, they leverage recent advances in machine learning to design a new optimization algorithm for it, and then they \"refine the resulting optimization algorithm with AlphaEvolve\".\n\nCo-developed rather than discovered. The model improves a component of a human-designed pipeline rather than being handed the problem, and the reformulation that made the larger setting tractable is the authors' own. It is more than tooling, though, because the refined optimizer is what produces the bound.",
  aiContribution: "ai-co-developed",
  verification: "unreviewed",
  verificationNote:
    "A two-day-old arXiv preprint, unrefereed, and nothing was checked here. Bounds of this kind are not the sort of claim a reader can spot-check: the number falls out of a large optimization over laser-method parameters, so reproducing it means re-running the optimization rather than verifying a certificate.\n\nWhat the author list is worth saying: Josh Alman and Virginia Vassilevska Williams are authors of the prior bounds this improves on, which is unusual and cuts against the main risk with an automated search, namely that it optimizes something subtly different from the quantity everyone means by $\\omega$.",
  significance: 55,
  significanceNote:
    "The exponent of matrix multiplication, with sixty years of work and an entire subfield organised around it: the laser method, tensor rank, the group-theoretic approach, and a chain of records from Strassen through Coppersmith-Winograd to the present. That is the 50 to 60 band, textbooks and a subfield rather than a single question inside one. Above every current theoretical-computer-science entry, the highest of which is 39, and below the zeta proportion at 68, which is attached to the Riemann hypothesis. Scored on the problem, so the size of this particular improvement does not enter.",
  resultNote:
    "A record, not a resolution, and a small one by design. The bound moves from $2.371339$ to $2.371177$, about $1.6 \\times 10^{-4}$, and the authors describe it as a small step. Whether $\\omega = 2$ is untouched, and nothing here suggests the laser method can reach it.\n\nThe interesting claim is methodological rather than numerical. The bottleneck in this line of work is a hard optimization problem, and the paper reports progress by reformulating that problem and then improving the optimizer, with AlphaEvolve doing the final refinement. That is a different kind of contribution from a new mathematical identity, and it is why the entry is filed as computation.",
  publication: "preprint",
  sourceUrl: "https://arxiv.org/abs/2608.16884",
  sourceName: "Improving the matrix multiplication exponent with modern optimization and AlphaEvolve",
  renownLangs: 0,
};

const LINKS = [
  {
    label: "Balog's announcement thread",
    url: "https://x.com/matejbalog/status/2089597390369984794",
    kind: "announcement",
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
  console.log(`APPLIED - ${await prisma.problem.count({ where: { status: "published" } })} published`);
}

main().finally(() => prisma.$disconnect());
