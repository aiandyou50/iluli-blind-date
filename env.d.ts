import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    PHOTOS_BUCKET: R2Bucket;
    AUTH_SECRET: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    NEXT_PUBLIC_API_URL: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
    R2_PUBLIC_URL: string;
  }
}
