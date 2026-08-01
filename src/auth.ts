import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { generateUniquePseudonym } from "@/lib/pseudonym";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      pseudonym: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
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
      session.user.id = user.id;
      // `user` is the full adapter record, so the pseudonym rides along and no
      // extra query is needed to render the viewer's public identity.
      session.user.pseudonym = (user as { pseudonym?: string | null }).pseudonym ?? null;
      return session;
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
