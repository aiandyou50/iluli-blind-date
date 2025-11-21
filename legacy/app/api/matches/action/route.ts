import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { fromUserId: string; toUserId: string; action: string };
    const { fromUserId, toUserId, action } = body; // action: 'like' | 'pass'

    // @ts-ignore
    const db = (process.env as any).DB || (req as any).env?.DB;
    const prisma = getPrisma(db);

    if (action === 'like') {
      // Create Like
      await prisma.like.create({
        data: { fromUserId, toUserId }
      });

      // Check for match
      const reciprocal = await prisma.like.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: toUserId,
            toUserId: fromUserId
          }
        }
      });

      if (reciprocal) {
        await prisma.match.create({
          data: { user1Id: fromUserId, user2Id: toUserId }
        });
        return NextResponse.json({ match: true });
      }
    }
    
    return NextResponse.json({ match: false });
  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
}
