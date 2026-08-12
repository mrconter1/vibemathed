// Import for the 12 Aug 2026 three-day sweep: fifteen entries.
//
// Every disclosure quoted in `aiRole` was read out of the paper's own full
// text, not out of the scan summary - the scan truncates mid-sentence and
// twice that truncation would have changed the tier.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const CURATOR_EMAIL = "rasmus.lindahl1996@gmail.com";

type Entry = {
  slug: string;
  name: string;
  shortName: string;
  field: string;
  fieldGroup: string;
  statement: string;
  posedBy: string;
  yearPosed: number;
  solveType: "proved" | "disproved";
  solveDate: string;
  model: string;
  modelMaker: string | null;
  humanCollaborators: string[];
  aiRole: string;
  verification: string;
  verificationNote: string;
  publication: string;
  resolutionMethod: string;
  resolution: string;
  aiContribution: string;
  sourceUrl: string;
  sourceName: string;
  resultNote?: string;
  ageNote?: string;
  significance: number;
  significanceNote: string;
};

const FRESH_PREPRINT =
  "A preprint days old, with no independent review.";

const ENTRIES: Entry[] = [
  // ---------------------------------------------------------------- tier A
  {
    slug: "kim-roush-permanent-odd-order",
    name: "The Kim-Roush Conjecture on the Maximum of per(I-A) in Odd Order",
    shortName: "Kim-Roush permanent conjecture",
    field: "Matrix theory",
    fieldGroup: "Algebra",
    statement:
      "For the set of n by n doubly stochastic matrices, Kim and Roush conjectured in 1981 that for odd n = 2k+1 > 1 the maximum of per(I-A) equals 3 times 2^(k-2), attained by an explicit block construction. Proved in full, and the maximizers are classified: they are exactly the simultaneous-permutation conjugates of that construction.",
    posedBy: "Ki Hang Kim, Fred W. Roush",
    yearPosed: 1981,
    solveType: "proved",
    solveDate: "2026-08-09",
    model: "GPT-5.6 Sol and Claude Fable 5",
    modelMaker: "OpenAI, Anthropic",
    humanCollaborators: ["Yair Lavi"],
    aiRole:
      'The acknowledgments are one sentence and leave nothing to interpret: "The proof of this conjecture was carried out by GPT-5.6-sol and Claude Fable 5, under the guidance of the author. The author has reviewed the resulting proof arguments. Responsibility for the final text rests with the author."',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.08933",
    sourceName: "arXiv",
    resultNote:
      "Kim and Roush did not claim uniqueness; the classification of equality cases is new alongside the conjecture itself.",
    ageNote:
      "Open since 1981, and carried forward as an open problem in Minc's survey of permanent problems and in the Cheon-Wanless 2005 update of it.",
    significance: 20,
    significanceNote:
      "A named conjecture standing 45 years in the permanent literature, kept alive on Minc's recognized list of open problems involving permanents.",
  },
  {
    slug: "bounded-oracle-noise-nonconvex-lower-bound",
    name: "Bounded Oracle Error in Nonconvex Stochastic Optimization",
    shortName: "Bounded oracle error question",
    field: "Stochastic optimization",
    fieldGroup: "Algorithms & optimization",
    statement:
      "Arjevani et al. asked whether almost-surely bounded oracle error permits a better rate than bounded variance for smooth nonconvex stochastic optimization. It does not: every randomized adaptive algorithm still needs Omega(dL/eps^2 + dL sigma^2/eps^4) queries, matching the standard upper bound.",
    posedBy: "Yossi Arjevani, Yair Carmon, John C. Duchi, Dylan J. Foster, Nathan Srebro, Blake Woodworth",
    yearPosed: 2023,
    solveType: "proved",
    solveDate: "2026-08-10",
    model: "GPT-5.6 Sol",
    modelMaker: "OpenAI",
    humanCollaborators: ["Jikai Jin"],
    aiRole:
      'Stated in the abstract itself, not buried in an acknowledgment: "The proof was independently generated with GPT-5.6 Sol in Codex\'s Ultra mode during a two-hour session. The human author supplied the prompt and was responsible only for checking the proof and revising and polishing the manuscript."',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.09004",
    sourceName: "arXiv",
    ageNote:
      "Raised in the 2023 lower-bound paper that set the standard framework for nonconvex stochastic optimization rates.",
    significance: 12,
    significanceNote:
      "A question posed explicitly in a well-cited lower-bounds paper, familiar to the optimization-theory community but recent and specialist.",
  },
  {
    slug: "kozerenko-skochko-imbalance-conjecture",
    name: "The Imbalance Conjecture",
    shortName: "Imbalance conjecture",
    field: "Graph theory",
    fieldGroup: "Combinatorics",
    statement:
      "The imbalance of an edge uv of a finite simple graph is the absolute difference of the degrees of u and v. Kozerenko and Skochko conjectured that the multiset of all edge imbalances is graphic - realizable as the degree sequence of some graph - whenever every edge has positive imbalance. Proved.",
    posedBy: "Sergiy Kozerenko, Volodymyr Skochko",
    yearPosed: 2013,
    solveType: "proved",
    solveDate: "2026-08-10",
    model: "GPT-5.6 Sol Max",
    modelMaker: "OpenAI",
    humanCollaborators: ["Yousof Yavari"],
    aiRole:
      'The generative-AI disclosure says the model was asked to solve the problem outright: "The proof presented in this manuscript was generated using OpenAI\'s GPT-5.6 Sol with the max reasoning setting (\\"GPT-5.6 Sol Max\\") after Yousof Yavari prompted the model to solve the question addressed in this manuscript. Yousof Yavari subsequently revised and edited the proof, added further details, and clarified its exposition."',
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. The author credits Eric Hou with independently verifying the proof, which is a second reader rather than the kind of review that moves an entry up the ladder.",
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.09191",
    sourceName: "arXiv",
    resultNote:
      "The key step is a lower bound on the truncated imbalance sum, which yields every Erdos-Gallai inequality for the sorted imbalance list; a parity computation finishes it.",
    significance: 10,
    significanceNote:
      "A specialist graph-theory conjecture with a small but real literature descending from Albertson's irregularity of a graph.",
  },
  {
    slug: "anstee-sali-conjecture",
    name: "The Anstee-Sali Conjecture on Forbidden Configurations",
    shortName: "Anstee-Sali conjecture",
    field: "Extremal set theory",
    fieldGroup: "Combinatorics",
    statement:
      "For a forbidden configuration F, the Anstee-Sali conjecture predicts that forb(m, F) is Theta(m^(X(F)-1)), where X(F) comes from an explicit product construction. Disproved: the 4-uniform family on six vertices formed by a two-vertex core joined to the edges of a 4-cycle has X(F) = 4, so the conjecture predicts Theta(m^3), while a random-alteration argument gives Omega(m^(10/3)).",
    posedBy: "Richard Anstee, Attila Sali",
    yearPosed: 2005,
    solveType: "disproved",
    solveDate: "2026-08-07",
    model: "GPT-5.6 Sol",
    modelMaker: "OpenAI",
    humanCollaborators: ["Pei Wu"],
    aiRole:
      'The abstract ends "The example was found by GPT-5.6 Sol", and a dedicated disclosure section repeats it: "The authors used GPT-5.6 Sol for finding the example. The authors reviewed and revised all outputs, verified results, and take full responsibility for the final manuscript."',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.07646",
    sourceName: "arXiv",
    ageNote:
      "The organizing conjecture of the forbidden-configurations programme, tracked for two decades in Anstee and Sali's dynamic survey in the Electronic Journal of Combinatorics.",
    significance: 20,
    significanceNote:
      "The central conjecture of a named research programme with its own long-running dynamic survey, well known inside extremal set theory and invisible outside it.",
  },
  {
    slug: "wu-santhanam-diagonalizability-prediction",
    name: "Predicting Diagonalizability of a Mean Matrix",
    shortName: "Diagonalizability prediction",
    field: "Statistical learning theory",
    fieldGroup: "Probability & statistics",
    statement:
      "Wu and Santhanam asked whether one can determine, from an increasing i.i.d. sample of binary random matrices, whether the unknown mean matrix is diagonalizable, while making only finitely many errors almost surely. Answered affirmatively over both R and C.",
    posedBy: "Yuheng Wu, Narayana Santhanam",
    yearPosed: 2024,
    solveType: "proved",
    solveDate: "2026-08-11",
    model: "GPT-5.6 Sol Ultra",
    modelMaker: "OpenAI",
    humanCollaborators: ["Jinze Zhao"],
    aiRole:
      'A disclosure section of its own: "The proof strategy and counterexample were produced by OpenAI\'s GPT-5.6 Sol Ultra through Codex in response to prompts from the author. Codex was also used to revise the exposition and prepare the LaTeX manuscript. The author selected the problem, directed the interactions and revisions, and is the sole named author."',
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. The paper says so itself: \"This disclosure is not a substitute for independent expert mathematical review.\"",
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.10482",
    sourceName: "arXiv",
    resultNote:
      "The general principle is the interesting part: every semialgebraic property of a bounded fixed-dimensional mean parameter is eventually almost surely predictable. Against merely integrable matrix laws it fails from dimension two.",
    significance: 8,
    significanceNote:
      "A recent question from a single specialist paper on eventually-almost-sure prediction, with a real but small audience.",
  },
  {
    slug: "zonoid-volume-log-submodularity",
    name: "Log-Submodularity of Zonoid Volume",
    shortName: "Zonoid log-submodularity",
    field: "Convex geometry",
    fieldGroup: "Geometry & topology",
    statement:
      "The conjecture that volume is log-submodular under Minkowski addition on zonoids, that is |A||A+B+C| <= |A+B||A+C|. Disproved by a four-dimensional zonotope generated by a 2-modular matrix together with two segments. Several related local mixed-volume, local Loomis-Whitney, projection-volume-ratio and volume-to-surface-area conjectures fall with it.",
    posedBy: "Stated as Conjecture 4.16 in the zonoid-inequality literature",
    yearPosed: 2023,
    solveType: "disproved",
    solveDate: "2026-08-07",
    model: "GPT-5.6 Pro",
    modelMaker: "OpenAI",
    humanCollaborators: ["Ruben Skorupinski"],
    aiRole:
      'The paper has a section called How the counterexample was found. The author proved the unimodular case and identified 2-modular matrices as the place to look; then "Chat-GPT was then used to search for a counterexample within the space of the 2-modular matrices which led to the discovery of the counterexample within a specific class of 2-modular matrices". The acknowledgment is more conservative, crediting GPT-5.6 Pro with "literature searches and exploratory volume computations of 2-modular zonotopes", all independently verified by the author. Classified on the lower of the two readings.',
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. The counterexample is an explicit finite object and the volumes are exactly computable, so it is checkable by anyone who wants to, but nobody independent has done so.",
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.07702",
    sourceName: "arXiv",
    resultNote:
      "The paper also proves the conjecture in the unimodular case and characterizes equality there, so the boundary between true and false is drawn rather than just crossed.",
    significance: 12,
    significanceNote:
      "A recent named conjecture in convex geometry whose failure also takes down several companion inequalities in the same programme.",
  },
  {
    slug: "lions-maximal-regularity-half-holder",
    name: "Lions' Maximal Regularity Problem at the Half-Holder Endpoint",
    shortName: "Lions' maximal regularity problem",
    field: "Evolution equations",
    fieldGroup: "Differential equations",
    statement:
      "Lions asked whether the variational solution of a non-autonomous divergence-form problem has maximal L2-regularity under Holder continuity in time of the coefficients. Disproved at the half-Holder endpoint: a bounded, uniformly elliptic, real scalar coefficient, half-Holder in time and arbitrarily close to the heat equation, whose Lions solution has a time derivative that is not square integrable.",
    posedBy: "Jacques-Louis Lions",
    yearPosed: 1961,
    solveType: "disproved",
    solveDate: "2026-08-11",
    model: "GPT-5.5 Pro",
    modelMaker: "OpenAI",
    humanCollaborators: ["Lukas Niebel"],
    aiRole:
      'The Declaration of AI Use: "During an exploratory analysis, a first counterexample was found by OpenAI\'s GPT-5.5 Pro in two dimensions and on the full space. It was then verified and studied by the author, who simplified it and reduced it to the one-dimensional interval counterexample presented here." GPT-5.6 Sol was separately used for drafting and revision of the exposition.',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.11194",
    sourceName: "arXiv",
    resultNote:
      "Tensorisation and parabolic rescaling carry the one-dimensional example to real symmetric isotropic counterexamples on R^d and on every bounded domain, in every dimension.",
    ageNote:
      "A problem of Lions from the early 1960s, worked on continuously since, with a substantial modern literature on which regularity hypotheses suffice.",
    significance: 25,
    significanceNote:
      "A named problem of Lions with sixty years of attack and a current research literature devoted to locating exactly where maximal regularity fails.",
  },
  {
    slug: "stepsize-acceleration-lower-bound",
    name: "Lower Bounds for Stepsize-Based Acceleration of Gradient Descent",
    shortName: "Stepsize acceleration lower bound",
    field: "Convex optimization",
    fieldGroup: "Algorithms & optimization",
    statement:
      "Carefully designed stepsize schedules alone accelerate plain gradient descent beyond its textbook O(1/T) rate, without momentum. Whether they can reach the optimal O(T^-2) was open. A lower bound of Omega(T^-1.9319) for last-iterate convergence under predetermined nonnegative stepsize schedules says they cannot.",
    posedBy: "Raised by the silver-stepsize line of work following Altschuler and Parrilo",
    yearPosed: 2023,
    solveType: "proved",
    solveDate: "2026-08-11",
    model: "GPT-5.6 Sol Pro",
    modelMaker: "OpenAI",
    humanCollaborators: ["Jianhao Ma", "Yuxin Chen"],
    aiRole:
      'The abstract closes with it: "The proof was developed by GPT-5.6 Sol Pro under the authors\' guidance." The authors added material to make the proof correct and readable, and separately used Codex to formalize the proof in Lean 4.',
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. A Lean 4 formalization by Codex is linked from the paper, but it is the same pipeline that produced the proof, so it is not independent confirmation.",
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "partial",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.10418",
    sourceName: "arXiv",
    resultNote:
      "Recorded as partial: the bound is Omega(T^-1.9319) against an achievable O(T^-1.2716), so it rules out reaching the optimal rate without pinning down the true one.",
    significance: 10,
    significanceNote:
      "An open direction in a currently active corner of convex optimization, a few years old and confined to that community.",
  },
  {
    slug: "monotone-vi-pth-order-complexity",
    name: "pth-Order Oracle Complexity for Monotone Variational Inequalities",
    shortName: "Monotone VI complexity",
    field: "Variational inequalities",
    fieldGroup: "Algorithms & optimization",
    statement:
      "Monteiro and Svaiter gave a second-order method for smooth monotone variational inequalities converging at O(T^-1.5), later improved to O(T^-1.75) for the convex-concave minimax subset. Whether the conjectured complexity for general monotone variational inequalities could be improved was open. A large-step inexact Halpern iteration achieves O(T^-2), and O(T^-p) at pth order.",
    posedBy: "Renato D. C. Monteiro, Benar F. Svaiter",
    yearPosed: 2012,
    solveType: "proved",
    solveDate: "2026-08-09",
    model: "Claude Opus 4.6 and GPT-5.6 Sol",
    modelMaker: "Anthropic, OpenAI",
    humanCollaborators: [
      "Lesi Chen",
      "Xinliang Zhang",
      "Hengyu Wang",
      "Chengchang Liu",
      "Yongchao Chen",
      "Jingzhao Zhang",
    ],
    aiRole:
      "The paper records the sequence: an O(T^-(p-1)) rate was obtained with Claude Opus 4.6, and on verifying it the authors conjectured a better O(T^-p) result, for which Xinliang Zhang then found a proof with GPT-5.6 Sol. The results were subsequently verified by the human authors, who also link the model's initial proof as a public ChatGPT transcript.",
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. The initial AI proof is published as a shareable transcript, which is unusual and welcome, but it is a record of provenance rather than a check by anyone independent.",
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-discovered",
    sourceUrl: "https://arxiv.org/abs/2608.08463",
    sourceName: "arXiv",
    resultNote:
      "Improves every prior result for p >= 2 and matches the classical extragradient method at p = 1.",
    significance: 12,
    significanceNote:
      "An explicitly stated open question in the higher-order-methods literature, resting on a well-cited Monteiro-Svaiter framework but confined to optimization theory.",
  },

  // ---------------------------------------------------------------- tier B
  {
    slug: "ellipsoid-fitting-conjecture",
    name: "The Ellipsoid Fitting Conjecture",
    shortName: "Ellipsoid fitting conjecture",
    field: "Random matrix theory",
    fieldGroup: "Probability & statistics",
    statement:
      "Given n independent standard Gaussian vectors in R^d, an ellipsoid fit is a positive semidefinite S with x_i' S x_i = d for every i. Saunderson, Parrilo and Willsky conjectured that this semidefinite feasibility problem has a sharp threshold at n ~ d^2/4. Proved: below the threshold a fit exists with probability tending to one, above it none does.",
    posedBy: "James Saunderson, Pablo A. Parrilo, Alan S. Willsky",
    yearPosed: 2013,
    solveType: "proved",
    solveDate: "2026-08-10",
    model: "GPT-5.6",
    modelMaker: "OpenAI",
    humanCollaborators: ["Theodor Misiakiewicz", "Garrett G. Wen"],
    aiRole:
      'The approach is the authors\' own - they say so, and trace it to the dual formulation of Bandeira and Maillard. What the model did is named step by step: ChatGPT 5.4 and 5.5 were used "to explore several possible proof strategies", and then, "Given an earlier draft, GPT 5.6 helped repair and complete several arguments, including the tightened head-tail decomposition in Lemma 3.5 and the decomposition used in the proof of Proposition 4.4, which ultimately led to the completion of the proofs."',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.10184",
    sourceName: "arXiv",
    resultNote:
      "Closes both gaps left open by Bandeira and Maillard: exact fitting, and removal of the operator-norm constraint. The threshold turns out to be governed by the statistical dimension d(d+1)/4 of the PSD cone.",
    ageNote:
      "Conjectured around 2013 and attacked steadily since, with a sequence of teams narrowing the constant before the sharp threshold fell.",
    significance: 30,
    significanceNote:
      "A conjecture with a decade of documented attack by multiple groups and a settled place in the literature on semidefinite programming and random geometry.",
  },
  {
    slug: "amenability-base-field-independence",
    name: "Whether Amenability of an Algebra Depends on the Ground Field",
    shortName: "Amenability and the base field",
    field: "Noncommutative algebra",
    fieldGroup: "Algebra",
    statement:
      "Cornulier asked, in a MathOverflow discussion, whether amenability of a module over an associative algebra depends on the ground field. It does not: the notion is invariant under change of base field.",
    posedBy: "Yves Cornulier",
    yearPosed: 2015,
    solveType: "proved",
    solveDate: "2026-08-08",
    model: "ChatGPT 5.6 Sol",
    modelMaker: "OpenAI",
    humanCollaborators: ["Be'eri Greenfeld"],
    aiRole:
      'The abstract states it plainly: "A significant part of the argument is based on ideas of ChatGPT 5.6 Sol." The author goes further in a footnote on the title page: "While it is currently prohibited by arXiv policy to list AI as a coauthor, the (human) coauthor is confident that ChatGPT\'s contribution merits an author credit."',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "argument",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.08161",
    sourceName: "arXiv",
    resultNote:
      "The footnote is worth reading on its own: an author saying in print that the model earned coauthorship and that policy is what prevents it.",
    significance: 10,
    significanceNote:
      "A MathOverflow question from a well-known mathematician: documented and real, but never a programme with a literature behind it.",
  },
  {
    slug: "hyperkahler-period-index-conjecture",
    name: "The Hyperkahler Period-Index Conjecture",
    shortName: "Hyperkahler period-index",
    field: "Algebraic geometry",
    fieldGroup: "Geometry & topology",
    statement:
      "Huybrechts conjectured that for every Brauer class alpha on a hyperkahler variety X, the index divides the period raised to the power dim(X)/2, strengthening the usual period-index conjecture. Disproved on certain hyperkahler fourfolds, in both the K3^[2] and Kum^2 deformation types.",
    posedBy: "Daniel Huybrechts",
    yearPosed: 2019,
    solveType: "disproved",
    solveDate: "2026-08-10",
    model: "Unspecified",
    modelMaker: null,
    humanCollaborators: ["Pieter Belmans", "James Hotchkiss"],
    aiRole:
      'The AI disclosure names the role precisely while leaving the model unnamed: "The starting points for this paper were two different LLM-assisted constructions of counterexamples, obtained independently by the authors. The paper is the synthesis of these constructions, with LLMs used to help with the copyediting." Two authors reaching counterexamples independently with model help is a stronger signal than either would be alone.',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.09436",
    sourceName: "arXiv",
    resultNote:
      "The counterexamples come with divisibility bounds on the Hodge-theoretic index, at 2-torsion and 5-torsion, on very general hyperkahler fourfolds.",
    significance: 22,
    significanceNote:
      "A conjecture by a leading figure strengthening the period-index conjecture, well known within hyperkahler geometry and Brauer-group theory.",
  },
  {
    slug: "steklov-isospectral-convex-plane-domains",
    name: "The Planar Steklov Analogue of Kac's Question",
    shortName: "Steklov-isospectral domains",
    field: "Spectral geometry",
    fieldGroup: "Analysis",
    statement:
      "Can one hear the shape of a drum, in the Steklov setting and in the plane? No: there exist pairs of noncongruent bounded plane domains with identical Steklov spectra including multiplicities, simply connected, strictly convex, with real-analytic boundaries, and arbitrarily close to a disk in the C-infinity topology.",
    posedBy: "The Steklov analogue of Kac's question, raised in the Girouard-Polterovich problem literature",
    yearPosed: 2017,
    solveType: "disproved",
    solveDate: "2026-08-11",
    model: "ChatGPT",
    modelMaker: "OpenAI",
    humanCollaborators: ["Tao Hu", "Jiachen Shi", "Quanyu Tang"],
    aiRole:
      'The division of labour is set out in the AI statement: the idea of adapting the Sunada construction of Gordon, Webb and Wolpert to the planar Steklov problem "was proposed by the authors". From there, "ChatGPT provided substantial assistance in developing the concrete counterexample construction, including the passage from the orbifold construction to weighted Steklov problems on the disk and their subsequent realization by Euclidean plane domains. It also assisted with several technical arguments." The authors checked, revised and rewrote the arguments.',
    verification: "unreviewed",
    verificationNote: FRESH_PREPRINT,
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.10557",
    sourceName: "arXiv",
    resultNote:
      "Strict convexity and real-analytic boundaries are what make this sharp: the classical Gordon-Webb-Wolpert drums are non-convex polygons, so the obvious escape routes are closed off.",
    significance: 25,
    significanceNote:
      "The Steklov descendant of Kac's famous question, a standing open problem in the spectral-geometry problem lists with a substantial surrounding literature.",
  },
  {
    slug: "planar-berenstein-conjecture",
    name: "The Planar Berenstein Conjecture",
    shortName: "Planar Berenstein conjecture",
    field: "Overdetermined boundary problems",
    fieldGroup: "Analysis",
    statement:
      "The unrestricted planar Berenstein conjecture holds that overdetermined Dirichlet-Neumann data characterize the disc. Disproved: a bounded simply connected domain with real-analytic Jordan boundary that is not a disc, carrying a nonzero real eigenfunction with zero Dirichlet data and constant nonzero Neumann data.",
    posedBy: "Carlos A. Berenstein",
    yearPosed: 1980,
    solveType: "disproved",
    solveDate: "2026-08-09",
    model: "ChatGPT 5.6",
    modelMaker: "OpenAI",
    humanCollaborators: ["Matthew J. Colbrook", "Siavash Sadeghi", "George Stepaniants"],
    aiRole:
      'The authors declare the role and are careful about its limits: "We believe it is important to declare the use of AI in mathematical research, and in the present case its role is particularly noteworthy. ChatGPT 5.6 was given a substantial warm start consisting of an early draft and working code independently developed by MJC and GS" for the earlier Pompeiu-Schiffer paper, material that "already contained the central construction, conformal fixed-disc formulation, coefficient spaces, disk-polynomial algebra, tail strategy, and computational architecture on which the present paper rests. The system was used to explore the modification" to the Dirichlet endpoint.',
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. The existence claim is reduced by a Newton-Kantorovich argument to finitely many explicit inequalities certified in interval arithmetic, so the final step is machine-checkable, but nobody independent has rerun it.",
    publication: "preprint",
    resolutionMethod: "computation",
    resolution: "resolved",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.08953",
    sourceName: "arXiv",
    resultNote:
      "The domain has dihedral symmetry of order 26 and is neither a disc nor centrally symmetric, and its eigenfunction changes sign - which is why an additional sign assumption rescues the statement.",
    ageNote:
      "Follows the same group's counterexamples to the planar Pompeiu and Schiffer conjectures; the extension to the Dirichlet endpoint is not formal, since the nonzero Neumann datum keeps the harmonic source modes alive.",
    significance: 22,
    significanceNote:
      "A named conjecture in the Pompeiu-Schiffer family of overdetermined problems, known across inverse spectral theory and studied for four decades.",
  },
  {
    slug: "npt-two-copy-distillability-divincenzo-family",
    name: "Finite-Copy Distillability of NPT States in the DiVincenzo Family",
    shortName: "Two-copy NPT distillability",
    field: "Entanglement theory",
    fieldGroup: "Quantum information & computing",
    statement:
      "Whether negative-partial-transpose states undistillable from one copy become distillable from finitely many copies is a basic open problem in entanglement theory. In the canonical two-parameter DiVincenzo family used as its symmetry-reduced testbed, a distinguished one-copy-undistillable state is shown to be two-copy distillable in every local dimension d >= 3, disproving the conjecture that the family's whole one-copy-undistillable region stays undistillable for arbitrarily many copies.",
    posedBy: "David P. DiVincenzo, Peter W. Shor, John A. Smolin, Barbara M. Terhal, Ashish V. Thapliyal",
    yearPosed: 2000,
    solveType: "disproved",
    solveDate: "2026-08-09",
    model: "GPT-5.6 Thinking",
    modelMaker: "OpenAI",
    humanCollaborators: ["Gelo Noel M. Tabia", "Kai-Siang Chen", "Min-Hsiu Hsieh"],
    aiRole:
      'The disclosure lists the specific work: "GNMT acknowledges substantial assistance from OpenAI\'s ChatGPT, using the GPT-5.6 Thinking model, in the discovery and development of this work. The tool helped with scientific reasoning, the numerical filter search, the derivation of exact two-copy and three-copy certificates, and the organization of the arguments. The interaction was initiated and directed by GNMT." An appendix gives a fuller account of the AI-assisted discovery process.',
    verification: "unreviewed",
    verificationNote:
      "A preprint days old. The witnesses are explicit Schmidt-rank-two certificates that the authors independently reconstructed and verified, but no outside party has checked them.",
    publication: "preprint",
    resolutionMethod: "construction",
    resolution: "partial",
    aiContribution: "ai-co-developed",
    sourceUrl: "https://arxiv.org/abs/2608.08836",
    sourceName: "arXiv",
    resultNote:
      "Partial deliberately: the NPT bound entanglement problem itself is untouched. What falls is the conjecture about the canonical family, and the paper is explicit that a substantial neighbouring region remains unresolved while another is known two-copy undistillable.",
    ageNote:
      "The DiVincenzo family was introduced in 2000 precisely as a tractable testbed for the NPT distillability problem, which remains open.",
    significance: 30,
    significanceNote:
      "The NPT bound entanglement problem is one of the standing open problems of entanglement theory, known throughout quantum information and carried on its problem lists for 25 years.",
  },
];

