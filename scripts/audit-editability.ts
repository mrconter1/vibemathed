// Can every published entry be saved through the edit form?
//
// Answered by running the form's OWN parser, not a reimplementation of its
// rules. Each stored value is encoded exactly as the edit form encodes it -
// links and relations as the JSON the form posts, lists comma-joined - and
// handed to `parseField`, the function src/app/actions/update-problem.ts
// calls on every field it receives. If parseField refuses a stored value,
// the form would refuse it too.
//
// Two grades of finding, because they mean different things:
//
//   HARD    parseField rejects the stored value. Before the skip-untouched
//           fix in update-problem.ts, one of these made the entry
//           unsaveable outright, since the form posts every field. After
//           it, only an edit to that specific field fails - but the value
//           is still one the form would never have accepted, and the
//           guarded client refuses to write more of them.
//
//   LATENT  A link points at the same document as the primary source. The
//           action checks this only when links or the source are edited, so
//           it never blocked an unrelated save - but a new submission with
//           the same links is rejected, and editing this entry's links means
//           fixing it first.
//
// Read-only. Exits non-zero when anything HARD remains, so it can gate a
// release or run after a bulk script as proof rather than assumption.

import { guardedPrisma } from "./lib/guarded-prisma";
import { parseField } from "../src/lib/field-validation";
import {
  CURATOR_FIELDS,
  EDITABLE_FIELDS,
  encodeLinks,
  sameDocument,
} from "../src/lib/editable";
import { encodeRelations } from "../src/lib/relation-kinds";
import type { LinkRef } from "../src/lib/problems";

const prisma = guardedPrisma();
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const SCALAR_KEYS = [...new Set(SPECS.map((s) => s.key))].filter(
  (k) => k !== "links" && k !== "relations",
);

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

/// The string the edit form would post for a stored value.
function asFormString(kind: string, value: unknown): string {
  if (kind === "links") return encodeLinks((value as LinkRef[]) ?? []);
  if (kind === "relations")
    return encodeRelations(
      (value as { to: string; kind: string; note: string }[]) ?? [],
    );
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

async function main() {
  const db = await connectWithRetry();
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const cols = SCALAR_KEYS.map((c) => `"${c}"`).join(", ");
  const entries = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT id, slug, ${cols} FROM "Problem" WHERE status = 'published' ORDER BY slug`,
  );
  const linkRows = await prisma.$queryRawUnsafe<
    { problemId: string; label: string; url: string; kind: string | null }[]
  >(
    `SELECT "problemId", label, url, kind FROM "ProblemLink" ORDER BY "problemId", position`,
  );
  const relRows = await prisma.$queryRawUnsafe<
    { fromId: string; to: string; kind: string; note: string }[]
  >(
    `SELECT r."fromId", t.slug AS "to", r.kind, r.note
       FROM "ProblemRelation" r JOIN "Problem" t ON t.id = r."toId"
      ORDER BY r."fromId", r.position`,
  );
  const links = new Map<string, LinkRef[]>();
  for (const l of linkRows) {
    const a = links.get(l.problemId) ?? [];
    a.push({ label: l.label, url: l.url, kind: l.kind ?? undefined });
    links.set(l.problemId, a);
  }
  const rels = new Map<string, { to: string; kind: string; note: string }[]>();
  for (const r of relRows) {
    const a = rels.get(r.fromId) ?? [];
    a.push({ to: r.to, kind: r.kind, note: r.note });
    rels.set(r.fromId, a);
  }

  const hard: { slug: string; field: string; error: string }[] = [];
  const latent: { slug: string; label: string }[] = [];

  for (const e of entries) {
    const id = e.id as string;
    const slug = e.slug as string;
    const entryLinks = links.get(id) ?? [];
    for (const spec of SPECS) {
      const stored =
        spec.kind === "links"
          ? entryLinks
          : spec.kind === "relations"
            ? (rels.get(id) ?? [])
            : e[spec.key];
      const raw = asFormString(spec.kind, stored);
      // The form never posts an empty optional field as an error, and a
      // required field that is empty is a real finding.
      const r = parseField(spec, raw, slug);
      if (!r.ok) hard.push({ slug, field: spec.key, error: r.error });
    }
    const primary = e.sourceUrl as string | null;
    if (primary)
      for (const l of entryLinks)
        if (sameDocument(l.url, primary)) latent.push({ slug, label: l.label });
  }

  const hardEntries = new Set(hard.map((h) => h.slug));
  const latentEntries = new Set(latent.map((l) => l.slug));

  console.log(`published entries checked: ${entries.length}`);
  console.log(
    `HARD   - a stored value the form's parser rejects: ${hard.length} in ${hardEntries.size} entries`,
  );
  console.log(
    `LATENT - a link repeating the primary source:      ${latent.length} in ${latentEntries.size} entries`,
  );

  if (hard.length) {
    const byField = new Map<string, number>();
    for (const h of hard) byField.set(h.field, (byField.get(h.field) ?? 0) + 1);
    console.log("\nHARD by field:");
    for (const [f, n] of [...byField].sort((a, b) => b[1] - a[1]))
      console.log(`  ${f.padEnd(20)} ${n}`);
    console.log("\nHARD examples:");
    for (const h of hard.slice(0, 15))
      console.log(`  ${h.slug.slice(0, 50).padEnd(52)} ${h.field}: ${h.error}`);
  }
  if (latent.length) {
    console.log("\nLATENT:");
    for (const l of latent)
      console.log(
        `  ${l.slug.slice(0, 60).padEnd(62)} "${l.label.slice(0, 40)}"`,
      );
  }
  if (!hard.length && !latent.length)
    console.log(
      "\nEvery published entry passes the form's own parser on every field.",
    );

  process.exitCode = hard.length ? 1 : 0;
}

main().finally(() => prisma.$disconnect());
