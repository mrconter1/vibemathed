// Review of the four submissions that arrived 11-12 September 2026, after
// the morning dump. Three approved with edits, one held. Plus one correction
// message to a submitter declined earlier today for a reason that was wrong.
//
// ---------------------------------------------------------------------------
// MORRIS'S CONJECTURE, k = 4 (Liu; Zenodo 22702735) - approved, Candidate as
// submitted, unreviewed, ai-co-developed, significance 15.
//
// Morris (2006, Conjecture 2) conjectured FC(k,n) = Theta(n^{k-2}) for every
// fixed k >= 2. The manuscript records that Pulaj settled k = 3 exactly
// (FC(3,n) = floor(n/2)+1 for n >= 4), so four-uniform is the first open
// case, and proves FC(4,n) = Theta(n^2) with explicit bounds
// r(n-3r)+1 <= FC(4,n) <= 1 + floor(160 n(n-1)/3) for n >= 20, r = floor(n/6).
//
// Checked: the Zenodo record exists with the abstract as submitted (V1,
// 11 Sep, one author); the manuscript's AI statement was read and is quoted
// in full in aiRole - it is a co-development statement, with the finite
// classification FC(4,9) = 16 "developed primarily by the models" and the
// author proposing the four-set extension; the companion GitHub release V1
// holds the exact certificates and Python/C++ verifiers. Zenodo's PDF blocks
// automated download; the copy read here came through a browser fetch. None
// of the mathematics was checked and the verifiers were not run. Candidate
// is what the submitter asked for and is right for a one-day-old single-
// author preprint.
//
// Not extraordinary: one uniformity of a conjecture known inside the
// union-closed subcommunity. Significance 15, below Daykin-Frankl at 25.
//
// ---------------------------------------------------------------------------
// BOLLOBAS-NIKIFOROV (Coutinho, Liu, Spier, Tang, Zhang) - approved, tier
// LIFTED from Lean-checked to Lean-verified, Candidate as submitted,
// ai-co-developed, significance 30.
//
// A full proof of a named 2007 conjecture (JCTB) that stayed open through
// 2026 - Lin-Ning-Wu did triangle-free, Zhang regular, then few-triangles,
// complete multipartite, and a.a.s. for random graphs. The rule for a claim
// this size is: held until a named expert has checked it OR a formal proof
// exists. A formal proof exists, and the question is whether its statement
// is faithful. It is, and it was audited here at the reviewed commit edb5259:
//
//   1. Challenge.lean imports only Mathlib. The headline theorem
//      lambda1_sq_add_lambda2_sq_le is stated entirely in Mathlib
//      vocabulary: G : SimpleGraph V on a Fintype, G ≠ ⊤ for non-complete,
//      [Nontrivial V] for at least two vertices, G.cliqueNum for omega,
//      G.edgeFinset.card for |E(G)| counted once, and lambda1/lambda2 as
//      indices 0 and 1 of Mathlib's eigenvalues₀ of the real adjacency
//      matrix - which is nonincreasing (the development uses
//      eigenvalues₀_antitone). The inequality reads
//      lambda1^2 + lambda2^2 <= 2 (1 - 1/omega) |E|. That is the conjecture.
//   2. No hypothesis beyond those; nothing project-defined in the statement
//      except the two thin wrappers, whose definitions sit in the same file.
//   3. Solution.lean supplies the same five names from the development;
//      comparator.json compares them with only the three standard axioms
//      and enable_nanoda: true - the independent kernel. VERIFICATION.md
//      records the local comparator run ("Nanoda kernel accepts the
//      solution"); Palomar checks and Lean Action CI both passed on GitHub
//      at the reviewed commit.
//   4. No sorry outside the five deliberate holes in Challenge.lean, no
//      axiom, no native_decide, no unsafe in BN/.
//
// So Lean-verified: kernel-checked AND the formal statement anchored, here,
// against pure Mathlib. The submitter's reason for choosing Lean-checked
// was "no independent third party has yet audited the correspondence";
// this review is that audit for the site's purposes, and the note says so.
//
// Candidate rather than Resolved, following the Köthe and Smale precedent
// (Lean-verified + Candidate until a named expert with no stake confirms).
// The residual here is smaller than there - the statement is pure Mathlib -
// and the note says what flips it.
//
// Publication: announcement, as submitted; the manuscript is a preliminary
// note in the repository, not on arXiv. sourceUrl pinned to the commit.
//
// ---------------------------------------------------------------------------
// KOMLOS AND BECK-FIALA (Guo, Fang, Lu; arXiv 2609.11189) - HELD under the
// extraordinary-claims rule.
//
// Claims the full Komlós conjecture with constant 3 sqrt(2 pi), which gives
// Beck-Fiala as a corollary. Komlós (1981) is one of the central open
// problems of discrepancy theory; Banaszczyk's O(sqrt(log n)) has stood
// since 1998. An 18-page v1, one day old, no formalization, no endorsement,
// and the proof attributed to an agent the paper does not describe. This is
// exactly the rule's case, and the same submitter's Gromov-Hausdorff claim
// was held on the same grounds two days ago.
//
// Not a judgement on the mathematics. Nothing on the row is changed. The
// statement field is the abstract, not the question; that needs rewriting
// if it comes back, and the review note says so.
//
// FOR THE CURATOR, not this script: the same team's Talagrand convolution
// entry (sig 37) was published on 19 August as Resolved / Unreviewed, before
// the 2 September rule. The Yau-Tian-Donaldson entry was held retroactively
// when the rule arrived. Whether the Talagrand entry gets the same treatment
// is a decision, not a review.
//
// ---------------------------------------------------------------------------
// COMPLEX GROTHENDIECK LOWER BOUND (same team; arXiv 2609.07000) - approved,
// Partial as submitted, unreviewed, ai-discovered at face value, sig 30.
//
// K_G^C > 1.35584631827168, up from Davie's ~1.33807, against Haagerup's
// upper bound ~1.40491. A record on a classical constant, not a resolution,
// so partial - which is exactly how this catalog files rank records, prime
// gap records and the matrix multiplication exponent. Not extraordinary.
// The numerical part is certified by Arb ball arithmetic with the code and
// exact inputs as arXiv ancillary files and in a linked repository; not run
// here. The disclosure is the same one sentence as the Talagrand entry, and
// aiRole handles it the same way: face value, model maker left empty.
//
// ---------------------------------------------------------------------------
// GOMILA, Lambda <= 0.1787854 - correction message, no status change.
//
// Declined this morning with the message that "records of exactly this kind
// are tracked here as Frontiers, not as entries". That is not the site's
// practice: prime-gaps-at-most-186, elliptic-curve-rank-record-thirty-one,
// matrix-multiplication-exponent-2371177 and dozens more are entries with
// resolution partial, and frontier rows link to them. The decline's other
// grounds stand - the form carried the submitter's name as the entry name,
// no statement, no field - but the reason given was wrong and the submitter
// is told so, with the invitation to resubmit in proper shape.
//
// ---------------------------------------------------------------------------
// --lint runs every local check with no database. Dry run by default. Pass
// --apply to write. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const LINK_LABEL_MAX = 120;

