// A claimed complex structure on S^6 (the Hopf problem), posted 24 Aug 2026
// at alpo.ge/s6.pdf by Levent Alpoge - the same mathematician credited on
// the elliptic curve rank leaderboard entries in this catalog.
//
// Filed as a CANDIDATE, deliberately, and this needs saying plainly: this is
// the single largest claim handled by this queue so far, it directly
// contradicts an established (if previously gapped) theorem, and nobody
// independent has checked it. None of that is a verdict either way - it is
// why the tier is what it is.
//
// The paper itself (108 pages, read in full via pdftotext) carries NO AI
// disclosure anywhere - no acknowledgments section, no methods note, not one
// occurrence of "Claude", "Anthropic", "AI" or any paraphrase of them in the
// entire text. The only disclosure is the author's own public post
// (reproduced by Digg's coverage, linked below, since no stable direct URL
// to the tweet itself could be confirmed rather than guessed): "claude
// really contains multitudes :D Does S^6 admit a complex structure? Yup."
// That is vague about division of labour in exactly the way the elliptic
// curve entries' disclosures are, so it is classified the same way,
// ai-co-developed, for the same reason: a vague disclosure takes the lower
// tier, not the absent one, because it IS a first-party statement crediting
// the model, just not a specific one.
//
// What was checked here: that the paper is real (a genuine 108-page
// manuscript with introduction, eight numbered sections, two appendices and
// a 60-entry bibliography of real, checkable citations - Kodaira, Mumford,
// Orlik, Hopf's own 1948 paper, and the Campana-Demailly-Peternell papers it
// contradicts), that it explicitly states and locates its contradiction of
// [CDP20, Cor. 2.3] rather than ignoring it (a mark of the paper knowing
// what it is claiming, not evidence that the claim is correct), and that no
// refutation or independent confirmation has surfaced yet in the venues
// checked (Hacker News discussion, a Chinese-language math Q&A). What was
// NOT checked, because it is far beyond an audit performable here: the
// mathematics itself. This is 108 pages of monodromy of triangle groups,
// Kodaira logarithmic transforms, Mumford-style toric degeneration and a
// Seifert-fibred homology computation, with no Lean formalisation and no
// computational certificate of any kind to check against - unlike every
// other entry handled by this queue today, there is nothing here that
// exact arithmetic or a kernel check could confirm or refute.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "modular-family-of-2-tori-as-a-complex-structure-on-s6";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);
const LINK_LABEL_MAX = 120;

