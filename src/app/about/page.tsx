import type { Metadata } from "next";
import Link from "next/link";

// Deliberately short: what the site is, who runs it and how, and how open it
// is. Everything procedural lives on the methodology page.

const DESCRIPTION =
  "VibeMathed is a community of mathematicians and enthusiasts tracking, curating and cataloguing mathematical problems solved, fully or partially, by AI models.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About · VibeMathed",
    description: DESCRIPTION,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    // flex-1 + my-auto float the sheet in the middle of the leftover viewport
    // height (the layout's content wrapper is a flex column for exactly this).
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-8">
      <h1 className="sr-only">About</h1>

      {/* Same raised sheet as the entry pages, so the site's prose surfaces
          all read as one family. The opening paragraph is the lede: serif and
          full ink, one size up from the supporting prose. */}
      <article className="my-auto w-full max-w-2xl space-y-5 self-center rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-5 py-6 leading-relaxed text-[var(--ink-secondary)] sm:px-8 sm:py-8">
        <p className="font-serif text-base text-[var(--ink)]">
          VibeMathed is a community of mathematicians and enthusiasts tracking,
          curating and cataloguing the mathematical problems that have been
          solved, fully or partially, by AI models. The record spans famous
          conjectures as well as the long tail of specialist questions and the
          numbered Erdős problems. It went live on July 20, 2026 as the first
          website dedicated to keeping this record, and remains the only
          community-curated one.
        </p>
        <p className="text-sm">
          Entries are submitted, reviewed and curated in the open by people who
          care about getting the mathematics right. Every entry cites a
          checkable primary source, carries honest status and verification
          labels, stays editable with a public changelog, and has its own
          discussion thread. The{" "}
          <Link
            href="/methodology"
            className="text-[var(--accent-blue)] hover:underline"
          >
            methodology
          </Link>{" "}
          explains what qualifies, how significance and verification are
          measured, and how submissions work.
        </p>
        <p className="text-sm">
          The record is fully open. The complete dataset is free to reuse under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            CC BY 4.0
          </a>{" "}
          at{" "}
          <a href="/api/dataset" className="text-[var(--accent-blue)] hover:underline">
            /api/dataset
          </a>
          , and the site&apos;s source code is public on{" "}
          <a
            href="https://github.com/mrconter1/vibemathed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </article>
    </main>
  );
}
