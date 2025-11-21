import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // @ts-ignore
    const db = (process.env as any).DB || (req as any).env?.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        instagramId: true,
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
