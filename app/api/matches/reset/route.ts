import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    
    let token = await getToken({ req, secret });
    if (!token) {
      token = await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' });
    }

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    // Delete all Pass records for this user
    await prisma.pass.deleteMany({
      where: {
        fromUserId: userId
      }
    });

    return NextResponse.json({ success: true, message: 'Pass history reset' });

  } catch (error) {
    console.error('Error resetting matches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
