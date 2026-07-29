import { SocialLinks } from "@/components/SocialLinks";

/// One footer for the whole site (each page used to carry its own).
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--ink-muted)] sm:px-8">
        <p className="max-w-3xl">
          Marquee entries are hand-curated; Erdős entries come from Tao&apos;s
          AI-contributions wiki (full solutions only, not partial or candidate
          progress) and were each verified against their erdosproblems.com page.
          Posed year is the earliest cited reference, so ages are close estimates.
          The dataset is free to reuse under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            CC BY 4.0
          </a>
          .
        </p>
        <p className="mt-3">
          Spotted an error or a solved problem we&apos;re missing?{" "}
          <a
            href="mailto:rasmus.lindahl1996@gmail.com?subject=VibeMathed"
            className="text-[var(--accent-blue)] hover:underline"
          >
            Contact me
          </a>
          .
        </p>
        <div className="mt-4">
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
