"use server";

import { signIn, signOut } from "@/auth";

// Used directly as `<form action={...}>` handlers, so React hands them the
// form's FormData.

/// Where to land after signing in. Read from the form so a gate can send the
/// reader back to the page they were trying to use, rather than dumping
/// everyone on the home page and making them navigate again.
///
/// Only same-site paths are honoured. Anything else falls back to "/", because
/// a redirect target taken from a request is an open-redirect if it is not
/// checked: `//evil.com` is a protocol-relative URL that browsers treat as
/// another origin, and a backslash is normalised to a slash by some parsers,
/// so both are rejected along with anything not starting with a single "/".
function safeRedirect(value: FormDataEntryValue | null): string {
  const to = typeof value === "string" ? value : "";
  if (!to.startsWith("/") || to.startsWith("//") || to.startsWith("/\\")) return "/";
  return to;
}

export async function signInWithGoogle(formData?: FormData) {
  await signIn("google", { redirectTo: safeRedirect(formData?.get("redirectTo") ?? null) });
}

export async function signInWithGitHub(formData?: FormData) {
  await signIn("github", { redirectTo: safeRedirect(formData?.get("redirectTo") ?? null) });
}

export async function signOutEverywhere() {
  await signOut({ redirectTo: "/" });
}
