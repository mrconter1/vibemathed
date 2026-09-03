import type { Metadata } from "next";
import Link from "next/link";

// What is actually licensed, and what is not.
//
// The site used to say "Everything on this site is free to reuse under
// CC BY 4.0" on the methodology page, and variations of it in seven other
// places including the dataset's own JSON and the home page's schema.org
// block. That was never true and could not be made true: an entry quoting a
// paper's abstract carries the authors' words, and VibeMathed cannot
// sublicense what it does not own. Downstream consumers read those machine-
// readable claims, so the error propagated.
//
// The fix is not "all rights reserved". CC BY is right for the part of the
// catalog VibeMathed actually wrote - the classifications, the notes, the
// scores, the structure - which is most of its value. This page draws the
// line, and every other surface now points here instead of asserting a
// blanket licence.

const DESCRIPTION =
  "What in VibeMathed is CC BY 4.0, what belongs to third parties, and how to reuse the dataset correctly.";

export const metadata: Metadata = {
  title: "Data licensing",
  description: DESCRIPTION,
  alternates: { canonical: "/data-license" },
  openGraph: {
    type: "website",
    title: "Data licensing · VibeMathed",
    description: DESCRIPTION,
    url: "/data-license",
  },
};

const linkClass = "text-[var(--accent-blue)] hover:underline";

const CARDS: { title: string; body: React.ReactNode; wide?: boolean }[] = [
  {
    title: "CC BY 4.0: what VibeMathed wrote",
    body: (
      <>
        The editorial layer is ours to license, and it is available under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          CC BY 4.0
        </a>
        : the classifications and verification tiers, the significance scores
        and their notes, the result, AI-role, verification and age notes, the
        relations between entries, and the structure of the dataset itself.
        Attribution is the condition - name VibeMathed and link back.
      </>
    ),
  },
  {
    title: "Not ours to license",
    body: (
      <>
        An entry cites a paper, and sometimes quotes it. Abstracts, quoted
        passages, figures, and the text of any linked paper, repository or
        tracker page belong to their authors and stay under their own rights
        and licences. Quoting them here does not relicense them. Bare
        bibliographic facts - a title, an author list, a date, an arXiv id -
        are facts, and facts are not copyrightable.
      </>
    ),
  },
  {
    title: "What contributors grant",
    body: (
      <>
        A submission or an edit is licensed to VibeMathed so the record can be
        hosted, corrected, redistributed and kept - and only to the extent the
        contributor holds those rights in the first place. Submitting a passage
        copied from a paper does not transfer the paper. Contributions written
        by contributors form part of the CC BY layer above.
      </>
    ),
  },
  {
    title: "Reusing the dataset",
    body: (
      <>
        <a href="/api/dataset" className={linkClass}>
          /api/dataset
        </a>{" "}
        returns every published entry as JSON, and its <code>license</code>{" "}
        field points here rather than asserting one licence over mixed
        material. If you are reusing statements or quoted passages
        specifically, check the linked source; if you are reusing the
        classifications, scores and structure, CC BY covers you. The{" "}
        <Link href="/about" className={linkClass}>
          citation
        </Link>{" "}
        on the About page is the attribution we ask for.
      </>
    ),
  },
  {
    title: "Source code, and getting this wrong",
    wide: true,
    body: (
      <>
        The site&apos;s source is separate and MIT-licensed on{" "}
        <a
          href="https://github.com/mrconter1/vibemathed"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          GitHub
        </a>
        . If you believe something here reproduces your work beyond what
        quotation allows, or is attributed wrongly, tell us and we will fix or
        remove it: use{" "}
        <Link href="/contact" className={linkClass}>
          contact
        </Link>
        , which reaches the curators privately and needs no account. This page
        replaced a blanket claim that everything on the site was CC BY. That
        claim was wrong, it was machine-readable, and anyone who relied on it
        should read the distinction above instead.
      </>
    ),
  },
];

export default function DataLicensePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <h1 className="sr-only">Data licensing</h1>

      <p className="mx-auto max-w-xl text-center font-serif text-lg leading-snug text-[var(--ink)] sm:text-xl">
        The record is free to reuse. The papers it cites were never ours to
        give away.
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
