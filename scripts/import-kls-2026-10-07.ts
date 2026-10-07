// Import of the Kannan-Lovasz-Simonovits conjecture, arXiv:2610.05474
// (Pierre Bizeul, Boaz Klartag and Joseph Lehec, 4 October 2026), as a
// landmark Candidate under the rule of 7 October 2026 (docs/reviewing.md,
// step 4). It was held on 6 October under the old extraordinary-claims rule;
// named authors stand behind it, so it is listed now, labelled.
//
// Checked here on 7 October 2026 from the arXiv source (KLS5.tex):
//
//   * Theorem 1.1: a universal C with C_P(mu) <= C for every isotropic
//     log-concave probability measure on R^n, every n. That is the KLS
//     conjecture in its Poincare form, in the log-concave generality, which
//     contains the original convex-body statement.
//   * AI disclosure, acknowledgements: "Most proofs and mathematical ideas in
//     this paper were found by ChatGPT; a notable exception is the idea to use
//     suspension which was suggested by the authors. The role of the authors
//     has been mostly to understand these proofs and improve their
//     exposition." A named human idea carries a key step, so ai-co-developed.
//   * The last step goes through Song and Zhang's criterion (arXiv:2610.01447,
//     Theorem 5.1), which the paper re-proves in its Section 3.
//   * Priority: Song and Zhang's own preprint, posted 1 October with a
//     16^(log* n) bound, was revised on 4 October to claim the O(1) bound,
//     the same result, on the same day. That is a parallel claim of the same
//     result, so a priority note, not Contested.
//
// No formal proof. The authors are leading researchers of the area but not
// independent reviewers, so verification is Unreviewed and the note opens
// with the required sentence.
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

interface Entry {
  slug: string;
  fields: Record<string, unknown>;
  links: { label: string; url: string; kind: string }[];
}

const SOURCE = "https://arxiv.org/abs/2610.05474";

const ENTRIES: Entry[] = [
  {
    slug: "kannan-lovasz-simonovits-conjecture",
    fields: {
      name: "The Kannan-Lovász-Simonovits conjecture",
      shortName: "KLS conjecture",
      fieldGroup: "Geometry & topology",
      field: "Asymptotic convex geometry; high-dimensional probability",
      statement:
        "Let $K \\subset \\mathbb{R}^n$ be a convex body in isotropic position (barycenter at the origin, identity covariance). Kannan, Lovász and Simonovits conjectured that the isoperimetric inequality on $K$ is saturated, up to a universal constant, by half-spaces: $\\mathrm{Vol}_{n-1}(\\partial A \\cap K) \\ge c \\min\\{\\mathrm{Vol}_n(A \\cap K), \\mathrm{Vol}_n(K \\setminus A)\\}$ with $c > 0$ independent of $n$ and $K$. Equivalent forms: exponential concentration of 1-Lipschitz functions with a dimension-free rate, or a Poincaré inequality with a universal constant, for every isotropic log-concave measure. Is the KLS constant bounded independently of the dimension?",
      posedBy: "Ravi Kannan, László Lovász and Miklós Simonovits (Discrete & Computational Geometry, 1995)",
      yearPosed: 1995,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-10-04",
      model: "ChatGPT (version not stated)",
      modelMaker: "OpenAI",
      humanCollaborators: ["Pierre Bizeul", "Boaz Klartag", "Joseph Lehec"],
      aiContribution: "ai-co-developed",
      aiRole:
        "From the paper's acknowledgements: \"Most proofs and mathematical ideas in this paper were found by ChatGPT; a notable exception is the idea to use suspension which was suggested by the authors. The role of the authors has been mostly to understand these proofs and improve their exposition.\" The suspension construction is the step that turns tilt-average derivatives into cumulants of a larger isotropic log-concave measure, so a named human idea carries part of the argument. The model version is not stated.",
      verification: "unreviewed",
      verificationNote:
        "No independent mathematician has checked this yet. Read here on 7 October 2026 from the arXiv source: Theorem 1.1 states a universal bound on the Poincaré constant of every isotropic log-concave measure in every dimension, which is the KLS conjecture in its Poincaré form and contains the original convex-body statement. The proof was not refereed here. The authors are leading researchers of the area, not independent reviewers, and there is no formal proof. The argument's last step rests on Song and Zhang's criterion (arXiv:2610.01447, Theorem 5.1), which the paper re-proves in its Section 3.",
      resultNote:
        "Claims the conjecture in full, for all isotropic log-concave measures: $C_P(\\mu) \\le C$ with $C$ universal. The route bounds the third cumulant, propagates the estimate to cumulants of every order by Eldan's stochastic localization, realizes derivatives of tilt averages as mixed cumulants through a suspension construction, and closes with the Song-Zhang criterion. The previous best bounds were Klartag's $C\\sqrt{\\log n}$ and Song and Zhang's $C \\cdot 16^{\\log^* n}$ (1 October 2026). Priority: Song and Zhang revised their preprint on 4 October 2026, the day this paper was posted, to claim the same $O(1)$ bound by their own route; the two are parallel claims of the same result. Consequences include the thin-shell and variance conjectures, already known to follow from KLS.",
      significance: 60,
      significanceNote:
        "The central open conjecture of asymptotic convex geometry for three decades and a driver of sampling and volume algorithms in computer science, with Bourgain's slicing problem and the variance conjecture as its companions. Above the general Mahler conjecture at 55 and the simplex isotropic-constant entry at 50 in the same area, level with the symmetric Mahler conjecture at 60, below the Jacobian conjecture at 65.",
      publication: "preprint",
      sourceUrl: SOURCE,
      sourceName: "arXiv:2610.05474, Bizeul, Klartag and Lehec (4 October 2026)",
      renownLangs: 0,
    },
    links: [
      { label: "Song and Zhang, An O(1) bound for the KLS constant (arXiv:2610.01447, revised 4 October)", url: "https://arxiv.org/abs/2610.01447", kind: "paper" },
      { label: "The KLS conjecture for quadratic forms (earlier AI result)", url: "https://vibemathed.com/problem/kls-quadratic-forms", kind: "other" },
      { label: "Kannan, Lovász and Simonovits, Isoperimetric problems for convex bodies (1995)", url: "https://doi.org/10.1007/BF02574061", kind: "problem-record" },
    ],
  },
];

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const e of ENTRIES) {
    console.log(e.slug);
    for (const [k, v] of Object.entries(e.fields)) {
      if (typeof v !== "string") continue;
      const c = charLength(canonical(v));
      const lim = limit.get(k);
      const over = lim !== undefined && c > lim;
      if (lim) console.log(`  ${k.padEnd(17)}: ${c}/${lim}${over ? "  OVER" : ""}`);
      if (over) bad++;
      if (/—/.test(v)) {
        console.log(`  ${k}: EM DASH`);
        bad++;
      }
    }
    const v = checkStoredEntry({ specs: SPECS, fields: e.fields, links: e.links, sourceUrl: e.fields.sourceUrl as string });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
  }
  return bad;
}

