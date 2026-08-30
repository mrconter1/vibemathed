// Publish Dean's conjecture for k = 5. 30 Aug 2026.
//
// Source verified: Zenodo 10.5281/zenodo.22168174, "Cycles of length divisible
// by five in graphs of minimum degree five - The k=5 case of Dean's conjecture",
// Elias Botsford, 29 Aug 2026. Author name matches the submitter's address. Not
// a duplicate.
//
// THE STATUS OF THE PROBLEM CHECKED INDEPENDENTLY, not taken from the paper.
// Luo, Ma and Zhao's abstract (arXiv:2601.13552) states it directly: "Dean
// conjectured three decades ago that every graph with minimum degree at least
// k >= 3 contains a cycle whose length is divisible by k. While the conjecture
// has been verified for k in {3,4}, it remains open for k >= 5 ... In this paper,
// we resolve Dean's conjecture for all k >= 6." So k = 5 really was the last
// open case, and this paper really would complete the conjecture. The
// submission's framing is accurate.
//
// AI DISCLOSURE is in the abstract, and is strong enough for ai-discovered on
// its face: "The main results in this paper were obtained primarily through the
// use of generative AI, chiefly OpenAI's GPT-5.6 Sol, with additional support
// from Anthropic's Claude Opus 5 and Z.ai's GLM 5.3 Flash. The Danus
// mathematical framework was also used."
//
// THE COMPUTATIONAL SUPPLEMENT EXISTS AND IS INTACT. This is worth spelling out
// because the entry as submitted carried NO links at all, so nothing in it was
// reachable. The supplement is a separate Zenodo record, 10.5281/zenodo.22167084,
// cited in the paper's bibliography but nowhere in the entry. Both DOIs are now
// linked.
//   Downloaded and extracted it (192 KB, 87 entries; needed a short base path,
//   the tree is deep enough to hit Windows MAX_PATH).
//   Checked every file against the shipped MANIFEST_SHA256.txt:
//     86 match, 0 mismatch, 0 missing.
//   28 runnable Python verifiers, plus certificates, a PROPOSITION_MAP, a
//   dependency DAG and a run_all.ps1 driver.
//
// The README is candid about scope in a way the entry should echo: "The programs
// verify only the finite propositions listed in PROPOSITION_MAP.md. The
// reductions from arbitrary graphs to those finite state spaces, and the proofs
// that a reported forbidden object expands to a simple cycle or path in the
// original graph, are mathematical arguments in the paper. The programs do not
// replace those graph-to-state theorems." So even a fully green run leaves the
// graph-theoretic core unverified by machine - which is exactly why `candidate`
// is the right resolution and the submitter was right to choose it.
//
// ONE ATTRIBUTION GAP. posedBy "Nathaniel Dean" / 1988 is very likely right, but
// it is not sourced by anything I can see: the paper has nine bibitems and NONE
// of them is Dean's original, and Luo-Ma-Zhao date it only as "three decades
// ago", which from 2026 points nearer 1996 than 1988. Left as submitted, with an
// age note saying the year is uncorroborated here rather than silently keeping a
// precise-looking date nobody has checked.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "dean-s-conjecture-for-k-5";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  significance: 32,
  verificationNote:
    "Unreviewed: no independent expert, referee or proof assistant has checked the graph-theoretic argument, which is the bulk of the paper. What was checked here on 30 August 2026 is the computational supplement, and it holds up.\n\nThe supplement is a separate Zenodo record (10.5281/zenodo.22167084) cited in the paper's bibliography; the entry as submitted linked neither it nor the paper, so both are now attached. Downloaded and extracted (192 KB, 87 entries), then checked every file against the shipped $\\texttt{MANIFEST\\_SHA256.txt}$: 86 match, 0 mismatch, 0 missing. It contains 28 runnable Python verifiers, the certificate data, a proposition map, a dependency DAG and a driver script.\n\nWhat that cannot settle, in the supplement's own words: \"The programs verify only the finite propositions listed in PROPOSITION_MAP.md. The reductions from arbitrary graphs to those finite state spaces, and the proofs that a reported forbidden object expands to a simple cycle or path in the original graph, are mathematical arguments in the paper. The programs do not replace those graph-to-state theorems.\"\n\nSo the finite half is reproducible and its inputs are intact, while the reductions that carry those finite facts to all graphs of minimum degree five rest on unrefereed prose. That is the gap between this and a settled result, and it is why the entry is filed as a candidate.",
  resultNote:
    "Claims the last open case of Dean's conjecture: every finite simple graph with minimum degree at least five contains a cycle of length divisible by five. Verified independently against Luo, Ma and Zhao (arXiv:2601.13552), whose abstract confirms the landscape - the conjecture was known for $k\\in\\{3,4\\}$ and they proved every $k\\ge6$, leaving $k=5$ open. If this proof stands, Dean's conjecture holds for all $k\\ge3$.\n\nNine finite proposition families in the bipartite and triangle-free branches are computer-assisted, with verifiers and certificates in a separately archived supplement. The reductions from arbitrary graphs to those finite state spaces are prose arguments in the paper and are not machine-checked.\n\nThe claim has not been refereed, and no independent mathematician has audited the graph-theoretic core. The author describes extensive model-assisted hostile auditing of his own argument, which is worth something but is not external review, and says so plainly.",
  ageNote:
    "Attributed to Nathaniel Dean, and 1988 is plausible but uncorroborated here: the paper cites nine references, none of them Dean's original, and Luo, Ma and Zhao date the conjecture only as \"three decades ago\", nearer the mid-nineties from 2026. The attribution is not in doubt - it is named for him throughout the literature - only the year, which wants a primary source.",
  significanceNote:
    "Dean's conjecture is a named problem in extremal graph theory that stood for roughly three decades, and it is live rather than dormant: Luo, Ma and Zhao settled every $k\\ge6$ earlier in 2026, which is what left $k=5$ as the last case. Completing a conjecture of that standing is a substantial result, and the score reflects the problem rather than the confidence - the candidate status and unreviewed tier carry the latter. Held below the top band because it is a single-author unrefereed preprint whose central reductions nobody independent has read.",
};

