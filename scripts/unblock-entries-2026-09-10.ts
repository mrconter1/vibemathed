// Frees the published entries that cannot be saved through the edit form.
//
// The form validates every field it posts, including ones the editor never
// touched, so a single bad stored value made an entry permanently
// uneditable: you opened it to fix a typo and got an error about a link you
// had not opened. Twelve entries were in that state.
//
// Two things fix it and both are needed. The code fix, in
// src/app/actions/update-problem.ts, skips untouched fields before
// validating them, so stale data can no longer block an unrelated edit. This
// script fixes the data, so the offending values stop existing at all.
//
// Every violation here is a redundant link - one that repeats the entry's own
// primary source, or another link on the same entry. Deleting it removes no
// information: the document is still cited, once, where it belongs. That is
// why this is safe to do in bulk, and it is the only class of violation the
// catalog turned out to have; lengths, choices, URLs, dates and required
// fields all came back clean across 706 published entries.
//
// `sameDocument` is what makes these invisible by eye: it normalises tracking
// parameters and fragments, so ".../navierstokes.pdf?utm_source=chatgpt.com"
// and ".../navierstokes.pdf" are one document. Nine of the eleven look like
// distinct URLs in the admin UI.
//
// The check itself comes from src/lib/field-validation.ts - the same module
// the form uses - rather than being reimplemented here. That is the point of
// the exercise: a script that writes entry data runs the form's rules first.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { checkStoredEntry } from "../src/lib/field-validation";
import {
  EDITABLE_FIELDS,
  CURATOR_FIELDS,
  sameDocument,
} from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

