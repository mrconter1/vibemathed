// Bring the 16 over-limit values inside the field limits. 13 Aug 2026.
//
// Every one was written by a curator script, which is the only path that
// bypasses the form specs. Two limits moved first (see editable.ts):
// `resultNote` 200 -> 1000, because the field had become the "What was
// actually shown" section and 31 entries were over; and `significanceNote`
// gained its first cap at 600, having had none at all.
//
// The rewrites cut padding, not substance: what was checked, what was not,
// and every caveat survives. The verification notes render through `TeX`, so
// where these touch mathematics they now use $...$ instead of the ASCII
// transliteration they were written in - which is the other half of why the
// Gamow entry looked wrong. Age and significance notes render in hover
// bubbles, which cannot run KaTeX, so those stay plain text.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

interface Rewrite {
  slug: string;
  field: "verificationNote" | "ageNote" | "significanceNote";
  value: string;
}

const REWRITES: Rewrite[] = [
  {
    slug: "gamow-liquid-drop-minimizer-conjecture",
    field: "verificationNote",
    value:
      "Checked here on 13 August 2026, the day after the preprint appeared. The AI-usage statement was confirmed verbatim in two places, the arXiv listing comment and the paper's own opening section. The LaTeX source was retrieved and the quantitative content rederived rather than trusted. The threshold came out independently from comparing one ball against two of half the volume as their separation grows, which favours splitting exactly when $V > 5(1-2^{1/3})/(2^{-2/3}-1)$ - the paper's $5(2-2^{2/3})/(2^{2/3}-1) \\approx 3.5121$ after clearing radicals. The constant $|B_1|P(B_1)/D(B_1)=5$ checks against $D(B_R)=16\\pi^2R^5/15$. The corollary does minimise at $V=5/2$ with value $3(9\\pi/5)^{1/3}$, and the alternative form $\\frac92(8\\pi/15)^{1/3}$, which the submitter added and the paper does not state, is genuinely equal to it - both cube to $48.6\\pi$. The identities the argument turns on expand as claimed, as do $2^{-2/3}(V_*+10)=V_*+5$ and the closing $1024<1296$ on $[6,8]$. Every cited source is real, with a resolving DOI. What was NOT checked is the capacitary estimate and the distributional Bochner lemma under it, which is where the new mathematics lives. The manuscript is one day old and unrefereed, and the authors checking their own reworked proof is not independent verification, so the tier stays Unreviewed.",
  },
  {
    slug: "petersen-coloring-conjecture",
    field: "verificationNote",
    value:
      "Reproduced here on 12 August 2026, independently of the paper's certificates. The 112-vertex graph was rebuilt from the appendix edge table, and the SHA-256 of its normalized sorted edge list reproduces the digest in Theorem 1.1 exactly, pinning the object under review to the one claimed. Every property in that theorem was rederived: 112 vertices, 168 edges, simple, cubic, connected, bridgeless, girth five, connectivity three. Non-existence of a Petersen coloring was then re-proved with a CNF encoding written here from the definition - each edge carries one of the 15 edges of $KG(5,2)$, each vertex selects one of the 10 target stars, the three edges at a vertex land in that star and are pairwise distinct - and solved with CaDiCaL via PySAT. UNSAT. That re-derives the unsatisfiability rather than replaying the shipped DRAT certificates, and the encoder was written without reference to the paper's: the same 3640 variables, forced by the problem shape, but 31,360 clauses against their 68,324. It ran twice in separate processes with identical results. Six controls - $K_4$, $K_{3,3}$, the 3-cube, the prism, Desargues and the Petersen graph itself - all came back satisfiable through the same encoder. Petersen is the important one, being a snark: a coloring for it rules out the encoder having quietly tested 3-edge-colorability. Not checked: the second $D_3$-symmetric counterexample, the normal-5-edge-coloring formulation, and the DRAT proofs. Four-day-old arXiv preprint, unrefereed.",
  },
  {
    slug: "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path",
    field: "verificationNote",
    value:
      "Reproduced here on 13 August 2026. The Lean development builds clean (exit 0) on the pinned toolchain (v4.12.0, core only, no Mathlib), and #print axioms shows all five main theorems depending on exactly propext, Classical.choice and Quot.sound. No Lean.ofReduceBool; with comments stripped the source has zero sorry, admit, axiom declarations and native_decide, and its 23 decide calls are kernel-reduced. A naive grep says otherwise only because those words appear in the file's own docs. The Python checker runs as described: Dih(3) has order 6 and equals Sym(3), and the lower-bound witnesses hold for b = 2..8. The general upper bound is not formalized; it cites Chvatal 1977, whose arithmetic holds. The SAT claim, unconfirmed at review, was substantiated the same day at commit 01a50c7. The DRAT files were not replayed, since replaying a shipped proof is the weaker check; instead all twelve CNFs were re-solved here with CaDiCaL, every verdict matching their kissat logs - satisfiable at $n=2b-2$, unsatisfiable at $n=2b-1$, for b = 2..7. The six satisfiable instances had their witnesses re-substituted clause by clause and all satisfy, and the b = 3 legs agree with this site's own exhaustive enumeration, anchoring their encoder against an independent computation. The certificates are regenerated rather than the originals, disclosed unprompted, which costs nothing here. Still unconfirmed: no human peer review, this being a self-submission reviewed by AI agents in-pipeline.",
  },
  {
    slug: "sendov-s-conjecture",
    field: "verificationNote",
    value:
      "Independently verified twice over, and this site audited the formal artifact itself on 13 August 2026. The decisive external check is Terence Tao's post of 12 August 2026, \"A digestion of the proof of Sendov's conjecture\": he writes that \"Lech Mazur was able to use an AI tool to resolve Sendov's conjecture for all $n \\ge 2$\", reports formalizing the whole argument in Lean himself at about 15,000 lines against the original's roughly 90,000, and concludes that it resolves both the Sendov and Phelps-Rodriguez conjectures in full generality. Tao proved the large-degree case in 2020, so this is expert verification by the person best placed to give it, and it carries the tier. Separately, this site audited Mazur's Lean package. SendovConjecture in Sendov/Statement.lean is exactly the conjecture, correctly quantified and shadowed nowhere. Across all 1,160 first-party files there are zero sorry, zero admit, zero custom axiom declarations and - the one that matters for an autonomous prover - zero native_decide; the 1,117 decide calls are kernel-checked, and the axiom profile is exactly propext, Classical.choice and Quot.sound. All 1,160 file hashes match the published evidence record byte for byte. What could not be checked is the build: the bundle ships no lakefile or manifest and excludes Mathlib, so it cannot be recompiled as distributed, a gap ProofAtlas's own evidence file is candid about. This entry rests not on that internal status but on Tao's independent digestion.",
  },
  {
    slug: "phelps-rodriguez-conjecture",
    field: "verificationNote",
    value:
      "Audited here on 13 August 2026, which is what lifts this above the submitter's conservative Lean-checked classification. The gap they identified was that nobody had checked the correspondence between Tao's formal statement and the historical conjecture, so that check was performed. Sendov.phelps_rodriguez in Sendov/Conjecture.lean reads: for $n \\ge 2$ and $p$ of natDegree $n$ with every root in the closed unit disk and $p(a)=0$, either some critical point has $|\\zeta - a| < 1$, or $|a| = 1$ and $p = c(X^n - a^n)$ for some nonzero $c$. That is exactly Phelps-Rodriguez, exceptional family included, with no weakening; and it is not vacuous, since natDegree $= n$ with $n \\ge 2$ forces $p \\ne 0$, which the proof derives rather than assumes. All 80 first-party files were audited with comments stripped: zero admit, zero axiom declarations, zero native_decide, and 124 decide calls, all kernel-reduced. The only two sorry occurrences sit in Challenge.lean, which nothing imports, so they are outside the proof path. On the build, all four GitHub Actions runs report failure, which is misleading: reading the job steps shows the leanprover/lean-action build succeeded on the latest commit, and the failing step is docgen-action, documentation generation. That makes the kernel check third-party evidenced rather than resting on the author's machine. Not independently reviewed by another mathematician: the repository says so, and Tao both wrote the digestion and directed the formalization.",
  },
  {
    slug: "albertson-berman-induced-forest-conjecture",
    field: "verificationNote",
    value:
      "Reproduced here on 12 August 2026. The refutation is a single finite object, so it is checkable outright rather than on trust. The 31-vertex seed $T$ was rebuilt from the paper's own definitions - the 14-vertex gadget's cyclic neighbour lists, the pentagonal-bipyramid base, the decorated rim edges, the stated labelling and the two completion edges - without running the author's code. That yields a simple 3-connected planar graph on 31 vertices with $87 = 3n-6$ edges, hence a triangulation, with the paper's degree multiset $4^1 5^{17} 6^6 7^7$. Its maximum induced forest was then computed exactly by two independent algorithms: an ILP with lazy cycle-elimination cuts, and a branch-and-bound minimum feedback vertex set with no LP involved. Both give $a(T) = 15$, equivalently a minimum feedback vertex set of exactly 16, against the 15.5 the conjecture requires. The two finite inputs to the symbolic argument were separately brute-forced - the terminal profile $(6,6,6,5)$ over all $2^{12}$ internal subsets, and $\\beta = 3$ over all $2^7$ subsets of the core - and $M_k$ for $k = 2..5$ confirmed planar on $31k$ vertices with $93k-6$ edges, minimum degree five, every seed induced. Worth noting what the shipped verifier does not do: it certifies the gadget embedding, the profile, $\\beta$ and the sphere certificates, but never computes $a(T)$ or $a(M_k)$, and says so. That computation is the one this site supplied. Not peer-reviewed, not on arXiv, no independent expert review.",
  },
  {
    slug: "hadamard-matrix-of-order-668",
    field: "verificationNote",
    value:
      "Fully reproduced here on 12 August 2026, in two passes. The announcement is a single X long-post holding 23,828 characters of \"+\" and \"-\": no prose, no separators. The first pass scanned the raw string for seed shapes and found three Goethals-Seidel quadruples (orders 892, 1132, 1244), verified exactly, but no order-668 seed - correctly, since the payload is not a seed list. What it missed is that Alpoge's own reply to the post is a decoder: a sed-obfuscated shell script declaring twelve records and five builder routines. This site reimplemented the sed transformation in Python, read the decoded script before executing anything (pure sed/sh, no network, writes only under /tmp), and ran it. It emits twelve sign blocks, and its header table independently names the four orders the raw scan had already found, cross-validating both decodings. Every block was then checked in exact integer arithmetic: entries in $\\{-1,+1\\}$ and $HH^T = nI$ on the nose, for $n$ = 668, 716, 892, 1132, 1244, 1388, 1436, 1676, 1772, 1916, 1948 and 1964 - all twelve previously-open admissible orders below 2000, exactly as the thread claims. The order-668 matrix has diagonal 668 everywhere and maximum absolute off-diagonal entry 0. The submitter reports an equivalent reproduction, done separately from this one. No independent expert review or published write-up exists yet, so site-confirmed records this site's own exact-arithmetic reproduction, not community acceptance.",
  },
  {
    slug: "teschner-s-bondage-number-conjecture",
    field: "verificationNote",
    value:
      "Reproduced in full here on 13 August 2026. The counterexample is a single 18-vertex graph, so the claim is finite and was checked exhaustively rather than sampled. The edge list was transcribed from equation (3.1) and every quantity recomputed independently, without reading or running the author's verifier. Confirmed: connected, cubic and bipartite with the stated parts, 18 vertices and 27 distinct edges, so $\\Delta(G) = 3$; domination number 6 by exhaustive search; and exactly 297 minimum dominating sets, the count the paper states, arrived at here independently. For the lower bound, all 20,853 edge subsets of size at most four were tested by the bundle criterion, and every one leaves at least one minimum dominating set intact, so $b(G) \\ge 5$. For the upper bound, deleting the five edges 0-6, 0-10, 0-16, 1-8 and 1-11 raises the domination number to 7, recomputed from scratch on the reduced graph rather than inferred from the criterion, so $b(G) \\le 5$. Therefore $b(G) = 5 > 4.5 = \\frac32\\Delta(G)$ and the conjecture is false. That enumeration is the entire mathematical content of the claim, so this is a complete independent check. Caveats: the preprint is two days old, is hosted on figshare rather than arXiv, and has no peer review; the acknowledgements name Eric Hou (UBC) as an independent verifier, but that is a private check, not a public endorsement by a specialist.",
  },
  {
    slug: "ramachandra-natarajan-correlation-gap",
    field: "verificationNote",
    value:
      "The refutation is an explicit counterexample, so it is a finite check. Short arXiv note, not peer-reviewed.\n\nA Lean 4 / Mathlib formalization of the counterexample was contributed in August 2026 by its author, produced with Codex. Curator source audit: all 579 lines read, with no sorry, admit, native_decide, unsafe declaration, user-declared axiom, implemented_by or partial def anywhere; finite checks go through kernel decide and rational identities through norm_num, and Mathlib is pinned to an exact revision on toolchain v4.33.0-rc2. The curator has not compiled it, and it is the work of the same person who reported the result, so it is not third-party corroboration.\n\nWhat the formalization does and does not settle is worth stating exactly. Its final theorem is a seven-part conjunction certifying the witness and its bounds: the three-atom distribution attains the target marginals with expected coverage 4, no distribution exceeds 4, the product distribution is pairwise feasible, every pairwise-feasible distribution is bounded by $479/160$, and $4 \\div (479/160) = 640/479 > 4/3$. Both bounds are universally quantified rather than spot-checked. What the file never states is the Ramachandra-Natarajan conjecture itself, so the step from this instance to the conjecture being refuted stays informal and rests on the conjectured bound really being $4/3$. That is the difference between a kernel-checked artifact and an audited claim, and why this sits on the unaudited Lean rung.",
  },

  // --- age notes (hover bubbles: plain text, no math) ---
  {
    slug: "a-counterexample-to-han-s-conjecture",
    field: "ageNote",
    value:
      "Posed by Han in the J. London Math. Soc. in 2006 and open since, with a dedicated survey and positive results for commutative, monomial, graded, Koszul, local and cellular algebras. Happel asked the same for Hochschild cohomology; Buchweitz, Green, Madsen and Solberg answered that negatively in 2005, but their examples have nonzero homology in infinitely many degrees, so Han's survived.",
  },
  {
    slug: "polynomial-time-mimo-detection-at-the-maximum-likelihood-threshold",
    field: "ageNote",
    value:
      "Optimum multiuser detection is NP-hard in the worst case (Verdu, 1989), but the Gaussian channel is more structured. Jalden and Ottersten showed in 2005 that sphere-decoder complexity turns exponential as dimension grows, and the ML block-recovery threshold was identified by Hansen et al. in 2009. This answers what those leave behind - a question the author formulated, not an inherited conjecture.",
  },
  {
    slug: "gamow-liquid-drop-minimizer-conjecture",
    field: "ageNote",
    value:
      "Gamow introduced the functional around 1930 - the paper says 1928 while the reference it gives is his 1930 Proc. R. Soc. A paper. The sharp-threshold conjecture is a modern formulation with no canonical posing: the authors say only that it has appeared in several places, citing Choksi-Peletier (2011), Frank-Lieb (2015) and Frank-Nam (2021). Year posed is left empty rather than guessed at.",
  },
  {
    slug: "more-than-67-of-riemann-zeta-zeros-are-on-the-critical-line",
    field: "ageNote",
    value:
      "Deliberately no single posed-year, so the entry cannot claim an age it has not earned. The Riemann hypothesis dates to 1859, but this result does not resolve it. What it advances is the unconditional proportion bound, a programme running from Hardy in 1914 and Selberg in 1942 through Levinson's one third in 1974 and Conrey's two fifths in 1989. Dating this to 1859 would overstate it by a century.",
  },
  {
    slug: "a-counterexample-to-the-inverse-generator-problem-and-related-questions",
    field: "ageNote",
    value:
      "Posed by deLaubenfels in 1988, with a documented ladder since: positive for sectorial operators of angle below π/2, positive on Hilbert spaces for contractive semigroups by Lumer-Phillips, counterexamples on Banach spaces back to Komatsu, and Gomilko-Zwart-Tomilov producing Hilbert-space generators with slow unbounded growth. The bounded-semigroup Hilbert case stayed open until this paper.",
  },

  // --- significance notes (hover bubbles: plain text, no math) ---
  {
    slug: "gamow-liquid-drop-minimizer-conjecture",
    field: "significanceNote",
    value:
      "The central open problem of the liquid-drop literature: the sharp threshold between existence and nonexistence of fixed-volume minimizers, with uniqueness of the ball below it. Not eponymous, and with no Wikipedia article. What lifts it above a single-subfield problem is reach - tracked across calculus of variations, mathematical physics and geometric analysis at once, with a 2017 Notices of the AMS survey for a general audience and a partial-results literature carrying Lieb, Otto, Figalli and Maggi. Hence level with Polya for Neumann balls (35) rather than HRT (33), below the eponymous band.",
  },
  {
    slug: "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path",
    field: "significanceNote",
    value:
      "Small, and the preprint says so itself. This closes one slice (a = 3) of a conjecture stated about five weeks earlier, and it closes it by a group coincidence plus a citation: Dih(3) happens to equal Sym(3), so the permutational condition collapses to ordinary subgraph containment and Chvatal's 1977 theorem finishes it. The note is candid that the cyclic values for b = 3..8 were already tabulated by Basic et al., and that what is new is the closed form, not the numbers. Scored near the bottom of the spine, below the Erdos entries at 10, which are decades-old rather than weeks-old.",
  },
];

