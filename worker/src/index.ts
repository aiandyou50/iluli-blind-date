import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { Env } from './types/env';
import profile from './routes/profile';
import photos from './routes/photos';

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

// API v1 라우트 (우선 순위: API 먼저)
app.route('/api/v1/profile', profile);
app.route('/api/v1/profile/photos', photos);

// 정적 파일 서빙 (public 폴더)
app.get('/*', serveStatic({ root: './' }));

// SPA를 위한 fallback (모든 경로를 index.html로)
app.get('/*', serveStatic({ path: './index.html' }));

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
