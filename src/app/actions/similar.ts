"use server";

import { prisma } from "@/lib/prisma";

// Live duplicate check for the submission form.
//
// Duplicates are the single most common reason a well-made submission gets
// turned down, and the submitter can never see it coming: the catalog is 400+
// entries and nobody reads it before typing. Showing near-matches while the
// title is being typed moves that discovery from "rejected a day later" to
// "noticed before sending".
//
// Only published entries are searched. Pending and rejected ones are not
// public, and leaking "something with this title is already in the queue"
// would disclose the private queue to anyone with a text box.

export interface SimilarEntry {
  slug: string;
  name: string;
  solveDate: string;
}

const MIN_QUERY = 4;
const MAX_RESULTS = 5;

/// Words that match everything and rank nothing. Not a general stopword list:
/// these are the ones that actually recur in this catalog's titles.
const NOISE = new Set([
  "the", "a", "an", "of", "for", "on", "in", "and", "or", "to", "with", "over",
  "problem", "problems", "conjecture", "conjectures", "theorem", "question",
  "questions", "erdos", "erdős",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    // Split on anything that is not a letter or digit, so "Talagrand's" and
    // "$L_p$" both reduce to usable words.
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2 && !NOISE.has(t));
}

export async function findSimilarEntries(query: string): Promise<SimilarEntry[]> {
  const text = query.trim();
  if (text.length < MIN_QUERY) return [];

  const tokens = tokenize(text).slice(0, 4);
  // A title made entirely of noise words still deserves a substring check.
  const terms = tokens.length > 0 ? tokens : [text.toLowerCase()];

  try {
    const rows = await prisma.problem.findMany({
      where: {
        status: "published",
        OR: terms.flatMap((t) => [
          { name: { contains: t, mode: "insensitive" as const } },
          { shortName: { contains: t, mode: "insensitive" as const } },
        ]),
      },
      select: { slug: true, name: true, shortName: true, solveDate: true },
      // Bounded before ranking: a single common term can match a lot, and the
      // ranking below is cheap only on a small set.
      take: 40,
    });

    const scored = rows
      .map((r) => {
        const hay = `${r.name} ${r.shortName}`.toLowerCase();
        const hits = terms.filter((t) => hay.includes(t)).length;
        return { row: r, hits };
      })
      // Rank by how many of the typed words appear, then by brevity: with
      // equal hits the shorter title is the closer match, not the longer one
      // that happens to contain the words among many others.
      .sort((a, b) => b.hits - a.hits || a.row.name.length - b.row.name.length);

    // Only the strongest tier. "Litvak Gaussian minima" matches one entry on
    // all three words and four others on "Gaussian" alone; showing all five
    // buries the actual duplicate in near-misses and teaches the submitter to
    // ignore the panel. Anything below the top score is a different problem
    // that shares a word.
    const best = scored[0]?.hits ?? 0;

    return scored
      .filter((s) => s.hits >= best)
      .slice(0, MAX_RESULTS)
      .map(({ row }) => ({
        slug: row.slug,
        name: row.name,
        solveDate: row.solveDate,
      }));
  } catch (error) {
    console.error("findSimilarEntries failed", error);
    // A failed duplicate check must never block a submission.
    return [];
  }
}
