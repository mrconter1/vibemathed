// One-off review batch for the five submissions pending on 12 Aug 2026.
//
// Replicates what the /review UI does through `approveSubmission` /
// `rejectSubmission`: field edits are logged as "updated" activity, the
// decision flips `status` and writes `reviewedAt`/`reviewMessage`/
// `reviewReason`, an "approved"/"rejected" activity row is added, and the
// submitter gets a "decision" direct message. The only thing it cannot do is
// call `updateTag`, which is a Next.js runtime API - every affected read is
// `cacheLife("minutes")`, so the site self-heals within a minute.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Edit {
  field: string; // human label, as the changelog shows it
  key: string; // Prisma column
  value: unknown;
}

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Edit[];
  links?: { label: string; url: string; kind: string }[];
}

const DECISIONS: Decision[] = [
  {
    slug: "borsuk-conjecture-lowest-ever-counterexample-n-63",
    action: "approve",
    reason: "edited",
    edits: [
      {
        field: "Collaborators",
        key: "humanCollaborators",
        value: ["Nicholas Konz"],
      },
      {
        field: "Verification note",
        key: "verificationNote",
        value:
          "Reproduced by this site on 12 August 2026. We ran the author's stand-alone verifier against the published 321x63 coordinate file and independently confirmed all of it: affine dimension exactly 63, a three-value squared-distance spectrum of (53-sqrt(222))/156, 1/4 and 1/3, and independence number 5 for the diameter graph by Bron-Kerbosch over all 321 points. That forces ceil(321/5) = 65 parts where Borsuk allows 64. The 1/4-to-1/3 gap is far wider than any floating-point tolerance, so the computed diameter graph is the exact one. Claude's own checks were an exact rational and algebraic certificate over Q(sqrt(222)), two independently written max-clique implementations, an ILP solver and CP-SAT. No independent expert has reviewed the write-up, and it is not peer-reviewed or on arXiv.",
      },
    ],
    message:
      "Published. I did more than take this one on trust: I downloaded the 321x63 coordinate file and ran the verifier here, and it reproduces exactly - affine dimension 63, alpha = 5 on the diameter graph by Bron-Kerbosch, so ceil(321/5) = 65 > 64. The distances match the closed forms (53-sqrt(222))/156, 1/4 and 1/3 to nine decimals, and the gap between the distance classes is far too wide for the float threshold to be misclassifying edges. Site-confirmed is earned rather than claimed now, and I rewrote the verification note to say what we ran rather than only what Claude ran. I also added Nicholas Konz as a collaborator, since he set the problem and hosts the artifact. Left at Partial: dimension 63 is settled, but Borsuk's threshold for 4 <= n <= 62 is not. Thanks for sending this one, it is the best-evidenced submission the site has had.",
  },
  {
    slug: "online-shadow-tomography-matching-the-classical-bounds",
    action: "approve",
    reason: "edited",
    edits: [
      { field: "Model", key: "model", value: "ChatGPT 5.6-Sol Pro" },
      { field: "Status", key: "resolution", value: "resolved" },
      {
        field: "Verification note",
        key: "verificationNote",
        value:
          "Unreviewed preprint. The authors state they studied, refined and verified the model's ideas themselves and take full responsibility for every claim, proof and citation; that is the authors checking their own work, so it stays Unreviewed until someone independent looks. Recorded as Resolved rather than Partial because the stated target - matching the classical Adaptive Data Analysis rates - is fully achieved by Theorems 1.2 and 1.3. What remains open is whether those rates are optimal, which was never the question this entry records.",
      },
    ],
    message:
      "Published, with two edits. The model string is now the exact one the paper names, ChatGPT 5.6-Sol Pro, so it matches the disclosure verbatim. I also moved this from Partial to Resolved: the entry's own statement is matching the best classical bounds, and the paper closes that gap outright rather than narrowing it. What stays open is optimality of those rates, which was never the stated target. The AI-discovered tier is unambiguous here, the Statement on AI use is about as clear as disclosures get. Thanks for catching this one.",
  },
  {
    slug: "a-counterexample-to-the-howland-kato-problem-for-positive-commutators",
    action: "approve",
    reason: "edited",
    edits: [
      {
        field: "AI contribution",
        key: "aiContribution",
        value: "ai-co-developed",
      },
      {
        field: "What the AI did",
        key: "aiRole",
        value:
          'The paper discloses only "The authors acknowledge the use of AI tools. All mathematical arguments and proofs in the final manuscript were checked and written by the authors." Co-author Paata Ivanisvili (@PI010101, Professor of Mathematics at UC Irvine) has since said publicly that "AI deserves a fair amount of credit for finding" the key identity, and, asked which model: "Grok 4.5 in Cursor with an agent found a non-symmetric counterexample f(x) = arctan(x/2) and g(x) = tanh(x)/2 + tanh(3x)/2 which works and is correct. However, in the final manuscript we implemented symmetric example." So the model found a valid counterexample, but not the symmetric one the paper is built around, and the positivity proof is the authors\' own.',
      },
    ],
    links: [
      {
        label: "Author's announcement (X)",
        url: "https://x.com/PI010101/status/2087250049000734961",
        kind: "announcement",
      },
      {
        label: "Author on Grok 4.5's role (X)",
        url: "https://x.com/PI010101/status/2087263984433111395",
        kind: "discussion",
      },
    ],
    message:
      "Published, one tier up from where you set it. I pulled both X posts and confirmed the account is Paata Ivanisvili himself, a co-author, so this is an author disclosure rather than a bystander's guess - good catch including them, the paper alone would not have been enough. AI-assisted undersells it: the model found a working counterexample, which is not tooling or proofreading. I stopped short of AI-discovered because the counterexample in the manuscript is the authors' symmetric one, not Grok's, the fourteen-page positivity proof is theirs, and \"a fair amount of credit\" is a hedge - so AI co-developed is where it sits. I also gave the two bare X.com links real labels.",
  },
  {
    slug: "independence-of-the-octahedron-axiom-tr4-in-triangulated-categories",
    action: "reject",
    reason: "no-ai-contribution",
    message:
      "Thanks for sending this, and for the MathOverflow context - but I have to turn it down, on three separate grounds.\n\nThe first is decisive on its own: nothing in the paper or the verification bundle says an AI found this. I read both. The only AI mention is an \"external AI-assisted adversarial audit\" that reran the certificates, which is a model checking a finished proof - explicitly below the bottom tier here. GPT-5.6 Sol appears nowhere in either file.\n\nSecond, the paper is anonymous. The Zenodo creator field is the literal placeholder \"Name, Author\" and the PDF byline is \"AUTHOR NAME\", so there is nobody to attribute the claim to.\n\nThird, it looks scooped by humans: arXiv 2608.09777 (Chen, Liu, Lu, Zhang, 10 Aug 2026) constructs a pre-triangulated category that is not triangulated, with no AI involved, also via preprojective algebras. MathOverflow's moderators separately deleted the answer linking this Zenodo record.\n\nThe underlying question is a great one for this record, so if a named, AI-attributed resolution appears, please do send it.",
  },
  {
    slug: "counterexamples-to-the-landis-conjecture-in-dimensions-three-and-higher",
    action: "reject",
    reason: "no-ai-contribution",
    message:
      "Thanks for this, and you were straight about the weak point yourself by leaving the model as Unspecified. That is exactly why I am turning it down. The result qualifies easily - Landis asked the question, Frank and Ivanisvili answered it - but the paper's whole AI disclosure is \"The authors acknowledge the use of AI tools\", with no model and no role, followed by \"All mathematical arguments and proofs in the final manuscript were checked and written by the authors\". That is compatible with a model doing nothing mathematical at all, and the inclusion test needs one substantively in the loop.\n\nI did go looking for more. Ivanisvili has been specific in public elsewhere - naming Grok 4.5 for the Kato counterexample you also sent, and for the 4-sphere hypercontractivity example - but I found nothing from him about Landis.\n\nSo this is a not-yet rather than a no. If he says what the model did here, or a later version attributes a step, resubmit it and I will take it.",
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true, pseudonym: true },
  });
  if (!admin) throw new Error(`no user for ${ADMIN_EMAIL}`);
  console.log(`acting as ${admin.pseudonym ?? "(no pseudonym)"} <${ADMIN_EMAIL}>\n`);

  for (const d of DECISIONS) {
    const p = await prisma.problem.findUnique({
      where: { slug: d.slug },
      include: { links: { orderBy: { position: "asc" } } },
    });
    if (!p) {
      console.log(`!! MISSING ${d.slug}\n`);
      continue;
    }
    if (p.status !== "pending") {
      console.log(`!! ${d.slug} is already ${p.status}, skipping\n`);
      continue;
    }

    console.log(`### ${d.action.toUpperCase()} ${d.slug}`);
    console.log(`    reason: ${d.reason}`);

    // Only record a change where the value actually moves, exactly as the
    // edit action does - an unchanged field must not appear in the changelog.
    const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
    const data: Record<string, unknown> = {};
    for (const e of d.edits ?? []) {
      const before = (p as unknown as Record<string, unknown>)[e.key];
      const beforeStr = Array.isArray(before) ? before.join(", ") : (before as string | null);
      const afterStr = Array.isArray(e.value) ? e.value.join(", ") : (e.value as string | null);
      if ((beforeStr ?? "") === (afterStr ?? "")) {
        console.log(`    = ${e.field}: unchanged`);
        continue;
      }
      data[e.key] = e.value;
      changes.push({
        field: e.field,
        oldValue: beforeStr ?? null,
        newValue: afterStr ?? null,
      });
      const short = (s: string | null) =>
        !s ? "(empty)" : s.length > 70 ? `${s.slice(0, 70)}...` : s;
      console.log(`    ~ ${e.field}: ${short(beforeStr ?? null)}  ->  ${short(afterStr ?? null)}`);
    }

    if (d.links) {
      console.log(`    ~ links (${p.links.length} -> ${d.links.length}):`);
      for (const l of d.links) console.log(`        [${l.kind}] ${l.label} - ${l.url}`);
      changes.push({
        field: "Links",
        oldValue: p.links.map((l) => l.label).join(", ") || null,
        newValue: d.links.map((l) => l.label).join(", "),
      });
    }

    console.log(`    message (${d.message.length} chars):`);
    console.log(
      d.message
        .split("\n")
        .map((l) => `      ${l}`)
        .join("\n"),
    );
    console.log();

    if (!APPLY) continue;

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: p.id },
        data: {
          ...data,
          ...(d.links
            ? {
                links: {
                  deleteMany: {},
                  create: d.links.map((l, position) => ({ ...l, position })),
                },
              }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        },
      }),
      ...(changes.length
        ? [
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
          ]
        : []),
      prisma.problemActivity.create({
        data: {
          problemId: p.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
      prisma.directMessage.create({
        data: {
          userId: p.submittedById,
          senderId: admin.id,
          senderName: admin.pseudonym ?? null,
          kind: "decision",
          reason: d.reason,
          body: d.message,
          problemId: p.id,
        },
      }),
    ]);
    console.log(`    APPLIED\n`);
  }

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`${APPLY ? "done" : "DRY RUN"} - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
