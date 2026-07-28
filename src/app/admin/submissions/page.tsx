import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCommentDate } from "@/lib/comment-render";
import { resolveSnapshot } from "@/lib/identity";
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
  if (!isAdmin(session?.user?.email)) {
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
      createdAt: true,
      submittedBy: { select: { pseudonym: true } },
    },
  });

  const pending: PendingEntry[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    field: r.field,
    solveType: r.solveType,
    solveDate: r.solveDate,
    model: r.model,
    verification: r.verification,
    statement: r.statement,
    sourceUrl: r.sourceUrl,
    sourceName: r.sourceName,
    submittedBy: resolveSnapshot(r.submittedBy?.pseudonym ?? null, r.submittedBy !== null),
    submittedAt: formatCommentDate(r.createdAt),
  }));

  return (
    <>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {pending.length === 0
          ? "The queue is empty."
          : `${pending.length} ${pending.length === 1 ? "entry is" : "entries are"} waiting. Check the source before approving - approving publishes immediately.`}
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
