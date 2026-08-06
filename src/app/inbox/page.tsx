import type { Metadata } from "next";
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

// The shell is just the column; the heading lives in InboxList, which knows
// whether it is showing the list (heading plus the composer button on one
// row) or an open conversation. No intro paragraph and no back link: the
// header's own navigation covers leaving, the empty state teaches the
// mechanics to whoever needs them, and everything else was noise above mail.
export default function InboxPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <InboxList />
    </main>
  );
}
