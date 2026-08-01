import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/data";
import { RESOLUTION, SOLVE_TYPE } from "@/lib/display";
import type { ResolutionStatus, SolveType } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { Icon, type IconName } from "@/components/Icons";

// A member's public page: pseudonym, join date, published entries, comments
// and edit history. Read-only by design - nothing here is editable, and
// nothing private (email, OAuth identity, pending submissions) ever reaches
// this page; see getUserProfile.

// Params arrive percent-encoded for pseudonyms with spaces; decode
// defensively so a malformed URL 404s instead of crashing.
function decodeParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// Prebuild the members with published entries; everyone else (comment-only
// members) renders on demand. Also what lets the PPR build prerender this
// dynamic route at all.
export async function generateStaticParams() {
  const { prisma } = await import("@/lib/prisma");
  const users = await prisma.user.findMany({
    where: {
      pseudonym: { not: null },
      submittedProblems: { some: { status: "published" } },
    },
    select: { pseudonym: true },
  });
  return users
    .filter((u): u is { pseudonym: string } => u.pseudonym !== null)
    .map((u) => ({ pseudonym: u.pseudonym }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pseudonym: string }>;
}): Promise<Metadata> {
  const { pseudonym: raw } = await params;
  const profile = await getUserProfile(decodeParam(raw));
  if (!profile) return { title: "Member not found" };
  const description = `${profile.pseudonym} on VibeMathed: ${profile.entries.length} ${
    profile.entries.length === 1 ? "entry" : "entries"
  }, ${profile.commentCount} ${profile.commentCount === 1 ? "comment" : "comments"}, member since ${profile.joined}.`;
  return {
    title: profile.pseudonym,
    description,
    alternates: { canonical: `/user/${encodeURIComponent(profile.pseudonym)}` },
    openGraph: {
      type: "profile",
      title: `${profile.pseudonym} · VibeMathed`,
      description,
      url: `/user/${encodeURIComponent(profile.pseudonym)}`,
    },
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ pseudonym: string }>;
}) {
  const { pseudonym: raw } = await params;
  const profile = await getUserProfile(decodeParam(raw));
  if (!profile) notFound();

  const tiles: { icon: IconName; label: string; value: string }[] = [
    { icon: "layers", label: "Entries", value: String(profile.entries.length) },
    { icon: "bubble", label: "Comments", value: String(profile.commentCount) },
    { icon: "pulse", label: "Edits", value: String(profile.editCount) },
    {
      icon: "votes",
      label: "Entry score",
      value: `${profile.entryScore >= 0 ? "+" : ""}${profile.entryScore}`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.pseudonym,
      url: `${SITE_URL}/user/${encodeURIComponent(profile.pseudonym)}`,
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All problems
      </Link>

      <header className="mt-4">
        <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">
          {profile.pseudonym}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
          Member since {profile.joined}
        </p>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
          >
            <dt className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Icon name={t.icon} />
              {t.label}
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">{t.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-[var(--ink)]">Entries</h2>
        {profile.entries.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">Nothing published yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {profile.entries.map((e) => {
              const st = SOLVE_TYPE[e.solveType as SolveType];
              const res = RESOLUTION[e.resolution as ResolutionStatus];
              return (
                <li
                  key={e.slug}
                  className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
                >
                  <Link
                    href={`/problem/${e.slug}`}
                    className="font-serif text-base text-[var(--ink)] hover:text-[var(--accent-blue)] hover:underline"
                  >
                    {e.name}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-[var(--ink-muted)]">
                    {st && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="text-[var(--ink-secondary)]">{st.label}</span>
                      </span>
                    )}
                    {res?.pill && <span style={{ color: res.color }}>{res.pill}</span>}
                    <span>Solved {e.solveDate}</span>
                    <span>
                      Score{" "}
                      <span className="text-[var(--ink-secondary)]">
                        {e.score >= 0 ? `+${e.score}` : e.score}
                      </span>
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-[var(--ink)]">Comments</h2>
        {profile.comments.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">No comments yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {profile.comments.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
              >
                <p className="text-xs text-[var(--ink-muted)]">
                  On{" "}
                  <Link
                    href={`/problem/${c.problemSlug}#discussion`}
                    className="text-[var(--accent-blue)] hover:underline"
                  >
                    {c.problemName}
                  </Link>{" "}
                  · {c.createdAt}
                </p>
                <div
                  className="comment-body mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]"
                  dangerouslySetInnerHTML={{ __html: c.html }}
                />
              </li>
            ))}
          </ul>
        )}
        {profile.commentCount > profile.comments.length && (
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            Showing the latest {profile.comments.length} of {profile.commentCount}.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-[var(--ink)]">Recent edits</h2>
        {profile.edits.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">No edits yet.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-sm">
            {profile.edits.map((a) => (
              <li key={a.id} className="text-[var(--ink-secondary)]">
                {a.field ?? "Entry"} on{" "}
                <Link
                  href={`/problem/${a.problemSlug}`}
                  className="text-[var(--accent-blue)] hover:underline"
                >
                  {a.problemName}
                </Link>{" "}
                <span className="text-xs text-[var(--ink-muted)]">· {a.createdAt}</span>
              </li>
            ))}
          </ul>
        )}
        {profile.editCount > profile.edits.length && (
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            Showing the latest {profile.edits.length} of {profile.editCount}.
          </p>
        )}
      </section>
    </main>
  );
}
