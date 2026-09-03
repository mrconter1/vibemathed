# Branch flow

**Status: agreed and half-migrated. The last two steps need the operator's
hands; until they are done, `main` is still the production branch and the
"how it works" section below describes the target, not the present.** The
"Where it stands" section at the bottom says exactly which is which.

## The problem this fixes

The old flow was one-directional on paper - branch → `staging` → `main` - and
it broke in practice, because the person with commit rights pushed straight to
`main`. Twelve times on 2 September alone. `staging` starved, drifted 42
commits behind, and every pull request opened against it arrived carrying
someone else's history:

- **PR #13** conflicted in `docs/staging.md`, a file the contributor never
  touched.
- **PR #14** reported a typecheck error against `src/app/queue/page.js`, a
  route that exists on `main` and not on `staging`, from a stale `.next`.
- Both PRs showed 25 commits, 23 of which were ours.

The topology was not the problem. The problem is that the branch contributors
were told to target was not the branch that was furthest ahead, and any
arrangement with that property drifts. Proposed by Eugene Gilburg, accepted
3 September 2026.

## How it works

```
feature branch ──PR──► main ──PR──► production
                        │              │
                   staging env     vibemathed.com
                   (own database)  (production database)
```

- **`main` is where everything lands first**, and it deploys to the staging
  environment. Contributors branch from it and open pull requests against it.
  A push straight to `main` is now harmless: it reaches staging, gets clicked
  through, and goes no further on its own.
- **`production` is what the site serves.** Reaching it is a deliberate act -
  a pull request from `main`, or a promotion workflow. Nothing arrives there
  by momentum.
- **Hotfixes** may go straight to `production` and must then be brought back
  to `main`, or the next promotion silently reverts them.

Both branches require a green `checks` run and one approving review.
`enforce_admins` is false on both, which is the operator's escape hatch and
should stay a hatch rather than a habit.

### Why the site keeps a long-lived staging branch at all

Because OAuth redirect URIs are registered in advance. Vercel gives a
long-lived branch a stable alias; a per-PR preview gets a new URL on every
deploy, and no OAuth provider will accept a wildcard. So a preview deployment
cannot exercise anything behind sign-in, which is most of what is worth
clicking through. That is why "delete staging, use previews" is not the
answer, and why the staging environment moves to `main` rather than
disappearing.

### What this costs

Production deploys become explicit. For a site that publishes a public record
of other people's mathematics, that is the right side to err on: on
2 September a change passed lint, typecheck and 55 tests and still failed the
production build, and vibemathed.com served a stale build for twenty minutes.
Under this flow that lands in staging and nobody outside notices.

The cost is only acceptable if promotion is one action. If it becomes a
ceremony it will be bypassed within a week.

## Where it stands

Done:

- [x] `production` branch created, protected (`checks` required and strict, one
      approving review, stale reviews dismissed, no force pushes, no deletions).
- [x] Open pull requests retargeted from `staging` to `main`.
- [x] `production` caught up to `main` (PR #16). This step was not in the
      original plan: it assumed the flip would happen while both branches
      pointed at the same commit, and that expired ten minutes after
      `production` was cut. Trees are now identical, so the flip changes
      nothing a reader would see.
- [x] The `main` branch alias registered as a redirect URI in both *staging*
      OAuth applications, Google and GitHub.

Also done, 3 September evening:

- [x] Unscoped Preview `DATABASE_URL` pointed at `vibemathed_staging`, so no
      pull request preview can reach the live catalog.
- [x] Vercel production branch changed from `main` to `production`. Confirmed
      via the API; no deployment was triggered and vibemathed.com kept serving
      the build it had.
- [x] The seven `staging`-scoped variables rebound to `main` and `AUTH_URL`
      changed to the `main` alias. Confirmed the hard way: Auth.js on the
      alias reports both providers' `callbackUrl` under the `main` hostname.
- [x] First `main` deployment under the new flow built, as a preview, and
      vibemathed.com did not move. It failed first - see below - which is the
      new flow doing its job on day one.

Remaining:

- [ ] Retire `staging`: delete the branch. Its variables are already gone
      (they are the seven that moved).

### What the first staging build found

It failed with `P2022 column User.staffRole does not exist` and `P2021 table
FieldProvenance does not exist`. The staging *database* had drifted: every
schema change of the past week had been pushed to production only, and since
nothing recent ever deployed to `staging`, nobody could have seen it. Fixed by
`db:push` + `db:seed` against `vibemathed_staging`, using
`scripts/schema-lock.mjs` to unlock all sixteen tables at once first (the
README's one-table ALTER fails once per drifted table). Rule going forward:
**a schema change is pushed to staging before it is pushed to production**, or
the next `main` build fails the same way.

### Two things that make this harder than it looks

**The rebind must come after the flip, not before.** Vercel refuses to scope a
Preview variable to whatever branch is currently the Production Branch:

    400 Cannot set Production Branch "main" for a Preview Environment Variable.

Which is reasonable - `main` produces no preview deployments while it is the
production branch, so the variable would be dead. But it means the two steps
have to happen in the opposite order to the one that reads naturally, and
between them `main` briefly has no branch-scoped variables of its own. That is
the whole reason the `DATABASE_URL` fix is listed first.

**The rebind cannot be done by removing and re-adding.** Six of the seven are
stored as Secret, which is write-only: `vercel env pull` writes `[SENSITIVE]`
placeholders, and no dashboard page or API response will reveal them either.
The CLI cannot re-scope them - `vercel env update` changes a *value*, and the
git branch is how it addresses the variable rather than something it can set.
The only path that keeps the value is `PATCH /v10/projects/{id}/env/{envId}`
with `gitBranch`, or the equivalent edit in the dashboard.

Until the flip, `main` is still the production branch and a push to `main`
still deploys to vibemathed.com.
