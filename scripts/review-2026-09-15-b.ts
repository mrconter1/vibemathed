// Holds Braun's bit-PHP / Res(+) submission of 15 September 2026, the one of
// the day's five that the other script (review-2026-09-15.ts) left out.
//
// THE CLAIM. A superpolynomial lower bound for the bit pigeonhole principle
// in unrestricted DAG-like resolution over parities. That is the open
// benchmark of its corner of proof complexity: introduced with the system by
// Itsykson and Sokolov in 2014, named as open by Efremenko-Garlik-Itsykson
// (STOC 2024, regular fragment), Bhattacharya-Chattopadhyay-Dvorak (bounded
// depth), the merged STOC 2026 paper (near-quadratic depth) and Itsykson-
// Podolskii-Shekhovtsov (CCC 2026), and reached by none of them. A November
// 2025 arXiv paper on the same formula manages bounded depth only.
//
// WHAT WAS AUDITED, at commit 54f0937. The final theorem quantifies over every
// `AffineDAG (usualBitPHPInitials (2^l+1) l) C` with a node deriving the empty
// clause and bounds the node count below by (2^l)^K. `AffineDAGStep` has four
// constructors: initial, semantic weakening, resolution on a parity literal
// against its opposite, and any semantically sound two-premise rule; a node
// may reference any earlier node, and nothing imposes regularity or depth.
// That is a superset of DAG-like Res(+). `usualCNFClause i i' z` is the
// standard bit-PHP axiom over all pigeon pairs and all 2^l hole labels.
// Across all 81 Lean files: no sorry, no axiom, no native_decide; the
// chessboard homology (Bjorner-Lovasz-Vrecica-Zivaljevic) is proved, not
// assumed. The statement is faithful to the claim.
//
// WHAT COULD NOT BE CHECKED. Whether it compiles. The repository has no Lean
// CI - its only workflow publishes the research notebook - so the kernel
// check rests on the author's local build and his `leanchecker --fresh` log.
// An independent rebuild was started here in a fresh container (fresh elan,
// the pinned toolchain v4.34.0-rc2, the pinned Mathlib commit 67248ba) and
// had to be abandoned: the Mathlib olean cache alone needs more disk than the
// review machine had. So nothing outside the author's machine has compiled
// this proof.
//
// THE RULE. Claims of this size are held until a named expert with no stake
// confirms them or a formal proof exists. "Exists" has meant, on every entry
// so far, kernel-checked somewhere other than the author's laptop: the
// percolation entry went in as a candidate because anthropics/formal-math has
// CI, Hilbert-UMD because its CI ran on Ubuntu and Windows. Here there is no
// such run. Held, not declined: nothing on the row is wrong, and the route
// back is concrete and cheap - a GitHub Actions Lean build that is green on a
// fresh runner. Then this goes in as Candidate at lean-checked the same day,
// with the audit above already done.
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
}

