// Adds arXiv:2608.05781 (Bevins and Bidav), reported by an author as
// AI-generated and missed by the scan.
//
// This is the rare submission whose entire logical content is a certificate:
// three printed matrices A over F_{q^2} and two checks on each,
//
//     A conj(A)^T = -I_k          (Hermitian self-duality of [I_k | A])
//     det A[R,C] != 0             for every square submatrix (MDS)
//
// after which the stabilizer construction gives AME(2k,q) and one-party
// projection gives AME(2k-1,q). So it is re-runnable end to end, and
// check_ame.py re-runs it: own F_{p^2} arithmetic built from the printed
// minimal polynomials, own determinant, nothing from the authors' code.
//
// Everything checks. A conj(A)^T = -I for all three; all 923 minors of the
// 6x6 and all 48,619 of each 9x9 are nonzero, 98,161 in total, matching the
// counts the paper states; the nine convolution equations that the paper says
// are equivalent to self-duality for the group-circulant blocks hold; and the
// Schur square of the length-twelve code has dimension 12, which is the
// paper's own argument that it is not monomially equivalent to a GRS code
// (every GRS [12,6] code has Schur-square dimension at most 11). The field
// conventions were sanity-checked first: Frobenius is an involution and norms
// land in the base field.
//
// That is what site-confirmed means on this site, and it is a cleaner instance
// than most: the certificate is the proof, so re-running it is not corroborating
// evidence, it is the verification.
//
// What could not be checked is the openness claim, and the entry says so.
// The Huber-Wyderka table's reachable copy (tp.nt.uni-siegen.de/ame, last
// updated 22 Feb 2024) covers local dimensions up to 10 only. At D=5 it lists
// Yes for n <= 10 and No from n = 28 up, so AME(12,5) sits in its unknown
// region - open, as the paper says. But the huberfe.github.io/ame URL the
// paper cites now 404s, and the copy I could reach has no D=11 or D=13 axis at
// all, so the q=11 status could not be confirmed against the table itself. The
// paper's own prior-art comparisons (Sok-Yang's length-eighteen self-dual codes
// reach distance nine not ten; the length-twelve q=5 constructions reach six
// not seven) are the load-bearing openness evidence, and Felix Huber, who
// maintains the table, is thanked for feedback on the manuscript.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient, type Prisma } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "ame-states-five-open-cases";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const FIELDS: Record<string, unknown> = {
  name: "Absolutely Maximally Entangled States in Five Open Cases",
  shortName: "AME states, five open cases",
  fieldGroup: "Quantum information & computing",
  field: "Quantum error correction / AME states",
  statement:
    "A pure state of $n$ parties with $q$ levels each is absolutely maximally entangled, written $\\mathrm{AME}(n,q)$, when every subsystem of at most $\\lfloor n/2 \\rfloor$ parties is maximally mixed. These are the perfect tensors, and existence is a parameter-by-parameter problem: some $(n,q)$ admit one, some provably do not, and a maintained table records which cells are still unknown.\n\nThis paper settles five of them. It exhibits Hermitian self-dual MDS codes $[12,6,7]_{25}$, $[18,9,10]_{121}$ and $[18,9,10]_{169}$, from which the stabilizer construction gives $\\mathrm{AME}(12,5)$, $\\mathrm{AME}(18,11)$ and $\\mathrm{AME}(18,13)$, and projecting one party gives $\\mathrm{AME}(17,11)$ and $\\mathrm{AME}(17,13)$.",
  posedBy: null,
  yearPosed: null,
  solveType: "proved",
  resolution: "resolved",
  resolutionMethod: "construction",
  solveDate: "2026-08-06",
  model: "Claude Fable 5, ChatGPT 5.6 Sol",
  modelMaker: "Anthropic, OpenAI",
  humanCollaborators: ["Samuel Bevins", "Yunus Bidav"],
  aiRole:
    "From the paper's \"Author contributions and AI use\" section, in the authors' words: under their direction, Claude Fable 5 (Anthropic) and ChatGPT 5.6 Sol (OpenAI) were used extensively throughout the project, including the entire computational search, the development and implementation of search methods, exact verification, bibliographic checks, and manuscript preparation. Both authors independently reviewed the constructions, computations and full text.\n\nThe objects are the result here, and the search that produced them is attributed to the models in full, which is why this is classified AI-discovered rather than assisted. One of the authors reported the paper to this site, noting it was almost entirely AI-generated.",
  aiContribution: "ai-discovered",
  verification: "site-confirmed",
  verificationNote:
    "This site re-ran the certificate. The paper's logical content is three printed matrices and two checks on each, so verification means doing the checks again - here with field arithmetic built from the printed minimal polynomials and an independent determinant routine, nothing taken from the authors' code.\n\nAll three matrices satisfy $A\\overline{A}^{\\mathsf T} = -I_k$. Every nonempty square minor is nonzero: 923 for the $6 \\times 6$ block and 48,619 for each $9 \\times 9$, 98,161 in total, matching the counts the paper states. The nine convolution equations that the paper says are equivalent to self-duality for the group-circulant blocks hold. And the Schur square of the length-twelve code has dimension 12, the paper's own argument that it is not monomially equivalent to a generalized Reed-Solomon code, since every GRS $[12,6]$ code has Schur-square dimension at most 11. The field conventions were checked first: Frobenius is an involution and norms land in the base field.\n\nWhat this does not settle is whether the five cases were open. The reachable copy of the Huber-Wyderka table (last updated February 2024) covers local dimensions up to 10, and $\\mathrm{AME}(12,5)$ does sit in its unknown region, but it has no $q=11$ or $q=13$ axis, and the URL the paper cites for a newer version is dead. The paper's prior-art comparisons stand unchecked here.",
  significance: 12,
  significanceNote:
    "Individual cells of the AME existence table, not the general existence problem. That problem is genuinely well known in quantum information - perfect tensors underpin holographic codes and quantum secret sharing, and it appears on published open-problem lists - but any one parameter pair is an ordinary table entry. Above the anchor at 10 for a typical numbered Erdos problem, because the table is actively maintained and consulted and its maintainer engaged with this manuscript. Below the named-conjecture band at 15.",
  resultNote:
    "Five existence statements, all by explicit construction: $\\mathrm{AME}(12,5)$, $\\mathrm{AME}(17,11)$, $\\mathrm{AME}(18,11)$, $\\mathrm{AME}(17,13)$ and $\\mathrm{AME}(18,13)$. The $[12,6,7]_{25}$ code came from a direct search with no symmetry imposed; its automorphism group turned out to have a regular $\\mathbb{Z}_3^2$ coordinate orbit, and imposing that translation symmetry on two nine-coordinate orbits collapses an unrestricted $9 \\times 9$ block to a nine-element kernel, which is what made the length-eighteen searches feasible.\n\nThe symmetry is search scaffolding, not part of the proof: the three printed matrices and the two checks suffice on their own. The paper is explicit that the searches were not exhaustive, so it proves existence and classifies nothing - equivalence and classification for these parameters stay open. The length-twelve code is also shown not to be monomially equivalent to a generalized Reed-Solomon code.",
  publication: "preprint",
  sourceUrl: "https://arxiv.org/abs/2608.05781",
  sourceName: "Symmetry-guided constructions of AME states in five open cases",
  renownLangs: 0,
};

