import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProblemBySlug, getPublishedSlugs } from "@/lib/data";
import { ageAtSolve, type ProblemWithVotes } from "@/lib/problems";
import { DASH, SOLVE_TYPE, VERIFICATION } from "@/lib/display";
import { SITE_URL } from "@/lib/site";
import { StatusIcon } from "@/components/StatusIcon";
import { TeX, deTeX } from "@/components/TeX";
import { VoteButtons } from "@/components/VoteButtons";

function describe(p: ProblemWithVotes): string {
  if (p.statement) return p.statement;
  const verb = SOLVE_TYPE[p.solveType]?.label.toLowerCase() ?? "resolved";
  const maker = p.modelMaker ? ` (${p.modelMaker})` : "";
  return `${p.name} was ${verb} with ${p.model}${maker} in the loop, ${p.solveDate}.`;
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
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
  const p = await getProblemBySlug(slug);
  if (!p) notFound();
  const age = ageAtSolve(p);
  const v = VERIFICATION[p.verification];

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
    ["Field", p.field ?? DASH],
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
      "Notability",
      p.renownLangs > 0
        ? `${p.renownLangs} Wikipedia languages`
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
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All problems
      </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <h1 className="font-serif text-2xl text-[var(--ink)] sm:text-3xl">{p.name}</h1>
          <div className="shrink-0 pt-1">
            <VoteButtons
              slug={p.slug}
              upvotes={p.upvotes}
              downvotes={p.downvotes}
              size="lg"
            />
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
          <p className="mt-5 text-base leading-relaxed text-[var(--ink-secondary)]">
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

        {p.aiRole && (
          <section className="mt-6">
            <h2 className="font-serif text-lg text-[var(--ink)]">What the AI did</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{p.aiRole}</TeX>
            </p>
          </section>
        )}

        {p.verificationNote && (
          <section className="mt-6">
            <h2 className="font-serif text-lg text-[var(--ink)]">Verification</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{p.verificationNote}</TeX>
            </p>
          </section>
        )}

        <section className="mt-6">
          <h2 className="font-serif text-lg text-[var(--ink)]">Source</h2>
          <p className="mt-2 text-sm">
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-blue)] hover:underline"
            >
              {p.sourceName}
            </a>
          </p>
        </section>
    </main>
  );
}