const DECISIONS: Decision[] = [
  {
    slug: "superpolynomial-lower-bounds-for-bit-php-in-unrestricted-resolution-over-paritie",
    action: "reject",
    reason: "held",
    edits: {
      // Fixed now so the row is publishable as-is the day the build is green:
      // the name and statement pose the problem, the posing is dated, the
      // human author is named as the paper itself names him.
      name: "Superpolynomial lower bound for the bit pigeonhole principle in unrestricted resolution over parities",
      shortName: "Bit PHP in dag-like Res(⊕)",
      statement:
        "Resolution over parities, $\\mathrm{Res}(\\oplus)$, extends resolution to disjunctions of affine equations over $\\mathbb{F}_2$. Exponential lower bounds are known for tree-like, regular and bounded-depth fragments, but no superpolynomial lower bound for unrestricted DAG-like $\\mathrm{Res}(\\oplus)$ is known for any formula. Does the bit pigeonhole principle with $n + 1$ pigeons and $n = 2^\\ell$ holes require superpolynomially many nodes in unrestricted DAG-like $\\mathrm{Res}(\\oplus)$?",
      posedBy:
        "Itsykson and Sokolov (2014), who introduced the system; named as the open benchmark by Efremenko-Garlik-Itsykson (2024) and Itsykson-Podolskii-Shekhovtsov (2026) among others",
      yearPosed: 2014,
      model: "GPT-6 Astra; Claude Sonnet 5; Claude Fable 5.1; Claude Opus 5",
      modelMaker: "OpenAI; Anthropic",
      humanCollaborators: ["Kamil Braun"],
      sourceName:
        "kbr-/math-research: whitepaper at commit dfc69c6, Lean claim BitPHPSuperpolynomial.lean at 54f0937",
      reviewNote:
        "Held 15 Sep 2026 under the extraordinary-claims rule. The claim is the open benchmark of its area, named as open by every 2024-2026 paper on Res(+). Audited at 54f0937: the final theorem, the proof system (initial / semantic weaken / resolve on a parity literal / any sound binary rule, DAG, no regularity or depth - a superset of dag-like Res(+)) and the CNF (standard bit-PHP over all pairs and labels) all match the claim; no sorry, no axiom, no native_decide in 81 files; chessboard homology proved. NOT checked: that it compiles. The repository has no Lean CI, and the independent container rebuild started here ran out of disk before the Mathlib cache finished. Route back: a GitHub Actions Lean build green on a fresh runner, then re-publish as Candidate at lean-checked the same day with the fields above. Alternatively a named specialist (Itsykson, Efremenko, Garlik, Chattopadhyay, Dvorak) confirming the argument. A timing decision, not a doubt about the row.",
    },
    message: [
      "Held, not declined. Nothing on your row is wrong; one thing is missing, and it is cheap.",
      "",
      "This is a major claim. Every paper on Res(+) from 2024 to 2026 names superpolynomial lower bounds for the unrestricted DAG-like system as the open benchmark, and the November 2025 arXiv paper on bit-PHP reaches bounded depth only. The site's rule for claims of this size is that they are held until a named specialist with no stake confirms them or a machine-checked proof exists somewhere other than the author's machine.",
      "",
      "What was checked, at 54f0937: the final theorem, the proof system and the CNF, in the Lean source. AffineDAGStep allows initial clauses, semantic weakening, resolution on a parity literal against its complement, and any sound two-premise rule, with nodes referencing any earlier node and no regularity or depth constraint: a superset of DAG-like Res(+). usualCNFClause is the standard bit-PHP axiom over all pairs and all 2^l labels. No sorry, no custom axiom, no native_decide in 81 files; the chessboard homology is proved, not assumed. The statement is faithful to the claim.",
      "",
      "What could not be checked is that it compiles. Your repository has no Lean CI - the only workflow publishes the notebook - so the kernel check rests on your local build. An independent rebuild started here with your pinned toolchain and Mathlib commit ran out of disk. As of today nothing outside your machine has compiled this proof.",
      "",
      "The route back: a GitHub Actions workflow running `lake exe cache get` and `lake build` on the formalization directory and printing the axioms of MathResearch.bitPHP_superpolynomial. When it is green on a fresh runner, message us; the entry goes in as Candidate at lean-checked the same day, fields already prepared. A specialist reading the argument would move it further: Itsykson, Efremenko, Garlik, Chattopadhyay or Dvorak would know within an afternoon whether the transfer to degree-O(log n) polynomial calculus does what it claims.",
    ].join("\n"),
  },
];

async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string) => Promise<T>;
}): Promise<string> {
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

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const d of DECISIONS) {
    console.log(`${d.action === "reject" ? "HOLD   " : "APPROVE"}  ${d.slug.slice(0, 56)}`);
    const n = charLength(canonical(d.message));
    console.log(`  message : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const c = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && c > lim;
        console.log(`  ${k.padEnd(17)}: ${c}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {} });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `${localBad} local violation(s)` : "local checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, status: true, name: true, sourceUrl: true, submittedById: true, links: { select: { label: true, url: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: cur.links, sourceUrl: cur.sourceUrl });
      console.log(`HOLD     ${cur.name.slice(0, 60)}  -> merged check: ${v.length ? "FAILED" : "ok"}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          status: "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`held: ${d.slug}`);
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
        console.log(`messaged: ${d.slug}`);
      }
      await prisma.problemActivity.create({
        data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "rejected" },
      });
    }
    console.log("\nAPPLIED. Held rows are not public; nothing to wait for on the site.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
