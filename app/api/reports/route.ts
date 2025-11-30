import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';
import { reportSchema } from '@/lib/validations';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token || !token.sub) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const validation = reportSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ error: "Validation Error", details: validation.error.format() }, { status: 400 });
    }

    const { targetUserId, reason, details } = validation.data;

    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    // Create Report
    await prisma.report.create({
      data: {
        reporterId: token.sub,
        targetId: targetUserId,
        reason,
        details
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
