// Finishes the one write that contact-replies-2026-09-12.ts did not land.
//
// That script sent all nine in-app replies and marked all eighteen contact
// messages handled, then died setting this flag: its verification step looked
// the account up through the SiteMessage, and `userFor` only matches rows
// with status 'open' - which the loop three lines earlier had just changed to
// 'handled'. A write ordered after the write that invalidates its own lookup.
// The bug is fixed there; re-running that script is not the way to finish
// this, because it would send all nine replies a second time.
//
// So: this sets the one remaining flag, and nothing else.
//
// The identity, checked on 12 September 2026 and checkable by anyone from
// both ends: ryansimonelli.com/autonomous-philosophy.html links to
// vibemathed.com/problem/signed-depth-relevance-of-subdl, and that entry was
// submitted by this account. A page the person controls pointing at an entry
// the account submitted is the strongest evidence the badge can rest on,
// because neither half can be forged without the other.
//
// The account is addressed by id rather than by pseudonym or by the contact
// row, for the reason the parent script learned twice: pseudonyms change
// (theabbie is now SilentBison701) and the contact row is no longer open.
//
// Dry run by default. Pass --apply to write.

import { guardedPrisma } from "./lib/guarded-prisma";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");

const EMAIL = "ryanasimonelli@gmail.com";
const NOTE =
  "Ryan Simonelli. Two-way link checked 12 September 2026: ryansimonelli.com/autonomous-philosophy.html links to vibemathed.com/problem/signed-depth-relevance-of-subdl, and that entry was submitted by this account.";

async function connectWithRetry(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

async function main() {
  const db = await connectWithRetry();
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const users = await prisma.user.findMany({
    where: { email: EMAIL },
    select: { id: true, email: true, pseudonym: true, verified: true, verifiedNote: true },
  });
  if (users.length !== 1)
    throw new Error(`${EMAIL}: matched ${users.length} accounts, expected 1`);
  const u = users[0];

  console.log(`account   : ${u.pseudonym ?? "(no pseudonym)"}  <${u.email}>`);
  console.log(`verified  : ${u.verified} -> true`);
  console.log(`note      : ${u.verifiedNote ?? "(none)"}`);
  console.log(`         -> ${NOTE}`);

  if (u.verified) {
    console.log("\nAlready verified - nothing to do.");
    return;
  }
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.user.update({
    where: { id: u.id },
    data: { verified: true, verifiedNote: NOTE },
  });
  console.log("\nAPPLIED. The profile shows the badge on its next render.");
}

main().finally(() => prisma.$disconnect());
