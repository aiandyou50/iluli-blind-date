import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';
import { matchActionSchema } from '@/lib/validations';

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

    const userId = token.sub;
    const json = await req.json();
    const validation = matchActionSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ error: "Validation Error", details: validation.error.format() }, { status: 400 });
    }

    let { targetUserId, photoId, action } = validation.data;

    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }
    const prisma = getPrisma(db);

    // Resolve targetUserId if only photoId is provided
    if (!targetUserId && photoId) {
        const photo = await prisma.photo.findUnique({
            where: { id: photoId },
            select: { userId: true }
        });
        if (photo) {
            targetUserId = photo.userId;
        }
    }

    if (!targetUserId) {
        return new NextResponse('Target User ID required', { status: 400 });
    }

    if (targetUserId === userId) {
        return new NextResponse('Cannot like self', { status: 400 });
    }

    if (action === 'pass') {
        try {
            await prisma.pass.create({
                data: {
                    fromUserId: userId,
                    toUserId: targetUserId
                }
            });
        } catch (e: any) {
            if (e.code !== 'P2002') throw e;
            // Already passed
        }
        return NextResponse.json({ success: true, match: false });
    }

    if (action === 'like') {
        // 1. Create Like
        try {
            await prisma.like.create({
                data: {
                    fromUserId: userId,
                    toUserId: targetUserId
                }
            });
        } catch (e: any) {
            if (e.code !== 'P2002') throw e;
            // Already liked
        }

        // 2. Check if they liked me
        const otherLike = await prisma.like.findUnique({
            where: {
                fromUserId_toUserId: {
                    fromUserId: targetUserId,
                    toUserId: userId
                }
            }
        });

        if (otherLike) {
            // It's a match!
            const [u1, u2] = [userId, targetUserId].sort();
            
            try {
                await prisma.match.create({
                    data: {
                        user1Id: u1,
                        user2Id: u2
                    }
                });
            } catch (e: any) {
                if (e.code !== 'P2002') throw e;
            }

            return NextResponse.json({ success: true, match: true });
        }

        return NextResponse.json({ success: true, match: false });
    }
    
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in match action:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
