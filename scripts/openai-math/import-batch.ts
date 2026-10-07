// Import one reviewed batch of the openai/math release.
//
//   bash scripts/prod.sh scripts/openai-math/import-batch.ts 1            # dry run
//   bash scripts/prod.sh scripts/openai-math/import-batch.ts 1 --apply
//   npx tsx scripts/openai-math/import-batch.ts 1 --lint                    # no database
//
// Reads scripts/openai-math/batch-<N>.json, which is written by hand-review of
// the triage drafts (never straight from an agent): one object per entry plus
// the catalog actions the batch implies. The reasoning for each decision is in
// the batch file's "note" fields and in the PR description, as the review
// scripts keep theirs in their headers.
//
// What it writes, all as the curator:
//   * each new entry, published, with collection = openai-math-2026-10 and
//     collectionVersion = the pinned commit, its links, and a "created"
//     activity row;
//   * for "supersedes": the sentence appended to the OLD entry's result note
//     (an ordinary "updated" activity row), and a link both ways;
//   * for "same-result": no new entry, only the link added to the existing one.
// Conflicts are never written; the script refuses a batch that still has one.
//
// Idempotent: an entry whose slug exists is skipped, an appended sentence that
// is already present is not appended again, a link whose URL is already on the
// entry is not added again.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { guardedPrisma } from "../lib/guarded-prisma";
import { checkStoredEntry } from "../../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS, MAX_LINKS } from "../../src/lib/editable";
import { charLength, canonical } from "../../src/lib/char-length";
import { COLLECTION_KEYS } from "../../src/lib/collections";

const args = process.argv.slice(2);
const N = args.find((a) => /^\d+[a-z]?$/.test(a));
const APPLY = args.includes("--apply");
const LINT = args.includes("--lint");
if (!N) throw new Error("usage: import-batch.ts <batch, e.g. 2 or 1b> [--apply|--lint]");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const OPENING = "No independent mathematician has checked this yet.";

interface Link { label: string; url: string; kind: string }
interface Entry {
  slug: string;
  family: string;
  fields: Record<string, unknown>;
  links: Link[];
}
interface CatalogAction {
  slug: string;
  relation: "same-result" | "supersedes" | "conflict";
  /// For supersedes: appended to the existing entry's resultNote.
  append?: string;
  /// The new entry it concerns (supersedes) or the link to add (same-result).
  newSlug?: string;
  link?: Link;
}
interface Batch {
  batch: number | string;
  collection: string;
  collectionVersion: string;
  entries: Entry[];
  catalog: CatalogAction[];
}

const batch: Batch = JSON.parse(readFileSync(join(__dirname, `batch-${N}.json`), "utf8"));

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  if (!COLLECTION_KEYS.includes(batch.collection)) {
    console.log(`unknown collection ${batch.collection}`);
    bad++;
  }
  const slugs = new Set<string>();
  for (const e of batch.entries) {
    const f = e.fields;
    if (slugs.has(e.slug)) {
      console.log(`${e.slug}: duplicate slug in batch`);
      bad++;
    }
    slugs.add(e.slug);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug) || e.slug.length > 80) {
      console.log(`${e.slug}: bad slug`);
      bad++;
    }
    for (const [k, v] of Object.entries(f)) {
      if (typeof v !== "string") continue;
      const lim = limit.get(k);
      if (lim && charLength(canonical(v)) > lim) {
        console.log(`${e.slug}.${k}: ${charLength(canonical(v))}/${lim} OVER`);
        bad++;
      }
      if (/\u2014/.test(v)) {
        console.log(`${e.slug}.${k}: em dash`);
        bad++;
      }
    }
    if (typeof f.verificationNote !== "string" || !f.verificationNote.startsWith(OPENING)) {
      console.log(`${e.slug}: verificationNote must open with "${OPENING}"`);
      bad++;
    }
    if (f.resolution === "resolved") {
      console.log(`${e.slug}: resolution resolved is not allowed for this release`);
      bad++;
    }
    if (f.verification === "contested" && typeof f.claimIssueNote !== "string") {
      console.log(`${e.slug}: a contested entry must carry a claimIssueNote saying what is disputed`);
      bad++;
    }
    if (!["lean-checked", "unreviewed", "contested"].includes(String(f.verification))) {
      console.log(`${e.slug}: verification ${f.verification} not allowed at import`);
      bad++;
    }
    if (typeof f.significance !== "number" || typeof f.significanceNote !== "string") {
      console.log(`${e.slug}: significance and its note are required`);
      bad++;
    }
    if (e.links.length > MAX_LINKS) {
      console.log(`${e.slug}: ${e.links.length} links > ${MAX_LINKS}`);
      bad++;
    }
    for (const l of e.links) {
      if (l.label.length > 120) {
        console.log(`${e.slug}: link label over 120: ${l.label}`);
        bad++;
      }
    }
    const v = checkStoredEntry({ specs: SPECS, fields: f, links: e.links, sourceUrl: String(f.sourceUrl) });
    for (const x of v) console.log(`${e.slug}: RULE ${x.field}: ${x.problem}`);
    bad += v.length;
  }
  for (const c of batch.catalog) {
    if (c.relation === "conflict") {
      console.log(`CONFLICT with ${c.slug} still in the batch - resolve before importing`);
      bad++;
    }
    if (c.relation === "supersedes" && (!c.append || !c.newSlug)) {
      console.log(`supersedes ${c.slug}: needs append and newSlug`);
      bad++;
    }
    if (c.append && /\u2014/.test(c.append)) {
      console.log(`supersedes ${c.slug}: em dash`);
      bad++;
    }
    if (c.relation === "same-result" && !c.link) {
      console.log(`same-result ${c.slug}: needs link`);
      bad++;
    }
  }
  console.log(`batch ${batch.batch}: ${batch.entries.length} entries, ${batch.catalog.length} catalog actions`);
  return bad;
}

