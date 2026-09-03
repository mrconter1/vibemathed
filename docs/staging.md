> **Superseded on 3 September 2026.** The staging *environment* now hangs off
> `main`, at `https://vibemathed-git-main-rasmus-projects-f85c1805.vercel.app`,
> and `production` is the branch that serves vibemathed.com. Read `staging`
> below as `main`, and the staging alias as the `main` alias. The OAuth
> clients, database and variables described here are the same ones, rebound.
> See [`branch-flow.md`](branch-flow.md) for why and for what was found on the
> way.

# The staging environment

Staging is a full copy of the site running the `staging` branch, at a fixed
URL, against its own database. It exists so a change can be clicked through
with a real session before it reaches production.

```
your-branch  --PR-->  staging  --PR-->  main
                        |                 |
                  branch alias        vibemathed.com
                  staging database    production database
```

The staging URL is the alias Vercel maintains for the branch:

```
https://vibemathed-git-staging-rasmus-projects-f85c1805.vercel.app
```

That address is stable - it always points at the newest `staging` deployment -
which is the only property the OAuth constraint below actually needs. A custom
subdomain is a nicety, not a requirement; see "A nicer hostname" at the end.

## Why a branch and not per-PR previews

Vercel gives every push to a non-production branch its own preview URL for
free, and those are useful for a quick visual check. They are not enough here,
for two reasons:

1. **Sign-in cannot work on them.** OAuth redirect URIs have to be registered
   in advance, and a per-deployment preview URL carries a hash that is not
   known until the deployment exists. GitHub allows up to ten redirect URIs per
   app and Google allows several, but no allowance helps when the URL cannot be
   predicted, and a stream of pull requests would exhaust ten regardless.
   Anything behind a session - submitting, reviewing, voting, the inbox - is
   therefore untestable on a per-deployment preview. The per-*branch* alias
   above is the exception: it is stable and known ahead of time, which is
   precisely why staging is a branch rather than a pull request.
2. **They would share production's database.** Preview deployments inherit the
   Preview environment's variables. Unless those are overridden, a preview
   writes to the live catalog, which is exactly what a test environment must
   never do.

A single long-lived branch with a fixed hostname fixes both: one stable
callback URL to register, and one place to point a separate `DATABASE_URL`.

## One-time setup

These steps need the Vercel, CockroachDB, Google and GitHub consoles, so they
are done by hand rather than from this repository.

### 1. A staging database

Create a second database on the existing CockroachDB cluster - call it
`vibemathed_staging`. It can live on the same serverless cluster; it just must
not be the same database.

Then seed it from the committed baseline:

```bash
DATABASE_URL="<staging url>" npm run db:push
DATABASE_URL="<staging url>" npm run db:seed
```

