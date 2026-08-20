// Turning a source link into something two entries can be compared on.
//
// The catalog identifies work by URL, and the same paper reaches it by
// several: arxiv.org/abs/2608.13637, /pdf/2608.13637v2, the DOI, a lab's own
// PDF. Comparing the strings finds none of those equal, which is not a
// hypothetical problem - the zeta entry was filed from an Anthropic CDN PDF
// and a later id-based sweep did not recognise its own arXiv paper.
//
// So: reduce a URL to the identity of the thing it points at, and compare
// those. Anything unrecognised falls back to host plus path, which still
// collapses http/https, www, trailing slashes, query strings and case.

/// Canonical forms, cheapest first. Each returns null when the pattern does
/// not apply, so `extractSourceId` can try them in order.
const RULES: { name: string; run: (u: URL) => string | null }[] = [
  {
    // arXiv, in every shape it appears: /abs/, /pdf/, /html/, /src/, with or
    // without a version suffix. The version is deliberately dropped, because
    // v1 and v3 of a paper are the same paper for duplicate purposes.
    name: "arxiv",
    run: (u) => {
      if (!/(^|\.)arxiv\.org$/i.test(u.hostname)) return null;
      const m = u.pathname.match(/(\d{4}\.\d{4,5})(v\d+)?/);
      if (m) return `arxiv:${m[1]}`;
      // Pre-2007 identifiers, e.g. /abs/math/0211159.
      const old = u.pathname.match(/([a-z-]+(?:\.[A-Z]{2})?\/\d{7})(v\d+)?/i);
      return old ? `arxiv:${old[1].toLowerCase()}` : null;
    },
  },
  {
    // A DOI, whether via doi.org or dx.doi.org. Case-insensitive by spec.
    //
    // Zenodo DOIs resolve to Zenodo records, so they fold into the zenodo
    // form rather than staying a separate id. Otherwise the same deposit
    // filed once by DOI and once by record URL reads as two artifacts, which
    // is precisely the confusion this module exists to remove.
    name: "doi",
    run: (u) => {
      if (!/(^|\.)doi\.org$/i.test(u.hostname)) return null;
      const doi = u.pathname.replace(/^\/+/, "");
      if (!doi) return null;
      const zen = doi.match(/zenodo\.(\d+)/i);
      return zen ? `zenodo:${zen[1]}` : `doi:${doi.toLowerCase()}`;
    },
  },
  {
    // A GitHub repository, not a file inside it: two links into the same repo
    // are the same artifact for this purpose.
    name: "github",
    run: (u) => {
      if (!/(^|\.)github\.com$/i.test(u.hostname)) return null;
      const m = u.pathname.match(/^\/([^/]+)\/([^/]+)/);
      return m ? `github:${m[1].toLowerCase()}/${m[2].replace(/\.git$/, "").toLowerCase()}` : null;
    },
  },
  {
    // Zenodo records, including the DOI-style /doi/10.5281/zenodo.N form.
    name: "zenodo",
    run: (u) => {
      if (!/(^|\.)zenodo\.org$/i.test(u.hostname)) return null;
      const m = u.pathname.match(/(?:records?\/|zenodo\.)(\d+)/i);
      return m ? `zenodo:${m[1]}` : null;
    },
  },
];

/// The identity of whatever a URL points at, or null if the input is not a
/// URL at all. Never throws: this runs on user input mid-keystroke.
export function extractSourceId(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  // A bare arXiv id, which is what somebody pastes when they are not pasting
  // a link. Guarded so ordinary decimals in a title are not read as papers:
  // the shape is four digits, a dot, then four or five.
  const bare = text.match(/^(?:arxiv:)?\s*(\d{4}\.\d{4,5})(v\d+)?$/i);
  if (bare) return `arxiv:${bare[1]}`;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  // Reject things that only parsed because a scheme was bolted on, like a
  // plain sentence: a real host has a dot and no spaces.
  if (!url.hostname.includes(".") || /\s/.test(url.hostname)) return null;

  for (const rule of RULES) {
    const id = rule.run(url);
    if (id) return id;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const path = url.pathname.replace(/\/+$/, "").toLowerCase();
  return `url:${host}${path}`;
}

/// Every identity an entry can be recognised by: its primary source and any
/// link on it. Deduplicated, because an entry often links the same paper
/// twice in different shapes.
export function entrySourceIds(
  sourceUrl: string | null | undefined,
  links: { url: string }[] | null | undefined,
): string[] {
  const out = new Set<string>();
  for (const raw of [sourceUrl, ...(links ?? []).map((l) => l.url)]) {
    if (!raw) continue;
    const id = extractSourceId(raw);
    if (id) out.add(id);
  }
  return [...out];
}

/// True when a query names the same artifact as one of an entry's links.
/// Only meaningful when the query IS an identifier; a title never matches.
export function matchesSourceId(query: string, ids: string[]): boolean {
  const id = extractSourceId(query);
  return id != null && ids.includes(id);
}
