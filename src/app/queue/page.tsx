import type { Metadata } from "next";
import Link from "next/link";
import { getPendingQueue } from "@/lib/data";
import { RelativeTime } from "@/components/RelativeTime";
import { TeX } from "@/components/TeX";

// The review queue, in public.
//
// erdosproblems.com lists proof claims before anyone has checked them, under a
// standing disclaimer, and it is one of the reasons the tracker is trusted:
// you can see what is being worked on and that it moves. This is the same
// idea at the same scale - titles and ages, nothing more (see getPendingQueue
// for what is withheld and why), under a banner that says as plainly as it
// can that none of this is part of the record yet.
//
// Not indexed: a search hit that lands on an unreviewed title, without the
// banner in the snippet, would be the site vouching for a claim it has not
// read.

export const metadata: Metadata = {
  title: "Under review",
  description: "Submissions waiting for a curator. Nothing here is part of the record yet.",
  robots: { index: false, follow: false },
};

const NOTE_CLASS = "max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]";

export default async function QueuePage() {
  const queue = await getPendingQueue();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All entries
      </Link>

      <h1 className="mt-4 font-serif text-3xl tracking-tight text-[var(--ink)]">Under review</h1>

      <p className={`mt-3 ${NOTE_CLASS}`}>
        Submissions waiting for a curator, oldest first.{" "}
        <strong className="font-medium text-[var(--ink)]">Nothing here is part of the record.</strong>{" "}
        A title is shown as its submitter wrote it, the claim behind it has not been checked,
        and it may be published with edits, published at a different verification tier, or
        turned down. Most entries are reviewed within two days, and the submitter hears the
        outcome either way.
      </p>

      {queue.length === 0 ? (
        <p className="mt-8 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-6 text-center text-sm text-[var(--ink-secondary)]">
          Nothing is waiting. Everything submitted has been reviewed.
        </p>
      ) : (
        <ol className="mt-8 divide-y divide-[var(--hairline)] rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)]">
          {queue.map((q) => (
            // No public id exists for a pending entry, and two people can
            // submit the same title, so the key is the submission instant plus
            // the name.
            <li key={`${q.submittedAtIso}-${q.name}`} className="px-4 py-3">
              <p className="text-sm text-[var(--ink)]">
                <TeX>{q.name}</TeX>
              </p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                {q.fieldGroup ?? q.field ?? "Unclassified"}
                {q.fieldGroup && q.field && q.field !== q.fieldGroup ? ` · ${q.field}` : ""}
                {" · submitted "}
                <RelativeTime iso={q.submittedAtIso} fallback={q.submittedAt} />
                {" by "}
                {q.submittedBy}
              </p>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 text-xs leading-relaxed text-[var(--ink-muted)]">
        What a review checks, and what each verification tier means, is on the{" "}
        <Link href="/methodology" className="text-[var(--accent-blue)] hover:underline">
          methodology
        </Link>{" "}
        page. To add an entry, use{" "}
        <Link href="/submit" className="text-[var(--accent-blue)] hover:underline">
          submit
        </Link>
        .
      </p>
    </main>
  );
}