async function connectWithRetry(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

interface Link {
  id: string;
  label: string;
  url: string;
  position: number;
}

/// What to do with one entry's links so the set passes.
///
/// Naively keeping the first of each duplicate throws away information. Both
/// real cases proved it: on prime-gaps-at-most-186 the LATER copy carried the
/// better label ("Challenge.lean, the statements the comparator checks"
/// against a bare "Challenge.lean"), and on the Navier-Stokes entry the later
/// copy had the cleaner URL - the earlier one still had a
/// "?utm_source=chatgpt.com" tracking parameter on it.
///
/// So: among links pointing at one document, keep the shortest URL (the
/// canonical form, since sameDocument has already normalised fragments and
/// tracking parameters away) and the longest label (the most descriptive).
/// Links that merely repeat the entry's primary source are dropped outright -
/// the document is still cited, as the source.
function planLinks(
  links: Link[],
  sourceUrl: string | null,
): { drop: Link[]; relabel: { id: string; label: string; url: string }[] } {
  const drop: Link[] = [];
  const relabel: { id: string; label: string; url: string }[] = [];

  const rest = links.filter((l) => {
    if (sourceUrl && sameDocument(l.url, sourceUrl)) {
      drop.push(l);
      return false;
    }
    return true;
  });

  const groups: Link[][] = [];
  for (const l of rest) {
    const g = groups.find((grp) => sameDocument(grp[0].url, l.url));
    if (g) g.push(l);
    else groups.push([l]);
  }

  for (const g of groups) {
    if (g.length === 1) continue;
    // Keep the earliest row so position order is preserved, but give it the
    // best label and URL the group had.
    const keep = g[0];
    const bestLabel = g.reduce(
      (a, b) => (b.label.length > a.length ? b.label : a),
      keep.label,
    );
    const bestUrl = g.reduce(
      (a, b) => (b.url.length < a.length ? b.url : a),
      keep.url,
    );
    if (bestLabel !== keep.label || bestUrl !== keep.url)
      relabel.push({ id: keep.id, label: bestLabel, url: bestUrl });
    for (const l of g.slice(1)) drop.push(l);
  }
  return { drop, relabel };
}

async function main() {
  const db = await connectWithRetry();
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const rows = await prisma.$queryRawUnsafe<
    {
      slug: string;
      sourceUrl: string | null;
      id: string;
      label: string;
      url: string;
      position: number;
    }[]
  >(
    `SELECT p.slug, p."sourceUrl", l.id, l.label, l.url, l.position
       FROM "Problem" p JOIN "ProblemLink" l ON l."problemId" = p.id
      WHERE p.status = 'published'
      ORDER BY p.slug, l.position`,
  );

  const byEntry = new Map<
    string,
    { sourceUrl: string | null; links: Link[] }
  >();
  for (const r of rows) {
    const e = byEntry.get(r.slug) ?? { sourceUrl: r.sourceUrl, links: [] };
    e.links.push({
      id: r.id,
      label: r.label,
      url: r.url,
      position: r.position,
    });
    byEntry.set(r.slug, e);
  }

  const plan: {
    slug: string;
    drop: Link[];
    relabel: { id: string; label: string; url: string }[];
  }[] = [];
  for (const [slug, e] of byEntry) {
    const before = checkStoredEntry({
      specs: SPECS,
      links: e.links,
      sourceUrl: e.sourceUrl,
    });
    if (before.length === 0) continue;

    const { drop, relabel } = planLinks(e.links, e.sourceUrl);
    const after = checkStoredEntry({
      specs: SPECS,
      links: e.links.filter((l) => !drop.some((d) => d.id === l.id)),
      sourceUrl: e.sourceUrl,
    });

    console.log(`${slug}`);
    for (const v of before) console.log(`    was: ${v.problem}`);
    for (const d of drop)
      console.log(`    drop link: "${d.label.slice(0, 58)}"`);
    for (const r of relabel)
      console.log(`    keep, improved: "${r.label.slice(0, 58)}"
        ${r.url}`);
    if (after.length) {
      // Deleting redundant links did not make the entry valid, so something
      // else is wrong and a blind delete would not fix it. Refuse rather
      // than half-fix.
      for (const v of after) console.log(`    STILL BAD: ${v.problem}`);
      throw new Error(`${slug} is not fixed by dropping redundant links`);
    }
    plan.push({ slug, drop, relabel });
  }

  console.log(
    `\nentries blocked: ${plan.length}   links to delete: ${plan.reduce((n, p) => n + p.drop.length, 0)}`,
  );

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const p of plan) {
    for (const r of p.relabel) {
      await prisma.$executeRawUnsafe(
        `UPDATE "ProblemLink" SET label = $1, url = $2 WHERE id = $3`,
        r.label,
        r.url,
        r.id,
      );
    }
    await prisma.$executeRawUnsafe(
      `DELETE FROM "ProblemLink" WHERE id = ANY($1::uuid[])`,
      p.drop.map((d) => d.id),
    );
    console.log(
      `fixed: ${p.slug} (-${p.drop.length}${p.relabel.length ? `, ${p.relabel.length} improved` : ""})`,
    );
  }

  // Prove it, rather than assume it: re-read and re-check every entry.
  const after = await prisma.$queryRawUnsafe<
    { slug: string; sourceUrl: string | null; label: string; url: string }[]
  >(
    `SELECT p.slug, p."sourceUrl", l.label, l.url
       FROM "Problem" p JOIN "ProblemLink" l ON l."problemId" = p.id
      WHERE p.status = 'published' ORDER BY p.slug, l.position`,
  );
  const check = new Map<string, { sourceUrl: string | null; links: Link[] }>();
  for (const r of after) {
    const e = check.get(r.slug) ?? { sourceUrl: r.sourceUrl, links: [] };
    e.links.push({ id: "", label: r.label, url: r.url, position: 0 });
    check.set(r.slug, e);
  }
  let bad = 0;
  for (const [, e] of check)
    bad += checkStoredEntry({
      specs: SPECS,
      links: e.links,
      sourceUrl: e.sourceUrl,
    }).length;
  console.log(`\nAPPLIED. Remaining violations across the catalog: ${bad}`);
}

main().finally(() => prisma.$disconnect());
