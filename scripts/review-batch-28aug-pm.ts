// Two submissions, 28 Aug 2026 (afternoon batch).
//
// ===========================================================================
// 1. FROBERG FOR QUINTICS AND SEPTICS - arXiv:2608.24797v3, math.AC,
//    25 Aug 2026 (v3 27 Aug), Qihang Wang and Dongming Zhang. PUBLISHED.
//
// Source verified: id, title, both authors, category and dates all match.
// v3's own comment says it "revises the acknowledgements and automated-
// assistance disclosure. The theorem statements and proofs are unchanged."
//
// VERIFICATION unreviewed -> SITE-CONFIRMED. Two independent things were done.
//
//   (a) I rebuilt the quintic certificates from scratch. The paper prints all
//       21 forms g1..g21 explicitly with every coefficient +1, and states the
//       monomial order, so the Macaulay matrices are reconstructible without
//       their code. I parsed the forms, built the multiplication matrices in
//       the stated order, and computed ranks by my own elimination over three
//       primes. All ten endpoint rows of Table 2 reproduce exactly, in shape
//       and rank, over F2, F101 AND F1009:
//         (6,9) 220x210 r=210   (6,10) 286x336 r=286   (7,9) 220x245 r=220
//         (8,8) 165x160 r=160   (9,8)  165x180 r=165   (11,7) 120x110 r=110
//         (12,7) 120x120 r=120  (20,6) 84x80   r=80    (21,6) 84x84   r=84
//         (21,5) 56x21   r=21
//       Then the step that actually matters, which the paper leaves implicit:
//       each certified rank yields exactly Froberg's predicted dimension.
//       With N_j = C(j+3,3) and dim(S/I)_j = N_j - rank, I recomputed the
//       predicted series independently and every endpoint agrees:
//         r=6  j=9  220-210=10 = pred 10      r=6  j=10 286-286=0 = pred 0
//         r=7  j=9  220-220=0  = pred 0       r=8  j=8  165-160=5 = pred 5
//         r=9  j=8  165-165=0  = pred 0       r=11 j=7  120-110=10 = pred 10
//         r=12 j=7  120-120=0  = pred 0       r=20 j=6  84-80=4   = pred 4
//         r=21 j=6  84-84=0    = pred 0
//
//   (b) The authors' own verifiers are published as arXiv ancillary files
//       (anc/froberg_quintics_verifier.py, anc/froberg_septics_verifier.py,
//       anc/froberg_septics_certificate.json) and both PASS here:
//         quintics: PASS in 1.2 s, all ten matrices, F2 and F101 agreeing
//         septics : PASS in 0.9 s, {"endpoints":15,"forms":120,
//                   "maximal_minors":15}, certificate sha256 73f6f75d...
//       Neither verifier contains floating point or randomness - grepped.
//       And the septic verifier genuinely RECOMPUTES rather than trusting
//       stored numbers: it rebuilds each matrix from the 120 forms via
//       matrix(forms, r, degree) and recomputes rank(rows). I confirmed this
//       adversarially by editing one exponent of one form to another valid
//       degree-7 monomial; the run then failed at "matrix digest" instead of
//       passing. A certificate that cannot fail is worthless, so this test is
//       the point.
//
//   The mod-2 logic is sound and is the paper's Corollary 3.2: rank can only
//   drop under reduction, so a maximal minor nonzero mod 2 is a nonzero
//   integer, and Zariski openness (their Lemma 2.1) carries it to every
//   characteristic-zero field. That is why I did not need rational arithmetic.
//
// WHAT IS NOT ESTABLISHED, and the note says so: the reduction of each r-range
// to its endpoints (Table 1, section 2) is a mathematical argument I did not
// check, and the septic forms were not independently reconstructed - they live
// only in the JSON, so for septics I ran their verifier rather than rebuilding.
// Unrefereed, no human review.
//
// resolution partial and method computation both stay - the unrestricted
// conjecture is explicitly out of scope, and the paper says so in its abstract.
// ai-co-developed stays: the disclosure credits the models with "formulation of
// mathematical ideas, generation of conjectures and proof strategies,
// derivation and checking of intermediate steps, construction of examples and
// exact certificates", which is mathematics rather than tooling, but names no
// single step to one model and there are two human authors directing.
//
// ===========================================================================
// 2. FRSB IN THE SK SPIN GLASS - arXiv:2607.18032v1, math.PR, 20 Jul 2026,
//    Hong-Bin Chen. PUBLISHED, with the verification tier CORRECTED DOWN.
//
// Source verified: id, title, sole author, category and date all match.
//
// verification lean-checked -> UNREVIEWED. That rung reads "compiles with no
// sorry and no stray axioms". The first half holds: I cloned the repo, and
// across 75 Lean files and 5,544 lines there is no sorry, no admit and no
// native_decide. The second half does not. The project declares SEVEN
// mathematical axioms in FRSB/Paper/ExternalInputs.lean, and four of them are
// not literature citations but the paper's OWN unformalized analysis:
//   zeroTemperature_internalGapAnalyticInputs   <- Propositions 4.1-4.2
//   zeroTemperature_terminalGapAnalyticInputs   <- Proposition 4.3
//   zeroTemperature_smoothDensityAnalyticData   <- Proposition 4.4
//   zeroTemperatureParisiMinimizer              <- the minimizer itself
// The other three cite Lopatto and Auffinger-Chen and Chen-Handschy-Lerman.
// The repo's FORMALIZATION_STATUS.md moreover lists lem:zt-PDE-facts,
// prop:zt-variational-conditions, lem:zt-bridge-formula and
// prop:ft-endpoint-laws as "Open analytic", and states that four terminal
// approximation modules are "excluded from the root target and omitted from
// this GitHub bundle".
//
// This is a downgrade of the label, NOT a criticism: the repository is
// unusually honest, ships AXIOMS.md and a dependency ledger, and the paper's
// own footnote says "This is not an assumption-free verification of the entire
// paper". The Lean does real work - given the analytic data, the gap exclusions
// and the smooth-density conclusion are Lean deductions, not axioms, which
// AXIOMS.md is careful to state. But a reader seeing "Lean-checked" on the
// entry would conclude the theorem is machine-checked modulo statement
// fidelity, and here it is machine-checked modulo the paper's core PDE and
// Itô analysis. The note records exactly that, and credits what is proved.
// I could not build the project (no Lean toolchain here; it pins v4.30.0).
//
// ONE FACTUAL FIX in the result note. The submission said Lopatto showed the
// Parisi measure is supported on "[0,q_beta)" - half-open. Lopatto's abstract
// and this paper's Theorem 1.1 both say the support is the CLOSED interval
// [0,q_beta], with a smooth density on [0,q_beta) and a single atom AT
// q_beta. The atom is the whole point of the endpoint analysis, so dropping it
// misstates the prior work. Corrected.
//
// posedBy was blank with yearPosed 1979; filled as Giorgio Parisi, whose 1979
// PRL "Infinite number of order parameters for spin-glasses" is reference [17].
//
// aiRole was blank and is the most striking disclosure in the catalog:
// "ChatGPT 5.6 is the author of the manuscript", set on its own line, with
// Chen listed formally only because arXiv policy forbids naming a model as
// author. ai-discovered is plainly right.
//
// PRIORITY recorded rather than left implicit, per the concurrent-work rule.
// Appendix C is scrupulous about it: an earlier version of this work was posted
// on aiXiv as [5] on 16 July (also written by ChatGPT), Lopatto's v3 appeared
// after, and Theorem 1.1 is cited FROM Lopatto v3. The zero-temperature result
// is this paper's; the positive-temperature structure is Lopatto's.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

