import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity, getComments, getFrontierBySlug, getFrontiers, type FrontierRowView } from "@/lib/data";
import { competes, bestRow, padDate, sortRows, steps } from "@/lib/frontiers";
import { FrontierChart } from "@/components/FrontierChart";
import { TeX } from "@/components/TeX";
import { Changelog } from "@/components/Changelog";
import { CommentsSection } from "@/components/CommentsSection";
import { ReportEntryDialog } from "@/components/ReportEntryDialog";
import { frontierSubject } from "@/lib/subject";

export async function generateStaticParams() {
  const frontiers = await getFrontiers();
  return frontiers.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getFrontierBySlug(slug);
  if (!r) return { title: "Frontier not found" };
  return {
    title: `${r.name} · Frontiers`,
    description: r.statement ?? r.quantity,
    alternates: { canonical: `/frontier/${r.slug}` },
  };
}

function fmtDate(d: string): string {
  if (d.length === 4) return d;
  const dt = new Date(padDate(d).slice(0, 10));
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: d.length >= 10 ? "numeric" : undefined, month: "short", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  published: "AI step",
  historical: "historical",
  candidate: "candidate",
  retracted: "retracted",
};

export default async function RecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A frontier carries the same community machinery as an entry: a changelog,
  // a discussion, and a way to flag it. More important here than on an entry,
  // in fact - a frontier asserts dated facts about other people's mathematics,
  // so "who put this number here, and when" has to be answerable, and a
  // reader who knows the history better than the curator needs a way to say
  // so. See src/lib/subject.ts for how one set of tables serves both.
  const subject = frontierSubject(slug);
  const [r, comments, activity] = await Promise.all([
    getFrontierBySlug(slug),
    getComments(subject),
    getActivity(subject),
  ]);
  if (!r) notFound();

  const best = bestRow(r.rows, r.direction);
  const stepped = steps(r.rows, r.direction);
  const stepOf = new Map(stepped.map((s) => [s.row.id, s.isStep]));
  // Table newest first: the reader came for the latest step.
  const rows = sortRows(r.rows, r.direction).reverse();
  const nAi = stepped.filter((s) => s.isStep && s.row.entry).length;
  const nSteps = stepped.filter((s) => s.isStep).length;
  const first = sortRows(r.rows, r.direction).find((x) => competes(x.status));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-5 sm:px-8 sm:pt-6">
      <Link href="/frontiers" className="text-sm text-[var(--accent-blue)] hover:underline">
        ← All frontiers
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="rounded border border-[var(--accent-orange)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-orange)]">
          Frontier
        </span>
        {r.fieldGroup && <span className="text-xs text-[var(--ink-muted)]">{r.fieldGroup}</span>}
        {r.significance !== null && (
          <span className="text-xs text-[var(--ink-muted)]" title={r.significanceNote ?? undefined}>
            significance {r.significance}
          </span>
        )}
        <span className="ml-auto">
          <ReportEntryDialog subject={subject} label="Report an issue with this frontier" />
        </span>
      </div>
      <h1 className="mt-1 font-serif text-2xl text-[var(--ink)] sm:text-3xl">{r.name}</h1>
      <p className="math-prose mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        <TeX>{r.quantity}</TeX>
      </p>

      {/* Current best, big. This is the one number the page exists to show. */}
      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-5 py-4">
        <div>
          <div className="text-xs text-[var(--ink-muted)]">
            Current best · {r.direction === "min" ? "lower is better" : "higher is better"}
          </div>
          <div className="math-prose mt-1 font-serif text-2xl text-[var(--ink)] sm:text-3xl">
            {best ? <TeX>{best.valueTex}</TeX> : <span className="text-[var(--ink-muted)]">none published</span>}
          </div>
          {best && (
            <div className="mt-1 text-sm text-[var(--ink-secondary)]">
              {best.attribution}, {fmtDate(best.date)}
              {best.entry && (
                <>
                  {" · "}
                  <Link href={`/problem/${best.entry.slug}`} className="text-[var(--accent-blue)] hover:underline">
                    entry
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        <dl className="ml-auto grid grid-cols-3 gap-x-6 text-right">
          <div>
            <dt className="text-[11px] text-[var(--ink-muted)]">steps</dt>
            <dd className="font-serif text-xl text-[var(--ink)]">{nSteps}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--ink-muted)]">by AI</dt>
            <dd className="font-serif text-xl text-[var(--accent-orange)]">{nAi}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--ink-muted)]">since</dt>
            <dd className="font-serif text-xl text-[var(--ink)]">{first ? first.date.slice(0, 4) : "–"}</dd>
          </div>
        </dl>
      </div>

      <section className="mt-6 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-3 sm:p-4">
        <FrontierChart rows={r.rows} direction={r.direction} />
        <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
          The line is the frontier over time. Filled dots are steps that moved it; muted dots are results that did not.
          Orange dots are catalog entries, results with AI in the loop. Hollow dots are candidates under review and
          never move the line. Hover a dot for its value and attribution.
        </p>
      </section>

      {r.statement && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">About this frontier</h2>
          <p className="math-prose mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            <TeX linkify>{r.statement}</TeX>
          </p>
        </section>
      )}

      <section className="mt-6" aria-labelledby="frontier-rows">
        <h2 id="frontier-rows" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Every step, newest first
        </h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--hairline)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-raised)] text-left text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">Who</th>
                <th className="px-3 py-2 font-medium">Model</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {rows.map((row) => (
                <Row key={row.id} row={row} isStep={stepOf.get(row.id) ?? false} isBest={best?.id === row.id} />
              ))}
            </tbody>
          </table>
        </div>
        {r.historyNote && (
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[var(--ink-muted)]">{r.historyNote}</p>
        )}
      </section>

      {/* Who changed what, and when. A frontier's rows are curator-entered
          assertions about dated facts, so this is the accountability the page
          rests on rather than a nicety. */}
      <Changelog activity={activity} />

      <CommentsSection subject={subject} initial={comments} />
    </main>
  );
}

