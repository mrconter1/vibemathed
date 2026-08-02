import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { availableDays, getAdminStats } from "@/lib/admin-stats";
import { getTraffic } from "@/lib/vercel-analytics";
import { AdminBars, AdminRanked } from "@/components/AdminBars";

// The owner's dashboard: who is arriving, who is registering, what they do
// once they are here, and how fast their submissions get answered.
//
// Two data sources with very different guarantees. Everything under "The
// record" comes from our own database and is exact. Everything under
// "Traffic" comes from Vercel Web Analytics through their query API and only
// appears when VERCEL_ANALYTICS_TOKEN is set; without it the section says so
// instead of showing zeros that look like a dead site.

export const metadata: Metadata = {
  title: "Site stats",
  robots: { index: false, follow: false },
};

/// Upper bound only; the page charts however many days of history exist.
const MAX_DAYS = 30;

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3">
      <dt className="text-xs text-[var(--ink-muted)]">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">{value}</dd>
      {sub && <dd className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{sub}</dd>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
      {children}
    </div>
  );
}

async function Dashboard() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return (
      <p className="text-sm text-[var(--ink-secondary)]">
        This page is for reviewers.{" "}
        <Link href="/" className="text-[var(--accent-blue)] hover:underline">
          Back to all entries
        </Link>
        .
      </p>
    );
  }

  const DAYS = await availableDays(MAX_DAYS);
  const [s, traffic] = await Promise.all([getAdminStats(DAYS), getTraffic(DAYS)]);

  const approvalRate =
    s.review.decided > 0
      ? `${Math.round((s.review.approved / s.review.decided) * 100)}%`
      : "—";
  const perVisitor =
    traffic && traffic.totalVisitors > 0
      ? (traffic.totalPageviews / traffic.totalVisitors).toFixed(1)
      : null;

  return (
    <>
      <h2 className="font-serif text-xl text-[var(--ink)]">Traffic</h2>
      {traffic ? (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <Tile
              label="Page views"
              value={traffic.totalPageviews.toLocaleString("en-US")}
              sub={DAYS === 1 ? "today" : `last ${DAYS} days`}
            />
            <Tile
              label="Visitors"
              value={traffic.totalVisitors.toLocaleString("en-US")}
              sub={DAYS === 1 ? "today" : `last ${DAYS} days`}
            />
            <Tile
              label="Pages per visitor"
              value={perVisitor ?? "—"}
              // Vercel's API exposes views and visitors, not bounces. This is
              // the honest neighbour of a bounce rate, named for what it is.
              sub="closest honest proxy for bounce"
            />
            <Tile
              label="Busiest day"
              value={Math.max(0, ...traffic.daily.map((d) => d.pageviews)).toLocaleString("en-US")}
              sub="page views"
            />
          </dl>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <AdminBars
                points={traffic.daily.map((d) => ({ day: d.day, count: d.pageviews }))}
                label="Page views per day"
              />
            </Card>
            <Card>
              <AdminBars
                points={traffic.daily.map((d) => ({ day: d.day, count: d.visitors }))}
                label="Visitors per day"
                color="var(--accent-orange)"
              />
            </Card>
            <Card>
              <AdminRanked
                label="Top pages"
                unit="views"
                rows={traffic.routes.map((r) => ({ label: r.label, value: r.pageviews }))}
              />
            </Card>
            <Card>
              <AdminRanked
                label="Referrers"
                unit="views"
                rows={traffic.referrers.map((r) => ({ label: r.label, value: r.pageviews }))}
              />
            </Card>
            <Card>
              <AdminRanked
                label="Countries"
                unit="visitors"
                rows={traffic.countries.map((r) => ({ label: r.label, value: r.visitors }))}
              />
            </Card>
          </div>
        </>
      ) : (
        <div className="mt-3 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 text-sm leading-relaxed text-[var(--ink-secondary)] sm:p-5">
          <p>
            Traffic is not wired up yet. Vercel Web Analytics has a public
            query API, and this page is already written against it - it just
            needs a token.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-[var(--ink-muted)]">
            <li>
              Create a token at{" "}
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-blue)] hover:underline"
              >
                vercel.com/account/tokens
              </a>
              .
            </li>
            <li>
              Add it to the vibemathed project as{" "}
              <code className="font-mono">VERCEL_ANALYTICS_TOKEN</code>.
            </li>
            <li>Redeploy. Page views, visitors, top pages, referrers and countries appear here.</li>
          </ol>
          <p className="mt-2 text-[13px] text-[var(--ink-muted)]">
            Bounce rate will not: the API returns page views and visitors, not
            bounces, so this page shows pages per visitor and says that is
            what it is.
          </p>
        </div>
      )}

      <h2 className="mt-8 font-serif text-xl text-[var(--ink)]">The record</h2>
      <dl className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Tile
          label="Members"
          value={String(s.users.total)}
          sub={`${s.users.withEntries} submitted · ${s.users.withComments} commented`}
        />
        <Tile
          label="Published entries"
          value={String(s.entries.published)}
          sub={`${s.entries.pending} pending · ${s.entries.rejected} rejected`}
        />
        <Tile
          label="Approval rate"
          value={approvalRate}
          sub={`${s.review.decided} decided${
            s.review.medianHours !== null
              ? ` · median wait ${s.review.medianHours}h`
              : ""
          }`}
        />
        <Tile
          label="Engagement"
          value={String(s.engagement.votes + s.engagement.comments)}
          sub={`${s.engagement.votes} votes · ${s.engagement.comments} comments`}
        />
      </dl>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <AdminBars points={s.registrations} label="Registrations per day" />
        </Card>
        <Card>
          <AdminBars
            points={s.submissions}
            label="Submissions per day"
            color="var(--accent-orange)"
          />
        </Card>
        <Card>
          <AdminBars
            points={s.activity}
            label="Recorded actions per day"
            color="var(--status-good)"
          />
        </Card>
        <Card>
          <AdminRanked
            label="Top contributors"
            unit="actions"
            rows={s.topContributors.map((t) => ({
              label: t.name,
              value: t.total,
              sub: t.detail,
            }))}
          />
        </Card>
        <Card>
          <AdminRanked
            label="Top submitters"
            unit="entries"
            rows={s.topSubmitters.map((t) => ({ label: t.name, value: t.entries }))}
          />
        </Card>
      </div>

      <p className="mt-4 text-xs text-[var(--ink-muted)]">
        Charting {DAYS} day{DAYS === 1 ? "" : "s"} - all the history there is.{" "}
        {s.engagement.reportsOpen} open report
        {s.engagement.reportsOpen === 1 ? "" : "s"} of {s.engagement.reportsTotal} ever
        {s.users.banned > 0 ? ` · ${s.users.banned} banned account${s.users.banned === 1 ? "" : "s"}` : ""}
        . Counts are exact; traffic is whatever Vercel recorded.
      </p>
    </>
  );
}

export default function AdminStatsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-8 sm:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        <span aria-hidden>←</span>
        All problems
      </Link>

      <h1 className="mt-4 mb-1 font-serif text-3xl tracking-tight text-[var(--ink)]">
        Site stats
      </h1>
      <p className="mb-6 text-sm text-[var(--ink-secondary)]">
        Private to reviewers.
      </p>

      <Suspense
        fallback={
          <div className="h-64 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        }
      >
        <Dashboard />
      </Suspense>
    </main>
  );
}
