// Shared presentation vocabulary for problem entries.
//
// These labels and colours were duplicated between the entry list and the entry
// page, which meant a renamed verification tier had to be changed in two places.
// Single source now.

import type {
  AiContribution,
  PublicationStatus,
  ResolutionMethod,
  ResolutionStatus,
  SolveType,
  VerificationStatus,
} from "@/lib/problems";

/// Placeholder for a field an entry does not have. Most entries are missing at
/// least one, so this shows up a lot.
export const DASH = "—";

export const SOLVE_TYPE: Record<SolveType, { label: string; color: string }> = {
  proved: { label: "Proved", color: "var(--accent-blue)" },
  disproved: { label: "Disproved", color: "var(--accent-orange)" },
};

/// Resolution statuses. `pill` is what renders next to the result on cards -
/// null for "resolved" so the default state adds no visual noise, a short
/// qualifier for everything else.
export const RESOLUTION: Record<
  ResolutionStatus,
  { label: string; pill: string | null; color: string }
> = {
  resolved: { label: "Resolved", pill: null, color: "var(--ink-secondary)" },
  partial: { label: "Partial result", pill: "Partial", color: "var(--status-warning)" },
  variant: { label: "Variant only", pill: "Variant only", color: "var(--status-warning)" },
  candidate: {
    label: "Candidate (review pending)",
    pill: "Under review",
    color: "var(--accent-blue)",
  },
  retracted: { label: "Retracted", pill: "Retracted", color: "var(--status-critical)" },
};

/// Degree of AI involvement. Unlike the resolution pills, EVERY classified
/// tier renders a pill on cards: "resolved" is a default state, but
/// "AI-discovered" is the site's headline claim and the axis is what
/// distinguishes entries - hiding the top tier read as the feature missing.
/// Unclassified entries (null) still render nothing anywhere.
export const AI_CONTRIBUTION: Record<
  AiContribution,
  { label: string; pill: string | null; color: string }
> = {
  "ai-discovered": {
    label: "AI-discovered",
    pill: "AI-discovered",
    color: "var(--accent-blue)",
  },
  "ai-co-developed": {
    label: "AI co-developed",
    pill: "AI co-developed",
    color: "var(--ink-secondary)",
  },
  "ai-assisted": {
    label: "AI-assisted",
    pill: "AI-assisted",
    color: "var(--ink-secondary)",
  },
};

export type StatusIconKind = "check" | "clock" | "alert" | "info";

/// The verification "trust ladder", strongest first: how CHECKED the
/// mathematics is, independent of where the claim was published.
export const VERIFICATION: Record<
  VerificationStatus,
  { label: string; color: string; icon: StatusIconKind }
> = {
  "lean-verified": { label: "Lean-verified", color: "var(--status-good)", icon: "check" },
  "expert-verified": { label: "Expert-verified", color: "var(--status-good)", icon: "check" },
  "site-confirmed": { label: "Site-confirmed", color: "var(--accent-blue)", icon: "check" },
  unreviewed: { label: "Unreviewed", color: "var(--ink-muted)", icon: "info" },
  contested: { label: "Contested", color: "var(--status-critical)", icon: "alert" },
};

/// Where the claim lives in the scholarly pipeline. On cards this shows only
/// as the badge fallback when verification is "unreviewed" - reproducing the
/// old single-ladder look while the data stays honest underneath.
export const PUBLICATION: Record<
  PublicationStatus,
  { label: string; color: string; icon: StatusIconKind }
> = {
  announcement: { label: "Announced", color: "var(--ink-muted)", icon: "info" },
  preprint: { label: "Preprint", color: "var(--status-warning)", icon: "clock" },
  "peer-reviewed": { label: "Peer-reviewed", color: "var(--status-good)", icon: "check" },
};

/// How the resolution was achieved - the axis proved/disproved cannot
/// express (a proof of X is a disproof of not-X).
export const RESOLUTION_METHOD: Record<ResolutionMethod, { label: string }> = {
  construction: { label: "Construction" },
  computation: { label: "Computation" },
  argument: { label: "Argument" },
};

/// Explanation of the notability score, shown wherever the number appears.
export const NOTABILITY_HELP =
  "Wikipedia language editions with an article about this specific problem. Generic concept articles don't count, and an article that exists only because the problem was solved does not count either. 0 means no such article.";

/// AI-system families, shared by the stats chart and the list's model filter
/// so the two can never drift apart. Model strings are free-form and often
/// credit several systems on one entry, so matching is by keyword: an entry
/// counts toward every family named on it.
export const MODEL_FAMILIES: { key: string; label: string; test: RegExp }[] = [
  { key: "openai", label: "OpenAI (GPT, Codex)", test: /gpt|codex|openai|\bo[0-9]\b/i },
  { key: "google", label: "Google DeepMind", test: /gemini|deepmind|alphaevolve|alphaproof/i },
  { key: "anthropic", label: "Anthropic (Claude)", test: /claude/i },
  { key: "harmonic", label: "Harmonic (Aristotle)", test: /aristotle|harmonic/i },
  { key: "xai", label: "xAI (Grok)", test: /grok/i },
  { key: "open-weights", label: "Open-weights (DeepSeek, GLM)", test: /deepseek|glm/i },
  {
    // Agent harnesses and systems that do not name (or do not disclose) a
    // frontier base model. Harness entries that DO name one (e.g. "Rethlas
    // (GPT-5.6 Sol)") also count toward that vendor, by design.
    key: "agents",
    label: "Agent systems / other",
    test: /aletheia|archivara|multiscalar|seed prover|axiomprover|demonstrandum|qed|tars|rethlas|archon|proofcouncil|hy3|hyra|capy/i,
  },
];

/// Explanation of the significance score, shown wherever the number appears.
export const SIGNIFICANCE_HELP =
  "AI-estimated weight of the problem BEFORE it was solved, 0-100 in steps of 5 against an anchored ladder (Riemann hypothesis 100, Collatz ~80, a field-famous workhorse ~30, a typical numbered Erdős problem ~10). Assigned at review with a published prompt; full rubric in the methodology.";
