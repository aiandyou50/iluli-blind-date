import NextAuth from "next-auth";
import { createAuthConfig } from "@/lib/auth/config";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { NextRequest } from "next/server";

export const runtime = 'edge';

async function handler(req: NextRequest) {
  const ctx = getRequestContext();
  
  // Debug logging
  console.log("Auth Request URL:", req.url);
  console.log("DB Binding present:", !!ctx.env.DB);
  console.log("AUTH_SECRET present:", !!ctx.env.AUTH_SECRET);
  console.log("AUTH_GOOGLE_ID present:", !!ctx.env.AUTH_GOOGLE_ID);
  console.log("AUTH_GOOGLE_SECRET present:", !!ctx.env.AUTH_GOOGLE_SECRET);

  // if (!ctx.env.DB || !ctx.env.AUTH_SECRET || !ctx.env.AUTH_GOOGLE_ID || !ctx.env.AUTH_GOOGLE_SECRET) {
  //   console.error("Missing required environment variables or bindings");
  //   return new Response("Server Configuration Error: Missing Environment Variables", { status: 500 });
  // }

  const db = ctx.env.DB;
  const prisma = getPrisma(db);
  
  // Merge process.env (for local dev) and ctx.env (for Cloudflare)
  const env = { ...process.env, ...ctx.env } as any;
  
  const config = createAuthConfig(prisma, env);
  const auth = NextAuth(config);
  if (req.method === "POST") {
    return auth.handlers.POST(req);
  }
  return auth.handlers.GET(req);
}

export const GET = handler;
export const POST = handler;