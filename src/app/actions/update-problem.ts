"use server";

import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { canReview } from "@/lib/curators";
import { prisma } from "@/lib/prisma";
import {
  EDITABLE_FIELDS,
  CURATOR_FIELDS,
  sameDocument,
  type EditableValues,
} from "@/lib/editable";
import { canonical } from "@/lib/char-length";
import { relationKind, type RelationRef } from "@/lib/relation-kinds";
import { parseField, type Parsed } from "@/lib/field-validation";
import type { LinkRef } from "@/lib/problems";

export type UpdateResult =
  { ok: true; changed: number } | { ok: false; error: string };

/// Renders a stored value as the string shown in the changelog diff.
function display(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value
      .map((v) => {
        if (typeof v === "object" && v !== null && "url" in v) {
          // The kind is part of what a link IS, so retyping one without
          // touching its label or URL is a real edit and has to register as a
          // change - otherwise the diff sees nothing and drops it.
          return `${(v as LinkRef).kind ?? "other"}: ${(v as LinkRef).label} | ${(v as LinkRef).url}`;
        }
        if (typeof v === "object" && v !== null && "to" in v) {
          const r = v as RelationRef;
          return `${r.kind} -> ${r.to} (${r.note})`;
        }
        return String(v);
      })
      .join(", ");
  }
  const s = String(value);
  return s === "" ? null : s;
}

