// How many published entries use LaTeX's \( \) / \[ \] math delimiters, which
// the site's tokenizer did not recognise before September 2026. Read-only.
//
// position() rather than Prisma's `contains`: LIKE treats a backslash as its
// escape character, so `contains: "\\("` silently matches a plain "(" and
// reports most of the catalog.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OPEN_PAREN = String.fromCharCode(92) + "(";
const OPEN_BRACKET = String.fromCharCode(92) + "[";
const FIELDS = [
  "statement",
  "resultNote",
  "verificationNote",
  "aiRole",
  "significanceNote",
] as const;

async function connectWithRetry() {
  for (let a = 1; a <= 6; a++) {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw new Error("database unreachable");
}

async function count(col: string, pat: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<{ n: number }[]>(
    `SELECT count(*)::int AS n FROM "Problem" WHERE status = 'published' AND position($1 in coalesce("${col}", '')) > 0`,
    pat,
  );
  return rows[0].n;
}

async function main() {
  await connectWithRetry();
  for (const [label, pat] of [
    ["inline  \\( \\)", OPEN_PAREN],
    ["display \\[ \\]", OPEN_BRACKET],
  ] as const) {
    const parts = await Promise.all(FIELDS.map((f) => count(f, pat)));
    console.log(
      `${label}: ` + FIELDS.map((f, i) => `${f}=${parts[i]}`).join(" "),
    );
  }
  const rows = await prisma.$queryRawUnsafe<{ slug: string }[]>(
    `SELECT slug FROM "Problem" WHERE status = 'published'
       AND (position($1 in coalesce(statement,'')) > 0 OR position($1 in coalesce("resultNote",'')) > 0)
     ORDER BY "createdAt" DESC LIMIT 15`,
    OPEN_PAREN,
  );
  console.log(
    `\naffected entries (newest first): ${rows.length ? rows.map((r) => r.slug).join(", ") : "none"}`,
  );
}

main().finally(() => prisma.$disconnect());
