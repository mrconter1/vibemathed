// Review of VibeGene's intermediate-curvature volume growth submission,
// 18 Aug 2026.
//
// The submission is careful and its AI disclosure is a faithful paraphrase of
// the paper's own. What it leaves out is the thing this site has an explicit
// rule about, and it is in the paper's own Addendum:
//
//   "After this manuscript was completed and circulated privately, I learned
//    of independent work by Jian Ge. Ge proves Theorem 1.1 by a different
//    method, based on heat-kernel Fisher metric and Nash entropy."
//
// Checked: arXiv:2608.13553 (Ge, "Heat kernel geometry and Gromov's volume
// growth conjecture") is v1 of 13 August 2026, one day before this paper's
// 14 August, and its abstract answers Gromov's 1986 question outright. So
// Gromov's conjecture has two independent proofs a day apart, and the first
// one public is not the AI-assisted one.
//
// The methodology's concurrent-proofs rule is exactly this case: the entry
// stays, because a model genuinely contributed to proving the thing, but it
// "may not imply a priority it lacks, so it names the competing proof in its
// result note, links it, and says plainly that the first proof of the problem
// may not have been the AI-assisted one." That is the main edit here, plus
// solveDate moving to 13 August, since the Solved field records when the
// problem fell rather than when this catalog's source appeared - the same
// call made on the Petersen entry.
//
// Two more things the paper says that the entry should carry, because they
// cut against the AI's share and the submission did not draw them out:
//
//   - GPT's contribution is to Theorem 1.1, the scalar case; the extension to
//     the whole Brendle-Hirsch-Johne intermediate-curvature family, which is
//     what the entry's title advertises, is explicitly Antonelli's own.
//   - even for Theorem 1.1 the published proof "is quite different from the
//     original argument suggested by GPT": effective rather than by
//     contradiction, and much less reliant on Kapovitch-Wilking Theorem 5.1,
//     both changes emerging from discussions with Semola, Bruè and Xu.
//
// AI co-developed still holds - a named essential step, the central inductive
// procedure, came from the model inside a human-led proof - but a reader
// should see how much of the final argument is not the model's.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "universal-volume-growth-bounds-from-positive-intermediate-curvature";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Statement",
    key: "statement",
    value:
      "In 1986 Gromov asked whether every complete $n$-dimensional Riemannian manifold with $\\mathrm{Ric} \\ge 0$ and $\\mathrm{Scal} \\ge 1$ satisfies\n$$\\mathrm{Vol}\\,B_R(p) \\le C(n)\\,R^{n-2}$$\nfor every $p$ and every $R > 0$. The three-dimensional case had been settled, and higher dimensions were known only under extra hypotheses such as nonnegative sectional curvature, noncollapsing or an injectivity-radius bound.\n\nThis paper answers the question affirmatively, as the case $m = n-2$ of a uniform family: for every $0 \\le m \\le n-2$, if $\\mathrm{Ric} \\ge 0$ and the $(m{+}1)$-intermediate curvature of Brendle-Hirsch-Johne is at least 1, then $\\mathrm{Vol}\\,B_R(p) \\le C(n,m)\\,R^m$. At $m = 1$ this gives linear volume growth under positive biRicci curvature in every dimension.",
  },
  // The Solved field records when the problem fell, not when this catalog's
  // primary source appeared: Ge's preprint is a day earlier.
  { field: "Solved", key: "solveDate", value: "2026-08-13" },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Gromov's 1986 question has two independent proofs one day apart, and the first one public is not the AI-assisted one. Jian Ge posted \"Heat kernel geometry and Gromov's volume growth conjecture\" to arXiv on 13 August 2026, proving the same theorem by a different route - heat-kernel Fisher metric and Nash entropy. This paper appeared on 14 August, its author stating he learned of Ge's work only after his own manuscript was complete. The headline axes record this paper because it is the one with an AI in the loop.\n\nWhat it adds beyond Gromov's case is the uniform family: for every $0 \\le m \\le n-2$, nonnegative Ricci plus a positive lower bound on the $(m{+}1)$-intermediate curvature forces at most $m$-dimensional volume growth. That interpolates between Ricci-type and scalar hypotheses, gives linear growth under positive biRicci curvature in every dimension at $m=1$, and yields a noncollapsed Urysohn-width bound. The author states this extension is his own contribution, not the model's.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "A five-day-old arXiv preprint, unrefereed and not formally endorsed, so this stays Unreviewed. It is not unexamined, though: the author thanks Elia Bruè, Otis Chodosh, Alessandro Cucinotta, Chao Li, Aaron Naber, Daniele Semola and Kai Xu for comments on preliminary versions, and the acknowledgments record two specific ways their comments changed the argument. That is a stronger signal than most preprints of this age carry, but comments are not endorsement, and this site ran no independent check of its own.\n\nThe strongest external evidence is indirect and worth stating: Jian Ge's independent preprint of 13 August reaches the same conclusion by heat-kernel Fisher metric and Nash entropy, methods with nothing in common with the splitting-map and Hodge-obstruction argument here. Two unrelated routes to the same statement, a day apart, is meaningful corroboration of the statement even though neither proof has been checked.",
  },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      "From the paper's own disclosure of AI tools. The work made substantial use of OpenAI's GPT-5.6 Sol at Ultra reasoning effort. GPT proposed the central inductive procedure, based on the Hodge obstruction and rank improvement, behind the proof of Theorem 1.1 - the scalar-curvature case, which is Gromov's question. Antonelli formulated and guided the problem, suggested strategies and literature, and developed the note from that strategy.\n\nHe is explicit about how far the published proof moved from the model's: it is effective, where the suggested strategy proceeded by contradiction, and it is much less reliant on Kapovitch-Wilking's Theorem 5.1 - both changes emerging from discussions with Daniele Semola, Elia Bruè and Kai Xu. He also states that the extension to the full Brendle-Hirsch-Johne intermediate-curvature family, which is the paper's general theorem, is his own contribution and not the model's.",
  },
  { field: "Significance", key: "significance", value: 38 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A forty-year-old question on Gromov's own problem list in Large Riemannian manifolds, and a workhorse of geometric analysis with a dense recent literature: Petrunin under nonnegative sectional curvature, B. Zhu in the noncollapsed setting, Munteanu-Wang, Chodosh-Li-Stryker, Wei-Xu-Zhang and Huang-Liu in dimension three, Wang-Xie-Zhu-Zhu for Ricci limits, plus the linked Urysohn-width conjecture. Above the Kinoshita conjecture at 35, a single question in a smaller corner. Below Erdos's planar unit distance conjecture at 40, which is famous outside its subfield where this one is not.",
  },
  {
    field: "Age footnote",
    key: "ageNote",
    value:
      "Posed by Gromov in 1986, in section 2.A(b) of Large Riemannian manifolds. The solved date is 13 August 2026, when Jian Ge's independent proof appeared - this paper is one day later, and the two were written without knowledge of each other.",
  },
  { field: "Source URL", key: "sourceUrl", value: "https://arxiv.org/abs/2608.14507" },
];

