// Loads and validates the curated baseline in `src/data/problems.json`.
//
// Kept separate from `src/lib/problems.ts` on purpose. That module holds the
// types and pure helpers that client components need (`ageAtSolve`), and
// importing any of them must not pull this 79 KB JSON file into the browser
// bundle. Validation runs at module load and throws on a malformed entry, which
// is a side effect bundlers will not tree-shake away - hence the split.
//
// Only the seed script imports this.

import rawProblems from "@/data/problems.json";
import { assertProblem, type MathProblem } from "@/lib/problems";

export const problems: MathProblem[] = (rawProblems as unknown[]).map(assertProblem);
