"use server";

import { auth } from "@/auth";
import { canReview } from "@/lib/curators";
import { prisma } from "@/lib/prisma";
import { contactKind } from "@/lib/messages";
import {
  BODY_MAX,
  DEFAULT_TOPIC,
  REPLY_MAX,
  isContactTopic,
  looksLikeEmail,
} from "@/lib/contact";

// Messages to the curators. This is the only contact channel the site
// advertises, which is the point: no personal address is published, and mail
// arrives in the same open/handled queue as entry reports.

/// Per-account cap, rolling 24h. Generous - this is correspondence, not votes.
const MAX_PER_USER_PER_DAY = 5;
/// Site-wide cap on messages from people who are not signed in, rolling hour.
/// Anonymous senders have no id to count against, so the only thing standing
/// between the inbox and a script is this and the honeypot.
const MAX_ANON_PER_HOUR = 20;

export type ContactResult = { ok: true } | { ok: false; error: string };

export interface ContactInput {
  topic: string;
  body: string;
  replyTo: string;
  /// Honeypot. A real person never sees this field, so anything in it came
  /// from a bot filling every input on the page.
  company: string;
}

/// Copies a contact-form message into every curator's inbox.
///
/// One row per curator rather than one shared row, because a DirectMessage is
/// addressed to exactly one reader and its read state is that reader's. Two
/// curators should not mark each other's mail as read.
///
/// Failure here is logged and swallowed: the sender's message is already
/// saved, and telling them it failed would invite a duplicate.
async function deliverToCurators(input: {
  senderId: string | null;
  senderName: string;
  topic: string;
  body: string;
}): Promise<void> {
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0) return;

  try {
    const curators = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });
    if (curators.length === 0) return;

    await prisma.directMessage.createMany({
      data: curators.map((c) => ({
        userId: c.id,
        // Null for an anonymous sender, which is what makes the thread
        // unanswerable in place rather than answerable to nobody.
        senderId: input.senderId,
        senderName: input.senderName,
        kind: contactKind(input.topic),
        body: input.body,
      })),
    });
  } catch (error) {
    console.error("deliverToCurators failed", error);
  }
}

export async function sendSiteMessage(input: ContactInput): Promise<ContactResult> {
  // Answer a bot exactly as we answer a human: it learns nothing, and stops
  // retrying with variations.
  if (input.company.trim() !== "") return { ok: true };

  const text = input.body.trim();
  if (!text) return { ok: false, error: "Write a message first." };
  if (text.length > BODY_MAX) {
    return { ok: false, error: `Keep it under ${BODY_MAX} characters.` };
  }

  const replyTo = input.replyTo.trim();
  if (replyTo.length > REPLY_MAX) {
    return { ok: false, error: "That reply address is too long." };
  }
  if (replyTo && !looksLikeEmail(replyTo)) {
    return { ok: false, error: "That does not look like an email address." };
  }

  const topic = isContactTopic(input.topic) ? input.topic : DEFAULT_TOPIC;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (userId) {
    // Admins are exempt for the same reason they are everywhere else: they
    // are the moderation.
    if (!canReview(session?.user)) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recent = await prisma.siteMessage.count({
        where: { userId, createdAt: { gte: since } },
      });
      if (recent >= MAX_PER_USER_PER_DAY) {
        return {
          ok: false,
          error: `You have sent ${MAX_PER_USER_PER_DAY} messages today. Try again tomorrow.`,
        };
      }
    }
  } else {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.siteMessage.count({
      where: { userId: null, createdAt: { gte: since } },
    });
    if (recent >= MAX_ANON_PER_HOUR) {
      return {
        ok: false,
        error: "The inbox is busy right now. Please try again in an hour.",
      };
    }
  }

  try {
    // Two writes, on purpose. SiteMessage stays the record of what was sent
    // and is what the rate limits above count; the DirectMessage copies are
    // how a curator actually reads and answers it, in the same inbox as every
    // other conversation.
    await prisma.siteMessage.create({
      data: {
        userId,
        userName: session?.user?.pseudonym ?? null,
        replyTo: replyTo || null,
        topic,
        body: text,
      },
    });
    await deliverToCurators({
      senderId: userId,
      // Who this is from, as one string. A pseudonym when there is an account,
      // otherwise whatever reply address was typed, which is the only handle
      // an anonymous sender has. Both may be absent, and "Anonymous" is then
      // the honest answer.
      senderName: session?.user?.pseudonym ?? (replyTo || null) ?? "Anonymous",
      topic,
      // The reply address rides in the body when there is no account behind
      // the message, because that thread cannot be answered in place and the
      // address is the only way to answer at all.
      body: userId || !replyTo ? text : `${text}

Reply to: ${replyTo}`,
    });
    return { ok: true };
  } catch (error) {
    console.error("sendSiteMessage failed", error);
    return { ok: false, error: "Could not send the message. Please try again." };
  }
}
