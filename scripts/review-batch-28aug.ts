// Publish the three arXiv submissions from VibeGene. 28 Aug 2026.
//
// All three sources verified against the arXiv API and the PDFs: ids, titles,
// authors, dates and categories all match the submissions, and none is a
// duplicate of an existing entry.
//
// ---------------------------------------------------------------------------
// 1. LARGE SYSTOLES - arXiv:2608.26660v1, math.GT, 27 Aug 2026, Yifei Cai.
//
// Disclosure is in the abstract AND in a dedicated section 1.3, "Declaration on
// the use of AI": "Starting from the constant-twist pants decomposition approach
// described in this note, GPT-5.6 Sol (OpenAI) developed the first complete proof
// of the main theorem through an extended discussion with the author. The proof
// in this manuscript is checked, simplified and reorganized by the author."
// ai-discovered stands - the model produced the proof, the human checked and
// wrote it up, which is that tier's definition.
//
// Every literature claim in the submission's result note checks out against the
// introduction, and I am adding the names the note left out: the every-genus
// ladder is Katz-Sabourau 19/120, then Liu-Petri 2/9 by a random construction,
// now 1. Petri-Walker 2018 already had 1 along a subsequence, so the contribution
// is uniformity. Brooks 1988 and Buser-Sarnak 1994 give limsup >= 4/3, and the
// area bound is max sys <= 2 log(4g-2). Resolution stays partial: the asymptotic
// constant is not determined, and the gap 1 <= liminf, limsup >= 4/3, upper 2 is
// still open. Verification stays unreviewed - nothing mechanical to re-run.
//
// ---------------------------------------------------------------------------
// 2. HIGHER-ORDER TRUTH IN IPL - arXiv:2608.26874v1, math.CT, 27 Aug 2026,
//    Lingyuan Ye and Yiqi Xu.
//
// One field moves: resolution candidate -> resolved. The submitter was being
// conservative, but on this site `resolution` records what the claim settles and
// `verification` records how checked it is; 341 published preprints are
// resolved+unreviewed against 24 candidates, and candidate is kept for claims the
// community is actively adjudicating. This is a clean disproof with no dispute on
// record, so resolved + unreviewed is the honest pair. Nothing about it is
// endorsed as checked.
//
// aiContribution ai-assisted is correct and worth explaining, because I applied
// the same test in the opposite direction to the M23 resubmission today. The M23
// disclosure lists tooling and then says the results were verified without AI, so
// no mathematics is credited to a model and it falls outside. Here the disclosure
// says "The mathematical results in this document were obtained with the help of
// ChatGPT 5.6 Sol" - that credits the mathematics itself, which clears the bar.
// It names no lemma or step, and a vague disclosure takes the lower tier, so
// ai-assisted rather than co-developed. The paper's only AI mention is that one
// abstract sentence; there is no acknowledgements section.
//
// ---------------------------------------------------------------------------
// 3. SUPPORTING AFFINE FUNCTIONALS FOR EoF - arXiv:2608.27363v1, quant-ph,
//    27 Aug 2026, A. S. Holevo and M. E. Shirokov.
//
// Two fields move. resolutionMethod was blank and is now `construction`: an
// explicit two-qubit state settles it. verification unreviewed -> SITE-CONFIRMED,
// because the counterexample was re-derived here in exact arithmetic, from the
// entry's statement rather than the paper's method. Implemented Wootters'
// concurrence from scratch in sympy and got:
//   C(rho) = 1/2 exactly, for rho = (1/2)|Phi+><Phi+| + (1/2)|01><01|
//   C(rho_t) exact at t=10^-6:  999999/2000000 - 3*sqrt(222222)/1000000
//                               which differs from 1/2 - sqrt(2t) by -4.99e-7,
//                               i.e. the O(t) term with coefficient about -1/2
//   the difference quotient [E_F(rho) - E_F(rho_t)]/t at t = 1e-2,4,6,8,10:
//     14.813, 154.66, 1550.9, 15512.7, 155131.3
//   - a clean factor of 10 per two decades, i.e. growth like t^(-1/2), so the
//   limit is +infinity and E_F is not Lipschitz lower semicontinuous at rho.
//   That is exactly the paper's Proposition 3 and its consequence.
//
// ai-co-developed is right rather than ai-discovered. The abstract says "We use
// Wootters' formula and the help of Claude Fable 5 to find a state rho ... for
// which the latter property does not hold". The authors supplied the reduction to
// Lipschitz lower semicontinuity and knew the search was possible in principle;
// the model solved the subproblem they had formulated. That is the co-developed
// definition almost verbatim.
//
// The entry also records that this is a self-correction: the assumption being
// disproved is one the authors used in several of their own earlier articles.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

