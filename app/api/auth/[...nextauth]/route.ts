import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/db";
import { authConfig } from "@/lib/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { NextRequest } from "next/server";

export const runtime = 'edge';

async function handler(req: NextRequest) {
  const ctx = getRequestContext();
  
  // [D1 Binding] Get DB from Cloudflare context
  const db = ctx.env.DB;
  const prisma = getPrisma(db);

  // [Environment Variables]
  // In Cloudflare Pages, secrets are in ctx.env, not process.env
  // @ts-ignore
  const GOOGLE_ID = ctx.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_ID;
  // @ts-ignore
  const GOOGLE_SECRET = ctx.env.AUTH_GOOGLE_SECRET || process.env.AUTH_GOOGLE_SECRET;
  // @ts-ignore
  const SECRET = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
  // @ts-ignore
  const ADMIN_EMAILS = ctx.env.ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";

  // [Adapter Injection] Merge core config with Prisma Adapter
  // We MUST re-initialize providers here because process.env is empty in Edge Runtime for secrets
  const config = {
    ...authConfig,
    providers: [
      Google({
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: SECRET,
    trustHost: true, // Trust the Host header (fixes missing NEXTAUTH_URL)
    debug: true, // Enable debugging logs
    callbacks: {
      ...authConfig.callbacks,
      // [Edge Compatible Callback] Inject ADMIN_EMAILS from ctx.env
      async jwt({ token, user }: { token: any, user: any }) {
        if (user && user.email) {
          const adminEmails = (ADMIN_EMAILS as string).split(",").map((e) => e.trim());
          if (adminEmails.includes(user.email)) {
            token.role = "ADMIN";
          } else {
            token.role = "USER";
          }
        }
        return token;
      }
    }
  };

  // @ts-ignore
  const { handlers } = NextAuth(config);
  
  if (req.method === 'POST') {
    return handlers.POST(req);
  }
  return handlers.GET(req);
}

export const GET = handler;
export const POST = handler;