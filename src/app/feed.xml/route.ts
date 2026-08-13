import { getPublishedProblems } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// RSS 2.0 for the catalogue: newest solves first.
//
// Ordered by `solveDate`, not by when a row was written. The seeded baseline
// all landed within seconds of each other, so creation order carries no
// information, and a reader subscribing to this wants "what was solved" in
// the order it was solved.
//
// One feed rather than per-field ones. Splitting by field would be easy and
// premature: nobody has asked, and a reader who only wants combinatorics is
// better served by the list's own filters than by a second URL to remember.

// No `dynamic` or `revalidate` segment config: this app runs Cache
// Components, which rejects both. `getPublishedProblems` is already a cached
// read tagged `problems`, so the feed inherits its invalidation and rebuilds
// when an entry changes rather than on a timer.

const SIZE = 60;

/// XML text escaping. Everything user-facing goes through this, and it runs
/// before anything is placed in an element, so a stray ampersand in a title
/// cannot break the document.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/// `solveDate` is "2026-08-04", "2026-08" or bare "2026". RFC 822 wants a full
/// timestamp, so the missing parts are filled with the start of the period
/// rather than the item being dropped for lacking a day.
function pubDate(solveDate: string): string {
  const [y, m = "01", d = "01"] = solveDate.split("-");
  const dt = new Date(`${y}-${m}-${d}T12:00:00Z`);
  return Number.isNaN(dt.getTime()) ? new Date().toUTCString() : dt.toUTCString();
}

export async function GET() {
  const problems = await getPublishedProblems();
  const items = [...problems]
    .sort((a, b) => b.solveDate.localeCompare(a.solveDate))
    .slice(0, SIZE);

  const body = items
    .map((p) => {
      // The statement carries TeX, which no reader renders. Stripping the
      // delimiters leaves the source readable rather than shipping markup a
      // feed reader will show raw.
      const summary = (p.statement ?? "")
        .replace(/\$\$?/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500);
      const solved = p.solveType === "disproved" ? "Disproved" : "Proved";
      const meta = [
        solved,
        p.field,
        p.model ? `with ${p.model}` : null,
        p.significance != null ? `significance ${p.significance}/100` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      return `    <item>
      <title>${esc(p.name)}</title>
      <link>${SITE_URL}/problem/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/problem/${p.slug}</guid>
      <pubDate>${pubDate(p.solveDate)}</pubDate>
      <category>${esc(p.fieldGroup ?? "Mathematics")}</category>
      <description>${esc(`${meta}. ${summary}`)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VibeMathed</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Math problems solved with AI. A community-curated record of problems no human had settled, proved or disproved with a model in the loop.</description>
    <language>en</language>
    <lastBuildDate>${items[0] ? pubDate(items[0].solveDate) : new Date().toUTCString()}</lastBuildDate>
${body}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
