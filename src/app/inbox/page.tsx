import type { Metadata } from "next";
import Link from "next/link";
import { InboxList } from "@/components/InboxList";

// Every signed-in reader has one of these. The site could already write to
// people - a rejection reason, a decision note - but only ever as a truncated
// line in the bell menu, which is no place to read the reason your submission
// was turned down.
//
// It is now the single place any conversation with the site happens:
// decisions, reports, and the contact form, which used to have a curators-only
// queue of its own.

export const metadata: Metadata = {
  title: "Inbox",
  description: "Messages from the curators about your submissions and reports.",
  // Personal and signed-in only; nothing here should be indexed.
  robots: { index: false, follow: false },
};

export default function InboxPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All entries
      </Link>

      {/* No intro paragraph: the list explains itself, the empty state
          explains the mechanics to whoever actually needs them, and a privacy
          disclaimer above someone's mail read as noise. */}
      <h1 className="mb-6 mt-4 font-serif text-3xl tracking-tight text-[var(--ink)]">
        Inbox
      </h1>

      <InboxList />
    </main>
  );
}
