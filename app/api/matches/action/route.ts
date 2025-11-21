import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { userId: string; photoId: string; action: string };
    const { userId, photoId, action } = body; // action: 'like' | 'pass'

    if (action === 'pass') {
        // We don't store passes in this simple version, just return success
        return NextResponse.json({ success: true });
    }

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    if (action === 'like' && userId && photoId) {
      // Create Like on the photo
      // Use upsert to avoid error if already liked
      await prisma.like.upsert({
        where: {
            userId_photoId: {
                userId,
                photoId
            }
        },
        create: { userId, photoId },
        update: {}
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("Error in match action:", error);
    return new NextResponse('Error', { status: 500 });
  }
}
