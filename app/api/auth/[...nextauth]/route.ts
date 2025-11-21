import NextAuth from "next-auth";
import { createAuthConfig } from "@/lib/auth/config";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

async function handler(req: Request) {
  const ctx = getRequestContext();
  const db = ctx.env.DB;
  const prisma = getPrisma(db);
  const config = createAuthConfig(prisma);
  // @ts-expect-error NextAuth type definition mismatch with Edge Runtime
  return NextAuth(config).handlers.GET(req);
}

export const GET = handler;
export const POST = handler;