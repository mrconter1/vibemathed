import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { problems, ageAtSolve, type MathProblem } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";
import { TeX, deTeX } from "@/components/TeX";

const SOLVE_LABEL: Record<string, string> = {
  proved: "Proved",
  disproved: "Disproved",
  partial: "Partial",
  resolved: "Resolved",
};

const VERIFICATION_LABEL: Record<string, string> = {
  "lean-verified": "Lean-verified",
  "expert-verified": "Expert-verified",
  "site-confirmed": "Site-confirmed",
  "preprint-unrefereed": "Preprint (unrefereed)",
  "announced-unreviewed": "Announced (unreviewed)",
  contested: "Contested",
};

const DASH = "—";

function bySlug(slug: string): MathProblem | undefined {
  return problems.find((p) => p.slug === slug);
}

function describe(p: MathProblem): string {
  if (p.statement) return p.statement;
  const verb = SOLVE_LABEL[p.solveType]?.toLowerCase() ?? "resolved";
  const maker = p.modelMaker ? ` (${p.modelMaker})` : "";
  return `${p.name} was ${verb} with ${p.model}${maker} in the loop, ${p.solveDate}.`;
}

export function generateStaticParams() {
  return problems.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
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
  const p = bySlug(slug);
  if (!p) notFound();
  const age = ageAtSolve(p);

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
        { "@type": "ListItem", position: 2, name: p.name, item: `${SITE_URL}/problem/${p.slug}` },
      ],
    },
  ];

  const facts: [string, string][] = [
    ["Result", SOLVE_LABEL[p.solveType] ?? p.solveType],
    ["Field", p.field ?? DASH],
    ["Posed by", p.posedBy ?? DASH],
    ["Year posed", p.yearPosed?.toString() ?? DASH],
    ["Years open", age !== null ? `${age}y` : DASH],
    ["Solved", p.solveDate],
    ["Model", p.model],
    ["Vendor", p.modelMaker ?? DASH],
    ["Collaborators", p.humanCollaborators.length ? p.humanCollaborators.join(", ") : DASH],
    ["Verification", VERIFICATION_LABEL[p.verification] ?? p.verification],
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
    <div className="flex flex-1 justify-center px-3 py-6 sm:px-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full max-w-3xl rounded-lg border border-[var(--mat-border)] bg-[var(--paper)] px-4 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.18)] sm:px-10 sm:py-12">
        <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
          ← All problems
        </Link>

        <h1 className="mt-4 font-serif text-2xl text-[var(--ink)] sm:text-3xl">{p.name}</h1>

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
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-[var(--ink-muted)]">{k}</dt>
              <dd className="mt-0.5 text-[var(--ink)]">{v}</dd>
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

        <footer className="mt-10 border-t border-[var(--hairline)] pt-6 text-xs text-[var(--ink-muted)]">
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            All problems
          </Link>
          {" · "}
          <a
            href="mailto:rasmus.lindahl1996@gmail.com?subject=VibeMathed"
            className="text-[var(--accent-blue)] hover:underline"
          >
            Contact
          </a>
          {" · "}
          <SocialLinks className="ml-1" />
        </footer>
      </main>
    </div>
  );
}
