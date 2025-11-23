import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';
import { blockSchema } from '@/lib/validations';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token || !token.sub) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const validation = blockSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ error: "Validation Error", details: validation.error.format() }, { status: 400 });
    }

    const { targetUserId } = validation.data;

    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    // Create Block
    // Using create, if it already exists it might throw depending on schema constraints.
    // Assuming @@unique([blockerId, blockedId]) exists, we can use upsert or just try/catch.
    // Let's use create and catch unique constraint violation if necessary, or just let it be.
    // Actually, checking if it exists first is safer for logic, but upsert is atomic.
    // Let's use create, and if it fails, we assume it's already blocked.
    
    try {
        await prisma.block.create({
            data: {
                blockerId: token.sub,
                blockedId: targetUserId
            }
        });
    } catch (e: any) {
        // P2002 is Prisma unique constraint violation code
        if (e.code === 'P2002') {
            return NextResponse.json({ success: true, message: "Already blocked" });
        }
        throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating block:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
