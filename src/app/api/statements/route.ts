import { getStatementHtmlMap } from "@/lib/data";

// The slug -> rendered-statement-HTML map for every published entry. The home
// page inlines statements for its first page only; the entry list fetches
// this once, after hydration, for everything deeper - which is what keeps the
// home page's weight flat as the catalog grows.

export async function GET() {
  const map = await getStatementHtmlMap();
  return Response.json(map, {
    headers: {
      // Same cadence as the underlying cached read.
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
