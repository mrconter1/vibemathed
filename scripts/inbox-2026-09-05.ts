// Read-only: what is waiting on production. Pending submissions and open
// reports, with enough of each to triage from the terminal.
//
// Raw SQL with explicit columns throughout, because production's schema is
// behind this branch (no frontierId on ProblemReport yet) and any Prisma
// call that selects all scalars fails with P2022 there.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  type Sub = {
    slug: string; name: string; model: string; verification: string; resolution: string;
    sourceUrl: string; submitterNote: string | null; createdAt: Date; submitter: string | null;
    aiRole: string | null;
  };
  const subs = await prisma.$queryRawUnsafe<Sub[]>(`
    SELECT p.slug, p.name, p.model, p.verification, p.resolution, p."sourceUrl", p."submitterNote",
           p."createdAt", u.pseudonym AS submitter, p."aiContribution" AS "aiRole"
    FROM "Problem" p LEFT JOIN "User" u ON u.id = p."submittedById"
    WHERE p.status = 'pending' ORDER BY p."createdAt"`);
  console.log(`PENDING SUBMISSIONS: ${subs.length}`);
  for (const s of subs) {
    console.log(`\n- ${s.slug}`);
    console.log(`  ${s.name}`);
    console.log(`  ${s.createdAt.toISOString().slice(0, 16)}  by ${s.submitter ?? "anonymous"}  ${s.model}  ${s.verification}/${s.resolution}`);
    console.log(`  ${s.sourceUrl}`);
    if (s.aiRole) console.log(`  AI role: ${s.aiRole.slice(0, 300).replace(/\s+/g, " ")}`);
    if (s.submitterNote) console.log(`  note: ${s.submitterNote.slice(0, 300).replace(/\s+/g, " ")}`);
    const links = await prisma.$queryRawUnsafe<{ label: string; url: string }[]>(
      `SELECT l.label, l.url FROM "ProblemLink" l JOIN "Problem" p ON p.id = l."problemId" WHERE p.slug = $1`, s.slug);
    for (const l of links) console.log(`  link: ${l.label}  ${l.url}`);
  }

  type Rep = { id: string; slug: string | null; name: string | null; who: string | null; body: string; createdAt: Date };
  const reps = await prisma.$queryRawUnsafe<Rep[]>(`
    SELECT r.id, p.slug, p.name, COALESCE(u.pseudonym, r."userName") AS who, r.body, r."createdAt"
    FROM "ProblemReport" r LEFT JOIN "Problem" p ON p.id = r."problemId" LEFT JOIN "User" u ON u.id = r."userId"
    WHERE r.status = 'open' ORDER BY r."createdAt"`);
  console.log(`\n\nOPEN REPORTS: ${reps.length}`);
  for (const r of reps) {
    console.log(`\n- ${r.createdAt.toISOString().slice(0, 16)}  on ${r.slug ?? "(no entry)"}  by ${r.who ?? "anonymous"}  [${r.id.slice(0, 8)}]`);
    console.log(`  ${r.name ?? ""}`);
    console.log(`  ${r.body.replace(/\s+/g, " ")}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
