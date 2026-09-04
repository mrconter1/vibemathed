import Link from "next/link";

/// One footer for the whole site: a short definition followed by links grouped
/// by why somebody would look for them. Primary sections and the public social
/// outposts stay in the header instead of being duplicated here.
export function SiteFooter() {
  const link =
    "w-fit text-[var(--accent-blue)] transition-colors hover:text-[var(--ink)] hover:underline";
  const heading =
    "text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]";
  const list = "mt-2 flex flex-col items-start gap-1.5";

  return (
    <footer className="mt-16 border-t border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--ink-muted)] sm:px-8">
        <p className="max-w-3xl">
          A community-curated record of math problems first solved with AI in
          the loop.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
          <nav aria-labelledby="footer-contribute">
            <h2 id="footer-contribute" className={heading}>
              Contribute
            </h2>
            <div className={list}>
              <Link href="/contributing" className={link}>
                Contributing
              </Link>
              <Link href="/submit" className={link}>
                Submit an entry
              </Link>
              <a
                href="https://github.com/mrconter1/vibemathed"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                GitHub
              </a>
            </div>
          </nav>

          <nav aria-labelledby="footer-data">
            <h2 id="footer-data" className={heading}>
              Data
            </h2>
            <div className={list}>
              {/* A file rather than an app route: let the browser or feed
                  reader handle it directly. */}
              <a href="/feed.xml" className={link}>
                RSS
              </a>
              <a href="/api/dataset" className={link}>
                Dataset
              </a>
            </div>
          </nav>

          <nav aria-labelledby="footer-policies">
            <h2 id="footer-policies" className={heading}>
              Policies
            </h2>
            <div className={list}>
              <Link href="/ai-disclosure" className={link}>
                AI disclosure
              </Link>
              <Link href="/data-license" className={link}>
                Data licensing
              </Link>
              {/* Privacy and Terms join this group when their pages are ready
                  to publish; neither draft is surfaced prematurely. */}
            </div>
          </nav>

          <nav aria-labelledby="footer-problems-rights">
            <h2 id="footer-problems-rights" className={heading}>
              Contact
            </h2>
            <div className={list}>
              <Link href="/contact" className={link}>
                Contact us
              </Link>
              {/* A rightsholder should find the direct route from every page,
                  without first working out that the general form handles it. */}
              <Link href="/contact?topic=copyright" className={link}>
                Report a rights issue
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
