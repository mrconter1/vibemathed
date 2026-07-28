// Guards the editable/curator-only split.
//
// The server action whitelists incoming edits against EDITABLE_FIELDS, so that
// list IS the security boundary - adding a key to it silently opens a field to
// every signed-in user. This asserts the curator-only fields never appear in
// it, and prints the actual field lists so the split is easy to eyeball.
//
// (Inspecting the rendered page cannot verify this: the edit dialog only mounts
// its inputs once opened, so no `edit-*` field is ever in the server HTML.)
//
// Run with: npx tsx scripts/check-editable-fields.ts

import { EDITABLE_FIELDS } from "../src/lib/editable";
import { SUBMISSION_FIELDS } from "../src/lib/submission";

/// Fields no signed-in user may change on a PUBLISHED entry.
const CURATOR_ONLY = ["slug", "renownLangs", "renownNote", "status", "solveType", "problemNumber"];

/// Fields nobody may set even when creating a submission.
const NEVER_SELF_REPORTED = ["slug", "renownLangs", "status"];

const editableKeys = EDITABLE_FIELDS.map((f) => f.key as string);
const submissionKeys = SUBMISSION_FIELDS.map((f) => f.key as string);

let failed = 0;

for (const key of CURATOR_ONLY) {
  if (editableKeys.includes(key)) {
    console.error(`FAIL  "${key}" is curator-only but appears in EDITABLE_FIELDS`);
    failed += 1;
  } else {
    console.log(`ok    "${key}" not editable on a published entry`);
  }
}

for (const key of NEVER_SELF_REPORTED) {
  if (submissionKeys.includes(key)) {
    console.error(`FAIL  "${key}" must never be self-reported but is in SUBMISSION_FIELDS`);
    failed += 1;
  } else {
    console.log(`ok    "${key}" not self-reportable on submission`);
  }
}

// Verification is deliberately editable - it is factual and time-varying, and
// freezing it makes entries go stale. Assert it stays that way.
if (!editableKeys.includes("verification")) {
  console.error(`FAIL  "verification" should be editable (trust tier changes over time)`);
  failed += 1;
} else {
  console.log(`ok    "verification" is editable`);
}

// Every choice field must carry its options, since the server validates against
// exactly those values - an empty list would reject everything.
for (const spec of [...EDITABLE_FIELDS, ...SUBMISSION_FIELDS]) {
  if (spec.kind === "choice" && (spec.options ?? []).length === 0) {
    console.error(`FAIL  choice field "${spec.key}" has no options`);
    failed += 1;
  }
}

console.log(`\neditable   (${editableKeys.length}): ${editableKeys.join(", ")}`);
console.log(`submission (${submissionKeys.length}): ${submissionKeys.join(", ")}`);

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll editable-field checks passed.");
