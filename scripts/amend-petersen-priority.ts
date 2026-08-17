// The Petersen colouring entry claimed a priority it does not have.
//
// FeralBadger899 commented that the first disproof was posted to X, not to
// arXiv. That checked out. @NeuralReformist posted a 68-vertex counterexample
// on 23 July 2026, credited to GPT-5.6 Sol Ultra - sixteen days before the
// 112-vertex preprint this entry was built on.
//
// Verified here rather than taken on the commenter's word, and deliberately
// with the same encoder that was written for the 112-vertex object:
//
//   - the sparse6 string decodes to n = 68 with 102 edges, matching the claim;
//   - simple, cubic, connected, bridgeless, girth five;
//   - the 30 edges printed separately in the thread are all present in the
//     decoded graph, so two independent encodings of the object agree;
//   - the Petersen-colouring CNF (2210 vars, 19040 clauses) is UNSAT under
//     Cadical153 and Cadical195 in separate processes;
//   - K4, K3,3, the prism and the Petersen graph itself all come back SAT
//     through the same encoder. Petersen is the control that matters: it is a
//     snark, so a colouring for it rules out the encoder having quietly tested
//     3-edge-colourability instead.
//
// (Glucose42 and Minisat22 hung or segfaulted on this instance - a known PySAT
// failure mode on Windows, not a result. Neither is counted either way.)
//
// What is NOT established: that the preprint and the post are independent. The
// preprint does not cite the post. That could be independent rediscovery or
// not, and the entry says exactly that rather than guessing. Also unverified is
// the date itself - the graph is checkable, a timestamp on a screenshot is not.
//
// solveDate moves to 2026-07-23, because the entry's Solved field is a
// statement about when the conjecture fell, not about when this catalog's
// primary source appeared. Headline axes stay on the preprint, which is the
// only complete writeup with certificates - the same split the Crouzeix entry
// already uses.
//
// Ulyanov's 52-vertex follow-up is not recorded: he states in the thread that
// the graph6 he posted is wrong, and the correction is truncated, so there is
// nothing checkable yet.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { COMMENT_MAX_LENGTH } from "../src/lib/comments";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "petersen-coloring-conjecture";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const RESULT_NOTE = `This preprint was not the first disproof. A 68-vertex counterexample was posted to X on 23 July 2026 by @NeuralReformist, credited to GPT-5.6 Sol Ultra, sixteen days earlier. This site decoded that sparse6 string and checked it independently: 68 vertices, 102 edges, simple, cubic, connected, bridgeless, girth five, and no Petersen coloring under the same encoder used for the 112-vertex graph. Whether the two are independent is unknown - the preprint does not cite the post. The headline axes still record the preprint, the only complete writeup with certificates.

The implication runs one way: the Petersen coloring conjecture implies Berge-Fulkerson and the 5-cycle-double-cover conjecture, so refuting it leaves both of those open. The paper does not claim 112 is minimum, and it supplies a second, nonisomorphic $D_3$-symmetric 112-vertex counterexample. Combined with a theorem of Ma, Mattiolo, Steffen and Wolf, one counterexample yields infinitely many.`;

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "What was actually shown", key: "resultNote", value: RESULT_NOTE },
  // The Solved field is about the problem, not about this catalog's source.
  { field: "Solved", key: "solveDate", value: "2026-07-23" },
];

const LINKS = [
  {
    label: "First known counterexample: 68 vertices, posted to X, 23 July 2026",
    url: "https://x.com/NeuralReformist/status/2080153035045839069",
    kind: "announcement",
  },
  {
    label: "Open Problem Garden: Petersen coloring conjecture",
    url: "http://www.openproblemgarden.org/op/petersen_coloring_conjecture",
    kind: "problem-record",
  },
  {
    label: "Zenodo artifact record v1.1.0 (CNFs, DRAT certificates, hashes)",
    url: "https://doi.org/10.5281/zenodo.21845291",
    kind: "code",
  },
  {
    label: "Ma, Mattiolo, Steffen, Wolf - Sets of r-graphs that color all r-graphs",
    url: "https://doi.org/10.1007/s00493-025-00144-4",
    kind: "paper",
  },
];

const REPLY = `Checked, and you are right - thank you. I decoded the sparse6 from that post rather than taking it on trust: 68 vertices, 102 edges, simple, cubic, connected, bridgeless, girth five. The 30 edges printed separately further down the thread all appear in the decoded graph, so two independent encodings of the object agree.

Re-running the Petersen coloring encoding written here from the definition gives UNSAT (Cadical153 and Cadical195, separate processes), while $K_4$, $K_{3,3}$, the prism and the Petersen graph itself all come back satisfiable through the same encoder. Petersen is the control that matters: it is a snark, so a coloring for it rules out the encoder having quietly tested 3-edge-colorability instead.

So the conjecture fell on 23 July, sixteen days before the preprint this entry was built on. The entry now says so, the post is linked, and the Solved date has moved - that field is about when the problem fell, not about when this catalog's primary source appeared. What I have not established is whether the two are independent; the preprint does not cite the post, and I am not going to guess. The headline axes stay on the preprint because it is the only complete writeup with certificates.

Your 52-vertex example I could not check: you note in the thread that the posted graph6 is wrong, and the correction is cut off in what I can see. Post a working encoding here, or link the arXiv version when it lands, and I will verify it the same way and add it - a 52-vertex counterexample would be the smallest known by a wide margin, and worth its own line on this entry.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const lim = LIMITS.get(e.key);
    if (lim && typeof e.value === "string" && e.value.length > lim) {
      console.log(`  ${e.key} OVER BY ${e.value.length - lim} (${e.value.length}/${lim})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: amend (priority)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length} (adds the X post)`);
  console.log(`  resultNote: ${RESULT_NOTE.length}/${LIMITS.get("resultNote")}`);
  console.log(`  reply: ${REPLY.length}/${COMMENT_MAX_LENGTH}`);
  if (REPLY.length > COMMENT_MAX_LENGTH) bad++;
  console.log(`  unchanged: resolution=${p.resolution}, verification=${p.verification}, significance=${p.significance}`);
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
      },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
    prisma.comment.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        body: REPLY,
      },
    }),
  ]);

  console.log("APPLIED - entry amended, X post linked, reply posted");
}

main().finally(() => prisma.$disconnect());
