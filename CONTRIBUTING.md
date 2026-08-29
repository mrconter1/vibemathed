# Contributing to VibeMathed

Thanks for wanting to help. There are two quite different ways to contribute
here, and it is worth knowing which one you want before you start.

## Two kinds of contribution

**Catalog contributions** - adding an entry, correcting a field, flagging a bad
claim - do **not** go through this repository. The catalog lives in a database,
not in git, so a pull request cannot add or edit an entry. Use the site:

- [Submit an entry](https://vibemathed.com/submit)
- Edit any field from the entry page (changes are recorded in a public changelog)
- Open a discussion thread on the entry, or use [contact](https://vibemathed.com/contact)

What qualifies and how every label is assigned is documented in the
[methodology](https://vibemathed.com/methodology). Read it before submitting -
most rejections are scope decisions, not quality judgements.

**Code contributions** - the site itself - are what this file is about.

## Before you write code

Read [`AGENTS.md`](AGENTS.md). This is Next.js 16 with Cache Components and
Partial Prerendering enabled, and it postdates a lot of what people (and
models) assume about the App Router. The guides in `node_modules/next/dist/docs/`
are the authority, not memory.

For anything non-trivial, open an issue first and say what you intend to
change. A short conversation is cheaper than a rejected pull request.

## Setup

There is no bundled local database. Point `DATABASE_URL` at any
Postgres-compatible database - CockroachDB serverless has a free tier that is
enough for development.

```bash
cp .env.example .env    # then fill it in; the Prisma CLI reads .env, not .env.local
npm install
npm run db:push         # sync schema (there is no migrations directory)
npm run db:seed         # load problems.json - idempotent
npm run dev
```

`.env.example` documents every variable, including how to create the Google and
GitHub OAuth clients. Both providers accept several redirect URIs per client,
so you *can* add `http://localhost:3000/...` to an existing app - but make your
own rather than borrowing someone else's, so a local credential is never one
that works anywhere else.

If `db:push` fails, see the CockroachDB quirks section of the
[README](README.md#cockroachdb-quirks) - there are two known ones, both with
a one-line fix.

## Branching and pull requests

```
your-branch  --PR-->  staging  --PR-->  main
                        |                 |
                   staging site      vibemathed.com
```

- Branch from `main`.
- Open your pull request against **`staging`**, not `main`. Staging has its own
  database and its own OAuth apps, so you can sign in and click through your
  change against real-looking data without touching production. See
  [`docs/staging.md`](docs/staging.md) for how it is wired and how to refresh it.
- Once it has been exercised on staging, it is promoted to `main` in a separate
  pull request. `main` deploys to production on merge.
- `main` is protected: it needs a green CI run and one approving review, and
  cannot be pushed to directly.

Keep pull requests focused. An infrastructure fix and a feature belong in
separate ones, and reviewing is much faster when a diff does one thing.

## What CI checks

Every pull request runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

| Check | Command |
| --- | --- |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
| Prisma schema is valid | `npx prisma validate` |
| Formatting of `problems.json` | parsed and re-serialised |

CI deliberately does **not** run `npm run build`. The build prerenders the
most-visited entry pages via `generateStaticParams`, which needs a reachable
`DATABASE_URL`, and pull requests from forks have no database credentials -
correctly, since nobody should be handing them out. Vercel builds every push
anyway, so a broken build shows up on the deployment rather than in CI.

Run the same checks locally before pushing:

```bash
npm run lint
npm run typecheck
```

Warnings are allowed; errors are not.

## Code conventions

Match the surrounding code rather than importing a house style from elsewhere.
A few things that are genuinely load-bearing here:

- **Comments explain why, not what.** The existing comments are unusually
  dense and they earn it: most of them record a decision and the reason it went
  that way, which is what stops the next person undoing it. If you change
  something a comment justifies, update the comment.
- **The database is the source of truth.** `src/data/problems.json` is a seed
  baseline and disaster-recovery snapshot, refreshed with `npm run db:export`.
  Do not hand-edit it to change catalog content.
- **Never write to a live database from a script without a dry run.** The
  scripts in `scripts/` all default to printing a diff and require `--apply` to
  write. Keep that pattern.
- **Field length limits are enforced in the database.** `npm run check:limits`
  and `npm run audit:lengths` exist because silently truncating a curator's
  note is worse than failing loudly.

## Reporting a problem with an entry

If an entry is wrong - a misread source, an overstated AI claim, a result that
was already known - that is a catalog issue, not a code issue. Say so on the
entry's discussion thread or through [contact](https://vibemathed.com/contact).
Entries are corrected in the open, with the change recorded; several published
entries have been downgraded or unpublished after exactly this kind of report.

## Licensing

Code is MIT. Catalog content and the dataset are CC BY 4.0. By contributing
code you agree it is released under the MIT license in [LICENSE](LICENSE).
