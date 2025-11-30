import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

// [EN] Get all sent likes (that haven't been reciprocated) for the current user
// [KR] 현재 사용자의 보낸 좋아요(아직 상호 좋아요가 아닌) 조회
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

    // [EN] First get all matches to exclude them
    // [KR] 제외할 모든 매치 먼저 조회
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      select: {
        user1Id: true,
        user2Id: true
      }
    });

    // [EN] Get matched user IDs
    // [KR] 매칭된 사용자 ID 조회
    const matchedUserIds = matches.map(m => 
      m.user1Id === userId ? m.user2Id : m.user1Id
    );

    // [EN] Find all likes sent by current user that are not reciprocated (not in matches)
    // [KR] 현재 사용자가 보낸 좋아요 중 상호 좋아요가 아닌 것(매치에 없는 것) 찾기
    const sentLikes = await prisma.like.findMany({
      where: {
        fromUserId: userId,
        toUserId: { notIn: matchedUserIds }
      },
      include: {
        user: false
      },
      orderBy: { createdAt: 'desc' }
    });

    // [EN] Get user info for each liked user
    // [KR] 좋아요를 보낸 각 사용자의 정보 조회
    const likedUserIds = sentLikes.map(l => l.toUserId);
    const users = await prisma.user.findMany({
      where: { id: { in: likedUserIds } },
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        photos: {
          take: 1,
          orderBy: { order: 'asc' }
        }
      }
    });

    // [EN] Create a map for quick lookup
    // [KR] 빠른 조회를 위한 맵 생성
    const userMap = new Map(users.map(u => [u.id, u]));

    // [EN] Transform sent likes to include user info
    // [KR] 사용자 정보를 포함하도록 보낸 좋아요 변환
    const result = sentLikes.map(like => {
      const user = userMap.get(like.toUserId);
      if (!user) return null;
      
      const photoUrl = user.photos?.[0]?.url;
      
      return {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatar: photoUrl 
          ? (photoUrl.startsWith('http') ? photoUrl : `${publicUrl}/${photoUrl}`)
          : user.image,
        sentAt: like.createdAt.toISOString()
      };
    }).filter(Boolean);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching sent likes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
