import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const ctx = getRequestContext();
  
  // Helper to check if a value exists and mask it
  const check = (val: any) => {
    if (!val) return "MISSING";
    if (typeof val === 'string') {
      return `PRESENT (Length: ${val.length})`;
    }
    return "PRESENT (Object)";
  };

  // @ts-ignore
  const env = (ctx.env || process.env) as any;

  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      AUTH_SECRET: check(env.AUTH_SECRET),
      AUTH_GOOGLE_ID: check(env.AUTH_GOOGLE_ID),
      AUTH_GOOGLE_SECRET: check(env.AUTH_GOOGLE_SECRET),
      NEXTAUTH_URL: check(env.NEXTAUTH_URL),
      ADMIN_EMAILS: check(env.ADMIN_EMAILS),
    },
    bindings: {
      DB: check(env.DB),
      R2_BUCKET: check(env.R2_BUCKET_NAME),
    },
    runtime: {
      isEdge: true, // We are forcing edge runtime
      nodeEnv: process.env.NODE_ENV,
    }
  };

  return NextResponse.json(report);
}
