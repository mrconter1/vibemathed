# VibeMathed

A hand-curated record of math problems (conjectures, open problems) that have
been proved, disproved, or partially resolved with an AI model in the loop.

Not a scrape, not a leaderboard. Every entry links a real, checkable source,
and results that aren't yet formally peer-reviewed (or are actively disputed)
are labeled as such rather than left out or overstated.

## Adding an entry

Entries live in [`src/lib/problems.ts`](src/lib/problems.ts) as a typed array
- no database, no CMS. To add one:

1. Find a real source (announcement, arXiv, article) - not a summary of a
   summary.
2. Fill in every field of the `MathProblem` type, including `verification` /
   `verificationNote`. If the result is contested or unreviewed, say so there
   instead of skipping the entry.
3. Leave `citations` as `null` unless you've actually looked up the Google
   Scholar count for the original problem/paper - it's not auto-fetched.
4. Run `npm run dev` and eyeball the card before committing.

## Stack

Next.js (App Router) + TypeScript + Tailwind. No backend, no database - the
data file *is* the database for now. See the root `AGENTS.md` before making
framework-level changes; this Next.js version postdates a lot of training
data.

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
