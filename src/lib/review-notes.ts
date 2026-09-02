// Shared between the review-notes server action and its client component.
//
// Lives here rather than beside the action because a "use server" module may
// only export async functions: a constant exported from one compiles under
// tsc and fails the production build (Turbopack: "Only async functions are
// allowed to be exported"), which is how the 2 Sep 2026 deploy went red.
export const REVIEW_NOTE_MAX = 1000;
