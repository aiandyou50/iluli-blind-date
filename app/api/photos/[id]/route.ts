import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    // 1. Get photo info to delete from R2 (optional, but good practice)
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    // 2. Delete from DB
    await prisma.photo.delete({
      where: { id },
    });

    // 3. Delete from R2
    const bucket = ctx.env.R2;
    if (bucket) {
       // Assuming URL is like https://domain/key
       const key = photo.url.split('/').pop(); 
       if (key) await bucket.delete(key);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
