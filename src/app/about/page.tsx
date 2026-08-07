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

const CARDS: { title: string; body: React.ReactNode; wide?: boolean }[] = [
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
  {
    title: "How far back it reaches",
    wide: true,
    body: (
      <>
        The record starts well before the site did. Every month from November
        2025 onward has been swept paper by paper, so the early months are thin
        because disclosure itself was rare then, not because nobody looked. A
        result only appears here if its authors said what the model did, which
        is why the record thickens through 2026 rather than starting full.
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
            className={`rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-4 leading-relaxed sm:px-5 sm:py-5 ${
              c.wide ? "sm:col-span-2" : ""
            }`}
          >
            <h2 className="font-serif text-base text-[var(--ink)]">{c.title}</h2>
            <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">{c.body}</p>
          </section>
        ))}
      </div>

      {/* Native <details>, so it works before hydration and needs no state.
          `select-none` because this is a control, not prose. Toggling it twice
          in a row otherwise selects the words, which looks like a mis-click. */}
      <details className="group mt-3 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3 sm:px-5">
        <summary className="cursor-pointer select-none list-none font-serif text-base text-[var(--ink)] transition-colors hover:text-[var(--accent-blue)]">
          <span
            aria-hidden
            className="mr-1.5 inline-block transition-transform group-open:rotate-90"
          >
            ▶
          </span>
          How to cite
        </summary>
        {/* Part of the flow, which it was not for a while. It floated in an
            absolutely positioned panel so that opening it moved nothing, back
            when this page centred its content in the leftover viewport height
            and growing the block shoved the tiles upward. Top-aligning the
            page fixed that at the source, and the tiles sit above the
            disclosure regardless, so all an in-flow panel can push is the
            footer, which is what a disclosure is supposed to do.

            Floating it had a real cost: an absolutely positioned panel
            contributes no height, so the page never grew to fit it. On a
            phone that put the end of the citation past the bottom of the
            scrollable page, and on a short desktop window it printed the
            panel over the footer. */}
        <div className="mt-3">
          {/* The summary already says "How to cite", and this panel has its
              own edge, so the box brings neither. */}
          <CitationBox divider={false} heading={false} compact />
        </div>
      </details>
    </main>
  );
}
