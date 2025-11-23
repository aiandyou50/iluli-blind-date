import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getToken } from 'next-auth/jwt';
import { adminUserUpdateSchema } from '@/lib/validations';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // Fallback to process.env for local dev if ctx.env is empty (though getRequestContext should handle it if configured right)
    // @ts-ignore
    const db = ctx.env.DB || (process.env as any).DB;
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    // @ts-ignore
    const adminPasswordEnv = ctx.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    
    const adminPasswordHeader = req.headers.get('x-admin-password');
    let isAuthenticated = false;

    // 1. Check Admin Password (Bypass)
    if (adminPasswordEnv && adminPasswordHeader === adminPasswordEnv) {
      isAuthenticated = true;
    } else {
      // 2. Check NextAuth Session
      if (!secret) {
        console.error("AUTH_SECRET is missing in Admin API route");
        return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
      }

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
      console.log("Admin API: Unauthorized access attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma(db);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { 
            photos: true, 
            sentLikes: true,
            reportsReceived: true,
            blocksReceived: true
          }
        }
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
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
    const admin = await prisma.user.findUnique({
      where: { email: token.email },
      select: { role: true }
    });

    if (!admin || admin.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const validation = adminUserUpdateSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ error: "Validation Error", details: validation.error.format() }, { status: 400 });
    }

    const { userId, status } = validation.data;

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
    const admin = await prisma.user.findUnique({
      where: { email: token.email },
      select: { role: true }
    });

    if (!admin || admin.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

    await prisma.user.update({
      where: { id: userId },
      data: { status: status as any } // 'ACTIVE' | 'BANNED'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
