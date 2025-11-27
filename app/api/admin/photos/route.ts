import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getToken } from 'next-auth/jwt';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const db = ctx.env.DB || (process.env as any).DB;
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    // @ts-ignore
    const adminPasswordEnv = ctx.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    if (!db) return new NextResponse('Database binding not found', { status: 500 });

    const adminPasswordHeader = req.headers.get('x-admin-password');
    let isAuthenticated = false;

    // 1. Check Admin Password (Bypass)
    if (adminPasswordEnv && adminPasswordHeader === adminPasswordEnv) {
      isAuthenticated = true;
    } else {
      // 2. Check NextAuth Session
      let token = await getToken({ req, secret });
      if (!token) {
        token = await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' });
      }

      if (token && token.email) {
        const prisma = getPrisma(db);
        const user = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true }
        });
        if (user && user.role === 'ADMIN') {
          isAuthenticated = true;
        }
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma(db);

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
    const ctx = getRequestContext();
    // @ts-ignore
    const db = ctx.env.DB || (process.env as any).DB;
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    // @ts-ignore
    const adminPasswordEnv = ctx.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    if (!db) return new NextResponse('Database binding not found', { status: 500 });

    const adminPasswordHeader = req.headers.get('x-admin-password');
    let isAuthenticated = false;

    // 1. Check Admin Password (Bypass)
    if (adminPasswordEnv && adminPasswordHeader === adminPasswordEnv) {
      isAuthenticated = true;
    } else {
      // 2. Check NextAuth Session
      let token = await getToken({ req, secret });
      if (!token) {
        token = await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' });
      }

      if (token && token.role === 'ADMIN') {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photoId } = await req.json();
    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    const prisma = getPrisma(db);
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete from R2
    // @ts-ignore
    const R2_ACCOUNT_ID = ctx.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
    // @ts-ignore
    const R2_ACCESS_KEY_ID = ctx.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
    // @ts-ignore
    const R2_SECRET_ACCESS_KEY = ctx.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
    // @ts-ignore
    const R2_BUCKET_NAME = ctx.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "iluli-photos";

    if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      });

      try {
        await S3.send(new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: photo.url
        }));
      } catch (e) {
        console.error("Failed to delete from R2:", e);
        // Proceed to delete from DB even if R2 fails
      }
    }

    // Delete from DB
    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
