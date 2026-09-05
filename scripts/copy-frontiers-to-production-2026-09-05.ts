// Copies the Frontiers feature's DATA from staging to production: the
// frontiers, their rows, and the curator changelog, comments and reports that
// hang off them. Runs AFTER the schema has been pushed to production and
// BEFORE the code that reads the tables is deployed there.
//
// Why a copy rather than re-running the seed scripts: the seeds were followed
// by curator decisions with dates on them - the rename of the two prime-gap
// frontiers, the demotion of the 186 row to candidate, the history notes. Those
// live in the rows and the changelog on staging and nowhere else. Re-seeding
// would lose them; copying keeps them.
//
// Entry links are re-keyed BY SLUG. FrontierRow.problemId, and the userId on
// changelog/comment/report rows, are ids in the staging database; the same
// entry or member on production may have a different id, because the two
// databases have taken writes independently since staging was cloned. Every
// reference is resolved through its slug (entries) or pseudonym (members) on
// the target, and the run refuses if any entry a row points at does not exist
// there - a frontier row that silently lost its entry link would show a
// historical dot where an AI step belongs.
//
// Refuses to write unless the target really is production and its Frontier
// tables are empty: this is a one-time copy, not a sync, and running it twice
// must not double the rows. The dry run works BEFORE the schema exists on
// production, so the link checks can be done ahead of the push.
//
// Usage:
//   node_modules/.bin/tsx scripts/copy-frontiers-to-production-2026-09-05.ts
//   node_modules/.bin/tsx scripts/copy-frontiers-to-production-2026-09-05.ts --apply
//
// Reads SOURCE_URL (staging) and TARGET_URL (production) from the environment;
// falls back to DATABASE_URL in .env for the source and the production backup
// env file for the target.

import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");

function urlFrom(file: string): string {
  const m = fs.readFileSync(file, "utf8").match(/^DATABASE_URL="([^"]+)"/m);
  if (!m) throw new Error(`no DATABASE_URL in ${file}`);
  return m[1];
}
const SOURCE = process.env.SOURCE_URL ?? urlFrom(".env");
const TARGET =
  process.env.TARGET_URL ?? urlFrom(".env.production-backup-2026-09-04");

const src = new PrismaClient({ datasources: { db: { url: SOURCE } } });
const dst = new PrismaClient({ datasources: { db: { url: TARGET } } });

async function dbName(p: PrismaClient): Promise<string> {
  const [{ db }] = await p.$queryRawUnsafe<{ db: string }[]>(
    "SELECT current_database() AS db",
  );
  return db;
}

