// Which stored values exceed the limits the forms enforce. 13 Aug 2026.
//
// The limits live in one place - `maxLength` on the field specs in
// src/lib/editable.ts - and this reads them from there rather than restating
// them, so the audit cannot drift from what the edit form actually rejects.
//
// Curator scripts write through Prisma directly, which is the only path that
// bypasses those specs, so anything this finds was almost certainly written by
// a script rather than by a person using the site.
//
// Reports, does not write. `--json` for the machine-readable form.

import { PrismaClient } from "@prisma/client";
import { charLength } from "../src/lib/char-length";
import { CURATOR_FIELDS, EDITABLE_FIELDS, MAX_LINKS, sameDocument } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const JSON_OUT = process.argv.includes("--json");

/// Fields with a length cap on the form. `links` and the choice/number kinds
/// have no text length to check.
const LIMITS = new Map<string, number>();
for (const spec of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (spec.maxLength) LIMITS.set(spec.key, spec.maxLength);
}
// Text columns no field spec covers, because they are not entry content: the
// submitter's private note to the reviewer and the curator's decision message.
const UNSPECCED = ["submitterNote", "reviewMessage"] as const;

interface Finding {
  slug: string;
  field: string;
  limit: number;
  length: number;
  over: number;
  sample: string;
}

async function main() {
  const rows = await prisma.problem.findMany({ include: { links: true } });
  const findings: Finding[] = [];
  const linkIssues: string[] = [];

  for (const p of rows) {
    const row = p as unknown as Record<string, unknown>;

    for (const [key, limit] of LIMITS) {
      const v = row[key];
      if (typeof v !== "string") continue;
      // charLength, matching the form and both server actions. With .length
      // this audit reported astral-heavy notes as over a limit they were
      // under, which is the same bug it exists to catch.
      const n = charLength(v);
      if (n <= limit) continue;
      findings.push({
        slug: p.slug,
        field: key,
        limit,
        length: n,
        over: n - limit,
        sample: v.slice(0, 60),
      });
    }

    // The link rules the form applies but a script never sees.
    if (p.links.length > MAX_LINKS) {
      linkIssues.push(`${p.slug}: ${p.links.length} links, max ${MAX_LINKS}`);
    }
    for (const l of p.links) {
      if (l.label.length > 120) {
        linkIssues.push(
          `${p.slug}: link label ${l.label.length} chars, max 120 - "${l.label.slice(0, 50)}..."`,
        );
      }
      if (p.sourceUrl && sameDocument(l.url, p.sourceUrl)) {
        linkIssues.push(`${p.slug}: link repeats the primary source - ${l.url}`);
      }
    }
    const dupes = p.links.filter((a, i) =>
      p.links.some((b, j) => j < i && sameDocument(a.url, b.url)),
    );
    for (const d of dupes) linkIssues.push(`${p.slug}: duplicate link - ${d.url}`);
  }

  // The fields no spec covers, measured against the nearest comparable cap so
  // the report says something rather than nothing.
  const unspecced: Finding[] = [];
  for (const p of rows) {
    const row = p as unknown as Record<string, unknown>;
    for (const key of UNSPECCED) {
      const v = row[key];
      if (typeof v !== "string") continue;
      const limit = key === "reviewMessage" ? MESSAGE_MAX : 1000;
      if (v.length <= limit) continue;
      unspecced.push({
        slug: p.slug,
        field: key,
        limit,
        length: v.length,
        over: v.length - limit,
        sample: v.slice(0, 60),
      });
    }
  }

  if (JSON_OUT) {
    console.log(JSON.stringify({ findings, unspecced, linkIssues }, null, 2));
    return;
  }

  const byField = new Map<string, Finding[]>();
  for (const f of findings) byField.set(f.field, [...(byField.get(f.field) ?? []), f]);

  console.log(`${rows.length} entries checked against ${LIMITS.size} capped fields.\n`);
  console.log("=== OVER THE FORM LIMIT\n");
  if (!findings.length) console.log("  none\n");
  for (const [field, list] of [...byField].sort((a, b) => b[1].length - a[1].length)) {
    list.sort((a, b) => b.over - a.over);
    console.log(`${field} (limit ${list[0].limit}) - ${list.length} entries over`);
    for (const f of list) {
      console.log(`   ${String(f.length).padStart(5)}  +${String(f.over).padStart(5)}  ${f.slug}`);
    }
    console.log();
  }

  console.log("=== LINK RULES\n");
  if (!linkIssues.length) console.log("  none\n");
  for (const s of linkIssues) console.log(`  ${s}`);
  console.log();

  console.log("=== NON-ENTRY TEXT (submitter note, decision message)\n");
  const byField2 = new Map<string, Finding[]>();
  for (const f of unspecced) byField2.set(f.field, [...(byField2.get(f.field) ?? []), f]);
  for (const [field, list] of byField2) {
    list.sort((a, b) => b.over - a.over);
    const longest = list[0];
    console.log(`${field} (compared to ${longest.limit}) - ${list.length} over, worst ${longest.length}`);
    for (const f of list.slice(0, 10)) {
      console.log(`   ${String(f.length).padStart(5)}  +${String(f.over).padStart(5)}  ${f.slug}`);
    }
    if (list.length > 10) console.log(`   ... and ${list.length - 10} more`);
    console.log();
  }

  const entries = new Set(findings.map((f) => f.slug));
  console.log(
    `TOTAL: ${findings.length} over-limit values across ${entries.size} entries, ` +
      `plus ${linkIssues.length} link-rule breaches.`,
  );
}

main().finally(() => prisma.$disconnect());
