import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware, getAuthUser } from '../middleware/auth';

const photos = new Hono<{ Bindings: Env }>();

/**
 * POST /api/v1/profile/photos/upload
 * 프로필 사진 업로드 (PRD-USER-001 v2.5)
 */
photos.post('/upload', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);

  // FormData 파싱
  const formData = await c.req.formData();
  const file = formData.get('photo') as File;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  // 파일 유효성 검사
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP' }, 400);
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return c.json({ error: 'File size exceeds 10MB limit' }, 400);
  }

  // R2에 업로드
  const photoId = crypto.randomUUID();
  const extension = file.type.split('/')[1]; // 'jpeg', 'png', 'webp'
  const r2Key = `${authUser.userId}/${photoId}.${extension}`;

  await c.env.R2.put(r2Key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // 이미지 URL 생성 - Worker를 통해 서빙
  // 프로덕션: https://aiboop.org/images/userId/photoId.ext
  // 개발: http://localhost:8787/images/userId/photoId.ext
  const baseUrl = new URL(c.req.url).origin;
  const imageUrl = `${baseUrl}/images/${r2Key}`;

  // DB에 메타데이터 저장
  await c.env.DB.prepare(`
    INSERT INTO ProfilePhotos (id, user_id, image_url)
    VALUES (?, ?, ?)
  `).bind(photoId, authUser.userId, imageUrl).run();

  return c.json({
    photo: {
      id: photoId,
      image_url: imageUrl,
      verification_status: 'not_applied',
    },
  }, 201);
});

/**
 * POST /api/v1/profile/photos/:photoId/request-verification
 * 사진 인증 요청 (PRD-USER-001)
 */
photos.post('/:photoId/request-verification', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const photoId = c.req.param('photoId');

  // 사진 소유권 확인
  const photo = await c.env.DB.prepare(`
    SELECT id, verification_status
    FROM ProfilePhotos
    WHERE id = ? AND user_id = ?
  `).bind(photoId, authUser.userId).first();

  if (!photo) {
    return c.json({ error: 'Photo not found or unauthorized' }, 404);
  }

  // 상태 검증
  if (photo.verification_status !== 'not_applied') {
    return c.json({ error: 'Photo already submitted for verification' }, 400);
  }

  // 상태 업데이트: 'not_applied' -> 'pending'
  await c.env.DB.prepare(`
    UPDATE ProfilePhotos
    SET verification_status = 'pending'
    WHERE id = ?
  `).bind(photoId).run();

  return c.json({ message: 'Verification request submitted' }, 200);
});

/**
 * DELETE /api/v1/profile/photos/:photoId
 * 내 사진 삭제 (PRD-USER-001 v2.5)
 */
photos.delete('/:photoId', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const photoId = c.req.param('photoId');

  // 사진 조회 및 소유권 확인
  const photo = await c.env.DB.prepare(`
    SELECT id, image_url
    FROM ProfilePhotos
    WHERE id = ? AND user_id = ?
  `).bind(photoId, authUser.userId).first<{ id: string; image_url: string }>();

  if (!photo) {
    return c.json({ error: 'Photo not found or unauthorized' }, 404);
  }

  // DB에서 삭제 (CASCADE로 Likes도 자동 삭제됨)
  await c.env.DB.prepare(`
    DELETE FROM ProfilePhotos
    WHERE id = ?
  `).bind(photoId).run();

  // R2에서 삭제 (선택적, 비용 절감을 위해 비동기 처리 가능)
  try {
    const r2Key = photo.image_url.split('.r2.dev/')[1];
    if (r2Key) {
      await c.env.R2.delete(r2Key);
    }
  } catch (error) {
    console.error('R2 delete error:', error);
    // R2 삭제 실패해도 DB는 이미 삭제됨 (무시)
  }

  return c.json({ message: 'Photo deleted successfully' }, 200);
});

export default photos;