const LINKS = [
  {
    label: "Computational supplement: verifiers, certificates, manifest",
    url: "https://doi.org/10.5281/zenodo.22167084",
    kind: "code",
  },
  {
    label: "Luo, Ma and Zhao - Dean's conjecture for every k >= 6",
    url: "https://arxiv.org/abs/2601.13552",
    kind: "paper",
  },
];

const DECISION = `Published as a candidate at significance 32, classification intact. Candidate and Unreviewed are exactly right, and worth saying: the temptation with a result this size is to overclaim, and you did not.

I checked the landscape independently rather than taking the paper's word. Luo, Ma and Zhao's abstract confirms it: known for k in {3,4}, they proved every k >= 6, leaving k = 5 open. So this really would complete Dean's conjecture, and your framing is accurate.

The substantive thing I did was the supplement. Your entry linked nothing at all - not the paper, not the supplement - so nothing was reachable by a reader. I found the supplement DOI in your bibliography, downloaded it, and checked every file against your own MANIFEST_SHA256.txt: 86 match, 0 mismatch, 0 missing. Both DOIs are now linked, which matters more than it sounds: a candidate nobody can reach is indistinguishable from one that does not exist.

The verification note quotes your README's scope paragraph rather than paraphrasing it, because it is the honest core of this entry: the programs verify the finite propositions, and the reductions from arbitrary graphs to those finite state spaces are prose. Even a completely green run leaves the graph-theoretic argument unchecked by machine. That is the gap between this and a settled result.

One to fix at your end: posedBy Dean and 1988. The attribution is not in doubt, but the year is uncorroborated - your nine references omit Dean's original, and Luo-Ma-Zhao date it only as "three decades ago", nearer the mid-nineties from 2026. I left the field as set and flagged it in an age note; a primary citation would settle it.

Also filled: result note, significance 32 with a note explaining that the score reflects the problem's standing and not confidence in the proof - the candidate status carries that.

If an independent mathematician reads the reductions, or the finite propositions get a proof-assistant treatment, send it and the tier moves.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, verification: true, aiContribution: true, resolution: true, significance: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}${DECISION.length > MESSAGE_MAX ? `  OVER BY ${DECISION.length - MESSAGE_MAX}` : ""}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n${SLUG}`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  verification   : ${cur.verification} (unchanged)`);
  console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
  console.log(`  significance   : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  +${LINKS.length} links, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT, status: "published", reviewedAt: new Date(),
        reviewMessage: DECISION, reviewReason: "edited",
        links: { create: LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: { userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym, kind: "decision", reason: "edited", body: DECISION, problemId: cur.id },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
