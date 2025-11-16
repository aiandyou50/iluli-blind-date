import { Context, Next } from 'hono';
import { Env, AuthUser, GoogleIdTokenPayload } from '../types/env';
import * as jose from 'jose';

/**
 * Google OAuth 2.0 ID Token 검증 미들웨어
 * 
 * PRD-USER-001 Tech Spec 5장 참조
 * 
 * Authorization 헤더에서 "Bearer <ID_TOKEN>"을 추출하고
 * Google의 공개 키로 JWT 서명을 검증합니다.
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
  }

  const idToken = authHeader.substring(7); // "Bearer " 제거

  try {
    // Google OIDC 공개 키로 JWT 검증
    const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
    
    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: c.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = payload as unknown as GoogleIdTokenPayload;

    // 이메일 검증 확인
    if (!googlePayload.email_verified) {
      return c.json({ error: 'Unauthorized: Email not verified' }, 401);
    }

    // DB에서 사용자 조회 (또는 신규 생성)
    const user = await getOrCreateUser(c.env.DB, googlePayload);

    // Context에 인증된 사용자 정보 주입
    c.set('authUser', {
      userId: user.id,
      email: user.email,
      googleSubjectId: user.google_subject_id,
    } as AuthUser);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}

/**
 * 사용자 조회 또는 신규 생성 (Google OAuth 기반)
 */
async function getOrCreateUser(db: D1Database, payload: GoogleIdTokenPayload) {
  // 1. Google Subject ID로 기존 사용자 조회
  let user = await db
    .prepare('SELECT id, email, google_subject_id FROM Users WHERE google_subject_id = ?')
    .bind(payload.sub)
    .first<{ id: string; email: string; google_subject_id: string }>();

  if (user) {
    return user;
  }

  // 2. 신규 사용자 생성
  const userId = crypto.randomUUID();

  await db.batch([
    // Users 테이블 INSERT
    db.prepare('INSERT INTO Users (id, google_subject_id, email) VALUES (?, ?, ?)')
      .bind(userId, payload.sub, payload.email),
    
    // UserProfiles 테이블 INSERT (빈 프로필)
    db.prepare('INSERT INTO UserProfiles (user_id) VALUES (?)')
      .bind(userId),
  ]);

  return {
    id: userId,
    email: payload.email,
    google_subject_id: payload.sub,
  };
}

/**
 * Context에서 인증된 사용자 정보 가져오기 (헬퍼 함수)
 */
export function getAuthUser(c: Context<{ Bindings: Env }>): AuthUser {
  const authUser = c.get('authUser') as AuthUser;
  if (!authUser) {
    throw new Error('AuthUser not found in context');
  }
  return authUser;
}
