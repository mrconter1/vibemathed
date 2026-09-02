import type { PrismaClient } from "@prisma/client";

export const DEVELOPMENT_USERS = [
  {
    email: "test-admin@vibemathed.local",
    name: "Local Test Admin",
    pseudonym: "TestMongoose001",
    role: "researcher",
  },
  {
    email: "test-user@vibemathed.local",
    name: "Local Test User",
    pseudonym: "TestOtter001",
    role: "enthusiast",
  },
] as const;

/// Development-only identities for exercising authenticated UI locally.
///
/// Authentication privileges are not stored in User.role: the admin address
/// must also be present in ADMIN_EMAILS. Sessions remain ephemeral and are
/// created by the development sign-in flow rather than seeded here.
export async function seedDevelopment(prisma: PrismaClient) {
  await prisma.$transaction(
    DEVELOPMENT_USERS.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        create: {
          ...user,
          emailVerified: new Date("2026-01-01T00:00:00.000Z"),
        },
        update: {
          name: user.name,
          pseudonym: user.pseudonym,
          role: user.role,
          banned: false,
        },
      }),
    ),
  );

  console.log(`Development seed complete: ${DEVELOPMENT_USERS.length} users upserted.`);
}
