import Link from "next/link";
import { AuthMenu } from "@/components/AuthMenu";
import { DiscordLink } from "@/components/DiscordLink";
import { InboxButton } from "@/components/InboxButton";
import { NavLinks } from "@/components/NavLinks";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { ReviewBadge } from "@/components/ReviewBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 sm:flex-nowrap sm:gap-x-8 sm:px-8">
        {/* The hover is the colour swap in globals.css, not an opacity fade.
            Dimming the whole block read as the header going away; trading the
            two halves reads as it answering. */}
        <Link href="/" className="wordmark order-1 block">
          <span className="wordmark-name font-serif text-2xl leading-none tracking-tight text-[var(--ink)]">
            Vibe<span className="wordmark-accent text-[var(--accent-blue)]">Mathed</span>
          </span>
          {/* The one-line site definition, carried by every page now that the
              home hero is gone.

              "with AI", not "by AI". The catalog's bottom tier is ai-assisted,
              where a model built the search tooling or checked the proofs and
              a human did the mathematics - "by" claims authorship the entries
              themselves do not, which a reader called out as dishonest and was
              right to. "with" covers the whole ladder from ai-assisted to
              ai-discovered without overstating any rung of it. */}
          <span className="block text-[9px] leading-tight tracking-wide text-[var(--ink-muted)]">
            Math problems solved with AI
          </span>
        </Link>

        <NavLinks />

        <div className="order-2 ml-auto flex items-center gap-1 sm:order-3 sm:gap-2">
          {/* Leftmost, and the only action here that everyone sees: a
              signed-out reader gets the plus and the sign-in button, which is
              the right order of discovery. */}
          <SubmitButton />
          {/* Curators only, and only while something is waiting: the review
              queue as a pill of its own, because folded into the bell it was
              a digit nobody read as "work for you". See ReviewBadge. */}
          <ReviewBadge />
          {/* Both render nothing for signed-out visitors. Mail before the
              bell: it is the more personal of the two. */}
          <InboxButton />
          <NotificationsMenu />
          {/* The community invite, in the slot the theme toggle used to hold.
              Theme is a set-once preference and now lives in the account menu,
              which is where GitHub, Reddit and YouTube all keep appearance; a
              header slot is better spent on something a stranger should
              notice. Signed-out readers keep the toggle here instead - it
              renders itself only when there is no account menu to hold it, so
              reading in the dark is still not a privilege of having an
              account. */}
          <DiscordLink />
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
