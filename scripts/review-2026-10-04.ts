// 4 October 2026: the thirteen pending submissions and one contact message.
//
// Every source was opened and checked on 4 October. Where a finite
// certificate or verifier could be re-run in minutes, it was, and the entry's
// verification note says what ran. Five accounts sent the thirteen; two of
// them sent nine between them, across unrelated fields, so the volume rule in
// docs/reviewing.md step 4 applied: statement fidelity checked harder, finite
// certificates preferred over long arguments, nothing raised above
// Unreviewed on the strength of the authors' own AI reviews.
//
// 1. SEVEN EQUIDISTANT LINES (Littlewood) - published, Candidate,
//    Unreviewed, 25. Mingchang Liu (Georgia Tech address), Zenodo
//    10.5281/zenodo.23064311: no eight lines in R^3 have a common positive
//    pairwise distance, so with Bozoki-Lee-Ronyai's seven (2015) the maximum
//    is seven. Littlewood 1968 Problem 7 (p. 20) asked whether seven unit
//    cylinders can touch pairwise; the maximum became the open question from
//    Bezdek 2005 (bound 24) and Ambrus-Bezdek 2008 ("Is it 8?"), with the
//    bound falling to 18 (Koizumi 2025), 10 (Dillon-Koizumi-Luo 2025) and 9
//    (Hofer, arXiv 2606.22605, June 2026). No earlier or concurrent claim
//    of 7 found on arXiv or Zenodo.
//    RE-RUN HERE: the companion repository at 9c37327, with Finschi's
//    catalogue fetched 4 Oct (row hash matched the pinned SHA-256):
//    verify.py PASS, 135 classes, 135 trees, 153,080 leaves, 1,027 exact
//    metric certificates, 50 s; verify_metric_independent.py all 1,027
//    covered; tests OK. Not checked: the three pages of analytic lemmas
//    (hyperbola-secant obstruction, four-line circuit condition).
//    Considered for a hold under the extraordinary-claims rule and not held:
//    the gap was already {7,8,9}, the method is a finite oriented-matroid
//    exhaustion we re-ran, and the unchecked part is elementary. Candidate
//    rather than Resolved because of that unchecked part and the volume
//    signal (five Zenodo papers in seventeen days in unrelated fields).
//    The source names no model; the model names are the submitter's.
//    publication preprint -> announcement (Zenodo PDF); model "Fable 5.1"
//    matched no family filter.
//
// 2. PINWHEEL KERNEL CONJECTURE - published, Resolved, Site-confirmed, 12.
//    Gasieniec-Smith-Wild Conjecture 2.3 (arXiv 2111.01784) quoted and
//    matched exactly; Proposition 2.4 of the same paper makes it equivalent
//    to their 2k Conjecture, so that falls too. Smith's 2025 thesis still
//    lists both open; Kawamura's 5/6 proof never mentions the Kernel
//    Conjecture. RE-RUN HERE: an independent checker written from scratch
//    (reachable age-states, dead-state pruning) gives (3,4,5,20,22,b)
//    infeasible for b=30..35 and feasible for b>=36, with state counts
//    equal to the repository's (50,881 at 32, 56,284 at 35); the
//    repository's check_counterexample.py also PASS. An exact-certificate
//    disproof is Resolved by the checklist. Lean: core only, 260 modules,
//    grep-clean, not rebuilt here (22 GiB), no CI.
//
// 3. TWO-SIZE GASOLINE - published, Candidate, Lean-checked, 6. Lorieau's
//    2024 master's thesis, Conjecture 3.1.1 p. 21: "Algorithm 1 is a
//    2-approximation for the {1,K}-Gasoline Problem". The submission covers
//    the whole of 3.1.1, not a special case of it; the statement's closing
//    sentence said otherwise and was corrected. Nikoleit-Anand-Naredla-
//    Roglin (arXiv 2601.16849) record it as open. Lean grep-clean (mathlib,
//    no CI). Kept at Candidate: Run is defined over the authors' closed-form
//    score rather than Lorieau's LP, and the link to Algorithm 1 is spread
//    over separate lemmas, so the statement is the thing nobody independent
//    has audited. humanCollaborators held the account's own handle.
//
// 4. ERDOS #36 LOWER BOUND 0.38055470 - published, Partial, Site-confirmed,
//    15. Liam Price's certificate (repo HEAD 6bc610e). RE-RUN HERE with the
//    repository's run_arb_verification_chunks.sh, Python 3.14.0,
//    python-flint 0.9.0: all three chunks SUCCESS, proved_all_bins true,
//    certified lower bound 0.380554702762594..., matching the shipped report
//    to about 30 digits. Arb at 160 bits; floats only choose split points.
//    The step-function transfer in the proof note is human-read only.
//    DISCLOSURE: none in the repository. It is the author's own public
//    record on the canonical tracker: the forum post of 29 June ("GPT Pro
//    improves the lower bound to 0.38055470") and the proof-claim record
//    ("using GPT Pro"). Accepted as the source of the disclosure, linked on
//    the entry. Priority: the Station paper (arXiv 2608.23691, August,
//    0.380552) is later and lower; a higher claim, 0.3805634 by Drynshock
//    (19 Sep), sits unchecked on the same page and is named in the result
//    note. Significance 15, not the Erdos default of 10: a constant with a
//    seventy-year bound history and an active race. No catalog entry for
//    #36 existed. The submitter is not the author (Liam Price is the
//    collaborator) and asked for a Frontier; that is a separate curator job.
//
// 5. LIN-XIAO-CHEN QUESTION 3.1 - published, Candidate, Unreviewed, 4.
//    AIMS Math 11(7) 2026, p. 20282: "Prove E_N <= N/2, and compute the
//    variance". Both answered. RE-RUN HERE: the three companion replays
//    PASS, and a separate brute force for N=1..14 agrees (mean below N/2
//    throughout, variance 0.869 -> 0.8904 rising toward the claimed
//    0.8923). The all-N proof is not checked. aiXiv is an AI-research
//    archive with no moderation or DOIs, so preprint -> announcement.
//    resolutionMethod computation -> argument; model string tidied.
//
// 6. SHALLIT-SHUR-ZORCIC 8/3 STABILITY - published, Candidate, Unreviewed,
//    6. The conjecture is one unnumbered sentence in Section 4 of arXiv
//    2310.15064v3, quoted and matched. RE-RUN HERE: their scripts PASS, and
//    a separate brute force found no 5-uniform map surviving strict 8/3 on
//    inputs to length 6, exactly the paper's four endpoint maps at
//    (8/3)^+ to length 8, and no violation of ce(h(w)) <= max(8/3, ce(w))
//    over 1,158 cubefree inputs to length 13. The "independent review" is
//    the same AI agent.
//
// 7. JOSHI-RUST CONJECTURE 3.8 - published, Candidate, Lean-checked, 6.
//    Quoted and matched; the stated ranges are the submitter's and the
//    natural ones (the first formula fails at n=1). Lean: seven modules,
//    definitions honest (sSup/sInf with attained maxima and earlier-start
//    exclusion), grep-clean, axioms the standard three per their log. No
//    CI on the repository; the build receipt is self-reported and the site
//    did not rebuild, as with the Vietoris entry on 30 September.
//
// DECLINED (no-open-question): the DNA decycling path length (Marcais-
// DeBlasio-Kingsford report simulated-annealing estimates and ask no
// question about min(8); the submission is a better construction, re-checked
// here: 8,230 words, RC-closed, acyclic remainder, longest path 107), and the
// two Research-Commons questions whose own posedBy says the project posed
// them, as on 30 September.
//
// SUN CONJECTURES 3.5, 3.6, 3.7 - all three published, Candidate,
//    Unreviewed, 5. Oleksiy Babanskyy (aconsciousfractal). Conjectures read
//    on AIMS Math 7(2) p. 2742 and matched exactly, including both sums,
//    the sign factors and the excluded primes. A separate script written
//    here from the binomial definitions found no failure for any of the
//    three at any prime below 260. PRIOR ART was the risk (this family is
//    farmed): all 8 OpenAlex and 13 Semantic Scholar citing works, all 65
//    of Z.-H. Sun's arXiv papers, Sun-Ye 2408.09776v4 in full, Mao
//    2111.08778 and the abstracts of the Springer papers the submitter
//    named were checked; none treats C(2n,n)a_n or C(2n,n)Q_n at these
//    denominators and none of Sun's later papers marks them proved. The
//    paywalled journal bodies were not read. Proofs follow the Beukers
//    modular-forms route Sun-Ye used for neighbouring cases; not refereed.
//    3.5's PDF carries no AI statement; the repository's AI_USE.md, linked
//    from its README, does, which meets the checklist. "pro 6" appears in
//    no source and is dropped. aiXiv has no moderation, endorsement or
//    DOIs, so publication is announcement on all three (and on #5).
//    Three entries, one per numbered conjecture, as precedent.
//
// CONTACT: one anonymous message with a reply address, on model names and a
// significance-weighted chart. Marked handled; the reply is printed for the
// curator to send by hand, since the site has no outbound mail.
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const EXPECTED = 13;

