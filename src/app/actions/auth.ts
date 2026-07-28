"use server";

import { signIn, signOut } from "@/auth";

// Both are used directly as `<form action={...}>` handlers, so they take no
// arguments - React passes FormData to form actions, and neither needs it.

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutEverywhere() {
  await signOut({ redirectTo: "/" });
}
