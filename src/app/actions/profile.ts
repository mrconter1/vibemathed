"use server";

import { updateTag } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMemberRole } from "@/lib/roles";
import {
  LINK_KEYS,
  normalizeLink,
  type ProfileLinks,
} from "@/lib/profile-links";

/// Link key to database column. Kept here rather than in the shared lib so
/// the client bundle never carries column names.
const LINK_COLUMN: Record<string, string> = {
  website: "linkWebsite",
  arxiv: "linkArxiv",
  orcid: "linkOrcid",
  github: "linkGithub",
  linkedin: "linkLinkedin",
};
import { validatePseudonym, BIO_MAX } from "@/lib/pseudonym";

export type PseudonymResult =
  | { ok: true; pseudonym: string }
  | { ok: false; error: string };

/// Changes the viewer's pseudonym, which is their only public identity.
export async function updatePseudonym(raw: string): Promise<PseudonymResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to change your name." };
  }

  const value = raw.trim();
  const check = validatePseudonym(value);
  if (!check.ok) {
    return { ok: false, error: check.error ?? "That name cannot be used." };
  }

  // The unique index is case-sensitive, so check case-insensitively too -
  // otherwise "bravefox1" and "BraveFox1" could both exist and be mistaken for
  // each other.
  const taken = await prisma.user.findFirst({
    where: {
      pseudonym: { equals: value, mode: "insensitive" },
      NOT: { id: session.user.id },
    },
    select: { id: true },
  });
  if (taken) {
    return { ok: false, error: "That name is already taken." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { pseudonym: value },
    });
  } catch (error) {
    console.error("updatePseudonym failed", error);
    return { ok: false, error: "Could not save that name. Please try again." };
  }

  return { ok: true, pseudonym: value };
}

export type BioResult = { ok: true; bio: string } | { ok: false; error: string };

/// Sets or clears the viewer's public bio. Plain text only - it renders as
/// text, never as HTML or math, so nothing here needs escaping downstream.
export async function updateBio(raw: string): Promise<BioResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };

  // Collapse newlines: the bio renders as a single line under the name.
  const bio = raw.replace(/\s+/g, " ").trim();
  if (bio.length > BIO_MAX) {
    return { ok: false, error: `Must be ${BIO_MAX} characters or fewer.` };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { bio: bio === "" ? null : bio },
    });
  } catch (error) {
    console.error("updateBio failed", error);
    return { ok: false, error: "Could not save that. Please try again." };
  }

  // Profiles are cached by pseudonym; the edited one must not serve stale.
  updateTag("users");
  return { ok: true, bio };
}

export type RoleResult = { ok: true; role: string | null } | { ok: false; error: string };

/// Sets or clears the viewer's self-declared role. Self-serve on purpose:
/// it is context, not a credential, and `verified` is the flag that requires
/// a curator.
export async function updateRole(raw: string): Promise<RoleResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };

  const role = raw.trim();
  if (role !== "" && !isMemberRole(role)) {
    return { ok: false, error: "Not a valid role." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: role === "" ? null : role },
    });
  } catch (error) {
    console.error("updateRole failed", error);
    return { ok: false, error: "Could not save that. Please try again." };
  }

  updateTag("users");
  return { ok: true, role: role === "" ? null : role };
}

export type LinksResult =
  | { ok: true; links: ProfileLinks }
  | { ok: false; error: string };

/// Replaces the viewer's profile links. Every field is validated for its own
/// kind, so a LinkedIn URL cannot land in the arXiv slot; an empty string
/// clears that link.
export async function updateLinks(raw: Record<string, string>): Promise<LinksResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };

  const data: Record<string, string | null> = {};
  const links: ProfileLinks = {};
  for (const key of LINK_KEYS) {
    const checked = normalizeLink(key, raw[key] ?? "");
    if (!checked.ok) return { ok: false, error: checked.error };
    data[LINK_COLUMN[key]] = checked.value;
    links[key] = checked.value;
  }

  try {
    await prisma.user.update({ where: { id: session.user.id }, data });
  } catch (error) {
    console.error("updateLinks failed", error);
    return { ok: false, error: "Could not save your links. Please try again." };
  }

  updateTag("users");
  return { ok: true, links };
}

export type GoogleVisibilityResult = { ok: true } | { ok: false; error: string };

/// Sets one of the two Google-identity privacy toggles. Owner-only by
/// construction (it writes to the session's own row), and the flags only
/// change what the profile page RENDERS - the name and email stay where
/// OAuth put them either way.
export async function updateGoogleVisibility(
  field: "name" | "email",
  show: boolean,
): Promise<GoogleVisibilityResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: field === "name" ? { showGoogleName: show } : { showGoogleEmail: show },
    });
  } catch (error) {
    console.error("updateGoogleVisibility failed", error);
    return { ok: false, error: "Could not save that. Please try again." };
  }

  updateTag("users");
  return { ok: true };
}
