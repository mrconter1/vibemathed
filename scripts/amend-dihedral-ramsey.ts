// Amendment to the dihedral-Ramsey entry, 13 Aug 2026.
//
// The review recorded one unsubstantiated claim: a DRAT-certified SAT
// recomputation for b = 2..7, which the repository at review time did not
// contain. The submitter has since published it (commit 01a50c7, sat/), and
// promised a re-check, so here it is.
//
// The DRAT files were NOT replayed - drat-trim is not available here, and
// replaying a proof someone shipped is the weaker check anyway. Instead all
// twelve published CNFs were re-solved with CaDiCaL via PySAT. Every verdict
// matches their kissat logs: SAT at n = 2b-2 and UNSAT at n = 2b-1 for each
// b = 2..7. Each of the six claimed-SAT instances had its published witness
// substituted back into the CNF clause by clause, and all satisfy. Best of
// all, the b = 3 legs agree with this site's own exhaustive enumeration from
// the original review (a colouring exists at n = 4, none at n = 5 over all
// 1,024 colourings), which anchors their encoder against a computation made
// independently of it.
//
// The certificates are regenerated rather than the review-time originals,
// which the submitter disclosed unprompted. That is recorded, and it costs
// nothing here: the verdicts were re-derived from the instances with a
// different solver, so nothing rests on when the files were produced.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path";

// Anchored on the note as it currently stands, which is a tightened rewrite
// of what the review wrote - so this appends to the live text rather than
// restoring an older draft over the top of someone's edit.
const OLD_TAIL =
  "Two things unconfirmed: the claimed DRAT-certified SAT recomputation for b = 2..7 has no CNF, certificate or solver log in the ten-file repository; and there is no human peer review, this being a self-submission of AI-produced work reviewed by AI agents inside the producing pipeline.";

const NEW_TAIL =
  "The SAT claim was unconfirmed at review time and substantiated the same day: the submitter published the certificates at commit 01a50c7 and this site re-checked them. The DRAT files were not replayed, since replaying a shipped proof is the weaker check; instead all twelve published CNFs were re-solved here with CaDiCaL via PySAT, and every verdict matches the submitter's kissat logs - satisfiable at n = 2b-2 and unsatisfiable at n = 2b-1 for each b = 2..7, which is R_dih(P3alt, K_b) = 2b-1 on the raw dihedral encoding. The six satisfiable instances also had their published witnesses substituted back clause by clause, and all satisfy; and the b = 3 legs agree with this site's own exhaustive enumeration from the original review, which anchors the submitter's encoder against a computation made independently of it. The certificates are regenerated rather than the review-time originals, disclosed unprompted by the submitter, which costs nothing here because the verdicts were re-derived from the instances rather than read off the files. Still unconfirmed: there is no human peer review, this being a self-submission of AI-produced work reviewed by AI agents inside the producing pipeline.";

const NEW_LINK = {
  label: "sat/ - regenerated CNFs, DRAT certificates, witnesses and solver logs (commit 01a50c7)",
  url: "https://github.com/ZestyWombat854/dihedral-ramsey/tree/01a50c7/sat",
  kind: "code",
};

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({
    where: { slug: SLUG },
    include: { links: true },
  });
  if (!p?.verificationNote) throw new Error("no entry or no verification note");
  if (!p.verificationNote.includes(OLD_TAIL)) {
    throw new Error("verification note does not end as expected - has it been edited?");
  }
  const next = p.verificationNote.replace(OLD_TAIL, NEW_TAIL);

  console.log(`${SLUG}`);
  console.log(`  verification note: ${p.verificationNote.length} -> ${next.length} chars`);
  console.log(`  links: ${p.links.length} -> ${p.links.length + 1}`);
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        verificationNote: next,
        links: { create: [{ ...NEW_LINK, position: p.links.length }] },
      },
    }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "Verification note",
        oldValue: "SAT recomputation for b = 2..7 unsubstantiated: no CNF, certificate or log in the repository",
        newValue: "certificates published at 01a50c7 and re-checked here: all twelve verdicts re-derived with CaDiCaL, six witnesses re-substituted, b = 3 legs match our own enumeration",
      },
    }),
  ]);
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
