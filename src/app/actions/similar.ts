"use server";

import { prisma } from "@/lib/prisma";
import { texToHtml } from "@/components/TeX";
import { extractSourceId } from "@/lib/source-ids";

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
  /// The name with $...$ pre-rendered to KaTeX HTML on the server, so client
  /// dropdowns can show real math without shipping KaTeX to the browser.
  nameHtml: string;
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

/// Search for the relation picker: name-or-shortName substring match over
/// published entries, excluding the entry being edited (an entry cannot
/// relate to itself, so offering it is offering a mistake).
///
/// Different ranking from `findSimilarEntries` on purpose: the duplicate
/// check keeps only the strongest tier because near-misses teach submitters
/// to ignore the panel, while a picker should show everything plausible and
/// let the person choose.
export async function searchEntriesForRelation(
  query: string,
  excludeSlug: string,
): Promise<SimilarEntry[]> {
  const text = query.trim();
  if (text.length < 3) return [];

  const tokens = tokenize(text).slice(0, 4);
  const terms = tokens.length > 0 ? tokens : [text.toLowerCase()];

  try {
    const rows = await prisma.problem.findMany({
      where: {
        status: "published",
        slug: { not: excludeSlug },
        OR: terms.flatMap((t) => [
          { name: { contains: t, mode: "insensitive" as const } },
          { shortName: { contains: t, mode: "insensitive" as const } },
          { slug: { contains: t } },
        ]),
      },
      select: { slug: true, name: true, shortName: true, solveDate: true },
      take: 40,
    });

    return rows
      .map((r) => {
        const hay = `${r.name} ${r.shortName} ${r.slug}`.toLowerCase();
        const hits = terms.filter((t) => hay.includes(t)).length;
        return { row: r, hits };
      })
      .sort((a, b) => b.hits - a.hits || a.row.name.length - b.row.name.length)
      .slice(0, 8)
      .map(({ row }) => ({
        slug: row.slug,
        name: row.name,
        nameHtml: texToHtml(row.name),
        solveDate: row.solveDate,
      }));
  } catch (error) {
    console.error("searchEntriesForRelation failed", error);
    return [];
  }
}

/// `sourceUrl` is the submission's primary link, when the form has one yet.
///
/// A shared PRIMARY source is not a hint, it is the answer: two entries whose
/// primary source is the same arXiv id are the same work whatever their titles
/// say, and titles are exactly what diverges when two people file the same
/// paper. So that match short-circuits the title search and is returned on its
/// own, because mixing it into loose word matches buries the row that matters.
///
/// Primary to primary, deliberately, and NOT against the entries' other links.
/// Sharing a secondary link is ordinary: eleven entries cite the
/// formal-conjectures repository, eight Kourovka entries come from one
/// multi-problem paper, five Erdős entries from another. Matching on any link
/// would have called all eleven duplicates of each other, which is how a
/// warning panel teaches people to ignore it.
export async function findSimilarEntries(
  query: string,
  sourceUrl?: string,
): Promise<SimilarEntry[]> {
  const sourceId = extractSourceId(sourceUrl ?? "");
  if (sourceId) {
    try {
      // Candidates first, cheaply: an id contains the distinctive part of the
      // URL, so a contains-match narrows to a handful of rows before the exact
      // comparison runs on them.
      const needle = sourceId.split(":").slice(1).join(":");
      const rows = await prisma.problem.findMany({
        where: {
          status: "published",
          sourceUrl: { contains: needle, mode: "insensitive" },
        },
        select: { slug: true, name: true, solveDate: true, sourceUrl: true },
        take: 20,
      });
      const hits = rows
        .filter((r) => extractSourceId(r.sourceUrl ?? "") === sourceId)
        .slice(0, MAX_RESULTS)
        .map((r) => ({
          slug: r.slug,
          name: r.name,
          nameHtml: texToHtml(r.name),
          solveDate: r.solveDate,
        }));
      if (hits.length > 0) return hits;
    } catch (error) {
      console.error("findSimilarEntries source lookup failed", error);
      // Fall through to the title search rather than losing the panel.
    }
  }

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
        nameHtml: texToHtml(row.name),
        solveDate: row.solveDate,
      }));
  } catch (error) {
    console.error("findSimilarEntries failed", error);
    // A failed duplicate check must never block a submission.
    return [];
  }
}
