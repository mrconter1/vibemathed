import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { canReview } from "@/lib/curators";
import { prisma } from "@/lib/prisma";
import { formatCommentDateTime } from "@/lib/comment-render";
import { ReportsList, type OpenReport } from "@/components/ReportsList";

export const metadata: Metadata = {
  title: "Review reports",
  robots: { index: false, follow: false },
};

/// The dynamic half, split out for the same Cache Components reason as the
/// submissions queue: `auth()` reads cookies, so it must sit behind a
/// Suspense boundary for the route to prerender. Queried directly rather
/// than through a cached reader - reports are private curator mail.
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

  const rows = await prisma.problemReport.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      userId: true,
      userName: true,
      user: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true } },
      frontier: { select: { slug: true, name: true } },
    },
  });

  const reports: OpenReport[] = rows.map((r) => ({
    id: r.id,
    body: r.body,
    // Live pseudonym when the account still exists (it also carries the
    // profile link); the snapshot covers deleted accounts.
    reporter: r.user?.pseudonym ?? r.userName ?? "deleted account",
    reporterPseudonym: r.user?.pseudonym ?? null,
    // The account, not the pseudonym: a member who has not been assigned a
    // display name yet is still reachable.
    canReply: r.userId !== null,
    // A report hangs off exactly one of the two; the record side exists
    // because a record's historical rows assert facts about other people's
    // work, which is precisely what somebody will want to flag.
    subjectHref: r.problem ? `/problem/${r.problem.slug}` : `/frontier/${r.frontier?.slug ?? ""}`,
    subjectName: r.problem?.name ?? r.frontier?.name ?? "(deleted)",
    subjectKind: r.problem ? "entry" : "record",
    reportedAt: formatCommentDateTime(r.createdAt),
  }));

  return (
    <>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {reports.length === 0
          ? "No open reports."
          : `${reports.length} open ${reports.length === 1 ? "report" : "reports"}. Marking one handled removes it from this queue but keeps it on record.`}
      </p>
      <ReportsList reports={reports} />
    </>
  );
}

export default function ReviewReportsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All entries
      </Link>

      <h1 className="mt-4 mb-6 font-serif text-3xl tracking-tight text-[var(--ink)]">
        Review reports
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
