// Builds search documents from catalog entries, the same way on the server
// (/api/search) and in the browser (the entry list), so a query finds the
// same entries in both places.

import { RESOLUTION, SOLVE_TYPE, VERIFICATION } from "@/lib/display";
import { collectionSpec } from "@/lib/collections";
import { ageAtSolve } from "@/lib/problems";
import { buildDoc, type SearchDoc } from "@/lib/search-query";

/// The fields a search document needs. Both a CardEntry and a full
/// ProblemWithVotes satisfy it.
export interface Searchable {
  slug: string;
  name: string;
  shortName?: string | null;
  problemNumber: number | null;
  field: string | null;
  fieldGroup: string | null;
  posedBy: string | null;
  yearPosed: number | null;
  model: string;
  modelMaker: string | null;
  humanCollaborators: string[];
  submittedBy: string | null;
  resolution: string;
  verification: string;
  solveType: string;
  solveDate: string;
  significance?: number | null;
  sourceName: string;
  sourceUrl: string;
  links?: { label: string }[];
  collection?: string | null;
  resultNote?: string | null;
  verificationNote?: string | null;
}

/// `prose` is the long text from /api/search-index (statement, notes, AI
/// role); without it, words still match the name, people, fields and the
/// short notes the card already carries.
export function toSearchDoc(p: Searchable, prose?: string): SearchDoc {
  return buildDoc({
    slug: p.slug,
    name: p.name,
    shortName: p.shortName,
    problemNumber: p.problemNumber,
    field: p.field,
    fieldGroup: p.fieldGroup,
    posedBy: p.posedBy,
    yearPosed: p.yearPosed,
    model: p.model,
    modelMaker: p.modelMaker,
    humanCollaborators: p.humanCollaborators,
    submittedBy: p.submittedBy,
    resolution: p.resolution,
    resolutionLabel: RESOLUTION[p.resolution as keyof typeof RESOLUTION]?.label ?? null,
    verification: p.verification,
    verificationLabel: VERIFICATION[p.verification as keyof typeof VERIFICATION]?.label ?? null,
    solveType: [p.solveType, SOLVE_TYPE[p.solveType as keyof typeof SOLVE_TYPE]?.label].filter(Boolean).join(" "),
    solveDate: p.solveDate,
    significance: p.significance ?? null,
    yearsOpen: ageAtSolve({ yearPosed: p.yearPosed, solveDate: p.solveDate } as never),
    sourceName: p.sourceName,
    sourceUrl: p.sourceUrl,
    linkLabels: (p.links ?? []).map((l) => l.label),
    collectionLabel: collectionSpec(p.collection)?.label ?? null,
    prose: [p.resultNote, p.verificationNote, prose],
  });
}
