import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { canReview } from "@/lib/curators";
import { prisma } from "@/lib/prisma";
import { formatCommentDateTime } from "@/lib/comment-render";
import { resolveSnapshot } from "@/lib/identity";
import { texToHtml } from "@/components/TeX";
import { ReviewQueue, type PendingEntry } from "@/components/ReviewQueue";

export const metadata: Metadata = {
  title: "Review submissions",
  robots: { index: false, follow: false },
};

/// The dynamic half: reads the session and the pending queue.
///
/// Split out and wrapped in <Suspense> by the page below because Cache
/// Components refuses to prerender a route that touches uncached data outside a
/// boundary - `auth()` reads cookies, so without this the whole route fails to
/// build.
///
/// Queried directly rather than through a cached reader on purpose: pending
/// entries are unpublished content, and keeping them out of the shared cache
/// removes any chance of one leaking into a public response.
async function Queue() {
  const session = await auth();
  if (!canReview(session?.user)) {
    return (
      <div>
        <p className="text-sm text-[var(--ink-secondary)]">
          This page is for reviewers.{" "}
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            Back to all entries
          </Link>
          .
        </p>
      </div>
    );
  }

  const rows = await prisma.problem.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      slug: true,
      name: true,
      field: true,
      solveType: true,
      solveDate: true,
      model: true,
      verification: true,
      statement: true,
      sourceUrl: true,
      sourceName: true,
      submitterNote: true,
      createdAt: true,
      submittedBy: { select: { pseudonym: true } },
      reviewNotes: {
        orderBy: { createdAt: "asc" },
        select: { id: true, userName: true, body: true, createdAt: true },
      },
    },
  });

  const pending: PendingEntry[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    // Every field that can hold math is rendered HERE, on the server. The
    // client component below must not import KaTeX, and until this was done
    // for the name and the note it did, through TeX, on exactly this page.
    nameHtml: texToHtml(r.name),
    field: r.field,
    solveType: r.solveType,
    solveDate: r.solveDate,
    model: r.model,
    verification: r.verification,
    // Rendered here so the review card shows the math exactly as it would
    // publish; ReviewQueue is a client component and must not pull in KaTeX.
    statementHtml: r.statement ? texToHtml(r.statement) : null,
    sourceUrl: r.sourceUrl,
    sourceName: r.sourceName,
    submitterNoteHtml: r.submitterNote ? texToHtml(r.submitterNote, { linkify: true }) : null,
    submittedBy: resolveSnapshot(r.submittedBy?.pseudonym ?? null, r.submittedBy !== null),
    // Raw pseudonym for the profile link; null when there is no account to
    // link (the display name then renders unlinked).
    submittedByPseudonym: r.submittedBy?.pseudonym ?? null,
    canDeliver: r.submittedBy !== null,
    // Date AND time: three spam entries in one night made clear that "when
    // exactly" matters when reviewing a queue.
    submittedAt: formatCommentDateTime(r.createdAt),
    notes: r.reviewNotes.map((n) => ({
      id: n.id,
      userName: n.userName ?? "Curator",
      body: n.body,
      createdAt: formatCommentDateTime(n.createdAt),
    })),
  }));

  return (
    <>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {pending.length === 0
          ? "The queue is empty."
          : `${pending.length} ${pending.length === 1 ? "entry is" : "entries are"} waiting. Check the source before approving - approving publishes immediately.`}{" "}
        The checklist is{" "}
        <a
          href="https://github.com/mrconter1/vibemathed/blob/main/docs/reviewing.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent-blue)] hover:underline"
        >
          docs/reviewing.md
        </a>
        .
      </p>
      <ReviewQueue pending={pending} />
    </>
  );
}

export default function ReviewSubmissionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All entries
      </Link>

      <h1 className="mt-4 mb-6 font-serif text-3xl tracking-tight text-[var(--ink)]">
        Review submissions
      </h1>

      <Suspense
        fallback={
          <div className="h-24 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        }
      >
        <Queue />
      </Suspense>
    </main>
  );
}
