import type { Metadata } from "next";
import Link from "next/link";
import { getRecords, getToday, type RecordRowView, type RecordSummary } from "@/lib/data";
import { competes, frontier, padDate, steps } from "@/lib/records";
import { RecordSparkline } from "@/components/RecordSparkline";
import { TeX } from "@/components/TeX";
import { Icon, type IconName } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Records",
  description:
    "Quantities mathematicians have pushed for decades - the matrix multiplication exponent, the proportion of zeta zeros on the critical line, the largest known elliptic curve rank - and where AI has moved them.",
  alternates: { canonical: "/records" },
};

// A record exists only once a catalog entry is a row on it, so "steps by AI"
// is never zero and the landing never lists a record with nothing to say.

function lastMoved(r: RecordSummary): string | null {
  const live = r.rows.filter((x) => competes(x.status));
  if (!live.length) return null;
  return live.map((x) => x.date).sort((a, b) => (padDate(a) < padDate(b) ? 1 : -1))[0];
}

function fmtDate(d: string): string {
  if (d.length === 4) return d;
  const dt = new Date(padDate(d).slice(0, 10));
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: d.length >= 10 ? "numeric" : undefined, month: "short", year: "numeric" });
}

export default async function RecordsPage() {
  // Both behind "use cache": the clock read has to live where a prerendered
  // page is allowed to read it (see getToday), not in the page body.
  const [records, today] = await Promise.all([getRecords(), getToday()]);

  const allRows = records.flatMap((r) => r.rows.map((row) => ({ record: r, row })));
  const aiSteps = records.reduce(
    (n, r) => n + steps(r.rows, r.direction).filter((s) => s.isStep && s.row.entry).length,
    0,
  );
  const historical = allRows.filter((x) => x.row.status === "historical").length;
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const movedRecently = records.filter((r) => {
    const d = lastMoved(r);
    return d && new Date(padDate(d).slice(0, 10)) >= monthAgo;
  }).length;

  const tiles: { icon: IconName; label: string; value: string; sub: string }[] = [
    { icon: "layers", label: "Records tracked", value: String(records.length), sub: "each with at least one AI step" },
    { icon: "spark", label: "Steps by AI", value: String(aiSteps), sub: "rows that moved a record when they landed" },
    { icon: "pulse", label: "Moved in the last 30 days", value: String(movedRecently), sub: "records with a new best" },
    { icon: "bookmark", label: "Historical rows cited", value: String(historical), sub: "the human staircase, one source each" },
  ];

  // Latest movement: newest entry rows across every record.
  const latest = allRows
    .filter((x) => x.row.entry)
    .sort((a, b) => (padDate(a.row.date) < padDate(b.row.date) ? 1 : -1))
    .slice(0, 8);

  const sorted = [...records].sort((a, b) => {
    const da = lastMoved(a) ?? "";
    const db = lastMoved(b) ?? "";
    return padDate(da) < padDate(db) ? 1 : -1;
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-8 sm:pt-6">
      <h1 className="font-serif text-2xl text-[var(--ink)] sm:text-3xl">Records</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Quantities mathematicians have pushed for decades, drawn as the staircase they are: every step is a
        paper, and the coloured steps at the end are the ones a model took. A record appears here only once an
        entry in the catalog sits on it. Historical steps are cited one by one and are context, not claims of
        this site.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="flex flex-col justify-center rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
          >
            <dt className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Icon name={t.icon} />
              {t.label}
            </dt>
            <dd className="mt-1 font-serif text-2xl text-[var(--ink)]">{t.value}</dd>
            <dd className="text-xs text-[var(--ink-muted)]">{t.sub}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8" aria-labelledby="records-list">
        <h2 id="records-list" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          All records
        </h2>
        <ul className="mt-2 divide-y divide-[var(--hairline)] rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]">
          {sorted.map((r) => {
            const best = frontier(r.rows, r.direction);
            const st = steps(r.rows, r.direction);
            const nSteps = st.filter((s) => s.isStep).length;
            const nAi = st.filter((s) => s.isStep && s.row.entry).length;
            const moved = lastMoved(r);
            return (
              <li key={r.slug} className="relative flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 hover:bg-[var(--paper)]">
                <div className="min-w-0 flex-1 basis-56">
                  <Link href={`/record/${r.slug}`} className="font-medium text-[var(--ink)] hover:underline">
                    <span className="absolute inset-0" aria-hidden />
                    {r.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                    {nSteps} steps · <span className="text-[var(--accent-orange)]">{nAi} by AI</span>
                    {moved ? ` · last moved ${fmtDate(moved)}` : ""}
                    {r.fieldGroup ? ` · ${r.fieldGroup}` : ""}
                  </p>
                </div>
                {/* Two things this cell must NOT do, both learned the hard way
                    on the long-gaps record. It must not use .math-prose, which
                    sets overflow-x: auto and gives every row its own
                    scrollbar. And it must not clip with text-ellipsis:
                    rendered math is a tree of absolutely positioned spans, so
                    cutting it off does not truncate a string, it strews
                    subscripts across the row. So the value WRAPS instead - the
                    compact form is a flat inline expression with no stacked
                    fraction, which is exactly what wraps cleanly - and the
                    strip takes a second line when it has to. */}
                <div className="min-w-0 basis-full text-sm leading-snug text-[var(--ink)] sm:basis-64 sm:text-right">
                  <div className="[&_.katex]:whitespace-normal">
                    {best ? (
                      <TeX>{best.valueShortTex ?? best.valueTex}</TeX>
                    ) : (
                      <span className="text-[var(--ink-muted)]">no published value</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    current best · {r.direction === "min" ? "lower is better" : "higher is better"}
                  </div>
                </div>
                <RecordSparkline rows={r.rows} direction={r.direction} />
              </li>
            );
          })}
        </ul>
      </section>

      {latest.length > 0 && (
        <section className="mt-8" aria-labelledby="records-latest">
          <h2 id="records-latest" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
            Latest movement
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {latest.map(({ record, row }) => (
              <LatestRow key={row.id} record={record} row={row} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function LatestRow({ record, row }: { record: RecordSummary; row: RecordRowView }) {
  const e = row.entry!;
  const isBest = frontier(record.rows, record.direction)?.id === row.id;
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 text-[var(--ink-secondary)]">
      <span className="tabular-nums text-xs text-[var(--ink-muted)]">{fmtDate(row.date)}</span>
      <Link href={`/record/${record.slug}`} className="text-[var(--ink)] hover:underline">
        {record.shortName}
      </Link>
      <span>→</span>
      {/* Wraps rather than clips, for the reason given on the strip above. */}
      <span className="min-w-0 text-[var(--ink)] [&_.katex]:whitespace-normal">
        <TeX>{row.valueShortTex ?? row.valueTex}</TeX>
      </span>
      <span className="text-xs">
        by {e.model} ·{" "}
        <Link href={`/problem/${e.slug}`} className="text-[var(--accent-blue)] hover:underline">
          entry
        </Link>
        {row.status === "candidate" && <span className="ml-1 text-[var(--status-warning)]">candidate</span>}
        {isBest && row.status !== "candidate" && <span className="ml-1 text-[var(--accent-orange)]">current best</span>}
      </span>
    </li>
  );
}
