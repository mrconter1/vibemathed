// 22 September 2026: the five pending submissions, Braun's held entry now
// that his CI is green, and the three open contact messages.
//
// PUBLISHED (five), one held row RE-PUBLISHED, nothing declined.
//
// 1. COPELAND-ERDOS NOT STRONGLY NORMAL - published, Resolved, Lean-checked,
//    25. Belshaw's 2005 thesis, section 4.7, asks in these words: "Does the
//    Copeland-Erdos concatenation of the primes fail to be strongly normal?"
//    (read here, SFU etd1934). Catt, Coons and Velich (Integers 2016,
//    arXiv:1511.07532, section 3) proved non-strong-normality for a class of
//    generalised Copeland-Erdos numbers and wrote of the prime concatenation
//    "of this we have no proof" (read here). The repository was read at HEAD
//    (pushed 14 Sep): 16 Lean files, 1,879 lines, no sorry, no axiom, no
//    native_decide; GitHub Actions run 34797497727 built it on a fresh runner
//    and printed both final theorems with axioms propext, Classical.choice,
//    Quot.sound. The statement was audited: copelandErdosReal is
//    Real.ofDigits of the increasing prime concatenation, SimplyStrongNormal
//    is the Belshaw-Borwein law-of-the-iterated-logarithm condition with the
//    sqrt(b-1)/b constant for every digit, StrongNormal quantifies over every
//    power of the base. The one external input, Ingham's 1937 short-interval
//    prime number theorem with exponent 5/6, is a theorem HYPOTHESIS
//    (Ingham1937Input), not an axiom, exactly as the Erdos-Borwein 2-density
//    entry took AGP: same level, Lean-checked, same reason. The three-page
//    argument was read: primes in [10^(6n), 10^(6n)+10^(5n)) start with n
//    zeros after their leading 1, Ingham supplies about 10^(5n)/(6n log 10)
//    of them, and the resulting zero excess of order 10^(5n) dwarfs the LIL
//    scale sqrt(N log log N) of order 10^(3n). Correct.
//
// 2. EULER BLOWUP, UNFORCED - published, Candidate, Lean-verified, 80. The
//    OpenAI result of 8 September: smooth, compactly supported, divergence-
//    free data on R^3 whose unforced Euler solution blows up. The catalog has
//    the forced Euler entry (Buckmaster et al., 70) and the Navier-Stokes
//    entry (87); this is the unforced Euler claim those two bracket, and the
//    one Tao's 7 September post said "it should even be possible to do
//    without the forcing term". Audited the way the NS entry was:
//    ComparatorChallenges/Euler.lean is DeepMind's formal-conjectures
//    Navier-Stokes statement at commit 8bf45ed with viscosity and force set
//    to zero - InitialVelocityConditionDecay, the equation, div_free,
//    smoothness, MemLp and bounded energy were compared line by line here and
//    match; the second theorem adds compact support, a finite maximal
//    lifespan, the C^1 limsup and the divergent vorticity integral of the
//    paper's Theorem 1.1. Euler/Solution.lean restates both verbatim and
//    ends with #print axioms; Euler.json permits only the three standard
//    axioms and enables nanoda. Counted here on the tarball: 1,839 Lean
//    files, 211,578 lines under Euler/, zero sorry, zero axiom, zero
//    native_decide, zero unsafe. Not rebuilt here. The submitter's process
//    account was corrected against the blog (Wayback copy, the live page
//    refuses automated readers): NEARLY 100 agents for about 50 hours found
//    Euler, before the effort concentrated 10,000 on Navier-Stokes; the
//    10,000 figure belongs to NS. Candidate because no mathematician has
//    read the 57-page argument, same as NS.
//
// 3. BIOLOGICALLY UNAVOIDABLE SEQUENCES - published, Resolved, Lean-checked,
//    14. Alexander, EJC 20(1) P31 (2013), section 6 (read here): "perhaps the
//    most important question remaining is, what are the biologically
//    unavoidable sequences? Are there any which are not eventually
//    periodic?" Answer: no. The construction was read in full and checked by
//    hand - it is half a page: vertices N, edges v-1 -> v labelled r(v) and
//    v-2 -> v labelled 1-r(v) with r(2j)=s(j), r(2j+1)=1-s(j); a matching
//    path has v_k >= 2k, the offset v_k - 2k is nonincreasing so stabilises,
//    and once every step is +2 the labels force s(k)=s(k+e+1) or
//    s(k)=1-s(k+e+1). The Lean IsRealPopulation was compared with
//    Alexander's Definition 1 clause by clause (A1-A4 and n-gendered, edge
//    labels unique, realisation from any start): faithful. 297 lines, no
//    sorry/axiom/native_decide, endpoint axioms standard in the author's
//    log; no CI and not rebuilt here, hence Lean-checked rather than
//    verified. Resolved rather than Candidate because the site checked the
//    argument itself and the positive direction is Alexander's Theorem 10.
//
// 4. MAGNITUDE CONTINUITY - published, Candidate, Unreviewed, 16. Katsumasa,
//    Roff and Yoshinaga, arXiv:2501.08745v2, Conjecture 1.3 (read here): for
//    a finite-dimensional positive definite normed space, magnitude is
//    Hausdorff-continuous on finite subsets. Liu's Zenodo manuscript (record
//    22866753, 20 Sep, 18 pages, read here) proves it with an explicit
//    Lipschitz-type bound and compact approximants; the title's "subspaces
//    of L_1" IS the conjecture's class, by Meckes's Corollary 3.5. Prior
//    work is partial: Kalisnik-Lesnik (skew subsets of l_1^N), So (cluster
//    types), Yoshinaga (fixed multiplicity strata). AI statement in the
//    manuscript names GPT-6 Astra Pro and Claude Fable 5.1 as co-developers
//    of the cut-deletion argument. Two-day-old, no arXiv, unreviewed. Field
//    group arrived HTML-escaped ("Geometry &amp; topology"), fixed.
//
// 5. PEBODY'S CONJECTURE 8.1 - published, Candidate, Unreviewed, 15. The
//    author asked whether the extraordinary-claims rule applies. It does
//    not: Pebody's Conjecture 8.1 (CPC 2007, checked at Crossref) is a real
//    named open problem but a small-community one, unlike the matroid
//    secretary or Res(+) claims. The 11-page manuscript was read: it follows
//    the Grunbaum-Moore route (phases on the Fourier support, Galois
//    covariance, local characters, gluing across primes) and handles the
//    dyadic sign by an integrality argument on projectors, which is exactly
//    where Grunbaum-Moore needed f^(1) != 0. Coherent and non-trivial; not
//    checked step by step here and no specialist has read it. The site ran
//    its own brute force (scratch deck.py): for every n <= 22, any two
//    subsets of C_n with the same cumulative 4-deck are translates, while
//    the 3-deck fails at n = 12, 14, 16, 18, 20, 22 exactly as Keleti-
//    Kolountzakis predict. Consistent with the claim, not a proof of it.
//    Paper author is Oleksiy Babanskyy; the submitter says "I am the
//    author", so humanCollaborators records him.
//
// 6. BRAUN'S RES(+) - RE-PUBLISHED from held, Candidate, Lean-verified, 35.
//    Held 15 Sep for one reason: nothing but his laptop had compiled it. He
//    added CI. Run 34953139115 (15 Sep, commit 3979e0c, fresh ubuntu-24.04
//    runner, mathlib cache for dependencies only, .lake/build deleted before
//    the build): `lake --wfail build claims.BitPHPSuperpolynomial` completed
//    2,484 jobs, printed MathResearch.bitPHP_superpolynomial with axioms
//    propext, Classical.choice, Quot.sound, then a fresh leanchecker replay.
//    A second dispatch run on 17 Sep also succeeded. The claim file at
//    3979e0c is byte-identical to the one audited at 54f0937 (diffed here).
//    Kernel-checked on a machine other than the author's AND statement
//    audited: that is the site's definition of Lean-verified.
//
// CONTACT MESSAGES (three): Braun (answered with the re-publication; arXiv
// endorsement answered honestly), Warren D. Smith (the site catalogs, it
// does not host; Zenodo suggested; the voting theorem is in scope once
// posted, the gravity papers are not), umpolungfish (verification: the
// script sets verified only if the account's GitHub login is user 70781765,
// which ORCID 0000-0003-0003-0552 (Lando Mills) links to; otherwise the dry
// run prints the account email next to the ORCID email for the curator).
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

