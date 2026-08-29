import type { Metadata } from "next";
import Link from "next/link";
import { DISCORD_INVITE } from "@/lib/community";

// The reader-facing counterpart to CONTRIBUTING.md in the repository. The two
// deliberately lead with different things: a visitor here can add and correct
// entries without touching git, and most never will touch git, so the catalog
// routes come first and the code section is one tile at the end pointing at
// the repo. CONTRIBUTING.md inverts that, because the person reading it has
// already opened a pull request.
//
// Same card grid as /about rather than a new layout: these two pages are read
// in the same mood, and a second visual language for "prose page" would be a
// liability the first time either one is edited.

const DESCRIPTION =
  "How to contribute to VibeMathed: submit an entry, correct one that is wrong, report a bad claim, or work on the site itself.";

export const metadata: Metadata = {
  title: "Contributing",
  description: DESCRIPTION,
  alternates: { canonical: "/contributing" },
  openGraph: {
    type: "website",
    title: "Contributing · VibeMathed",
    description: DESCRIPTION,
    url: "/contributing",
  },
};

const linkClass = "text-[var(--accent-blue)] hover:underline";

const CARDS: { title: string; body: React.ReactNode; wide?: boolean }[] = [
  {
    title: "Submit an entry",
    body: (
      <>
        If a paper settles a stated open question with a model substantively in
        the loop,{" "}
        <Link href="/submit" className={linkClass}>
          send it
        </Link>
        . Read the{" "}
        <Link href="/methodology" className={linkClass}>
          methodology
        </Link>{" "}
        first: most declines are scope decisions rather than judgements on the
        mathematics, and the one-sentence inclusion test rules out more than
        people expect.
      </>
    ),
  },
  {
    title: "Correct one that is wrong",
    body: (
      <>
        Every field on an entry is editable, and every edit is recorded in a
        public changelog with your pseudonym against it. A misread source, a
        missing collaborator, an overstated AI claim, a significance score that
        looks off - fix it, or say so on the entry&apos;s discussion thread.
      </>
    ),
  },
  {
    title: "Challenge a claim",
    body: (
      <>
        The most valuable contributions are often the sceptical ones. Entries
        have been downgraded, relabelled and unpublished after a reader pointed
        out that a disclosure credited tooling rather than mathematics, or that
        a formalization assumed what it appeared to prove. Bring it up on the
        thread or through{" "}
        <Link href="/contact" className={linkClass}>
          contact
        </Link>
        .
      </>
    ),
  },
  {
    title: "What a good submission has",
    body: (
      <>
        A primary source anyone can open. A disclosure from the authors saying
        what the model actually did. An honest status - partial and candidate
        are respectable, and overclaiming is the fastest route to a decline.
        Say what the work does <em>not</em> establish; reviewers check anyway.
      </>
    ),
  },
  {
    title: "Work on the site",
    wide: true,
    body: (
      <>
        The site is open source under MIT and pull requests are welcome. Start
        with{" "}
        <a
          href="https://github.com/mrconter1/vibemathed/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          CONTRIBUTING.md
        </a>
        , which covers local setup, the branch flow and what CI checks. One
        thing worth knowing up front: the catalog lives in a database, not in
        git, so a pull request cannot add or edit an entry - use the routes
        above for that. Come and say hello on{" "}
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Discord
        </a>{" "}
        if you would rather ask before you build.
      </>
    ),
  },
];

export default function ContributingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <h1 className="sr-only">Contributing</h1>

      <p className="mx-auto max-w-xl text-center font-serif text-lg leading-snug text-[var(--ink)] sm:text-xl">
        This record is kept by the people who read it. Adding to it, and
        arguing with it, are both contributions.
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
