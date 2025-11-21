import Google from "next-auth/providers/google";
import type { PrismaClient } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const createAuthConfig = (prisma: PrismaClient, env: CloudflareEnv): NextAuthConfig => ({
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      try {
        // Sync user to D1 Database manually
        // This avoids the need for the standard NextAuth Prisma Adapter tables (Account, Session, etc.)
        // and works with our custom User schema.
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            googleId: account.providerAccountId,
          },
          create: {
            email: user.email,
            name: user.name,
            googleId: account.providerAccountId,
          },
        });
        return true;
      } catch (error) {
        console.error("Failed to sync user to database:", error);
        // Allow sign in even if DB sync fails, or return false to block
        return true; 
      }
    },
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

