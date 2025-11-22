import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Current user

    const ctx = getRequestContext();
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    if (!userId) {
       return new NextResponse('User ID required', { status: 400 });
    }

    // Get current user to know their gender
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true }
    });

    if (!currentUser || !currentUser.gender) {
      // If gender is not set, maybe return random or empty? 
      // For now, let's return empty to force them to complete profile, 
      // or just return all if we want to be lenient.
      // Spec says "Opposite gender", so we need gender.
      return NextResponse.json([]);
    }

    const targetGender = currentUser.gender === 'MALE' ? 'FEMALE' : 'MALE';

    // Get users not yet liked/passed by current user
    // Simplified: Get all users except self AND match target gender
    // TODO: Exclude already swiped users
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: userId },
        gender: targetGender
      },
      include: {
        photos: { 
          take: 1,
          orderBy: { createdAt: 'desc' } // Changed from order to createdAt as per schema
        }
      },
      take: 20
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
