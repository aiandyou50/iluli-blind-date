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
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { nickname: true, email: true } },
        target: { select: { nickname: true, email: true, status: true, lastActiveAt: true } }
      }
    });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { reportId: string; action: "WARN" | "BAN" | "DISMISS" };
  const { reportId, action } = body;

  const ctx = getRequestContext();
  const db = ctx.env.DB;
  const prisma = getPrisma(db);

  try {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const now = new Date();

    // Update Report Status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "RESOLVED",
        action: action,
        handledAt: now
      }
    });

    // Execute Action
    if (action === "WARN") {
      await prisma.user.update({
        where: { id: report.targetId },
        data: { lastActiveAt: new Date(0) }
      });
    } else if (action === "BAN") {
      await prisma.user.update({
        where: { id: report.targetId },
        data: { status: "BANNED" }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
