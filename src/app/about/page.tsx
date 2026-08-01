import type { Metadata } from "next";
import Link from "next/link";

// Deliberately short: what the site is, who runs it and how, and how open it
// is. Everything procedural lives on the methodology page.

const DESCRIPTION =
  "VibeMathed is a community-maintained record of mathematical problems solved, fully or partially, with AI models substantively involved.";

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
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">About</h1>

      <div className="mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
        <p>
          VibeMathed is a community-maintained record of mathematical problems
          that have been solved, fully or partially, with AI models
          substantively involved. The record spans famous conjectures as well
          as the long tail of specialist questions and the numbered Erdős
          problems.
        </p>
        <p>
          Entries are submitted, reviewed and curated by people who care about
          getting the mathematics right. Every entry cites a checkable primary
          source, carries honest status and verification labels, stays editable
          with a public changelog, and has its own discussion thread. The{" "}
          <Link
            href="/methodology"
            className="text-[var(--accent-blue)] hover:underline"
          >
            methodology
          </Link>{" "}
          explains what qualifies, how significance and verification are
          measured, and how submissions work.
        </p>
        <p>
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
      </div>
    </main>
  );
}
