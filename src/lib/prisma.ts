import { PrismaClient } from "@prisma/client";

// Reuse one client across dev hot reloads - a fresh PrismaClient per reload
// exhausts the connection pool within a few edits.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
