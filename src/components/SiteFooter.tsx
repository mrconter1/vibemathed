import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";

/// One footer for the whole site (each page used to carry its own).
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--ink-muted)] sm:px-8">
        <p className="max-w-3xl">
          The record covers any previously unsolved math problem whose first
          proof or disproof came with AI in the loop - the Erdős problems are
          simply the largest block.
          Entries reach the record three ways: marquee results curated by hand,
          Erdős solves imported from Tao&apos;s AI-contributions wiki (full
          solutions only, each verified against its erdosproblems.com page), and
          reader submissions, reviewed before publishing and credited by name.
          Posed year is the earliest cited reference, so ages are close estimates.
          The{" "}
          <a href="/api/dataset" className="text-[var(--accent-blue)] hover:underline">
            dataset
          </a>{" "}
          is free to reuse under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            CC BY 4.0
          </a>
          . Full inclusion criteria and label definitions are in the{" "}
          <Link href="/methodology" className="text-[var(--accent-blue)] hover:underline">
            methodology
          </Link>
          .
        </p>
        <p className="mt-3">
          Know of a solved problem we&apos;re missing?{" "}
          <Link href="/submit" className="text-[var(--accent-blue)] hover:underline">
            Submit it
          </Link>
          . Spotted an error?{" "}
          <a
            href="mailto:rasmus.lindahl1996@gmail.com?subject=VibeMathed"
            className="text-[var(--accent-blue)] hover:underline"
          >
            Contact me
          </a>{" "}
          or suggest an edit right on the entry page.
        </p>
        <div className="mt-4">
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