const BN_REPO = "https://github.com/ShengtongZhang-alt/BN";
const BN_SHA = "edb5259dfd055ea31b4c46ac9ea4d33a758c2b99";

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DECISIONS: Decision[] = [
  {
    slug: "four-uniform-case-of-morris-s-conjecture-mathrm-fc-4-n-theta-n-2",
    action: "approve",
    reason: "edited",
    edits: {
      shortName: "Morris's conjecture, k = 4",
      resultNote:
        "It is proved that $\\mathrm{FC}(4,n)=\\Theta(n^2)$, settling the four-uniform case of Morris's conjecture; the three-uniform case had been settled exactly by Pulaj, so this was the first open uniformity. Explicitly, for $n\\ge 20$ and $r=\\lfloor n/6\\rfloor$, $r(n-3r)+1\\le\\mathrm{FC}(4,n)\\le 1+\\lfloor\\tfrac{160}{3}n(n-1)\\rfloor$, and with the Chung-Frankl triple-star theorem $\\mathrm{FC}(4,n)\\le(18+o(1))n^2$. The key step is a sharp sunflower criterion: four-sets with a common two-point core and pairwise disjoint two-point petals form a Frankl-complete configuration if and only if there are at least nine petals, the positive direction by a charging inequality with weight three on the core and one on the petals. Separately, exact certificates establish $\\mathrm{FC}(4,9)=16$ and refute Pulaj and Wood's lexicographic extremality conjecture. The paper also explains why higher-uniformity sunflowers cannot supply the same local forcing, so the general conjecture stays open.",
      aiRole:
        "The manuscript's AI statement, in full: \"The author and AI models both made substantial mathematical contributions to this work. The finite classification establishing $\\mathrm{FC}(4,9)=16$ was developed primarily by the models. The author proposed extending this work to the four-set case of Morris's conjecture and contributed to proof development and refinement. The collaboration developed the charging inequality, $3:1$ core-petal weights, and matching negative certificates for the sharp nine-petal sunflower threshold, and combined this local criterion with extremal bounds to prove $\\mathrm{FC}(4,n)=\\Theta(n^2)$. GPT-6 Astra (OpenAI) and Fable 5.1 (Anthropic) contributed to proof exploration, computation, and review. The author takes full responsibility for all mathematical results and the contents of this manuscript.\" Co-developed on that account: the models carried the finite classification and shared the main argument, the author set the target and takes responsibility.",
      verificationNote:
        "Zenodo preprint V1, published 11 September 2026, one author, no independent endorsement. Checked here: the record exists with the abstract as submitted; the manuscript states Morris's Conjecture 2 as the entry does and records that Pulaj settled the three-uniform case exactly ($\\mathrm{FC}(3,n)=\\lfloor n/2\\rfloor+1$ for $n\\ge 4$), so this is the first open uniformity and not a duplicate of anything in the catalog; the companion repository release V1 holds the exact certificates for $\\mathrm{FC}(4,9)=16$ and for the Pulaj-Wood refutation with Python and C++ verifiers. None of the mathematics was checked here and the verifiers were not run. Filed as Candidate, as submitted, until an independent reader has been through the argument or the finite certificates have been replayed.",
      significance: 15,
      significanceNote:
        "One uniformity of a named 2006 conjecture of Morris in the union-closed literature, and the first open case after Pulaj settled k = 3. Known to the people who work on Frankl's conjecture and to nobody else. Below the Daykin-Frankl entry at 25, which is a conjecture in its own right, and level with the Elton-Odell and Dittert-dimension-16 entries at 15: a specific case of a subcommunity conjecture.",
    },
    message: [
      "Approved and published as Candidate, as you asked, at Unreviewed.",
      "",
      "What was checked: the Zenodo record and its abstract; the manuscript's AI statement, which is now quoted in full on the entry rather than paraphrased; that Morris's Conjecture 2 is as you stated it and that Pulaj's exact result for k = 3 makes four-uniform the first open case; and that the V1 release holds the certificates and verifiers. The mathematics was not checked and the verifiers were not run, which is why Candidate is the right status for a one-day-old preprint. If someone independent reads it, or the finite certificates get replayed, say so and it moves.",
      "",
      "Edits: the short name is plain text (that field renders raw, so the $k=4$ showed as dollars); the result note now carries the explicit bounds from Theorem 1.1 and the Pulaj context; the verification note says what was and was not checked. Significance 15: one case of a conjecture known inside a single subcommunity, below Daykin-Frankl at 25.",
      "",
      "Nothing else changed. The two links you gave, the certificates release and Morris's paper, are exactly right.",
    ].join("\n"),
  },
  {
    slug: "bollobas-nikiforov-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      statement:
        "Let $G$ be a finite simple graph with $m=|E(G)|$ edges and clique number $\\omega(G)$, and let $\\lambda_1(G)\\ge\\lambda_2(G)\\ge\\cdots\\ge\\lambda_n(G)$ be the eigenvalues of its adjacency matrix. Bollobás and Nikiforov conjectured in 2007 that every non-complete graph satisfies $$\\lambda_1(G)^2+\\lambda_2(G)^2\\le 2\\Bigl(1-\\frac{1}{\\omega(G)}\\Bigr)m.$$ Before this work it was known for triangle-free graphs (Lin, Ning and Wu), regular graphs (Zhang), graphs with few triangles, complete multipartite graphs, and asymptotically almost surely for random graphs, and open in general.",
      model: "GPT-6 Astra; Grok 4.6; Claude Fable 5.1",
      modelMaker: "OpenAI; xAI; Anthropic",
      verification: "lean-verified",
      verificationNote:
        "Lifted from the submitted Lean-checked to Lean-verified, because the correspondence the submitter said nobody had audited was audited here, on 12 September 2026, at commit edb5259. Challenge.lean imports only Mathlib and states the headline theorem entirely in Mathlib vocabulary: $G$ a SimpleGraph on a finite vertex type, $G\\ne\\top$ for non-complete, Nontrivial for at least two vertices, G.cliqueNum for $\\omega$, G.edgeFinset.card for $|E(G)|$ counted once, and $\\lambda_1,\\lambda_2$ as the first two entries of Mathlib's eigenvalues₀ of the real adjacency matrix, which is nonincreasing. There is no hypothesis beyond those and nothing project-defined in the statement beyond those two thin wrappers, whose definitions sit in the same file. Solution.lean supplies the same five names from the development; comparator.json compares them with only propext, Classical.choice and Quot.sound permitted and with nanoda enabled as an independent kernel; VERIFICATION.md records the comparator run accepting the solution under both kernels; Palomar checks and Lean Action CI passed on GitHub at the reviewed commit. No sorry outside the five deliberate holes in Challenge.lean, no axiom, no native_decide. The build was not repeated here. Candidate rather than Resolved is the site's practice for named conjectures with a formal proof: it flips when a named expert with no stake confirms publicly that the formal statement is the conjecture, a short read since the statement is pure Mathlib.",
      significance: 30,
      significanceNote:
        "A named 2007 conjecture from a JCTB paper, with a nineteen-year trail of partial results - triangle-free, regular, few triangles, complete multipartite, random graphs - and its own problem record. Famous within spectral graph theory and unknown outside it, which is the band's definition. Level with the Albertson-Berman induced-forest and Hadamard-668 entries at 30; below the Petersen colouring conjecture at 40, which reaches the whole of graph theory.",
      sourceUrl: `${BN_REPO}/tree/${BN_SHA}`,
      sourceName:
        "GitHub repository (Lean 4 proof and preliminary note), pinned to the reviewed commit",
    },
    links: [
      {
        kind: "lean-statement",
        label: "Challenge.lean: the five statements against plain Mathlib, at the reviewed commit",
        url: `${BN_REPO}/blob/${BN_SHA}/Challenge.lean`,
      },
      {
        kind: "lean-proof",
        label: "Solution.lean: the comparator-checked bridge to the development",
        url: `${BN_REPO}/blob/${BN_SHA}/Solution.lean`,
      },
      {
        kind: "other",
        label: "VERIFICATION.md: the recorded comparator and nanoda run",
        url: `${BN_REPO}/blob/${BN_SHA}/VERIFICATION.md`,
      },
    ],
    message: [
      "Approved and published, at Lean-verified rather than the Lean-checked you selected, and as Candidate as you selected. Both are explained on the entry; here is the short version.",
      "",
      "You chose Lean-checked because no independent third party had audited the informal-to-formal correspondence. That audit is what this review did. Challenge.lean imports only Mathlib and states the headline theorem in Mathlib's own vocabulary - SimpleGraph, G ≠ ⊤, Nontrivial, cliqueNum, edgeFinset.card, and the first two entries of eigenvalues₀, which Mathlib orders nonincreasingly - with no hypothesis beyond those and nothing project-defined in the statement beyond the two wrappers whose definitions are in the same file. That is the Bollobás-Nikiforov inequality. With comparator, nanoda, Palomar and Lean Action all green at edb5259, that is Lean-verified by this site's definition: kernel-checked and the statement anchored.",
      "",
      "Candidate rather than Resolved is the site's practice for named conjectures with a formal proof and no outside expert yet on record (Köthe and Smale sit the same way). It flips when a named expert with no stake confirms publicly that the formal statement is the conjecture. Since the statement is pure Mathlib, that is a short read for anyone in spectral graph theory, and the arXiv posting you mention will probably bring it.",
      "",
      "Other edits: the statement uses $ delimiters (the \\( form does not render here) and now records the prior partial results; the model field lists all three systems with their roles in your disclosure; the source URL is pinned to the reviewed commit; three links added to the statement, the bridge and the verification record. Significance 30: famous within one research community.",
      "",
      "This is the cleanest statement surface this site has seen. Thank you.",
    ].join("\n"),
  },
  {
    slug: "komlos-and-beck-fiala-conjectures",
    action: "reject",
    reason: "held",
    reviewNote:
      "Held 12 Sep 2026 under the extraordinary-claims rule: arXiv 2609.11189 v1, 18 pages, one day old, claiming the full Komlós conjecture with constant 3 sqrt(2 pi) and Beck-Fiala as a corollary, proof attributed to an 'Odin Automatic AI Research Agent' the paper does not describe. Nothing on the row changed. If it comes back: the statement field is the paper's abstract and must be rewritten as the question (Komlós 1981: is there a universal constant K such that every family of unit vectors admits a signing with l-infinity norm at most K?); significance would sit around 50; the disclosure is one sentence and should be handled as on the Talagrand convolution entry. Watch arXiv for v2 and for discrepancy-theory commentary (Bansal, Dadush, Garg, Lovett, Meka, Rothvoss, Nikolov). Same submitter as the held Gromov-Hausdorff entry and the published Talagrand and Grothendieck entries.",
    message: [
      "Held rather than declined, and not a judgement on the mathematics.",
      "",
      "The methodology's extraordinary-claims rule: a claim that would be a major result by any expert's standard is not published at Unreviewed and not published as a Candidate either, because a listing here puts the site's name beside a claim it has not read. A proof of the Komlós conjecture - the full conjecture, with a universal constant, and Beck-Fiala with it - is a landmark of discrepancy theory by any standard; Banaszczyk's square-root-log bound has stood since 1998. It arrived as an 18-page version 1 that was one day old, with no formalization, no endorsement, and the proof attributed to an agent the paper describes in one sentence. Nobody has read it yet, here or anywhere. Your Gromov-Hausdorff submission was held on the same grounds two days ago, and this one is a larger claim.",
      "",
      "The way back, any one of these: a named expert with no stake in the work says publicly that they have checked the argument; the paper is accepted by a journal; or a machine-checked proof of Theorem 1.1 exists. Send it again on any of those and it goes in at the tier it has earned.",
      "",
      "Two things to fix when it returns, so you know now. The statement field currently holds the paper's abstract; the site wants the question as it was posed - Komlós, 1981: is there a universal constant such that every finite family of unit vectors admits a signing of bounded l-infinity norm? And the AI disclosure is one sentence; if the authors can say what Odin is and how it was run, the entry can say more than 'taken at face value'.",
      "",
      "Your Grothendieck submission from the same team, a record rather than a resolution, is published today; the two are not treated alike because the claims are not alike in size.",
    ].join("\n"),
  },
  {
    slug: "lower-bound-for-the-complex-grothendieck-constant",
    action: "approve",
    reason: "edited",
    edits: {
      statement:
        "What is the exact value of the complex Grothendieck constant $K_G^{\\mathbb C}$, the least $K$ such that $\\bigl|\\sum_{i,j}a_{ij}\\langle x_i,y_j\\rangle\\bigr|\\le K\\max_{|\\varepsilon_i|=|\\delta_j|=1}\\bigl|\\sum_{i,j}a_{ij}\\varepsilon_i\\delta_j\\bigr|$ for every complex matrix $(a_{ij})$ and all unit vectors $x_i,y_j$ in any complex Hilbert space? Grothendieck proved it finite in 1953. Before this work the best bounds were Davie's lower bound of about $1.33807$ and Haagerup's 1987 upper bound of about $1.40491$; the value is open, and this entry records progress on the lower bound.",
      posedBy:
        "Alexandre Grothendieck, Résumé (1953); the value of the complex constant an explicit open question at least since Haagerup's 1987 upper bound",
      modelMaker: null,
      aiRole:
        "The paper's disclosure is one sentence, in the abstract and again under the heading \"The role of AI in this proof\": \"Odin Automatic AI Research Agent was used to derive the lower bound and the proof.\" Taken at face value, as this site's classification rule requires, that is an AI-discovered claim, and it is the same disclosure this team gave for its Talagrand convolution entry. The paper says nothing about what Odin is, which models it runs on, or how it was steered, and no public description of the system was found, so the model maker is left empty rather than guessed at. The three named humans are Shengtao Guo, Ethan X. Fang and Junwei Lu.",
      verificationNote:
        "Unreviewed arXiv preprint, v1 of 7 September 2026, with no independent endorsement and no peer review. The numerical part is certified by Arb ball arithmetic with outward rounding; the verification code and the exact rational inputs are supplied as arXiv ancillary files and in the linked repository, and were not run here. The analytic part - the dimension-independent $L_\\infty$-to-$L_1$ estimate for the weighted Gaussian Hermite multipliers that turns the certified numbers into a bound on $K_G^{\\mathbb C}$ - was not checked. Checked here: the arXiv record and abstract as submitted, that Davie's and Haagerup's bounds are as the paper states them, and that the catalog holds no entry on either Grothendieck constant, so the 2026 real-constant improvements the submitter mentions are not duplicates. Partial: a better lower bound, not the value.",
      significance: 30,
      significanceNote:
        "The exact value of Grothendieck's constant is a classical open problem of functional analysis with reach into optimization and computer science; the complex case has carried its own literature since Haagerup's 1987 bound and gets less attention than the real one. Level with the Albertson-Berman and Hadamard-668 entries at 30, above the kissing-number-in-19-dimensions record at 25, below the binary-code upper-bounds entry at 39, which sits on a question the whole of coding theory asks.",
    },
    links: [
      {
        kind: "code",
        label: "Interval-arithmetic certificates and verifiers (repository named in the paper)",
        url: "https://github.com/shengtaoguo/complex-grothendieck-certificates",
      },
      {
        kind: "other",
        label: "arXiv ancillary files: the same verifiers and exact inputs, frozen with v1",
        url: "https://arxiv.org/src/2609.07000v1/anc",
      },
    ],
    message: [
      "Approved and published as Partial at Unreviewed, which is exactly how this catalog files records on a constant - the prime-gap records, the rank records and the matrix multiplication exponent all sit the same way.",
      "",
      "Edits: the statement now poses the question (the value of the complex constant, with Davie's and Haagerup's bounds as the state of play) rather than carrying the abstract; posedBy names Grothendieck 1953 with Haagerup 1987 as where the complex value became an explicit question; the verification note says what was checked (the record, the bounds, no duplicate on either constant) and what was not (the verifiers were not run, the analytic estimate was not read). Your note that the real-constant improvements are distinct was checked and is right.",
      "",
      "Two things on the AI side, handled the same way as your Talagrand entry. The disclosure is one sentence, so AI-discovered is recorded at face value and the model maker is left empty rather than guessed at. If the authors can say anywhere public what Odin is and how it is run, send that and the entry will say more.",
      "",
      "Significance 30, level with the Albertson-Berman and Hadamard-668 entries. Two links added: the certificates repository the paper names, and the arXiv ancillary files, which are the same code frozen with v1.",
    ].join("\n"),
  },
];

