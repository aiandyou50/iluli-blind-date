import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Session, User } from "next-auth";

export const createAuthConfig = (prisma: PrismaClient, env: CloudflareEnv) => ({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // @ts-expect-error - Session type mismatch
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

