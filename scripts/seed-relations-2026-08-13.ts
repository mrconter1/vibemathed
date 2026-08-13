// The first typed relations, 13 Aug 2026 - the edges the catalog has been
// carrying in prose because there was nowhere structural to put them.
//
// Every edge below was verified against the entries before being written:
// the SSUF series says "Part III" in its own result note, the 1.28249 entry's
// significance note names the Dinitz-Garg-Goemans disproof as what left the
// question open, the Sendov entry's verification note derives Phelps-
// Rodriguez from the same digestion, and the Connes ICC entry resolves a
// special case of the conjecture the other entry claims in general.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MAX_RELATIONS, RELATION_NOTE_MAX, relationKind } from "../src/lib/relation-kinds";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const SSUF3 = "1-17353-planar-lower-bound-and-exact-local-envelopes-for-cost-preserving-single-";
const SSUF2 = "1-28249-lower-bound-and-partial-upper-bounds-for-cost-preserving-single-source-u";
const DGG = "dinitz-garg-goemans-unsplittable-flow";
const GADGET = "exact-two-scenario-ssuf-bound-on-the-four-terminal-planar-gadget";
const SENDOV = "sendov-s-conjecture";
const PHELPS = "phelps-rodriguez-conjecture";
const CONNES = "connes-rigidity-conjecture";
const CONNES_ICC = "connes-rigidity-icc-property-t";

interface Edge {
  from: string;
  to: string;
  kind: string;
  note: string;
}

const EDGES: Edge[] = [
  {
    from: SSUF3,
    to: SSUF2,
    kind: "continues",
    note: "Part III of the same programme. Part II's 1.28249 record lower bound becomes an exact local envelope of the general theory built here.",
  },
  {
    from: SSUF2,
    to: DGG,
    kind: "builds-on",
    note: "The optimal-constant question this entry attacks is exactly what the Dinitz-Garg-Goemans disproof left open.",
  },
  {
    from: GADGET,
    to: DGG,
    kind: "related",
    note: "A scenario-count ladder on one fixed four-terminal planar gadget, in the same cost-preserving unsplittable-flow setting the disproof opened up.",
  },
  {
    from: PHELPS,
    to: SENDOV,
    kind: "same-work",
    note: "Both fall to Tao's digestion of Mazur's argument: the interior form of Sendov's conjecture resolves Phelps-Rodriguez in full generality.",
  },
  {
    from: CONNES,
    to: CONNES_ICC,
    kind: "generalizes",
    note: "The full rigidity conjecture, of which the other entry settles the ICC property (T) case - independently and concurrently, per that paper.",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const slugs = [...new Set(EDGES.flatMap((e) => [e.from, e.to]))];
  const rows = await prisma.problem.findMany({
    where: { slug: { in: slugs }, status: "published" },
    select: { id: true, slug: true, name: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length) throw new Error(`not published or not found: ${missing.join(", ")}`);

  for (const e of EDGES) {
    if (!relationKind(e.kind)) throw new Error(`unknown kind ${e.kind}`);
    if (e.note.length > RELATION_NOTE_MAX) {
      throw new Error(`note over ${RELATION_NOTE_MAX} for ${e.from} -> ${e.to}`);
    }
  }
  const perFrom = new Map<string, number>();
  for (const e of EDGES) perFrom.set(e.from, (perFrom.get(e.from) ?? 0) + 1);
  for (const [slug, n] of perFrom) {
    const existing = await prisma.problemRelation.count({
      where: { from: { slug } },
    });
    if (existing + n > MAX_RELATIONS) throw new Error(`${slug} would exceed ${MAX_RELATIONS}`);
  }

  for (const e of EDGES) {
    const spec = relationKind(e.kind)!;
    console.log(`${e.from}\n  --${e.kind} (${spec.forward} / ${spec.inverse})--> ${e.to}`);
    console.log(`  "${e.note}"\n`);
  }

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  for (const e of EDGES) {
    const from = bySlug.get(e.from)!;
    const to = bySlug.get(e.to)!;
    const position = await prisma.problemRelation.count({ where: { fromId: from.id } });
    await prisma.$transaction([
      prisma.problemRelation.upsert({
        where: { fromId_toId_kind: { fromId: from.id, toId: to.id, kind: e.kind } },
        create: { fromId: from.id, toId: to.id, kind: e.kind, note: e.note, position },
        update: { note: e.note },
      }),
      // One changelog row on the drawing side; the other entry's page shows
      // the edge but its history stays about its own edits.
      prisma.problemActivity.create({
        data: {
          problemId: from.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated",
          field: "Related entries",
          oldValue: null,
          newValue: `${e.kind} -> ${e.to} (${e.note})`,
        },
      }),
    ]);
  }
  const total = await prisma.problemRelation.count();
  console.log(`APPLIED - ${total} relations in the table`);
}

main().finally(() => prisma.$disconnect());
