import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware } from '../middleware/auth';

const users = new Hono<{ Bindings: Env }>();

/**
 * GET /api/v1/users/:userId/profile
 * 타 사용자의 공개 프로필 조회 (PRD-USER-002)
 * 
 * @description
 * - 승인된(approved) 사진만 반환
 * - 민감 정보(email, google_subject_id 등) 제외
 * - instagram_url은 NULL이 아닐 경우에만 포함
 */
users.get('/:userId/profile', authMiddleware, async (c) => {
  const targetUserId = c.req.param('userId');

  try {
    // 1. 사용자 프로필 정보 조회
    const profileResult = await c.env.DB.prepare(`
      SELECT 
        u.id,
        up.nickname,
        up.school,
        up.mbti,
        up.bio,
        up.instagram_url,
        up.major,
        up.student_id_card_status,
        up.gender,
        up.age
      FROM Users u
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      WHERE u.id = ?
    `).bind(targetUserId).first();

    if (!profileResult) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 2. 승인된 사진만 조회 (verification_status = 'approved')
    const photosResult = await c.env.DB.prepare(`
      SELECT 
        id,
        image_url,
        likes_count
      FROM ProfilePhotos
      WHERE user_id = ?
        AND verification_status = 'approved'
      ORDER BY created_at DESC
    `).bind(targetUserId).all();

    // 3. 응답 데이터 구성
    const profile: any = {
      nickname: profileResult.nickname || '익명',
      school: profileResult.school,
      mbti: profileResult.mbti,
      bio: profileResult.bio,
      major: profileResult.major,
      gender: profileResult.gender,
      age: profileResult.age,
      student_verified: profileResult.student_id_card_status === 'verified',
    };

    // instagram_url은 NULL이 아닐 때만 포함
    if (profileResult.instagram_url) {
      profile.instagram_url = profileResult.instagram_url;
    }

    const response = {
      profile,
      photos: photosResult.results.map((photo: any) => ({
        id: photo.id,
        image_url: photo.image_url,
        likes_count: photo.likes_count || 0,
      })),
    };

    return c.json(response, 200);

  } catch (error) {
    console.error('Error fetching public profile:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default users;