async function main() {
  const bad = lint();
  if (LINT) {
    console.log(bad ? `\n${bad} local violation(s)` : "\nlocal checks ok");
    process.exitCode = bad ? 1 : 0;
    return;
  }
  if (bad) throw new Error(`${bad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) throw new Error("no admin");

    const dup = await prisma.problem.findMany({
      where: { OR: [{ sourceUrl: { contains: "2610.05474" } }, { name: { contains: "Kannan-Lov" } }, { slug: { contains: "kls" } }] },
      select: { slug: true, status: true },
    });
    for (const d of dup) console.log(`  existing match: ${d.slug} (${d.status})`);

    for (const e of ENTRIES) {
      const existing = await prisma.problem.findUnique({ where: { slug: e.slug }, select: { status: true } });
      console.log(`### ${e.slug}${existing ? `  (EXISTS, ${existing.status} - skip)` : ""}`);
      console.log(`    ${e.fields.name}`);
      console.log(`    ${e.fields.solveType}/${e.fields.resolution}  sig=${e.fields.significance}  ai=${e.fields.aiContribution}  ver=${e.fields.verification}  posed=${e.fields.yearPosed}  ${e.links.length} link(s)`);
      if (existing || !APPLY) continue;
      await prisma.$transaction([
        prisma.problem.create({
          data: {
            slug: e.slug,
            ...(e.fields as object),
            status: "published",
            links: { create: e.links.map((l, position) => ({ ...l, position })) },
          } as never,
        }),
        prisma.problemActivity.create({
          data: {
            problem: { connect: { slug: e.slug } },
            user: { connect: { id: admin.id } },
            userName: admin.pseudonym ?? null,
            type: "created",
          },
        }),
      ]);
      console.log("    CREATED");
    }

    // Link back from the earlier quadratic-forms entry, which the full claim supersedes.
    const back = { label: "The full KLS conjecture, claimed October 2026", url: "https://vibemathed.com/problem/kannan-lovasz-simonovits-conjecture", kind: "other" };
    const q = await prisma.problem.findUnique({ where: { slug: "kls-quadratic-forms" }, select: { id: true, links: { select: { url: true } } } });
    if (!q) throw new Error("kls-quadratic-forms not found");
    const has = q.links.some((l) => l.url === back.url);
    console.log(`kls-quadratic-forms: ${has ? "back link present" : "add back link"}`);
    if (APPLY && !has) {
      await prisma.problemLink.create({ data: { ...back, position: q.links.length, problemId: q.id } });
      console.log("    LINKED");
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    console.log("\nAPPLIED. Entry pages render on first request; lists and stats lag up to an hour.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
