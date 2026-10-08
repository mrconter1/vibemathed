// Re-sync with the OpenAI math release update of 7 October 2026 (commit
// fd4aeeb, the release's history.md). docs/reviewing.md: "corrected papers get
// the correction, withdrawn ones become Contested."
//
// Three inputs, merged per entry:
//   resync-withdrawals.json  the two entries whose source manuscript was
//                            withdrawn (Kuga-Satake, products of K3 surfaces):
//                            Retracted + Contested, the notice quoted in the
//                            claim issue; and a sentence on the two entries
//                            that only link the withdrawn eightfold paper.
//   resync-revisions.json    entries citing a revised manuscript: the new
//                            edition, the earlier edition kept as a link, and
//                            the prose where the revision changed a claim.
//   resync-lean.json         entries whose family gained a formal statement
//                            of the headline: Lean-checked.
//
// Every changed field writes an "updated" activity row. Links are added only
// when their URL is not already on the entry. Idempotent.
//
//   bash scripts/prod.sh scripts/openai-math/resync-2026-10-08.ts            # dry run
//   bash scripts/prod.sh scripts/openai-math/resync-2026-10-08.ts --apply

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { guardedPrisma } from "../lib/guarded-prisma";
import { checkStoredEntry } from "../../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../../src/lib/editable";
import { charLength, canonical } from "../../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const LABEL = new Map<string, string>(SPECS.map((s) => [s.key, s.label]));
const OPENING = "No independent mathematician has checked this yet.";
const SETTABLE = new Set([
  "sourceUrl",
  "sourceName",
  "verification",
  "verificationNote",
  "resultNote",
  "claimIssueNote",
  "resolution",
  "collectionVersion",
]);

type Link = { label: string; url: string; kind: string };
interface Action {
  slug: string;
  why: string;
  set?: Record<string, string>;
  links?: Link[];
  /// A sentence appended to the result note after any `set` of it.
  appendResult?: string;
}

function load(name: string): Action[] {
  const p = join(__dirname, name);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Action[]) : [];
}

// Later files win on a field they both set; withdrawals come last so the
// retraction is never overwritten by a revision of a companion.
const merged = new Map<string, Action & { why: string }>();
for (const a of [...load("resync-lean.json"), ...load("resync-revisions.json"), ...load("resync-withdrawals.json")]) {
  const m = merged.get(a.slug) ?? { slug: a.slug, why: "", set: {}, links: [] };
  m.why = [m.why, a.why].filter(Boolean).join("; ");
  Object.assign(m.set!, a.set ?? {});
  m.links!.push(...(a.links ?? []));
  if (a.appendResult) m.appendResult = [m.appendResult, a.appendResult].filter(Boolean).join(" ");
  merged.set(a.slug, m);
}

async function main() {
  let bad = 0;
  for (const a of merged.values()) {
    for (const k of Object.keys(a.set ?? {})) {
      if (!SETTABLE.has(k)) {
        console.log(`${a.slug}: field ${k} not settable here`);
        bad++;
      }
    }
    const t = [...Object.values(a.set ?? {}), a.appendResult ?? "", ...(a.links ?? []).map((l) => l.label)];
    if (t.some((s) => /—/.test(s))) {
      console.log(`${a.slug}: EM DASH`);
      bad++;
    }
    const vn = a.set?.verificationNote;
    if (vn && !vn.startsWith(OPENING)) {
      console.log(`${a.slug}: verification note lacks the opening sentence`);
      bad++;
    }
  }
  if (bad) throw new Error(`${bad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) throw new Error("no admin");

    // Pre-flight: build every plan and validate it before any write.
    const plans: { id: string; slug: string; data: Record<string, string>; changes: [string, string | null, string][]; links: Link[]; base: number }[] = [];
    for (const a of merged.values()) {
      const p = await prisma.problem.findUnique({ where: { slug: a.slug }, include: { links: { select: { url: true } } } });
      if (!p) throw new Error(`${a.slug} not found`);
      if (p.status !== "published") throw new Error(`${a.slug} is ${p.status}`);
      const row = p as unknown as Record<string, string | null>;
      const want: Record<string, string> = { ...(a.set ?? {}) };
      if (a.appendResult) {
        const base = want.resultNote ?? row.resultNote ?? "";
        if (!base.includes(a.appendResult)) want.resultNote = `${base}${base ? " " : ""}${a.appendResult}`;
      }
      const data: Record<string, string> = {};
      const changes: [string, string | null, string][] = [];
      for (const [k, v0] of Object.entries(want)) {
        const v = canonical(v0);
        if (row[k] === v) continue;
        data[k] = v;
        changes.push([k, row[k], v]);
      }
      const links = (a.links ?? []).filter((l, i, all) => !p.links.some((x) => x.url === l.url) && all.findIndex((y) => y.url === l.url) === i);
      // Validate against the links the entry will end up with, existing plus new,
      // so the link cap is checked here and not only by the guarded write.
      const v = checkStoredEntry({
        specs: SPECS,
        fields: data,
        links: [...p.links.map((l) => ({ label: "existing", url: l.url, kind: "other" })), ...links],
        sourceUrl: data.sourceUrl ?? p.sourceUrl,
      });
      for (const x of v) console.log(`  RULE ${a.slug}: ${x.field}: ${x.problem}`);
      if (v.length) bad++;
      console.log(`${a.slug}  (${a.why})`);
      for (const [k, o, n] of changes) {
        const show = (s: string | null) => (s === null ? "(empty)" : s.length > 110 ? `${s.slice(0, 110)}...` : s);
        console.log(`  ${k}: ${k.endsWith("Note") ? `${charLength(o ?? "")} -> ${charLength(n)} chars` : `${show(o)} -> ${show(n)}`}`);
      }
      for (const l of links) console.log(`  + link [${l.kind}] ${l.label}`);
      if (!changes.length && !links.length) console.log("  nothing to change");
      plans.push({ id: p.id, slug: a.slug, data, changes, links, base: p.links.length });
    }
    if (bad) throw new Error(`${bad} entr(ies) would be refused - nothing written`);
    console.log(`\n${plans.filter((p) => p.changes.length || p.links.length).length} entries to change`);
    if (!APPLY) {
      console.log("DRY RUN - pass --apply to write");
      return;
    }

    for (const p of plans) {
      if (!p.changes.length && !p.links.length) continue;
      await prisma.$transaction([
        prisma.problem.update({
          where: { id: p.id },
          data: {
            ...p.data,
            ...(p.links.length ? { links: { create: p.links.map((l, i) => ({ ...l, position: p.base + i })) } } : {}),
          } as never,
        }),
        prisma.problemActivity.createMany({
          data: p.changes.map(([k, o, n]) => ({
            problemId: p.id,
            userId: admin.id,
            userName: admin.pseudonym ?? null,
            type: "updated" as const,
            field: LABEL.get(k) ?? k,
            oldValue: o,
            newValue: n,
          })),
        }),
      ]);
      console.log(`updated ${p.slug}`);
    }
    console.log("\nAPPLIED. Entry pages, lists and stats lag up to an hour.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