const LABEL: Record<string, string> = {
  verificationNote: "Verification note",
  ageNote: "Age note",
  significanceNote: "Significance note",
};

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  let bad = 0;
  const plan: { id: string; slug: string; field: string; before: string; after: string }[] = [];

  for (const r of REWRITES) {
    const limit = LIMITS.get(r.field);
    if (!limit) throw new Error(`no limit for ${r.field}`);
    const p = await prisma.problem.findUnique({ where: { slug: r.slug } });
    if (!p) throw new Error(`no entry ${r.slug}`);
    const before = (p as unknown as Record<string, string | null>)[r.field];
    if (!before) throw new Error(`${r.slug}.${r.field} is empty`);

    const over = r.value.length - limit;
    if (over > 0) bad++;
    // The hover bubbles cannot render math; the prose fields can.
    const bubble = r.field !== "verificationNote";
    const dollars = /\$/.test(r.value);
    if (bubble && dollars) bad++;
    console.log(
      `${r.slug}.${r.field}: ${before.length} -> ${r.value.length} (limit ${limit})` +
        `${over > 0 ? ` OVER BY ${over}` : ""}${bubble && dollars ? "  BUBBLE FIELD HAS $" : ""}`,
    );
    plan.push({ id: p.id, slug: r.slug, field: r.field, before, after: r.value });
  }

  console.log(`\n${plan.length} rewrites, ${bad} problems`);
  if (bad) throw new Error("fix the flagged rewrites before applying");
  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  for (const w of plan) {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: w.id }, data: { [w.field]: w.after } }),
      prisma.problemActivity.create({
        data: {
          problemId: w.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated",
          field: LABEL[w.field],
          oldValue: w.before,
          newValue: w.after,
        },
      }),
    ]);
  }
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
