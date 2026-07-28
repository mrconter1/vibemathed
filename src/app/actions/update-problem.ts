"use server";

import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  EDITABLE_FIELDS,
  isHttpUrl,
  isValidSolveDate,
  type EditableValues,
  type FieldSpec,
} from "@/lib/editable";

export type UpdateResult =
  | { ok: true; changed: number }
  | { ok: false; error: string };

/// The database value a form string maps to.
type Parsed = string | number | string[] | null;

function parseField(spec: FieldSpec, raw: string): { ok: true; value: Parsed } | { ok: false; error: string } {
  const v = raw.trim();

  if (v === "") {
    if (spec.required) return { ok: false, error: `${spec.label} cannot be empty.` };
    return { ok: true, value: spec.kind === "list" ? [] : null };
  }

  if (spec.maxLength && v.length > spec.maxLength) {
    return { ok: false, error: `${spec.label} is too long (max ${spec.maxLength}).` };
  }

  switch (spec.kind) {
    case "choice": {
      const allowed = (spec.options ?? []).map((o) => o.value);
      if (!allowed.includes(v)) {
        return { ok: false, error: `${spec.label} is not a valid option.` };
      }
      return { ok: true, value: v };
    }
    case "number": {
      if (!/^\d+$/.test(v)) return { ok: false, error: `${spec.label} must be a whole number.` };
      const n = Number(v);
      if (spec.key === "yearPosed" && (n < 1000 || n > 3000)) {
        return { ok: false, error: "Year posed must be a four-digit year." };
      }
      return { ok: true, value: n };
    }
    case "url":
      if (!isHttpUrl(v)) return { ok: false, error: `${spec.label} must start with http:// or https://.` };
      return { ok: true, value: v };
    case "list":
      return {
        ok: true,
        value: v.split(",").map((s) => s.trim()).filter(Boolean),
      };
    case "text":
    case "textarea":
      if (spec.key === "solveDate" && !isValidSolveDate(v)) {
        return { ok: false, error: "Solve date must be YYYY, YYYY-MM or YYYY-MM-DD." };
      }
      return { ok: true, value: v };
  }
}

/// Renders a stored value as the string shown in the changelog diff.
function display(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  const s = String(value);
  return s === "" ? null : s;
}

/// Applies a community edit to an entry and records every changed field.
///
/// Only fields in EDITABLE_FIELDS can be written - the incoming object is
/// whitelisted against it rather than spread into the update, so a crafted
/// request cannot reach `verification`, `renownLangs` or `slug`.
export async function updateProblem(
  slug: string,
  values: Partial<EditableValues>,
): Promise<UpdateResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to edit entries." };
  }
  const userId = session.user.id;
  const userName = session.user.pseudonym ?? null;

  const current = await prisma.problem.findFirst({
    where: { slug, status: "published" },
    select: {
      id: true,
      name: true,
      shortName: true,
      field: true,
      statement: true,
      posedBy: true,
      yearPosed: true,
      solveDate: true,
      model: true,
      modelMaker: true,
      humanCollaborators: true,
      aiRole: true,
      verification: true,
      verificationNote: true,
      resultNote: true,
      ageNote: true,
      citations: true,
      citationsPaper: true,
      citationsSource: true,
      citationsUrl: true,
      sourceUrl: true,
      sourceName: true,
    },
  });
  if (!current) {
    return { ok: false, error: "That entry no longer exists." };
  }

  const data: Record<string, Parsed> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];

  for (const spec of EDITABLE_FIELDS) {
    const raw = values[spec.key];
    if (raw === undefined) continue;

    const parsed = parseField(spec, raw);
    if (!parsed.ok) return { ok: false, error: parsed.error };

    const before = display(current[spec.key as keyof typeof current]);
    const after = display(parsed.value);
    if (before === after) continue;

    data[spec.key] = parsed.value;
    changes.push({ field: spec.label, oldValue: before, newValue: after });
  }

  if (changes.length === 0) {
    return { ok: true, changed: 0 };
  }

  // Moving an entry up or down the trust ladder is the highest-consequence edit
  // on the site, so it has to come with its justification. Requiring the note to
  // change in the same edit means the changelog always records WHY the tier
  // moved, not just that it did.
  const movedTier = changes.some((c) => c.field === "Verification");
  const explained = changes.some((c) => c.field === "Verification note");
  if (movedTier && !explained) {
    return {
      ok: false,
      error:
        "Changing the verification tier also requires updating the verification note, so the reason is on record.",
    };
  }

  try {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: current.id }, data }),
      prisma.problemActivity.createMany({
        data: changes.map((c) => ({
          problemId: current.id,
          userId,
          userName,
          type: "updated" as const,
          field: c.field,
          oldValue: c.oldValue,
          newValue: c.newValue,
        })),
      }),
    ]);
  } catch (error) {
    console.error("updateProblem failed", error);
    return { ok: false, error: "Could not save your changes. Please try again." };
  }

  updateTag("problems");
  updateTag(`problem-${slug}`);
  updateTag(`activity-${slug}`);
  updateTag("activity");

  return { ok: true, changed: changes.length };
}
