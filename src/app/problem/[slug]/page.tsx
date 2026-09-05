import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity, getComments, getProblemBySlug, getProvenance, getRelations } from "@/lib/data";
import { AiMark } from "@/components/AiMark";
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
import { formatCommentDate } from "@/lib/comment-render";
import { toEditableValues } from "@/lib/editable";
import { groupLinksByKind, inferLinkKind } from "@/lib/link-kinds";
import { FrontierMembership } from "@/components/FrontierMembership";
import { problemSubject } from "@/lib/subject";
import { SITE_URL } from "@/lib/site";
import { withFallbackParam } from "@/lib/static-params";
import { Icon, type IconName } from "@/components/Icons";
import { Changelog } from "@/components/Changelog";
import { RelativeTime } from "@/components/RelativeTime";
import { CommentsSection } from "@/components/CommentsSection";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { RelatedEntries } from "@/components/RelatedEntries";
import { ReportEntryDialog } from "@/components/ReportEntryDialog";
import { StatusIcon } from "@/components/StatusIcon";
import { TeX, deTeX } from "@/components/TeX";
import { StarNote } from "@/components/Tooltip";
import { VoteButtons } from "@/components/VoteButtons";

function describe(p: ProblemWithVotes): string {
  if (p.statement) return p.statement;
  const verb = SOLVE_TYPE[p.solveType]?.label.toLowerCase() ?? "resolved";
  const maker = p.modelMaker ? ` (${p.modelMaker})` : "";
  return `${deTeX(p.name)} was ${verb} with ${p.model}${maker} in the loop, ${p.solveDate}.`;
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
  // Same guard as the profile route: an unseeded database has no published
  // entries, and returning nothing here fails the build outright.
  return withFallbackParam(
    [...slugs].map((slug) => ({ slug })),
    "slug",
  );
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
    title: deTeX(p.name),
    description,
    alternates: { canonical: `/problem/${p.slug}` },
    openGraph: {
      type: "article",
      title: `${deTeX(p.name)} · VibeMathed`,
      description,
      url: `/problem/${p.slug}`,
    },
    // Explicit, because Next merges metadata per top-level key: this page
    // replaced `openGraph` but inherited the layout's `twitter` block whole,
    // and X prefers twitter:* tags - so every shared entry carried the
    // generic site title instead of its own. The image comes from the
    // sibling opengraph-image.tsx and needs no listing here.
    twitter: {
      card: "summary_large_image",
      title: `${deTeX(p.name)} · VibeMathed`,
      description,
    },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // All four reads in parallel - none depends on another, and a missing slug
  // just returns empty lists from the secondary ones.
  const [p, comments, activity, relations, provenance] = await Promise.all([
    getProblemBySlug(slug),
    getComments(problemSubject(slug)),
    getActivity(problemSubject(slug)),
    getRelations(slug),
    getProvenance(slug),
  ]);
  if (!p) notFound();
  // Per-field AI provenance, keyed by field, for the markers beside headings.
  const prov = new Map(provenance.map((r) => [r.field, r]));
  const age = ageAtSolve(p);
  const v = VERIFICATION[p.verification];
  // Built from data the page already has, so opening the editor costs no query.
  const editable = toEditableValues(p);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: deTeX(p.name),
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
          name: deTeX(p.name),
          item: `${SITE_URL}/problem/${p.slug}`,
        },
      ],
    },
  ];

  const facts: [string, string][] = [
    // The qualifier does NOT go in the cell. A grid cell is half the viewport
    // on mobile, so even a note at the 200-character field cap runs to eight
    // lines there and drags the whole row down while the cell beside it sits
    // empty. The cell links to the prose block below instead.
    ["Result", SOLVE_TYPE[p.solveType]?.label ?? p.solveType],
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
    // Disclosed compute spend. Almost always a dash: it is recorded only
    // when a source states it, never inferred from model pricing.
    [
      "Disclosed cost",
      p.solveCostUsd !== null && p.solveCostUsd !== undefined
        ? `$${p.solveCostUsd.toLocaleString("en-US")}`
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
      {/* The entry itself sits on a raised sheet, like the cards it came
          from - on the cream page the content used to float with nothing
          holding it. Discussion and changelog stay outside, as separate
          surfaces below. */}
      <article className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="math-prose font-serif text-2xl text-[var(--ink)] sm:text-3xl">
            <TeX>{p.name}</TeX>
          </h1>
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
              <ReportEntryDialog subject={problemSubject(p.slug)} />
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
            <TeX linkify>{p.statement}</TeX>
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-[var(--hairline)] py-5 text-sm sm:grid-cols-3">
          {facts.map(([k, value]) => (
            <div key={k}>
              <dt className="text-xs text-[var(--ink-muted)]">{k}</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-[var(--ink)]">
                {k === "Verification" && v && <StatusIcon kind={v.icon} color={v.color} />}
                {value}
                {/* A word rather than an asterisk: a reader who never taps it
                    still learns that the headline claim is qualified. */}
                {k === "Result" && p.resultNote && (
                  <a
                    href="#result-note"
                    className="text-xs text-[var(--accent-blue)] hover:underline"
                  >
                    (see note)
                  </a>
                )}
                {/* The stored one-line justification for the score. */}
                {k === "Significance" && p.significanceNote && (
                  <StarNote text={p.significanceNote} />
                )}
                {k === "Significance" && <AiMark provenance={prov.get("significance")} />}
                {k === "Disclosed cost" && p.solveCostNote && (
                  <StarNote text={p.solveCostNote} />
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* First of the prose sections, because it qualifies the headline
            claim rather than elaborating on it. */}
        {p.resultNote && (
          <section id="result-note" className="mt-6 scroll-mt-24">
            <h2 className="flex items-center gap-2 font-serif text-lg text-[var(--ink)]">
              What was actually shown
              <AiMark provenance={prov.get("resultNote")} />
            </h2>
            <p className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX linkify>{p.resultNote}</TeX>
            </p>
          </section>
        )}

        {p.aiRole && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 font-serif text-lg text-[var(--ink)]">
              What the AI did
              <AiMark provenance={prov.get("aiRole")} />
            </h2>
            <p className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX linkify>{p.aiRole}</TeX>
            </p>
          </section>
        )}

        {p.verificationNote && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 font-serif text-lg text-[var(--ink)]">
              Verification
              <AiMark provenance={prov.get("verificationNote")} />
            </h2>
            <p className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX linkify>{p.verificationNote}</TeX>
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
              <TeX linkify>{p.claimIssueNote}</TeX>
            </p>
          </section>
        )}

        <section className="mt-6">
          <h2 className="font-serif text-lg text-[var(--ink)]">
            {(p.links ?? []).length > 0 ? "Sources" : "Source"}
          </h2>
          {/* Grouped by what each link IS, not the order they were added.
              A dozen links used to be one undifferentiated list where the
              Lean proof, the paper and somebody else's independent proof all
              read the same; the kind carries that now, so the label is free
              to say only what is specific to this one.

              The primary source is in this list too, though it is a column on
              Problem rather than a row in the links table. It used to render
              as a bare line above the list: the same kind of thing as the
              links, drawn in a different idiom, which made an entry look like
              it had two paper slots and no rule for which one to use. It gets
              typed by the same inference the links do, and being the citation
              shows as weight rather than as a block of its own. */}
          <ul className="mt-2.5 space-y-1.5 text-sm">
            {groupLinksByKind([
              {
                url: p.sourceUrl,
                label: p.sourceName,
                kind: inferLinkKind(p.sourceUrl, p.sourceName),
                primary: true,
              },
              ...(p.links ?? []).map((l) => ({ ...l, primary: false })),
            ]).map(({ spec, links }) => (
              <li key={spec.value} className="flex gap-2">
                <span
                  className="mt-0.5 shrink-0 text-[var(--ink-muted)]"
                  title={spec.help}
                  aria-hidden
                >
                  <Icon name={spec.icon as IconName} size={14} />
                </span>
                <span className="min-w-0">
                  <span className="mr-2 text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
                    {spec.label}
                  </span>
                  {links.map((l, i) => (
                    <span key={l.url}>
                      {i > 0 && (
                        <span aria-hidden className="text-[var(--hairline)]">
                          {" · "}
                        </span>
                      )}
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={l.primary ? "Primary source: the entry's citation" : undefined}
                        className={`break-words text-[var(--accent-blue)] hover:underline${
                          l.primary ? " font-medium" : ""
                        }`}
                      >
                        {l.label || spec.label}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Typed edges to other catalog entries, both directions, with the
            why-they-connect note in a hover card. Renders nothing when the
            entry has no relations, which is most of the catalog. */}
        <RelatedEntries relations={relations} />

        {/* Which record(s) this entry is a step on, if any. Almost always
            nothing; when it renders it is the most useful line on the page. */}
        <FrontierMembership slug={slug} />

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
            {/* When it arrived. Safe to show here and only here: `addedAt` is
                row creation, and for the curated baseline every row was seeded
                within the same few seconds, so that timestamp is insertion
                order rather than information. This block renders only for
                community submissions, where the row really was created when
                the entry was sent in. */}
            <span className="text-[var(--ink-muted)]">
              {" on "}
              <RelativeTime iso={p.addedAt} fallback={formatCommentDate(new Date(p.addedAt))} />
            </span>
          </p>
        )}

      </article>

      <Changelog activity={activity} />

      <CommentsSection subject={problemSubject(p.slug)} initial={comments} />
    </main>
  );
}
