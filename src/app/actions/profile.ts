"use server";

import { updateTag } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
