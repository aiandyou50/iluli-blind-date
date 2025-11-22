import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const email = searchParams.get('email');

    // Simple protection: require a secret query param
    // In production, you should use a strong secret or remove this route after use
    if (secret !== 'iluli-admin-setup-2024') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!email) {
      return new NextResponse('Email required', { status: 400 });
    }

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Admin setup error:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
