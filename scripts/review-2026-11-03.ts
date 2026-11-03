// 3 November 2026: eighteen pending submissions. Decisions, edits and
// messages in review-2026-11-03.json; each source was opened and checked on
// 3 November, and each verification note says what ran. Built on the
// 15 October script: edit keys are checked against Problem columns, relations
// become rows, and decisions already applied are skipped on a rerun.
//
// Published (14): jellium = uniform electron gas (Unreviewed: the Lean takes
// the physics inputs as hypotheses); irrationality exponent of rational
// arctangents (resubmitted with an AI disclosure; Lean-checked, 60); Eden's
// conjecture counterexample (Colbrook's earlier counterexample credited);
// planar Polya-Szego buckling (Lean-checked, 40); regular subcontinua, the
// irrational case and all finite cardinalities; hyperbolic systole bound
// (Partial); Shareshian-Wachs unimodality; Glushkov L/X diameter; Helleseth's
// three-valued conjecture; unforced 2D Euler non-uniqueness (Variant:
// infinite energy on the plane, the question asks finite energy on the torus);
// Tuza for two-type split graphs; solid grid Hamiltonian paths (Unreviewed:
// only correctness is formalised, not the polynomial bound); and two new
// OpenAI release manuscripts, ETH is false (76) and Sogge local smoothing
// in every dimension (72), pinned to openai/math 4eaee87.
//
// Declined (4): Vinogradov least primitive root (pseudonymous, landmark rule);
// the two Collatz submissions (no posed question; the second a duplicate).
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { readFileSync } from "node:fs";
import { Prisma } from "@prisma/client";
import { join } from "node:path";
import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const EXPECTED = 18;

interface Decision {
  slug: string;
  action: "approve" | "decline";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
  reviewNote?: string;
}

const DATA = JSON.parse(readFileSync(join(__dirname, "review-2026-11-03.json"), "utf8")) as {
  decisions: Decision[];
  amends: { slug: string; appendResult: string }[];
};
const DECISIONS = DATA.decisions;

type Relation = { to: string; kind: string; note: string };
const relationsOf = (d: Decision): Relation[] => ((d.edits?.relations as Relation[] | undefined) ?? []);

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  // Every edit key must be a Problem column (relations are handled as rows),
  // so a stray draft field fails here and not halfway through --apply.
  const columns = new Set<string>([...Object.values(Prisma.ProblemScalarFieldEnum), "relations"]);
  for (const d of DECISIONS) {
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 60)}  (${d.reason})`);
    for (const k of Object.keys(d.edits ?? {})) {
      if (!columns.has(k)) {
        console.log(`  UNKNOWN FIELD: ${k}`);
        bad++;
      }
    }
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

    // Pre-flight: every lookup happens before any write. A decision already
    // applied (as after a partial run) is skipped, so the
    // script can be re-run to finish.
    const done = new Set<string>();
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { status: true, name: true, sourceUrl: true, links: { select: { label: true, url: true, kind: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") {
        const expected = d.action === "approve" ? "published" : "rejected";
        if (cur.status !== expected) throw new Error(`${d.slug} is ${cur.status}, expected pending or ${expected}`);
        console.log(`DONE     ${cur.name.slice(0, 60)} (already ${cur.status})`);
        done.add(d.slug);
        continue;
      }
      for (const r of relationsOf(d)) {
        const to = await prisma.problem.findUnique({ where: { slug: r.to }, select: { status: true } });
        const viaThisRun = DECISIONS.some((x) => x.slug === r.to && x.action === "approve");
        if (!to || (to.status !== "published" && !viaThisRun)) throw new Error(`${d.slug}: relation target ${r.to} not published`);
        if (r.note.length > 200) throw new Error(`${d.slug}: relation note over 200`);
      }
      // A drafted link whose URL the submission already carries is not added twice.
      const merged = [...cur.links, ...(d.links ?? []).filter((l) => !cur.links.some((x) => x.url === l.url))];
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
      if (done.has(d.slug)) continue;
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true, links: { select: { url: true } } },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      const n = cur.links.length;
      const addLinks = (d.links ?? []).filter((l) => !cur.links.some((x) => x.url === l.url));
      const { relations: _relations, ...edits } = (d.edits ?? {}) as Record<string, unknown>;
      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...edits,
          ...(addLinks.length ? { links: { create: addLinks.map((l, i) => ({ ...l, position: n + i })) } } : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`${d.action}: ${d.slug}`);
      // Relations are their own rows, not a Problem column.
      const rels = relationsOf(d);
      for (const [position, r] of rels.entries()) {
        const to = await prisma.problem.findUnique({ where: { slug: r.to }, select: { id: true } });
        if (!to) throw new Error(`relation target vanished: ${r.to}`);
        await prisma.problemRelation.upsert({
          where: { fromId_toId_kind: { fromId: cur.id, toId: to.id, kind: r.kind } },
          create: { fromId: cur.id, toId: to.id, kind: r.kind, note: r.note, position },
          update: {},
        });
      }
      if (rels.length) console.log(`  ${rels.length} relation(s)`);
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
