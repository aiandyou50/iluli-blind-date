import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string; instagramId?: string; bio?: string };
    const { email, instagramId, bio } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const ctx = getRequestContext();
    if (!ctx.env.DB) {
      return new NextResponse("Database binding missing", { status: 500 });
    }

    const prisma = getPrisma(ctx.env.DB);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        instagramId,
        bio,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new NextResponse("Email is required", { status: 400 });
  }

  const ctx = getRequestContext();
  if (!ctx.env.DB) {
    return new NextResponse("Database binding missing", { status: 500 });
  }

  const prisma = getPrisma(ctx.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
