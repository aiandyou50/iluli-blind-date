# Iluli Blind Date - Implementation Guide

## Project Overview

이루리 소개팅 (Iluli Blind Date) is a social matching service for university students in their 20s, featuring Instagram-style photo feeds and Tinder-style swiping functionality.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **State Management**: Zustand 5, TanStack Query 5
- **i18n**: next-intl (Korean, English, Traditional Chinese, Simplified Chinese)
- **Forms**: react-hook-form
- **Image Compression**: browser-image-compression

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Prisma 6 with D1 adapter
- **Storage**: Cloudflare R2
- **Authentication**: NextAuth v5 (Auth.js) with Google OAuth

### Development
- **Build Tool**: Next.js + @cloudflare/next-on-pages
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode

## Project Structure

```
├── app/
│   ├── [locale]/                 # Internationalized routes
│   │   ├── page.tsx             # Landing/Login page
│   │   ├── layout.tsx           # Locale-specific layout
│   │   ├── feed/                # Main feed (FR04)
│   │   ├── profile/             # User profiles (FR05)
│   │   │   └── [id]/
│   │   ├── swipe/               # Tinder-style matching (FR06)
│   │   ├── likes/               # Likes sent/received (FR07)
│   │   └── onboarding/          # 3-step onboarding
│   └── api/
│       ├── auth/                # NextAuth routes
│       ├── photos/              # Photo upload/management
│       ├── likes/               # Like operations
│       └── matches/             # Match operations
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── layout/                  # Navigation, headers
│   ├── photo/                   # Photo cards, grids
│   └── swipe/                   # Swipe card component
├── lib/
│   ├── auth/                    # Auth configuration
│   ├── db/                      # Database utilities
│   ├── r2/                      # R2 storage utilities
│   └── stores/                  # Zustand stores
├── i18n/
│   ├── routing.ts               # i18n routing config
│   └── request.ts               # Request config
├── messages/
│   ├── ko.json                  # Korean translations
│   ├── en.json                  # English translations
│   ├── zh-TW.json               # Traditional Chinese
│   └── zh-CN.json               # Simplified Chinese
├── prisma/
│   └── schema.prisma            # Database schema
└── wrangler.toml                # Cloudflare config
```

## Database Schema

### User Table
- `id`: UUID (primary key)
- `email`: String (unique)
- `name`: String (optional)
- `bio`: String (한 줄 소개)
- `instagramId`: String (Instagram username)
- `googleId`: String (unique, from OAuth)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Photo Table
- `id`: UUID (primary key)
- `userId`: UUID (foreign key)
- `url`: String (R2 URL)
- `thumbnail`: String (optional thumbnail URL)
- `order`: Int (display order, max 10 photos per user)
- `createdAt`: DateTime

### Like Table
- `id`: UUID (primary key)
- `fromUserId`: UUID (foreign key)
- `toUserId`: UUID (foreign key)
- `createdAt`: DateTime
- Unique constraint: (fromUserId, toUserId)

### Match Table
- `id`: UUID (primary key)
- `user1Id`: UUID (foreign key)
- `user2Id`: UUID (foreign key)
- `createdAt`: DateTime
- Unique constraint: (user1Id, user2Id)
- Created automatically when two users like each other

## Feature Implementation

### FR01: Google OAuth Login (Highest Priority)
**File**: `app/[locale]/page.tsx`
- Simple landing page with "Sign in with Google" button
- NextAuth v5 integration with Google provider
- Redirect to `/onboarding` for first-time users
- Redirect to `/feed` for returning users

**API Route**: `app/api/auth/[...nextauth]/route.ts`
- Configured in `lib/auth/config.ts`
- Uses Prisma adapter for session management

### FR02: Instagram Account Linking (Highest Priority)
**Component**: `components/profile/InstagramConnect.tsx`
- OAuth integration with Instagram Basic Display API
- Store Instagram username in User.instagramId
- Display Instagram button on profile pages
- Link format: `https://instagram.com/${instagramId}`

