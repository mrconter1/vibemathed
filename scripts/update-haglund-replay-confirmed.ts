// Haglund k=1: the flagged computation was published, and this site replayed
// it. Three axes move. 26 Aug 2026.
//
// Two days ago this entry went up with a claimIssueNote saying the archive
// carrying part (i) - "238 patches and 60,930 source evaluations" - was
// "published nowhere", so "no reader can replay the computation it rests on".
// The submitter commented that a Verification folder now exists. It does, and
// it works. That flag is now false and comes off.
//
// WHAT WAS ACTUALLY RUN HERE, 26 August 2026:
//   git clone of mbaccaro-dev/mathematical-proofs (commit added 25 Aug,
//   "Add portable HC4 k=1 computational verification"), venv with
//   python-flint 0.9.0 per requirements.txt, then reproduce.py in full.
//   Wall time 4m17s. Output:
//     MANIFEST_PASS files=289
//     S1_STRUCTURE_PASS anchors=10 boundary_segments=37
//     NONREAL_JOIN_PASS residual_atoms=3 remainder=empty
//     GLOBAL_LIFT_PASS properness=bounded collision_direction=right
//     OUTER_REGION_PASS radial_threshold=256
//     ENVIRONMENT python=3.14.0 python_flint=0.9.0
//     S2_SCIENTIFIC_PASS patches=238 leaves=8304 boxes=16370
//                        source_calls=60930 max_depth=9
//     S3_SCIENTIFIC_PASS patches=323 leaves=16537 boxes=32751
//                        source_calls=46514 max_depth=10
//     STATUS=PASS claim_ceiling=Haglund_Conjecture_4_for_k_equals_1_only
//   The S2 line reproduces the paper's own 238/60,930 exactly.
//
// verification unreviewed -> site-confirmed. The ladder's own wording for that
// rung is "this site reproduced the artifact itself: re-ran a finite
// certificate", and that is literally what happened. The note says what was
// run and, just as important, what it does not establish: the script recomputes
// its own certificates and checks them against its own manifest, so it
// confirms the computation replays and is internally consistent - not that the
// interval arithmetic correctly implies the theorem, which is prose in the
// paper, and not the analytic arguments around it.
//
// aiContribution ai-co-developed -> ai-discovered. The downgrade two days ago
// rested entirely on the disclosure naming no model and attributing no step.
// The 25 Aug commit "Clarify AI assistance disclosure" replaced it with:
// "OpenAI ChatGPT and Codex models performed most of the proof search,
// mathematical derivation, computational implementation, Lean proof
// development, literature discovery, organization, and drafting. The author
// supplied the research methodology, problem framing, constraints, evaluation
// criteria, and iterative oversight." That names the systems and attributes
// the proof search to them. The decision message promised "name the system and
// say what it did in the disclosure section and I will revisit the tier the
// same day"; this honours it.
//
// model "OpenAI GPT-5 (Codex)" -> "ChatGPT and Codex", which is what the paper
// now says. The old string was the submitter's word for a version the
// manuscript never named, and it still names none.
//
// resolution STAYS candidate. Nothing about acceptance changed: still
// unrefereed, still no independent human review of the analytic half, and the
// archive itself says "End-to-end Lean verification remains pending".
//
// ONE REAL DEFECT FOUND, reported rather than silently patched. reproduce.py
// aborts on a fresh clone: SOURCE_MANIFEST.sha256 has 289 entries, of which 277
// match a LF checkout and 12 do not, and all 12 match only as CRLF. They are
// Windows console receipts (source_stdout_*, source_watchdog_*). With no
// .gitattributes in the repo, no single git checkout on any platform can
// satisfy the whole manifest - autocrlf=true breaks the .py files,
// autocrlf=false breaks these 12. I converted exactly those 12 locally, after
// which the manifest passed and the run completed. A .gitattributes pinning
// them, or regenerating the manifest from normalised bytes, fixes it.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { COMMENT_MAX_LENGTH } from "../src/lib/comments";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "haglund-s-zero-trajectory-conjecture-for-the-first-riemann-xi-approximant";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  claimIssueNote: null,
  verification: "site-confirmed",
  aiContribution: "ai-discovered",
  model: "ChatGPT and Codex",
  verificationNote:
    "Site-confirmed: the computational certificate was replayed here on 26 August 2026 and it passes. Cloned mbaccaro-dev/mathematical-proofs, installed python-flint 0.9.0 into a venv per requirements.txt, ran its own reproduce.py in full (4 min 17 s), and got STATUS=PASS with claim_ceiling=Haglund_Conjecture_4_for_k_equals_1_only - via MANIFEST_PASS at 289 files, S1_STRUCTURE, NONREAL_JOIN, GLOBAL_LIFT, OUTER_REGION, and crucially S2_SCIENTIFIC_PASS at patches=238, source_calls=60930, the paper's own figures for the certified first-quadrant proposition, plus S3 at 323 patches and 46,514 calls.\n\nWhat that does not settle: the script recomputes its own certificates against its own manifest, so it shows the computation replays and is internally consistent, not that the interval arithmetic implies the theorem (argued in prose) nor any analytic step around it. The Lean is unchanged from first review - no sorry, admit or declared axiom in the Solution closure, but it verifies one abstract collision theorem, and the repository still says the atlas, the incomplete-gamma estimates and the assembly are not consequences of it. End-to-end Lean remains pending by the author's account; the paper is unrefereed.\n\nOne packaging defect found while replaying: on a fresh clone reproduce.py aborts at the manifest gate. Of 289 hashes, 12 match only as CRLF, all Windows console receipts, and with no .gitattributes no checkout satisfies both sets; the run above needed those 12 converted first.",
  aiRole:
    "The disclosure was rewritten on 25 August, and now reads in full: \"OpenAI ChatGPT and Codex models performed most of the proof search, mathematical derivation, computational implementation, Lean proof development, literature discovery, organization, and drafting. The author supplied the research methodology, problem framing, constraints, evaluation criteria, and iterative oversight. The author remains responsible for every mathematical statement, proof, citation, and submission decision.\" That names the systems and attributes the proof search itself to them, which is why this is filed as AI-discovered. It replaces the earlier version - \"AI systems were used extensively in mathematical derivation, Lean proof development, literature discovery, organization, and typesetting\" - which named no system and attributed no step, and on which this entry was first filed a rung lower as co-developed. The manuscript still gives no version for either system, so the model field records only what it says.",
};

