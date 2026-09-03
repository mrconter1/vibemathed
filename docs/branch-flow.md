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

- [x] `production` branch created at `51baf67`, the then-current `main`.
- [x] `production` protected: `checks` required and strict, one approving
      review, stale reviews dismissed, no force pushes, no deletions.
- [x] Open pull requests retargeted from `staging` to `main`.
- [x] Staging OAuth clients created and their four credentials set. The table
      in [`staging.md`](staging.md) still calls them pending; it is stale.

Remaining. The first of these did not exist when the plan was written:

- [ ] **Catch `production` up to `main`, before anything else.** The plan
      assumed the flip would happen while both branches pointed at the same
      commit. That expired ten minutes after `production` was cut: `main`
      took `e384575` and `3ee2e37`, and the deployment vibemathed.com serves
      was built five minutes after the second of them. Flipping now would
      point production at `51baf67` and roll the live site back two commits,
      taking the raised submission limit with it. `51baf67` is an ancestor of
      `3ee2e37`, so this is a fast-forward and not a merge. PR #16 does it.
- [ ] **Register the `main` branch alias as a redirect URI in the two
      *staging* OAuth applications** - not the production ones, since it is
      the staging credentials that are moving to `main`:
      `https://vibemathed-git-main-rasmus-projects-f85c1805.vercel.app/api/auth/callback/google`
      and the matching `/github`. This is the step nobody but the operator can
      do, and skipping it breaks sign-in on staging without breaking anything
      else, which is a confusing failure. Do it before the rebind, not after.
- [ ] **Move the staging environment from the `staging` branch to `main`** by
      *editing the branch on each of the seven existing variables* in the
      Vercel dashboard, and changing `AUTH_URL` from the `staging` alias to
      the `main` one.

      Do not attempt this by pulling the values and adding them back. Six of
      the seven are stored as Secret, which is write-only: `vercel env pull`
      writes `[SENSITIVE]` placeholders for them, and no dashboard page or API
      call will reveal them either. Editing the branch on the existing
      variable is the only path that preserves the value. `AUTH_URL` is the
      one readable exception, and it is the one that has to change anyway.

      The CLI cannot do this - `vercel env` has add, rm, ls and pull, and no
      edit - so it is the dashboard or a `PATCH` to
      `/v10/projects/{id}/env/{envId}`.
- [ ] **Change the Vercel project's production branch from `main` to
      `production`.** Do it once the branches agree, and confirm
      vibemathed.com is unchanged before pushing anything new to `main`.
- [ ] Retire the `staging` branch once its environment has moved, and delete
      the seven now-unused branch-scoped variables with it. Delete the branch
      rather than leaving a third long-lived one to drift.

Until those are done, `main` is still the production branch, and a push to
`main` still deploys to vibemathed.com.

### One thing to fix while in that settings page

Seven variables are scoped to Preview with *no* branch, including a
`DATABASE_URL`. Those apply to every preview deployment, which after the flip
means `main` and every pull request. If that one points at the production
database then a preview can write to the live catalog, which is precisely what
[`staging.md`](staging.md) says a test environment must never do.

Its value cannot be read back, so the answer is not to check it but to set it:
point the unscoped Preview `DATABASE_URL` at the staging database deliberately.
Then it does not matter what it used to be.
