// Add the tilted residue-class prime-gap record. 30 Aug 2026.
//
// Not a submission - surfaced from an X thread by Jared Duker Lichtman and
// traced back to the artifact here.
//
// SOURCE FOUND AND VERIFIED. Nothing is on arXiv, which is expected: the paper's
// sole author is "GPT 5.6 Sol" and arXiv does not accept a model as an author.
// It lives in Boris Alexeev's Lean repository:
//   paper  plby/lean-proofs  output/pdf/Erdos_4_GPT_5.6_Sol.tex   (114 KB)
//   Lean   plby/lean-proofs  src/latest/ErdosProblems/Erdos4Tilted.lean + Erdos4/
// `plby` is Boris Alexeev by GitHub profile, which is the formaliser the thread
// named. Repo last pushed 2026-08-30.
//
// THE BOUND, and why the "log_3" in the thread is right. FGKMT18 gives
//   p_{n+1} - p_n  >>  log n . log_2 n . log_4 n / log_3 n
// this paper claims
//   G(T)  >>  log T . log_2 T / log_4 T
// The ratio is log_3 / (log_4)^2, which is what cloneofsimo quoted and what
// Lichtman rounded to "a factor of about log_3(n)". The two independent
// descriptions agree with the abstract, so the arithmetic is self-consistent.
//
// LEAN AUDITED AT SOURCE, and it is unusually clean:
//   403 .lean files under Erdos4/, 56,614 lines.
//   ZERO sorry, admit or native_decide. The single grep hit is the English word
//   "admit" inside a docstring.
//   ZERO declared axioms - not one `axiom` in the whole development.
// That last point matters more than usual, because the paper says its "only
// external inputs are classical prime-distribution theorems and two precisely
// stated results of Ford-Green-Konyagin-Maynard-Tao". Those are not axiomatised
// and not carried as hypotheses either: the module header states "The final
// theorems have no analytic or covering hypotheses", and Erdos4.md says the
// development "also proves the stronger FGKMT18 bound".
//
// STATEMENT FIDELITY CHECKED on the terminal theorem, which is stated in
// primitive Mathlib terms rather than through a bespoke abstraction:
//   theorem all_endpoint_consecutive_prime_gaps :
//     ∃ C X₀ : ℝ, 0 < C ∧ ∀ X : ℝ, X₀ ≤ X → ∃ n : ℕ,
//       (Nat.nth Nat.Prime (n + 1) : ℝ) ≤ X ∧
//       C * Real.log X * Real.log (Real.log X) /
//         Real.log (Real.log (Real.log (Real.log X))) ≤
//           (Nat.nth Nat.Prime (n + 1) : ℝ) - Nat.nth Nat.Prime n
// `Nat.nth Nat.Prime` is Mathlib's own prime enumeration, and the statement
// carries no hypotheses at all, so there is nothing hiding in a definition.
// It is exactly G(T) >> log T log_2 T / log_4 T.
//
// RESOLUTION = partial, and this is the judgement worth defending. Erdős
// problem #4 as posed is ALREADY MARKED PROVED on erdosproblems.com - Maynard
// [Ma16] and Ford, Green, Konyagin and Tao [FGKT16] settled it, humans, in 2016.
// This does not resolve it; it improves the record bound past FGKMT18. Nor does
// it reach the target Erdős reserved the $10,000 for, a lower bound
// > (log n)^{1+c} for fixed c > 0: log . log_2 / log_4 is (log n)^{1+o(1)}.
// So the entry is a new bound on a question whose sharp form is still open,
// which is exactly what `partial` is for - and the entry must not be allowed to
// read as though a model settled Erdős #4.
//
// verification = lean-checked, not lean-verified. The source-level audit above
// is strong, and I checked the statement correspondence myself, but the kernel
// half is unconfirmed: there is no Lean toolchain here, and the repo's own
// README says only that the projects build "last I checked" and that a build
// "might take many hours".
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "tilted-residue-class-construction-for-long-prime-free-intervals";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const ENTRY = {
  slug: SLUG,
  name: "A tilted residue-class construction for long prime-free intervals",
  shortName: "Large prime gaps record",
  field: "Analytic number theory; large gaps between primes",
  fieldGroup: "Number theory",
  statement:
    "How large can the gap between consecutive primes be, infinitely often? Writing $\\log_k$ for the $k$-fold iterated logarithm, Erdős asked (problem #4, a \\$10{,}000 prize) whether $p_{n+1}-p_n \\gg C\\log n\\log_2 n\\log_4 n/(\\log_3 n)^2$ for every $C$; that was settled in 2016, and the record bound since has been Ford-Green-Konyagin-Maynard-Tao's $p_{n+1}-p_n \\gg \\log n\\log_2 n\\log_4 n/\\log_3 n$. This work claims a stronger bound, $G(T)\\gg \\log T\\log_2 T/\\log_4 T$, an improvement by a factor of $\\log_3 T/(\\log_4 T)^2$, together with $Y(X)\\gg X\\log X/\\log_3 X$ for the covering problem behind it.",
  posedBy: "Paul Erdős",
  yearPosed: 1955,
  solveType: "proved" as const,
  solveDate: "2026-08-25",
  model: "GPT 5.6 Sol",
  modelMaker: "OpenAI",
  humanCollaborators: ["Boris Alexeev (Lean formalisation)"],
  aiRole:
    "The paper has no human author. Its title block reads \\author{GPT 5.6 Sol}, and the PDF metadata records the same, so the model is credited as the author of the mathematics rather than as an assistant to one. There is no acknowledgements section and no human contributor named anywhere in the manuscript.\n\nThat makes this the least ambiguous AI-discovered entry in the catalog: elsewhere a human at least writes up, directs or checks the argument and says so. Here the only named human contribution is downstream and formal - Boris Alexeev's Lean development, which transcribes the manuscript's two main statements rather than producing them.\n\nWhat the paper does claim about its own inputs: \"The only external inputs are classical prime-distribution theorems and two precisely stated results of Ford-Green-Konyagin-Maynard-Tao; every hypothesis of those results is verified explicitly.\"",
  verification: "lean-checked" as const,
  verificationNote:
    "Lean-checked. The formalisation was audited at source here on 30 August 2026, and it is unusually clean, but it was not built.\n\nAcross the 403 Lean files of the Erdős 4 development (56,614 lines) there is no $\\texttt{sorry}$, no $\\texttt{admit}$, no $\\texttt{native\\_decide}$ - the one grep hit is the English word \"admit\" in a docstring - and, notably, not a single declared $\\texttt{axiom}$. The Ford-Green-Konyagin-Maynard-Tao inputs the paper names are therefore neither axiomatised nor carried as hypotheses: the module header states that \"the final theorems have no analytic or covering hypotheses\", and the repository's own notes say the development \"also proves the stronger FGKMT18 bound\".\n\nStatement fidelity was checked on the terminal theorem, which is written in primitive Mathlib terms rather than through a bespoke abstraction - $\\texttt{Nat.nth Nat.Prime}$ for the primes, no hypotheses - and says exactly $G(T)\\gg\\log T\\log_2 T/\\log_4 T$.\n\nNot Lean-verified, because the kernel half is unconfirmed: there is no Lean toolchain on this machine, and the repository's README says only that its projects build \"last I checked\" and that a build \"might take many hours\". Nobody independent has audited the informal-to-formal correspondence either. The manuscript is unrefereed and hosted in a GitHub repository rather than a preprint server - expected, since arXiv will not list a model as an author.",
  publication: "announcement" as const,
  resolutionMethod: "argument" as const,
  resolution: "partial" as const,
  aiContribution: "ai-discovered" as const,
  renownLangs: 0,
  significance: 50,
  significanceNote:
    "Large gaps between primes is among the most-worked quantitative questions in prime number theory, and the record being improved is Ford, Green, Konyagin, Maynard and Tao's, two of them Fields medallists, in the Annals. Moving it is a serious result.\n\nHeld below the top band for two reasons rather than one. It improves a bound rather than settling anything: Erdős's own question was answered in 2016, and the \\$10,000 target of $(\\log n)^{1+c}$ is untouched. And it is unrefereed, hours old at the time of writing, with the formalisation unbuilt here.",
  resultNote:
    "The claimed bound is $G(T)\\gg\\log T\\log_2 T/\\log_4 T$, against the previous record $\\log T\\log_2 T\\log_4 T/\\log_3 T$ of Ford-Green-Konyagin-Maynard-Tao - an improvement by $\\log_3 T/(\\log_4 T)^2$. The construction biases a random residue-class sieve toward the zero residue with a Rankin-type tilt, which gives an exact survival law and permits an all-fiber block construction for composites, while a Maynard weight and FGKMT's quantitative hypergraph covering theorem handle the surviving primes.\n\nWhat it does not do. Erdős problem #4 as posed was settled in 2016 by Maynard and by Ford, Green, Konyagin and Tao; this improves the record, it does not answer the question. It also falls short of the lower bound $>(\\log n)^{1+c}$ that Erdős reserved the \\$10,000 for, since $\\log\\cdot\\log_2/\\log_4$ is still $(\\log n)^{1+o(1)}$. The likely truth is believed to be around $(\\log n)^2$.",
  ageNote:
    "Dated to Erdős's 1955 statement of the problem, the earliest of the many places he posed it (erdosproblems.com lists [Er55c] first, then repeatedly through to 1997). The question as Erdős posed it was answered in 2016; what stands open, and what this bound moves toward without reaching, is the sharper $(\\log n)^{1+c}$ form he reserved the larger prize for.",
  sourceUrl: "https://github.com/plby/lean-proofs/blob/main/output/pdf/Erdos_4_GPT_5.6_Sol.tex",
  sourceName: "A Tilted Residue-Class Construction for Long Prime-Free Intervals",
  status: "published" as const,
};

