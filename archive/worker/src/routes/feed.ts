import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import Geohash from 'ngeohash';

const feed = new Hono<{ Bindings: Env }>();

/**
 * GET /api/v1/feed
 * 메인 피드 조회 (PRD-USER-003)
 * 
 * @query sort - latest (기본), oldest, popular, random, distance
 * @query page - 페이지 번호 (기본: 1)
 * @query lat - 위도 (distance 정렬 시 필수)
 * @query lon - 경도 (distance 정렬 시 필수)
 */
feed.get('/', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const sort = c.req.query('sort') || 'latest';
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = 20;
  const offset = (page - 1) * perPage;

  try {
    let query = `
      SELECT 
        pp.id AS photo_id,
        pp.image_url,
        pp.likes_count,
        pp.verification_status,
        pp.created_at AS photo_created_at,
        u.id AS user_id,
        up.nickname,
        up.latitude,
        up.longitude
      FROM ProfilePhotos pp
      INNER JOIN Users u ON pp.user_id = u.id
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      WHERE pp.user_id != ?
    `;

    // 정렬 옵션
    switch (sort) {
      case 'oldest':
        query += ' ORDER BY pp.created_at ASC';
        break;
      case 'popular':
        query += ' ORDER BY pp.likes_count DESC, pp.created_at DESC';
        break;
      case 'random':
        query += ' ORDER BY RANDOM()';
        break;
      case 'distance':
        // 거리순은 클라이언트에서 좌표를 보내야 함
        const lat = parseFloat(c.req.query('lat') || '0');
        const lon = parseFloat(c.req.query('lon') || '0');
        
        if (!lat || !lon) {
          return c.json({ error: 'Latitude and longitude required for distance sort' }, 400);
        }
        
        // D1은 GeoSpatial 쿼리를 지원하지 않으므로 전체 데이터를 가져와서 메모리에서 정렬
        // 실제 프로덕션에서는 Geohash 기반 필터링 후 정렬을 권장
        query += ' ORDER BY pp.created_at DESC';
        break;
      case 'latest':
      default:
        query += ' ORDER BY pp.created_at DESC';
    }

    query += ` LIMIT ${perPage + 1} OFFSET ${offset}`;

    const result = await c.env.DB.prepare(query).bind(authUser.userId).all();
    let feedItems = result.results;

    // distance 정렬일 경우 메모리에서 거리 계산 후 정렬
    if (sort === 'distance') {
      const lat = parseFloat(c.req.query('lat') || '0');
      const lon = parseFloat(c.req.query('lon') || '0');
      
      feedItems = feedItems
        .map((item: any) => {
          if (!item.latitude || !item.longitude) {
            return { ...item, distance: Infinity };
          }
          
          // Haversine formula로 거리 계산
          const distance = calculateDistance(
            lat,
            lon,
            item.latitude,
            item.longitude
          );
          
          return { ...item, distance };
        })
        .sort((a: any, b: any) => a.distance - b.distance);
    }

    // 다음 페이지 여부 확인
    const hasMore = feedItems.length > perPage;
    if (hasMore) {
      feedItems = feedItems.slice(0, perPage);
    }

    // 각 사진에 대해 내가 좋아요를 눌렀는지 확인
    const photoIds = feedItems.map((item: any) => item.photo_id);
    let myLikes: Set<string> = new Set();

    if (photoIds.length > 0) {
      const likesQuery = `
        SELECT photo_id
        FROM Likes
        WHERE user_id = ? AND photo_id IN (${photoIds.map(() => '?').join(',')})
      `;
      const likesResult = await c.env.DB.prepare(likesQuery)
        .bind(authUser.userId, ...photoIds)
        .all();
      
      myLikes = new Set(likesResult.results.map((row: any) => row.photo_id));
    }

    // 응답 데이터 구성
    const feed = feedItems.map((item: any) => ({
      photo_id: item.photo_id,
      image_url: item.image_url,
      user: {
        user_id: item.user_id,
        nickname: item.nickname || '익명',
      },
      likes_count: item.likes_count || 0,
      i_like_this: myLikes.has(item.photo_id),
      verification_status: item.verification_status || 'not_applied',
    }));

    return c.json({
      feed,
      next_page: hasMore ? page + 1 : null,
    });

  } catch (error) {
    console.error('Error fetching feed:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * Haversine formula로 두 지점 간 거리 계산 (km)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default feed;
