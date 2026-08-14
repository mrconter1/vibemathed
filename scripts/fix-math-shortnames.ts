// Put math back into the shortNames that were flattened, 14 Aug 2026.
// shortName now renders $...$ everywhere except chart axes (deTeX there).
// Dry run by default; --apply to write.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const FIXES: { slug: string; to: string }[] = [
  { slug: "dihedral-ramsey-numbers-of-the-alternating-a-path-versus-k-b-for-every-a-4-1-a-1", to: "$R_{dih}(P_a^{alt},K_b)=1+(a-1)(b-1)$, $a\ge4$" },
  { slug: "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path", to: "$R_{dih}(P_3^{alt},K_b)=2b-1$" },
  { slug: "sop-2-sop-3", to: "$SOP_2 = SOP_3$" },
  { slug: "four-color-rado-number-of-x-y-c-z-40c-41", to: "4-color Rado: $R(c)=40c+41$" },
  { slug: "nineteen-exact-reflective-and-dihedral-ramsey-numbers-from-damnjanovic-dordevic-", to: "19 exact $R_{dih}$/$R_{ref}$ values (DD26)" },
  { slug: "t-edge-balanced-existence", to: "$t$-edge-balanced graphs" },
  { slug: "kirby-4-37-irreducible-projective-plane", to: "Irreducible projective plane in $S^4$" },
  { slug: "double-covers-discrete-box", to: "Double covers of $\{0,1,2\}^d$" },
  { slug: "hessian-conjecture-five-variable-counterexample", to: "Hessian conjecture, $n=5$" },
  { slug: "primariness-lp-l1", to: "Primariness of $L_p(L_1)$" },
  { slug: "davenport-constant-heisenberg-125", to: "Davenport, $H_{125}$" },
  { slug: "symmetrically-colored-k-ap-bound", to: "Symmetric $k$-AP colorings" },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");
  const plan: { id: string; slug: string; before: string; after: string }[] = [];
  for (const f of FIXES) {
    if (f.to.length > 60) throw new Error(`${f.slug} over 60: ${f.to.length}`);
    const p = await prisma.problem.findUnique({ where: { slug: f.slug } });
    if (!p) throw new Error(`no entry ${f.slug}`);
    if (p.shortName === f.to) continue;
    plan.push({ id: p.id, slug: f.slug, before: p.shortName, after: f.to });
  }
  for (const w of plan) console.log(`${w.slug}\n  - ${w.before}\n  + ${w.after}`);
  console.log(`${plan.length} shortNames`);
  if (!APPLY) { console.log("DRY RUN - pass --apply"); return; }
  for (const w of plan) {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: w.id }, data: { shortName: w.after } }),
      prisma.problemActivity.create({
        data: { problemId: w.id, userId: admin.id, userName: admin.pseudonym ?? null,
          type: "updated", field: "Short name", oldValue: w.before, newValue: w.after },
      }),
    ]);
  }
  console.log("APPLIED");
}
main().finally(() => prisma.$disconnect());
