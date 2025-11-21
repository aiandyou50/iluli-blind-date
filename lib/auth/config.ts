import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const createAuthConfig = (prisma: PrismaClient, env: CloudflareEnv): NextAuthConfig => ({
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  }
});

