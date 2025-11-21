import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    if (userId) {
      const photos = await prisma.photo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { likes: true } }
        }
      });
      return NextResponse.json(photos);
    } else {
      // Feed: Get all photos with user info
      const sort = searchParams.get('sort') || 'latest';
      let orderBy: any = { createdAt: 'desc' };
      
      if (sort === 'popular') {
        orderBy = { likes: { _count: 'desc' } };
      }

      const photos = await prisma.photo.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              instagramId: true,
              image: true,
            }
          },
          _count: {
            select: { likes: true }
          }
        },
        orderBy,
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
    const { url, userId, caption } = body as { url: string; userId: string; caption?: string };

    if (!url || !userId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    const photo = await prisma.photo.create({
      data: {
        url,
        userId,
        caption,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error saving photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
