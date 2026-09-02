import type { Metadata } from "next";
import Link from "next/link";

// The site's own AI disclosure. Every entry here carries one from the paper it
// cites; until this page the site carried none, though models help produce
// much of what a reader sees. Same card grid as /about and /contributing.
//
// Written to be checkable rather than reassuring: it names where models are
// used, what they are not, and where the record of that is kept.

const DESCRIPTION =
  "Where VibeMathed itself uses AI models: assessing submissions, writing curator notes, scoring significance, finding candidates. What that is and is not.";

export const metadata: Metadata = {
  title: "AI disclosure",
  description: DESCRIPTION,
  alternates: { canonical: "/ai-disclosure" },
  openGraph: {
    type: "website",
    title: "AI disclosure · VibeMathed",
    description: DESCRIPTION,
    url: "/ai-disclosure",
  },
};

const linkClass = "text-[var(--accent-blue)] hover:underline";

const CARDS: { title: string; body: React.ReactNode; wide?: boolean }[] = [
  {
    title: "Where models are used",
    body: (
      <>
        In reviewing submissions: reading the source, checking that a disclosure
        is in the paper and not only in the form, scanning for duplicates,
        drafting the verification, result and AI-role notes a curator then
        edits and signs. In scoring significance, where the whole ladder is
        AI-assigned against a{" "}
        <a href="/significance-prompt.md" target="_blank" rel="noopener noreferrer" className={linkClass}>
          published prompt
        </a>
        . In finding candidates, where a script harvests arXiv, trackers and
        repositories and flags disclosures for a human to triage.
      </>
    ),
  },
  {
    title: "Which models",
    body: (
      <>
        Anthropic&apos;s Claude, through Claude Code, is the working model for
        review notes and curator prose; the significance prompt names the
        model current at each rescoring. When a note quotes a paper, a
        tracker or an expert, the words are theirs and the source is linked.
        Per-field provenance - which model, when, from which source - is
        recorded from 2 September 2026 on and shown as a marker on the field;
        curator prose written before that date was AI-assisted without a
        per-field record, and is not marked.
      </>
    ),
  },
  {
    title: "What this is not",
    body: (
      <>
        Not expert peer review. A model reading a paper and a curator checking
        the model is AI-assisted curation, and the{" "}
        <Link href="/methodology" className={linkClass}>
          verification ladder
        </Link>{" "}
        says so on every entry: Unreviewed means nobody independent has checked
        the mathematics, and most entries sit there. Claims that would be a
        landmark are held rather than listed until an expert or a formal proof
        exists, whatever a model thought of them.
      </>
    ),
  },
  {
    title: "How it is corrected",
    body: (
      <>
        In the open. Every field is editable by signed-in readers with the
        change in a public changelog; every entry has a discussion thread and a
        report button; and readers have downgraded, relabelled and unpublished
        entries after showing a model or a curator was wrong. If something here
        is wrong, the fastest fix is to{" "}
        <Link href="/contributing" className={linkClass}>
          say so
        </Link>
        .
      </>
    ),
  },
  {
    title: "The standard the site holds itself to",
    wide: true,
    body: (
      <>
        Entries have been declined because a paper&apos;s disclosure named no
        model and attributed no step. The site should meet the bar it applies:
        this page says which models, the provenance markers say which field,
        and the{" "}
        <a
          href="https://github.com/mrconter1/vibemathed/blob/main/docs/reviewing.md"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          reviewing checklist
        </a>{" "}
        says what a human checks before anything is published. The source code
        is public, including the scripts that record each review.
      </>
    ),
  },
];

export default function AiDisclosurePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <h1 className="sr-only">AI disclosure</h1>

      <p className="mx-auto max-w-xl text-center font-serif text-lg leading-snug text-[var(--ink)] sm:text-xl">
        A record of AI-assisted mathematics, kept with AI assistance. Here is
        exactly where.
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
    </main>
  );
}