**Note**: Instagram Basic Display API requires:
1. Facebook Developer account
2. App creation and configuration
3. OAuth redirect URI setup

### FR03: Photo Upload (Highest Priority)
**Component**: `components/photo/PhotoUploader.tsx`
- Max 10 photos per user
- Client-side compression using browser-image-compression
- Upload to Cloudflare R2 via pre-signed URLs
- Image optimization recommendations: 4-cut photos (common in Korean photo booths)

**API Routes**:
- `POST /api/photos/upload` - Generate pre-signed URL
- `POST /api/photos` - Save photo metadata after upload
- `DELETE /api/photos/[id]` - Delete photo

**R2 Configuration**:
```typescript
// lib/r2/upload.ts
export async function generateUploadUrl(userId: string, filename: string) {
  const key = `photos/${userId}/${Date.now()}-${filename}`;
  // Generate pre-signed URL for client-side upload
  // Return URL for upload
}
```

### FR04: Main Feed (Highest Priority)
**Page**: `app/[locale]/feed/page.tsx`
- Infinite scroll using TanStack Query
- Grid layout: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Display all users' latest photos
- Sort by newest first
- Click photo → navigate to user profile

**API Route**: `GET /api/feed`
- Pagination support (cursor-based)
- Return photo URL, user info, creation date
- Exclude current user's photos

### FR05: User Profile (Highest Priority)
**Page**: `app/[locale]/profile/[id]/page.tsx`
- Photo grid (3 columns)
- User bio
- Instagram connect button (if linked)
- "Like" button (if not already liked)

**Components**:
- `components/photo/PhotoGrid.tsx` - Photo grid display
- `components/profile/ProfileHeader.tsx` - User info header
- `components/profile/LikeButton.tsx` - Like/Unlike button

### FR06: Swipe Matching (Highest Priority)
**Page**: `app/[locale]/swipe/page.tsx`
- Tinder-style card stack
- Swipe left (pass) or right (like)
- Show "It's a Match!" modal when mutual like occurs
- Fetch next user automatically

**Components**:
- `components/swipe/SwipeCard.tsx` - Card with photo and user info
- `components/swipe/MatchModal.tsx` - Match success modal

**API Routes**:
- `GET /api/swipe/next` - Get next user to swipe
- `POST /api/likes` - Record like
- Logic: Create Match if both users liked each other

### FR07: Likes Sent/Received (High Priority)
**Page**: `app/[locale]/likes/page.tsx`
- Two tabs: "Sent" and "Received"
- List view with user photo, name, date
- Click → navigate to user profile

**API Routes**:
- `GET /api/likes/sent` - List likes sent by current user
- `GET /api/likes/received` - List likes received by current user
- `GET /api/matches` - List mutual matches

### FR08: Multi-language Support (High Priority)
**Implementation**:
- Next-intl with [locale] dynamic route
- 4 languages: ko (default), en, zh-TW, zh-CN
- Language selector in header
- All UI strings in `messages/*.json`

**Middleware**: `middleware.ts`
- Auto-detect browser language
- Redirect to appropriate locale path
- Cookie-based persistence

### FR09: Responsive Design (High Priority)
**Approach**:
- Mobile-first design
- Tailwind CSS breakpoints: sm (640px), md (768px), lg (1024px)
- Bottom navigation for mobile
- Side navigation for desktop

**Layout**: `components/layout/MainLayout.tsx`
- Header with logo and language selector
- Bottom nav (mobile): Feed, Swipe, Likes, Profile
- Side nav (desktop): Same items in sidebar

### FR10: Profile Editing (Medium Priority)
**Page**: `app/[locale]/profile/edit/page.tsx`
- Edit bio (one-line introduction)
- Add/remove photos
- Connect/disconnect Instagram
- Form validation using react-hook-form

**API Routes**:
- `PATCH /api/user/profile` - Update user profile
- Photo operations via FR03 routes

## Cloudflare Deployment

