"use server";

// Member management, admin-only: the flags a curator sets ABOUT a member that
// the member cannot set themselves. Verification (identity checked), the
// citation snapshot, and the staff role. Everything a member sets about
// themselves lives in profile.ts.
//
// Gated on canManageMembers, not canReview: a moderator reviews entries, an
// admin decides who the moderators are. The environment admin list stays the
// root of trust above both, so a compromised admin account cannot lock the
// founders out.

import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageMembers, isStaffRole } from "@/lib/curators";

/// Form-shaped: strings throughout, so the editor can hold a half-typed value.
export interface MemberFlags {
  verified: boolean;
  verifiedNote: string;
  citations: string;
  citationsNote: string;
  staffRole: string;
}

export type MemberResult = { ok: true } | { ok: false; error: string };

const NOTE_MAX = 300;

/// Current flags for the editor to seed from. Null when the viewer may not
/// manage members or the member does not exist - the caller renders nothing
/// either way, so the two cases need no distinguishing.
export async function getMemberFlags(pseudonym: string): Promise<MemberFlags | null> {
  const session = await auth();
  if (!canManageMembers(session?.user)) return null;
  const u = await prisma.user.findUnique({
    where: { pseudonym },
    select: { verified: true, verifiedNote: true, citations: true, citationsNote: true, staffRole: true },
  });
  if (!u) return null;
  return {
    verified: u.verified,
    verifiedNote: u.verifiedNote ?? "",
    citations: u.citations === null ? "" : String(u.citations),
    citationsNote: u.citationsNote ?? "",
    staffRole: u.staffRole ?? "",
  };
}

export async function setMemberFlags(pseudonym: string, flags: MemberFlags): Promise<MemberResult> {
  const session = await auth();
  if (!session?.user?.id || !canManageMembers(session.user)) {
    return { ok: false, error: "Not authorised." };
  }

  const user = await prisma.user.findUnique({ where: { pseudonym }, select: { id: true } });
  if (!user) return { ok: false, error: "No such member." };

  const staffRole = flags.staffRole.trim();
  if (staffRole && !isStaffRole(staffRole)) return { ok: false, error: "Unknown staff role." };

  const citationsRaw = flags.citations.trim();
  if (citationsRaw && !/^\d{1,7}$/.test(citationsRaw)) {
    return { ok: false, error: "Citations must be a whole number." };
  }

  const verifiedNote = flags.verifiedNote.trim();
  const citationsNote = flags.citationsNote.trim();
  if (verifiedNote.length > NOTE_MAX || citationsNote.length > NOTE_MAX) {
    return { ok: false, error: `Notes are capped at ${NOTE_MAX} characters.` };
  }
  // A verification with no record of what was checked is the thing the
  // verified badge exists to avoid. Same for a citation count with no source.
  if (flags.verified && !verifiedNote) {
    return { ok: false, error: "Say what was checked before marking a member verified." };
  }
  if (citationsRaw && !citationsNote) {
    return { ok: false, error: "Say where the citation count comes from, and when." };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: flags.verified,
        verifiedNote: verifiedNote || null,
        citations: citationsRaw ? Number(citationsRaw) : null,
        citationsNote: citationsNote || null,
        staffRole: staffRole || null,
      },
    });
  } catch (error) {
    console.error("setMemberFlags failed", error);
    return { ok: false, error: "Could not save." };
  }

  // Profiles, the directory and the About page team list all read under
  // this tag.
  updateTag("users");
  return { ok: true };
}
