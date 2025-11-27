import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";

// [Type Extension] Extend Session and JWT to include 'role'
declare module "next-auth" {
  interface Session {
    user: {
      role: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "USER";
  }
}

// [Config] Core Auth Configuration (Stateless)
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // [Stateless Admin Logic]
    // Determine role based on env.ADMIN_EMAILS without DB query
    async jwt({ token, user }) {
      if (user && user.email) {
        const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsEnv.split(",").map((e) => e.trim());

        if (adminEmails.includes(user.email)) {
          token.role = "ADMIN";
        } else {
          token.role = "USER";
        }
      }
      return token;
    },
    // Pass role from token to session
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to home for login
    error: "/auth/error", // Custom error page
  },
};

// Export auth helper for Middleware (Adapter-less verification)
export const { auth } = NextAuth(authConfig);
