// Shared fixture identities for development seeding and sign-in. Keeping the
// allowlist here means application code never needs to import out of prisma/.
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
