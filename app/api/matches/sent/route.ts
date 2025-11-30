import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

// [EN] GET /api/matches/sent - Returns all users that the current user has liked (but not yet matched)
// [KR] GET /api/matches/sent - 현재 사용자가 좋아요를 보냈지만 아직 매칭되지 않은 모든 사용자 반환
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

    // [EN] Find all likes sent by the current user
    // [KR] 현재 사용자가 보낸 모든 좋아요 찾기
    const sentLikes = await prisma.like.findMany({
      where: {
        fromUserId: userId
      },
      orderBy: { createdAt: 'desc' }
    });

    // [EN] Get all matches to exclude matched users from sent likes
    // [KR] 보낸 좋아요에서 매칭된 사용자를 제외하기 위해 모든 매치 가져오기
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    // [EN] Get IDs of matched users
    // [KR] 매칭된 사용자 ID 가져오기
    const matchedUserIds = new Set(
      matches.map(m => m.user1Id === userId ? m.user2Id : m.user1Id)
    );

    // [EN] Filter out matched users from sent likes
    // [KR] 보낸 좋아요에서 매칭된 사용자 필터링
    const pendingLikeUserIds = sentLikes
      .filter(like => !matchedUserIds.has(like.toUserId))
      .map(like => like.toUserId);

    if (pendingLikeUserIds.length === 0) {
      return NextResponse.json([]);
    }

    // [EN] Fetch user details for pending likes
    // [KR] 대기 중인 좋아요에 대한 사용자 세부 정보 가져오기
    const users = await prisma.user.findMany({
      where: {
        id: { in: pendingLikeUserIds }
      },
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

    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";

    // [EN] Transform to include sentAt time
    // [KR] sentAt 시간을 포함하도록 변환
    const result = pendingLikeUserIds.map(targetId => {
      const user = users.find(u => u.id === targetId);
      const like = sentLikes.find(l => l.toUserId === targetId);
      
      if (!user) return null;

      let avatar = user.image;
      if (user.photos && user.photos.length > 0) {
        const photoUrl = user.photos[0].url;
        avatar = photoUrl.startsWith('http') ? photoUrl : `${publicUrl}/${photoUrl}`;
      }

      return {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        avatar,
        sentAt: like?.createdAt.toISOString()
      };
    }).filter(Boolean);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching sent likes:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
