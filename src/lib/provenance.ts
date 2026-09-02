// Per-field AI provenance: which model drafted a field's current value, when,
// from what (issues #7 and #6). Storage in FieldProvenance; this is the write
// helper the review scripts and curator actions call, and the shape the entry
// page reads.
//
// Written from scripts and server actions only. There is deliberately no form
// for it: provenance is a fact about how a value was produced, recorded at the
// moment of production, not an attribute anyone edits afterwards.

import type { PrismaClient } from "@prisma/client";

export interface ProvenanceInput {
  model: string;
  source?: string | null;
  userId?: string | null;
  userName?: string | null;
}

/// Records (or replaces) provenance for each named field of one entry. Call it
/// in the same transaction or right after the write that produced the values.
export async function recordProvenance(
  prisma: PrismaClient,
  problemId: string,
  fields: string[],
  input: ProvenanceInput,
): Promise<void> {
  for (const field of fields) {
    await prisma.fieldProvenance.upsert({
      where: { problemId_field: { problemId, field } },
      create: {
        problemId,
        field,
        model: input.model,
        source: input.source ?? null,
        userId: input.userId ?? null,
        userName: input.userName ?? null,
      },
      update: {
        model: input.model,
        source: input.source ?? null,
        userId: input.userId ?? null,
        userName: input.userName ?? null,
        createdAt: new Date(),
      },
    });
  }
}

/// What the entry page shows on hover of the marker.
export interface ProvenanceView {
  field: string;
  model: string;
  source: string | null;
  /// Curator who reviewed it, or "a curator".
  reviewedBy: string;
  /// "2 Sep 2026".
  date: string;
}
