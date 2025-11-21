import NextAuth from "next-auth";
import { createAuthConfig } from "@/lib/auth/config";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { NextRequest } from "next/server";

export const runtime = 'edge';

async function handler(req: NextRequest) {
  const ctx = getRequestContext();
  const db = ctx.env.DB;
  const prisma = getPrisma(db);
  const config = createAuthConfig(prisma);
  const auth = NextAuth(config);
  return auth.handlers.GET(req);
}

export const GET = handler;
export const POST = handler;