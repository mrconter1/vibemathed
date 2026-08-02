import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity, getComments, getProblemBySlug } from "@/lib/data";
import { ageAtSolve, type ProblemWithVotes } from "@/lib/problems";
import {
  AI_CONTRIBUTION,
  DASH,
  PUBLICATION,
  RESOLUTION,
  RESOLUTION_METHOD,
  SOLVE_TYPE,
  VERIFICATION,
} from "@/lib/display";
import { toEditableValues } from "@/lib/editable";
import { SITE_URL } from "@/lib/site";
import { Changelog } from "@/components/Changelog";
import { CommentsSection } from "@/components/CommentsSection";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { ReportEntryDialog } from "@/components/ReportEntryDialog";
import { StatusIcon } from "@/components/StatusIcon";
import { TeX, deTeX } from "@/components/TeX";
import { StarNote } from "@/components/Tooltip";
import { VoteButtons } from "@/components/VoteButtons";

function describe(p: ProblemWithVotes): string {
  if (p.statement) return p.statement;
  const verb = SOLVE_TYPE[p.solveType]?.label.toLowerCase() ?? "resolved";
  const maker = p.modelMaker ? ` (${p.modelMaker})` : "";
  return `${p.name} was ${verb} with ${p.model}${maker} in the loop, ${p.solveDate}.`;
}

