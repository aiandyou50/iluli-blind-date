import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    R2: R2Bucket;
    AUTH_SECRET: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    NEXT_PUBLIC_API_URL: string;
    R2_PUBLIC_URL: string;
    ADMIN_EMAILS?: string;
    R2_BUCKET_NAME?: string;
    NEXTAUTH_URL?: string;
  }
}
