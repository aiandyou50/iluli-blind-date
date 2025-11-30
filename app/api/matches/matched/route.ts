import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

// [EN] Get all matched users (mutual likes) for the current user
// [KR] 현재 사용자의 모든 매칭된 사용자(상호 좋아요) 조회
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;
    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);
    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";

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

    // [EN] Transform matches to get the other user's info
    // [KR] 상대 사용자 정보를 얻기 위해 매치 변환
    const matchedUsers = matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      const photoUrl = otherUser.photos?.[0]?.url;
      
      return {
        id: otherUser.id,
        name: otherUser.name,
        nickname: otherUser.nickname,
        instagramId: otherUser.instagramId,
        avatar: photoUrl 
          ? (photoUrl.startsWith('http') ? photoUrl : `${publicUrl}/${photoUrl}`)
          : otherUser.image,
        matchedAt: match.createdAt.toISOString()
      };
    });

    return NextResponse.json(matchedUsers);

  } catch (error) {
    console.error('Error fetching matched users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
