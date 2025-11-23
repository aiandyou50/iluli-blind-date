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
        // 1. Upsert User
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });

        // 2. Upsert Account
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: typeof account.session_state === 'string' ? account.session_state : undefined,
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: typeof account.session_state === 'string' ? account.session_state : undefined,
          },
        });

        return true;
      } catch (error) {
        console.error("Sign in sync error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        // Fetch user ID and Role from DB
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        });

        if (dbUser) {
          token.sub = dbUser.id;
          token.id = dbUser.id;
          token.role = dbUser.role;

          // Auto-Promotion Logic
          const adminEmails = env.ADMIN_EMAILS ? env.ADMIN_EMAILS.split(',') : [];
          if (adminEmails.includes(user.email) && dbUser.role !== 'ADMIN') {
            try {
              const updatedUser = await prisma.user.update({
                where: { email: user.email },
                data: { role: 'ADMIN' },
                select: { role: true }
              });
              token.role = updatedUser.role;
              console.log(`Auto-promoted user ${user.email} to ADMIN`);
            } catch (error) {
              console.error("Failed to auto-promote user:", error);
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  }
});
