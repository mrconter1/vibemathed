// Adds the Lyons-White conjecture entry (Defant and Ono, arXiv 2608.27708,
// 27 August 2026) as a curator-created published entry.
//
// Read before writing: the arXiv full text (the human-AI collaboration
// paragraph, the acknowledgement, the three theorems), the AxiomMath/LyonsWhite
// repository (Challenge/Basic.lean statement surface, README noting the
// formalization "assumes standard facts from analysis and group theory" and
// was verified locally with Comparator), and Lyons and White's own paper
// (arXiv 2109.10386, Ann. Probab. 51 (2023)) for the question as posed.
//
// Tier: lean-checked, as with the AxiomProver prime-gaps entries - a kernel
// check conditional on results taken as axioms, not audited here. Resolution:
// resolved, since the question has a yes/no answer and the paper gives it in
// both directions (Theorem C settles the non-even exponents too).
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { Prisma, PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const SLUG = "lyons-white-conjecture-rate-monotonicity";

const FIELDS: Record<string, unknown> = {
  name: "The Lyons–White conjecture: rate-monotonicity of $\\ell^{2m}$ distances for random walks on dihedral groups",
  shortName: "Lyons–White conjecture",
  fieldGroup: "Probability & statistics",
  field: "Random walks on finite groups; mixing; harmonic analysis on groups",
  statement:
    "Let $D_n$ be the dihedral group of order $2n$ and run a continuous-time random walk on it driven by symmetric jump rates whose support generates the group. Call the pair $(D_n,p)$ rate-monotonic if, at every fixed time, the $\\ell^p$ distance between the walk's distribution and the uniform distribution can only decrease when the rates are increased. Lyons and White (Ann. Probab. 51, 2023) proved this for $p=2$ and $p=\\infty$, found pairs $(D_n,p)$ that fail it for $p$ in $[1,1.997]\\cup[2.001,3.999]\\cup[4.001,5.995]$, and asked whether any pair fails for $p=4$ or $p=6$.",
  posedBy:
    "Russell Lyons and Graham White, Monotonicity for continuous-time random walks",
  yearPosed: 2023,
  solveType: "proved",
  resolution: "resolved",
  resolutionMethod: "argument",
  solveDate: "2026-08-27",
  model: "AxiomProver",
  modelMaker: "Axiom Math",
  humanCollaborators: ["Colin Defant", "Ken Ono"],
  aiContribution: "ai-co-developed",
  aiRole:
    'The paper\'s own account: "The proofs in this paper were generated through human-AI collaboration. In dialogue with AI, the human authors developed and formalized [Theorems A, B and C] with AxiomProver, an AI system currently under development by Axiom Math. In particular, this resulted in a formal Lean certificate for these three theorems." Both authors are at Axiom Math. Co-developed rather than assisted because the proofs themselves, not only the formalization, are described as produced in dialogue with the system; not discovered, because the humans directed the work and no autonomous run is claimed.',
  verification: "lean-checked",
  verificationNote:
    'Lean-checked, statement unaudited, as with the other AxiomProver entries here. The repository AxiomMath/LyonsWhite carries a Challenge/Basic.lean statement surface and a Comparator configuration, and its README says the development was verified locally against the challenge; the paper says the formalization "assumes standard facts from analysis and group theory" and lists none, so the certificate is conditional on those assumptions and this site has not enumerated them or rebuilt the development. A thirteen-page preprint ten days old, not peer reviewed, no independent reader on record.',
  resultNote:
    "No such pair exists: for every positive integer $m$ and every $n$, $(D_n,2m)$ is rate-monotonic (Theorem A), and more generally so is every inversion extension of a finite abelian group by an involution, a family containing the generalized dihedral, dicyclic and generalized quaternion groups (Theorem B). The picture is completed in the other direction: for every real $p\\ge 1$ that is not an even integer there is an $n$ with $(D_n,p)$ not rate-monotonic (Theorem C), so the even integers are exactly the exponents for which monotonicity holds on the dihedral groups.",
  significance: 15,
  significanceNote:
    "A precise question from a 2023 Annals of Probability paper by a leading probabilist, answered completely, with the converse characterisation thrown in. Three years old and in a specialised corner of mixing theory, so a rung above a numbered Erdős problem rather than a named conjecture with a long literature.",
  publication: "preprint",
  sourceUrl: "https://arxiv.org/abs/2608.27708",
  sourceName: "Proof of the Lyons–White Conjecture (arXiv 2608.27708)",
  status: "published",
  reviewReason: "edited",
};

const LINKS = [
  {
    label:
      "Lean formalization (AxiomMath/LyonsWhite), Comparator-verified against Challenge/Basic.lean",
    url: "https://github.com/AxiomMath/LyonsWhite",
    kind: "lean-proof",
  },
  {
    label: "Challenge/Basic.lean, the statement surface",
    url: "https://github.com/AxiomMath/LyonsWhite/blob/main/Challenge/Basic.lean",
    kind: "lean-statement",
  },
  {
    label:
      "Lyons and White, Monotonicity for continuous-time random walks (the question)",
    url: "https://arxiv.org/abs/2109.10386",
    kind: "problem-record",
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
    "SELECT current_database() AS db",
  );
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const exists = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true },
  });
  console.log(`slug ${SLUG}: ${exists ? `EXISTS (${exists.status})` : "free"}`);
  const dups = await prisma.problem.findMany({
    where: {
      OR: [
        { name: { contains: "Lyons", mode: "insensitive" } },
        { name: { contains: "rate-monotonic", mode: "insensitive" } },
      ],
    },
    select: { slug: true, status: true },
  });
  console.log(
    `name matches: ${dups.length ? dups.map((d) => `${d.slug} (${d.status})`).join(", ") : "none"}`,
  );

  let bad = 0;
  for (const [k, v] of Object.entries(FIELDS)) {
    const lim = LIMITS.get(k);
    if (typeof v === "string" && lim) {
      const over = v.length > lim;
      console.log(
        `  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`,
      );
      if (over) bad++;
    }
  }
  for (const l of LINKS) {
    console.log(`  link             : ${l.label.length}/120  ${l.kind}`);
    if (l.label.length > 120) bad++;
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);
  if (exists) throw new Error("slug taken");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const admin = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!admin) throw new Error("curator not found");

  const created = await prisma.problem.create({
    data: {
      slug: SLUG,
      ...FIELDS,
      reviewedAt: new Date(),
      links: { create: LINKS.map((l, position) => ({ ...l, position })) },
    } as unknown as Prisma.ProblemCreateInput,
    select: { id: true },
  });
  await prisma.problemActivity.create({
    data: {
      problemId: created.id,
      userId: admin.id,
      userName: admin.pseudonym,
      type: "approved",
    },
    select: { id: true },
  });
  console.log(
    `\nAPPLIED - created ${SLUG}; published entries now ${await prisma.problem.count({ where: { status: "published" } })}`,
  );
}

main().finally(() => prisma.$disconnect());
