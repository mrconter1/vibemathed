// 27 September 2026: the nine pending submissions and the one contact message.
//
// SEVEN PUBLISHED, ONE HELD, ONE DECLINED.
//
// Every source was opened. Both Lean repositories were cloned and counted, and
// in one case two commits were diffed definition by definition.
//
// 1. MUMFORD-SHAH - HELD. Deangelis, "Solution of the Mumford-Shah
//    conjecture", arXiv:2609.26732, 22 September, ten pages, the proof
//    produced by ChatGPT Astra in a 2.5-hour run on 9 September. The planar
//    interior regularity conjecture of Mumford and Shah (CPAM 1989) is one of
//    the well-known open problems of the calculus of variations, with a 2025
//    De Lellis-Focardi monograph devoted to the surrounding theory. The
//    author's note is the most transparent in this batch: it dates each run,
//    says the first six-hour attempt failed, and explains that he went public
//    early only because of OpenAI's 21 September announcement.
//    Held on the extraordinary-claims rule, the Ishiki way. The line this
//    site has drawn in practice is not "is the claim big" but "is there
//    anything independent yet": Navier-Stokes, Euler and Yau-Tian-Donaldson
//    went in as candidates because each carried a machine-checked proof or a
//    detailed appendix plus an established author's own verification. Here
//    there is a fresh PDF, no Lean, no referee, and the human did not find
//    the argument. Fields are fixed now so the row publishes unchanged the
//    day an expert reads it.
//
// 2. GRIFFITHS CONJECTURE - published, Candidate, Unreviewed, 55. Du and Xie,
//    arXiv:2609.26504, 22 September, twenty pages: a rank-two ample bundle on
//    the abelian surface C x C, C: y^2 = x^3 - x, with no smooth
//    Griffiths-semipositive Hermitian metric, so Griffiths's 1969 converse
//    fails already in rank two. Published rather than held, and the
//    distinction from the entry above is deliberate: here the AI Use
//    Disclosure says the authors developed the direction and framework, used
//    generative AI in the subsequent exploration, and "independently verified
//    the final arguments", and a counterexample on a named surface is a far
//    smaller object to check than a regularity theorem. Same treatment as the
//    catalog's Yau-Tian-Donaldson entry. The disclosure is the thinnest in
//    the batch - no model, no vendor - which the entry records rather than
//    glosses, as the submitter asked.
//
// 3. CHAIR44, a strongly aperiodic monotile in three dimensions - published,
//    Resolved, LEAN-CHECKED (not lean-verified), 35. Tsiokos,
//    arXiv:2609.19214. Socolar and Taylor asked in 2012 for a single simply
//    connected 3D prototile forcing nonperiodicity by shape alone; the
//    Schmitt-Conway-Danzer biprism and the 3D Socolar-Taylor tile both admit
//    screw motions or a periodic stacking direction. The repository was
//    cloned: 85 Lean files, 29,815 lines, ZERO real sorry (the single grep
//    hit is inside a comment), zero axiom declarations, zero unsafe - but
//    THIRTY-FIVE native_decide calls across twelve files, which the author
//    discloses honestly as "named compiler hooks" in AXIOMS.md and a tiered
//    trust ledger, with an independent Python replay of the same finite
//    facts. Downgraded from the submitted lean-verified for two reasons the
//    note states: native_decide puts Lean's compiler and runtime in the
//    trusted base rather than the kernel alone, and lean-verified also
//    requires the statement to be anchored outside the prover's own
//    repository, which no comparator or Palomar entry here provides. The only
//    CI workflow is "Reader notebook" and it is failing; nothing builds the
//    Lean. This is the same call the catalog made for Dittert's conjecture
//    and for composites-among-xi-7-n.
//
// 4. HLAWKA CONSTANTS FOR SCHATTEN NORMS - published, Partial, Lean-verified,
//    20. Audenaert and Kittaneh's Problem 7 (arXiv:1201.5232, 2012) asks for
//    the best constant; this settles the "if it exists" half for every p and
//    gives the sharp constant for diagonal matrices at p >= 256. The
//    repository was cloned at commit 1829591: 48 files, 8,711 lines, exactly
//    four sorry and all four in the two Challenge statement files, which is
//    what a comparator layout is meant to look like; zero axiom, zero
//    native_decide; CI green at that commit.
//    THE CHECK THAT MATTERED. The submitter notes that Palomar's statement
//    check last passed at the earlier commit 79aa498, before a toolchain
//    upgrade. That would normally block lean-verified, since the anchoring
//    would cover different text. So both Challenge files were fetched at both
//    commits and compared: all four theorem statements are byte-identical,
//    and of the supporting definitions only three changed, all cosmetically -
//    the variable N renamed size, and pairGapSum refactored through a new
//    pairGap whose body is size x + size y - size (x + y), so the sum is the
//    same three pair deficits. The anchoring carries over. Lean-verified
//    stands, and the note explains why rather than asserting it.
//
// 5. LAPLACIAN S_{n,n} CONJECTURE - published, Resolved, Unreviewed, 22.
//    Johnston, arXiv:2609.26895. Fallat, Kirkland, Molitierno and Neumann's
//    2005 conjecture that no simple graph on n >= 2 vertices has Laplacian
//    spectrum {0,1,...,n-1}; known for n <= 15 and for n >= 6,649,688,933,
//    and this closes the gap between.
//
// 6. MATROID INTERSECTION AND MATCHOID INTEGRALITY GAPS - published, Partial,
//    Unreviewed, 20. Cong and Zhao, arXiv:2609.21477. The submission gave
//    almost no fields, so they are filled here from the paper. The nuance the
//    bare statement lost: for weighted k-matroid intersection the conjectured
//    gap is k-1 and this improves the best known bound from k to k-1+1/k, so
//    that half is partial; but for p-matchoids it proves the gap is at most
//    p-1+1/p, which RESOLVES the p-matchoid part of Lee, Sviridenko and
//    Vondrak's Conjecture 1, with projective planes giving tight instances.
//
// 7. MERINO-WELSH SHARP THRESHOLD - published, Resolved, Unreviewed, 14. Liu,
//    Zenodo 22911905, 23 September: the multiplicative inequality
//    T_M(x,0)T_M(0,x) >= T_M(1,1)^2 holds for every loopless coloopless
//    matroid at x_* = 2.2266815969..., the largest real root of x^3 = 9(x-1),
//    which is Csikvari's Conjecture 7.1 from February 2025 and is sharp
//    because counterexamples are known below it. Same author as the catalog's
//    magnitude-continuity entry. Low significance because the threshold
//    conjecture is nineteen months old, not because the work is slight; the
//    graph case at x = 2, the actual Merino-Welsh conjecture, stays open.
//
// 8. THUE-MORSE MATCHING HEIGHTS - published, Candidate, Lean-checked, 5. A
//    quantitative follow-up by a different account to a question raised in
//    Section 5 of the avg-netizen manuscript behind the catalog's
//    classification-of-biologically-unavoidable-sequences entry, published
//    here on 22 September. Exact closed form for the attained maximum L(v),
//    with 3L(v) <= 8v-1 and equality exactly at v = 3.2^n - 1. CI run
//    36116271138 is green at the pinned commit. Significance 5 is the U30
//    band: a precisely posed, genuinely open question from a paper weeks old.
//
// 9. PMAD IN LEAN 4 - DECLINED, no-open-question. A Lean 4 formalisation of
//    the submitter's own Phase-Mediated Attractor Dynamics framework,
//    deriving metric geometry and the Born rule from his own postulates. The
//    repository is real work and compiles: PMADLean/Axioms.lean declares no
//    Lean axioms at all, only definitions, so the development is sorry-free
//    over Mathlib. But posedBy is the submitter and yearPosed is 2026: there
//    is no previously-open question from anyone else, and what Lean certifies
//    is that conclusions follow from definitions the author chose. That is
//    formalisation of a theory, not the resolution of an open problem, and
//    the physics side of the line this site does not cross. Declined with the
//    route back stated.
//
// CONTACT MESSAGE. An anonymous sender with a Haifa address asks whether a
// submission that passes checks then becomes available for someone or
// something to Lean-verify. The honest answer is no: the site records and
// audits what submitters supply and does not formalise anything itself.
// There is no account behind the row, so the script prints an email draft and
// marks it handled.
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
  action: "approve" | "hold" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DECISIONS: Decision[] = [
  {
    slug: "mumford-shah-conjecture-planar-interior-regularity",
    action: "hold",
    reason: "held",
    edits: {
      name: "The Mumford-Shah conjecture on planar interior regularity",
      shortName: "Mumford-Shah planar regularity",
      field: "Calculus of variations; free-discontinuity problems",
      statement:
        "The Mumford-Shah functional adds the Dirichlet energy of $u$ off a closed set $K$, the length of $K$, and a fidelity term. Mumford and Shah conjectured in 1989 that for a minimiser in a bounded planar domain the reduced discontinuity set $K$ is locally a finite union of $C^1$ arcs, so that every point of $K$ has a neighbourhood in which $K$ is either a single arc, a $C^1$ curve through the point, or three arcs meeting at $120^\\circ$, with crack tips and triple points locally finite. Regularity away from the singular set is known, and the conjecture is equivalent to classifying the generalised global minimisers. Does the classification hold?",
      posedBy:
        "David Mumford and Jayant Shah, Optimal approximations by piecewise smooth functions and associated variational problems, Comm. Pure Appl. Math. 42 (1989), 577-685",
      yearPosed: 1989,
      model: "ChatGPT Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Francesco Deangelis"],
      aiRole:
        "From the author's note on page 1, which dates every step. The author uploaded his PhD thesis, books on the subject and a LaTeX file of unpublished work. On 5 September he asked Astra in Work mode to solve the conjecture; after six hours there was no complete proof. On 6 September he redirected it to the Dirichlet-boundary variant from his thesis, and after one hour twenty minutes it produced a proof building on his recent progress. On 9 September he returned to the original conversation, supplied the new boundary-regularity manuscript and asked Astra to use it; after two hours thirty minutes it produced a complete proof of the main conjecture, 37 pages. A shorter version was produced on 11 September and is the manuscript released on 22 September.",
      verification: "unreviewed",
      resolutionMethod: "argument",
      resolution: "candidate",
      aiContribution: "ai-discovered",
      publication: "preprint",
      sourceName: "Solution of the Mumford-Shah conjecture, arXiv:2609.26732 and CVGMT preprint 8002 (22 September 2026)",
      significance: 62,
      significanceNote:
        "One of the standing open problems of the calculus of variations, posed in the 1989 paper that introduced the functional and still the subject of a 2025 De Lellis-Focardi monograph on the surrounding regularity theory. Above the Yau-Tian-Donaldson and Kothe entries at 60 for a longer and more widely followed history, and below the critical-line proportion entry at 68. Recorded now so the row publishes unchanged if it survives review; the score is for the problem, not for this manuscript.",
    },
    reviewNote:
      "Held 27 Sep 2026 under the extraordinary-claims rule. arXiv:2609.26732, five days old, ten pages, the proof produced by ChatGPT Astra in a 2.5-hour run and not independently checked. The Mumford-Shah planar regularity conjecture is a standing problem of the field. Read here: the author's note (dated runs, the failed six-hour first attempt, the reason for going public on 22 September), Theorem 1.1 (the exact local star, m in {1,2,3}, singular points locally finite), and the reduction in Section 2 to the global classification in Theorem 3.4 via the cited De Lellis-Focardi theory. The claim is coherent and the disclosure is exemplary. What is missing is the only thing that matters here: nobody independent has read it, there is no formalisation, and the human did not find the argument. Route back: a named specialist in free-discontinuity problems (De Lellis, Focardi, David, Leger, Bonnet) saying in public that the classification holds, or acceptance, or a machine-checked proof. Name, statement, posing, AI role and significance 62 are fixed, so it re-publishes as Candidate/Unreviewed the same day. Watch arXiv 2609.26732 for v2 and for commentary.",
    message: [
      "Held, not declined, and the reason is the size of the claim rather than anything wrong with your submission.",
      "",
      "The Mumford-Shah planar regularity conjecture is one of the standing open problems of the calculus of variations, with a monograph devoted to the surrounding theory last year. The site's rule for claims of that size is that they wait until a named specialist with no stake has read the argument, the paper is accepted, or a machine-checked proof exists. The preprint is five days old, so none of those has had time to happen.",
      "",
      "Your author's note is the most transparent disclosure this site has received. It dates each run, records that the first six-hour attempt produced nothing complete, explains how the Dirichlet-boundary result from your thesis was fed back in, and says plainly why you published on 22 September rather than after simplifying. All of that is now recorded on the row, verbatim in substance.",
      "",
      "What was checked here: Theorem 1.1 and its exact local star, the reduction in Section 2 to the global classification of Theorem 3.4, and that the cited regularity theory is the published De Lellis-Focardi monograph rather than something assumed. The argument was not checked line by line, and honestly it is not the kind of argument that can be checked quickly.",
      "",
      "Nothing needs changing. The name, statement, posing, your AI role and a significance of 62 are fixed on the row, so it publishes exactly as it stands the day one of the three conditions is met. If De Lellis, Focardi, David, Leger or Bonnet reads it and says so publicly, message us and it goes up that day. A Lean formalisation of the classification would do the same.",
    ].join("\n"),
  },
  {
    slug: "ample-vector-bundles-without-griffiths-semipositive-metrics",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Griffiths' conjecture: does every ample vector bundle carry a Griffiths-positive metric?",
      shortName: "Griffiths' conjecture",
      field: "Complex geometry; positivity of vector bundles",
      fieldGroup: "Geometry & topology",
      statement:
        "Griffiths proved in 1969 that a holomorphic vector bundle carrying a smooth Hermitian metric whose Chern curvature is Griffiths-positive is ample, and conjectured the converse: every ample holomorphic vector bundle on a compact complex manifold should admit a smooth Griffiths-positive Hermitian metric. It holds for line bundles and, by Murakami's 2026 analytic proof, on compact Riemann surfaces, and Demailly's nonlinear system and direct-image methods have been aimed at it for two decades. Does the converse hold in rank at least two?",
      posedBy:
        "Phillip A. Griffiths, Hermitian differential geometry, Chern classes, and positive vector bundles (1969)",
      yearPosed: 1969,
      model: "Not disclosed",
      modelMaker: "Not disclosed",
      humanCollaborators: ["Yun-Heng Du", "Song-Yan Xie"],
      verification: "unreviewed",
      verificationNote:
        "Checked here on 27 September 2026 against arXiv:2609.26504v1, twenty pages, posted 22 September. Theorem 1.1 is read as stated: there is an ample holomorphic vector bundle $E$ of rank two on $X = C \\times C$ with $C : y^2 = x^3 - x$ admitting no smooth Griffiths-semipositive Hermitian metric, hence no Griffiths-positive one. The route was read in outline: a curvature obstruction on a split bundle $L_1 \\oplus L_2$ with a strict Levi-form bound, persistence under small deformations, then nonsplit extensions placed with an ample bundle in one irreducible moduli space of stable sheaves, where openness of ampleness supplies an ample member inside the obstruction neighbourhood. The paper's own Remark 2.6 bounds the claim: the operator argument applies to Hermitian squared norms and not to general strongly pseudoconvex complex Finsler norms, so the Finsler characterisation of ampleness is untouched. The mathematics was not checked line by line here, and no referee has seen it. The AI Use Disclosure is quoted in full in the AI role field; it names no model and no vendor, which is the thinnest disclosure in this batch and is recorded as such.",
      resolutionMethod: "construction",
      resolution: "candidate",
      aiContribution: "ai-assisted",
      publication: "preprint",
      significance: 55,
      significanceNote:
        "A named 1969 conjecture of Griffiths that has organised the study of positivity for higher-rank bundles ever since, with Demailly's nonlinear system, direct-image metrics and Naumann's and Pingali's approaches all aimed at it, and a 2026 analytic proof on curves. Below the Yau-Tian-Donaldson entry at 60, the closest comparison in the catalog and a more central conjecture, and above the sphere-packing and union-closed entries at 50. The score is for the conjecture, not for this preprint.",
      resultNote:
        "False in rank two. Theorem 1.1 exhibits an ample rank-two holomorphic vector bundle on the abelian surface $C \\times C$, $C : y^2 = x^3 - x$, with no smooth Griffiths-semipositive Hermitian metric, so a fortiori no Griffiths-positive one. The obstruction is established first on a split bundle, shown to persist under small deformations, and then transferred to an ample bundle through an irreducible moduli space of stable sheaves using openness of ampleness. Scope, from the paper's Remark 2.6: the obstruction concerns smooth Hermitian metrics, and the argument does not apply to general strongly pseudoconvex complex Finsler squared norms, so the Finsler characterisation of ampleness is not refuted.",
      sourceName: "Ample vector bundles without Griffiths-semipositive metrics, arXiv:2609.26504 (22 September 2026)",
    },
    links: [
      { label: "Murakami, an analytic proof of Griffiths' conjecture on compact Riemann surfaces (2026)", url: "https://doi.org/10.1007/s00208-025-03100-1", kind: "paper" },
    ],
    reviewNote:
      "Approved 27 Sep 2026: Candidate, Unreviewed, 55. Published rather than held, and the distinction from the Mumford-Shah hold of the same day is deliberate and recorded in the message: here the authors developed the direction and framework, used generative AI in the subsequent exploration, and state that they independently verified the final arguments, and a counterexample on a named abelian surface is a far smaller object to check than a regularity theorem. Same treatment as the catalog's YTD entry. Read here: abstract, Theorem 1.1, the deformation-plus-moduli route in Sections 2 and 4, Remark 2.6's Finsler caveat, and the full AI Use Disclosure, which names no model or vendor - recorded as the thinnest disclosure in the batch, as the submitter themselves flagged. Song-Yan Xie is an established complex geometer with named NSFC support. Watch for commentary from Demailly-school authors and for a v2.",
    message: [
      "Published as Candidate, Unreviewed, significance 55.",
      "",
      "You were right to flag the disclosure. The AI Use Disclosure names only \"generative AI\" with no model and no vendor, which is the thinnest of the nine submissions reviewed today, and the entry says so in as many words rather than smoothing it over. It also quotes the disclosure in full, including the sentence that matters most: the authors developed the direction and framework and independently verified the final arguments.",
      "",
      "That sentence is why this is published while another major claim reviewed today was held. A counterexample on a named abelian surface is a concrete object a specialist can check, and the humans here verified the argument themselves; the held claim was found by a model in a single run and read by nobody. The rule is about what independent support exists, not about how famous the conjecture is.",
      "",
      "What was checked: Theorem 1.1 as stated, the route in outline (curvature obstruction on the split bundle, persistence under deformation, transfer through the stable-sheaf moduli space by openness of ampleness), and your Remark 2.6, which the entry records as the scope limit - the obstruction is about smooth Hermitian metrics and leaves the Finsler characterisation of ampleness standing. Your submitter note was accurate on all of it.",
      "",
      "Edits: the name and statement now pose the conjecture as a question and set out what was already known, including Murakami's 2026 analytic proof on curves, which is linked; the field and field group were filled.",
    ].join("\n"),
  },
  {
    slug: "strongly-aperiodic-monotile-in-three-dimensions",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Is there a strongly aperiodic monotile in three dimensions?",
      shortName: "3D strongly aperiodic monotile",
      field: "Tiling theory; aperiodic order",
      fieldGroup: "Geometry & topology",
      statement:
        "A prototile is strongly aperiodic if it tiles space and no tiling by its congruent copies has any translational period. In the plane this was settled in 2023 by the hat. In three dimensions the known candidates fall short: the Schmitt-Conway-Danzer biprism tiles only with screw motions, so its tilings are weakly aperiodic, and the three-dimensional Socolar-Taylor tile has a periodic stacking direction or is not simply connected. Socolar and Taylor asked in 2012 for a single simply connected three-dimensional prototile that forces nonperiodicity by shape alone. Does one exist?",
      posedBy:
        "Joshua E. S. Socolar and Joan M. Taylor, Forcing nonperiodicity with a single tile, Math. Intelligencer 34 (2012), 18-28",
      yearPosed: 2012,
      model: "GPT-6 Astra",
      modelMaker: "OpenAI",
      humanCollaborators: ["Ioannis Tsiokos"],
      aiRole:
        "The submission records the model's contribution as finding the solid: GPT-6 Astra produced the Chair44 shape. The formalisation, the finite enumerations, the independent Python replay and the write-up are the author's.",
      verification: "lean-checked",
      verificationNote:
        "Audited here on 27 September 2026 from a clone at HEAD. 85 Lean files, 29,815 lines on Lean 4.31.0. Zero real sorry - the single grep hit sits inside a comment - zero axiom declarations, zero unsafe or implemented_by. But thirty-five native_decide calls across twelve files, which the author discloses rather than hides: AXIOMS.md lists the named compiler hook per theorem, README carries a tiered trust ledger (T1 standard axioms, T1n additionally native hooks), the negative controls are diagnostic-checked, and verify/replay.py reconstructs the same finite facts in standard-library Python. The unconditional spine is r44_einstein: existence, no translational period, and symmetry group of order at most 24.\n\nRecorded lean-checked rather than the submitted lean-verified, for two reasons. First, native_decide discharges goals through Lean's compiled evaluator, so the trusted base includes the compiler and runtime and not the kernel alone; the catalog's Dittert and composites-among-xi-7-n entries are labelled the same way for the same reason. Second, lean-verified additionally requires the formal statement to be anchored outside the prover's own repository - a comparator configuration, a Palomar entry or an audit by someone with no stake - and none is present. The repository's only CI workflow builds a reader notebook and is currently failing, so no automated build checks the Lean at all. A comparator or Palomar statement check plus a green Lean build would lift this to lean-verified.",
      resolutionMethod: "construction",
      resolution: "resolved",
      aiContribution: "ai-discovered",
      publication: "preprint",
      significance: 35,
      significanceNote:
        "The three-dimensional form of the einstein problem, asked by name in 2012 and given fresh prominence by the hat in 2023; tiling theory follows it closely and the wider mathematical public knows the two-dimensional version. Level with the Bilu-Linial and Kusner entries at 35, and below the Borsuk frontier's problem at 40, which has a longer literature. The score is for the question, not for the verification level.",
      resultNote:
        "Claimed yes: Chair44 (R44), a rational polyhedral 3-ball built from seven cubes in a chair, whose 24 exposed unit panels carry small square-pyramid features. The claim is that it tiles $\\mathbb R^3$ by congruent copies with reflections allowed, that every such tiling has no translational period and a symmetry group of order at most 24, and that every tiling is homochiral and carries a unique infinite hierarchy of nested supertiles. The features force each tiling onto a registered lattice; the finite facts - dissection, the 44-contact atlas, 33 first shells, a 6,862 to 44 companion census with 299,975 collision boxes, mesh and angle audits - are enumerated exhaustively and checked in Lean, with a second independent Python implementation replaying them.",
      sourceName: "A Strongly Aperiodic Monotile in Three Dimensions, arXiv:2609.19214 (16 September 2026)",
    },
    reviewNote:
      "Approved 27 Sep 2026: Resolved, lean-checked, 35. Socolar-Taylor 2012 confirmed as the posing. Repository cloned at HEAD and counted: 85 files / 29,815 lines / 0 real sorry (the one hit is a comment) / 0 axiom / 0 unsafe / 35 native_decide across 12 files / Lean 4.31.0. DOWNGRADED from the submitted lean-verified: native_decide puts the compiler in the trusted base (Dittert and xi-7 precedent), and there is no statement anchoring outside the author's own repo - no comparator, no Palomar - which lean-verified requires. Also: the only CI workflow is \"Reader notebook\" and its last four runs all FAILED, so nothing builds the Lean. The author's own trust ledger is honest about the hooks and is quoted. Route to lean-verified stated in the message. Not read here: the written geometric argument.",
    message: [
      "Published as Resolved, significance 35, and Lean-checked rather than Lean-verified. The downgrade is the one thing worth reading carefully, because it is not a doubt about your work.",
      "",
      "What the audit found, from a clone at HEAD: 85 Lean files, 29,815 lines, zero real sorry - the single grep hit is inside a comment - zero axiom declarations, zero unsafe. Your AXIOMS.md, the tiered trust ledger and the standard-library Python replay are better documentation of a trust surface than most submissions have, and the entry quotes them.",
      "",
      "Two things separate that from Lean-verified on this site's ladder. First, the thirty-five native_decide calls: they discharge goals through Lean's compiled evaluator, so the trusted base includes the compiler and runtime rather than the kernel alone. You say this yourself, and the catalog labels Dittert's conjecture and the xi-7 composites entry the same way for the same reason. Second, Lean-verified also requires the formal statement to be anchored outside the prover's own repository, by a comparator configuration, a Palomar registry entry, or an audit by someone with no stake. There is none here.",
      "",
      "One practical finding: the repository's only GitHub Actions workflow builds the reader notebook, and its last four runs all failed. Nothing in CI builds the Lean. A workflow that runs the pinned lake build and your controls.sh, plus a comparator or Palomar statement check, would lift this to Lean-verified; message us when both are green.",
      "",
      "The entry records the question as Socolar and Taylor asked it in 2012, with the Schmitt-Conway-Danzer and 3D Socolar-Taylor shortfalls in the statement so a reader sees what \"strongly\" is doing. The result note carries your census numbers and the homochirality and supertile claims.",
    ].join("\n"),
  },
  {
    slug: "hlawka-constants-for-schatten-p-norms-audenaert-kittaneh-problem-7",
    action: "approve",
    reason: "edited",
    edits: {
      field: "Matrix and operator inequalities; Schatten norms",
      fieldGroup: "Analysis",
      verification: "lean-verified",
      verificationNote:
        "Audited here on 27 September 2026 from a clone at commit 1829591: 48 Lean files, 8,711 lines on Lean 4.35.0-rc2; exactly four sorry, all four the deliberate holes in the two Challenge files that the solution files fill, which is the comparator layout Palomar expects; zero axiom declarations, zero native_decide. CI run 35949577091 is green there and audits the four headline theorems to propext, Classical.choice and Quot.sound.\n\nThe submitter notes Palomar last passed its statement check at the earlier commit 79aa498, before the toolchain upgrade, which would normally leave the statements unanchored here. So both Challenge files were fetched at both commits and compared. All four theorem statements are byte-identical. Of the supporting definitions three differ, all cosmetically: N renamed size, and pairGapSum refactored through a new pairGap whose body is size x + size y - size (x + y), the same sum of three pair deficits. The anchoring carries over, which is what lean-verified requires.\n\nNot covered by the four statements, as the submitter says: the bounds 939p/2000 < K_p <= p, library theorems, and the diagonal-to-general step, not in Lean. No human expert has examined the proofs.",
      resolution: "partial",
      significance: 20,
      significanceNote:
        "Problem 7 from Audenaert and Kittaneh's 2012 collection of open problems in matrix and operator inequalities, a source working analysts mine; the problem asks for a best constant and this settles existence and the diagonal case. Level with the catalog's Umans-Wang and Petrykowski entries at 20, and above the Pebody entry at 15 for sitting in a named problem list rather than one paper's final section.",
      publication: "announcement",
      sourceName: "GitHub repository with Lean proof, commit 1829591; Palomar entry PALOMAR-2026-09-25-000006",
    },
    reviewNote:
      "Approved 27 Sep 2026: Partial, lean-verified, 20. Cloned at 1829591: 48 files / 8,711 lines / 4 sorry all in the two Challenge files / 0 axiom / 0 native_decide / Lean 4.35.0-rc2; CI 35949577091 green. THE CHECK: the submitter flagged that Palomar last passed at 79aa498 pre-upgrade. Both Challenge files were fetched at both commits and diffed here - all four theorem statements byte-identical; of the definitions only N->size and pairGapSum refactored through a new pairGap (body size x + size y - size (x+y)), mathematically identical. So the anchoring carries to the reviewed commit and lean-verified stands, with the reasoning written into the note rather than asserted. Partial is the submitter's own correct call: Problem 7 asks for the best constant and the best C_p for general matrices is open. Palomar page returns 200.",
    message: [
      "Published as Partial, Lean-verified, significance 20. Your submission was the most carefully bounded of the nine reviewed today, and two of your own caveats decided the entry.",
      "",
      "First, Partial. You wrote that the README's \"answers their question\" overstates it because Problem 7 asks for the best constant, and used the narrower wording. That is right and the entry keeps it: existence is settled for every p, the diagonal case is sharp for p >= 256, and the best $C_p$ for general matrices is open.",
      "",
      "Second, Lean-verified, and this needed a check rather than a judgement. You noted that Palomar's statement check last passed at 79aa498, before the toolchain upgrade, which would normally mean the statements at the reviewed commit are unanchored - and anchoring is exactly the half of Lean-verified that a kernel cannot supply. So both Challenge files were fetched at both commits and compared here. All four theorem statements are byte-identical. Of the supporting definitions three changed, all cosmetically: N renamed to size, and pairGapSum refactored through a new pairGap whose body is size x + size y - size (x + y), so it is the same sum of three pair deficits. The anchoring carries over, and the note now records that reasoning so a reader does not have to take it on trust.",
      "",
      "The rest of the audit, from a clone at 1829591: 48 files, 8,711 lines, exactly four sorry and all four the deliberate Challenge holes, no axiom declarations, no native_decide, CI green. Re-running Palomar at the current commit would remove the argument above entirely, and is worth doing.",
      "",
      "The two exclusions you list - the 939p/2000 bounds as library theorems, and the diagonal-to-general step not being in Lean - are recorded in the verification note.",
    ].join("\n"),
  },
  {
    slug: "the-laplacian-s-n-n-conjecture-is-true",
    action: "approve",
    reason: "edited",
    edits: {
      name: "The Laplacian $S_{n,n}$ conjecture",
      shortName: "Laplacian $S_{n,n}$ conjecture",
      field: "Spectral graph theory",
      fieldGroup: "Combinatorics",
      statement:
        "The Laplacian matrix of a simple graph on $n$ vertices has $n$ real eigenvalues, the smallest being $0$. The $S_{n,n}$ conjecture asserts that no simple graph on $n \\ge 2$ vertices has Laplacian spectrum exactly $\\{0, 1, 2, \\ldots, n-1\\}$. It was verified for $2 \\le n \\le 15$ and proved for $n \\ge 6{,}649{,}688{,}933$, leaving the range between open. Is the conjecture true?",
      posedBy: "Shaun Fallat, Steve Kirkland, Jason Molitierno and Michael Neumann",
      yearPosed: 2005,
      model: "ChatGPT-6 Astra",
      modelMaker: "OpenAI",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 27 September 2026 against arXiv:2609.26895, posted 22 September. The abstract states the conjecture, records that it was already proved for $2 \\le n \\le 15$ and for $n \\ge 6{,}649{,}688{,}933$, and claims all remaining cases, so the entry's Resolved is the paper's own claim about the full range rather than an extrapolation. The mathematics was not checked here; five days old, no referee, no formalisation. Nathaniel Johnston works in this area.",
      resolutionMethod: "argument",
      resolution: "resolved",
      aiContribution: "ai-co-developed",
      publication: "preprint",
      significance: 22,
      significanceNote:
        "A named conjecture from a 2005 paper by four spectral graph theorists, with the curious shape of having been settled at both ends - small $n$ by computation, astronomically large $n$ by asymptotics - and open only in the middle. A specialist problem: level with the catalog's abelian-envelope entry at 22 and above the eternal-domination entry at 12.",
      resultNote:
        "True: no simple graph on $n \\ge 2$ vertices has Laplacian spectrum $\\{0,1,\\ldots,n-1\\}$. The paper closes the range left between the two previously settled regimes, $n \\le 15$ and $n \\ge 6{,}649{,}688{,}933$.",
      sourceName: "The Laplacian $S_{n,n}$ conjecture is true, arXiv:2609.26895 (22 September 2026)",
    },
    reviewNote:
      "Approved 27 Sep 2026: Resolved, Unreviewed, 22. arXiv:2609.26895 read; abstract confirms the prior partial ranges (n <= 15 computationally, n >= 6,649,688,933 asymptotically) and the claim to close the gap, so Resolved matches the paper. Fallat-Kirkland-Molitierno-Neumann 2005 recorded as posers from the submission and consistent with the S_{n,n} literature. Statement rewritten as a question with the prior ranges visible. Submission had no verificationNote, significance or field; all filled. No Lean. Not checked here: the mathematics.",
    message: [
      "Published as Resolved, Unreviewed, significance 22.",
      "",
      "The abstract does the work that decided the entry: it records that the conjecture was already settled for $n \\le 15$ and for $n \\ge 6{,}649{,}688{,}933$ and claims all the cases between, which is why this is Resolved rather than Partial. That shape, a problem closed at both ends and open only in the middle, is unusual enough that the entry's statement spells it out so a reader sees what was actually left to do.",
      "",
      "Filled in: the field and field group, a statement posed as a question, a significance of 22 with its reasoning, a result note, and a verification note recording what was and was not checked. The mathematics was not checked here and there is no formalisation, so the level is Unreviewed; five days old with no referee.",
      "",
      "If a Lean formalisation appears, or a specialist in spectral graph theory says in public that the argument holds, message us and the level moves.",
    ].join("\n"),
  },
  {
    slug: "matroid-intersection-integrality-gap-is-at-most-k-1-frac-1-k",
    action: "approve",
    reason: "edited",
    edits: {
      name: "The integrality gap of weighted $k$-matroid intersection",
      shortName: "Matroid intersection integrality gap",
      field: "Approximation algorithms; matroid optimisation",
      fieldGroup: "Algorithms & optimization",
      statement:
        "Weighted $k$-matroid intersection asks for a maximum-weight set independent in each of $k$ matroids on a common ground set. The natural linear-programming relaxation optimises over the intersection of the $k$ matroid independence polytopes, and its integrality gap is conjectured to be at most $k-1$. That is known for $k \\le 3$; for $k \\ge 4$ the best general upper bound was $k$. Lee, Sviridenko and Vondrák conjectured further that for weighted $p$-matchoids the gap is exactly $p - 1 + 1/p$. How large is the gap?",
      posedBy:
        "The $k-1$ bound is the standard conjecture for $k$-matroid intersection; the $p-1+1/p$ form for weighted $p$-matchoids is Conjecture 1 of Lee, Sviridenko and Vondrák",
      model: "GPT-5.6 Sol",
      modelMaker: "OpenAI",
      humanCollaborators: ["Yu Cong", "Yajie Zhao"],
      aiRole:
        "From the paper's AI Disclosure: the authors used GPT-5.6 Sol to assist with developing the integrality-gap proof and deriving the local-ratio algorithm.",
      verification: "unreviewed",
      verificationNote:
        "Checked here on 27 September 2026 against arXiv:2609.21477, posted 18 September. The abstract and introduction were read: the $k$-matroid bound improves from $k$ to $k-1+1/k$, short of the conjectured $k-1$, and the $p$-matchoid result attains $p-1+1/p$ with a deterministic LP-relative algorithm, which the paper says resolves the $p$-matchoid part of Lee, Sviridenko and Vondrák's Conjecture 1, projective planes of order $p-1$ giving tight instances where one exists. The AI Disclosure is one sentence and is quoted in the AI role field. The mathematics was not checked here; nine days old, no referee, no formalisation.",
      resolutionMethod: "argument",
      resolution: "partial",
      aiContribution: "ai-assisted",
      publication: "preprint",
      significance: 20,
      significanceNote:
        "The integrality gap of the matroid intersection relaxation is a standard question in approximation algorithms, stuck at the trivial $k$ for every $k \\ge 4$ since Lee, Sviridenko and Vondrák's work; the matchoid half of their Conjecture 1 falls here outright. Level with the catalog's Ryser and Petrykowski entries at 20: a real named target in a working subfield, short of the headline conjecture.",
      resultNote:
        "Partial on the headline conjecture, complete on a named part of another. For weighted $k$-matroid intersection the integrality gap is at most $k - 1 + 1/k$, improving the previous general bound of $k$ but not reaching the conjectured $k-1$. For weighted $p$-matchoids the gap is at most $p - 1 + 1/p$, with a deterministic LP-relative algorithm achieving the same factor; the paper states that this resolves the $p$-matchoid part of Lee, Sviridenko and Vondrák's Conjecture 1, and projective planes of order $p-1$ give tight instances whenever one exists.",
      sourceName: "Integrality-Gap Bounds for Weighted Matchoids and Matroid Intersection, arXiv:2609.21477 (18 September 2026)",
    },
    reviewNote:
      "Approved 27 Sep 2026: Partial, Unreviewed, 20. The submission arrived with almost nothing - no posedBy, no field, no significance, no result note, and a one-line statement that lost the paper's actual shape - so the fields were built from arXiv:2609.21477. The nuance recovered: the k-matroid half is partial (k -> k-1+1/k, conjecture says k-1) but the p-matchoid half RESOLVES the matchoid part of Lee-Sviridenko-Vondrak Conjecture 1, with projective-plane tight instances. Entry name changed from the bare claim to the question. AI Disclosure is a single sentence, quoted. Not checked here: the mathematics.",
    message: [
      "Published as Partial, Unreviewed, significance 20.",
      "",
      "The submission arrived with the statement \"The Integrality Gap of the (weighted) Matroid Intersection polytope is at most $k-1+\\frac{1}{k}$\" and little else, so the entry was built from the paper. That mattered, because the bare claim hides the more interesting half of what you proved. For $k$-matroid intersection your bound improves the general case from $k$ to $k-1+1/k$, which is real progress but short of the conjectured $k-1$, so that part is Partial. For weighted $p$-matchoids you reach $p-1+1/p$ with a deterministic LP-relative algorithm, and the paper says outright that this resolves the $p$-matchoid part of Lee, Sviridenko and Vondrák's Conjecture 1, with projective planes of order $p-1$ giving tight instances. The entry records both, and the result note says which is which.",
      "",
      "Filled in from the paper: the name as a question rather than a claim, the field and field group, the posing, a significance of 22 lowered to 20 with its reasoning, the result note above, and a verification note. Your AI Disclosure is one sentence and is quoted as the AI role.",
      "",
      "If a future version closes the gap to $k-1$, submit it and the resolution moves from Partial to Resolved.",
    ].join("\n"),
  },
  {
    slug: "the-sharp-threshold-for-the-multiplicative-merino-welsh-inequality-on-matroids",
    action: "approve",
    reason: "edited",
    edits: {
      name: "The sharp threshold for the multiplicative Merino-Welsh inequality",
      shortName: "Merino-Welsh sharp threshold",
      field: "Matroid theory; Tutte polynomials",
      statement:
        "Merino and Welsh conjectured that a loopless bridgeless graph satisfies $\\max(T_G(2,0), T_G(0,2)) \\ge T_G(1,1)$. Jackson proved the multiplicative matroid form $T_M(3,0)T_M(0,3) \\ge T_M(1,1)^2$, and the constant 3 was lowered to $2.9243$ and then to $2.355$ by Csikvári. Counterexamples are known below $x_* = 2.2266815969\\ldots$, the largest real root of $x^3 = 9(x-1)$, and Csikvári conjectured in 2025 that $x_*$ is exactly the threshold: does $T_M(x_*,0)T_M(0,x_*) \\ge T_M(1,1)^2$ hold for every finite matroid without loops or coloops?",
      posedBy:
        "Péter Csikvári, Conjecture 7.1 of Around the Merino-Welsh conjecture: improving Jackson's inequality (arXiv:2502.19196, 2025); the underlying conjecture is Merino and Welsh's",
      yearPosed: 2025,
      verification: "unreviewed",
      verificationNote:
        "Checked here on 27 September 2026. Csikvári's Conjecture 7.1 was located in arXiv:2502.19196v2, the version the submission links, and the Zenodo record 22911905 of 23 September was read: the threshold is stated as $x_* = 2.2266815969\\ldots$, the largest real root of $x^3 = 9(x-1)$, with the quantitative bound on $2 \\le x \\le x_*$ and sharpness of the exponential rate from parallel doublings of uniform matroids. The tools named are a weighted broken-circuit comparison, the Cunningham-Edmonds decomposition and exact polynomial checks of a finite rational replacement table; the table and a checker are in the linked V1.1 release. The mathematics was not checked here, the rational table was not recomputed, and the author's own note is correct that critical AI reviews are not verification. Four days old, no referee.",
      resolutionMethod: "argument",
      resolution: "resolved",
      significance: 14,
      significanceNote:
        "The Merino-Welsh conjecture is a well-known problem about Tutte polynomials, but the specific threshold conjecture answered here was stated nineteen months ago in one paper's final section, and the graph case at $x=2$ - the conjecture people actually quote - stays open. Level with the catalog's biological-unavoidability entry at 14: a precisely posed, genuinely open question from a recent paper. The score is for the question's standing, not for the work.",
      sourceName: "Zenodo preprint V1, record 22911905 (23 September 2026), with verification code in the V1.1 release",
    },
    reviewNote:
      "Approved 27 Sep 2026: Resolved, Unreviewed, 14. Csikvari Conjecture 7.1 located in arXiv:2502.19196v2 as the submission says; Zenodo 22911905 read (threshold x_* = 2.2266815969..., largest real root of x^3 = 9(x-1); quantitative bound on [2, x_*]; sharpness by parallel doublings of uniform matroids). Statement rewritten to carry the Jackson 3 -> 2.9243 -> 2.355 -> x_* chain so the reader sees why x_* is the sharp candidate. Significance 14 because the threshold conjecture is 19 months old and the graph case at x=2 remains open, which the entry says. Same submitter as the magnitude-continuity entry of 22 Sep. Not checked here: the mathematics and the rational replacement table.",
    message: [
      "Published as Resolved, Unreviewed, significance 14.",
      "",
      "Csikvári's Conjecture 7.1 was located in the arXiv version you linked, and the Zenodo record was read: the threshold, the quantitative bound on $[2, x_*]$, and the sharpness of the exponential rate from parallel doublings of uniform matroids. Your own verification note is accurate about what the critical AI reviews are and are not, which made the entry easy to write honestly.",
      "",
      "The statement was rewritten to carry the chain that makes $x_*$ the interesting number: Jackson's 3, then $2.9243$, then your $2.355$, then $x_*$ with counterexamples below it. Without that a reader cannot see why the threshold is sharp rather than merely another improvement.",
      "",
      "On the score, since it is lower than the work might suggest: significance measures how much mathematics cared about the question before the answer. The Merino-Welsh conjecture is well known, but the specific threshold conjecture is nineteen months old and sits in one paper's final section, and the graph case at $x = 2$ - the statement people quote - is untouched, as your result note says. That places it at 14, level with another recent-paper question. It is not a judgement on the proof.",
      "",
      "Recomputing the rational replacement table independently, or a Lean formalisation of the finite checks, would move the verification level.",
    ].join("\n"),
  },
  {
    slug: "exact-thue-morse-matching-heights-in-an-avoiding-population",
    action: "approve",
    reason: "edited",
    edits: {
      shortName: "Thue-Morse matching heights",
      field: "Combinatorics on words; infinite labelled graphs",
      fieldGroup: "Combinatorics",
      verification: "lean-checked",
      verificationNote:
        "Checked here on 27 September 2026. GitHub Actions run 36116271138 is green at the pinned commit 19544a4d, under a workflow named Verify, which is what the submission claims. The audited endpoints named in the submission - FullHeight.height_isMaximum, height_formula, height_closed_form, DigitRecurrence.actual_digit_recurrence and evaluate_isMaximum - concern actual matching paths and attained maxima rather than a relaxation, and the permitted logical axioms are propext, Classical.choice and Quot.sound. Lean-checked rather than Lean-verified: the statements are anchored only by the project's own agent review, which the submitter correctly says is not independent, and the site did not rebuild the development. The underlying graph and target are those of the catalog's classification entry, and the question answered is the one raised in Section 5 of the manuscript behind it.",
      resolution: "candidate",
      significance: 5,
      significanceNote:
        "A sharp quantitative question raised in the final section of a manuscript published weeks earlier, answered by a different person with a formal proof. Precisely posed and genuinely open, but with no literature behind it: the band the catalog uses for a conjecture stated in one recent paper and settled shortly after, level with the fifth-order autocorrelation entry at 4 plus a little for the Lean work and the sharpness claim.",
      sourceName: "Public research note with Lean proofs at pinned commit 19544a4d, verified by GitHub Actions run 36116271138",
    },
    reviewNote:
      "Approved 27 Sep 2026: Candidate, lean-checked, 5. CI run 36116271138 confirmed green at commit 19544a4d under workflow \"Verify\". The question is Section 5 of the avg-netizen manuscript behind classification-of-biologically-unavoidable-sequences (published here 22 Sep), so this is a follow-up by a DIFFERENT account to someone else's very recent question - the U30 shape, hence significance 5 rather than a decline. Kept lean-checked, not lean-verified: statement anchoring is the project's own agent review, which the submitter himself says is not independent, and the site did not rebuild. The submitter's note about the Alexander video is sensible and the entry does not rely on it. Not checked here: the mathematics.",
    message: [
      "Published as Candidate, Lean-checked, significance 5.",
      "",
      "Your submitter note did most of the reviewer's work, and it was right on each point. The question is the one in Section 5 of the other manuscript, not Alexander's original classification; the video is supplementary and unauthenticated, so the entry rests on the written manuscript alone; and internal agent review is not outside expert verification, so the level stays Lean-checked rather than Lean-verified. That last point is what separates the two levels here: anchoring has to come from outside the prover.",
      "",
      "What was checked: GitHub Actions run 36116271138 is green at the pinned commit under a workflow named Verify, and the audited endpoints you name concern actual matching paths and attained maxima rather than a relaxation, with only the three standard axioms. That is a clean artefact.",
      "",
      "On the score. Significance measures how much mathematics cared about the question before the answer, and this one was raised weeks ago in one manuscript's final section, so it sits at 5, in the same band as another recent-paper question the catalog holds at 4. The sharpness claim and the Lean work are why it is not lower. It is not a comment on the quality of the proof.",
      "",
      "Fields filled: the field and field group, a short name, the verification and significance notes, and a source name that pins the commit and the CI run.",
    ].join("\n"),
  },
  {
    slug: "formal-verification-of-phase-mediated-attractor-dynamics-pmad-in-lean-4",
    action: "decline",
    reason: "no-open-question",
    reviewNote:
      "Declined 27 Sep 2026, no-open-question. The repository was read: PMADLean/Axioms.lean declares ZERO Lean axioms - its \"axioms\" are definitions (PhaseState, Trajectory, IsDynamicallyStable, AttractorSet, UbiquitousResonance) - so the development really is sorry-free over Mathlib, and the README's 17,498-job clean build is plausible. That is not the problem. posedBy is the submitter and yearPosed is 2026: there is no previously-posed open question from anyone else, and what Lean certifies is that consequences follow from definitions the author chose, which is formalisation of his own framework rather than the resolution of an open problem. It is also physics. Same call as the site gave the gravity papers offered by another correspondent in September. Declined with the route back stated: a named open problem attributed to someone else, or a mathematical statement in the framework that a third party had posed.",
    message: [
      "Declined, and not for the quality of the Lean.",
      "",
      "The repository was read rather than skimmed. PMADLean/Axioms.lean declares no Lean axioms at all - PhaseState, Trajectory, IsDynamicallyStable, AttractorSet and UbiquitousResonance are definitions - so the development genuinely is sorry-free over Mathlib, and a clean build of that size is real work.",
      "",
      "The catalog records solutions to open mathematical problems that were posed by someone, were open, and were then answered with AI involvement. Here the posing field is your own name and the year is 2026. What Lean certifies is that your conclusions follow from definitions you chose, which is a formalisation of your own framework rather than the resolution of an open problem. The subject is also physics, and the site stays on the mathematics side of that line even where the physics carries theorems.",
      "",
      "What would be in scope: a statement inside the framework that somebody else had posed and left open - a named conjecture, a problem from a published list - answered with this machinery. If one of the intermediate results settles such a question, submit that result on its own and it will be reviewed on its merits. A Lean development of this size behind it would start from a strong position.",
      "",
      "Zenodo and SSRN already give the work a citable home, which is the other thing people usually want from a listing here.",
    ].join("\n"),
  },
];

