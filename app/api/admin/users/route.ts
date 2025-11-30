import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = getRequestContext();
  const db = ctx.env.DB;
  const prisma = getPrisma(db);

  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { status: "asc" }, // PENDING first
        { lastActiveAt: "desc" }
      ],
      select: {
        id: true,
        nickname: true,
        email: true,
        school: true,
        instagramId: true,
        status: true,
        verificationCode: true,
        lastActiveAt: true,
        hasAvifImage: true,
        primaryImageExt: true,
        photos: {
            select: {
                url: true
            },
            take: 1
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
