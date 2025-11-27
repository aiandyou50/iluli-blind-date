import NextAuth from "next-auth";
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

  // [Adapter Injection] Merge core config with Prisma Adapter
  // This ensures users are saved to D1 while keeping config stateless for middleware
  const config = {
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    secret: ctx.env.AUTH_SECRET || process.env.AUTH_SECRET,
  };

  // @ts-ignore - NextAuth types mismatch with Edge Request sometimes, but it works
  return NextAuth(config).handlers.GET(req);
}

export const GET = handler;
export const POST = handler;