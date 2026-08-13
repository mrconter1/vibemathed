// Reply to HiddenHawk615's note about the missing Wikipedia link on their
// Sendov submission, 13 Aug 2026. The link was counted at review - renownLangs
// is 4 with a note naming the language editions - but nobody told them, and a
// message that changed nothing still deserves an answer saying why.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const ROOT_ID = "991acbe1-34a4-41f6-9a44-c2698a626b94";

const REPLY = `Already counted, as it happens - the review looked Wikipedia up independently before publishing, so nothing was lost by the missing link. The entry records 4 language editions (English, German, French and Yoruba), with a note that the article still described the conjecture as open when checked on 13 August, the day after Tao's digestion appeared.

The renown count is a curator measurement rather than a submitted field, exactly so it never depends on the submitter remembering the link - but flagging it anyway was the right instinct. Thanks.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const root = await prisma.directMessage.findUnique({
    where: { id: ROOT_ID },
    select: { id: true, senderId: true, body: true },
  });
  if (!root?.senderId) throw new Error("no root message or no sender");
  const sender = await prisma.user.findUnique({ where: { id: root.senderId } });
  if (sender?.pseudonym !== "HiddenHawk615") {
    throw new Error(`root sender is ${sender?.pseudonym}, expected HiddenHawk615`);
  }

  console.log(`reply to HiddenHawk615, threaded under ${ROOT_ID}`);
  console.log(`  ${REPLY.length} chars (max ${MESSAGE_MAX})`);
  if (REPLY.length > MESSAGE_MAX) throw new Error(`over by ${REPLY.length - MESSAGE_MAX}`);
  if (!APPLY) {
    console.log(`\n${REPLY}\n\nDRY RUN - pass --apply to write`);
    return;
  }

  await prisma.directMessage.create({
    data: {
      userId: root.senderId,
      senderId: admin.id,
      senderName: admin.pseudonym ?? null,
      kind: "reply",
      body: REPLY,
      parentId: root.id,
    },
  });
  console.log("SENT");
}

main().finally(() => prisma.$disconnect());
