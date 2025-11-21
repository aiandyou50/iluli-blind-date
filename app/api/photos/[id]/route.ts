import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function DELETE(
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

    // 3. Delete from R2 (We need the key. Assuming URL structure or storing key would be better, 
    // but for now we just delete the DB record. R2 cleanup can be a separate cron job or improved later)
    // If we wanted to delete from R2 immediately:
    // const bucket = (process.env as any).PHOTOS_BUCKET || (req as any).env?.PHOTOS_BUCKET;
    // if (bucket) {
    //   const key = photo.url.split('/').pop(); // Simple extraction
    //   if (key) await bucket.delete(key);
    // }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
