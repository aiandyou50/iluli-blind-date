import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Current user

    // @ts-ignore
    const db = (process.env as any).DB || (req as any).env?.DB;
    const prisma = getPrisma(db);

    // Get users not yet liked/passed by current user
    // Simplified: Get all users except self
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: userId || '' }
      },
      include: {
        photos: { take: 1 }
      },
      take: 10
    });

    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
}