const LINKS = [
  {
    label: "Huber and Wyderka, Table of AME states - the existence table these cells come from",
    url: "https://tp.nt.uni-siegen.de/ame/ame.html",
    kind: "problem-record",
  },
  {
    label: "Grassl, Tables of linear codes and quantum codes",
    url: "https://www.codetables.de/",
    kind: "problem-record",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const existing = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (existing) throw new Error(`${SLUG} already exists`);

  let bad = 0;
  for (const [key, value] of Object.entries(FIELDS)) {
    const lim = LIMITS.get(key);
    if (lim && typeof value === "string" && value.length > lim) {
      console.log(`  ${key} OVER BY ${value.length - lim} (${value.length}/${lim})`);
      bad++;
    }
  }
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}`);
      bad++;
    }
  }

  console.log(`new entry: ${SLUG}\n`);
  for (const [key, value] of Object.entries(FIELDS)) {
    const s = value === null ? "(null)" : String(value);
    console.log(`  ${key}: ${s.length > 100 ? `${s.slice(0, 100)}...` : s}`);
  }
  console.log(`\n  links: ${LINKS.length}`);
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  // FIELDS is keyed by name for the limit check above, so it arrives as
  // Record<string, unknown>; the cast is on the assembled row, once.
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

  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${SLUG} created, ${published} published`);
}

main().finally(() => prisma.$disconnect());
