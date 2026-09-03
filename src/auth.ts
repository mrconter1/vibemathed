import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { generateUniquePseudonym } from "@/lib/pseudonym";

export const AUTH_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      pseudonym: string | null;
      /// Curator-set team role, or null. Rides on the session so permission
      /// checks (src/lib/curators.ts) are synchronous and cost no query.
      staffRole: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    GitHub({
      // Links a GitHub sign-in to an existing account with the same email
      // instead of minting a second one. Auth.js names this option to make
      // you think, and the danger it warns about is real: if a provider hands
      // back an email it has not verified, anyone can claim someone else's
      // account by signing up with their address.
      //
      // It is safe HERE specifically because GitHub will not make an address
      // your primary email until you have proved you control it, and the
      // primary is what the OAuth profile returns. A user with email privacy
      // on returns no email at all, in which case nothing matches and the
      // adapter creates a fresh account, which is the correct outcome too.
      //
      // Without this, anyone who signed in with Google and later with GitHub
      // would silently become two people: new pseudonym, empty history, no
      // access to their own inbox or submissions.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  // Database sessions, so this is how long a row stays valid rather than a
  // cookie lifetime. Thirty days is the Auth.js default, set explicitly
  // because it is a product decision, not an accident: this is a public
  // catalogue where the worst a stolen session can do is vote and comment
  // under a pseudonym, and asking mathematicians to reauthenticate every
  // fortnight buys nothing. `updateAge` slides the window on use, so an
  // active reader effectively never gets logged out.
  session: {
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    // Banned accounts cannot start a session; they land on the /banned
    // notice instead. Existing sessions are deleted at ban time, so with
    // database sessions this one gate covers submitting, editing, voting
    // and commenting alike.
    signIn({ user }) {
      if ((user as { banned?: boolean }).banned) return "/banned";
      return true;
    },
    session({ session, user }) {
      // Build a fresh payload rather than returning the adapter's runtime
      // object. With database sessions that object also carries the session
      // token and every User column; neither belongs in /api/auth/session. The
      // allowlist keeps standard identity fields for Auth.js, id/pseudonym for
      // site identity, email for env-admin checks, and staffRole for curator
      // permissions. Any future session field must be added here deliberately.
      return {
        expires: session.expires,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          // `user` is the full adapter record, so the pseudonym rides along
          // and no extra query is needed to render the viewer's public identity.
          pseudonym: (user as { pseudonym?: string | null }).pseudonym ?? null,
          // Database sessions re-read this row on every request, so granting
          // or removing a staff role takes effect without a sign-out.
          staffRole: (user as { staffRole?: string | null }).staffRole ?? null,
        },
      };
    },
  },
  events: {
    // Assign a unique pseudonym the moment a new user record is created, so
    // every account has a public identity from its very first action.
    async createUser({ user }) {
      if (!user.id) return;
      const pseudonym = await generateUniquePseudonym(prisma);
      await prisma.user.update({
        where: { id: user.id },
        data: { pseudonym },
      });
    },
  },
});
