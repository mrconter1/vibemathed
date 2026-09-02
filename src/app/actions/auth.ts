"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_MAX_AGE_SECONDS, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEVELOPMENT_USERS } from "../../../prisma/seeds_development";

const DEVELOPMENT_SESSION_COOKIE = "authjs.session-token";
const DEVELOPMENT_USER_EMAILS = DEVELOPMENT_USERS.map((user) => user.email);

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

/// Local-only shortcut for exercising authenticated UI without an OAuth
/// round-trip. The server check is the security boundary; hiding its form in
/// the page is only presentation and must never be relied upon by itself.
export async function signInAsDevelopmentUser(formData: FormData) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Development sign-in is disabled.");
  }

  const rawUserId = formData.get("userId");
  if (typeof rawUserId !== "string" || !rawUserId) {
    throw new Error("Choose a development user.");
  }

  // Restrict the action to the explicit fixtures. A copied production user
  // must not become impersonatable merely because it is present locally.
  const user = await prisma.user.findFirst({
    where: {
      id: rawUserId,
      email: { in: DEVELOPMENT_USER_EMAILS },
      banned: false,
    },
    select: { id: true },
  });
  if (!user) throw new Error("Development user not found.");

  const cookieStore = await cookies();
  const previousToken = cookieStore.get(DEVELOPMENT_SESSION_COOKIE)?.value;
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000);

  const createSession = prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });
  if (previousToken) {
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { sessionToken: previousToken } }),
      createSession,
    ]);
  } else {
    await createSession;
  }

  cookieStore.set(DEVELOPMENT_SESSION_COOKIE, sessionToken, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  redirect(safeRedirect(formData.get("redirectTo")));
}

export async function signOutEverywhere() {
  await signOut({ redirectTo: "/" });
}
