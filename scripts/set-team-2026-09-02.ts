// The first team, 2 Sep 2026: who reviews, who builds, who was checked.
//
// Rasmus Lindahl - admin. Runs the site; already an environment admin, the
// database role is so he appears on the About page like everyone else.
//
// Eugene Gilburg (VibeGene) - developer. Collaborator on the repository since
// 30 Aug; the credit is for the About page, it carries no site permission.
//
// Sam Bevins (sjbevins) - moderator, verified. Email sjbevins@wm.edu confirmed
// by reply to a verification mail on 2 Sep 2026; matches the wm.edu Google
// Scholar profile (2 citations, h-index 1) and the personal homepage (PhD
// candidate in theoretical physics, William & Mary, Bentsen QIS group).
//
// CORRECTION, same day: Saul's moderator role was removed an hour after it
// was set. Making him a moderator was the curator's inference from "add the
// other guys as moderator", not anything Saul asked for; he keeps the
// verification and the citation count. Ask before granting a role.
//
// Saul Schleimer - verified (moderator until the correction above). The
// account is saulsch@gmail.com with
// Google name "Saul Schleimer" and bio "Geometric topologist at the University
// of Warwick". His homepage (sschleimer.warwick.ac.uk) lists only the Warwick
// address, so the gmail is NOT confirmed from his own page. What was checked:
// the handle "saulsch" is his on GitHub (name Saul Schleimer, company
// University of Warwick, blog = his homepage; user since 2019) and on
// Mathstodon (@saulsch); the bio matches the Warwick staff page. Google
// Scholar (Warwick-verified): 3,945 citations, h-index 27, i10 51. This is a
// weaker check than Sam's and the verified note says so. A one-line mail to
// s.schleimer@warwick.ac.uk would make it airtight.
//
// Dry run by default. Pass --apply to write. Requires the staffRole and
// citations columns, i.e. `prisma db push` first.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const TEAM: {
  email: string;
  expectPseudonym: string;
  staffRole: "admin" | "moderator" | "developer";
  verified?: { note: string };
  citations?: { count: number; note: string };
}[] = [
  {
    email: "rasmus.lindahl1996@gmail.com",
    expectPseudonym: "Rasmus Lindahl",
    staffRole: "admin",
  },
  {
    email: "eugene.gilburg@gmail.com",
    expectPseudonym: "VibeGene",
    staffRole: "developer",
  },
  {
    email: "sjbevins@wm.edu",
    expectPseudonym: "sjbevins",
    staffRole: "moderator",
    verified: {
      note: "Institutional email (wm.edu) confirmed by reply on 2 Sep 2026; matches the Google Scholar profile and personal homepage.",
    },
    citations: { count: 2, note: "Google Scholar, 2 Sep 2026" },
  },
  {
    email: "saulsch@gmail.com",
    expectPseudonym: "Saul Schleimer",
    // Was "moderator" when this first ran; see the correction in the header.
    // The type requires a role, so re-running this script would re-grant it:
    // do not re-run it for Saul.
    staffRole: "moderator",
    verified: {
      note: "Handle matches his GitHub (Saul Schleimer, University of Warwick, links to his homepage) and Mathstodon accounts; bio matches the Warwick staff page. Checked 2 Sep 2026.",
    },
    citations: { count: 3945, note: "Google Scholar, 2 Sep 2026" },
  },
];

async function main() {
  for (const t of TEAM) {
    const u = await prisma.user.findUnique({
      where: { email: t.email },
      select: { id: true, pseudonym: true, verified: true, staffRole: true, citations: true },
    });
    if (!u) throw new Error(`no account for ${t.email}`);
    if (u.pseudonym !== t.expectPseudonym) {
      throw new Error(`${t.email} is "${u.pseudonym}", expected "${t.expectPseudonym}" - stop and look`);
    }
    console.log(`\n${u.pseudonym}`);
    console.log(`  staffRole : ${u.staffRole ?? "-"} -> ${t.staffRole}`);
    if (t.verified) console.log(`  verified  : ${u.verified} -> true  (${t.verified.note.slice(0, 60)}...)`);
    if (t.citations) console.log(`  citations : ${u.citations ?? "-"} -> ${t.citations.count}  (${t.citations.note})`);

    if (!APPLY) continue;
    await prisma.user.update({
      where: { id: u.id },
      data: {
        staffRole: t.staffRole,
        ...(t.verified ? { verified: true, verifiedNote: t.verified.note } : {}),
        ...(t.citations ? { citations: t.citations.count, citationsNote: t.citations.note } : {}),
      },
    });
    console.log("  applied");
  }
  console.log(APPLY ? "\nAPPLIED. The About page and profiles are cached under the users tag; a deploy or the hour refreshes them." : "\nDRY RUN - pass --apply to write");
}

main().finally(() => prisma.$disconnect());