interface Job {
  slug: string;
  reason: string;
  next: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  message: string;
}

const JOBS: Job[] = [
  {
    slug: "froberg-s-conjecture-for-quintics-and-septics-in-four-variables",
    reason: "edited",
    next: {
      verification: "site-confirmed",
      significance: 14,
      verificationNote:
        "Site-confirmed: this site reproduced the computation, twice over, on 28 August 2026.\n\nFirst, independently of the authors' code. The paper prints all 21 quintic forms with every coefficient $+1$ and states the monomial order, so the Macaulay matrices can be rebuilt from the text alone. I did that and ran my own elimination: all ten rows of Table 2 reproduce exactly, in shape and rank, over $\\mathbb F_2$, $\\mathbb F_{101}$ and $\\mathbb F_{1009}$. I then checked the step the paper leaves implicit - that each rank gives exactly Fröberg's predicted dimension. Recomputing the prediction myself, with $\\dim(S/I)_j=\\binom{j+3}{3}-\\mathrm{rank}$, every endpoint agrees: $(6,9)\\to10$, $(8,8)\\to5$, $(11,7)\\to10$, $(20,6)\\to4$, and $0$ at each surjective endpoint.\n\nSecond, the authors' verifiers, published as arXiv ancillary files, both pass here: quintics 1.2 s, septics 0.9 s reporting 15 endpoints, 120 forms and 15 maximal minors. Neither uses floating point or randomness. The septic verifier genuinely recomputes rather than trusting stored numbers, which I confirmed by altering one exponent of one form: the run then failed at the matrix digest instead of passing.\n\nNot established here: the reduction of each $r$-range to its endpoints is a mathematical argument that was not checked, and the 120 septic forms exist only inside the certificate, so for septics I ran their verifier rather than rebuilding independently. Unrefereed, with no human review.",
      aiRole:
        "Disclosed in the abstract and in a closing section, \"Disclosure of automated assistance\". The abstract states that \"The main results of this paper were obtained through a generative-AI workflow using OpenAI GPT-5.6 Sol, Anthropic Claude Fable 5, and Grok 4.6\", and the disclosure section lists what the workflow did: \"the formulation of mathematical ideas, generation of conjectures and proof strategies, derivation and checking of intermediate steps, construction of examples and exact certificates, comparison of literature and candidate proof approaches, organization of arguments, LaTeX drafting, and revision of the final text\". It adds that the workflow \"decomposed the problem into smaller subproblems and used repeated self-critique and alternative derivations to test the quantifiers, the characteristic-zero scope, and the endpoint-rank reductions\".\n\nThat credits the mathematics rather than tooling, which is what puts this in scope, and it goes well beyond editing: proof strategies and the exact certificates are the substance of this paper. It is filed as co-developed rather than AI-discovered because no single step is attributed to a named model, the account is of a workflow rather than of a system solving a stated subproblem, and two human authors direct it throughout.",
      ageNote:
        "Dated from Fröberg's 1985 paper \"An inequality for Hilbert series of graded algebras\", where the predicted Hilbert series for ideals of general forms was proposed. The conjecture has stood since, proved in scattered cases: $n\\le3$ by Anick, $r\\le n$ trivially, and various fixed-degree or fixed-generator slices. It remains open in general.",
      significanceNote:
        "Fröberg's conjecture is a well-known named problem in commutative algebra, open since 1985, and progress on it is hard. But this settles two fixed-degree slices - equal quintics and septics, in four variables only - and the paper is explicit that the unrestricted conjecture stays out of scope. The new content is the endpoint rank certificates closing $6\\le r\\le11$ and $6\\le r\\le21$. Placed at 14, just below the Tu-Deng entry at 15 and above the routine named-problem band at 10: a real but narrow advance on a famous conjecture.",
    },
    links: [
      {
        label: "Ancillary exact verifiers and septic certificate (arXiv anc/)",
        url: "https://arxiv.org/src/2608.24797v3/anc",
        kind: "code",
      },
    ],
    message: `Published, with verification raised to site-confirmed. Your submission was accurate as written; the change is that I reproduced the computation rather than taking it on trust.

Two ways. First without your code: the paper prints all 21 quintic forms with every coefficient +1 and states the monomial order, so I rebuilt the Macaulay matrices from the text, ran my own elimination, and got all ten rows of Table 2 exactly over F2, F101 and F1009. Then the step the paper leaves implicit, which is the one that matters: each rank gives exactly Fröberg's predicted dimension. Recomputing the prediction myself, (6,9) gives 220-210 = 10 against predicted 10, (8,8) gives 5, (11,7) gives 10, (20,6) gives 4, and each surjective endpoint gives 0.

Second, your ancillary verifiers both pass here - quintics 1.2 s, septics 0.9 s reporting 15 endpoints, 120 forms, 15 maximal minors. I checked they use no floating point or randomness, and that the septic verifier can actually fail: it rebuilds each matrix from the 120 forms rather than trusting stored ranks, and when I altered a single exponent in one form it stopped at the matrix digest instead of passing. A certificate that cannot fail proves nothing, so that test was the point.

The note is equally clear on limits: the reduction of each r-range to its endpoints is an argument I did not check, and the septic forms live only inside the JSON, so there I ran your verifier rather than rebuilding.

Classification kept as you set it. Partial and Computation are right, since the paper says plainly that the unrestricted conjecture is out of scope. AI co-developed is right too: your disclosure credits proof strategies and the certificates, which is mathematics and not tooling, but no single step is attributed to a named model and two human authors direct the workflow.

Also filled: significance 14, an age note dating the conjecture to Fröberg 1985, and a link to the ancillary files, since they are what make the result checkable.`,
  },
  {
    slug: "full-rsb-in-the-sherrington-kirkpatrick-spin-glass",
    reason: "downgraded",
    next: {
      verification: "unreviewed",
      resolutionMethod: "argument",
      posedBy: "Giorgio Parisi",
      significance: 35,
      aiRole:
        "The most explicit authorship disclosure in this catalog. The manuscript's opening note says the proof arguments and prose \"were generated by the same model from prompts supplied by Hong-Bin Chen\", and then states on its own line:\n\n\"ChatGPT 5.6 is the author of the manuscript.\"\n\nIt continues: \"Since arXiv's policy on generative AI language tools does not permit such a tool to be listed as an author, Hong-Bin Chen is only formally listed as the author for submission purposes and assumes full responsibility for the submitted text. This formal attribution reflects arXiv's policy rather than the division of labor in producing the manuscript: Hong-Bin Chen's role was limited to prompting, editing, proofreading, and verifying the arguments; in particular, he did not construct the proof arguments. He has read and verified the proofs, although errors or oversights may remain.\"\n\nThe Lean development was also written by the same model. AI-discovered is unambiguous here: a human posed the problem and checked the output, and states outright that he did not construct the argument.",
      verificationNote:
        "Unreviewed, and the tier was lowered from Lean-checked on inspection of the repository - a labelling correction, not a doubt about the mathematics.\n\nWhat holds: across 75 files and 5,544 lines of Lean 4 there is no $\\texttt{sorry}$, no $\\texttt{admit}$ and no $\\texttt{native\\_decide}$, confirmed on 28 August 2026. What does not: the Lean-checked rung requires no stray axioms, and this project declares seven mathematical axioms in $\\texttt{ExternalInputs.lean}$. Three cite prior work (Lopatto, Auffinger-Chen, Chen-Handschy-Lerman), but four stand in for the paper's own unformalized analysis - the minimizer itself, and the analytic data behind Propositions 4.1-4.2, 4.3 and 4.4. The repository's own ledger also marks several items \"Open analytic\", and notes that four terminal approximation modules are \"excluded from the root target and omitted from this GitHub bundle\".\n\nWhat the formalization does establish is real and is credited: given that analytic data, the gap exclusions and the smooth-density conclusion are Lean deductions rather than assumptions, as AXIOMS.md is careful to state. The repository is unusually candid - it ships an axiom ledger and a dependency table, and the paper's own footnote says \"This is not an assumption-free verification of the entire paper\". The project was not built here, for want of a toolchain. The paper is an unrefereed preprint and no human has independently reviewed the analysis.",
      resultNote:
        "For the Sherrington-Kirkpatrick model with no external field, at zero temperature $\\beta=\\infty$, the paper proves that the zero-temperature Parisi minimizer is absolutely continuous with a smooth density and has support $[0,1)$ - full replica symmetry breaking, confirming the Parisi picture at the ground state. It also shows $q_\\beta\\to1$ as $\\beta\\to\\infty$.\n\nThe positive-temperature input is Lopatto's: for every $\\beta>1$ the Parisi measure is supported on the closed interval $[0,q_\\beta]$, with a smooth density on $[0,q_\\beta)$ and a single atom at the right endpoint $q_\\beta$. That endpoint atom is what the paper's own quantitative estimates target, so it is not incidental. This entry is cited as Theorem 1.1 rather than reproved.\n\nRemark 1.4 is worth reading beside the support claim: the half-open interval is essential, because the zero-temperature functional cannot see an endpoint atom at all, so there is no canonical mass there to converge to.",
      ageNote:
        "Dated from Parisi's 1979 Physical Review Letters paper \"Infinite number of order parameters for spin-glasses\", which introduced the hierarchical order parameter whose full-RSB structure is confirmed here. The paper cites it as the origin of the prediction rather than as a formally posed conjecture.",
      significanceNote:
        "Full replica symmetry breaking in the SK model is a central prediction of Parisi's theory, and establishing it rigorously at zero temperature - absolute continuity, smooth density, support all of $[0,1)$ - is a substantial result rather than a technical refinement. It sits above the SK-adjacent entries already here, Talagrand's critical overlap conjecture at 30 and the Gardner transition at 28. Held below the top band because it is unrefereed, no human has reviewed the analysis, and it takes Lopatto's positive-temperature structure theorem as an input.",
    },
    message: `Published. The disclosure here is the most explicit in the catalog. One tier corrected, one factual fix, several blanks filled.

The correction: verification goes from Lean-checked to Unreviewed. That is the label, not the mathematics. I cloned the repo and confirmed the good half - across 75 files and 5,544 lines there is no sorry, admit or native_decide. But that rung also requires no stray axioms, and the project declares seven. Three cite prior work; four stand in for the paper's own unformalized analysis, including the data behind Propositions 4.1-4.4 and the minimizer itself. The ledger also marks several items "Open analytic" and excludes four terminal modules from the root target.

This reflects well on the author. The repo ships AXIOMS.md and a dependency table, and the paper's footnote says "This is not an assumption-free verification of the entire paper" - exactly right, and rarer than it should be. The note credits what the Lean does prove: given the analytic data, the gap exclusions and the smooth density are deductions, not assumptions. But a reader seeing "Lean-checked" would take the theorem to be machine-checked modulo statement fidelity, when it is so modulo the paper's core PDE and Itô analysis.

The factual fix: your result note had Lopatto's support as [0,q_β), half-open. Lopatto's abstract and this paper's Theorem 1.1 both give the closed [0,q_β], with a smooth density on [0,q_β) and a single atom AT q_β - and that atom is what the paper's estimates are about. I added Remark 1.4 too, since the half-open interval at zero temperature is essential for a different reason: the functional cannot detect an endpoint atom at all.

Filled: posedBy Giorgio Parisi, matching the 1979 PRL you dated it from; method Argument; an AI-role note quoting "ChatGPT 5.6 is the author of the manuscript" in full; an age note; and significance 35, above the SK-adjacent entries at 28 and 30, held below the top band as unrefereed and reliant on Lopatto's theorem.`,
  },
];

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  const loaded: { job: Job; id: string; submittedById: string | null; before: Record<string, unknown> }[] = [];

  for (const job of JOBS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: job.slug },
      select: {
        id: true, status: true, submittedById: true, resolution: true,
        resolutionMethod: true, verification: true, aiContribution: true,
        significance: true, posedBy: true,
      },
    });
    if (!cur) throw new Error(`not found: ${job.slug}`);
    if (cur.status !== "pending") throw new Error(`${job.slug} status is ${cur.status}`);

    console.log(`\n=== ${job.slug} ===`);
    for (const [k, v] of Object.entries(job.next)) {
      const lim = LIMITS.get(k);
      if (lim && typeof v === "string") {
        const over = v.length > lim;
        console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
        if (over) bad++;
      }
    }
    for (const l of job.links ?? []) {
      console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
    console.log(`  message: ${job.message.length}/${MESSAGE_MAX}${job.message.length > MESSAGE_MAX ? `  OVER BY ${job.message.length - MESSAGE_MAX}` : ""}`);
    if (job.message.length > MESSAGE_MAX) bad++;
    for (const f of ["resolution", "resolutionMethod", "verification", "significance", "posedBy"] as const) {
      if (f in job.next) console.log(`  ${f} : ${cur[f]} -> ${job.next[f]}`);
    }
    console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
    loaded.push({ job, id: cur.id, submittedById: cur.submittedById, before: cur as never });
  }

  if (bad) throw new Error(`${bad} limit violation(s)`);
  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  for (const { job, id, submittedById } of loaded) {
    const nLinks = await prisma.problemLink.count({ where: { problemId: id } });
    await prisma.$transaction([
      prisma.problem.update({
        where: { id },
        data: {
          ...job.next,
          status: "published",
          reviewedAt: new Date(),
          reviewMessage: job.message,
          reviewReason: job.reason,
          ...(job.links?.length
            ? { links: { create: job.links.map((l, i) => ({ ...l, position: nLinks + i })) } }
            : {}),
        } as never,
      }),
      prisma.problemActivity.create({
        data: { problemId: id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
      }),
      prisma.directMessage.create({
        data: {
          userId: submittedById!, senderId: curator.id, senderName: curator.pseudonym,
          kind: "decision", reason: job.reason, body: job.message, problemId: id,
        },
      }),
    ]);
    console.log(`PUBLISHED ${job.slug}`);
  }
}

main().finally(() => prisma.$disconnect());
