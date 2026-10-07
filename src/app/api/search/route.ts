import { getPublishedProblems, getSearchProseMap } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { toSearchDoc } from "@/lib/search-docs";
import { search } from "@/lib/search-query";

// Search over the published catalog with the same query language as the
// entry list's search box, for agents, scripts and anyone who wants results
// as JSON:
//
//   GET /api/search?q=kakeya+restriction&limit=20
//   GET /api/search?q=sig:>60 status:candidate release:openai
//
// Results are ordered by relevance, ties by solve date, newest first. Each
// carries the entry URL; the full record is in /api/dataset. CORS is open,
// like the dataset.

const SYNTAX = {
  words: "kakeya restriction - every word must match somewhere",
  phrase: '"free group factor" - an exact phrase',
  not: "-conditional - must not match",
  or: "hadwiger OR sidorenko - either side",
  fields:
    "name: field: posed: model: people: status: tier: result: source: release: text: number: - restrict a word to one field",
  numbers: "sig:>50 year:<1950 open:>=30 sig:40..60 - significance, year posed, years open",
  date: "solved:2026-09 - solve date prefix",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 500);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 500);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60, s-maxage=300",
  };
  if (!q.trim()) {
    return Response.json({ query: q, syntax: SYNTAX, results: [] }, { headers });
  }
  const [problems, prose] = await Promise.all([getPublishedProblems(), getSearchProseMap()]);
  const ordered = [...problems].sort((a, b) => b.solveDate.localeCompare(a.solveDate));
  const docs = ordered.map((p) => toSearchDoc(p, prose[p.slug]));
  const bySlug = new Map(ordered.map((p) => [p.slug, p]));
  const hits = search(docs, q);
  return Response.json(
    {
      query: q,
      total: hits.length,
      results: hits.slice(0, limit).map(({ slug, score }) => {
        const p = bySlug.get(slug)!;
        return {
          slug,
          url: `${SITE_URL}/problem/${slug}`,
          name: p.name,
          fieldGroup: p.fieldGroup,
          solveType: p.solveType,
          resolution: p.resolution,
          verification: p.verification,
          significance: p.significance ?? null,
          solveDate: p.solveDate,
          model: p.model,
          collection: p.collection ?? null,
          score,
        };
      }),
    },
    { headers },
  );
}
