import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

// [EN] GET /api/matches/matched - Returns all users that have been matched with the current user
// [KR] GET /api/matches/matched - 현재 사용자와 매칭된 모든 사용자 반환
export async function GET(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    let token = await getToken({ req, secret });

    if (!token) {
      token = await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' });
    }

    if (!token || !token.sub) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = token.sub;

    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);

    // [EN] Find all matches where the current user is either user1 or user2
    // [KR] 현재 사용자가 user1 또는 user2인 모든 매치 찾기
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            nickname: true,
            instagramId: true,
            image: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' }
            }
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            nickname: true,
            instagramId: true,
            image: true,
            photos: {
              take: 1,
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // [EN] Transform to return only the other user (not self)
    // [KR] 자신이 아닌 다른 사용자만 반환하도록 변환
    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";
    
    const matchedUsers = matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      let avatar = otherUser.image;
      
      if (otherUser.photos && otherUser.photos.length > 0) {
        const photoUrl = otherUser.photos[0].url;
        avatar = photoUrl.startsWith('http') ? photoUrl : `${publicUrl}/${photoUrl}`;
      }
      
      return {
        id: otherUser.id,
        name: otherUser.name,
        nickname: otherUser.nickname,
        instagramId: otherUser.instagramId,
        avatar,
        matchedAt: match.createdAt.toISOString()
      };
    });

    return NextResponse.json(matchedUsers);
  } catch (error: any) {
    console.error("Error fetching matched users:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
