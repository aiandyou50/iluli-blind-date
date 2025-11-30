import { getPrisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse("Database binding not found", { status: 500 });
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

    const targetGender = currentUser.gender === "MALE" ? "FEMALE" : "MALE";

    // 1. Get IDs of users I have liked
    const liked = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true }
    });
    const likedIds = liked.map(l => l.toUserId);

    // 1.1 Get IDs of users I have passed
    const passed = await prisma.pass.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true }
    });
    const passedIds = passed.map(p => p.toUserId);

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
      select: { targetId: true } // Updated to targetId
    });
    const reportedIds = reported.map(r => r.targetId);

    // Combine all excluded IDs
    const excludedIds = [
      userId, // Self
      ...likedIds,
      ...passedIds,
      ...blockedIds,
      ...blockedByIds,
      ...reportedIds
    ];

    // Ghost User Filter: lastActiveAt > 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch candidates
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        gender: targetGender,
        status: "ACTIVE",
        lastActiveAt: {
            gte: sevenDaysAgo
        }
      },
      include: {
        photos: { 
          take: 1,
          orderBy: { order: "asc" }
        }
      },
      take: 20
    });

    // Patch photo URLs if missing domain
    // @ts-ignore
    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";
    const usersWithPhotos = users.map((user: any) => {
      if (user.photos) {
        user.photos = user.photos.map((photo: any) => {
          if (photo.url && !photo.url.startsWith("http")) {
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
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
