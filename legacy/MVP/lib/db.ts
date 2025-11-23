import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { D1Database } from '@cloudflare/workers-types';

export const getPrisma = (db?: D1Database) => {
  // [EN] Initialize Prisma client with D1 adapter
  // [KR] D1 어댑터로 Prisma 클라이언트 초기화
  if (db) {
    const adapter = new PrismaD1(db);
    return new PrismaClient({ adapter });
  }
  
  // Fallback for local development (npm run dev)
  return new PrismaClient();
};

