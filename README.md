# VibeMathed

A hand-curated record of math problems (conjectures, open problems) that have
been proved, disproved, or partially resolved with an AI model in the loop.

Not a scrape, not a leaderboard. Every entry links a real, checkable source,
and results that aren't yet formally peer-reviewed (or are actively disputed)
are labeled as such rather than left out or overstated.

Signed-in visitors can upvote and downvote entries. People appear under a
pseudonym only - see [Identity](#identity).

## Stack

Next.js (App Router, v16) + TypeScript + Tailwind, CockroachDB (serverless,
Postgres-compatible) via Prisma, Auth.js (`next-auth` v5) with Google as the
only provider. Deployed on Vercel.

The database is the `vibemathed` database on the same stone-grivet CockroachDB
cluster that wilhelm-scream-db uses - separate database, shared cluster.

Cache Components (`cacheComponents: true`) is enabled, so Partial Prerendering
is the default: each page ships a prerendered static shell, and the parts that
depend on the viewer stream in. That is what keeps every entry page indexable
while still showing a live vote tally.

See the root `AGENTS.md` before making framework-level changes; this Next.js
version postdates a lot of training data.

## Adding an entry

Entries live in [`src/data/problems.json`](src/data/problems.json) and are
seeded into Postgres. The JSON file is still the source of record for curation,
and it is still validated on the way in - so a malformed entry fails loudly
instead of reaching the database.

1. Find a real source (announcement, arXiv, article) - not a summary of a
   summary.
2. Add an object to `problems.json` filling in every field of the `MathProblem`
   type in [`src/lib/problems.ts`](src/lib/problems.ts), including
   `verification` / `verificationNote`. If the result is contested or
   unreviewed, say so there instead of skipping the entry.
3. Leave `citations` as `null` unless you've actually looked up the Google
   Scholar count for the original problem/paper - it's not auto-fetched.
4. Run `npm run db:seed` to push it into the database, then `npm run dev` and
   eyeball the card before committing.

Re-seeding is idempotent and safe against a live database: it matches on `slug`
and refreshes curated content only. It never touches votes, comments,
submission status, or anything else users produced.

Because entries now live in the database, git is no longer the audit log for
curation changes - the `ProblemActivity` table is. Anything that edits an entry
should write a row there.

## Identity

Every account gets a random pseudonym at sign-up (`BraveMongoose492`) and that
is the **only** name shown publicly, anywhere on the site. The real Google name,
email and avatar are never displayed. Users can change their pseudonym in the
header menu. This matches how `wilhelm-scream-db` works.

## Local development

There is no local database in this setup - local development points at the
cloud CockroachDB cluster. Environment lives in `.env` (not `.env.local`,
because the Prisma CLI only reads `.env`); copy `.env.example` and fill it in.

The current `.env` reuses credentials from wilhelm-scream-db: the same cluster
user, and the same Google OAuth client (both apps use the identical
`http://localhost:3000/api/auth/callback/google` redirect URI locally).
`AUTH_SECRET` is NOT shared - each app signs its own sessions.

With `.env` in place:

```bash
npm run db:push      # sync schema (no migrations dir; matches wilhelm)
npm run db:seed      # load problems.json (idempotent)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### CockroachDB quirks hit during setup

- A newly created database on the cluster carries multi-region metadata
  (`crdb_internal_region`) that breaks `prisma db push`. Fix once per database:
  `ALTER DATABASE vibemathed DROP REGION "aws-eu-central-1";`
- CockroachDB v26 creates tables with `schema_locked = true`, which breaks
  Prisma's multi-step pushes. The tables were unlocked once with
  `ALTER TABLE "<name>" SET (schema_locked = false);` - any table added later
  will need the same treatment if a subsequent push fails on it.

### Useful scripts

| Script                | What it does                                  |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Dev server                                    |
| `npm run typecheck`   | `tsc --noEmit`                                |
| `npm run lint`        | ESLint                                        |
| `npm run db:push`     | Sync schema to `DATABASE_URL` (no migrations) |
| `npm run db:seed`     | Seed entries from `problems.json`             |
| `npm run db:studio`   | Browse the database                           |

`npm run build` needs a reachable `DATABASE_URL`: entry pages are prerendered
from the database via `generateStaticParams`.

### Known follow-ups

- Prisma is pinned to 6.19.2. Prisma 7 moves to the new `prisma-client`
  generator with explicit output paths; upgrade once there is a live database to
  validate it against. The `package.json#prisma` seed config is deprecated in
  favour of `prisma.config.ts` and will need to move at the same time.
- Comments have a table and are wired into the entry-card comment count, but no
  posting UI yet.
- User-submitted problems have a `status` (`pending` / `published` / `rejected`)
  and a `submittedBy` relation, but no submission form or review queue yet.
