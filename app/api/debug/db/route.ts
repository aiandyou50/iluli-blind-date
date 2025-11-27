import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getPrisma } from "@/lib/db";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const ctx = getRequestContext();
  
  try {
    // @ts-ignore
    const db = ctx.env.DB;
    if (!db) {
      return NextResponse.json({ error: "DB binding missing" }, { status: 500 });
    }

    const prisma = getPrisma(db);
    
    // Try to count users to check if table exists
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      status: "ok", 
      message: "Connected to D1", 
      userCount 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      status: "error", 
      message: e.message, 
      stack: e.stack 
    }, { status: 500 });
  }
}
