import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  // Admin Check
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { userId: string; code: string };
  const { userId, code } = body;

  if (!userId || !code) {
    return NextResponse.json({ error: "Missing userId or code" }, { status: 400 });
  }

  const ctx = getRequestContext();
  const db = ctx.env.DB;
  const prisma = getPrisma(db);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Verify Success
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        verificationCode: null, // Clear code after usage
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