const LINKS = [
  {
    label: "Ge, Heat kernel geometry and Gromov's volume growth conjecture (arXiv, 13 Aug 2026)",
    url: "https://arxiv.org/abs/2608.13553",
    kind: "independent",
  },
  {
    label: "Brendle, Hirsch, Johne - A generalization of Geroch's conjecture, where intermediate curvature is introduced",
    url: "https://doi.org/10.1002/cpa.22137",
    kind: "paper",
  },
];

const MESSAGE = `Published, significance 38, with one substantial addition and a date change.

The addition is Jian Ge. The paper's own Addendum says Antonelli learned of independent work by Ge after his manuscript was complete, and that Ge proves Theorem 1.1 by a different method. I checked: arXiv:2608.13553, "Heat kernel geometry and Gromov's volume growth conjecture", v1 on 13 August, one day earlier, answering Gromov's question outright via heat-kernel Fisher metric and Nash entropy. So the conjecture has two independent proofs a day apart, and the first one public is not the AI-assisted one.

This site has a rule for exactly that. Concurrent independent proofs are an explicit exception to the no-derivative-work rule - the model genuinely contributed, so the entry stays - but it may not imply a priority it lacks. It now names Ge, links the preprint as independent work, and says plainly that the first proof may not have been the AI-assisted one. The headline axes are still this paper's. Crouzeix's conjecture is the worked example if you want the shape.

The Solved date moved to 13 August for the same reason: it records when the problem fell, not when this catalog's source appeared.

Two things from the paper I pulled in, because they cut against the AI's share and your summary did not draw them out. GPT's contribution is to Theorem 1.1, the scalar case; Antonelli states the extension to the whole Brendle-Hirsch-Johne family - what the title advertises - is his own. And even for Theorem 1.1 he writes the published proof "is quite different from the original argument suggested by GPT": effective rather than by contradiction, and much less reliant on Kapovitch-Wilking, both from discussions with Semola, Bruè and Xu. AI co-developed still holds, and your role summary was accurate; the entry now carries the qualifications too.

One thing argues for the result even unrefereed: Ge's proof shares no machinery with this one, and they agree. That is in the verification note.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}`);

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
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}: ${l.label}`);
      bad++;
    }
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, verification=${p.verification}, ai=${p.aiContribution}, model=${p.model}, publication=${p.publication}`);
  console.log(`  message: ${MESSAGE.length}/${MESSAGE_MAX}`);
  if (MESSAGE.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
    prisma.problemActivity.create({
      data: { problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null, type: "approved" },
    }),
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "decision",
              reason: "edited",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
