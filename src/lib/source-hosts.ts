// Where an entry's primary source lives, as a filter facet.
//
// Asked for in the Discord: "are we able to sift between papers put on the
// arXiv vs papers put on other preprint servers?" The publication facet
// (preprint / announcement / peer-reviewed) says what KIND of thing the source
// is; this says WHERE it is, which is a different question - a third of the
// catalog's preprints-by-kind are not on arXiv, and a reader who trusts arXiv's
// moderation more than a personal repository has no other way to see that.
//
// Pure and dependency-free so it can be unit-tested and shared by the client
// list and any server read. Derived from the URL at filter time rather than
// stored, so it cannot drift from the source it describes.

export type SourceHostKey = "arxiv" | "erdos" | "repo" | "other";

export const SOURCE_HOSTS: { key: SourceHostKey; label: string }[] = [
  { key: "arxiv", label: "arXiv" },
  { key: "erdos", label: "erdosproblems.com" },
  { key: "repo", label: "Code repository" },
  { key: "other", label: "Elsewhere" },
];

export const SOURCE_HOST_KEYS: readonly SourceHostKey[] = SOURCE_HOSTS.map((h) => h.key);

/// Buckets a primary-source URL. Unparseable input is "other", not an error:
/// the list must never fail to render because one entry has a strange URL.
export function sourceHostKey(url: string): SourceHostKey {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "other";
  }
  if (host === "arxiv.org" || host.endsWith(".arxiv.org")) return "arxiv";
  if (host === "erdosproblems.com") return "erdos";
  if (host === "github.com" || host === "gitlab.com" || host === "codeberg.org") return "repo";
  return "other";
}
