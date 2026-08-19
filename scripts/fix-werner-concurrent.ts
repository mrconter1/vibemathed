// The Werner two-copy distillability entry names one of four concurrent
// papers in its prose. 19 Aug 2026.
//
// Balázs Pozsgay, an author of one of the other three, pointed this out
// publicly and was polite enough to call it "the format". It is not the
// format: the methodology's concurrent-proofs rule already says such an entry
// "names the competing proof in its result note, links it, and says plainly
// that the first proof of the problem may not have been the AI-assisted one".
// The links were there; the result note was one line and named nobody, so the
// entry was reading as though Fu, Gao and Park's paper were the account of
// record.
//
// Four papers, five days:
//   2607.21367  23 Jul  Fu, Gao, Park              (the entry's source)
//   2607.23416  26 Jul  Song, Chen
//   2607.24309  27 Jul  Fraser, Huber, Pozsgay, Vona
//   2607.24479  27 Jul  Bharti, Gajjala, Haug
//
// Pozsgay also states his group had the AI proof before the first paper
// appeared. That is not something this site can verify, so it is recorded as
// his statement rather than asserted, which is the same treatment the Gromov
// entry gives Antonelli's account of learning about Ge's work.
//
// Link labels gain the author names too: four links all labelled "independent"
// with a bare arXiv id told a reader nothing about who was involved.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "werner-two-copy-distillability";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Two-copy distillable if and only if already one-copy distillable.\n\nFour independent papers settled this within five days of each other, and no single one of them is the account of record. Fu, Gao and Park posted first on 23 July (arXiv:2607.21367), followed by Song and Chen on 26 July (arXiv:2607.23416), then on 27 July both Fraser, Huber, Pozsgay and Vona (arXiv:2607.24309) and Bharti, Gajjala and Haug (arXiv:2607.24479). The headline axes here follow the first posting, which is a filing convention and not a claim about who solved it.\n\nPozsgay has stated publicly that his group had their AI-assisted proof before the first paper appeared. This site cannot verify a private completion date, so that is recorded as his account rather than as a finding. All four are linked below.",
  },
];

const LINKS = [
  {
    label: "Fu, Gao and Park - A solution to 2-copy distillability of Werner states (23 Jul, first posted)",
    url: "https://arxiv.org/abs/2607.21367",
    kind: "paper",
  },
  {
    label: "Song and Chen - A partial-trace matrix inequality and Werner-state distillability (26 Jul)",
    url: "https://arxiv.org/abs/2607.23416",
    kind: "independent",
  },
  {
    label: "Fraser, Huber, Pozsgay and Vona - two-copy distillability and a new partial trace bound (27 Jul)",
    url: "https://arxiv.org/abs/2607.24309",
    kind: "independent",
  },
  {
    label: "Bharti, Gajjala and Haug - sharp partial-trace inequalities (27 Jul)",
    url: "https://arxiv.org/abs/2607.24479",
    kind: "independent",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");
  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "published") throw new Error(`${SLUG} is ${p.status}`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const lim = LIMITS.get(e.key);
    if (lim && typeof e.value === "string" && e.value.length > lim) {
      console.log(`  ${e.key} OVER BY ${e.value.length - lim} (${e.value.length}/${lim})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }
  for (const l of LINKS) if (l.label.length > 120) { console.log(`  link label OVER: ${l.label}`); bad++; }

  console.log(`${SLUG}: update\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 100 ? `${s.slice(0, 100)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length} (now labelled with authors and dates)`);
  if (bad) throw new Error("fix the flagged fields before applying");
  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: { ...data, links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) } },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null,
        type: "updated" as const, field: c.field, oldValue: c.oldValue, newValue: c.newValue,
      })),
    }),
  ]);
  console.log("APPLIED");
}

main().finally(() => prisma.$disconnect());