/// Messages that are not decisions: sent as notes on entries already decided.
const NOTES: { slug: string; body: string }[] = [
  {
    slug: "jude-gomila",
    body: [
      "A correction to this morning's decline, from the reviewer who wrote it.",
      "",
      "I told you that records of this kind are tracked here as Frontiers and not as entries. That is wrong, and I should have checked before writing it. The catalog files record improvements as entries with resolution Partial - the prime-gap records, the elliptic-curve rank records, the matrix multiplication exponent, the kissing number in 19 dimensions all sit that way - and a frontier row links to the entry when a frontier exists. A better upper bound on the de Bruijn-Newman constant is exactly that kind of result, and a complex Grothendieck lower bound was published today on those terms.",
      "",
      "What did stand in the way was the form: the entry name arrived as your own name, and there was no statement, no field and no links, so there was no text to review. If you resubmit with those filled - the question (Newman's conjecture and the history of upper bounds on Lambda), the field (analytic number theory), the entry name, and the release tag or commit your sealed SHA256SUMS attest - it will be reviewed on its merits as a Partial, Unreviewed entry, with the external referee report and the ongoing expert reworking noted as they are in your README. If you would rather I draft the statement from the README and send it to you to correct, reply here and I will.",
      "",
      "The extraordinary-claims rule does not apply to a bound improvement, so nothing about the size of the claim holds it back.",
    ].join("\n"),
  },
];

