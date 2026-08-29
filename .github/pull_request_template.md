## What this changes

<!-- One or two sentences. What is different after this merges? -->

## Why

<!-- The reason, not the mechanics. If it fixes an issue, link it: Fixes #123 -->

## How to check it

<!-- The steps a reviewer should take on the staging deployment to see it
     working. "Open /problem/<slug>, the vote tally should still stream in
     after the shell renders" beats "tested locally". -->

## Checklist

- [ ] Opened against `staging` (not `main`) - see [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] `npm run lint` and `npm run typecheck` pass
- [ ] Comments explaining *why* are updated where the reasoning changed
- [ ] No catalog content edited by hand - entries live in the database, not in git
- [ ] Any script that writes to a database defaults to a dry run and needs `--apply`

<!-- Not a checklist item, but worth saying if it applies: if this changes
     anything a comment currently justifies, and you disagree with that
     comment's reasoning, say so here rather than deleting it quietly. -->
