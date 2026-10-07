// Bulk releases an entry can belong to: a lab publishing results by the
// hundred, imported by a curator in batches (docs/reviewing.md, "Bulk releases
// by AI labs"). Stored on Problem.collection as the key below, with the
// release version that was read in Problem.collectionVersion, so the whole
// release can be filtered and counted as one event and every entry can be
// re-checked when the lab revises a paper.
//
// Keys are STORED DATA: add new ones, never rename a key in place.

export interface CollectionSpec {
  key: string;
  /// Shown on the entry page and in the list filter.
  label: string;
  /// The release itself.
  url: string;
  /// Where a given version of the release can be browsed.
  versionUrl: (version: string) => string;
  /// When the release went public, ISO date.
  released: string;
}

export const COLLECTIONS: CollectionSpec[] = [
  {
    key: "openai-math-2026-10",
    label: "OpenAI math release (October 2026)",
    url: "https://github.com/openai/math",
    versionUrl: (v) => `https://github.com/openai/math/tree/${v}`,
    released: "2026-10-06",
  },
];

export const COLLECTION_KEYS = COLLECTIONS.map((c) => c.key);

/// Filter value for "not from any bulk release", so the list can show the
/// catalog without a release as easily as the release alone.
export const NO_COLLECTION = "none";

export function collectionSpec(key: string | null | undefined): CollectionSpec | undefined {
  return key ? COLLECTIONS.find((c) => c.key === key) : undefined;
}
