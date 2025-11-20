import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware, getAuthUser } from '../middleware/auth';

const likes = new Hono<{ Bindings: Env }>();

/**
 * POST /api/v1/photos/:photoId/like
 * 사진에 좋아요 누르기 (PRD-USER-004)
 */
likes.post('/:photoId/like', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const photoId = c.req.param('photoId');

  try {
    // 1. 사진이 존재하는지 확인
    const photo = await c.env.DB.prepare(`
      SELECT id, user_id
      FROM ProfilePhotos
      WHERE id = ?
    `).bind(photoId).first();

    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    // 2. 자기 사진에는 좋아요 불가
    if (photo.user_id === authUser.userId) {
      return c.json({ error: 'Cannot like your own photo' }, 400);
    }

    // 3. 이미 좋아요를 눌렀는지 확인
    const existingLike = await c.env.DB.prepare(`
      SELECT user_id, photo_id
      FROM Likes
      WHERE user_id = ? AND photo_id = ?
    `).bind(authUser.userId, photoId).first();

    if (existingLike) {
      return c.json({ error: 'Already liked' }, 400);
    }

    // 4. 트랜잭션으로 Likes 테이블 삽입 + ProfilePhotos likes_count 증가
    await c.env.DB.batch([
      c.env.DB.prepare(`
        INSERT INTO Likes (user_id, photo_id)
        VALUES (?, ?)
      `).bind(authUser.userId, photoId),
      c.env.DB.prepare(`
        UPDATE ProfilePhotos
        SET likes_count = likes_count + 1
        WHERE id = ?
      `).bind(photoId),
    ]);

    return c.json({ message: 'Liked successfully' }, 200);

  } catch (error: any) {
    console.error('Error liking photo:', error);
    
    // PRIMARY KEY 위반 (이미 좋아요를 누른 경우)
    if (error.message?.includes('UNIQUE') || error.message?.includes('PRIMARY KEY')) {
      return c.json({ error: 'Already liked' }, 400);
    }
    
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/v1/photos/:photoId/unlike
 * 좋아요 취소 (PRD-USER-004)
 */
likes.post('/:photoId/unlike', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const photoId = c.req.param('photoId');

  try {
    // 1. 좋아요가 존재하는지 확인
    const existingLike = await c.env.DB.prepare(`
      SELECT user_id, photo_id
      FROM Likes
      WHERE user_id = ? AND photo_id = ?
    `).bind(authUser.userId, photoId).first();

    if (!existingLike) {
      return c.json({ error: 'Like not found' }, 404);
    }

    // 2. 트랜잭션으로 Likes 테이블 삭제 + ProfilePhotos likes_count 감소
    await c.env.DB.batch([
      c.env.DB.prepare(`
        DELETE FROM Likes
        WHERE user_id = ? AND photo_id = ?
      `).bind(authUser.userId, photoId),
      c.env.DB.prepare(`
        UPDATE ProfilePhotos
        SET likes_count = CASE 
          WHEN likes_count > 0 THEN likes_count - 1
          ELSE 0
        END
        WHERE id = ?
      `).bind(photoId),
    ]);

    return c.json({ message: 'Unliked successfully' }, 200);

  } catch (error) {
    console.error('Error unliking photo:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/v1/photos/:photoId/likers
 * 사진에 좋아요를 누른 사람 목록 조회 (PRD-USER-004)
 * 사진 소유자만 조회 가능
 */
likes.get('/:photoId/likers', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const photoId = c.req.param('photoId');

  try {
    // 1. 사진 소유권 확인
    const photo = await c.env.DB.prepare(`
      SELECT id, user_id
      FROM ProfilePhotos
      WHERE id = ?
    `).bind(photoId).first();

    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    if (photo.user_id !== authUser.userId) {
      return c.json({ error: 'Unauthorized: You are not the photo owner' }, 403);
    }

    // 2. 좋아요를 누른 사용자 목록 조회
    const likersResult = await c.env.DB.prepare(`
      SELECT 
        u.id AS user_id,
        up.nickname,
        l.created_at
      FROM Likes l
      INNER JOIN Users u ON l.user_id = u.id
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      WHERE l.photo_id = ?
      ORDER BY l.created_at DESC
    `).bind(photoId).all();

    const likers = likersResult.results.map((liker: any) => ({
      user_id: liker.user_id,
      nickname: liker.nickname || '익명',
      liked_at: liker.created_at,
    }));

    return c.json({
      likers,
      total_count: likers.length,
    });

  } catch (error) {
    console.error('Error fetching likers:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default likes;
