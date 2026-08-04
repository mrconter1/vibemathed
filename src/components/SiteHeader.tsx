import Link from "next/link";
import { AuthMenu } from "@/components/AuthMenu";
import { NavLinks } from "@/components/NavLinks";
import { NotificationsMenu } from "@/components/NotificationsMenu";

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
      {/* gap-y separates the wordmark block from the nav row when this
          wraps to two lines on a phone; gap-x keeps the nav clear of the
          tagline on one line. Both were tight enough that the subtitle and
          the buttons read as one block. */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-7 gap-y-2 px-4 py-2.5 sm:flex-nowrap sm:gap-x-8 sm:px-8">
        {/* The hover is the colour swap in globals.css, not an opacity fade.
            Dimming the whole block read as the header going away; trading the
            two halves reads as it answering. */}
        <Link href="/" className="wordmark order-1 block">
          <span className="wordmark-name font-serif text-2xl leading-none tracking-tight text-[var(--ink)]">
            Vibe<span className="wordmark-accent text-[var(--accent-blue)]">Mathed</span>
          </span>
          {/* The one-line site definition, carried by every page now that the
              home hero is gone. */}
          <span className="block text-[10px] leading-tight tracking-wide text-[var(--ink-muted)]">
            Math problems solved by AI
          </span>
        </Link>

        <NavLinks />

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          {/* Renders nothing for signed-out visitors. */}
          <NotificationsMenu />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