### wrangler.toml Configuration
```toml
name = "iluli-blind-date"
compatibility_date = "2025-11-20"
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "iluli-db"
database_id = "YOUR_DATABASE_ID"

[[r2_buckets]]
binding = "PHOTOS_BUCKET"
bucket_name = "iluli-photos"

[vars]
AUTH_SECRET = "your-production-secret"
NEXT_PUBLIC_API_URL = "https://your-domain.pages.dev"
```

### Deployment Steps

1. **Create D1 Database**:
```bash
npx wrangler d1 create iluli-db
# Copy database_id to wrangler.toml
```

2. **Create R2 Bucket**:
```bash
npx wrangler r2 bucket create iluli-photos
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

4. **Apply Database Schema**:
```bash
# Generate SQL from Prisma schema
npx prisma migrate dev --name init

# Apply to D1
npx wrangler d1 execute iluli-db --remote --file=./prisma/migrations/XXX_init/migration.sql
```

5. **Build for Cloudflare**:
```bash
npm run pages:build
```

6. **Deploy**:
```bash
npx wrangler pages deploy
```

### Environment Variables

**Development** (`.env`):
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="dev-secret"
AUTH_GOOGLE_ID="your-dev-client-id"
AUTH_GOOGLE_SECRET="your-dev-client-secret"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Production** (Cloudflare Dashboard):
- `AUTH_SECRET` - Random secure string
- `AUTH_GOOGLE_ID` - Production Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Production Google OAuth client secret
- `NEXT_PUBLIC_API_URL` - Production domain URL

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Database Management
```bash
# Generate Prisma Client
npm run db:generate

# View database (Prisma Studio)
npm run db:studio

# Create migration
npx prisma migrate dev --name your_migration_name
```

### Testing
```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## Security Considerations

### Authentication
- NextAuth v5 handles session management
- HTTPS-only cookies in production
- CSRF protection built-in
- Google OAuth tokens never stored client-side

### Data Protection
- Input validation on all forms
- XSS prevention via React's built-in escaping
- SQL injection prevention via Prisma ORM
- Rate limiting on API routes (implement with Cloudflare Workers)

### Image Upload
- File size limits (10MB per photo)
- File type validation (JPEG, PNG only)
- Virus scanning (consider Cloudflare Images)
- Content moderation (manual or automated)

## Performance Optimization

### Image Optimization
1. Client-side compression before upload
2. Cloudflare Image Resizing for thumbnails
3. Lazy loading with Next.js Image component
4. WebP format for modern browsers

### Caching Strategy
- Cloudflare CDN caching for static assets
- SWR caching for feed data (TanStack Query)
- Optimistic updates for like/unlike actions

### Database Optimization
- Indexed foreign keys
- Cursor-based pagination
- Connection pooling via Prisma

## Accessibility (NFR06)

### Implementation
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Esc)
- Alt text for all images
- Focus indicators
- Color contrast ratio (WCAG AA compliant)

## Next Steps

1. **Complete Core Features**:
   - Implement all FR01-FR07 features
   - Test authentication flow
   - Test photo upload/display
   - Test matching algorithm

2. **UI/UX Polish**:
   - Design system with Tailwind
   - Loading states
   - Error boundaries
   - Empty states

3. **Testing**:
   - Unit tests for utilities
   - Integration tests for API routes
   - E2E tests with Playwright

4. **Production Readiness**:
   - Error tracking (Sentry)
   - Analytics (Cloudflare Web Analytics)
   - Monitoring (Cloudflare Workers Analytics)
   - Content moderation policy

5. **Additional Features** (Post-MVP):
   - Push notifications
   - Chat messaging
   - Advanced filters (age, location)
   - Super likes
   - Profile verification

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Prisma with D1](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1)
- [NextAuth v5](https://authjs.dev/)
- [next-intl](https://next-intl-docs.vercel.app/)

## Support

For questions or issues, please refer to:
- GitHub Issues
- Documentation in `/archive/docs/`
- Original specifications in problem statement
