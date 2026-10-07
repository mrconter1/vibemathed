import { getSearchProseMap } from "@/lib/data";

// The slug -> long-prose map behind full-text search (statement, notes, AI
// role, link labels). The entry list fetches it once, the first time someone
// types in the search box; until then searches cover the card fields only.

export async function GET() {
  const map = await getSearchProseMap();
  return Response.json(map, {
    headers: {
      // Same cadence as the underlying cached read.
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
