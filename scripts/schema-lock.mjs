// Unlock or relock every table in the database DATABASE_URL points at.
//
// CockroachDB v26 creates tables with schema_locked = true, which breaks
// Prisma's multi-step pushes: `db push` creates a table, then fails on the
// very next step (an index, a constraint) because the table it just made is
// locked. The README documents the one-table fix; this does all of them, so a
// push against a drifted database completes in one go instead of one failure
// per table.
//
//   DATABASE_URL="<url>" node scripts/schema-lock.mjs unlock
//   DATABASE_URL="<url>" npx prisma db push
//   DATABASE_URL="<url>" node scripts/schema-lock.mjs lock
//
// Refuses to touch anything but vibemathed_staging unless the run says
// `--production` out loud, in which case the production database and only
// the production database is allowed. The flag exists so that pointing
// DATABASE_URL at the wrong place by accident still cannot unlock production;
// it was added on 5 September 2026 for the Frontiers schema push, the first
// schema change production has taken under the branch flow.
import { PrismaClient } from "@prisma/client";

const mode = process.argv[2];
if (mode !== "unlock" && mode !== "lock") throw new Error("pass unlock or lock");
const want = mode === "lock" ? "true" : "false";
const production = process.argv.includes("--production");

const url = process.env.DATABASE_URL ?? "";
const db = url.match(/\/([^/?]+)\?/)?.[1];
const allowed = production ? "vibemathed" : "vibemathed_staging";
if (db !== allowed)
  throw new Error(
    `refusing: DATABASE_URL points at "${db}", not ${allowed}${production ? "" : " (pass --production to target production)"}`,
  );

const prisma = new PrismaClient();
const rows = await prisma.$queryRawUnsafe(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
);
for (const { table_name } of rows) {
  await prisma.$executeRawUnsafe(`ALTER TABLE "${table_name}" SET (schema_locked = ${want})`);
}
console.log(`${mode}ed ${rows.length} tables in ${db}: ${rows.map((r) => r.table_name).sort().join(", ")}`);
await prisma.$disconnect();
