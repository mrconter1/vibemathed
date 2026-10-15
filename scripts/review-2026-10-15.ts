// 15 October 2026: twelve pending submissions. Decisions, edits, messages and
// one note on an existing entry in review-2026-10-15.json; each source was
// opened and checked on 15 October, and each verification note says what ran.
//
// Published (8): Erdos 1049 Lambert series (Partial, downgraded to
// Lean-checked); strict Dirichlet and Neumann Polya inequalities on simply
// connected planar domains (Partial, Lean-checked, Palomar records); the
// 3-sunflower-free four-set bound (Partial) and Question 3.2 on k-adic
// complexity (Candidate), both aiXiv; Dow-Tkachuk Question 4.8 (Candidate,
// Lean-checked); 3x3 matrix multiplication rank at least 21 over every field
// (Partial, Lean-checked); codimension-one holomorphic Anosov diffeomorphisms
// (Partial, downgraded to Lean-checked).
//
// Declined (4): modularity over CM fields (landmark claim, nobody accountable,
// no formal proof); two-bin RANDOM-VERTEX classification (no question posed
// before the work); Erdos 687 conditional bound (already in the OpenAI
// Jacobsthal paper, Theorem 1.2; the connection is noted on that entry);
// arctangents of rationals (no AI contribution disclosed in the source).
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const EXPECTED = 12;

interface Decision {
  slug: string;
  action: "approve" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DATA = JSON.parse(readFileSync(join(__dirname, "review-2026-10-15.json"), "utf8")) as {
  decisions: Decision[];
  amends: { slug: string; appendResult: string }[];
};
const DECISIONS = DATA.decisions;

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const d of DECISIONS) {
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 60)}  (${d.reason})`);
    const n = charLength(canonical(d.message));
    console.log(`  message          : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v !== "string") continue;
      const c = charLength(canonical(v));
      const lim = limit.get(k);
      const over = lim !== undefined && c > lim;
      if (lim) console.log(`  ${k.padEnd(17)}: ${c}/${lim}${over ? "  OVER" : ""}`);
      if (over) bad++;
    }
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: d.links ?? [] });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    const outgoing = [d.message, ...Object.values(d.edits ?? {}).map(String), ...(d.links ?? []).map((l) => l.label)];
    if (outgoing.some((t) => /—/.test(t))) {
      console.log("  EM DASH");
      bad++;
    }
  }
  if (DECISIONS.length !== EXPECTED) {
    console.log(`COUNT MISMATCH: expected ${EXPECTED}`);
    bad++;
  }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `\n${localBad} local violation(s)` : "\nlocal checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    // Pre-flight: every lookup happens before any write.
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { status: true, name: true, sourceUrl: true, links: { select: { label: true, url: true, kind: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: (d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 60)} -> merged check: ${v.length ? "FAILED" : "ok"}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
    }

    const amendPlan: { id: string; slug: string; old: string | null; next: string }[] = [];
    for (const a of DATA.amends) {
      const p = await prisma.problem.findUnique({ where: { slug: a.slug }, select: { id: true, status: true, resultNote: true } });
      if (!p || p.status !== "published") throw new Error(`amend target ${a.slug} missing or not published`);
      const old = p.resultNote ?? "";
      if (old.includes(a.appendResult)) {
        console.log(`AMEND    ${a.slug}: already noted`);
        continue;
      }
      const next = canonical(`${old}${old ? " " : ""}${a.appendResult}`);
      const n = charLength(next);
      if (n > 1000) throw new Error(`${a.slug} resultNote ${n}/1000`);
      console.log(`AMEND    ${a.slug}: resultNote ${charLength(old)} -> ${n}/1000`);
      amendPlan.push({ id: p.id, slug: a.slug, old: p.resultNote, next });
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    for (const a of amendPlan) {
      await prisma.$transaction([
        prisma.problem.update({ where: { id: a.id }, data: { resultNote: a.next } }),
        prisma.problemActivity.create({
          data: {
            problemId: a.id,
            userId: curator.id,
            userName: curator.pseudonym,
            type: "updated",
            field: "What was actually shown",
            oldValue: a.old,
            newValue: a.next,
          },
        }),
      ]);
      console.log(`amended: ${a.slug}`);
    }

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true, _count: { select: { links: true } } },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      const n = cur._count.links;
      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } } : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`${d.action}: ${d.slug}`);
      if (cur.submittedById) {
        await prisma.directMessage.create({
          data: {
            userId: cur.submittedById,
            senderId: curator.id,
            senderName: curator.pseudonym,
            kind: "decision",
            reason: d.reason,
            body: d.message.slice(0, MESSAGE_MAX),
            problemId: cur.id,
          },
        });
      }
      await prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      });
      if (d.reviewNote) {
        await prisma.reviewNote.create({
          data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: d.reviewNote },
        });
      }
    }

    console.log("\nAPPLIED. New entries render on first request; lists and stats lag up to an hour.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
