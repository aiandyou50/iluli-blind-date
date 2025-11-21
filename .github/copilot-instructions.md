# Iluli Blind Date - AI Agent Instructions

## Project Overview
- **Name**: Iluli Blind Date (이루리 소개팅)
- **Type**: Next.js 15 (App Router) Web Application
- **Platform**: Cloudflare Pages (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite) via Prisma
- **Storage**: Cloudflare R2
- **Auth**: NextAuth.js v5 (Google Provider)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Architecture & Patterns

### Database Access (D1 + Prisma)
- **Edge Compatibility**: Use `@prisma/adapter-d1` for D1 access.
- **Helper**: Always use `getPrisma(db)` from `@/lib/db` to instantiate the client.
- **Context**: In API routes (`app/api/**`), retrieve the DB binding via `getRequestContext().env.DB` (from `@cloudflare/next-on-pages`).
- **Schema**: Defined in `prisma/schema.prisma`. Run `npx prisma generate` after changes.
- **Migrations**: Use `npx wrangler d1 execute ...` for applying schema changes (see `package.json` scripts).

### Authentication
- **Config**: `lib/auth/config.ts` exports `createAuthConfig`.
- **Adapter**: Uses `@auth/prisma-adapter` to sync users with D1.
- **Session**: Use `auth()` or `useSession()` to get user info.
- **User Model**: Custom fields (`introduction`, `gender`, `instagramId`) are in the `User` model.

### File Storage (R2)
- **Binding**: `R2` (formerly `PHOTOS_BUCKET`) in `wrangler.toml` and `env.d.ts`.
- **Upload**: Direct upload or signed URLs (implementation details in `app/api/photos/route.ts`).
- **Public Access**: Images are served via a public domain (e.g., `photos.aiboop.org`).

### Internationalization (i18n)
- **Library**: `next-intl`.
- **Structure**: `messages/{locale}.json` contains translations.
- **Routing**: `app/[locale]/...` handles localized routes.
- **Usage**: `useTranslations('namespace')` in components.

## Development Workflow

### Commands
- **Dev Server**: `npm run dev` (Next.js local) or `npm run preview` (Cloudflare Pages local).
- **Build**: `npm run pages:build` (generates `_worker.js`).
- **DB Studio**: `npm run db:studio` (Prisma Studio).

### Deployment
- **Platform**: Cloudflare Pages.
- **Build Command**: `npx @cloudflare/next-on-pages`.
- **Output Dir**: `.vercel/output/static`.
- **Environment**: Linux (requires `lightningcss` Linux binary).

## Key Conventions
- **Edge Runtime**: All API routes must export `export const runtime = 'edge';`.
- **Environment Variables**: Access via `getRequestContext().env` in API routes, NOT `process.env` (except for build-time vars).
- **Strict Types**: Avoid `any`. Use generated Prisma types.
- **Mobile First**: UI is designed for mobile (`max-w-[430px]` layout).

## Common Issues & Fixes
- **Missing Binary**: If `lightningcss` fails on Linux build, ensure it's in `devDependencies`.
- **DB Binding**: If `ctx.env.DB` is undefined, check `wrangler.toml` binding name.
- **Prisma Error**: If `PrismaClient` fails, ensure `driverAdapters` preview feature is enabled (though deprecated/standard now) and adapter is passed.
