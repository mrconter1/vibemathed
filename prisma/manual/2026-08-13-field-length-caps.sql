-- Cap the text columns at the same lengths the forms enforce.
--
-- RUN THIS BY HAND. Do NOT reach these column types with `prisma db push`.
--
-- Prisma's cockroachdb connector cannot narrow STRING to STRING(n) in place.
-- Asked for this change it emits DROP COLUMN followed by ADD COLUMN, which
-- silently discards the contents of every column listed below - across the
-- whole catalog that is every verification note, result note, significance
-- note, source name, review message and link label. The statements here do
-- the same job with ALTER COLUMN ... TYPE, which rewrites the column while
-- keeping its data.
--
-- Order matters only in that the two SETs must come first. Narrowing a type is
-- a validating conversion, gated behind the experimental setting; and
-- CockroachDB implements ALTER COLUMN TYPE only in its declarative schema
-- changer, which the legacy changer refuses with
--   "ALTER COLUMN TYPE is only implemented in the declarative schema changer"
-- Both are session variables, so they last for this connection and no longer.
--
-- Safe to re-run: altering a column to the type it already has is a no-op.
--
-- Before running, confirm nothing would be truncated:
--     npx tsx scripts/audit-field-lengths.ts     -- must report 0 over-limit
-- After running, confirm the schema and the database agree:
--     npx prisma migrate diff \
--       --from-schema-datasource prisma/schema.prisma \
--       --to-schema-datamodel prisma/schema.prisma --script
--   which must print no ALTER for these columns.

SET enable_experimental_alter_column_type_general = true;
SET use_declarative_schema_changer = 'unsafe_always';

ALTER TABLE "Problem" ALTER COLUMN "name" TYPE STRING(200);
ALTER TABLE "Problem" ALTER COLUMN "shortName" TYPE STRING(60);
ALTER TABLE "Problem" ALTER COLUMN "field" TYPE STRING(80);
ALTER TABLE "Problem" ALTER COLUMN "statement" TYPE STRING(1200);
ALTER TABLE "Problem" ALTER COLUMN "posedBy" TYPE STRING(200);
ALTER TABLE "Problem" ALTER COLUMN "model" TYPE STRING(120);
ALTER TABLE "Problem" ALTER COLUMN "modelMaker" TYPE STRING(120);
ALTER TABLE "Problem" ALTER COLUMN "aiRole" TYPE STRING(1500);
ALTER TABLE "Problem" ALTER COLUMN "verificationNote" TYPE STRING(1500);
ALTER TABLE "Problem" ALTER COLUMN "claimIssueNote" TYPE STRING(1000);
ALTER TABLE "Problem" ALTER COLUMN "citationsPaper" TYPE STRING(300);
ALTER TABLE "Problem" ALTER COLUMN "citationsSource" TYPE STRING(120);
ALTER TABLE "Problem" ALTER COLUMN "renownNote" TYPE STRING(300);
ALTER TABLE "Problem" ALTER COLUMN "significanceNote" TYPE STRING(600);
ALTER TABLE "Problem" ALTER COLUMN "solveCostNote" TYPE STRING(300);
ALTER TABLE "Problem" ALTER COLUMN "resultNote" TYPE STRING(1000);
ALTER TABLE "Problem" ALTER COLUMN "ageNote" TYPE STRING(400);
ALTER TABLE "Problem" ALTER COLUMN "sourceName" TYPE STRING(200);
ALTER TABLE "Problem" ALTER COLUMN "submitterNote" TYPE STRING(1000);
ALTER TABLE "Problem" ALTER COLUMN "reviewMessage" TYPE STRING(2000);

ALTER TABLE "ProblemLink" ALTER COLUMN "label" TYPE STRING(120);
