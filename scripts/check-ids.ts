// Read-only: which of the given arXiv ids are already in the catalog?
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const IDS = process.argv.slice(2);

async function main() {
  const all = await prisma.problem.findMany({
    select: { slug: true, name: true, status: true, sourceUrl: true, links: { select: { url: true } } },
  });
  for (const id of IDS) {
    const hit = all.find(
      (p) =>
        p.sourceUrl?.includes(id) || p.links.some((l) => l.url.includes(id)),
    );
    console.log(hit ? `IN CATALOG  ${id}  ${hit.status}  ${hit.name}` : `new         ${id}`);
  }
}

main().finally(() => prisma.$disconnect());
