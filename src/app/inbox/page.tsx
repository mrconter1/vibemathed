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

      <h1 className="mt-4 font-serif text-3xl tracking-tight text-[var(--ink)]">
        Inbox
      </h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Conversations with the curators and other readers: decisions on your
        submissions, answers to your reports, and anything started with New
        message. Reply in the thread and the answer comes back here. Nothing on
        this page is public, and nothing said here is posted to an entry.
      </p>

      <InboxList />
    </main>
  );
}