`db:seed` is idempotent, so re-running it to refresh staging is safe. If
`db:push` fails, see the CockroachDB quirks in the [README](../README.md#cockroachdb-quirks).

Do **not** copy production's database wholesale. It holds member accounts,
private inbox messages and email addresses; staging should start from the
public seed baseline instead.

### 2. Nothing - the URL already exists

Vercel maintains `vibemathed-git-staging-…vercel.app` for the branch on its
own. There is no domain step unless you want a prettier hostname later.

### 3. Staging OAuth clients

Two new clients, because staging must not accept production's tokens:

Write `STAGING` below for
`https://vibemathed-git-staging-rasmus-projects-f85c1805.vercel.app`.

Both providers accept several redirect URIs per client - GitHub up to ten -
so adding the staging callback to the production client would work. Prefer a
separate client anyway, for isolation rather than necessity: a staging
credential is then worthless against production, and rotating or revoking
staging cannot take the live site down with it. That is the whole point of
having a staging environment.

- **GitHub** — Developer settings → OAuth Apps → **New OAuth App**, callback
  `STAGING/api/auth/callback/github`. Leave wildcard matching OFF; it would let
  tokens reach any subdomain or path under that URL. Leave "Expire user access
  tokens" off too - the app reads the GitHub token once at sign-in and never
  calls the API again, so a refresh token would be for something nothing uses.
- **Google** — Cloud Console → Credentials → new OAuth client ID (Web
  application), authorized redirect URI `STAGING/api/auth/callback/google`.

Neither can be created from a CLI: GitHub's API can create GitHub Apps but not
OAuth Apps, and Google's OAuth clients are console-only in practice. These two
steps stay manual however much of the rest is automated.

### 4. Branch-scoped environment variables

Scoped to the `staging` branch specifically, not to all previews. From the CLI:

```bash
printf '<value>' | vercel env add NAME preview --git-branch staging --sensitive
```

| Variable | Value | Status |
| --- | --- | --- |
| `DATABASE_URL` | the staging database URL | set |
| `AUTH_SECRET` | a fresh secret - not production's | set |
| `AUTH_URL` | the branch alias | set |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | the Google client from step 3 | set |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | the staging GitHub app from step 3 | set |

Until the last two are set, the staging branch inherits the Preview-scoped
production OAuth credentials, whose callbacks do not include the staging
alias - so staging builds and serves fine, but sign-in fails.

`AUTH_URL`, not `NEXTAUTH_URL` - this is Auth.js v5 (`next-auth@5`), where the
variable was renamed. Without it, Auth.js derives the callback origin from
`VERCEL_URL`, which is the per-deployment hostname rather than the branch
alias, and the OAuth redirect will not match what you registered.

Scoping matters. If these land on "all Preview deployments", every fork's
preview build gets them too.

## Why a push can produce no deployment

Vercel does not rebuild a commit SHA it has already built. Creating `staging`
at the same commit as `main` therefore produces no staging deployment at all,
however long you wait, and nothing is misconfigured - there is simply nothing
new to build. The branch gets its first deployment on its first commit that
differs from what is already deployed.

This is worth knowing before concluding that branch deploys are switched off.
There is no such setting on the Git settings page to find.

## Day to day

- Open pull requests against `staging`. CI runs on them; `staging` is not
  protected by an approval requirement, so a green check is enough to merge.
- Click the change through on the branch alias, signed in.
- Promote with a second pull request from `staging` into `main`. That one needs
  a green CI run and one approval.

## Refreshing staging

Staging data drifts as people test against it. To reset:

```bash
DATABASE_URL="<staging url>" npm run db:seed
```

Reset it whenever staging data stops resembling production closely enough to
be a useful test, and always after testing anything destructive.

## Staging is not indexable

`src/app/robots.ts` serves `Disallow: /` on anything that is not the production
deployment, keyed on Vercel's `VERCEL_ENV`. Without that, staging would offer
crawlers a complete duplicate of the catalog under a second hostname, competing
with production in search results. Canonical tags still point at
`vibemathed.com`, so a staging page that does get fetched passes credit to the
real one.

If the staging domain is ever moved off Vercel, this check moves with it -
`VERCEL_ENV` is set by the platform, not by us.

## A nicer hostname, if you want one

The branch alias is functional but ugly. To serve staging at
`staging.vibemathed.com` instead, add the domain to the project **assigned to
the `staging` branch** - not to production, which would put the live site on
that hostname.

The CLI cannot do this: `vercel domains add` has no `--git-branch` flag. It is
either the dashboard (**Settings → Domains**, set the Git branch on the domain)
or the REST API:

```
POST /v10/projects/{projectId}/domains
{ "name": "staging.vibemathed.com", "gitBranch": "staging" }
```

If you do this, update `AUTH_URL` and both OAuth callback URLs to match, or
sign-in will break on the new hostname.

## What staging is not

It is not a rehearsal for database migrations against production data, because
it does not hold production data. `db:push` applies schema changes without a
migration history, so a schema change that is safe on a freshly seeded staging
database can still be unsafe against a populated production one. Schema changes
still need thinking about on their own terms.
