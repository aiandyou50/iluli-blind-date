import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    // @ts-ignore
    const db = (process.env as any).DB || (req as any).env?.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    if (userId) {
      const photos = await prisma.photo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(photos);
    } else {
      // Feed: Get all photos with user info
      const photos = await prisma.photo.findMany({
        include: {
          user: {
            select: {
              name: true,
              instagramId: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return NextResponse.json(photos);
    }
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, userId } = body as { url: string; userId: string };

    if (!url || !userId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // @ts-ignore
    const db = (process.env as any).DB || (req as any).env?.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    const photo = await prisma.photo.create({
      data: {
        url,
        userId,
        order: 0,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error saving photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