function Row({ row, isStep, isBest }: { row: FrontierRowView; isStep: boolean; isBest: boolean }) {
  const ai = !!row.entry;
  const dim = !competes(row.status) || (!isStep && !ai);
  return (
    <tr className={`${ai ? "bg-[var(--paper-raised)]" : ""} ${dim ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"}`}>
      <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtDate(row.date)}</td>
      <td className="math-prose px-3 py-2">
        <TeX>{row.valueTex}</TeX>
        {isBest && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-orange)]">best</span>}
        {row.note && <div className="mt-0.5 text-xs text-[var(--ink-muted)]">{row.note}</div>}
      </td>
      <td className="px-3 py-2">
        {row.entry ? (
          <Link href={`/problem/${row.entry.slug}`} className="text-[var(--accent-blue)] hover:underline">
            {row.attribution}
          </Link>
        ) : (
          row.attribution
        )}
      </td>
      <td className="px-3 py-2 text-xs">{row.entry ? row.entry.model : <span className="text-[var(--ink-muted)]">–</span>}</td>
      <td className="px-3 py-2 text-xs">
        <span
          className={
            row.status === "candidate"
              ? "text-[var(--status-warning)]"
              : row.status === "retracted"
                ? "text-[var(--status-critical)]"
                : ai
                  ? "text-[var(--accent-orange)]"
                  : ""
          }
        >
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
        {row.entry && <div className="text-[var(--ink-muted)]">{row.entry.verification}</div>}
      </td>
      <td className="px-3 py-2 text-xs">
        {row.entry ? (
          <Link href={`/problem/${row.entry.slug}`} className="text-[var(--accent-blue)] hover:underline">
            entry
          </Link>
        ) : row.sourceUrl ? (
          <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">
            source ↗
          </a>
        ) : (
          <span className="text-[var(--ink-muted)]">–</span>
        )}
      </td>
    </tr>
  );
}
