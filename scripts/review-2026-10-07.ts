// 7 October 2026: three pending submissions. Decisions, edits and messages in
// review-2026-10-07.json. Sources were opened and checked on 7 October.
//
// 1. FOURTEEN-GON MINKOWSKI PLANE - published, Partial, Lean-checked, 8.
//    Exoo-Fisher-Ismailescu Problem 5.1 (arXiv 2108.12861, Section 5) asks
//    whether five colours are needed for every regular 2n-gon with n >= 4;
//    this settles n = 7 only, hence Partial. The headline theorem and the
//    norm construction were read; 165 Lean files grep-clean; the author's CI
//    run at e0f5e2a passed (self-hosted runner). RE-RUN HERE: every one of
//    the 13,755 edges has norm 1 (floating point), and our own encoding of
//    four-colourability is UNSAT under CaDiCaL (157 s). Not rebuilt.
//
// 2. BRAS-AMOROS GENUS MONOTONICITY - published, Candidate, Unreviewed, 28.
//    The weak conjecture n_{g+1} >= n_g for all g, as in Kaplan's survey
//    (arXiv 1707.02551, Conjecture 2). Named author with affiliation. Not
//    landmark: Zhai settled all large genera in 2013, leaving a finite range.
//    RE-RUN HERE: all five shipped checkers pass on a fresh clone (836 finite
//    rows and the analytic join at 836/837); our own semigroup count to genus
//    23 matches the known values and every certified slack is below the
//    true gap for g <= 22. The 2,000 lines of proof were not checked.
//
// 3. ZAK'S MODIFIED INTEGER ROUND-DOWN - published, downgraded from Resolved
//    to Candidate, Unreviewed, 14. Adapts the OpenAI release's MIRUP
//    counterexample to skiving stock by complementing items; not a
//    duplicate (the release never treats skiving). The transfer was checked
//    by hand, and a brute force on 60 random 10-item instances matched the
//    paper's exact optima. Inherits the release result's Candidate status.
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
const EXPECTED = 3;

interface Decision {
  slug: string;
  action: "approve" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DECISIONS = JSON.parse(readFileSync(join(__dirname, "review-2026-10-07.json"), "utf8")) as Decision[];

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
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: merged, sourceUrl: cur.sourceUrl });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 60)} -> merged check: ${v.length ? "FAILED" : "ok"}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

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