async function main() {
  const [s, t] = await Promise.all([dbName(src), dbName(dst)]);
  console.log(
    `source: ${s}\ntarget: ${t}${t === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );
  if (s !== "vibemathed_staging")
    throw new Error(`refusing: source is "${s}", expected vibemathed_staging`);
  if (t !== "vibemathed")
    throw new Error(`refusing: target is "${t}", expected vibemathed`);

  // Does the target have the schema yet, and is it empty of frontiers? Read
  // up front but only ENFORCED at write time, so the dry run can verify the
  // entry and member links before the schema exists on production.
  const tables = await dst.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Frontier','FrontierRow')`,
  );
  const hasSchema = tables.length === 2;
  const existing = hasSchema
    ? (
        await dst.$queryRawUnsafe<{ n: number }[]>(
          `SELECT count(*)::int AS n FROM "Frontier"`,
        )
      )[0].n
    : 0;
  console.log(
    `target schema: ${hasSchema ? `present, ${existing} frontiers already there` : "NOT pushed yet"}\n`,
  );

  // ---- read everything from the source -----------------------------------
  const frontiers = await src.frontier.findMany({
    include: { rows: { include: { problem: { select: { slug: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  const activity = await src.problemActivity.findMany({
    where: { frontierId: { not: null } },
    include: {
      frontier: { select: { slug: true } },
      user: { select: { pseudonym: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const comments = await src.comment.findMany({
    where: { frontierId: { not: null } },
    include: {
      frontier: { select: { slug: true } },
      user: { select: { pseudonym: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const reports = await src.problemReport.findMany({
    where: { frontierId: { not: null } },
    include: {
      frontier: { select: { slug: true } },
      user: { select: { pseudonym: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  // Frontier.createdById is a bare id with no relation; resolve to pseudonyms
  // on the source so they can be re-keyed on the target like everything else.
  const creatorIds = [
    ...new Set(
      frontiers.map((f) => f.createdById).filter((x): x is string => !!x),
    ),
  ];
  const creators = await src.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, pseudonym: true },
  });
  const creatorPseudonym = new Map(creators.map((u) => [u.id, u.pseudonym]));

  const rows = frontiers.flatMap((f) => f.rows);
  console.log(`frontiers : ${frontiers.length}`);
  console.log(
    `rows      : ${rows.length}  (${rows.filter((r) => r.problemId).length} linked to entries)`,
  );
  console.log(`changelog : ${activity.length}`);
  console.log(`comments  : ${comments.length}`);
  console.log(`reports   : ${reports.length}\n`);

  // ---- resolve every cross-reference on the target ------------------------
  const entrySlugs = [
    ...new Set(
      rows.map((r) => r.problem?.slug).filter((x): x is string => !!x),
    ),
  ];
  const targetEntries = await dst.problem.findMany({
    where: { slug: { in: entrySlugs } },
    select: { id: true, slug: true, status: true },
  });
  const entryId = new Map(targetEntries.map((p) => [p.slug, p.id]));
  const missing = entrySlugs.filter((sl) => !entryId.has(sl));
  const unpublished = targetEntries.filter((p) => p.status !== "published");
  for (const sl of entrySlugs) {
    const p = targetEntries.find((x) => x.slug === sl);
    console.log(
      `  entry ${sl.padEnd(64)} ${p ? p.status : "MISSING ON TARGET"}`,
    );
  }
  if (missing.length)
    throw new Error(
      `refusing: ${missing.length} linked entries do not exist on production`,
    );
  if (unpublished.length)
    console.log(
      `\n  note: ${unpublished.length} linked entries are not published on production; their rows copy as-is.`,
    );

  const pseudonyms = [
    ...new Set(
      [
        ...frontiers.map((f) =>
          f.createdById ? creatorPseudonym.get(f.createdById) : undefined,
        ),
        ...activity.map((a) => a.user?.pseudonym),
        ...comments.map((c) => c.user?.pseudonym),
        ...reports.map((r) => r.user?.pseudonym),
      ].filter((x): x is string => !!x),
    ),
  ];
  const targetUsers = await dst.user.findMany({
    where: { pseudonym: { in: pseudonyms } },
    select: { id: true, pseudonym: true },
  });
  const userId = new Map(targetUsers.map((u) => [u.pseudonym, u.id]));
  const userMissing = pseudonyms.filter((p) => !userId.has(p));
  console.log(
    `\nmembers referenced: ${pseudonyms.length} (${pseudonyms.join(", ")}), found on target: ${targetUsers.length}${userMissing.length ? `, NOT found: ${userMissing.join(", ")} (rows keep the display name, lose the link)` : ""}`,
  );

  for (const f of frontiers) {
    console.log(
      `\n- ${f.slug}  "${f.name}"  ${f.direction}  ${f.rows.length} rows`,
    );
  }

  if (!APPLY) {
    console.log(
      `\nDRY RUN - ${hasSchema ? "pass --apply to write to PRODUCTION" : "push the schema to production first, then pass --apply"}`,
    );
    return;
  }
  if (!hasSchema)
    throw new Error(
      "refusing: production has no Frontier tables - push the schema first",
    );
  if (existing > 0)
    throw new Error(
      `refusing: target already has ${existing} frontiers; this is a one-time copy`,
    );

  // ---- write, in one transaction ------------------------------------------
  await dst.$transaction(async (tx) => {
    const frontierId = new Map<string, string>();
    for (const f of frontiers) {
      const creator = f.createdById
        ? creatorPseudonym.get(f.createdById)
        : undefined;
      const created = await tx.frontier.create({
        data: {
          slug: f.slug,
          name: f.name,
          shortName: f.shortName,
          quantity: f.quantity,
          statement: f.statement,
          direction: f.direction,
          field: f.field,
          fieldGroup: f.fieldGroup,
          significance: f.significance,
          significanceNote: f.significanceNote,
          historyNote: f.historyNote,
          createdById: creator ? (userId.get(creator) ?? null) : null,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        },
        select: { id: true },
      });
      frontierId.set(f.slug, created.id);
      for (const r of f.rows) {
        await tx.frontierRow.create({
          data: {
            frontierId: created.id,
            date: r.date,
            valueTex: r.valueTex,
            valueShortTex: r.valueShortTex,
            valueNumeric: r.valueNumeric,
            rank: r.rank,
            attribution: r.attribution,
            sourceUrl: r.sourceUrl,
            status: r.status,
            note: r.note,
            problemId: r.problem ? (entryId.get(r.problem.slug) ?? null) : null,
            createdAt: r.createdAt,
          },
        });
      }
    }
    for (const a of activity) {
      await tx.problemActivity.create({
        data: {
          frontierId: frontierId.get(a.frontier!.slug)!,
          userId: a.user ? (userId.get(a.user.pseudonym) ?? null) : null,
          userName: a.userName,
          type: a.type,
          field: a.field,
          oldValue: a.oldValue,
          newValue: a.newValue,
          createdAt: a.createdAt,
        },
      });
    }
    // Comments may reply to each other; copy in creation order, re-key parents.
    const commentId = new Map<string, string>();
    for (const c of comments) {
      const created = await tx.comment.create({
        data: {
          frontierId: frontierId.get(c.frontier!.slug)!,
          userId: c.user ? (userId.get(c.user.pseudonym) ?? null) : null,
          userName: c.userName,
          body: c.body,
          parentId: c.parentId ? (commentId.get(c.parentId) ?? null) : null,
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          editedAt: c.editedAt,
          deletedAt: c.deletedAt,
          createdAt: c.createdAt,
        },
        select: { id: true },
      });
      commentId.set(c.id, created.id);
    }
    for (const r of reports) {
      await tx.problemReport.create({
        data: {
          frontierId: frontierId.get(r.frontier!.slug)!,
          userId: r.user ? (userId.get(r.user.pseudonym) ?? null) : null,
          userName: r.userName,
          body: r.body,
          status: r.status,
          createdAt: r.createdAt,
          handledAt: r.handledAt,
        },
      });
    }
  });

  const [{ n }] = await dst.$queryRawUnsafe<{ n: number }[]>(
    `SELECT count(*)::int AS n FROM "FrontierRow"`,
  );
  console.log(
    `\nAPPLIED - production now has ${frontiers.length} frontiers and ${n} rows`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await src.$disconnect();
    await dst.$disconnect();
  });
