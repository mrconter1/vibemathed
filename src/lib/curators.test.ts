import { afterEach, describe, expect, it, vi } from "vitest";
import { canManageMembers, canReview, isStaffRole } from "@/lib/curators";

// The permission layer is two small functions and the whole site's safety
// rests on them, so every branch is pinned: env admins, database admins,
// moderators, developers, plain members, and nobody at all.

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("canReview", () => {
  it("is false for nobody and for a plain member", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(canReview(null)).toBe(false);
    expect(canReview({ email: "someone@example.com", staffRole: null })).toBe(false);
  });

  it("is true for an environment admin, case-insensitively", () => {
    vi.stubEnv("ADMIN_EMAILS", "Founder@Example.com, other@example.com");
    expect(canReview({ email: "founder@example.com", staffRole: null })).toBe(true);
  });

  it("is true for database admins and moderators, false for developers", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(canReview({ email: "a@example.com", staffRole: "admin" })).toBe(true);
    expect(canReview({ email: "m@example.com", staffRole: "moderator" })).toBe(true);
    expect(canReview({ email: "d@example.com", staffRole: "developer" })).toBe(false);
  });

  it("fails closed when the environment list is unset", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(canReview({ email: "anyone@example.com" })).toBe(false);
  });
});

describe("canManageMembers", () => {
  it("excludes moderators: a moderator cannot make moderators", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(canManageMembers({ email: "m@example.com", staffRole: "moderator" })).toBe(false);
    expect(canManageMembers({ email: "a@example.com", staffRole: "admin" })).toBe(true);
  });

  it("includes environment admins regardless of database role", () => {
    vi.stubEnv("ADMIN_EMAILS", "founder@example.com");
    expect(canManageMembers({ email: "founder@example.com", staffRole: null })).toBe(true);
  });
});

describe("isStaffRole", () => {
  it("accepts the three roles and nothing else", () => {
    expect(isStaffRole("admin")).toBe(true);
    expect(isStaffRole("moderator")).toBe(true);
    expect(isStaffRole("developer")).toBe(true);
    expect(isStaffRole("owner")).toBe(false);
    expect(isStaffRole(null)).toBe(false);
    expect(isStaffRole("")).toBe(false);
  });
});
