// Vercel Web Analytics, read through their public query API.
//
// The dashboard numbers and these numbers come from the same aggregated
// store, so the admin page cannot drift from what Vercel shows. Everything
// here is read-only and fails soft: no token configured, or a bad response,
// yields null and the page says so rather than inventing traffic.
//
// Auth: a Vercel access token in VERCEL_ANALYTICS_TOKEN. It is NOT the same
// thing as the deploy integration, and it is deliberately not committed -
// create one at vercel.com/account/tokens and add it to the project's
// environment variables.
//
// Note on bounce rate: the API exposes pageviews and visitors, not bounces.
// Pages per visitor is the closest honest proxy and is labelled as such; a
// number called "bounce rate" that was really something else would be worse
// than not showing one.

const BASE = "https://api.vercel.com/v1/query/web-analytics";

/// Project and team come from .vercel/project.json; they are not secrets.
const PROJECT_ID = "prj_lddEfVOI5NpwLx412rSp2ZkkRvPj";
const TEAM_ID = "team_KD66xMifEuWV88pzFVjCsmxE";

export interface TrafficPoint {
  day: string;
  pageviews: number;
  visitors: number;
}

export interface TrafficRow {
  label: string;
  pageviews: number;
  visitors: number;
}

export interface TrafficReport {
  daily: TrafficPoint[];
  routes: TrafficRow[];
  referrers: TrafficRow[];
  countries: TrafficRow[];
  totalPageviews: number;
  totalVisitors: number;
}

function isoDay(offsetDays: number): string {
  const d = new Date(Date.now() - offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

async function query(
  dataset: "visits/aggregate",
  params: Record<string, string>,
): Promise<Record<string, unknown>[] | null> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) return null;

  const search = new URLSearchParams({
    projectId: PROJECT_ID,
    teamId: TEAM_ID,
    ...params,
  });

  try {
    const res = await fetch(`${BASE}/${dataset}?${search}`, {
      headers: { Authorization: `Bearer ${token}` },
      // Traffic moves slowly enough that a five-minute cache is plenty, and
      // it keeps a page refresh from hammering their rate limit.
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error("vercel analytics", dataset, res.status, await res.text());
      return null;
    }
    const body = (await res.json()) as { data?: Record<string, unknown>[] };
    return Array.isArray(body.data) ? body.data : [];
  } catch (error) {
    console.error("vercel analytics fetch failed", error);
    return null;
  }
}

function rows(
  data: Record<string, unknown>[] | null,
  key: string,
  fallbackLabel = "Unknown",
): TrafficRow[] {
  if (!data) return [];
  return data.map((r) => ({
    label: String(r[key] ?? fallbackLabel) || fallbackLabel,
    pageviews: Number(r.pageviews ?? 0),
    visitors: Number(r.visitors ?? 0),
  }));
}

/// Everything the admin page needs, in one fan-out. Null means "not
/// configured or unreachable" - the caller renders a setup note instead.
export async function getTraffic(days = 30): Promise<TrafficReport | null> {
  if (!process.env.VERCEL_ANALYTICS_TOKEN) return null;

  const since = isoDay(days);
  const until = isoDay(0);
  const window = { since, until };

  const [daily, routes, referrers, countries] = await Promise.all([
    query("visits/aggregate", { ...window, by: "day" }),
    query("visits/aggregate", { ...window, by: "route", limit: "8" }),
    query("visits/aggregate", { ...window, by: "referrerHostname", limit: "8" }),
    query("visits/aggregate", { ...window, by: "country", limit: "8" }),
  ]);

  if (!daily) return null;

  const points: TrafficPoint[] = daily.map((r) => ({
    day: String(r.timestamp ?? "").slice(0, 10),
    pageviews: Number(r.pageviews ?? 0),
    visitors: Number(r.visitors ?? 0),
  }));

  return {
    daily: points,
    routes: rows(routes, "route", "(unknown route)"),
    referrers: rows(referrers, "referrerHostname", "Direct"),
    countries: rows(countries, "country"),
    totalPageviews: points.reduce((s, p) => s + p.pageviews, 0),
    totalVisitors: points.reduce((s, p) => s + p.visitors, 0),
  };
}

export const ANALYTICS_CONFIGURED = () => Boolean(process.env.VERCEL_ANALYTICS_TOKEN);
