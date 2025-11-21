import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const db = ctx.env.DB || (process.env as any).DB;
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;

    if (!db) return new NextResponse('Database binding not found', { status: 500 });

    // Auth Check
    const token = await getToken({ req, secret });
    if (!token || !token.email) return new NextResponse('Unauthorized', { status: 401 });

    const prisma = getPrisma(db);

    // Check Admin Role
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    const ctx = getRequestContext();
    // @ts-ignore
    const db = ctx.env.DB || (process.env as any).DB;
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;

    if (!db) return new NextResponse('Database binding not found', { status: 500 });

    // Auth Check
    const token = await getToken({ req, secret });
    if (!token || !token.email) return new NextResponse('Unauthorized', { status: 401 });

    const prisma = getPrisma(db);

    // Check Admin Role
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    // Note: In a real app, we should also delete from R2 storage here.
    await prisma.photo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
