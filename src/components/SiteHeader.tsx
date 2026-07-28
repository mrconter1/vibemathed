import Link from "next/link";
import { AuthMenu } from "@/components/AuthMenu";

/// Persistent site chrome. The site had no nav at all before user accounts;
/// this is where signing in lives, and where /stats became reachable once the
/// charts moved off the home page.
export function SiteHeader() {
  return (
    <header className="border-b border-[var(--mat-border)] bg-[color-mix(in_srgb,var(--mat)_88%,black)]">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-8">
        <Link
          href="/"
          className="font-serif text-lg text-[var(--paper)] transition-opacity hover:opacity-80"
        >
          VibeMathed
        </Link>

        <nav className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            className="text-[var(--paper)]/75 transition-colors hover:text-[var(--paper)]"
          >
            Entries
          </Link>
          <Link
            href="/stats"
            className="text-[var(--paper)]/75 transition-colors hover:text-[var(--paper)]"
          >
            Stats
          </Link>
        </nav>

        <div className="ml-auto">
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
