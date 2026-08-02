// Shape of a changelog entry, shared by the cached read and the UI.

/// The activity types the changelog shows.
///
/// Votes are recorded in `ProblemActivity` too, but deliberately excluded here:
/// this is a changelog of what the entry SAYS, and an unbounded stream of
/// "X voted / X removed their vote" would drown the actual edit history. The
/// vote signal is already summarised by the tally on the entry.
export const CHANGELOG_TYPES = [
  "created",
  "updated",
  "submitted",
  "approved",
  "commented",
] as const;

export interface ActivityView {
  id: string;
  /// Pseudonym snapshot, or "Curator" for the seeded baseline.
  userName: string;
  type: string;
  /// For `updated`: which field changed, and its before/after.
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  /// Raw ISO timestamp, for relative rendering on the client.
  createdAtIso: string;
}

/// Site-wide activity also needs to say WHICH entry it happened on.
export interface SiteActivityView extends ActivityView {
  problemName: string;
  problemSlug: string;
  /// The actor's CURRENT pseudonym for the profile link; null when there is
  /// no account to link (the snapshot name still renders, unlinked).
  userPseudonym: string | null;
}
