import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";

/// One footer for the whole site: a single-sentence definition and the link
/// row. The longer prose moved to the About page.
export function SiteFooter() {
  const link = "text-[var(--accent-blue)] hover:underline";
  return (
    <footer className="mt-16 border-t border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--ink-muted)] sm:px-8">
        <p className="max-w-3xl">
          A community-curated record of math problems first solved with AI in
          the loop.
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href="/about" className={link}>
            About
          </Link>
          <span aria-hidden>·</span>
          <Link href="/methodology" className={link}>
            Methodology
          </Link>
          <span aria-hidden>·</span>
          <a href="/api/dataset" className={link}>
            Dataset (CC BY 4.0)
          </a>
          <span aria-hidden>·</span>
          <a
            href="https://github.com/mrconter1/vibemathed"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            GitHub
          </a>
          <span aria-hidden>·</span>
          <Link href="/submit" className={link}>
            Submit
          </Link>
          <span aria-hidden>·</span>
          <a
            href="mailto:rasmus.lindahl1996@gmail.com?subject=VibeMathed"
            className={link}
          >
            Contact
          </a>
        </p>
        <div className="mt-4">
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
