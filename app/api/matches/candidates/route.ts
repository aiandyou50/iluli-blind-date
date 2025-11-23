import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    
    if (!secret) {
      console.error("AUTH_SECRET is missing in API route");
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    const token = await getToken({ req, secret });

    if (!token || !token.sub) {
      console.log("Token not found or invalid", { hasToken: !!token, sub: token?.sub });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    // Get current user to know their gender
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true }
    });

    if (!currentUser || !currentUser.gender) {
      return NextResponse.json([]);
    }

    const targetGender = currentUser.gender === 'MALE' ? 'FEMALE' : 'MALE';

    // 1. Get IDs of users I have liked
    const liked = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true }
    });
    const likedIds = liked.map(l => l.toUserId);

    // 2. Get IDs of users I have blocked
    const blocked = await prisma.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true }
    });
    const blockedIds = blocked.map(b => b.blockedId);

    // 3. Get IDs of users who have blocked me
    const blockedBy = await prisma.block.findMany({
      where: { blockedId: userId },
      select: { blockerId: true }
    });
    const blockedByIds = blockedBy.map(b => b.blockerId);

    // 4. Get IDs of users I have reported
    const reported = await prisma.report.findMany({
      where: { reporterId: userId },
      select: { reportedId: true }
    });
    const reportedIds = reported.map(r => r.reportedId);

    // Combine all excluded IDs
    const excludedIds = [
      userId, // Self
      ...likedIds,
      ...blockedIds,
      ...blockedByIds,
      ...reportedIds
    ];

    // Fetch candidates
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        gender: targetGender,
        status: 'ACTIVE' // Only active users
      },
      include: {
        photos: { 
          take: 1,
          orderBy: { order: 'asc' }
        }
      },
      take: 20
    });

    // Patch photo URLs if missing domain
    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";
    const usersWithPhotos = users.map((user: any) => {
      if (user.photos) {
        user.photos = user.photos.map((photo: any) => {
          if (photo.url && !photo.url.startsWith('http')) {
            return { ...photo, url: `${publicUrl}/${photo.url}` };
          }
          return photo;
        });
      }
      return user;
    });

    return NextResponse.json(usersWithPhotos);
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