const LINKS = [
  {
    label: "Lean formalisation of the two main statements",
    url: "https://github.com/plby/lean-proofs/blob/main/src/latest/ErdosProblems/Erdos4Tilted.lean",
    kind: "lean-proof",
  },
  {
    label: "Erdős problem #4, with the prior record and prize history",
    url: "https://www.erdosproblems.com/4",
    kind: "problem-record",
  },
  {
    label: "Ford, Green, Konyagin, Maynard, Tao - the record this improves",
    url: "https://arxiv.org/abs/1412.5029",
    kind: "paper",
  },
];

async function main() {
  const clash = await prisma.problem.findFirst({
    where: { OR: [{ slug: SLUG }, { sourceUrl: ENTRY.sourceUrl }] },
    select: { slug: true, status: true },
  });
  if (clash) throw new Error(`would collide with existing entry: ${clash.slug} (${clash.status})`);

  const nearby = await prisma.problem.findMany({
    where: { OR: [{ name: { contains: "prime gap", mode: "insensitive" } }, { name: { contains: "gaps between primes", mode: "insensitive" } }] },
    select: { slug: true, status: true },
  });
  console.log(`  nearby prime-gap entries: ${nearby.map((n) => n.slug).join(", ") || "none"}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(ENTRY)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n  NEW ENTRY ${SLUG}`);
  console.log(`  resolution ${ENTRY.resolution} / verification ${ENTRY.verification} / ${ENTRY.aiContribution} / sig ${ENTRY.significance}`);
  console.log(`  +${LINKS.length} links`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const created = await prisma.problem.create({
    data: { ...ENTRY, links: { create: LINKS.map((l, i) => ({ ...l, position: i })) } } as never,
  });
  await prisma.problemActivity.create({
    data: { problemId: created.id, userId: curator.id, userName: curator.pseudonym, type: "created" },
  });
  console.log(`\nCREATED ${created.slug}`);
}

main().finally(() => prisma.$disconnect());
