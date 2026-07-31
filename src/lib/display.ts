// Shared presentation vocabulary for problem entries.
//
// These labels and colours were duplicated between the entry list and the entry
// page, which meant a renamed verification tier had to be changed in two places.
// Single source now.

import type {
  AiContribution,
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

/// Degree of AI involvement. Follows the resolution-pill convention: the top
/// tier is the site's headline case, so it renders no pill on cards - only the
/// tiers that QUALIFY the headline get one. Unclassified entries (null) render
/// nothing anywhere.
export const AI_CONTRIBUTION: Record<
  AiContribution,
  { label: string; pill: string | null; color: string }
> = {
  "ai-discovered": { label: "AI-discovered", pill: null, color: "var(--accent-blue)" },
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

/// The verification "trust ladder", strongest first.
export const VERIFICATION: Record<
  VerificationStatus,
  { label: string; color: string; icon: StatusIconKind }
> = {
  "lean-verified": { label: "Lean-verified", color: "var(--status-good)", icon: "check" },
  "expert-verified": { label: "Expert-verified", color: "var(--status-good)", icon: "check" },
  "site-confirmed": { label: "Site-confirmed", color: "var(--accent-blue)", icon: "check" },
  "preprint-unrefereed": {
    label: "Preprint (unrefereed)",
    color: "var(--status-warning)",
    icon: "clock",
  },
  "announced-unreviewed": {
    label: "Announced (unreviewed)",
    color: "var(--ink-muted)",
    icon: "info",
  },
  contested: { label: "Contested", color: "var(--status-critical)", icon: "alert" },
};

/// Explanation of the notability score, shown wherever the number appears.
export const NOTABILITY_HELP =
  "Wikipedia language editions with an article about this specific problem. Generic concept articles don't count, and an article that exists only because the problem was solved does not count either. 0 means no such article.";
