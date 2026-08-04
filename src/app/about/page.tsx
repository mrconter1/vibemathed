import type { Metadata } from "next";
import Link from "next/link";
import { CitationBox } from "@/components/CitationBox";

// Deliberately short. What the site is, who runs it and how, and how open it
// is. Everything procedural lives on the methodology page.
//
// Four tiles rather than four paragraphs, because this page is scanned more
// often than it is read, and the citation folded behind a disclosure, because
// it is needed by a small minority of visitors and used to take a fifth of the
// page from everyone else.

const DESCRIPTION =
  "VibeMathed is a record of the mathematical problems AI models have solved, in full or in part, kept by a community of mathematicians and enthusiasts.";

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

const linkClass = "text-[var(--accent-blue)] hover:underline";

const CARDS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What this is",
    body: (
      <>
        A record of the mathematical problems that AI models have solved, in
        full or in part. Famous conjectures, the long tail of specialist
        questions, and the numbered Erdős problems.
      </>
    ),
  },
  {
    title: "Since July 2026",
    body: (
      <>
        It went live on July 20, 2026, the first site to track these results
        across all of mathematics. Others have followed. Entries here are
        classified rather than merely listed.
      </>
    ),
  },
  {
    title: "Kept in the open",
    body: (
      <>
        Submitted, reviewed and curated by a community that cares about getting
        the mathematics right. Every entry cites a checkable source, carries
        status and verification labels, stays editable with a public changelog,
        and has its own discussion thread. See the{" "}
        <Link href="/methodology" className={linkClass}>
          methodology
        </Link>
        .
      </>
    ),
  },
  {
    title: "Free to reuse",
    body: (
      <>
        The complete dataset is free to reuse under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          CC BY 4.0
        </a>{" "}
        at{" "}
        <a href="/api/dataset" className={linkClass}>
          /api/dataset
        </a>
        , and the source code is public on{" "}
        <a
          href="https://github.com/mrconter1/vibemathed"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          GitHub
        </a>
        . To reach the people who keep it, write to us at{" "}
        <Link href="/contact" className={linkClass}>
          contact
        </Link>
        .
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    // Top-aligned on purpose. The content used to be centred in the leftover
    // viewport height, which meant opening the citation grew the block in both
    // directions and shoved the cards upward. Anchored to the top, opening it
    // only extends downward.
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <h1 className="sr-only">About</h1>

      <p className="mx-auto max-w-xl text-center font-serif text-lg leading-snug text-[var(--ink)] sm:text-xl">
        Mathematics that no human had settled, now settled with a model in the
        loop, written down carefully.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <section
            key={c.title}
            className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-4 leading-relaxed sm:px-5 sm:py-5"
          >
            <h2 className="font-serif text-base text-[var(--ink)]">{c.title}</h2>
            <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">{c.body}</p>
          </section>
        ))}
      </div>

      {/* Native <details>, so it works before hydration and needs no state.
          `select-none` because this is a control, not prose. Toggling it twice
          in a row otherwise selects the words, which looks like a mis-click.

          The panel is absolutely positioned rather than part of the flow, so
          opening it moves nothing at all. Capping and tightening the expanded
          block only reduced the shove from 267px to 170px, and any inline
          disclosure shoves by however tall its contents are. Floating it costs
          one `relative` and settles the question. */}
      <details className="group relative mt-3 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3 sm:px-5">
        <summary className="cursor-pointer select-none list-none font-serif text-base text-[var(--ink)] transition-colors hover:text-[var(--accent-blue)]">
          <span
            aria-hidden
            className="mr-1.5 inline-block transition-transform group-open:rotate-90"
          >
            ▶
          </span>
          How to cite
        </summary>
        {/* Left and right pinned to the disclosure, so it is exactly as wide
            as the control that opened it at every breakpoint. */}
        <div className="absolute inset-x-0 top-full z-20 mt-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5 shadow-lg sm:px-5">
          {/* The summary already says "How to cite", and this panel has its
              own edge, so the box brings neither. */}
          <CitationBox divider={false} heading={false} compact />
        </div>
      </details>
    </main>
  );
}
