// A personal thank-you from the founder to Matarisvan, moderator since late
// September: 383 edits across 98 entries between 17 September and 6 October
// (links, posing dates, significance notes, statements), no prior messages
// either way. Sent as an in-app direct message, so it lands in his inbox and
// on the bell. Idempotent: a second run finds the message and stops.
//
// Dry run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const RECIPIENT_ID = "cmu5tl1mo0000la04u7k0nbav"; // Matarisvan, by id, not pseudonym
const SUBJECT = "Thank you";
const BODY = [
  "Hi Matarisvan,",
  "",
  "I wanted to write to you personally to say thank you. In under three weeks you have made close to 400 edits across almost a hundred entries: sources, posing dates, significance notes, statements. That is exactly the careful work that turns a list into a record people can trust, and I really appreciate it. It is why I made you a moderator, and you have more than earned it.",
  "",
  "If there is anything I can help you with, in any way, please tell me. Something on the site that would make your work easier, a tool or a permission you are missing, a question about how we review, or anything else at all: just reply here.",
  "",
  "And if you are not already there, you are very welcome on the Discord: https://discord.gg/UGFA5xVT7y",
  "",
  "Thanks again,",
  "Rasmus",
].join("\n");

async function main() {
  const n = charLength(canonical(BODY));
  console.log(`message: ${n}/${MESSAGE_MAX}`);
  if (n > MESSAGE_MAX) throw new Error("message too long");
  if (/—/.test(BODY)) throw new Error("em dash in message");

  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}`);
    const to = await prisma.user.findUnique({ where: { id: RECIPIENT_ID }, select: { id: true, pseudonym: true, staffRole: true } });
    if (!to) throw new Error("recipient not found");
    console.log(`to: ${to.pseudonym} (staffRole ${to.staffRole})`);
    const from = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
    if (!from) throw new Error("sender not found");
    const sent = await prisma.directMessage.findFirst({
      where: { userId: to.id, senderId: from.id, subject: SUBJECT },
      select: { id: true, createdAt: true },
    });
    if (sent) {
      console.log(`already sent ${sent.createdAt.toISOString()} - nothing to do`);
      return;
    }
    console.log(`\n${BODY}\n`);
    if (!APPLY) {
      console.log("DRY RUN - pass --apply to send");
      return;
    }
    await prisma.directMessage.create({
      data: { userId: to.id, senderId: from.id, senderName: from.pseudonym, kind: "note", subject: SUBJECT, body: BODY },
    });
    console.log("SENT");
  } finally {
    await prisma.$disconnect();
  }
}

main();
