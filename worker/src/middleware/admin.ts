import { Context, Next } from 'hono';
import { Env } from '../types/env';
import { getAuthUser } from './auth';

/**
 * Admin 권한 체크 미들웨어
 * authMiddleware 이후에 사용해야 함
 */
export async function adminMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authUser = getAuthUser(c);

  // DB에서 사용자의 role 확인
  const user = await c.env.DB.prepare(`
    SELECT role
    FROM Users
    WHERE id = ?
  `).bind(authUser.userId).first<{ role: string }>();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  await next();
}