// ---------------------------------------------------------------------------
// The one contact message has no account behind it, so it cannot be answered
// in-app. The script prints an email draft and marks the row handled.

const EMAIL = {
  id: "d6679577",
  to: "ben-bassat@math.haifa.ac.il",
  subject: "VibeMathed: no, we do not Lean-verify submissions for you",
  body: [
    "Thanks for asking before submitting - it is the right question, and the answer is no.",
    "",
    "The site is a catalog. It records results that were obtained with AI involvement and audits the evidence a submitter supplies: the paper, the AI disclosure, and any formal proof or code that comes with it. Nobody here formalises a submission on the submitter's behalf, and there is no queue that picks up accepted entries and tries to prove them in Lean. If an entry says Lean-verified, that is because its author supplied a machine-checked proof and the statement was anchored outside their own repository.",
    "",
    "So a submission with no formal proof is entered at Unreviewed or, once a named expert with no stake has checked it, at Expert-verified. That is not a mark against it: most entries in the catalog have no Lean at all. The verification field is a description of what exists, not a hurdle.",
    "",
    "Two things that may be useful. If your result already has a Lean development, link it and say which commit and which theorem, and it will be audited. If it does not, submit it as it stands; the entry will record the level honestly and can be raised later if a formalisation or an expert reading appears.",
    "",
    "The criteria are at vibemathed.com/methodology.",
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
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 58)}`);
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
  console.log(`EMAIL    ${EMAIL.to}  ${charLength(canonical(EMAIL.body))} chars`);
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
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: cur.sourceUrl });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 56)} -> merged check: ${v.length ? "FAILED" : "ok"}${d.links?.length ? `  +${d.links.length} links` : ""}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    const msg = await prisma.$queryRawUnsafe<{ id: string; userId: string | null }[]>(
      `SELECT id, "userId" FROM "SiteMessage" WHERE id::text LIKE $1 || '%' AND status = 'open'`,
      EMAIL.id,
    );
    if (msg.length !== 1) throw new Error(`${EMAIL.id}: matched ${msg.length} open messages, expected 1`);
    if (msg[0].userId) console.log(`\nNOTE: ${EMAIL.id} has an account after all; an in-app reply would reach them`);
    console.log(`\nEMAIL    ${EMAIL.id} -> ${EMAIL.to} (no account: draft printed, row marked handled)`);

    if (!APPLY) {
      console.log("\n" + "=".repeat(70));
      console.log(`To: ${EMAIL.to}\nSubject: ${EMAIL.subject}\n\n${EMAIL.body}`);
      console.log("=".repeat(70));
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

    await prisma.siteMessage.update({
      where: { id: msg[0].id },
      data: { status: "handled", handledAt: new Date() },
    });
    console.log(`handled (email drafted): ${EMAIL.id}`);

    console.log("\n" + "=".repeat(70));
    console.log("SEND THIS BY HAND - the site cannot send mail");
    console.log("=".repeat(70));
    console.log(`To: ${EMAIL.to}\nSubject: ${EMAIL.subject}\n\n${EMAIL.body}`);
    console.log("=".repeat(70));
    console.log("\nAPPLIED. New entries render on first request; the lists and stats lag");
    console.log("by up to an hour, or until a deploy. Held and declined rows are not public.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
