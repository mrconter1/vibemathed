"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
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
    if (!isAdmin(session?.user?.email)) {
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
    await prisma.siteMessage.create({
      data: {
        userId,
        userName: session?.user?.pseudonym ?? null,
        replyTo: replyTo || null,
        topic,
        body: text,
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("sendSiteMessage failed", error);
    return { ok: false, error: "Could not send the message. Please try again." };
  }
}

/// Clears a message from the queue and the badge. The row stays as a record,
/// exactly like a handled report.
export async function handleSiteMessage(messageId: string): Promise<ContactResult> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return { ok: false, error: "Not allowed." };
  }

  try {
    await prisma.siteMessage.update({
      where: { id: messageId },
      data: { status: "handled", handledAt: new Date() },
    });
    return { ok: true };
  } catch (error) {
    console.error("handleSiteMessage failed", error);
    return { ok: false, error: "Could not update the message." };
  }
}
