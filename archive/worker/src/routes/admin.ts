import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const admin = new Hono<{ Bindings: Env }>();

// 모든 admin 라우트에 인증 + 관리자 권한 체크 적용
admin.use('/*', authMiddleware, adminMiddleware);

/**
 * GET /api/v1/admin/photos/pending
 * 인증 대기 중인 사진 목록 조회
 */
admin.get('/photos/pending', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        pp.id,
        pp.image_url,
        pp.verification_status,
        pp.created_at,
        u.id AS user_id,
        u.email,
        up.nickname
      FROM ProfilePhotos pp
      INNER JOIN Users u ON pp.user_id = u.id
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      WHERE pp.verification_status = 'pending'
      ORDER BY pp.created_at ASC
    `).all();

    return c.json({
      photos: result.results.map((photo: any) => ({
        id: photo.id,
        image_url: photo.image_url,
        verification_status: photo.verification_status,
        created_at: photo.created_at,
        user: {
          id: photo.user_id,
          email: photo.email,
          nickname: photo.nickname || '익명',
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching pending photos:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/v1/admin/photos/:photoId/approve
 * 사진 인증 승인
 */
admin.post('/photos/:photoId/approve', async (c) => {
  const photoId = c.req.param('photoId');

  try {
    // 사진 존재 여부 확인
    const photo = await c.env.DB.prepare(`
      SELECT id, verification_status
      FROM ProfilePhotos
      WHERE id = ?
    `).bind(photoId).first();

    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    if (photo.verification_status !== 'pending') {
      return c.json({ error: 'Photo is not pending verification' }, 400);
    }

    // 승인 처리
    await c.env.DB.prepare(`
      UPDATE ProfilePhotos
      SET verification_status = 'approved', rejection_reason = NULL
      WHERE id = ?
    `).bind(photoId).run();

    return c.json({ message: 'Photo approved successfully' });
  } catch (error) {
    console.error('Error approving photo:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/v1/admin/photos/:photoId/reject
 * 사진 인증 거절
 * 
 * @body reason - 거절 사유
 */
admin.post('/photos/:photoId/reject', async (c) => {
  const photoId = c.req.param('photoId');
  const body = await c.req.json<{ reason?: string }>();

  try {
    // 사진 존재 여부 확인
    const photo = await c.env.DB.prepare(`
      SELECT id, verification_status
      FROM ProfilePhotos
      WHERE id = ?
    `).bind(photoId).first();

    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    if (photo.verification_status !== 'pending') {
      return c.json({ error: 'Photo is not pending verification' }, 400);
    }

    // 거절 처리
    await c.env.DB.prepare(`
      UPDATE ProfilePhotos
      SET verification_status = 'rejected', rejection_reason = ?
      WHERE id = ?
    `).bind(body.reason || 'No reason provided', photoId).run();

    return c.json({ message: 'Photo rejected successfully' });
  } catch (error) {
    console.error('Error rejecting photo:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/v1/admin/photos
 * 모든 사진 목록 조회 (필터링 가능)
 * 
 * @query status - verification_status 필터 (선택)
 * @query page - 페이지 번호 (기본: 1)
 */
admin.get('/photos', async (c) => {
  const status = c.req.query('status'); // 'not_applied', 'pending', 'approved', 'rejected'
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = 50;
  const offset = (page - 1) * perPage;

  try {
    let query = `
      SELECT 
        pp.id,
        pp.image_url,
        pp.verification_status,
        pp.rejection_reason,
        pp.created_at,
        pp.likes_count,
        u.id AS user_id,
        u.email,
        up.nickname
      FROM ProfilePhotos pp
      INNER JOIN Users u ON pp.user_id = u.id
      LEFT JOIN UserProfiles up ON u.id = up.user_id
    `;

    const bindings: any[] = [];

    if (status) {
      query += ' WHERE pp.verification_status = ?';
      bindings.push(status);
    }

    query += ` ORDER BY pp.created_at DESC LIMIT ${perPage + 1} OFFSET ${offset}`;

    const result = await c.env.DB.prepare(query).bind(...bindings).all();
    const photos = result.results;

    const hasMore = photos.length > perPage;
    if (hasMore) {
      photos.pop();
    }

    return c.json({
      photos: photos.map((photo: any) => ({
        id: photo.id,
        image_url: photo.image_url,
        verification_status: photo.verification_status,
        rejection_reason: photo.rejection_reason,
        created_at: photo.created_at,
        likes_count: photo.likes_count,
        user: {
          id: photo.user_id,
          email: photo.email,
          nickname: photo.nickname || '익명',
        },
      })),
      next_page: hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * DELETE /api/v1/admin/photos/:photoId
 * 사진 삭제 (관리자)
 */
admin.delete('/photos/:photoId', async (c) => {
  const photoId = c.req.param('photoId');

  try {
    // 사진 조회
    const photo = await c.env.DB.prepare(`
      SELECT id, image_url
      FROM ProfilePhotos
      WHERE id = ?
    `).bind(photoId).first<{ id: string; image_url: string }>();

    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    // DB에서 삭제
    await c.env.DB.prepare(`
      DELETE FROM ProfilePhotos
      WHERE id = ?
    `).bind(photoId).run();

    // R2에서 삭제 (선택적)
    try {
      // Extract R2 key from URL - handle both old (.r2.dev) and new (/images/) formats
      let r2Key: string | null = null;
      
      if (photo.image_url.includes('.r2.dev/')) {
        // Old format: https://iluli-photos.r2.dev/userId/photoId.ext
        r2Key = photo.image_url.split('.r2.dev/')[1];
      } else if (photo.image_url.includes('/images/')) {
        // New format: https://aiboop.org/images/userId/photoId.ext
        r2Key = photo.image_url.split('/images/')[1];
      }
      
      if (r2Key) {
        await c.env.R2.delete(r2Key);
      }
    } catch (error) {
      console.error('R2 delete error:', error);
    }

    return c.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/v1/admin/users
 * 모든 사용자 목록 조회
 * 
 * @query page - 페이지 번호 (기본: 1)
 */
admin.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = 50;
  const offset = (page - 1) * perPage;

  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.email,
        u.google_subject_id,
        u.role,
        u.created_at,
        up.nickname,
        up.school,
        up.mbti,
        COUNT(pp.id) AS photo_count
      FROM Users u
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      LEFT JOIN ProfilePhotos pp ON u.id = pp.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ${perPage + 1} OFFSET ${offset}
    `).all();

    const users = result.results;
    const hasMore = users.length > perPage;
    if (hasMore) {
      users.pop();
    }

    return c.json({
      users: users.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        nickname: user.nickname,
        school: user.school,
        mbti: user.mbti,
        photo_count: user.photo_count || 0,
      })),
      next_page: hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/v1/admin/users/:userId
 * 특정 사용자 상세 정보 조회
 */