/// The serverless cluster refuses the first connection after idling.
async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string) => Promise<T>;
}): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const d of DECISIONS) {
    console.log(`${d.action === "reject" ? "HOLD   " : "APPROVE"}  ${d.slug.slice(0, 64)}`);
    const mlen = charLength(canonical(d.message));
    console.log(`  message : ${mlen}/${MESSAGE_MAX}${mlen > MESSAGE_MAX ? "  OVER" : ""}`);
    if (mlen > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const n = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && n > lim;
        console.log(`  ${k.padEnd(17)}: ${n}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    for (const l of d.links ?? []) {
      console.log(`  link (${l.kind}) ${l.label.length}/${LINK_LABEL_MAX}: ${l.label}`);
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {} });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  for (const n of NOTES) {
    const len = charLength(canonical(n.body));
    console.log(`NOTE     ${n.slug}\n  message : ${len}/${MESSAGE_MAX}${len > MESSAGE_MAX ? "  OVER" : ""}\n`);
    if (len > MESSAGE_MAX) bad++;
  }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `${localBad} local violation(s)` : "local checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    let bad = 0;
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: {
          id: true,
          status: true,
          name: true,
          sourceUrl: true,
          submittedById: true,
          links: { select: { label: true, url: true } },
        },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({
        specs: SPECS,
        fields: d.edits ?? {},
        links: merged,
        sourceUrl: ((d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl) || null,
      });
      console.log(
        `${d.action.toUpperCase().padEnd(7)}  ${cur.name.slice(0, 60)}  -> merged check: ${v.length ? "FAILED" : "ok"}`,
      );
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      bad += v.length;
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }
    for (const n of NOTES) {
      const cur = await prisma.problem.findUnique({
        where: { slug: n.slug },
        select: { status: true, submittedById: true, name: true },
      });
      if (!cur) throw new Error(`note target not found: ${n.slug}`);
      console.log(`NOTE     ${cur.name.slice(0, 60)}  (status ${cur.status}, submitter ${cur.submittedById ? "yes" : "NONE"})`);
      if (!cur.submittedById) bad++;
    }
    if (bad) throw new Error(`${bad} violation(s) - nothing written`);

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true, _count: { select: { links: true } } },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      const n = cur._count.links;

      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`updated: ${d.slug}`);

      if (cur.submittedById) {
        await prisma.directMessage.create({
          data: {
            userId: cur.submittedById,
            senderId: curator.id,
            senderName: curator.pseudonym,
            kind: "decision",
            reason: d.reason,
            body: d.message.slice(0, MESSAGE_MAX),
            problemId: cur.id,
          },
        });
        console.log(`messaged: ${d.slug}`);
      }

      await prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      });

      if (d.reviewNote) {
        await prisma.reviewNote.create({
          data: {
            problemId: cur.id,
            userId: curator.id,
            userName: curator.pseudonym,
            body: d.reviewNote,
          },
        });
        console.log(`review note: ${d.slug}`);
      }
    }

    for (const nt of NOTES) {
      const cur = await prisma.problem.findUnique({
        where: { slug: nt.slug },
        select: { id: true, submittedById: true },
      });
      if (!cur?.submittedById) continue;
      await prisma.directMessage.create({
        data: {
          userId: cur.submittedById,
          senderId: curator.id,
          senderName: curator.pseudonym,
          kind: "note",
          body: nt.body.slice(0, MESSAGE_MAX),
          problemId: cur.id,
        },
      });
      console.log(`note sent: ${nt.slug}`);
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and");
    console.log("stats lag by up to an hour, or until a deploy.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
