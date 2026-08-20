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
  /// The actor's CURRENT pseudonym, for the profile link; null when there is
  /// no account to link to (a deleted member, or a curator-authored row) and
  /// the snapshot name renders unlinked.
  ///
  /// On the base view rather than only on SiteActivityView because the
  /// per-entry changelog wants the same link the homepage feed has - a name
  /// that is a link in one list and plain text in another reads as a bug.
  userPseudonym: string | null;
  type: string;
  /// For `updated`: which field changed, and its before/after.
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  /// Raw ISO timestamp, for relative rendering on the client.
  createdAtIso: string;
  /// How many further fields the same person changed on the same entry in the
  /// same sitting. Zero for a lone edit.
  ///
  /// Stored rows are never merged: the changelog's job is to record what
  /// changed, field by field, and losing that would be losing the record. This
  /// is a display count only, so a ten-field edit reads as one line with the
  /// rest named on it rather than ten lines that bury everything else.
  alsoChanged?: number;
  /// The other fields in that burst, for the line to name.
  alsoFields?: string[];
}

/// Site-wide activity also needs to say WHICH entry it happened on.
export interface SiteActivityView extends ActivityView {
  problemName: string;
  problemSlug: string;
}

/// Collapses a run of edits by one person on one entry into a single view.
///
/// Only `updated` rows collapse, and only while they stay consecutive: a
/// comment or somebody else's edit in between ends the run, because the feed
/// would otherwise claim a continuity the history does not have. Rows arrive
/// newest-first, so the survivor is the newest of its run and the older ones
/// fold into its count.
///
/// The window is generous. A curator working through a form saves each field
/// as they go, and those can be minutes apart; anything shorter splits one
/// sitting into several.
const BURST_MS = 30 * 60 * 1000;

export function collapseBursts<
  T extends ActivityView & { problemSlug?: string },
>(rows: T[]): T[] {
  const out: T[] = [];
  for (const row of rows) {
    const head = out[out.length - 1];
    const sameRun =
      head &&
      head.type === "updated" &&
      row.type === "updated" &&
      head.userName === row.userName &&
      (head.problemSlug ?? "") === (row.problemSlug ?? "") &&
      new Date(head.createdAtIso).getTime() -
        new Date(row.createdAtIso).getTime() <
        BURST_MS;
    if (!sameRun) {
      out.push({ ...row, alsoChanged: 0, alsoFields: [] });
      continue;
    }
    head.alsoChanged = (head.alsoChanged ?? 0) + 1;
    if (row.field) head.alsoFields = [...(head.alsoFields ?? []), row.field];
  }
  return out;
}