// Prerender only the pages people actually land on cold - the newest 30 and
// everything significant - instead of the whole catalog: build time stays
// flat as the record grows, and the long tail renders on demand into the
// per-slug cache on first visit.
export async function generateStaticParams() {
  const { prisma } = await import("@/lib/prisma");
  const [recent, major] = await Promise.all([
    prisma.problem.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { slug: true },
    }),
    prisma.problem.findMany({
      where: { status: "published", significance: { gte: 35 } },
      select: { slug: true },
    }),
  ]);
  const slugs = new Set([...recent, ...major].map((r) => r.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProblemBySlug(slug);
  if (!p) return { title: "Problem not found" };
  const description = deTeX(describe(p)).slice(0, 200);
  return {
    title: p.name,
    description,
    alternates: { canonical: `/problem/${p.slug}` },
    openGraph: {
      type: "article",
      title: `${p.name} · VibeMathed`,
      description,
      url: `/problem/${p.slug}`,
    },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // All three reads in parallel - comments and activity do not depend on the
  // problem row, and a missing slug just returns empty lists from them.
  const [p, comments, activity] = await Promise.all([
    getProblemBySlug(slug),
    getComments(slug),
    getActivity(slug),
  ]);
  if (!p) notFound();
  const age = ageAtSolve(p);
  const v = VERIFICATION[p.verification];
  // Built from data the page already has, so opening the editor costs no query.
  const editable = toEditableValues(p);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.name,
      description: deTeX(describe(p)),
      datePublished: p.solveDate,
      url: `${SITE_URL}/problem/${p.slug}`,
      about: p.field ?? "Mathematics",
      isPartOf: { "@type": "Dataset", name: "VibeMathed", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VibeMathed", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: p.name,
          item: `${SITE_URL}/problem/${p.slug}`,
        },
      ],
    },
  ];

  const facts: [string, string][] = [
    [
      "Result",
      (SOLVE_TYPE[p.solveType]?.label ?? p.solveType) +
        (p.resultNote ? ` (${p.resultNote})` : ""),
    ],
    ["Status", RESOLUTION[p.resolution]?.label ?? p.resolution],
    // DASH, not a default tier: most of the catalog predates this axis and an
    // unclassified entry must not claim a degree of involvement.
    [
      "AI contribution",
      p.aiContribution ? (AI_CONTRIBUTION[p.aiContribution]?.label ?? p.aiContribution) : DASH,
    ],
    // The decisive step: object, certificate, or conceptual proof.
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
    // Orthogonal to verification: where the claim lives in the pipeline.
    [
      "Publication",
      p.publication ? (PUBLICATION[p.publication]?.label ?? p.publication) : DASH,
    ],
    // The AI-estimated problem weight (see methodology); dash until assessed.
    ["Significance", p.significance !== null && p.significance !== undefined ? `${p.significance} / 100` : DASH],
    // What this site ran itself, if anything. Orthogonal to Verification.
    [
      "Reproduced here",
      p.reproducedAt
        ? new Date(p.reproducedAt).toISOString().slice(0, 10)
        : DASH,
    ],
    [
      "Wikipedia",
      p.renownLangs > 0
        ? `${p.renownLangs} ${p.renownLangs === 1 ? "language" : "languages"}`
        : p.renownNote
          ? "Not counted (article postdates the solution)"
          : "No dedicated article",
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        <span aria-hidden>←</span>
        All problems
      </Link>

      {/* The entry itself sits on a raised sheet, like the cards it came
          from - on the cream page the content used to float with nothing
          holding it. Discussion and changelog stay outside, as separate
          surfaces below. */}
      <article className="mt-4 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-2xl text-[var(--ink)] sm:text-3xl">{p.name}</h1>
          {/* One control corner: votes, then the two quiet icon affordances
              (report, edit) in the same bordered idiom. Four controls in a
              row is ~200px, which crushes long titles on phones - below sm
              the corner stacks into two rows of two (votes above, icons
              below), right-aligned. */}
          <div className="flex shrink-0 flex-col items-end gap-1.5 pt-1 sm:flex-row sm:items-start">
            <VoteButtons
              slug={p.slug}
              upvotes={p.upvotes}
              downvotes={p.downvotes}
              size="lg"
            />
            <div className="flex gap-1.5">
              <ReportEntryDialog slug={p.slug} />
              <EditEntryDialog slug={p.slug} initial={editable} />
            </div>
          </div>
        </div>

        {p.problemNumber !== null && (
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Erdős problem #{p.problemNumber} ·{" "}
            <a
              href={`https://www.erdosproblems.com/${p.problemNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-blue)] hover:underline"
            >
              erdosproblems.com/{p.problemNumber}
            </a>
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
                {/* The stored one-line justification for the score. */}
                {k === "Significance" && p.significanceNote && (
                  <StarNote text={p.significanceNote} />
                )}
                {k === "Reproduced here" && p.reproducedNote && (
                  <StarNote text={p.reproducedNote} />
                )}
              </dd>
            </div>
          ))}
        </dl>

        {p.aiRole && (
          <section className="mt-6">
            <h2 className="font-serif text-lg text-[var(--ink)]">What the AI did</h2>
            <p className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{p.aiRole}</TeX>
            </p>
          </section>
        )}

        {p.verificationNote && (
          <section className="mt-6">
            <h2 className="font-serif text-lg text-[var(--ink)]">Verification</h2>
            <p className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{p.verificationNote}</TeX>
            </p>
          </section>
        )}

        {/* A documented issue with the claim itself. Deliberately loud: this
            is the one note a reader must not miss. */}
        {p.claimIssueNote && (
          <section className="mt-6 rounded-md border border-[color-mix(in_srgb,var(--status-critical)_45%,transparent)] bg-[color-mix(in_srgb,var(--status-critical)_6%,transparent)] px-4 py-3">
            <h2 className="flex items-center gap-2 font-serif text-lg text-[var(--status-critical)]">
              <StatusIcon kind="alert" color="var(--status-critical)" />
              Claim issue
            </h2>
            <p className="math-prose mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{p.claimIssueNote}</TeX>
            </p>
          </section>
        )}

        <section className="mt-6">
          <h2 className="font-serif text-lg text-[var(--ink)]">
            {(p.links ?? []).length > 0 ? "Sources" : "Source"}
          </h2>
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

        {/* Contributor credit. Deliberately readable rather than a muted
            footnote: the person who brought this entry in gets named, here and
            on their card on the front page. */}
        {p.submittedBy && (
          <p className="mt-6 text-sm text-[var(--ink-secondary)]">
            Submitted by{" "}
            <Link
              href={`/user/${encodeURIComponent(p.submittedBy)}`}
              className="font-medium text-[var(--ink)] hover:text-[var(--accent-blue)] hover:underline"
            >
              {p.submittedBy}
            </Link>
          </p>
        )}

      </article>

      <Changelog activity={activity} />

      <CommentsSection slug={p.slug} initial={comments} />
    </main>
  );
}
