import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import Geohash from 'ngeohash';

const profile = new Hono<{ Bindings: Env }>();

/**
 * GET /api/v1/profile
 * 내 프로필 정보 조회 (PRD-USER-001)
 */
profile.get('/', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);

  const profileData = await c.env.DB.prepare(`
    SELECT 
      u.id AS user_id,
      u.email,
      p.nickname,
      p.school,
      p.mbti,
      p.bio,
      p.instagram_url,
      p.latitude,
      p.longitude,
      p.location_updated_at
    FROM Users u
    LEFT JOIN UserProfiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(authUser.userId).first();

  if (!profileData) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // 내가 올린 사진 목록 조회
  const photos = await c.env.DB.prepare(`
    SELECT id, image_url, verification_status, rejection_reason, created_at, likes_count
    FROM ProfilePhotos
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(authUser.userId).all();

  return c.json({
    profile: profileData,
    photos: photos.results || [],
  });
});

/**
 * PATCH /api/v1/profile
 * 내 프로필 정보 수정 (PRD-USER-001 v2.5)
 */
profile.patch('/', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const body = await c.req.json<{
    nickname?: string;
    school?: string;
    mbti?: string;
    bio?: string;
    instagram_url?: string | null;
    latitude?: number;
    longitude?: number;
  }>();

  // instagram_url 유효성 검사
  if (body.instagram_url !== undefined && body.instagram_url !== null) {
    if (!body.instagram_url.startsWith('https://www.instagram.com/')) {
      return c.json({ error: 'instagram_url must start with https://www.instagram.com/' }, 400);
    }
  }

  // Geohash 계산 (위치 정보가 제공된 경우)
  let geohash: string | null = null;
  if (body.latitude !== undefined && body.longitude !== undefined) {
    geohash = Geohash.encode(body.latitude, body.longitude, 7); // 정밀도 7
  }

  // 동적 UPDATE 쿼리 생성
  const updates: string[] = [];
  const params: any[] = [];

  if (body.nickname !== undefined) {
    updates.push('nickname = ?');
    params.push(body.nickname);
  }
  if (body.school !== undefined) {
    updates.push('school = ?');
    params.push(body.school);
  }
  if (body.mbti !== undefined) {
    updates.push('mbti = ?');
    params.push(body.mbti);
  }
  if (body.bio !== undefined) {
    updates.push('bio = ?');
    params.push(body.bio);
  }
  if (body.instagram_url !== undefined) {
    updates.push('instagram_url = ?');
    params.push(body.instagram_url);
  }
  if (body.latitude !== undefined) {
    updates.push('latitude = ?');
    params.push(body.latitude);
  }
  if (body.longitude !== undefined) {
    updates.push('longitude = ?');
    params.push(body.longitude);
  }
  if (geohash !== null) {
    updates.push('geohash = ?');
    params.push(geohash);
    updates.push('location_updated_at = CURRENT_TIMESTAMP');
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  params.push(authUser.userId);

  try {
    await c.env.DB.prepare(`
      UPDATE UserProfiles
      SET ${updates.join(', ')}
      WHERE user_id = ?
    `).bind(...params).run();

    return c.json({ message: 'Profile updated successfully' }, 200);
  } catch (error: any) {
    // UNIQUE 제약 위반 (닉네임 중복)
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: 'Nickname already exists' }, 409);
    }
    throw error;
  }
});

export default profile;