async function main() {
  const curator = await prisma.user.findFirst({
    where: { email: CURATOR_EMAIL },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error(`no user for ${CURATOR_EMAIL}`);

  const slugs = ENTRIES.map((e) => e.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("duplicate slug in batch");

  const clashes = await prisma.problem.findMany({
    where: { OR: [{ slug: { in: slugs } }, { sourceUrl: { in: ENTRIES.map((e) => e.sourceUrl) } }] },
    select: { slug: true, sourceUrl: true },
  });
  if (clashes.length) {
    console.log("!! already present, refusing:", clashes);
    return;
  }

  for (const e of ENTRIES) {
    console.log(
      `${e.aiContribution.padEnd(16)} sig ${String(e.significance).padStart(3)}  ` +
        `${e.resolution.padEnd(8)} ${e.solveType.padEnd(9)} ${e.slug}`,
    );
    if (!APPLY) continue;
    const created = await prisma.problem.create({
      data: { ...e, status: "published", reviewedAt: new Date() },
      select: { id: true },
    });
    await prisma.problemActivity.create({
      data: {
        problemId: created.id,
        userId: curator.id,
        userName: curator.pseudonym ?? null,
        type: "created",
      },
    });
  }

  const total = await prisma.problem.count({ where: { status: "published" } });
  console.log(`\n${APPLY ? "done" : "DRY RUN"} - ${ENTRIES.length} entries, catalog now ${total}`);
}

main().finally(() => prisma.$disconnect());
