import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PROBLEM_SELECT, toProblem } from "@/lib/data";
import { ageAtSolve } from "@/lib/problems";
import {
  AI_CONTRIBUTION,
  DASH,
  PUBLICATION,
  RESOLUTION,
  RESOLUTION_METHOD,
  SOLVE_TYPE,
  VERIFICATION,
} from "@/lib/display";
import { StatusIcon } from "@/components/StatusIcon";
import { TeX } from "@/components/TeX";

// Reviewer's view of an entry that is not public yet.
//
// The public entry route deliberately serves only published rows from a
// cached, prerendered shell; making it peek at the session would turn every
// entry page dynamic. So unpublished entries get their own route, gated on
// the admin check.
//
// The slug is a SEARCH param rather than a path segment on purpose: under
// Cache Components a dynamic segment makes the header's usePathname()
// unknowable at build time, so the shared layout cannot prerender and the
// whole route fails to build. A static path keeps the shell prerenderable
// and puts every uncached read inside the Suspense boundary below.

export const metadata: Metadata = {
  title: "Entry preview",
  robots: { index: false, follow: false },
};

// Takes the params PROMISE, not the resolved value: awaiting it in the page
// body would be uncached data outside <Suspense>, which Cache Components
// rejects because it blocks the whole shell from prerendering.
async function Preview({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  if (!slug) notFound();
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

  // Any status, unlike the public reader.
  const row = await prisma.problem.findUnique({
    where: { slug },
    select: { ...PROBLEM_SELECT, status: true },
  });
  if (!row) notFound();
  const p = toProblem(row);
  // Outside PROBLEM_SELECT and MathProblem on purpose: this note is never
  // supposed to publish, and keeping it out of the shared shape is what makes
  // that true by construction rather than by every future caller remembering
  // to omit it.
  const submitterNote = (
    await prisma.problem.findUnique({ where: { slug }, select: { submitterNote: true } })
  )?.submitterNote;
  const age = ageAtSolve(p);
  const v = VERIFICATION[p.verification];

  const facts: [string, string][] = [
    ["Status in review", row.status],
    [
      "Result",
      (SOLVE_TYPE[p.solveType]?.label ?? p.solveType) +
        (p.resultNote ? ` (${p.resultNote})` : ""),
    ],
    ["Resolution", RESOLUTION[p.resolution]?.label ?? p.resolution],
    [
      "AI contribution",
      p.aiContribution ? (AI_CONTRIBUTION[p.aiContribution]?.label ?? p.aiContribution) : DASH,
    ],
    [
      "Method",
      p.resolutionMethod
        ? (RESOLUTION_METHOD[p.resolutionMethod]?.label ?? p.resolutionMethod)
        : DASH,
    ],
    ["Field", p.field ?? p.fieldGroup ?? DASH],
    ["Posed by", p.posedBy ?? DASH],
    ["Year posed", p.yearPosed?.toString() ?? DASH],
    ["Years open", age !== null ? `${age}y` : DASH],
    ["Solved", p.solveDate],
    ["Model", p.model],
    ["Vendor", p.modelMaker ?? DASH],
    [
      "Collaborators",
      p.humanCollaborators.length ? p.humanCollaborators.join(", ") : DASH,
    ],
    ["Verification", v?.label ?? p.verification],
    [
      "Publication",
      p.publication ? (PUBLICATION[p.publication]?.label ?? p.publication) : DASH,
    ],
    [
      "Significance",
      p.significance !== null && p.significance !== undefined
        ? `${p.significance} / 100`
        : DASH,
    ],
    [
      "Disclosed cost",
      p.solveCostUsd !== null && p.solveCostUsd !== undefined
        ? `$${p.solveCostUsd.toLocaleString("en-US")}`
        : DASH,
    ],
  ];

  const notes: [string, string | null | undefined][] = [
    ["What the AI did", p.aiRole],
    ["Verification note", p.verificationNote],
    ["Claim issue", p.claimIssueNote],
    ["Significance note", p.significanceNote],
    ["Cost note", p.solveCostNote],
  ];

  return (
    <article className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="font-serif text-2xl text-[var(--ink)] sm:text-3xl"><TeX>{p.name}</TeX></h2>
      {p.submittedBy && (
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Submitted by{" "}
          <Link
            href={`/user/${encodeURIComponent(p.submittedBy)}`}
            className="text-[var(--accent-blue)] hover:underline"
          >
            {p.submittedBy}
          </Link>
        </p>
      )}

      {p.statement && (
        <p className="math-prose mt-5 text-base leading-relaxed text-[var(--ink-secondary)]">
          <TeX>{p.statement}</TeX>
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-[var(--hairline)] py-5 text-sm sm:grid-cols-3">
        {facts.map(([k, value]) => (
          <div key={k}>
            <dt className="text-xs text-[var(--ink-muted)]">{k}</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-[var(--ink)]">
              {k === "Verification" && v && <StatusIcon kind={v.icon} color={v.color} />}
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {notes.map(([label, body]) =>
        body ? (
          <section key={label} className="mt-6">
            <h3 className="font-serif text-lg text-[var(--ink)]">{label}</h3>
            <p className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{body}</TeX>
            </p>
          </section>
        ) : null,
      )}

      {submitterNote && (
        <section className="mt-6 rounded-md border border-[color-mix(in_srgb,var(--accent-blue)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_6%,transparent)] px-4 py-3">
          <h3 className="font-serif text-lg text-[var(--ink)]">
            Note from the submitter <span className="text-xs font-sans text-[var(--ink-muted)]">(not published)</span>
          </h3>
          <p className="math-prose mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
            <TeX>{submitterNote}</TeX>
          </p>
        </section>
      )}

      <section className="mt-6">
        <h3 className="font-serif text-lg text-[var(--ink)]">Sources</h3>
        <p className="mt-2 text-sm">
          <a
            href={p.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words text-[var(--accent-blue)] hover:underline"
          >
            {p.sourceName}
          </a>
        </p>
        {(p.links ?? []).length > 0 && (
          <ul className="mt-1.5 space-y-1 text-sm">
            {(p.links ?? []).map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words text-[var(--accent-blue)] hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

export default function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        <span aria-hidden>←</span>
        Review queue
      </Link>

      <p className="mt-4 rounded-md border border-[color-mix(in_srgb,var(--accent-orange)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent-orange)_6%,transparent)] px-3 py-2 text-xs text-[var(--ink-secondary)]">
        Reviewer preview. This entry is not visible to anyone else yet.
      </p>

      <div className="mt-4">
        <Suspense
          fallback={
            <div className="h-64 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]" />
          }
        >
          <Preview searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
