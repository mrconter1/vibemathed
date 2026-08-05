import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCommentDateTime } from "@/lib/comment-render";
import { MessagesList, type InboxMessage } from "@/components/MessagesList";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

/// Same split as the reports queue: `auth()` reads cookies, so the dynamic
/// half sits behind Suspense and the route still prerenders.
async function Queue() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return (
      <p className="text-sm text-[var(--ink-secondary)]">
        This page is for reviewers.{" "}
        <Link href="/" className="text-[var(--accent-blue)] hover:underline">
          Back to all entries
        </Link>
        .
      </p>
    );
  }

  const rows = await prisma.siteMessage.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      topic: true,
      body: true,
      replyTo: true,
      userName: true,
      createdAt: true,
      user: { select: { pseudonym: true } },
    },
  });

  const messages: InboxMessage[] = rows.map((m) => ({
    id: m.id,
    topic: m.topic,
    body: m.body,
    sender: m.user?.pseudonym ?? m.userName,
    senderPseudonym: m.user?.pseudonym ?? null,
    replyTo: m.replyTo,
    sentAt: formatCommentDateTime(m.createdAt),
  }));

  return (
    <>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {messages.length === 0
          ? "No unread messages."
          : `${messages.length} unread ${messages.length === 1 ? "message" : "messages"}. Marking one handled removes it from this queue but keeps it on record.`}
      </p>
      <MessagesList messages={messages} />
    </>
  );
}

export default function InboxPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
        ← All entries
      </Link>

      <h1 className="mt-4 mb-6 font-serif text-3xl tracking-tight text-[var(--ink)]">
        Inbox
      </h1>

      <Suspense
        fallback={
          <div className="h-24 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        }
      >
        <Queue />
      </Suspense>
    </main>
  );
}