interface Decision {
  slug: string;
  action: "approve" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const SELF_POSED = [
  "Declined, and the reason is where the question came from, not the work.",
  "",
  "The catalog records answers to questions someone else asked first: a conjecture, a numbered problem, a question in a paper's open-problems section. Your posedBy says this one was formulated inside Research Commons, and you asked us to check that first, which is appreciated. It is the same line as the four declined on 30 September.",
  "",
  "The two you sent today with a question in print, Shallit-Shur-Zorcic's 8/3 stability conjecture and Joshi-Rust Conjecture 3.8, are both published. If an author whose work you build on states this question in public, submit it again with that citation.",
].join("\n");

/// The three Sun conjectures share an account, a paper, a method and every
/// finding, so they are written once and differ only where the facts do.
interface SunCase {
  slug: string;
  no: string;
  scope: string;
  disclosure: string;
}

const SUN: SunCase[] = [
  {
    slug: "sun-s-conjecture-3-5-on-an-apery-like-supercongruence",
    no: "3.5",
    scope: "every prime p > 3, both residue classes mod 3",
    disclosure:
      "One request for this one: the PDF itself has no AI statement. The repository's AI_USE.md, linked from the README, does, and that is what the entry rests on; a sentence in the manuscript would make the paper stand on its own.",
  },
  {
    slug: "zhi-hong-sun-s-conjecture-3-6-on-two-apery-like-binomial-sums",
    no: "3.6",
    scope: "both sums, every odd prime",
    disclosure: "The AI statement on p. 18 of the manuscript is clear and is what the entry's AI role rests on.",
  },
  {
    slug: "zhi-hong-sun-s-conjecture-3-7-two-apery-like-sums-at-discriminant-20",
    no: "3.7",
    scope: "both signed sums, every prime other than 2 and 5, all representation classes",
    disclosure: "The AI statement on p. 17 of the manuscript is clear and is what the entry's AI role rests on.",
  },
];

function sunDecision(c: SunCase): Decision {
  return {
    slug: c.slug,
    action: "approve",
    reason: "edited",
    edits: {
      model: "OpenAI Codex; GPT-6.1 Sol",
      modelMaker: "OpenAI",
      publication: "announcement",
      sourceName: "GitHub; also on aiXiv",
      verificationNote:
        `Checked by this site on 4 October 2026. The statement was compared with Conjecture ${c.no} as printed on p. 2742 of Sun's AIMS Mathematics paper and matches it in full (${c.scope}, modulus p squared). A separate script written here from the binomial definitions found no counterexample at any prime below 260. The author's companion recomputes both sides for the primes to 1999 and certifies the finite steps of the argument; these are finite checks, and the all-primes theorem rests on the written modular-forms proof, which was not refereed here. The author-side reviews are by AI models. Prior work: citing literature (OpenAlex, Semantic Scholar), Z.-H. Sun's arXiv papers and Sun-Ye's 2024 preprint were searched and no earlier proof was found; the paywalled final texts of Mao (2026), Sun-Ye (2025) and Sun (2026) were not read.`,
      significance: 5,
      significanceNote:
        "One of many conjectures in a 2022 AIMS Mathematics paper that poses them in quantity, in the heavily worked area of Apery-like supercongruences. Open about five years. Level with its two siblings published the same day and with Sun's Conjecture 4.6(ii) on trigonometric permanents at 5; below Zhi-Wei Sun's Legendre-determinant conjecture at 10.",
    },
    reviewNote:
      "Volume rule: account sent five in three days (Sun x3, DNA decycling, 2-adic). Statement fidelity checked directly on p.2742; own check primes < 260 clean; prior-art search to citing works + Sun's arXiv, paywalled Springer bodies not read. Not landmark, no hold. If Z.-H. Sun or D. Ye confirm, move to Resolved.",
    message: [
      "Published as Candidate, Unreviewed, significance 5.",
      "",
      `Conjecture ${c.no} was read on p. 2742 of the AIMS paper and your statement matches it in full. A script written here from the definitions finds no counterexample below 260. On priority, which you rightly flagged: citing works, Zhi-Hong Sun's arXiv papers and the Sun-Ye preprint were searched and none proves this; the paywalled final texts you named were not read here either, and the verification note says so.`,
      "",
      "Edits: publication is \"announcement\", since aiXiv has no moderation or endorsement and the site keeps preprint for arXiv-like servers. The model field drops \"pro 6\", which appears in none of your sources. Source name shortened.",
      "",
      c.disclosure,
      "",
      "As you asked, nothing was raised on the strength of the author-side AI reviews. A reply from Zhi-Hong Sun or his coauthor Ye, or a number theorist's reading, is what would move it to Resolved.",
    ].join("\n"),
  };
}

const DECISIONS: Decision[] = [
  {
    slug: "maximum-number-of-pairwise-equidistant-lines-in-mathbb-r-3",
    action: "approve",
    reason: "edited",
    edits: {
      model: "GPT-6 Astra Pro; Claude Fable 5.1",
      posedBy: "J. E. Littlewood, Some Problems in Real and Complex Analysis (1968), Problem 7, p. 20; the maximum was framed by Bezdek (2005)",
      yearPosed: 1968,
      ageNote:
        "Littlewood asked in 1968 whether seven unit cylinders can touch pairwise; Bozoki, Lee and Ronyai built seven in 2015. The maximum was open from at least Bezdek's 2005 upper bound of 24, later 18, 10 and 9 (Hofer, June 2026).",
      resolution: "candidate",
      publication: "announcement",
      sourceName: "Zenodo",
      verificationNote:
        "Re-run by this site on 4 October 2026: the companion repository at commit 9c37327, with Finschi's catalogue of rank-three oriented matroids fetched the same day (row hash matched the pinned SHA-256). verify.py passed: 135 classes, 135 exhaustion trees, 153,080 leaves, 1,027 exact metric certificates, about 50 seconds. The independent metric verifier covered all 1,027 pairs, and the input tests passed. Not checked here, and not machine-checked anywhere: the analytic lemmas of the manuscript (the five-line hyperbola-secant obstruction and the four-line circuit condition) and the completeness of the Finschi-Fukuda catalogue, which is published. No Lean formalisation. The manuscript names no model; the model names come from the submission.",
      significance: 25,
      significanceNote:
        "Littlewood's 1968 problem, in Brass-Moser-Pach, with four papers racing the upper bound down from 24 to 9 in 2005-2026 before this closes it. Above Kuperberg's six-cylinder conjecture at 20, a younger and narrower cylinder question, and below conjectures famous across a whole community at about 30. Scored as the maximum question, not the 1968 existence question, which was settled in 2015.",
    },
    links: [
      { label: "Hofer (2026): the previous upper bound of nine", url: "https://arxiv.org/abs/2606.22605", kind: "paper" },
    ],
    reviewNote:
      "Considered for a hold (Littlewood problem; author posted five Zenodo papers in 17 days in unrelated fields). Not held: gap was {7,8,9}, finite exhaustion re-run here and passed, unchecked part is three pages of elementary lemmas. Candidate until a discrete geometer reads the lemmas. Author: Georgia Tech address mliu416@gatech.edu, role unknown.",
    message: [
      "Published as Candidate, Unreviewed, significance 25.",
      "",
      "What was checked here, on 4 October: your verification repository at 9c37327 was run, with Finschi's catalogue fetched fresh and its hash matching the one you pinned. verify.py passed on all 135 classes and 1,027 metric certificates, and the independent metric verifier agreed. The verification note on the entry says exactly that, and that the analytic lemmas were read by nobody here.",
      "",
      "Candidate rather than Resolved for that reason: the finite half is confirmed, the elementary half is unreviewed, and a result that closes Littlewood's problem deserves one discrete geometer reading those three pages. When that happens in public, message us and it moves.",
      "",
      "Edits, the mathematics untouched:",
      "- Publication is \"announcement\": on this site a PDF on Zenodo is an announcement and preprint means arXiv or a similar server. sourceName is now \"Zenodo\".",
      "- Year posed 1968, with an age note on the history: Littlewood's question was existence, settled by Bozoki-Lee-Ronyai in 2015, and the maximum was open from Bezdek's bound of 24 in 2005 down to Hofer's nine this June. Hofer is linked.",
      "- Model \"Fable 5.1\" is now \"Claude Fable 5.1\", so the family filter finds it. The PDF itself says only \"OpenAI and Anthropic models\"; naming the versions there too would help readers.",
      "- Significance 25, with its reasoning on the entry.",
      "",
      "If you post it to arXiv, tell us and the source moves there.",
    ].join("\n"),
  },
  {
    slug: "the-pinwheel-kernel-conjecture-a-six-task-counterexample",
    action: "approve",
    reason: "edited",
    edits: {
      resolution: "resolved",
      verification: "site-confirmed",
      sourceName: "GitHub",
      verificationNote:
        "Re-checked by this site on 4 October 2026 with an independent checker written from scratch (reachable age-state search with dead-state pruning, not the repository's code): (3,4,5,20,22,b) is infeasible for b = 30 to 35 and feasible for b >= 36, with state counts equal to the repository's (50,881 at b = 32, 56,284 at b = 35). The repository's check_counterexample.py also passed. The Lean development (260 modules, core Lean only, Lean 4.34.1) was searched and has no sorry, admit, axiom declarations, native_decide, opaque or unsafe; its log records only propext and Quot.sound. The site did not rebuild it, and the repository has no CI; the Azure and Nanoda logs are the author's. Statement fidelity to Conjecture 2.3 was checked by hand: ScheduleOK quantifies over all infinite schedules, and the formal claim drops sortedness, which makes it slightly stronger.",
      significance: 12,
      significanceNote:
        "A named conjecture from an ALENEX 2022 paper, carried as open into Smith's 2025 thesis, and by the paper's Proposition 2.4 equivalent to its 2k Conjecture, so that falls with it. Known within pinwheel scheduling, not beyond. Level with the Vietoris-powers question at 12; below the 5/6-density conjecture itself, which this does not touch.",
    },
    reviewNote:
      "Independent checker written here (12 s) + repo checker both pass. Density of (3,4,5,20,22,32) ~0.91 > 5/6, no conflict with Kawamura. No CI, Lean not rebuilt (22 GiB).",
    message: [
      "Published as Resolved, Site-confirmed, significance 12.",
      "",
      "Site-confirmed because the certificate was re-checked here independently, on 4 October: a checker written from scratch, not yours, finds (3,4,5,20,22,b) infeasible for b from 30 to 35 and feasible from 36, and its state counts match yours exactly at 32 and 35. Your check_counterexample.py also passed. An exact-certificate disproof is Resolved under the methodology, so Candidate became Resolved.",
      "",
      "The Lean was read rather than rebuilt (the 22 GiB build is beyond this machine and the repository has no CI): no escape hatches, and the formal statement drops sortedness, which only makes it stronger. The verification note says all of this.",
      "",
      "One addition in the significance note: by Proposition 2.4 of the same paper the Kernel Conjecture is equivalent to the 2k Conjecture, so this refutes that too. Worth a sentence in your README.",
      "",
      "sourceName is shortened to \"GitHub\". If Gasieniec, Smith or Wild respond in public, tell us.",
    ].join("\n"),
  },
  {
    slug: "two-size-gasoline-the-tight-approximation-guarantee-for-iterative-rounding",
    action: "approve",
    reason: "edited",
    edits: {
      humanCollaborators: [],
      sourceName: "GitHub",
      statement:
        "For a Gasoline instance with deliveries $x_i\\in\\{1,K\\}$, fixed positive integer demands $y_i$, equal list lengths and equal total supply and demand, does the position-first Iterative Rounding algorithm always return a schedule using at most twice the minimum storage capacity? At each position it tries each remaining delivery, solves the fractional assignment LP with the chosen prefix fixed, and takes a minimum-score candidate. Capacity includes every delivery peak and consumption trough, with a freely chosen initial stock. This is Conjecture 3.1.1 of Lorieau (2024), the $\\{1,K\\}$ case of Rajkovic's conjecture for the one-dimensional problem.",
      significance: 6,
      significanceNote:
        "A conjecture from a 2024 master's thesis, recorded as open by Nikoleit, Anand, Naredla and Roglin in January 2026, and the two-size case of Rajkovic's 2022 conjecture, which stays open. Narrow audience. Level with the Shallit-Shur-Zorcic and Joshi-Rust entries published the same day, below the Pinwheel Kernel Conjecture at 12.",
    },
    reviewNote:
      "Thesis p.21 (PDF p.27) checked: 3.1.1 IS the {1,K} case in full; submitter's statement undersold it. Kept Candidate: Run is defined over a closed-form score, link to Lorieau's LP Algorithm 1 is via separate lemmas, no single theorem Run = Algorithm 1. No CI; mathlib build not done.",
    message: [
      "Published as Candidate, Lean-checked, significance 6.",
      "",
      "One correction in your favour. Lorieau's Conjecture 3.1.1 (thesis p. 21) is \"Algorithm 1 is a 2-approximation for the {1,K}-Gasoline Problem\", with positive integer inputs throughout. Your result is that conjecture in full, not a special case of it, so the statement's last sentence now says so and names Rajkovic's one-dimensional conjecture as the broader open question.",
      "",
      "Candidate rather than Resolved, and the reason is specific: Run is defined over your closed-form score, and its agreement with Lorieau's LP-based Algorithm 1 is spread across separate lemmas rather than stated as one theorem. That correspondence is the part a reader has to take on trust, and it is the part nobody independent has audited. A single theorem saying the formal Run is Algorithm 1, or a scheduling specialist reading it, would move this.",
      "",
      "Two field edits: humanCollaborators held the account's own handle and is now empty (it is for named humans), and sourceName is \"GitHub\". The Lean was read, not rebuilt; the repository has no CI.",
    ].join("\n"),
  },
  {
    slug: "lower-bound-0-38055470-for-erdos-s-minimum-overlap-constant",
    action: "approve",
    reason: "edited",
    edits: {
      model: "GPT Pro (version not stated)",
      posedBy: "Paul Erdős (1955); Erdős Problem #36",
      sourceName: "GitHub",
      verification: "site-confirmed",
      aiRole:
        "The author, Liam Price, states on the erdosproblems.com thread for problem 36 that GPT Pro produced the improvement (\"GPT Pro improves the lower bound to 0.38055470\", 29 June 2026), and the tracker's proof-claim record lists the claim as made \"using GPT Pro\". The repository itself carries no disclosure. The division of labour is not described beyond that sentence.",
      verificationNote:
        "Re-run by this site on 4 October 2026: the repository's run_arb_verification_chunks.sh at commit 6bc610e, Python 3.14.0 and python-flint 0.9.0. All three chunks reported success, proved_all_bins true over 172 mean bins, worst margin about 1.9e-8, certified lower bound 0.3805547027625940..., matching the shipped report to about thirty digits. The check is rigorous: Arb ball arithmetic at 160 bits on decimal-string inputs, with floating point used only to choose interval splits. Not machine-checked: the proof note's step-function transfer from the continuous to the finite problem, which was not audited here. erdosproblems.com still lists White's 0.379005 as the lower bound.",
      resultNote:
        "A rigorous lower bound $c > 0.38055470$, improving White's $0.379005$ (2022). The problem stays open: the best public upper bound is $0.3808585749$ (Einstein Arena, August 2026; $0.380868$ in the literature, SimpleTES), so $c$ is now known to within about $3 \\times 10^{-4}$. The bound rests on a finite certificate checked in ball arithmetic plus a step-function transfer from the continuous to the finite problem. The later Station paper (arXiv 2608.23691) reaches $0.380552$, below this; a higher claim of $0.3805634$ posted to the tracker on 19 September is unchecked.",
      significance: 15,
      significanceNote:
        "Erdős problems score 10 by rule; this one is raised because the constant has a seventy-year bound history (Scherk, Swierczkowski, Moser, Haugland, White), is in Guy's Unsolved Problems (C17) and Tao's optimisation-constants list, and is under active attack from both sides. Still only a bound. Level with other well-known Erdős constants and below named conjectures at 20 and up.",
    },
    links: [
      { label: "erdosproblems.com problem 36", url: "https://www.erdosproblems.com/36", kind: "problem-record" },
      { label: "Station paper, a later and lower AI-assisted bound (0.380552)", url: "https://arxiv.org/abs/2608.23691", kind: "paper" },
    ],
    reviewNote:
      "Disclosure only on the tracker (author's forum post 29 Jun + proof-claim record), none in the repo; accepted and linked. Submitter is not the author. Drynshock 0.3805634 claim (19 Sep, Overleaf/Drive) NOT checked - if it holds up it is a separate entry or supersedes on the frontier. Frontier request pending (both directions, rows in submitterNote).",
    message: [
      "Published as Partial, Site-confirmed, significance 15. Thank you for writing it up so carefully, including what you had and had not re-run.",
      "",
      "The certificate has now been re-run here, on 4 October, with the repository's own script: all three chunks succeed and the certified bound matches the shipped report to about thirty digits. That is what Site-confirmed means, and the verification note says what ran and what did not (the step-function transfer in the proof note).",
      "",
      "On the AI disclosure: the repository has none. What the entry rests on is Liam Price's own post on the erdosproblems.com thread and the tracker's proof-claim record, both saying GPT Pro. The AI-role text now quotes those rather than inferring a tier. If you are in touch with him, one line in the README would make the repository stand on its own.",
      "",
      "Two additions to the result note: the Station paper's 0.380552 (August) is later and lower, and a higher claim of 0.3805634 was posted to the tracker on 19 September and has not been checked by anyone here.",
      "",
      "Significance 15 rather than the Erdős default of 10, for the bound history; the note says why.",
      "",
      "The Frontier request is noted, with your rows for both directions. That is built separately and will take a little longer.",
    ].join("\n"),
  },
  {
    slug: "mean-and-variance-of-finite-2-adic-complexity-question-3-1",
    action: "approve",
    reason: "edited",
    edits: {
      model: "OpenAI GPT models; GPT-6.1 Sol",
      resolutionMethod: "argument",
      publication: "announcement",
      sourceName: "aiXiv 2610.00156 v2 (manuscript v0.2.0 on GitHub)",
      verificationNote:
        "Re-run by this site on 4 October 2026: the companion's mean-premise, distribution and constant replays all passed (PASS_FINITE_PREMISES, PASS_FINITE_DISTRIBUTION_AND_MOMENT_PREMISES, PASS_EXACT_RATIONAL_EVALUATION). A separate brute force written here for N = 1 to 14 agrees: the mean stays below N/2 at every N, the gap approaches about 0.414, and the variance rises from 0.869 at N = 8 to 0.8904 at N = 14, consistent with the claimed limit 0.8923. These are finite checks. The all-N mean bound and the limiting variance rest on the written lattice and equidistribution arguments, which were not checked here, and the author-side reviews are by AI models. No independent specialist review.",
      significance: 4,
      significanceNote:
        "A question asked in a July 2026 survey-style paper, months old when answered, with a narrow audience in sequence complexity. Prior work (Tian-Qi 2010, Chen-Winterhof 2025) bounded the same mean to within O(log N). Below the Joshi-Rust and Shallit-Shur-Zorcic conjectures at 6, which are older and asked more widely.",
    },
    reviewNote:
      "Question 3.1 quoted and matched (both parts). Replays pass; own brute force N<=14 agrees. Volume rule: account sent five this week (Sun x3, DNA, this). Kept Candidate/Unreviewed.",
    message: [
      "Published as Candidate, Unreviewed, significance 4.",
      "",
      "Question 3.1 was read on p. 20282 and your statement matches both halves. Your three replays were run here on 4 October and passed, and a separate brute force for N up to 14 agrees with the mean bound and with the variance climbing toward your limit. The verification note says that these are finite checks and that the all-N arguments were not checked here.",
      "",
      "Edits: resolution method is \"argument\" (the theorem is proved, the computation supports it); publication is \"announcement\", because aiXiv has no moderation or endorsement and the site keeps preprint for arXiv-like servers; the model field drops \"pro 6\", which appears in none of your sources; the source name now leads with aiXiv. Significance 4, with its reasoning on the entry.",
      "",
      "You asked us not to raise the level on author-side AI reviews, and it was not. A reply from Lin, Xiao or Chen, or a specialist's reading, would move it.",
    ].join("\n"),
  },
  {
    slug: "the-8-3-plus-stability-conjecture-for-power-free-binary-morphism-lengths",
    action: "approve",
    reason: "edited",
    edits: {
      sourceName: "Research Commons (GitHub)",
      verificationNote:
        "Re-checked by this site on 4 October 2026. The submission's scripts passed (22 seed inputs, 128 length-five maps, four marker cases). A separate brute force written here found no 5-uniform binary morphism surviving the strict 8/3 test on inputs up to length 6, exactly four maps surviving at (8/3)+ on inputs up to length 8 (the paper's endpoint family), and no violation of ce(h(w)) <= max(8/3, ce(w)) for the length-five endpoint map and the length-12 seed over all 1,158 cubefree inputs up to length 13. These are finite checks; the all-length, all-input statement rests on the written proof, which was read here but not line by line. The review in the package is by the same AI agent and is not independent. No Lean formalisation.",
      significance: 6,
      significanceNote:
        "One unnumbered conjecture in the discussion section of a 2024 JCTA paper by Shallit, Shur and Zorcic, a year old. Known within combinatorics on words. Level with Joshi-Rust Conjecture 3.8 published the same day and just above the Thue-Morse matching-heights entry at 5.",
    },
    message: [
      "Published as Candidate, Unreviewed, significance 6.",
      "",
      "The conjecture was read in Section 4 of arXiv v3 and your statement matches it, both the stability on [(8/3)+, 3) and the change at 8/3. It is one unnumbered sentence rather than a numbered conjecture, which is fine for scope and is reflected in the significance.",
      "",
      "Re-checked here: your scripts pass, and a separate brute force agrees on the length-five endpoint obstruction, the four endpoint maps at (8/3)+, and the key inequality over every cubefree input to length 13. The verification note says these are finite checks and that the package's review is by the same agent, so it is not counted as independent.",
      "",
      "sourceName is now \"Research Commons (GitHub)\". A model question: \"dot (OpenAI)\" in your files and \"OpenAI Codex\" in the form. If dot runs a specific model, naming it would help the per-model statistics.",
    ].join("\n"),
  },
  {
    slug: "thue-morse-all-three-joshi-rust-first-occurrence-formulas",
    action: "approve",
    reason: "edited",
    edits: {
      sourceName: "Research Commons (GitHub)",
      verificationNote:
        "Read by this site on 4 October 2026, not rebuilt. Seven modules, mathlib, Lean 4.33.1. No sorry, admit, axiom declarations, native_decide, opaque or unsafe in the source modules. Definitions checked by hand: t is the recursive digit-sum parity, A(d) and i(d) are global sSup and sInf with attained maxima and exclusion of every earlier start proved, and the three headline theorems state Conjecture 3.8 as printed, with the submitter's ranges (the first formula fails at n = 1). The package's axiom log lists only propext, Classical.choice and Quot.sound. The repository has no CI; the build receipt is the author's own log. The three formulas were also checked numerically here for d = 1, 3, 5, 7, 9, 15, 17, 31, 63. The informal-to-formal review in the package is by the same AI agent.",
      significance: 6,
      significanceNote:
        "A numbered conjecture in a 2025 TCS paper whose authors note that Walnut cannot decide it and a proof remained elusive. Narrow but real. Just above the Thue-Morse matching-heights entry at 5 and level with the Shallit-Shur-Zorcic stability conjecture published the same day.",
    },
    message: [
      "Published as Candidate, Lean-checked, significance 6.",
      "",
      "The Lean was read on 4 October: definitions honest, global sSup/sInf with the degenerate cases handled, and the headline theorems say what Conjecture 3.8 says, with the ranges you made explicit. Nothing in the source modules escapes the kernel.",
      "",
      "It stays Lean-checked and Candidate rather than Lean-verified and Resolved for one reason: the repository has no CI, so the build receipt is your own log, and the site did not rebuild it. A GitHub Actions workflow that builds the package and prints the axioms of the three theorems would let a reader confirm it in one click, and is the quickest route up the ladder.",
      "",
      "sourceName is shortened to \"Research Commons (GitHub)\". The distinction from the existing matching-heights entry is clear and the entries are kept separate.",
    ].join("\n"),
  },
  {
    slug: "minimum-remaining-path-length-for-dna-order-eight-minimum-decycling-sets",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "Section 5.2 / Table 2 of Marcais-DeBlasio-Kingsford: SA estimates, no question about min(8). Witness re-checked: 8230 words = N(4,8), RC-closed, D(4,8)-M acyclic, longest path 107. Construction, not optimum. Their Conjectures 1-4 untouched.",
    message: [
      "Declined, as a scope decision. The witness itself checks out: it was re-checked here with a script of our own, and it has 8,230 words, is closed under reverse complement, leaves an acyclic graph, and has longest remaining path 107 against the table's 145.",
      "",
      "The reason is that nothing was asked. Section 5.2 of Marcais, DeBlasio and Kingsford reports simulated-annealing ranges and Table 2 marks the alphabet-four values as estimates; neither poses min(8) as an open question, and your note says 107 is not shown to be the global minimum. A better construction for a quantity that was estimated, with no question attached, is what the methodology calls a record-improving construction, which the catalog leaves out. The Frontiers pages track bounds on stated open constants, which this is not either.",
      "",
      "What would change it: proving 107 optimal would still answer no posed question, but resolving one of the paper's Conjectures 1 to 4, for example Conjecture 3 on the asymptotic gap, would be squarely in scope.",
    ].join("\n"),
  },
  {
    slug: "sharp-three-tip-calendar-law-identification-of-displayed-clusters-and-splits",
    action: "decline",
    reason: "no-open-question",
    reviewNote: "posedBy: Research-Commons project question; submitter asked for scope check first. Same as 30 Sep four.",
    message: SELF_POSED,
  },
  {
    slug: "sharp-original-hybrid-intervention-resources-for-exact-quartet-law-target-recove",
    action: "decline",
    reason: "no-open-question",
    reviewNote: "posedBy: Research-Commons project question; submitter asked for scope check first. Same as 30 Sep four.",
    message: SELF_POSED,
  },
  ...SUN.map(sunDecision),
];

// ---------------------------------------------------------------------------
// Contact message: anonymous, with a reply address. Marked handled; the reply
// is printed for the curator to send by hand.

const CONTACT = {
  id: "bf36b33a",
  replyTo: "hugo.debosschere-work@proton.me",
  subject: "Re: your message to VibeMathed",
  body: [
    "Hello,",
    "",
    "Thank you for the kind words and for two useful points.",
    "",
    "Model names: you are right. The model field is free text in the submitter's own words, so one model arrives as GPT-5.6, GPT-5.6 Pro, ChatGPT 5.6 Sol and several dozen other spellings. The vendor filter on the list already groups by family (all OpenAI, all Anthropic, and so on), but the per-model view does not merge versions yet. A normalised model name next to the free-text one is the fix, and it is on the list.",
    "",
    "Significance weighting: a good idea, and cheap to build since every entry already carries a score. One correction to the premise, though: almost nothing scores 0 (three entries are unscored). The lowest score in use is 5 (machine-generated conjectures), the most common is 10 (the typical Erdős problem), and about 270 of the 755 entries score 20 or more. Weighting by score would still change the picture, because the long tail of 10s would count for less against the 74 results at 35 and above.",
    "",
    "Thanks again for writing.",
  ].join("\n"),
};

async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string, ...args: unknown[]) => Promise<T>;
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
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 60)}`);
    const n = charLength(canonical(d.message));
    console.log(`  message : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const c = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && c > lim;
        console.log(`  ${k.padEnd(17)}: ${c}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    if (d.reviewNote) console.log(`  reviewNote        : ${charLength(canonical(d.reviewNote))} (curator table, no cap)`);
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: d.links ?? [] });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  const pub = DECISIONS.filter((d) => d.action === "approve").length;
  console.log(`${pub} publish, ${DECISIONS.length - pub} decline, ${DECISIONS.length} total`);
  if (DECISIONS.length !== EXPECTED) { console.log(`COUNT MISMATCH: expected ${EXPECTED}`); bad++; }
  if (/—/.test(CONTACT.body)) { console.log("CONTACT: em dash in reply"); bad++; }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `\n${localBad} local violation(s)` : "\nlocal checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, status: true, name: true, sourceUrl: true, submittedById: true, links: { select: { label: true, url: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const src = (d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl;
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: src });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 52)} -> merged check: ${v.length ? "FAILED" : "ok"}${d.links?.length ? `  +${d.links.length} links` : ""}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    // Capture the contact row id before any write (its lookup matches open rows only).
    const msgRows = await prisma.$queryRawUnsafe<{ id: string; status: string }[]>(
      `SELECT id::text AS id, status FROM "SiteMessage" WHERE id::text LIKE $1 || '%'`,
      CONTACT.id,
    );
    if (msgRows.length !== 1) throw new Error(`contact ${CONTACT.id}: ${msgRows.length} rows`);
    const msg = msgRows[0];
    console.log(`\nCONTACT   ${msg.id} (${msg.status}) -> email by hand to ${CONTACT.replyTo}`);

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
          ...(d.links?.length ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } } : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`${d.action}: ${d.slug}`);
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
          data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: d.reviewNote },
        });
        console.log(`review note: ${d.slug}`);
      }
    }

    if (msg.status === "open") {
      await prisma.siteMessage.update({
        where: { id: msg.id },
        data: { status: "handled", handledAt: new Date() },
      });
      console.log(`contact handled: ${msg.id}`);
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and stats lag");
    console.log("by up to an hour, or until a deploy. Declined rows are not public.");
    console.log(`\nSEND BY HAND to ${CONTACT.replyTo}\nSubject: ${CONTACT.subject}\n\n${CONTACT.body}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
