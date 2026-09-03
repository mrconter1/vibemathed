import type { Metadata } from "next";
import Link from "next/link";
import { TERMS, TERMS_EFFECTIVE, TERMS_VERSION } from "@/lib/terms";

// The Terms of Service.
//
// DRAFT: noindexed and linked from nowhere until the operator signs it off.
// Publishing is two edits - drop `robots` here, add the footer link - and
// should not happen while any placeholder in src/lib/terms.ts is unresolved.
//
// Prose, not cards. Every other explanatory page here uses the card grid,
// because those pages are scanned; this one has to be readable start to
// finish and quotable by section number, which is what a numbered column
// gives and a grid does not.

const DESCRIPTION =
  "The terms governing use of VibeMathed: what the record is, what its labels mean, what contributors grant, and how to raise a problem.";

export const metadata: Metadata = {
  title: "Terms",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  // Remove when the draft is approved.
  robots: { index: false, follow: false },
};

const linkClass = "text-[var(--accent-blue)] hover:underline";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
      <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">Terms</h1>

      <p className="mt-2 text-xs text-[var(--ink-muted)]">
        Version {TERMS_VERSION} · effective {TERMS_EFFECTIVE}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
        These terms cover using VibeMathed, and in particular contributing to
        it. They are written to be read: where a term describes how the site
        behaves, the site behaves that way. The{" "}
        <Link href="/methodology" className={linkClass}>
          methodology
        </Link>
        , the{" "}
        <Link href="/ai-disclosure" className={linkClass}>
          AI disclosure
        </Link>{" "}
        and the{" "}
        <Link href="/data-license" className={linkClass}>
          licensing page
        </Link>{" "}
        say the same things in more detail and form part of these terms.
      </p>

      <div className="mt-8 space-y-8">
        {TERMS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-lg text-[var(--ink)]">{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]"
              >
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                {section.bullets.map((b) => (
                  <li key={b.slice(0, 40)}>{b}</li>
                ))}
              </ul>
            )}
            {section.after?.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]"
              >
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-[var(--hairline)] pt-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
        Questions, corrections and rights notices all go through{" "}
        <Link href="/contact" className={linkClass}>
          contact
        </Link>
        , which needs no account.
      </p>
    </main>
  );
}
