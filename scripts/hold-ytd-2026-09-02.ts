// Withdraws "The Yau-Tian-Donaldson Conjecture for Constant Scalar Curvature
// Kähler Metrics" (arXiv 2608.19301, "Disproof of the Yau--Tian--Donaldson
// conjecture") from the public record, held under the extraordinary-claims
// rule added to the methodology on 2 Sep 2026.
//
// Why. The entry was published on 21 Aug 2026 as a candidate at Unreviewed,
// with a verification note that says the mathematics "was NOT checked here and
// is beyond quick verification", on a claim our own significance note calls
// "one of the central conjectures of Kähler geometry". The rule written since
// says such a claim is held, not listed - not at Unreviewed and not as a
// Candidate either - until a named expert with no stake in it has checked the
// argument or a formal proof exists. The rule postdates the entry; it applies
// to it now, and the site cannot hold yesterday's positive-curvature claim and
// keep this one.
//
// Not a judgement on the mathematics. Nobody here is placed to make one, which
// is the point. The 79-page paper carries the fullest AI disclosure in the
// catalog (Appendix A, joint with Bin Dong and Guoxiong Gao), and the entry's
// notes stay intact on the row so that, when an expert has read it, the entry
// can be re-published as it stands with the tier it has earned.
//
// Mechanics, same as the S^2 x S^3 hold: status rejected, reason "held". A
// held entry has no public page. The entry was curator-added, so there is no
// submitter to write to; the review note below is for the next curator.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "yau-tian-donaldson-conjecture-csck";

const MESSAGE =
  "Held under the extraordinary-claims rule (methodology, 2 Sep 2026). A disproof of the Yau-Tian-Donaldson conjecture is a landmark by any Kähler geometer's standard; the entry was listed as a candidate at Unreviewed with the mathematics unchecked. It returns to the record when a named expert with no stake in it has gone through the argument, or a formal proof exists. All notes and links on the entry are kept for that day.";

const REVIEW_NOTE =
  "Held 2 Sep 2026 under the extraordinary-claims rule, which postdates the entry (published 21 Aug). Re-publish as-is, at the tier earned, once a named Kähler geometer with no stake has checked the argument - watch for expert commentary on arXiv 2608.19301 and for any formalisation. Nothing on the row was changed except status/reason/message; the significance note (60, just below the Jacobian anchor) and the AI-role note (Appendix A) stand.";

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, name: true, status: true, resolution: true, verification: true, significance: true, sourceUrl: true, submittedById: true },
  });
  if (!cur) throw new Error("entry not found");
  console.log(JSON.stringify(cur, null, 1));
  if (cur.status !== "published") throw new Error(`status is ${cur.status}, expected published`);
  if (!cur.sourceUrl.includes("2608.19301")) throw new Error("unexpected source url - stop and look");

  console.log(`\n${cur.name}\n  status: published -> rejected (reason: held)`);
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { status: "rejected", reviewedAt: new Date(), reviewReason: "held", reviewMessage: MESSAGE },
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "rejected" },
    }),
    prisma.reviewNote.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: REVIEW_NOTE },
    }),
  ]);
  console.log("\nAPPLIED. Public caches (home list, entry page) refresh on the next deploy or within the hour.");
}

main().finally(() => prisma.$disconnect());
