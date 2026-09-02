import Link from "next/link";
import { DISCORD_INVITE } from "@/lib/community";

/// One footer for the whole site: a single-sentence definition and the link
/// row. The longer prose moved to the About page. Nothing here points at a
/// person: the GitHub link is the repository, and Contact is the on-site
/// inbox, so no private address is published.
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
          {/* Footer rather than the nav bar: the directory is a secondary
              page, and a fifth top-level item would crowd the bar on a phone
              for something most readers never need. The link that matters is
              the contextual one, beside Recent activity. */}
          <Link href="/users" className={link}>
            Members
          </Link>
          <span aria-hidden>·</span>
          {/* Beside Members rather than next to Submit: this covers every way
              in, including the sceptical ones and the code, whereas Submit is
              one specific route that already has its own link below. */}
          <Link href="/contributing" className={link}>
            Contributing
          </Link>
          <span aria-hidden>·</span>
          {/* Beside Methodology's neighbours: the site asks every entry for
              an AI disclosure, so its own belongs where the rules live. */}
          <Link href="/ai-disclosure" className={link}>
            AI disclosure
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
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Discord
          </a>
          <span aria-hidden>·</span>
          <Link href="/submit" className={link}>
            Submit
          </Link>
          <span aria-hidden>·</span>
          <Link href="/contact" className={link}>
            Contact
          </Link>
          <span aria-hidden>·</span>
          {/* Plain anchor, not Link: this is a file, not a route, and the
              router should hand it to the reader's feed client rather than
              try to navigate to it. */}
          <a href="/feed.xml" className={link}>
            RSS
          </a>
        </p>
      </div>
    </footer>
  );
}
