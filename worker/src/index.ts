import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

// 정적 파일 서빙 (Wrangler 4.x Assets)
app.get('/*', async (c) => {
  // Assets 바인딩 사용
  const asset = await c.env.ASSETS.fetch(c.req.raw);
  
  // 정적 파일이 있으면 반환
  if (asset.status !== 404) {
    return asset;
  }
  
  // SPA fallback: 정적 파일이 없으면 index.html 반환
  const indexRequest = new Request(new URL('/index.html', c.req.url), c.req.raw);
  const indexAsset = await c.env.ASSETS.fetch(indexRequest);
  
  if (indexAsset.status === 200) {
    return new Response(indexAsset.body, {
      ...indexAsset,
      headers: {
        ...Object.fromEntries(indexAsset.headers.entries()),
        'Content-Type': 'text/html',
      },
    });
  }
  
  // Assets에도 index.html이 없으면 404
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
