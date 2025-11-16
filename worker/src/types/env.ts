// Cloudflare Workers 환경 변수 타입 정의
export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  ALLOWED_ORIGIN: string;
}

// 인증된 사용자 정보 (미들웨어에서 Context에 주입)
export interface AuthUser {
  userId: string;
  email: string;
  googleSubjectId: string;
}

// Google ID Token Payload
export interface GoogleIdTokenPayload {
  sub: string;        // Google Subject ID
  email: string;
  email_verified: boolean;
  aud: string;        // Client ID
  iss: string;        // Issuer
  iat: number;
  exp: number;
}