/// Applies a community edit to an entry and records every changed field.
///
/// Only whitelisted fields can be written - the incoming object is checked
/// against the list rather than spread into the update, so a crafted request
/// cannot reach `slug`, `solveType` or `significance`. Curator-only fields are
/// in a second list that is appended for admins and simply absent for everyone
/// else, so a non-curator posting `renownLangs` has it ignored rather than
/// rejected: there is nothing to tell them, since the form never offered it.
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
      fieldGroup: true,
      resolution: true,
      aiContribution: true,
      claimIssueNote: true,
      renownLangs: true,
      renownNote: true,
      statement: true,
      posedBy: true,
      yearPosed: true,
      solveDate: true,
      model: true,
      modelMaker: true,
      humanCollaborators: true,
      aiRole: true,
      verification: true,
      publication: true,
      resolutionMethod: true,
      verificationNote: true,
      resultNote: true,
      ageNote: true,
      citations: true,
      citationsPaper: true,
      citationsSource: true,
      citationsUrl: true,
      sourceUrl: true,
      sourceName: true,
      links: {
        select: { label: true, url: true, kind: true },
        orderBy: { position: "asc" },
      },
      relationsFrom: {
        select: {
          toId: true,
          kind: true,
          note: true,
          to: { select: { slug: true } },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!current) {
    return { ok: false, error: "That entry no longer exists." };
  }

  // The outgoing edges in the same { to, kind, note } shape the form carries,
  // so the diff below compares like with like.
  const currentRelations: RelationRef[] = current.relationsFrom.map((r) => ({
    to: r.to.slug,
    kind: r.kind,
    note: r.note,
  }));

  const data: Record<string, Parsed> = {};
  const changes: {
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[] = [];
  // Links and relations live in their own tables, so they are collected
  // separately and rewritten wholesale rather than assigned onto the row.
  let nextLinks: LinkRef[] | null = null;
  let nextRelations: RelationRef[] | null = null;

  const writable = canReview(session.user)
    ? [...EDITABLE_FIELDS, ...CURATOR_FIELDS]
    : EDITABLE_FIELDS;

  for (const spec of writable) {
    const raw = values[spec.key];
    if (raw === undefined) continue;

    const before =
      spec.kind === "relations"
        ? display(currentRelations)
        : display(current[spec.key as keyof typeof current]);

    // Untouched fields are skipped BEFORE they are validated, not after.
    //
    // The other order made an entry unsavable whenever any one of its stored
    // values would fail today's rules: the form posts every field, so an
    // editor fixing a typo in the title got "Extra links: that link is
    // already the entry's primary source" about a link they had never
    // opened, and no edit to that entry could ever succeed. Twelve published
    // entries were in that state on 10 September 2026.
    //
    // Comparing the submitted string against the stored one first means a
    // field nobody changed cannot block the save, while any attempt to
    // CHANGE a bad value still has to make it valid - which is the rule the
    // limits are actually there for.
    if (canonical(raw.trim()) === (before ?? "")) continue;

    const parsed = parseField(spec, raw, slug);
    if (!parsed.ok) return { ok: false, error: parsed.error };

    const after = display(parsed.value);
    if (before === after) continue;

    if (spec.kind === "links") {
      nextLinks = parsed.value as LinkRef[];
    } else if (spec.kind === "relations") {
      nextRelations = parsed.value as RelationRef[];
    } else {
      data[spec.key] = parsed.value;
    }
    changes.push({ field: spec.label, oldValue: before, newValue: after });
  }

  if (changes.length === 0) {
    return { ok: true, changed: 0 };
  }

  // A link may not repeat the primary source. Checked here rather than inside
  // parseField because either side can be the one that moved - an edit can
  // add the link or retarget the source - and only the merged result knows
  // whether they now collide. Enforced only when the edit touched one of the
  // two, so an unrelated change to an entry is never blocked by it.
  if (nextLinks !== null || data.sourceUrl !== undefined) {
    const primaryUrl =
      (data.sourceUrl as string | undefined) ?? current.sourceUrl;
    const clash = (nextLinks ?? current.links).find((l) =>
      sameDocument(l.url, primaryUrl),
    );
    if (clash) {
      return {
        ok: false,
        error:
          `"${clash.label}" is the same document as the primary source. The source is the ` +
          "citation; list only the other material as links.",
      };
    }
  }

  // Relations need the database to finish validating: the target must be a
  // real published entry, and the same edge must not already exist drawn from
  // the other side. Resolved here into the ids the write needs.
  let relationRows:
    { toId: string; kind: string; note: string; position: number }[] | null =
    null;
  const affectedSlugs: string[] = [];
  if (nextRelations !== null) {
    const targets = await prisma.problem.findMany({
      where: {
        slug: { in: nextRelations.map((r) => r.to) },
        status: "published",
      },
      select: { id: true, slug: true },
    });
    const bySlug = new Map(targets.map((t) => [t.slug, t.id]));
    for (const r of nextRelations) {
      if (!bySlug.has(r.to)) {
        return {
          ok: false,
          error: `No published entry with the slug "${r.to}".`,
        };
      }
    }
    // A symmetric edge drawn from the other entry is the SAME relation, and a
    // directed kind between the same pair in both directions is a
    // contradiction ("A continues B" and "B continues A") - refused either
    // way, with a message that says where the existing edge lives.
    const reverse = await prisma.problemRelation.findFirst({
      where: {
        toId: current.id,
        fromId: { in: targets.map((t) => t.id) },
        kind: { in: nextRelations.map((r) => r.kind) },
      },
      select: { kind: true, from: { select: { slug: true, name: true } } },
    });
    if (
      reverse &&
      nextRelations.some((r) => r.kind === reverse.kind && bySlug.get(r.to))
    ) {
      const collides = nextRelations.find(
        (r) => r.kind === reverse.kind && r.to === reverse.from.slug,
      );
      if (collides) {
        const spec = relationKind(reverse.kind);
        return {
          ok: false,
          error:
            `"${reverse.from.name}" already draws this ${spec?.forward ?? reverse.kind} ` +
            "relation to this entry. A relation shows on both entries; edit it from that one.",
        };
      }
    }
    relationRows = nextRelations.map((r, position) => ({
      toId: bySlug.get(r.to)!,
      kind: r.kind,
      note: r.note,
      position,
    }));
    // Both sides of every touched edge render the relation, so both caches
    // must drop: the new targets, and any old targets an edge was removed
    // from.
    affectedSlugs.push(
      ...new Set([
        ...nextRelations.map((r) => r.to),
        ...currentRelations.map((r) => r.to),
      ]),
    );
  }

  // Moving an entry up or down the trust ladder, moving it through the
  // publication pipeline, or changing what the entry claims happened to the
  // problem - these are the highest-consequence edits on the site, so they
  // have to come with their justification. Requiring the note to change in
  // the same edit means the changelog always records WHY it moved.
  const movedTier = changes.some(
    (c) =>
      c.field === "Verification" ||
      c.field === "Status" ||
      c.field === "Publication",
  );
  const explained = changes.some((c) => c.field === "Verification note");
  if (movedTier && !explained) {
    return {
      ok: false,
      error:
        "Changing the verification tier or status also requires updating the verification note, so the reason is on record.",
    };
  }

  try {
    await prisma.$transaction([
      prisma.problem.update({
        where: { id: current.id },
        data: {
          ...data,
          // Replace the whole set: simpler than diffing rows, and the
          // changelog already records what changed.
          ...(nextLinks
            ? {
                links: {
                  deleteMany: {},
                  create: nextLinks.map((l, position) => ({ ...l, position })),
                },
              }
            : {}),
          ...(relationRows
            ? {
                relationsFrom: {
                  deleteMany: {},
                  create: relationRows,
                },
              }
            : {}),
        },
      }),
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
    return {
      ok: false,
      error: "Could not save your changes. Please try again.",
    };
  }

  updateTag("problems");
  updateTag(`problem-${slug}`);
  updateTag(`activity-${slug}`);
  updateTag("activity");
  // A relation renders on both of its entries, so the other side's page must
  // drop too - its content changed without any edit of its own.
  for (const s of affectedSlugs) updateTag(`problem-${s}`);

  return { ok: true, changed: changes.length };
}