async function main() {
  const bad = lint();
  if (LINT) {
    console.log(bad ? `\n${bad} local violation(s)` : "\nlocal checks ok");
    process.exitCode = bad ? 1 : 0;
    return;
  }
  if (bad) throw new Error(`${bad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) throw new Error("no admin");

    // Pre-flight: every lookup before any write.
    const exists = new Set(
      (await prisma.problem.findMany({ where: { slug: { in: batch.entries.map((e) => e.slug) } }, select: { slug: true } })).map((r) => r.slug),
    );
    const targets = new Map<string, { id: string; resultNote: string | null; links: { url: string }[]; status: string }>();
    for (const c of batch.catalog) {
      const p = await prisma.problem.findUnique({
        where: { slug: c.slug },
        select: { id: true, resultNote: true, status: true, links: { select: { url: true } } },
      });
      if (!p) throw new Error(`catalog action on missing entry ${c.slug}`);
      if (p.status !== "published") throw new Error(`${c.slug} is ${p.status}`);
      targets.set(c.slug, p);
    }
    for (const e of batch.entries) {
      console.log(`${exists.has(e.slug) ? "SKIP  " : "CREATE"} ${e.slug}  [${e.fields.resolution}, ${e.fields.verification}, sig ${e.fields.significance}]  ${e.links.length} links`);
    }
    for (const c of batch.catalog) {
      const t = targets.get(c.slug)!;
      if (c.relation === "supersedes") {
        const already = (t.resultNote ?? "").includes(c.append!);
        const next = `${t.resultNote ?? ""}${t.resultNote ? " " : ""}${c.append}`;
        const lim = SPECS.find((s) => s.key === "resultNote")?.maxLength ?? 1000;
        console.log(`SUPERSEDE ${c.slug} by ${c.newSlug}: ${already ? "note already present" : `resultNote ${charLength(canonical(t.resultNote ?? ""))} -> ${charLength(canonical(next))}/${lim}`}`);
        if (!already && charLength(canonical(next)) > lim) throw new Error(`${c.slug}: appended resultNote over ${lim}`);
      } else {
        const has = t.links.some((l) => l.url === c.link!.url);
        console.log(`SAME-RESULT ${c.slug}: ${has ? "link already present" : `add link ${c.link!.url}`}`);
      }
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }

    for (const e of batch.entries) {
      if (exists.has(e.slug)) continue;
      await prisma.$transaction([
        prisma.problem.create({
          data: {
            slug: e.slug,
            ...(e.fields as object),
            collection: batch.collection,
            collectionVersion: batch.collectionVersion,
            status: "published",
            links: { create: e.links.map((l, position) => ({ ...l, position })) },
          } as never,
        }),
        prisma.problemActivity.create({
          data: {
            problem: { connect: { slug: e.slug } },
            user: { connect: { id: admin.id } },
            userName: admin.pseudonym ?? null,
            type: "created",
          },
        }),
      ]);
      console.log(`created ${e.slug}`);
    }

    for (const c of batch.catalog) {
      const t = targets.get(c.slug)!;
      if (c.relation === "supersedes") {
        if ((t.resultNote ?? "").includes(c.append!)) continue;
        const next = `${t.resultNote ?? ""}${t.resultNote ? " " : ""}${c.append}`;
        const link = { label: "Stronger result in the OpenAI math release", url: `https://vibemathed.com/problem/${c.newSlug}`, kind: "other" };
        await prisma.$transaction([
          prisma.problem.update({
            where: { id: t.id },
            data: {
              resultNote: next,
              ...(t.links.some((l) => l.url === link.url) ? {} : { links: { create: [{ ...link, position: t.links.length }] } }),
            } as never,
          }),
          prisma.problemActivity.create({
            data: {
              problemId: t.id,
              userId: admin.id,
              userName: admin.pseudonym ?? null,
              type: "updated",
              field: "What was actually shown",
              oldValue: t.resultNote,
              newValue: next,
            },
          }),
        ]);
        console.log(`superseded note on ${c.slug}`);
      } else if (!t.links.some((l) => l.url === c.link!.url)) {
        await prisma.problem.update({
          where: { id: t.id },
          data: { links: { create: [{ ...c.link!, position: t.links.length }] } } as never,
        });
        console.log(`linked ${c.slug}`);
      }
    }
    const n = await prisma.problem.count({ where: { collection: batch.collection } });
    console.log(`\nAPPLIED. ${n} entries now carry ${batch.collection}. Lists and stats lag up to an hour.`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
