# VibeMathed

**[vibemathed.com](https://vibemathed.com)** is a community of mathematicians
and enthusiasts tracking, curating and cataloguing the mathematical problems
that have been solved, fully or partially, by AI models - from famous
conjectures to the long tail of specialist questions and the numbered Erdős
problems.

Not a scrape, not a leaderboard. Every entry cites a real, checkable primary
source, and results that are unrefereed, partial, or actively disputed are
labeled as such rather than left out or overstated. The
[methodology](https://vibemathed.com/methodology) documents what qualifies and
how every label is assigned.

## What an entry carries

- **Result** (proved / disproved) and **status** (resolved, partial, variant,
  candidate under review, retracted)
- A **verification ladder** from Lean-kernel-checked down to contested
- An **AI contribution** tier: did the model discover the mathematics,
  co-develop named steps, or assist a human-led proof
- A **significance** score, 0-100 against an anchored ladder (Riemann
  hypothesis = 100), assigned with a
  [published prompt](public/significance-prompt.md)
- Community machinery: submissions with review, field-level edits with a
  public changelog, discussion threads, votes, and member profiles - all under
  pseudonyms only (real names, emails and avatars are never shown)

## Data

The complete dataset is one request away:
[vibemathed.com/api/dataset](https://vibemathed.com/api/dataset). What the site
wrote is CC BY 4.0; quoted material from the papers is not ours to license. See
[vibemathed.com/data-license](https://vibemathed.com/data-license).

The database is the source of truth. [`src/data/problems.json`](src/data/problems.json)
is the seed baseline and disaster-recovery snapshot, refreshed with
`npm run db:export` after catalog changes; `npm run db:seed` rebuilds a fresh
database from it. Community edits are audited in the `ProblemActivity` table,
not in git.

## Stack

Next.js (App Router, v16) + TypeScript + Tailwind, CockroachDB (serverless,
Postgres-compatible) via Prisma, Auth.js (`next-auth` v5) with Google as the
only provider. Deployed on Vercel.

Cache Components (`cacheComponents: true`) is enabled, so Partial Prerendering
is the default: each page ships a prerendered static shell, and the parts that
depend on the viewer stream in. That is what keeps every entry page indexable
while still showing a live vote tally.

See the root `AGENTS.md` before making framework-level changes; this Next.js
version postdates a lot of training data.

## Local development

There is no bundled local database - point `DATABASE_URL` at any
Postgres-compatible database (CockroachDB serverless has a free tier). Copy
`.env.example` to `.env` (the Prisma CLI reads `.env`, not `.env.local`) and
fill in the database URL, an `AUTH_SECRET` (`npx auth secret`), and a Google
OAuth client of your own.

```bash
npm install
npm run db:push      # sync schema (no migrations dir)
npm run db:seed      # load problems.json (idempotent)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### CockroachDB quirks

- A newly created database on a multi-region cluster can carry
  `crdb_internal_region` metadata that breaks `prisma db push`. Fix once:
  `ALTER DATABASE vibemathed DROP REGION "<region>";`
- CockroachDB v26 creates tables with `schema_locked = true`, which breaks
  Prisma's multi-step pushes. Unlock any newly added table with
  `ALTER TABLE "<name>" SET (schema_locked = false);` if a push fails on it.

### Scripts

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Dev server                                     |
| `npm run typecheck` | `tsc --noEmit`                                 |
| `npm run lint`      | ESLint                                         |
| `npm run db:push`   | Sync schema to `DATABASE_URL` (no migrations)  |
| `npm run db:seed`   | Seed entries from `problems.json`              |
| `npm run db:export` | Snapshot the database back to `problems.json`  |
| `npm run db:studio` | Browse the database                            |

`npm run build` needs a reachable `DATABASE_URL`: the most-visited entry pages
are prerendered from the database via `generateStaticParams`.

## Contributing

Catalog contributions - new entries, corrections, challenges to a claim - go
through the site rather than through git, because the catalog lives in a
database: see [vibemathed.com/contributing](https://vibemathed.com/contributing).

For code, see [CONTRIBUTING.md](CONTRIBUTING.md). **Pull requests go to
`main`**, which is where everything lands first; `production` is what
vibemathed.com serves, and reaching it is a deliberate promotion. Both require
a green CI run and one approval. [`docs/branch-flow.md`](docs/branch-flow.md)
explains why, and lists the two migration steps still outstanding - until they
are done, `main` is still the branch that deploys to production.

## License

Code is MIT (see [LICENSE](LICENSE)).

Catalog content is mixed and the distinction matters: the classifications,
verification tiers, significance scores, curator notes and the structure of the
dataset are VibeMathed's own and are CC BY 4.0. Material quoted from the papers
an entry cites - abstracts, passages, figures - belongs to its authors and is
not relicensed by appearing here. [vibemathed.com/data-license](https://vibemathed.com/data-license)
is the canonical statement, and `/api/dataset` points at it rather than
asserting one licence over both.
