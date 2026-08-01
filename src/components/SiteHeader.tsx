import Link from "next/link";
import { AuthMenu } from "@/components/AuthMenu";
import { NavLinks } from "@/components/NavLinks";

/// Persistent site chrome. Sticky and translucent on the same paper surface as
/// the page - the site is one continuous sheet, not a bar floating above a card.
///
/// One row does not fit a phone (logo + three links + the account button need
/// ~420px), so below `sm` the bar wraps to two rows: logo and account button on
/// the first, nav on its own full-width second row. The `order-*` classes keep
/// the DOM order (logo, nav, account) sensible for tabbing while placing the
/// nav last visually only when wrapped.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--paper-raised)_88%,transparent)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-0.5 px-4 py-2.5 sm:flex-nowrap sm:px-8">
        <Link
          href="/"
          className="order-1 block transition-opacity hover:opacity-75"
        >
          <span className="font-serif text-2xl leading-none tracking-tight text-[var(--ink)]">
            Vibe<span className="text-[var(--accent-blue)]">Mathed</span>
          </span>
          {/* The one-line site definition, carried by every page now that the
              home hero is gone. */}
          <span className="block text-[10px] leading-tight tracking-wide text-[var(--ink-muted)]">
            Math problems solved by AI
          </span>
        </Link>

        <NavLinks />

        <div className="order-2 ml-auto sm:order-3">
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