interface Decision {
  slug: string;
  /// approve: pending -> published. republish: rejected(held) -> published.
  action: "approve" | "republish";
  expectStatus: "pending" | "rejected";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DECISIONS: Decision[] = [
  {
    slug: "the-copeland-erdos-constant-is-not-strongly-normal-in-base-10",
    action: "approve",
    expectStatus: "pending",
    reason: "edited",
    edits: {
      name: "The Copeland-Erdős constant is not strongly normal in base 10",
      shortName: "Copeland-Erdős not strongly normal",
      field: "Normal numbers; digit expansions",
      statement:
        "The Copeland-Erdős constant $0.235711131719\\ldots$ concatenates the primes in increasing order; Copeland and Erdős proved in 1946 that it is normal in base 10. Strong normality, introduced by Belshaw and Borwein, also prescribes the size of the digit-count fluctuations: $x$ is simply strongly normal in base $b$ if for every digit the discrepancy $Z_d(x;N) - N/b$ has $\\limsup$ and $\\liminf$ equal to $\\pm\\sqrt{b-1}/b$ on the scale $\\sqrt{2N\\log\\log N}$, and strongly normal if this holds in every base $b^k$. Champernowne's number is normal but not strongly normal. Does the Copeland-Erdős concatenation of the primes also fail to be strongly normal in base 10?",
      posedBy:
        "Adrian Belshaw, On the Normality of Numbers, SFU M.Sc. thesis (2005), section 4.7; restated by Catt, Coons and Velich, Integers 16 (2016), section 3",
      yearPosed: 2005,
      model: "ChatGPT-6 Astra",
      modelMaker: "OpenAI",
      verification: "lean-checked",
      verificationNote:
        "Checked here on 22 September 2026. The repository at HEAD (pushed 14 September) has 16 Lean files, 1,879 lines, no sorry, no axiom declaration, no native_decide. GitHub Actions run 34797497727 built it on a fresh runner with the pinned Lean 4.34.0-rc2 and mathlib de2ef68, and printed both final theorems, copelandErdos_not_simply_strong_normal_of_ingham and copelandErdos_not_strong_normal_of_ingham, with axioms propext, Classical.choice and Quot.sound. The statement was audited: copelandErdosReal is Real.ofDigits of the increasing prime concatenation and its canonical decimal digits are proved; SimplyStrongNormal is the Belshaw-Borwein law-of-the-iterated-logarithm condition with the constant sqrt(b-1)/b for every digit; StrongNormal quantifies over every positive power of the base. The one external input, Ingham's 1937 theorem specialised to intervals of length x^(5/6), enters as an explicit theorem hypothesis (Ingham1937Input), not as an axiom, with its specialisation to x = 10^(6n) and the endpoint bookkeeping proved in Lean. Lean-checked rather than Lean-verified for that reason, as the Erdős-Borwein 2-density entry was for AGP. The three-page argument was read and is correct.",
      resolution: "resolved",
      resolutionMethod: "argument",
      significance: 25,
      significanceNote:
        "A question posed in print twice about the best-known named concatenation constant after Champernowne's: in Belshaw's 2005 thesis, which introduced strong normality, and again in Catt, Coons and Velich's 2016 Integers paper, which settled a class of related numbers and wrote of this one \"of this we have no proof\". Level with the Stoneham-sum and Erdős-Borwein 2-density entries at 25, both named questions about named constants left open in a journal paper; above the Fermat and Stoneham-generalisation entries at 18, whose questions had less standing.",
      resultNote:
        "No: the Copeland-Erdős constant is not simply strongly normal in base 10, hence not strongly normal in base 10, and the failure is already visible in the digit 0. The proof compares the zero count at two positions in the expansion. Every prime in [10^(6n), 10^(6n) + 10^(5n)) begins with 1 followed by n zeros, and Ingham's 1937 short-interval theorem with exponent 5/6 supplies about 10^(5n)/(6n log 10) such primes, so the zero excess across that stretch is of order 10^(5n), while simple strong normality would cap the discrepancy at O(sqrt(N log log N)) with N of order 10^(6n), that is at order 10^(3n). Belshaw and Borwein's 2013 Champernowne argument is the model; Ingham replaces the trivial prime count. Strong normality in other bases is not addressed.",
      sourceName: "GitHub repository with Lean proof and three-page paper (CaptainSude, 14 September 2026)",
    },
    links: [
      { label: "Belshaw's thesis, section 4.7, where the question is asked", url: "https://summit.sfu.ca/_flysystem/fedora/sfu_migrate/10167/etd1934.pdf", kind: "problem-record" },
      { label: "Catt, Coons and Velich (2016), section 3: \"of this we have no proof\"", url: "https://arxiv.org/abs/1511.07532", kind: "problem-record" },
      { label: "GitHub Actions build printing the final theorems and axioms", url: "https://github.com/CaptainSude/Copeland-Erdos-Not-Simply-Strongly-Normal/actions/runs/34797497727", kind: "independent" },
      { label: "Ingham (1937), the one external theorem", url: "https://doi.org/10.1093/qmath/os-8.1.255", kind: "paper" },
    ],
    reviewNote:
      "Approved 22 Sep 2026 at Lean-checked, 25. Belshaw 2005 section 4.7 read at source (SFU etd1934): the question is verbatim the submission's statement. CCV 2016 section 3 read: \"of this we have no proof\". Repo read at HEAD: 16 files / 1,879 lines / 0 sorry / 0 axiom / 0 native_decide; CI run 34797497727 green on a fresh runner with axioms standard. Definitions audited (SimplyStrongNormal = BB LIL with sqrt(b-1)/b, StrongNormal over all b^k, constant = Real.ofDigits of the prime stream). Ingham enters as a hypothesis, so Lean-checked per the Erdős-Borwein precedent. Prior art searched: nothing between CCV 2016 and this. Argument read and correct.",
    message: [
      "Published as Resolved, Lean-checked, significance 25.",
      "",
      "What was checked rather than taken on trust. Belshaw's 2005 thesis was opened and section 4.7 asks your question in exactly your words; Catt, Coons and Velich's section 3 was read and says of the prime concatenation \"of this we have no proof\". Your repository was read at HEAD: sixteen Lean files, no sorry, no axiom declaration, no native_decide, and your GitHub Actions run built it on a fresh runner and printed both final theorems with the three standard axioms. The definitions were audited against Belshaw-Borwein: the LIL constant sqrt(b-1)/b for every digit, strong normality over every power of the base, and the constant itself as Real.ofDigits of the increasing prime stream with its canonical digits proved. The three-page argument was read and is right.",
      "",
      "Lean-checked rather than Lean-verified, and the reason is the one you state yourself: Ingham's theorem enters as a hypothesis. That is the level the site gave the Erdős-Borwein 2-density entry for the same construction with AGP, and it is the honest label. It is not a doubt about Ingham.",
      "",
      "Three edits. The statement now defines strong normality so a reader meets the LIL condition before the question; the posing credits Belshaw 2005 first and CCV 2016 second, with links to both; and the source name records the paper and the date. Significance 25 puts it level with your Stoneham-sum entry: a named question about a named constant, left open in print.",
    ].join("\n"),
  },
  {
    slug: "finite-time-blowup-for-the-3d-incompressible-euler-equations-unforced",
    action: "approve",
    expectStatus: "pending",
    reason: "edited",
    edits: {
      name: "Finite-time blowup for the 3D incompressible Euler equations from smooth data",
      shortName: "Euler blowup, unforced",
      statement:
        "Can a solution of the three-dimensional incompressible Euler equations on $\\mathbb R^3$, with no external force, started from smooth, compactly supported, divergence-free initial data, lose regularity in finite time? Local existence is classical, and by Beale-Kato-Majda blowup at time $T_*$ is equivalent to $\\int_0^{T_*}\\|\\omega(t)\\|_\\infty\\,dt=\\infty$. Hou and Luo's 2014 numerics suggested a boundary singularity, Elgindi proved blowup in 2021 for $C^{1,\\alpha}$ data with small $\\alpha$, Córdoba, Martínez-Zoroa and Zheng reached finite-energy $C^{1,\\alpha}$ data, and in September 2026 Buckmaster and Alpöge obtained blowup with a smooth force. Does it happen for smooth data with no force at all?",
      posedBy:
        "Leon Lichtenstein (1925) and Nikolai Gunther (1927), whose local existence left global regularity open; the smooth unforced case is the Euler singularity problem of the fluid-dynamics literature",
      yearPosed: 1925,
      solveDate: "2026-09-03",
      model: "Unnamed internal OpenAI model; GPT-6 Astra for the Lean formalisation",
      modelMaker: "OpenAI",
      aiRole:
        "From OpenAI's announcement of 8 September (read in the Wayback copy, the live page refuses automated readers): the effort began on 1 September with groups of agents powered by an internal model \"significantly more capable than GPT-6 Astra\", each group prompted with a variant of a Millennium problem or a related question. Asked the Euler regularity question as one of the \"easier\" problems, \"nearly 100 agents worked together for approximately 50 hours to produce our Euler regularity disproof\", specifically the unforced version. That solution was then handed to the Navier-Stokes agents, whose group grew to about 10,000 concurrent agents and reached the forced Navier-Stokes result about 88 hours after launch. Lean formalisation and verification of the results took a further 17 hours via GPT-6 Astra. OpenAI's 10 September update to the post reports an investigation concluding that Buckmaster's Codex prompts over the preceding two months \"could not have influenced the system in any way, including through training\", and notes that the Euler proofs differ: Alpöge and Buckmaster's has an external force, this one has none.",
      verification: "lean-verified",
      verificationNote:
        "Audited here on 22 September 2026 the way the Navier-Stokes entry was. Statement anchor: ComparatorChallenges/Euler.lean in openai/NavierStokesAndEuler is DeepMind's formal-conjectures Navier-Stokes statement at commit 8bf45ed with viscosity and force set to zero; InitialVelocityConditionDecay, the evolution equation with derivWithin on [0, inf), div_free, initial_condition, joint smoothness, MemLp and the uniformly bounded energy were compared line by line with DeepMind's file and match. The first theorem, euler_breakdown_R3, is that breakdown alternative; the second, exists_compact_smooth_euler_singularity, is OpenAI's own richer form of the paper's Theorem 1.1 with compact support, a finite maximal lifespan T* <= 1, a C^1 limsup of infinity and a divergent vorticity integral. Euler/Solution.lean restates both verbatim and ends with #print axioms; Euler.json permits only propext, Quot.sound and Classical.choice and enables the nanoda kernel. Counted here on the tarball: 1,839 Lean files and 211,578 lines under Euler/, zero sorry, zero axiom declarations, zero native_decide, zero unsafe. Lean 4.34.0-rc2 pinned. Not rebuilt here, and the repository has no CI of its own; the comparator replay is documented for anyone with the machine. No mathematician has read the 57-page argument.",
      publication: "preprint",
      resolutionMethod: "construction",
      resolution: "candidate",
      aiContribution: "ai-discovered",
      significance: 80,
      significanceNote:
        "The Euler singularity problem itself: whether smooth, force-free, finite-energy ideal flow can break down, the question Hou-Luo's numerics and Elgindi's C^{1,alpha} theorem circled and the one Terence Tao's 7 September post said should be reachable \"without the forcing term\". Above the forced Euler entry at 70, whose one gap this closes; below the Navier-Stokes entry at 87 because this is not a Millennium problem and viscosity is the harder half; held at Candidate until a human has read it.",
      resultNote:
        "Yes, if the argument stands. Theorem 1.1: there is u_0 in C^infinity_c with div u_0 = 0 whose smooth Euler solution has maximal lifespan 0 < T* < infinity, with limsup of the C^1 norm infinite and the time integral of the vorticity supremum divergent, so the blowup is genuine by Beale-Kato-Majda. The construction, per the paper's own section headings, places a localised oscillation over a smooth Euler flow, amplifies and transfers its wave geometry, chooses scales and iterates, and passes to a limiting datum; 57 pages. It supersedes the forced Euler result of Buckmaster and Alpöge in the catalog and is the step on which OpenAI's Navier-Stokes agents were then prompted. It says nothing about Navier-Stokes without forcing.",
      sourceName: "OpenAI, Finite time blowup for the Euler equation (8 September 2026), with the Lean release in openai/NavierStokesAndEuler",
    },
    links: [
      { label: "OpenAI's comparator challenge statement for unforced Euler", url: "https://github.com/openai/NavierStokesAndEuler/blob/main/ComparatorChallenges/Euler.lean", kind: "lean-statement" },
      { label: "Formal Conjectures' Navier-Stokes statement it specialises", url: "https://github.com/google-deepmind/formal-conjectures/blob/8bf45ed70d48b2b2a501de9c00b26bfa38c573ee/FormalConjectures/Millenium/NavierStokes.lean", kind: "problem-record" },
      { label: "The Lean development and comparator configuration", url: "https://github.com/openai/NavierStokesAndEuler", kind: "lean-proof" },
      { label: "OpenAI's announcement (process account and 10 September update)", url: "https://openai.com/index/navier-stokes-solution/", kind: "announcement" },
      { label: "Euler equations (fluid dynamics)", url: "https://en.wikipedia.org/wiki/Euler_equations_(fluid_dynamics)", kind: "wikipedia" },
    ],
    reviewNote:
      "Approved 22 Sep 2026: Candidate, Lean-verified, 80. Audited as NS was: ComparatorChallenges/Euler.lean diffed against DeepMind formal-conjectures at 8bf45ed - structures identical with nu = 0 and f = 0. Solution.lean restates both theorems; Euler.json standard axioms + nanoda. Tarball counts: 1,839 files, 211,578 lines, 0 sorry/axiom/native_decide/unsafe. Paper read: 57 pp, Thm 1.1 matches the second Lean theorem. Blog read via Wayback: Euler was ~100 agents / ~50 h, not 10,000 (that is NS); submitter's aiRole corrected. Sig 80 between forced Euler (70) and NS (87). Not rebuilt here; nobody independent has replayed comparator as far as I can find; provenance dispute (Buckmaster/Alpöge) concerns NS and is recorded in aiRole via OpenAI's own 10 Sep update. Watch for Tao commentary and any comparator replay report.",
    message: [
      "Published as Candidate, Lean-verified, significance 80. Thank you for submitting it: this is the result the catalog's forced Euler and Navier-Stokes entries bracket, and it was missing.",
      "",
      "What was checked. The comparator challenge statement was diffed against DeepMind's Formal Conjectures file that it specialises: with viscosity and force set to zero, every structure matches line by line, so the statement is anchored to a third party's formalisation of the problem, not to one written by the prover. Solution.lean restates both theorems verbatim, the comparator configuration permits only the three standard axioms, and a count on the tarball found 1,839 Lean files and 211,578 lines under Euler/ with zero sorry, axiom, native_decide or unsafe. The paper was read: Theorem 1.1 is the second Lean theorem. Not rebuilt here.",
      "",
      "One correction to your account of the process, from OpenAI's own post. The 10,000 concurrent agents were the Navier-Stokes group. Euler was found first, by \"nearly 100 agents\" working \"approximately 50 hours\", and that solution was then fed to the Navier-Stokes agents. The entry says so, and also records OpenAI's 10 September update on the provenance question, since readers will ask.",
      "",
      "Candidate rather than Resolved for the same reason as the Navier-Stokes entry: no mathematician has read the fifty-seven pages. The statement was rewritten as a question, the posing was aligned with the forced Euler entry, and links to the challenge file, DeepMind's original and the announcement were added.",
    ].join("\n"),
  },
  {
    slug: "classification-of-biologically-unavoidable-sequences",
    action: "approve",
    expectStatus: "pending",
    reason: "edited",
    edits: {
      name: "Which sequences are biologically unavoidable?",
      shortName: "Biologically unavoidable sequences",
      field: "Infinite graphs; combinatorics on words",
      statement:
        "Alexander (2013) defines an infinite $n$-gendered population as a directed graph with real birthdates and edge labels in $\\{1,\\ldots,n\\}$ such that there are finitely many roots, every vertex has finitely many children, every birthdate sublevel set is finite with birthdates strictly increasing along edges, the graph is infinite, and every non-root has an incoming edge of each label. A label sequence is biologically unavoidable if every such population contains a directed path spelling it. Alexander proved that every eventually periodic sequence is unavoidable, generalising König's lemma, and exhibited some avoidable sequences. What are the biologically unavoidable sequences: are there any that are not eventually periodic?",
      posedBy:
        "Samuel A. Alexander, Biologically unavoidable sequences, Electronic Journal of Combinatorics 20(1) P31 (2013), section 6",
      yearPosed: 2013,
      model: "OpenAI Codex (GPT-6 family)",
      modelMaker: "OpenAI",
      verification: "lean-checked",
      verificationNote:
        "Checked here on 22 September 2026. The construction was read in full and verified by hand; it is half a page. For a binary target s, take vertices N with birthdate v, and for v >= 2 the edges v-1 -> v labelled r(v) and v-2 -> v labelled 1-r(v), where r(2j) = s(j) and r(2j+1) = 1-s(j). A path spelling s has v_k >= 2k, so the offset v_k - 2k is a nonincreasing nonnegative integer and stabilises; from then on every step is +2 and the labels force s(k) = s(k+e+1) or s(k) = 1-s(k+e+1), so s is eventually periodic. Finite alphabets reduce to the binary case through an aperiodic indicator and a copy-lift. The Lean endpoint finite_alphabet_real_avoidance was compared with Alexander's Definition 1 clause by clause: finite roots, finite children, finite real sublevel sets, strictly increasing birthdates, infinite vertex set, a parent of each label at every non-root, at most one label per edge, and realisation from any starting vertex. Faithful. 297 lines, no sorry, no axiom, no native_decide; the author's log shows the standard axioms. There is no CI and the site did not rebuild it, so Lean-checked; a GitHub Actions build would lift it. The positive direction is Alexander's published Theorem 10.",
      publication: "announcement",
      resolutionMethod: "construction",
      resolution: "resolved",
      aiContribution: "ai-discovered",
      significance: 14,
      significanceNote:
        "The question Alexander himself called \"perhaps the most important question remaining\" in the paper that introduced the notion, open for thirteen years, but in a one-author corner of infinite graph theory with a small literature. Above the 2026 conjecture-in-a-recent-paper entries at 4 and the numbered Erdős problems at 10, since it stood in print for a long time and closes a classification; below Umans-Wang at 18, whose question carried algorithmic stakes.",
      resultNote:
        "None: the biologically unavoidable sequences are exactly the eventually periodic ones. For every non-eventually-periodic sequence over a finite alphabet there is an explicit avoiding population; for binary sequences it has two roots, two parents per non-root with complementary labels and at most two children per vertex, and the avoidance argument is a decreasing offset along any matching path. An indicator projection and a finite copy-lift extend this to every finite alphabet, including vertex-gendered witnesses. Combined with Alexander's positive theorem, reproduced with a boundary repair, this settles the last question of his section 6. The paper also characterises which members of the binary family are universal and draws finite-observation and computability corollaries; the ordinal and universal-object questions of the same section are not claimed.",
      sourceName: "GitHub repository with manuscript, Lean project and verification records (avg-netizen, 10 September 2026)",
    },
    links: [
      { label: "Alexander (2013), EJC 20(1) P31, section 6 poses the question", url: "https://www.combinatorics.org/ojs/index.php/eljc/article/view/v20i1p31", kind: "problem-record" },
      { label: "The Lean endpoint and population axioms", url: "https://github.com/avg-netizen/biological-unavoidability/blob/main/lean/RealBirthdates.lean", kind: "lean-statement" },
    ],
    reviewNote:
      "Approved 22 Sep 2026: Resolved, Lean-checked, 14. Alexander 2013 read at the EJC PDF: Definition 1 (A1-A4, n-gendered) and section 6 (\"Are there any which are not eventually periodic?\"). Construction checked by hand: correct. IsRealPopulation audited against Definition 1: faithful. 297 lines, 0 sorry/axiom/native_decide; author's log shows standard axioms; no CI, not rebuilt. Resolved rather than Candidate because the argument is elementary and was checked here. Prior art searched (Google, arXiv title search, EJC): nothing after Alexander. Model named only as \"Codex (GPT-6 family)\"; recorded as given.",
    message: [
      "Published as Resolved, Lean-checked, significance 14.",
      "",
      "The argument was checked here, not just the package. Alexander's paper was opened: Definition 1 and the last paragraph of section 6, where he asks whether any unavoidable sequence fails to be eventually periodic. Your construction was then verified by hand, which took a page: v_k >= 2k, the offset stabilises, the +2 steps force a period. It is correct, and it is a clean answer to a question that stood for thirteen years. The Lean endpoint was compared with Definition 1 clause by clause and is faithful; your own STATEMENT-AUDIT is accurate.",
      "",
      "Resolved rather than Candidate, because the site checked the proof itself and the positive direction is Alexander's published theorem. Lean-checked rather than Lean-verified, because the only build on record is your local run: the repository has no CI. A GitHub Actions workflow running `lake exe cache get` and `lake build` in lean/ and printing the endpoint's axioms would lift it to Lean-verified; message us when it is green.",
      "",
      "Edits: the name now poses the question rather than announcing a classification, the statement carries the definitions so a reader can follow, and links to Alexander's paper and to your Lean endpoint were added. The model is recorded as you gave it.",
    ].join("\n"),
  },
  {
    slug: "katsumasa-roff-yoshinaga-conjecture-on-hausdorff-continuity-of-magnitude",
    action: "approve",
    expectStatus: "pending",
    reason: "edited",
    edits: {
      shortName: "Magnitude continuity at finite sets",
      field: "Metric geometry; magnitude of metric spaces",
      fieldGroup: "Geometry & topology",
      posedBy:
        "Hirokazu Katsumasa, Emily Roff and Masahiko Yoshinaga, Conjecture 1.3 of \"Is magnitude generically continuous for finite metric spaces?\", arXiv:2501.08745v2 (2025)",
      yearPosed: 2025,
      solveDate: "2026-09-20",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026. Conjecture 1.3 was read in arXiv:2501.08745v2: for a finite-dimensional positive definite normed space U, X maps to |X| is continuous in the Hausdorff topology on finite subsets of U. Liu's Theorem 1.1 (Zenodo record 22866753, 20 September, 18 pages, read here) states exactly that class and more: for a nonempty compact X within Hausdorff distance r of a finite F, with r below an explicit threshold, -2m^2 r/lambda^2 <= Mag X - Mag F <= 2nm^3 r/lambda^2, where lambda is the least eigenvalue of F's similarity matrix; the title's \"finite-dimensional subspaces of L_1\" is the conjecture's class by Meckes's Corollary 3.5, which the paper cites. The argument (cut deletion, pinching, signed cluster aggregation) was not checked step by step here and no specialist has read it: a two-day-old manuscript on Zenodo, not on arXiv. Prior work is partial and is cited correctly: Kalisnik and Lesnik at skew finite subsets of l_1^N, So on cluster types, Yoshinaga on fixed multiplicity strata.",
      resolution: "candidate",
      aiContribution: "ai-co-developed",
      significance: 16,
      significanceNote:
        "A named conjecture, stated in print in 2025 by three of the people who work on magnitude, on the stability question that matters for the invariant's use in topological data analysis; within a year it drew partial results from three other groups, which is what an active question looks like. Level with the Umans-Wang divisor conjecture at 18 less a little for a smaller field; above Koizumi-Liu at 12, a conjecture answered by one of its own authors in the negative.",
      resultNote:
        "Yes, with a quantitative bound: magnitude is Hausdorff-continuous at every nonempty finite subset of a finite-dimensional positive definite normed space, with a local Lipschitz-type estimate in the Hausdorff distance whose constants depend on the number of points, the dimension and the least eigenvalue of the similarity matrix, and with compact approximants allowed. The paper also obtains convergence of aggregated weights and a continuity criterion in L_1 by local order oscillation, and, in the other direction, a compact convex subset of L_1[0,1] whose finite subsets approach a singleton with magnitudes tending to 3/2, which refutes an implication stated in Kalisnik and Lesnik's preprint from the one-point property to singleton continuity.",
      sourceName: "Zenodo preprint, Mingchang Liu, Magnitude continuity at finite sets in finite-dimensional L_1 subspaces (v1, 20 September 2026)",
    },
    links: [
      { label: "Katsumasa, Roff and Yoshinaga (2025), Conjecture 1.3", url: "https://arxiv.org/abs/2501.08745v2", kind: "problem-record" },
      { label: "Kalisnik and Lesnik (2025), the skew-subset partial result", url: "https://arxiv.org/abs/2506.21128", kind: "paper" },
    ],
    reviewNote:
      "Approved 22 Sep 2026: Candidate, Unreviewed, 16. KRY v2 Conjecture 1.3 read; Liu Thm 1.1 read (Zenodo 22866753, 18 pp); class matches via Meckes Cor 3.5 (cited in the paper). AI statement in the manuscript names GPT-6 Astra Pro and Claude Fable 5.1 as co-developers of specific arguments; submitter's aiRole paraphrases it faithfully. Prior art checked: 2506.21128 (skew subsets), 2511.10331 (So), 2608.30837 (Yoshinaga) all partial. fieldGroup arrived HTML-escaped and was fixed. Author Mingchang Liu unknown to me; not on arXiv. Watch for an arXiv posting and for Roff/Yoshinaga commentary.",
    message: [
      "Published as Candidate, Unreviewed, significance 16.",
      "",
      "What was checked. Conjecture 1.3 was read in Katsumasa, Roff and Yoshinaga's arXiv v2, and the manuscript's Theorem 1.1 was read against it: the class of spaces is the conjecture's, since finite-dimensional subspaces of L_1 are exactly the finite-dimensional positive definite normed spaces by Meckes's Corollary 3.5, and the theorem gives more than continuity, an explicit local bound with compact approximants. The three partial results in the area were checked and are cited correctly as partial. The AI statement at the end of the manuscript matches your account.",
      "",
      "Candidate and Unreviewed because the manuscript is two days old, on Zenodo rather than arXiv, and nobody outside the collaboration has read the argument. Posting it to arXiv, where Roff and Yoshinaga will see it, is the natural next step; if a specialist confirms it, message us and the entry moves.",
      "",
      "Edits: the field group arrived HTML-escaped and was fixed; the field, the posing, the solve date and the source name were filled; the counterexample in L_1[0,1] and the refuted implication are recorded in the result note; links to the conjecture and to the Kalisnik-Lesnik partial result were added.",
    ].join("\n"),
  },
  {
    slug: "pebody-s-even-cyclic-four-deck-reconstruction-conjecture",
    action: "approve",
    expectStatus: "pending",
    reason: "edited",
    edits: {
      shortName: "Pebody's four-deck conjecture",
      field: "Combinatorial reconstruction; Fourier analysis on cyclic groups",
      humanCollaborators: ["Oleksiy Babanskyy"],
      verification: "unreviewed",
      verificationNote:
        "Checked here on 22 September 2026. Pebody's Conjecture 8.1 (Combinatorics, Probability and Computing 16 (2007), 503-514, confirmed at Crossref) and the imported lower bound (Keleti-Kolountzakis, arXiv:math/0603415, Corollary 1.1: the 3-deck suffices for Z_n iff n is a power of an odd prime, a product of at most three odd primes, or n in {2,4,6,8,10}) were read. The 11-page manuscript was read: it follows the Grünbaum-Moore route, phases on the Fourier support, Galois covariance making them roots of unity, local characters on generator shells, gluing across odd primes by four-term relations, and removes the remaining dyadic sign by an integrality argument on Fourier projectors, which is exactly the point where Grünbaum-Moore's Theorem 5 needed a nonzero coefficient. The chain is coherent and non-trivial; it was not checked step by step here and no specialist has read it. The site ran an independent brute force: for every n <= 22, any two subsets of C_n with the same cumulative 4-deck are translates, while the 3-deck fails at n = 12, 14, 16, 18, 20, 22 exactly as Keleti-Kolountzakis predict. That is consistent with the theorem and is not evidence for the proof, since Grünbaum-Moore already cover small n.",
      resolution: "candidate",
      aiContribution: "ai-assisted",
      significance: 15,
      significanceNote:
        "A numbered conjecture from a 2007 CPC paper on a classical reconstruction problem with a real lineage (Grünbaum-Moore 1995, Radcliffe-Scott, Pebody, Keleti-Kolountzakis), open for nineteen years, in a small community. Level with the Umans-Wang and Fermat-nonnormality band at 15-18 less a little for the size of the audience; well above this author's earlier entry at 4, which answered a conjecture four months old. The extraordinary-claims rule was considered and does not apply: this is not a problem the wider field is watching.",
      resultNote:
        "Claimed: r_set(C_n) <= 4 for every n >= 1, that is, the cumulative 4-deck determines every subset of a cyclic group up to translation. With Keleti-Kolountzakis's Corollary 1.1 for the lower bound this gives r_set(C_n) = 4 for every even n > 10, the whole domain of Pebody's Conjecture 8.1. The lower bound is imported, not claimed. The proof works on the ratio of Fourier transforms of two sets with equal decks: finiteness of the phase fibre, cyclotomic torsion of the phases, gluing of primary characters across odd primes, and extinction of the residual dyadic signs by two odd-denominator projectors. Binary subsets and translation-only decks only; no claim for multisets, general integer signals or noncyclic groups. A full-proof claim awaiting authoritative review.",
    },
    reviewNote:
      "Approved 22 Sep 2026: Candidate, Unreviewed, 15. Author asked whether the extraordinary-claims rule applies; decided no (small-community conjecture). Pebody 2007 confirmed at Crossref; KK Cor 1.1 and Thm 2.22 read. Manuscript read in full: coherent GM-route argument, the dyadic-sign integrality step is the novelty and the risk; Prop 3.1 (odd d: epsilon = 1 via the (xi, xi, -2xi) relation and Galois) checked and correct. Brute force here (scratch deck.py, einsum decks, canonical rotation classes): n <= 22 all 4-deck classes are translation classes; 3-deck fails at 12/14/16/18/20/22 as KK say. Paper author Oleksiy Babanskyy recorded from the PDF. Same account as the U30 entry (sig 4).",
    message: [
      "Published as Candidate, Unreviewed, significance 15.",
      "",
      "You asked whether the extraordinary-claims rule applies. It does not. That rule has been used for the matroid secretary claim, the Res(+) lower bound and the Gromov-Hausdorff space theorem: problems a whole field is watching, where a hold costs nothing and a wrong listing costs a lot. Pebody's Conjecture 8.1 is a real named open problem with a nineteen-year history, but it belongs to a small community, and Candidate already says what needs saying: a complete claimed proof awaiting authoritative review.",
      "",
      "What was checked. Pebody's paper was confirmed at Crossref and Keleti-Kolountzakis's Corollary 1.1 and Theorem 2.22 were read, so the lower bound and the domain are as you state. Your manuscript was read in full. The chain is coherent: phases on the Fourier support, roots of unity by Galois covariance, local characters, gluing across odd primes, and the integrality argument that kills the dyadic sign, which is exactly where Grünbaum-Moore needed a nonzero coefficient. Proposition 3.1 was checked line by line and is right. The projector step was not checked to the bottom, and that is where a referee will look.",
      "",
      "The site also ran its own brute force, written from the definitions rather than from your scripts: for every n up to 22, any two subsets of C_n with the same cumulative 4-deck are translates, and the 3-deck fails at 12, 14, 16, 18, 20 and 22, exactly as Keleti-Kolountzakis predict. Consistent with the theorem, not evidence for the proof, since small n were already covered.",
      "",
      "Edits: the paper's author is recorded as a human collaborator, since you are he; the field was filled; the result note states the claim boundary you drew. A specialist reading it would move it: Pebody, Kolountzakis or Keleti would know quickly.",
    ].join("\n"),
  },
  {
    slug: "superpolynomial-lower-bounds-for-bit-php-in-unrestricted-resolution-over-paritie",
    action: "republish",
    expectStatus: "rejected",
    reason: "edited",
    edits: {
      verification: "lean-verified",
      verificationNote:
        "Held on 15 September 2026 for one reason: nothing outside the author's machine had compiled the proof. Lifted on 22 September. GitHub Actions run 34953139115 (15 September, commit 3979e0c, a fresh ubuntu-24.04 runner, mathlib cache fetched for dependencies only and .lake/build deleted before the build) ran `lake --wfail build claims.BitPHPSuperpolynomial`, completed 2,484 jobs, printed MathResearch.bitPHP_superpolynomial with axioms propext, Classical.choice and Quot.sound, and then replayed the final module in a fresh leanchecker kernel; a second dispatch run on 17 September also succeeded. The claim file at 3979e0c is byte-identical to the one audited here at 54f0937 on 15 September: the final theorem quantifies over every AffineDAG over the standard bit-PHP initial clauses with a node deriving the empty clause and bounds the node count below by (2^l)^K; AffineDAGStep allows initial clauses, semantic weakening, resolution on a parity literal against its complement and any sound two-premise rule, with nodes referencing any earlier node and no regularity or depth constraint, a superset of dag-like Res(+); usualCNFClause is the standard bit-PHP axiom over all pairs and all 2^l labels; no sorry, no custom axiom, no native_decide in 81 files; the chessboard homology is proved, not assumed. Kernel-checked on a machine other than the author's and statement audited: Lean-verified. No specialist has read the argument.",
      resolution: "candidate",
      significance: 35,
      significanceNote:
        "The open benchmark of resolution over parities: superpolynomial lower bounds for the unrestricted dag-like system, named as open by Itsykson and Sokolov in 2014 and by every 2024-2026 paper on it, with the strongest prior results reaching bounded or near-quadratic depth only. Central to proof complexity and known by name in the wider complexity community; below the matroid secretary conjecture, which all of online algorithms watches, and a little under the Borsuk problem at 40 for field size.",
      resultNote:
        "Claimed: for every K there is L such that for every l >= L, any dag-like Res(+) refutation of the bit pigeonhole principle with 2^l + 1 pigeons and 2^l holes has more than (2^l)^K nodes; superpolynomial in the number of holes, for a proof system with no regularity or depth restriction. The whitepaper's route is a transfer to degree-O(log n) polynomial calculus. Candidate: kernel-checked and statement audited, read by no specialist.",
      sourceName: "kbr-/math-research: whitepaper at commit dfc69c6, Lean claim BitPHPSuperpolynomial.lean built by CI at 3979e0c",
    },
    links: [
      { label: "GitHub Actions build on a fresh runner: axioms and kernel replay", url: "https://github.com/kbr-/math-research/actions/runs/34953139115", kind: "independent" },
      { label: "The Lean claim file, BitPHPSuperpolynomial.lean at 3979e0c", url: "https://github.com/kbr-/math-research/blob/3979e0cc0a75dde9b845df7ec8869d033dfcd8d4/formalization/claims/BitPHPSuperpolynomial.lean", kind: "lean-statement" },
    ],
    reviewNote:
      "Re-published 22 Sep 2026 from held: Candidate, Lean-verified, 35. The one condition set on 15 Sep is met: CI run 34953139115 green on a fresh runner at 3979e0c (claim file identical to the 54f0937 audit, diffed), lake --wfail so no sorry, axioms standard, fresh leanchecker replay; second run 17 Sep green. The workflow has since been changed to workflow_dispatch and retargeted at claims/BitPHPPreprintRevision1.lean (a preprint revision), so the link is pinned to the run, not to the workflow. Braun asked for an arXiv endorser in cs.CC; answered that the site cannot endorse. Watch for the arXiv posting and for a specialist reading.",
    message: [
      "Your entry is published: Candidate, Lean-verified, significance 35. The one thing asked for on 15 September was that something other than your machine compile the proof, and run 34953139115 does it: a fresh runner, dependencies from the mathlib cache only, your build directory deleted first, `lake --wfail build` completing 2,484 jobs, the final theorem printed with the three standard axioms, and a fresh leanchecker replay on top. The claim file it built is byte-identical to the one audited on the 15th, so the audit carries over: proof system a superset of dag-like Res(+), the standard bit-PHP clauses, no sorry or custom axiom in 81 files. Lean-verified is the site's word for kernel-checked plus statement audited, and both now hold.",
      "",
      "Candidate rather than Resolved because no specialist has read the argument, and the claim is the open benchmark of its area. That is where the next step lives. Itsykson, Efremenko, Garlik, Chattopadhyay or Dvorak would know within an afternoon whether the transfer to degree-O(log n) polynomial calculus does what it claims; if one of them says so in public, or the paper is accepted, message us and the entry moves to Resolved.",
      "",
      "On arXiv endorsement: nobody on this side can endorse in cs.CC, and the site does not act as a reference. The route that works is the one arXiv itself gives: submit, and when it asks for an endorser, name someone whose work your paper builds on; the people above are the natural choices, and a short note with the CI run and the Lean claim file attached is the strongest case you can make. The entry here links both.",
    ].join("\n"),
  },
];

// ---------------------------------------------------------------------------
// Contact messages. All three senders have accounts, so each is answered with
// an in-app DirectMessage and the SiteMessage row marked handled.

interface Reply {
  id: string; // 8-character SiteMessage id prefix
  who: string;
  body: string;
}

const REPLIES: Reply[] = [
  {
    id: "6d7bc948",
    who: "FrostyWalrus278 (Kamil Braun)",
    body: [
      "Looked again, as promised. Your entry is published: Candidate, Lean-verified, significance 35. The decision message on the entry says what was checked; the short version is that run 34953139115 is exactly what was asked for, the claim file it built is byte-identical to the one audited on the 15th, and Lean-verified is the site's word for kernel-checked on a machine other than yours plus a statement audit.",
      "",
      "On arXiv endorsement: nobody on this side can endorse in cs.CC, and the site does not act as a reference. The route that works is arXiv's own: submit, and when asked for an endorser, name someone whose work your paper builds on, with the CI run and the Lean claim file linked. Itsykson, Efremenko, Garlik, Chattopadhyay or Dvorak are the natural people, and a specialist reading is also what would move the entry from Candidate to Resolved.",
    ].join("\n"),
  },
  {
    id: "e3bd84a3",
    who: "BoldHawk988 (Warren D. Smith)",
    body: [
      "Thank you for writing, and for the care you are taking with the proofs before putting your name to them.",
      "",
      "VibeMathed cannot be the place you post the papers. It is a catalog, not a host: every entry points at a source that lives somewhere else, a preprint server, a repository, a journal. What it can do is list a result once it has a public home.",
      "",
      "For the home: Zenodo (zenodo.org) takes any PDF, needs no institutional affiliation, gives a DOI and keeps versions, and several entries here already point at it. A GitHub repository does the same job if you also want code and experiments alongside. Either is a citable URL. arXiv's endorsement system is a barrier for exactly your situation, and Zenodo is the usual way round it.",
      "",
      "For the listing: paper (2), the multiwinner voting theorem, is in scope. A theorem with a claimed proof, finishing a question you, Pereira and Simmons posed in 2015-16, found by Claude in a day, is the kind of thing this site records. Submit it once it is posted, with the AI role described as you did here, and mark it as unverified if that is where the proofs stand; the entry would go up as Candidate, Unreviewed, and move as checking happens. If you formalise any of the twelve theorems, say so and the level rises. Papers (1) are physics, and the site stays on the mathematics side of that line, even where the physics carries theorems.",
    ].join("\n"),
  },
  {
    id: "b3304588",
    who: "umpolungfish",
    body: [
      "Thanks for the links. Your ORCID record (0000-0003-0003-0552, Lando Mills) lists github.com/umpolungfish as yours, which ties the name to the GitHub login. Whether the account here is that GitHub login is what decides verification: if it is, the badge is set with this message; if the account was made another way, sign in once with GitHub on the same account and it can be confirmed.",
    ].join("\n"),
  },
];

/// Verify umpolungfish only if the account's GitHub login is this user.
const VERIFY_GITHUB = {
  id: "b3304588",
  providerAccountId: "70781765", // github.com/umpolungfish, numeric id from the API
  note: "ORCID 0000-0003-0003-0552 (Lando Mills) links github.com/umpolungfish; the account signed in with that GitHub login (id 70781765). Checked 22 Sep 2026.",
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
    console.log(`${d.action.toUpperCase().padEnd(9)} ${d.slug.slice(0, 56)}`);
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
  for (const r of REPLIES) {
    const n = charLength(canonical(r.body));
    console.log(`REPLY     ${r.who.padEnd(32)} ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
  }
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

    // Entries: every row in the expected state, every merged edit valid.
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, status: true, reviewReason: true, name: true, sourceUrl: true, submittedById: true, links: { select: { label: true, url: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== d.expectStatus) throw new Error(`${d.slug} is ${cur.status}, expected ${d.expectStatus}`);
      if (d.action === "republish" && cur.reviewReason !== "held") throw new Error(`${d.slug} is rejected with reason ${cur.reviewReason}, not held`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: cur.sourceUrl });
      console.log(`${d.action.toUpperCase().padEnd(9)} ${cur.name.slice(0, 58)}  [${cur.status}${cur.reviewReason ? "/" + cur.reviewReason : ""}] -> merged check: ${v.length ? "FAILED" : "ok"}${d.links?.length ? `  +${d.links.length} links` : ""}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    // Contact messages: every id must resolve to one OPEN row with an account.
    const msgRow = new Map<string, { id: string; userId: string }>();
    for (const r of REPLIES) {
      const rows = await prisma.$queryRawUnsafe<{ id: string; userId: string | null }[]>(
        `SELECT id, "userId" FROM "SiteMessage" WHERE id::text LIKE $1 || '%' AND status = 'open'`,
        r.id,
      );
      if (rows.length !== 1) throw new Error(`${r.id}: matched ${rows.length} open messages, expected 1`);
      if (!rows[0].userId) throw new Error(`${r.id} (${r.who}) has no userId - cannot reply in-app`);
      const u = await prisma.user.findUnique({
        where: { id: rows[0].userId },
        select: { id: true, email: true, pseudonym: true, verified: true },
      });
      if (!u) throw new Error(`${r.who}: no account`);
      msgRow.set(r.id, { id: rows[0].id, userId: u.id });
      console.log(`REPLY     ${(u.pseudonym ?? r.who).padEnd(20)} ${r.id}  -> ${u.email ?? "(no email)"}${u.verified ? "  [verified]" : ""}`);
    }

    // Verification: set only on a matching GitHub login.
    const vRow = msgRow.get(VERIFY_GITHUB.id)!;
    const gh = await prisma.account.findFirst({
      where: { userId: vRow.userId, provider: "github" },
      select: { providerAccountId: true },
    });
    const vUser = await prisma.user.findUnique({ where: { id: vRow.userId }, select: { email: true, verified: true, pseudonym: true } });
    const willVerify = gh?.providerAccountId === VERIFY_GITHUB.providerAccountId && !vUser?.verified;
    console.log(`\nverification for ${vUser?.pseudonym}: github account ${gh ? gh.providerAccountId : "none"} (want ${VERIFY_GITHUB.providerAccountId}); account email ${vUser?.email ?? "-"}; ORCID email c.landonmills@gmail.com; already verified ${vUser?.verified}`);
    console.log(willVerify ? "  -> will set verified" : "  -> will NOT set verified (curator's call if the emails match)");

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
          status: "published",
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
        data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
      });
      if (d.reviewNote) {
        await prisma.reviewNote.create({
          data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: d.reviewNote },
        });
        console.log(`review note: ${d.slug}`);
      }
    }

    for (const r of REPLIES) {
      const row = msgRow.get(r.id)!;
      await prisma.directMessage.create({
        data: {
          userId: row.userId,
          senderId: curator.id,
          senderName: curator.pseudonym,
          kind: "note",
          body: r.body.slice(0, MESSAGE_MAX),
        },
      });
      await prisma.siteMessage.update({
        where: { id: row.id },
        data: { status: "handled", handledAt: new Date() },
      });
      console.log(`replied: ${r.who}`);
    }

    if (willVerify) {
      await prisma.user.update({
        where: { id: vRow.userId },
        data: { verified: true, verifiedNote: VERIFY_GITHUB.note },
      });
      console.log(`verified: ${vUser?.pseudonym}`);
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and stats");
    console.log("lag by up to an hour, or until a deploy. The contact queue should be empty.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