interface Job {
  slug: string;
  reason: string;
  next: Record<string, unknown>;
  message: string;
}

const JOBS: Job[] = [
  {
    slug: "large-systoles-in-every-sufficiently-large-genus",
    reason: "edited",
    next: {
      significance: 22,
      verificationNote:
        "Unreviewed: an arXiv preprint one day old (v1, 27 August 2026, math.GT), unrefereed, with no formalization and no computational certificate, so there was nothing mechanical to re-run and no mathematics was checked here. What was verified on 28 August 2026: the paper exists at arXiv:2608.26660 with this title and author; the theorem and the $\\liminf\\ge1$ corollary are its abstract and Theorem 1; the AI declaration is section 1.3, quoted in the AI-role note; and every prior-work claim is as the introduction states - Katz-Sabourau's $19/120$, Liu-Petri's $2/9$, Petri-Walker's constant $1$ along a subsequence, Brooks and Buser-Sarnak's $\\limsup\\ge4/3$, and the area bound $\\max\\mathrm{sys}\\le2\\log(4g-2)$.",
      resultNote:
        "The theorem improves the best lower bound valid in *every* sufficiently large genus from asymptotic constant $2/9$ to $1$. The every-genus ladder it climbs is Katz-Sabourau's $19/120$ and then Liu-Petri's $2/9$, the latter also by a random construction. Constant $1$ was already reached by Petri-Walker along a subsequence of genera, following Erdos-Sachs, so the new contribution is achieving it uniformly rather than the constant itself.\n\nThe asymptotic problem stays open, and the remaining gap is wide: Brooks and Buser-Sarnak give $\\limsup\\ge4/3$, while the elementary area bound is $\\max\\mathrm{sys}(S)\\le2\\log(4g-2)$, asymptotically $2\\log g$. So this closes much of the liminf gap and determines no optimal constant.",
      aiRole:
        "Disclosed twice: in the abstract, and in a dedicated section 1.3 \"Declaration on the use of AI\", which reads in full: \"Starting from the constant-twist pants decomposition approach described in this note, GPT-5.6 Sol (OpenAI) developed the first complete proof of the main theorem through an extended discussion with the author. The proof in this manuscript is checked, simplified and reorganized by the author. The author takes full responsibility for the content and correctness of this manuscript.\"\n\nAI-discovered on that wording: the model produced the proof and the human verified and wrote it up, which is what the tier means. The framework it started from was not the model's - the constant-twist pants decomposition comes from Cai and Luo's earlier work on the diameter of finite covers (arXiv:2608.12887), and the note is explicitly a continuation of it. So the human set the approach and the model built the proof inside it.",
      ageNote:
        "No poser and no year recorded, because the target is a standing asymptotic question rather than a posed conjecture: the paper says only that \"It is still widely open to determine the asymptotic behavior of this maximum\". The modern form dates from the Brooks (1988) and Buser-Sarnak (1994) lower bounds, which is where the $\\limsup\\ge4/3$ and the positivity of the liminf come from.",
      significanceNote:
        "The maximal systole in genus $g$ is a classical quantity in hyperbolic geometry and its asymptotic constant is a well-known open question with a long ladder behind it. Moving the every-genus constant from $2/9$ to $1$ is a large step on that ladder and reaches the value previously available only along a subsequence. It is still a bound rather than a resolution, with $4/3$ and $2$ left above it. Placed at 22, in the band with the specialist geometry and mixing entries in the twenties and thirties, below results that settle their question outright.",
    },
    message: `Published as submitted, with the classification intact and three additions.

AI-discovered is right and I checked the reasoning rather than the label. Section 1.3 is a proper declaration: the model "developed the first complete proof of the main theorem through an extended discussion with the author", and the author checked, simplified and reorganized it. That is the tier's definition. Worth noting in the entry, and now recorded: the framework was not the model's - the constant-twist pants decomposition is your earlier work with Qiliang Luo on diameters of finite covers, and the note says it is a continuation. Human sets the approach, model builds the proof inside it.

First addition, to the result note. Your framing was correct but unnamed, so I put the ladder in: Katz-Sabourau's 19/120, then Liu-Petri's 2/9, now 1; and Petri-Walker already had 1 along a subsequence following Erdos-Sachs, so the contribution is uniformity in every large genus rather than the constant. I also stated the remaining gap explicitly - limsup at least 4/3 from Brooks and Buser-Sarnak, area bound asymptotically 2 log g - so a reader cannot mistake Partial for "nearly done".

Second, an age note. There is no poser and no year here because the paper does not claim one; it says only that the asymptotic behaviour is "widely open". I dated the modern form to Brooks 1988 and Buser-Sarnak 1994 in a note rather than filling the fields with a guess.

Third, verification note and significance 22. Nothing was checked mathematically - no formalization, no certificate, nothing to re-run - and the note says so plainly, listing only what I did verify: the paper, the authorship, the statement, the declaration and each prior-work attribution against the introduction.`,
  },
  {
    slug: "failure-of-higher-order-truth-within-intuitionistic-propositional-logic",
    reason: "edited",
    next: {
      resolution: "resolved",
      significance: 18,
      verificationNote:
        "Unreviewed: an arXiv preprint one day old (v1, 27 August 2026, math.CT), unrefereed, with no formalization, and the argument runs through Bellissima's representation and higher-order internal logic, none of which was checked here. Verified on 28 August 2026: the paper exists at arXiv:2608.26874 with this title and both authors; the statement and the negative answer are its abstract; the target is described in its introduction as \"a long-standing problem in categorical logic\" with Pitts cited for a recent summary and a related positive result of Awodey et al. cited alongside; and the proof strategy is as the entry describes it, constructing $A\\in\\mathcal O_\\uparrow(K_2)\\setminus F_2$ and deriving a contradiction from its definability as a global proposition. The single AI sentence in the abstract is the paper's only mention of a model.",
      aiRole:
        "The whole disclosure is one sentence of the abstract: \"The mathematical results in this document were obtained with the help of ChatGPT 5.6 Sol, although the document itself was written entirely by us and we take full responsibility for its contents.\" There is no acknowledgements section and no other mention of a model in the paper.\n\nThat sentence does credit the mathematics rather than tooling, which is what puts this in scope: it says the results were obtained with the model's help, not that a model wrote code or checked prose. But it identifies no lemma, construction or step, and a disclosure this general takes the lower tier, so the entry records AI-assisted rather than co-developed. If a later version attributes the obstruction term, the higher-order formula, or their identification to the model, the tier should move up.",
      ageNote:
        "No poser and no year, because the paper names none: it introduces the target as \"a long-standing problem in categorical logic\", citing Pitts for a recent summary rather than an original source. The equivalent logical form - whether the truth values of a higher-order intuitionistic theory carry structure beyond a Heyting algebra - is the framing the paper itself gives.",
      significanceNote:
        "A long-standing problem in categorical logic, answered negatively and cleanly: not every Heyting algebra is the subterminal lattice of an elementary topos, with the free algebra on two generators as the witness. It is a definite settlement of a named standing question rather than a bound, which lifts it above the specialist entries in the low teens; the field is narrow and the result classifies nothing further, which keeps it below the tier at 30 and up. Placed at 18, beside the Auslander-Reiten-Smalo and Keisler-measure entries at 20.",
    },
    message: `Published, with one field changed and the classification otherwise as you sent it.

Status goes from Candidate to Resolved. You were being conservative and I understand why, but the two fields divide the work differently here: resolution records what the claim settles, verification records how checked it is. Of the published preprints, 341 are Resolved and 24 Candidate, and Candidate is kept for claims the community is actively adjudicating - a disputed priority, a tracker yet to accept. This is a clean disproof with nothing contested on record, so Resolved paired with Unreviewed is the honest combination. Nothing in it says the mathematics has been checked; the verification tier carries that, and its note says outright that the Bellissima representation and the higher-order argument were not checked here.

AI-assisted stays, and your read of why was exactly right, so I have written the reasoning into the entry. The disclosure credits the mathematics itself - "the mathematical results in this document were obtained with the help of ChatGPT 5.6 Sol" - which is what clears the inclusion bar, as against a disclosure that credits only code, search and proofreading. But it names no lemma or step, and a general disclosure takes the lower tier. The note says that if a later version attributes the obstruction term, the higher-order formula, or their identification to the model, the tier should move up.

Also filled: verification note, an age note, and significance 18. The age note exists because the paper names no poser and no year - it says only "a long-standing problem in categorical logic", citing Pitts for a recent summary - so I recorded that rather than guessing at the fields.`,
  },
  {
    slug: "supporting-affine-functionals-for-entanglement-of-formation",
    reason: "edited",
    next: {
      resolutionMethod: "construction",
      verification: "site-confirmed",
      significance: 10,
      verificationNote:
        "Site-confirmed: the counterexample was re-derived here on 28 August 2026, in exact arithmetic, from the entry's statement rather than the paper's method. Wootters' concurrence was implemented from scratch and evaluated symbolically on $\\rho=\\frac12|\\Phi^+\\rangle\\langle\\Phi^+|+\\frac12|01\\rangle\\langle01|$ and on $\\rho_t$.\n\nResults. $C(\\rho)=1/2$ exactly. $C(\\rho_t)$ has exact closed form at each rational $t$ - at $t=10^{-6}$ it is $999999/2000000-3\\sqrt{222222}/10^6$, which differs from $\\frac12-\\sqrt{2t}$ by $-4.99\\times10^{-7}$, the $O(t)$ term with coefficient about $-\\frac12$, confirming the paper's expansion. The difference quotient $[E_F(\\rho)-E_F(\\rho_t)]/t$ evaluates to $14.81$, $154.7$, $1550.9$, $15512.7$ and $155131.3$ at $t=10^{-2},10^{-4},10^{-6},10^{-8},10^{-10}$: a factor of ten per two decades, so it grows like $t^{-1/2}$ and diverges. $E_F$ is therefore not Lipschitz lower semicontinuous at $\\rho$, which by the paper's own criterion is exactly the failure claimed.\n\nWhat this does not establish. The equivalence between a global supporting affine functional and Lipschitz lower semicontinuity is the paper's, and was not checked here; nor were the further existence conditions or the infinite-dimensional bounds. The paper is an unrefereed preprint (v1, 27 August 2026, quant-ph) with no independent review.",
      aiRole:
        "From the abstract: \"We use Wootters' formula and the help of Claude Fable 5 to find a state $\\rho$ of the system $AB$ for which the latter property does not hold.\" The authors had already reduced the existence of a global supporting affine functional to Lipschitz lower semicontinuity, and knew in principle that Wootters' two-qubit formula could yield a counterexample; what they did not have was a practical way to construct one. They report the model found such a state very quickly, and it is the state of Proposition 3.\n\nAI-co-developed rather than AI-discovered, and the distinction is the tier's definition rather than a judgement call: this is a subproblem the authors formulated, inside a proof they set up, which the model solved. The surrounding theory - the equivalence criterion, the existence conditions, the Lipschitz bounds in finite and infinite dimensions - is the authors'.",
      ageNote:
        "No year recorded, and the attribution is unusual: this is a self-correction. The assumption being disproved is one Holevo and Shirokov say they themselves relied on in several of their own earlier articles, so the names in the poser field are the source of the claim rather than of a challenge to it. The abstract's own phrasing is \"In several articles, the authors assume that...\".",
      significanceNote:
        "A precise technical correction inside entanglement theory: finite dimensionality plus the convex-roof structure of the Entanglement of Formation does not give a global supporting affine functional at every state, and the failure appears already for two qubits. It matters because the authors and others had used the assumption, and because the paper replaces it with usable conditions and Lipschitz bounds. It is narrow - degenerate boundary states only - and settles no headline question. Placed at 10, with the quantum conditional entropy continuity entry.",
    },
    message: `Published, with the classification intact, one blank filled and verification raised.

I re-derived your counterexample here rather than taking it on trust, so this entry is site-confirmed - the ladder's wording for that rung is "re-derived a counterexample in exact arithmetic", which is literally what happened. Wootters' concurrence implemented from scratch, evaluated symbolically: C(rho) = 1/2 exactly; at t = 10^-6 the exact value is 999999/2000000 - 3*sqrt(222222)/10^6, differing from 1/2 - sqrt(2t) by -4.99e-7, which is your O(t) term with coefficient about -1/2. The difference quotient runs 14.81, 154.7, 1550.9, 15512.7, 155131.3 at t = 1e-2 through 1e-10 - a factor of ten per two decades, so it grows like t^(-1/2) and diverges. The Lipschitz lower semicontinuity fails at rho exactly as Proposition 3 says.

The note is equally clear about what I did not check: the equivalence criterion itself is yours and was not verified here, nor the further existence conditions or the infinite-dimensional bounds.

Method was blank and is now Construction - an explicit state settles it, which is that category's definition.

AI co-developed stays, and it is the right tier for a reason worth recording. The authors formulated the subproblem (find a state where Lipschitz lower semicontinuity fails, via Wootters) inside a proof they had already set up, and the model solved it. That is the co-developed definition almost word for word, where AI-discovered would need the model to have produced the argument rather than the witness inside it.

One thing your note flagged that I have kept and made prominent: this is a self-correction, an assumption the authors say they used in several of their own earlier articles. That is in an age note, since the poser field naming Holevo and Shirokov would otherwise read as though someone had challenged them.

Also filled: significance 10.`,
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
      select: { id: true, status: true, submittedById: true, resolution: true, resolutionMethod: true, verification: true, aiContribution: true, significance: true },
    });
    if (!cur) throw new Error(`not found: ${job.slug}`);
    if (cur.status !== "pending") throw new Error(`${job.slug} status is ${cur.status}`);

    console.log(`\n=== ${job.slug} ===`);
    for (const [k, v] of Object.entries(job.next)) {
      const lim = LIMITS.get(k);
      if (lim && typeof v === "string") {
        console.log(`  ${k}: ${v.length}/${lim}${v.length > lim ? `  OVER BY ${v.length - lim}` : ""}`);
        if (v.length > lim) bad++;
      }
    }
    console.log(`  message: ${job.message.length}/${MESSAGE_MAX}${job.message.length > MESSAGE_MAX ? `  OVER BY ${job.message.length - MESSAGE_MAX}` : ""}`);
    if (job.message.length > MESSAGE_MAX) bad++;
    for (const f of ["resolution", "resolutionMethod", "verification", "significance"] as const) {
      if (f in job.next) console.log(`  ${f} : ${cur[f]} -> ${job.next[f]}`);
    }
    console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
    loaded.push({ job, id: cur.id, submittedById: cur.submittedById, before: cur as never });
  }

  if (bad) throw new Error(`${bad} limit violation(s)`);
  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  for (const { job, id, submittedById } of loaded) {
    await prisma.$transaction([
      prisma.problem.update({
        where: { id },
        data: { ...job.next, status: "published", reviewedAt: new Date(), reviewMessage: job.message, reviewReason: job.reason } as never,
      }),
      prisma.problemActivity.create({
        data: { problemId: id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
      }),
      prisma.directMessage.create({
        data: { userId: submittedById!, senderId: curator.id, senderName: curator.pseudonym, kind: "decision", reason: job.reason, body: job.message, problemId: id },
      }),
    ]);
    console.log(`PUBLISHED ${job.slug}`);
  }
}

main().finally(() => prisma.$disconnect());
