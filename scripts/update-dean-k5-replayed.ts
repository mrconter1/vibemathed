// Dean k=5: the computational supplement was replayed in full here, so the
// verification tier moves. 30 Aug 2026.
//
// When this entry was published an hour ago the suite was still running, so the
// note recorded only the manifest check. It has now finished:
//
//   run_all.ps1, on Windows, python 3.14 + node
//   "All certificate runs passed: 47"
//   EXIT=0, elapsed 2033.4 s (33 min 53 s)
//   fresh verification record written to verification/20260830-121902
//
// Every per-run line the driver emitted carried exit=0. The record directory
// holds the per-verifier output, and the only matches for "fail" anywhere in it
// are four occurrences of the string "failures: 0". Longest single runs were
// verify_two024_eeo_odd_cap_fullH_subsets.py at 277.7 s, search_m4_n8_regimes.py
// at 276.9 s and verify_common_d_blocker_pair_dp.py at 172.5 s. Both languages
// exercised: 36 Python verifiers and 2 JavaScript ones under node, plus the
// three bipartite verifiers, whose own output reports "checked rows: 580,
// failures: 0" and "verified rich pairs: 78".
//
// That is the site-confirmed rung by its own wording - "this site reproduced the
// artifact itself: re-ran a finite certificate" - so verification goes
// unreviewed -> site-confirmed.
//
// RESOLUTION STAYS `candidate`, and this is the point that matters. Replaying
// the certificates does not touch the part of the paper that would actually
// settle Dean's conjecture. The supplement says so itself: the programs verify
// only the finite propositions, and the reductions from arbitrary graphs to
// those finite state spaces are prose in the paper. A green suite means the
// finite half is exactly what the author says it is; it says nothing about the
// graph-theoretic core, which nobody independent has read.
//
// Recorded as a public comment on the entry as well as in the note, on the
// Haglund precedent: a replication that only the curator can see is not much
// use to the next reader.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { COMMENT_MAX_LENGTH } from "../src/lib/comments";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "dean-s-conjecture-for-k-5";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  verification: "site-confirmed",
  verificationNote:
    "Site-confirmed: the computational supplement was replayed here in full on 30 August 2026, and it passes.\n\nWhat was run. Downloaded the supplement from its own Zenodo record (10.5281/zenodo.22167084), checked all 86 files against the shipped $\\texttt{MANIFEST\\_SHA256.txt}$ - 86 match, 0 mismatch, 0 missing - then executed its $\\texttt{run\\_all.ps1}$ driver end to end. Result: \"All certificate runs passed: 47\", exit 0, in 33 min 53 s. Every per-run line reported $\\texttt{exit=0}$, and the only occurrences of \"fail\" in the fresh verification record are four instances of \"failures: 0\". Both toolchains ran, Python and JavaScript, including the bipartite verifiers, whose output reports \"checked rows: 580, failures: 0\" and \"verified rich pairs: 78\".\n\nWhat this does NOT establish, and it is the larger half. In the supplement's own words: \"The programs verify only the finite propositions listed in PROPOSITION_MAP.md. The reductions from arbitrary graphs to those finite state spaces, and the proofs that a reported forbidden object expands to a simple cycle or path in the original graph, are mathematical arguments in the paper. The programs do not replace those graph-to-state theorems.\"\n\nSo the nine computer-assisted proposition families are exactly what the author says they are, and reproducibly so. The argument that carries them to every graph of minimum degree five is unrefereed prose that no independent mathematician has read. That is why the entry remains a candidate.",
};

const COMMENT = `Replayed the computational supplement here in full, and it passes.

Downloaded it from its own Zenodo record, checked all 86 files against the shipped MANIFEST_SHA256.txt (86 match, 0 mismatch, 0 missing), then ran run_all.ps1 end to end:

    All certificate runs passed: 47
    EXIT=0, elapsed 2033.4s

Every per-run line reported exit=0. The only matches for "fail" in the fresh verification record are four instances of "failures: 0". Both toolchains ran - 36 Python verifiers and 2 JavaScript under node - plus the three bipartite verifiers, which report "checked rows: 580, failures: 0" and "verified rich pairs: 78". The heaviest certificates were verify_two024_eeo_odd_cap_fullH_subsets.py and search_m4_n8_regimes.py at around 277s each.

Verification therefore moves to site-confirmed, and the note records what was run.

The status stays **candidate**, which is not a hedge. Replaying the certificates does not touch the part of the paper that would settle Dean's conjecture: the supplement itself says the programs verify only the finite propositions, and that the reductions from arbitrary graphs to those finite state spaces are mathematical arguments in the paper. A green suite means the finite half is exactly as described and reproducible by anyone. The graph-theoretic core still has no independent reader.

Two DOIs are now linked from the entry - the paper and the supplement - since neither was reachable from it before.`;

const FOLLOWUP = `Following up on the decision I sent earlier: the verification suite has finished, and the tier has moved.

When I published the entry the run was still going, so the note recorded only the manifest check. It has now completed: "All certificate runs passed: 47", exit 0, in 33 minutes 53 seconds, with every per-run line at exit=0 and no failures anywhere in the fresh verification record. Verification is now site-confirmed rather than unreviewed, and I have left a public comment on the entry recording exactly what was run, so the next reader can see it rather than taking my word.

Worth saying plainly: the supplement is unusually easy to reproduce. A driver script, a SHA256 manifest that actually matches, a proposition map and a dependency DAG. It cost me one command and half an hour of wall time. Most computational claims that arrive here cannot be checked at all.

The status stays candidate, and that is not a reservation about the code. Your own README draws the line correctly - the programs verify the finite propositions, the reductions to those finite state spaces are prose - so the green run confirms the finite half and leaves the graph-theoretic core exactly where it was: unread by anyone independent. If a mathematician works through the reductions, or the finite propositions get a proof-assistant treatment, that is what moves the resolution.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, verification: true, resolution: true },
  });
  if (!cur) throw new Error("entry not found");
  if (cur.status !== "published") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  // Thread the follow-up under the decision message so it reads as one exchange.
  const root = await prisma.directMessage.findFirst({
    where: { problemId: cur.id, kind: "decision" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  console.log(`  comment: ${COMMENT.length}/${COMMENT_MAX_LENGTH}`);
  if (COMMENT.length > COMMENT_MAX_LENGTH) bad++;
  console.log(`  followup: ${FOLLOWUP.length}/${MESSAGE_MAX}`);
  if (FOLLOWUP.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n${SLUG}`);
  console.log(`  verification : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  resolution   : ${cur.resolution} (unchanged, deliberately)`);
  console.log(`  +1 public comment, +1 threaded follow-up (root ${root ? "found" : "MISSING"})`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({ where: { id: cur.id }, data: NEXT as never }),
    prisma.problemActivity.create({
      data: {
        problemId: cur.id, userId: curator.id, userName: curator.pseudonym,
        type: "updated", field: "Verification", oldValue: cur.verification, newValue: NEXT.verification as string,
      },
    }),
    prisma.comment.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: COMMENT },
    }),
    prisma.directMessage.create({
      data: {
        userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym,
        kind: root ? "reply" : "note", body: FOLLOWUP, problemId: cur.id,
        ...(root ? { parentId: root.id } : {}),
      },
    }),
  ]);
  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