const FIELDS: Record<string, unknown> = {
  name: "The $(3,4,\\infty)$ Modular Family of 2-Tori as a Complex Structure on $S^6$",
  shortName: "A Complex Structure on $S^6$",
  fieldGroup: "Geometry & topology",
  field: "Complex geometry; differential topology",
  statement:
    "Hopf's problem, posed in 1948: does the six-sphere $S^6$ admit an integrable complex structure? $S^6$ is one of only two spheres carrying an almost complex structure at all (the other is $S^2$), from the octonions' multiplication, but almost complex structures need not be integrable, and whether that one - or any other - integrates has stood open for 78 years through a history of disputed attempts, including a widely discussed 2016 argument by Atiyah that did not hold up. This paper claims yes: it builds an explicit compact complex threefold $X$, fibred over $\\mathbb{P}^1$ by complex 2-tori degenerating at three points, and argues $X$ is simply connected with the integral homology of $S^6$, hence diffeomorphic to it.",
  posedBy: "Heinz Hopf",
  yearPosed: 1948,
  solveType: "proved",
  resolution: "candidate",
  resolutionMethod: "construction",
  solveDate: "2026-08-24",
  model: "Claude",
  modelMaker: "Anthropic",
  humanCollaborators: ["Levent Alpöge"],
  aiRole:
    "The manuscript itself, 108 pages read in full here, contains no AI disclosure of any kind: no acknowledgments section, no methods note, and not one occurrence of \"Claude\", \"Anthropic\", \"AI\" or a paraphrase anywhere in its text. The only disclosure is the author's own public post, reproduced by third-party tech coverage since no stable direct link to it could be confirmed: \"Please welcome to the world a beautiful new geometric object... claude really contains multitudes :D Does S^6 admit a complex structure? Yup.\" That names the model and credits it substantively but says nothing about which parts of a 108-page argument it produced, checked, or merely discussed - the same shape of vague, first-party, off-paper disclosure this catalog already has from this author on the elliptic-curve rank entries, classified the same way there.",
  aiContribution: "ai-co-developed",
  verification: "unreviewed",
  verificationNote:
    "Read here in full via pdftotext on 24 August 2026, hours after it was posted: a genuine 108-page manuscript with an abstract, eight numbered sections, two appendices and a 60-item bibliography of real, checkable citations (Kodaira, Mumford, Orlik, Hopf's original 1948 paper, and the Campana-Demailly-Peternell papers it contradicts). It states its conflict with [CDP20, Cor. 2.3] explicitly rather than ignoring it, and argues a specific point of divergence (that $R^2f_*(T_X\\otimes L)=0$ for every line bundle $L$, tied to the non-normality of one singular fibre) - a paper aware of what it is claiming, which is not evidence that the claim holds. No refutation or independent confirmation has surfaced in the venues checked (a Hacker News thread, exploratory and non-technical so far; a Chinese-language math Q&A). No Lean formalisation and no computational certificate accompanies it, so unlike every other entry this queue has handled, there is no kernel check or exact-arithmetic recomputation available to perform. The mathematics itself - monodromy of the $(3,4,\\infty)$ triangle group, Kodaira logarithmic transforms, a Mumford-style toric degeneration, a Seifert-fibred homology computation - was not and could not be independently verified here; this classification reflects that fact, not a judgement on the argument's quality.",
  significance: 65,
  significanceNote:
    "One of the most famous named open problems in complex geometry, open since Hopf posed it in 1948: $S^6$ is one of only two spheres admitting an almost complex structure, and whether it integrates has resisted a documented history of failed attempts, most publicly Atiyah's disputed 2016 argument, itself widely covered as a controversy. Above the sofic-groups/Connes-rigidity band (45-60) for that age and failure history; below the handful of problems with true general-public fame.",
  resultNote:
    "Claims an explicit compact complex threefold $X$, fibred over $\\mathbb{P}^1$ by complex 2-tori via period functions on the $(3,4,\\infty)$ orbifold, degenerating to a del Pezzo-of-degree-six fibre (identified opposite sides of its hexagon) at one point and to bielliptic multiple fibres of multiplicities 3 and 4 at the other two. Argues $X$ is simply connected with $H_*(X;\\mathbb{Z})=H_*(S^6;\\mathbb{Z})$, hence diffeomorphic to $S^6$, with algebraic dimension exactly 1. This directly contradicts [CDP20, Cor. 2.3], a published (and once-corrected) theorem; the paper states this and argues where the two accounts diverge, rather than overlooking it. Posted hours before this entry, with no independent check, no formalisation, and no refutation yet in any venue found. Filed as a candidate specifically because none of that has happened, not because a problem with the argument has been found.",
  publication: "preprint",
  sourceUrl: "https://alpo.ge/s6.pdf",
  sourceName: "Alpöge, The $(3,4,\\infty)$ modular family of 2-tori, completed at its three special points, is a complex structure on $S^6$",
  renownLangs: 0,
};

const LINKS = [
  {
    label: "Agricola, Bazzoni, Goertsches, Konstantis, Rollenske - On the history of the Hopf problem",
    url: "https://arxiv.org/pdf/1708.01068",
    kind: "problem-record",
  },
  {
    label: "Campana, Demailly, Peternell - the corrigendum this paper contradicts",
    url: "https://arxiv.org/abs/1904.11179",
    kind: "paper",
  },
  {
    label: "Alpöge's announcement, quoted in full, via Digg's coverage",
    url: "https://digg.com/tech/5ngavqc7",
    kind: "announcement",
  },
  {
    label: "Hacker News discussion",
    url: "https://news.ycombinator.com/item?id=49412947",
    kind: "discussion",
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  let bad = 0;
  for (const [k, v] of Object.entries(FIELDS)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      console.log(`  ${k} OVER BY ${v.length - lim} (${v.length}/${lim})`);
      bad++;
    } else if (lim && typeof v === "string") {
      console.log(`  ${k}: ${v.length}/${lim}`);
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) {
      console.log(`  LINK LABEL OVER BY ${l.label.length - LINK_LABEL_MAX}: ${l.label}`);
      bad++;
    }
  }
  if (bad) throw new Error("limits exceeded");

  const existing = await prisma.problem.findUnique({ where: { slug: SLUG } });
  console.log(`\n### ${SLUG}${existing ? "  (EXISTS - skip)" : ""}`);
  console.log(`    ${FIELDS.name}`);
  console.log(
    `    ${FIELDS.solveType}/${FIELDS.resolution}  sig=${FIELDS.significance}  ` +
    `ai=${FIELDS.aiContribution}  ver=${FIELDS.verification}  ` +
    `method=${FIELDS.resolutionMethod}  pub=${FIELDS.publication}`,
  );
  console.log(`    ${LINKS.length} links`);

  if (existing) return;
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.create({
      data: {
        slug: SLUG,
        ...(FIELDS as object),
        status: "published",
        links: { create: LINKS.map((l, position) => ({ ...l, position })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: {
        problem: { connect: { slug: SLUG } },
        user: { connect: { id: admin.id } },
        userName: admin.pseudonym ?? null,
        type: "created",
      },
    }),
  ]);
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`    CREATED - ${published} published`);
}

main().finally(() => prisma.$disconnect());
