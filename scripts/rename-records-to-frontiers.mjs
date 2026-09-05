// Renames the Record tables and columns to Frontier, in place, preserving the
// rows.
//
// `prisma db push` would see renamed models as a drop and a create, which
// would take the seeded rows and the records' changelog with it. Everything
// here is re-seedable in principle, but the changelog is not - it holds the
// rename of the two prime-gap records and the demotion of the 186 row, which
// are curator decisions with dates on them. So the rename is done as SQL and
// the schema is edited to match.
//
// Idempotent: checks what exists before each step, so a half-finished run can
// simply be run again.
//
// Refuses to run against anything but vibemathed_staging. Production has none
// of these tables yet (see PR #22); when it gets them it should get them
// already named Frontier.
//
// Usage: node scripts/rename-records-to-frontiers.mjs [--apply]
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient();

const db = (await prisma.$queryRawUnsafe(`SELECT current_database() AS db`))[0].db;
if (db !== "vibemathed_staging") throw new Error(`refusing: connected to "${db}"`);

const tables = await prisma.$queryRawUnsafe(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
);
const names = new Set(tables.map((t) => t.table_name));

const cols = async (t) =>
  new Set(
    (
      await prisma.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        t,
      )
    ).map((c) => c.column_name),
  );

// COLUMNS FIRST, then tables. The other order renames RecordRow out from
// under the column statement that still names it, which the dry run caught.
const steps = [];
const rowTable = names.has("FrontierRow") ? "FrontierRow" : "RecordRow";
if (names.has(rowTable) && (await cols(rowTable)).has("recordId")) {
  steps.push(`ALTER TABLE "${rowTable}" RENAME COLUMN "recordId" TO "frontierId"`);
}
for (const t of ["Comment", "ProblemActivity", "ProblemReport"]) {
  if ((await cols(t)).has("recordId")) steps.push(`ALTER TABLE "${t}" RENAME COLUMN "recordId" TO "frontierId"`);
}
if (names.has("RecordRow") && !names.has("FrontierRow")) steps.push(`ALTER TABLE "RecordRow" RENAME TO "FrontierRow"`);
if (names.has("Record") && !names.has("Frontier")) steps.push(`ALTER TABLE "Record" RENAME TO "Frontier"`);

console.log(`database: ${db}`);
if (steps.length === 0) {
  console.log("nothing to do - already renamed");
  await prisma.$disconnect();
  process.exit(0);
}
for (const s of steps) console.log(`  ${s}`);

if (!APPLY) {
  console.log("\nDRY RUN - pass --apply to write");
  await prisma.$disconnect();
  process.exit(0);
}

// Every table has to be unlocked: CockroachDB v26 locks schemas, and a rename
// is a schema change like any other.
const all = tables.map((t) => t.table_name);
for (const t of all) await prisma.$executeRawUnsafe(`ALTER TABLE "${t}" SET (schema_locked = false)`);
try {
  for (const s of steps) {
    await prisma.$executeRawUnsafe(s);
    console.log(`ok: ${s}`);
  }
} finally {
  const after = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  );
  for (const t of after.map((x) => x.table_name)) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${t}" SET (schema_locked = true)`);
  }
}

const n = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "Frontier"`);
const m = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "FrontierRow"`);
console.log(`\nAPPLIED - ${n[0].n} frontiers, ${m[0].n} rows preserved`);
await prisma.$disconnect();
