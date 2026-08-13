// The database caps and the form caps must be the same number.
//
// Every text limit is declared twice on purpose: once as `maxLength` on a
// field spec in src/lib/editable.ts, which is what the edit form and the
// server action enforce, and once as `@db.String(n)` in prisma/schema.prisma,
// which is what stops a curator script writing past it through Prisma. The
// application limit is the one users see; the column limit is the one nobody
// can route around.
//
// Two declarations can drift, and a drift is silent: raising the form cap
// alone gets a runtime error from CockroachDB on the next long value, and
// raising the column cap alone does nothing at all. So this compares them and
// exits non-zero on any mismatch. Run it after changing either.
//
// Not covered here, deliberately: columns with no form spec (slug, the closed
// vocabularies like `verification`, the URL columns). Those are validated by
// value rather than by length.

import { readFileSync } from "node:fs";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const SCHEMA = "prisma/schema.prisma";

/// Caps that live outside the field specs: the submitter's private note to the
/// reviewer, the curator's decision message, and the per-link label the link
/// parser enforces by hand.
const EXTRA: [string, string, number][] = [
  ["Problem", "submitterNote", 1000],
  ["Problem", "reviewMessage", MESSAGE_MAX],
  ["ProblemLink", "label", 120],
];

/// Column name -> declared @db.String(n), per model.
function readColumns(src: string): Map<string, Map<string, number | null>> {
  const out = new Map<string, Map<string, number | null>>();
  const models = src.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm);
  for (const m of models) {
    const cols = new Map<string, number | null>();
    for (const line of m[2].split("\n")) {
      const f = line.match(/^\s{2}(\w+)\s+(String\??)(\s|$)/);
      if (!f) continue;
      const cap = line.match(/@db\.String\((\d+)\)/);
      cols.set(f[1], cap ? Number(cap[1]) : null);
    }
    out.set(m[1], cols);
  }
  return out;
}

function main() {
  const models = readColumns(readFileSync(SCHEMA, "utf8"));
  const problem = models.get("Problem");
  if (!problem) throw new Error("no Problem model in the schema");

  const want: [string, string, number][] = [
    ...[...EDITABLE_FIELDS, ...CURATOR_FIELDS]
      .filter((s) => s.maxLength)
      .map((s) => ["Problem", s.key, s.maxLength!] as [string, string, number]),
    ...EXTRA,
  ];

  const problems: string[] = [];
  for (const [model, key, limit] of want) {
    const cols = models.get(model);
    if (!cols) {
      problems.push(`${model}: no such model`);
      continue;
    }
    if (!cols.has(key)) {
      // `links` is a relation, not a text column - it has no length to cap.
      if (key === "links") continue;
      problems.push(`${model}.${key}: capped at ${limit} in the specs, no such String column`);
      continue;
    }
    const declared = cols.get(key)!;
    if (declared === null) {
      problems.push(`${model}.${key}: spec says ${limit}, schema has no @db.String()`);
    } else if (declared !== limit) {
      problems.push(`${model}.${key}: spec says ${limit}, schema says ${declared}`);
    }
  }

  const capped = want.filter(([, k]) => k !== "links").length;
  if (problems.length) {
    console.error(`field limits DISAGREE (${problems.length} of ${capped}):\n`);
    for (const p of problems) console.error(`  ${p}`);
    console.error("\nChange both, or neither. See the note at the top of this file.");
    process.exit(1);
  }
  console.log(`field limits agree: ${capped} columns capped identically in the specs and the schema`);
}

main();
