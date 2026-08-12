// Read-only: dump every pending submission with all reviewable fields.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.problem.findMany({
    where: { status: "pending" },
    include: { links: true },
    orderBy: { createdAt: "asc" },
  });
  for (const p of pending) {
    console.log(JSON.stringify(p, null, 2));
    console.log("-".repeat(70));
  }
  console.log(`${pending.length} pending`);
}

main().finally(() => prisma.$disconnect());