const LINKS = [
  {
    label: "Verification archive: reproduce.py, source manifest and interval certificates",
    url: "https://github.com/mbaccaro-dev/mathematical-proofs/tree/main/MathematicalProofs/HaglundK1ZeroTrajectory/Verification",
    kind: "code",
  },
];

const COMMENT = `Replayed it here, and it passes. Thank you for publishing the archive.

What I ran, on 26 August: cloned the repository, installed python-flint 0.9.0 into a venv per requirements.txt, and ran reproduce.py in full. Four minutes seventeen seconds, ending

    STATUS=PASS claim_ceiling=Haglund_Conjecture_4_for_k_equals_1_only

with MANIFEST_PASS at 289 files, then S1_STRUCTURE, NONREAL_JOIN, GLOBAL_LIFT and OUTER_REGION, and the two atlases at S2 patches=238 source_calls=60930 and S3 patches=323 source_calls=46514. The S2 line reproduces the paper's own figures for the certified first-quadrant proposition, which is exactly what the claim-issue flag said no reader could replay. The flag is removed and verification moves to site-confirmed, with the note recording precisely what was run.

Two other things followed from your update. Your rewritten disclosure now names the systems and says they "performed most of the proof search", so AI contribution goes back up to AI-discovered - I said at review that naming the system and its role would move the tier the same day, and it does. The model field now reads "ChatGPT and Codex", matching the paper rather than a version it never states.

One defect worth fixing, because it stops the next reader cold. On a fresh clone reproduce.py aborts at the manifest gate. Of the 289 hashes, 277 match a LF checkout and 12 match only as CRLF - all Windows console receipts (source_stdout_*, source_watchdog_*). There is no .gitattributes, so no single checkout satisfies both sets: autocrlf=true breaks the .py files, autocrlf=false breaks those 12. I converted exactly those 12 locally and the run then completed. A .gitattributes pinning them, or regenerating the manifest from normalised bytes, would make it clone-and-run.

Resolution stays candidate, and that is not a comment on the computation. The analytic half still has no independent review, and end-to-end Lean is pending by your own account.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, verification: true, aiContribution: true, model: true, claimIssueNote: true, resolution: true },
  });
  if (!cur) throw new Error("entry not found");
  if (cur.status !== "published") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
      if (v.length > lim) { console.log(`  OVER BY ${v.length - lim}`); bad++; }
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  console.log(`  comment: ${COMMENT.length}/${COMMENT_MAX_LENGTH}`);
  if (COMMENT.length > COMMENT_MAX_LENGTH) bad++;
  if (bad) throw new Error("limits exceeded");

  console.log(`\n${SLUG}`);
  console.log(`  verification   : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  aiContribution : ${cur.aiContribution} -> ${NEXT.aiContribution}`);
  console.log(`  model          : ${cur.model} -> ${NEXT.model}`);
  console.log(`  claimIssueNote : ${cur.claimIssueNote ? "SET" : "null"} -> null (REMOVED)`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  +${LINKS.length} link, +1 comment reply`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  const changes = [
    { field: "Verification", oldValue: cur.verification, newValue: NEXT.verification as string },
    { field: "AI contribution", oldValue: cur.aiContribution, newValue: NEXT.aiContribution as string },
    { field: "Model", oldValue: cur.model, newValue: NEXT.model as string },
    { field: "Claim issue", oldValue: cur.claimIssueNote, newValue: "(removed)" },
  ];

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, links: { create: LINKS.map((l, i) => ({ ...l, position: nLinks + i })) } } as never,
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: cur.id, userId: curator.id, userName: curator.pseudonym,
        type: "updated" as const, field: c.field, oldValue: c.oldValue, newValue: c.newValue,
      })),
    }),
    prisma.comment.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: COMMENT },
    }),
  ]);
  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
