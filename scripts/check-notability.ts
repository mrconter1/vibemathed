// Re-checks every published entry's `renownLangs` against Wikipedia and prints
// the disagreements. Read-only: it never writes, because the strict rule needs
// a human. An article has to be dedicated to THIS problem, and only a person
// can tell "Ehrhart's volume conjecture" (dedicated, counts) from "Sphere
// packing" or "Factorial" (concept articles, do not count).
//
// Run it when reviewing a submission, and after any batch import:
//   npx tsx scripts/check-notability.ts
//
// Why this exists: `renownLangs` defaults to 0 on new submissions, and the
// entry page renders 0 as the flat claim "No dedicated article". Nothing
// re-checked that default, so an entry added after the last sweep could assert
// something nobody had verified - which is exactly how the Ehrhart entry came
// to deny an article that had existed since 2016.
//
// Three Wikipedia gotchas are baked in, each of which produced a wrong answer
// during the 2026-08-02 sweep:
//   1. Titles are case-sensitive after the first character. Our entry names are
//      title-cased and Wikipedia's are sentence-cased, so "Ehrhart's Volume
//      Conjecture" is missing while "Ehrhart's volume conjecture" exists.
//   2. A "#" truncates the title at the fragment. Every "Erdős Problem #N"
//      collapses to "Erdős problem", which redirects to "Paul Erdős" and its
//      67 language versions. Titles containing "#" or "[" are skipped.
//   3. `langlinks` lists the OTHER language editions, not the one queried. The
//      count is langlinks + 1 whenever the page exists.
//
// Expect a short standing queue rather than silence. As of 2026-08-02 five
// entries disagree and all five are stored CORRECTLY - they are here because
// an exact-title probe cannot settle them:
//   bellman-lost-in-forest-golden-gnomon  article is "Bellman's lost in a
//   erdos-planar-unit-distance            forest problem" / "Unit distance
//                                         graph" - real, just not named like
//                                         our entry, so the probe misses it
//   graffiti-conjecture-6                 redirects to "Graffiti6", unrelated
//   hodge-bundle-simplicity               "Hodge bundle" is the concept
//                                         article, excluded by the strict rule
//   jacobian-conjecture                   stored 13 vs 16 today: the freeze
//                                         working as intended, not drift

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API = "https://en.wikipedia.org/w/api.php";
const UA = "vibemathed-notability-check/1.0 (https://vibemathed.com)";
/// Wikipedia asks for serial requests from unauthenticated clients; 50 titles
/// per query keeps the whole catalog to a handful of calls.
const BATCH = 50;
const PAUSE_MS = 2000;

interface Probe {
  missing: boolean;
  langs: number;
  /// Where a redirect actually landed, so a concept article is visible as one.
  resolved: string;
}

/// Wikipedia capitalises the first character itself; everything after it is
/// literal. We cannot know which later words are proper nouns, so we probe the
/// name as written AND fully sentence-cased and take whichever exists.
function sentenceCase(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}

function candidates(name: string, shortName: string | null): string[] {
  const out: string[] = [];
  for (const base of [name, shortName ?? ""]) {
    const t = base.trim();
    if (t.length < 6) continue;
    // See gotcha 2: these characters make the API answer a different question.
    if (t.includes("#") || t.includes("[") || t.includes("|")) continue;
    out.push(t);
    const sc = sentenceCase(t);
    if (sc !== t) out.push(sc);
  }
  return [...new Set(out)];
}

async function probe(titles: string[]): Promise<Map<string, Probe>> {
  const found = new Map<string, Probe>();
  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH);
    const url = `${API}?${new URLSearchParams({
      action: "query",
      titles: batch.join("|"),
      prop: "langlinks",
      lllimit: "500",
      redirects: "1",
      format: "json",
      formatversion: "2",
    })}`;

    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.error(`  batch ${i / BATCH + 1}: HTTP ${res.status}, skipped`);
      continue;
    }
    const data = (await res.json()) as {
      query?: {
        pages?: { title: string; missing?: boolean; invalid?: boolean; langlinks?: unknown[] }[];
        redirects?: { from: string; to: string }[];
        normalized?: { from: string; to: string }[];
      };
    };
    const q = data.query ?? {};
    for (const p of q.pages ?? []) {
      found.set(p.title, {
        // An invalid title is not evidence of absence, but it is not a hit.
        missing: Boolean(p.missing) || Boolean(p.invalid),
        langs: (p.langlinks?.length ?? 0) + 1,
        resolved: p.title,
      });
    }
    // Map what we asked for onto where it landed, keeping the real target.
    for (const r of [...(q.redirects ?? []), ...(q.normalized ?? [])]) {
      const target = found.get(r.to);
      if (target) found.set(r.from, target);
    }
    if (i + BATCH < titles.length) await new Promise((r) => setTimeout(r, PAUSE_MS));
  }
  return found;
}

async function main() {
  const rows = await prisma.problem.findMany({
    where: { status: "published" },
    orderBy: { slug: "asc" },
    select: { slug: true, name: true, shortName: true, renownLangs: true, renownNote: true },
  });

  const perEntry = new Map(rows.map((r) => [r.slug, candidates(r.name, r.shortName)]));
  const titles = [...new Set([...perEntry.values()].flat())].sort();
  console.log(`probing ${titles.length} candidate titles for ${rows.length} published entries`);

  const found = await probe(titles);

  const disagree: string[] = [];
  for (const r of rows) {
    let hit: Probe | null = null;
    for (const t of perEntry.get(r.slug) ?? []) {
      const p = found.get(t);
      if (p && !p.missing) {
        hit = p;
        break;
      }
    }
    const measured = hit ? hit.langs : 0;
    if (measured === r.renownLangs) continue;

    // A redirect to something not named like the entry is the classic concept
    // article, so the line shows the target and leaves the call to a human.
    disagree.push(
      `  ${r.slug}\n` +
        `    stored ${r.renownLangs}, Wikipedia says ${measured}` +
        (hit ? ` via "${hit.resolved}"` : " (no article under this name)") +
        (r.renownNote ? "\n    NOTE (deliberate?): " + r.renownNote.slice(0, 100) : ""),
    );
  }

  if (disagree.length === 0) {
    console.log("\nno disagreements - every stored count matches Wikipedia today");
  } else {
    console.log(`\n${disagree.length} to review by hand:\n`);
    console.log(disagree.join("\n"));
    console.log(
      "\nBefore changing anything: is the article dedicated to THIS problem, and" +
        "\ndid it exist BEFORE the solution? Coverage triggered by the result does" +
        "\nnot count - record that in renownNote and leave the number at 0.",
    );
  }

  await prisma.$disconnect();
}

main();
