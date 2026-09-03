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

Remaining, and both need the operator:

- [ ] **Move the staging environment from the `staging` branch to `main`.**
      Seven branch-scoped variables in Vercel are bound to the branch *name*
      `staging`: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, and the Google and
      GitHub client ids and secrets. They must be rebound to `main`, and
      `AUTH_URL` must change from
      `https://vibemathed-git-staging-rasmus-projects-f85c1805.vercel.app` to
      `https://vibemathed-git-main-rasmus-projects-f85c1805.vercel.app`.
- [ ] **Register that URL as a redirect URI in the Google and GitHub OAuth
      applications.** This is the step nobody but the operator can do, and
      skipping it breaks sign-in on staging without breaking anything else,
      which is a confusing failure. Do it before the rebind, not after.
- [ ] **Change the Vercel project's production branch from `main` to
      `production`.** Safe at the moment both point at the same commit; do it
      then, and confirm vibemathed.com is unchanged before pushing anything
      new to `main`.
- [ ] Retire the `staging` branch once its environment has moved. Delete it
      rather than leaving a third long-lived branch to drift.

Until those are done, `main` is still the production branch, and a push to
`main` still deploys to vibemathed.com.
