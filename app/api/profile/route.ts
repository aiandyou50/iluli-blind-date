import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string; instagramId?: string; introduction?: string; nickname?: string; gender?: string };
    const { email, instagramId, introduction, nickname, gender } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse("Database binding missing", { status: 500 });
    }

    const prisma = getPrisma(db);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        instagramId,
        introduction,
        nickname,
        gender,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new NextResponse("Email is required", { status: 400 });
  }

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse("Database binding missing", { status: 500 });
    }

    const prisma = getPrisma(db);  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        photos: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { likes: true } }
          }
        }
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Patch photo URLs if missing domain
    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";
    if (user.photos) {
      user.photos = user.photos.map((photo: any) => {
        if (photo.url && !photo.url.startsWith('http')) {
          return { ...photo, url: `${publicUrl}/${photo.url}` };
        }
        return photo;
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
