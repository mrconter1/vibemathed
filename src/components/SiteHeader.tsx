import Link from "next/link";
import { AuthMenu } from "@/components/AuthMenu";
import { NavLinks } from "@/components/NavLinks";

/// Persistent site chrome. Sticky and translucent on the same paper surface as
/// the page - the site is one continuous sheet, not a bar floating above a card.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--paper-raised)_88%,transparent)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-5 px-4 py-2.5 sm:px-8">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-[var(--ink)] transition-opacity hover:opacity-75"
        >
          VibeMathed
        </Link>

        <NavLinks />

        <div className="ml-auto">
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