admin.get('/users/:userId', async (c) => {
  const userId = c.req.param('userId');

  try {
    // 사용자 정보 조회
    const user = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.email,
        u.google_subject_id,
        u.role,
        u.created_at,
        up.nickname,
        up.school,
        up.mbti,
        up.bio,
        up.instagram_url,
        up.latitude,
        up.longitude,
        up.location_updated_at
      FROM Users u
      LEFT JOIN UserProfiles up ON u.id = up.user_id
      WHERE u.id = ?
    `).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 사용자의 사진 목록
    const photos = await c.env.DB.prepare(`
      SELECT 
        id,
        image_url,
        verification_status,
        rejection_reason,
        created_at,
        likes_count
      FROM ProfilePhotos
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();

    return c.json({
      user,
      photos: photos.results,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * DELETE /api/v1/admin/users/:userId
 * 사용자 삭제 (관리자)
 */
admin.delete('/users/:userId', async (c) => {
  const userId = c.req.param('userId');
  const authUser = getAuthUser(c);

  // 자기 자신은 삭제 불가
  if (userId === authUser.userId) {
    return c.json({ error: 'Cannot delete yourself' }, 400);
  }

  try {
    // 사용자 존재 확인
    const user = await c.env.DB.prepare(`
      SELECT id
      FROM Users
      WHERE id = ?
    `).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 사용자의 모든 사진을 R2에서 삭제
    const photos = await c.env.DB.prepare(`
      SELECT image_url
      FROM ProfilePhotos
      WHERE user_id = ?
    `).bind(userId).all();

    for (const photo of photos.results as any[]) {
      try {
        // Extract R2 key from URL - handle both old (.r2.dev) and new (/images/) formats
        let r2Key: string | null = null;
        
        if (photo.image_url.includes('.r2.dev/')) {
          // Old format: https://iluli-photos.r2.dev/userId/photoId.ext
          r2Key = photo.image_url.split('.r2.dev/')[1];
        } else if (photo.image_url.includes('/images/')) {
          // New format: https://aiboop.org/images/userId/photoId.ext
          r2Key = photo.image_url.split('/images/')[1];
        }
        
        if (r2Key) {
          await c.env.R2.delete(r2Key);
        }
      } catch (error) {
        console.error('R2 delete error:', error);
      }
    }

    // DB에서 사용자 삭제 (CASCADE로 관련 데이터 자동 삭제)
    await c.env.DB.prepare(`
      DELETE FROM Users
      WHERE id = ?
    `).bind(userId).run();

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * PATCH /api/v1/admin/users/:userId/role
 * 사용자 역할 변경
 * 
 * @body role - 'user' 또는 'admin'
 */
admin.patch('/users/:userId/role', async (c) => {
  const userId = c.req.param('userId');
  const body = await c.req.json<{ role: 'user' | 'admin' }>();

  if (!body.role || (body.role !== 'user' && body.role !== 'admin')) {
    return c.json({ error: 'Invalid role. Must be "user" or "admin"' }, 400);
  }

  try {
    // 사용자 존재 확인
    const user = await c.env.DB.prepare(`
      SELECT id
      FROM Users
      WHERE id = ?
    `).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // 역할 업데이트
    await c.env.DB.prepare(`
      UPDATE Users
      SET role = ?
      WHERE id = ?
    `).bind(body.role, userId).run();

    return c.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/v1/admin/users/invite
 * Invite/promote a user to admin by email. Only existing users are supported.
 * Body: { email: string }
 */
admin.post('/users/invite', async (c) => {
  const body = await c.req.json<{ email?: string }>();
  const email = body?.email?.trim();

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  try {
    const user = await c.env.DB.prepare(
      `SELECT id FROM Users WHERE email = ?`
    ).bind(email).first<{ id: string }>();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    await c.env.DB.prepare(`UPDATE Users SET role = 'admin' WHERE id = ?`).bind(user.id).run();

    return c.json({ message: 'User granted admin role successfully' });
  } catch (error) {
    console.error('Error inviting admin:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/v1/admin/stats
 * 통계 정보 조회
 */
admin.get('/stats', async (c) => {
  try {
    // 전체 사용자 수
    const totalUsers = await c.env.DB.prepare(`
      SELECT COUNT(*) AS count FROM Users
    `).first<{ count: number }>();

    // 전체 사진 수
    const totalPhotos = await c.env.DB.prepare(`
      SELECT COUNT(*) AS count FROM ProfilePhotos
    `).first<{ count: number }>();

    // 인증 대기 중인 사진 수
    const pendingPhotos = await c.env.DB.prepare(`
      SELECT COUNT(*) AS count FROM ProfilePhotos WHERE verification_status = 'pending'
    `).first<{ count: number }>();

    // 승인된 사진 수
    const approvedPhotos = await c.env.DB.prepare(`
      SELECT COUNT(*) AS count FROM ProfilePhotos WHERE verification_status = 'approved'
    `).first<{ count: number }>();

    // 전체 매칭 수
    const totalMatches = await c.env.DB.prepare(`
      SELECT COUNT(*) AS count FROM Matches
    `).first<{ count: number }>();

    return c.json({
      stats: {
        total_users: totalUsers?.count || 0,
        total_photos: totalPhotos?.count || 0,
        pending_photos: pendingPhotos?.count || 0,
        approved_photos: approvedPhotos?.count || 0,
        total_matches: totalMatches?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default admin;
