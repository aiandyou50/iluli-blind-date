import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types/env';
import profile from './routes/profile';
import photos from './routes/photos';
import users from './routes/users';
import feed from './routes/feed';
import likes from './routes/likes';
import matching from './routes/matching';
import admin from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

// CORS 설정
app.use('/*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.ALLOWED_ORIGIN,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// API v1 라우트 (우선 순위: 더 구체적인 경로가 먼저)
app.route('/api/v1/admin', admin);  // Admin routes
app.route('/api/v1/profile/photos', photos);  // 더 구체적인 경로를 먼저
app.route('/api/v1/profile', profile);
app.route('/api/v1/users', users);
app.route('/api/v1/feed', feed);
app.route('/api/v1/photos', likes);  // /api/v1/photos/:photoId/like, /unlike, /likers
app.route('/api/v1/matching', matching);  // /api/v1/matching/deck, /action, /matches

// 정적 파일 서빙 (Wrangler 4.x Assets)
app.get('/*', async (c) => {
  // API 경로는 여기서 처리하지 않음
  if (c.req.path.startsWith('/api/')) {
    return c.notFound();
  }

  // 정적 파일 조회
  const asset = await c.env.ASSETS.fetch(c.req.raw);
  if (asset.status !== 404) {
    return asset;
  }

  // SPA fallback: /index.html → / 순으로 조회
  const fallbackPaths = ['/index.html', '/'];
  for (const fallbackPath of fallbackPaths) {
    const fallbackRequest = new Request(new URL(fallbackPath, c.req.url).toString(), {
      method: 'GET',
      headers: c.req.raw.headers,
    });
    const fallbackAsset = await c.env.ASSETS.fetch(fallbackRequest);
    if (fallbackAsset.status === 200) {
      return new Response(fallbackAsset.body, fallbackAsset);
    }
  }

  return c.json({ error: 'Not Found' }, 404);
});

// 404 핸들러 (정적 파일도 없을 경우)
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// 에러 핸들러
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
