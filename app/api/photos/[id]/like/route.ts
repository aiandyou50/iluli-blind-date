import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as { userId: string };
    const { userId } = body;

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    const prisma = getPrisma(db);

    const existing = await prisma.photoLike.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId: id
        }
      }
    });

    if (existing) {
      await prisma.photoLike.delete({
        where: {
          userId_photoId: {
            userId,
            photoId: id
          }
        }
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.photoLike.create({
        data: {
          userId,
          photoId: id
        }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse('Error', { status: 500 });
  }
}
