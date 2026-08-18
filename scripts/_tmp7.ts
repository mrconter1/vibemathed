import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.problem.findFirst({ where: { problemNumber: 424 }, include: { links: true } });
  if (!p) { console.log("no #424"); return; }
  console.log(JSON.stringify({ slug: p.slug, name: p.name, shortName: p.shortName, statement: p.statement, significance: p.significance, significanceNote: p.significanceNote, resolution: p.resolution, verification: p.verification, model: p.model, solveDate: p.solveDate, yearPosed: p.yearPosed, posedBy: p.posedBy, renownLangs: p.renownLangs, renownNote: p.renownNote, resultNote: p.resultNote, sourceUrl: p.sourceUrl, links: p.links.map(l => `${l.kind}|${l.label}|${l.url}`) }, null, 1));
}
main().finally(() => prisma.$disconnect());
