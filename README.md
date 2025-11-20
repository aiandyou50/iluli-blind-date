# 이루리 소개팅 (Iluli Blind Date)

> 20대 대학생 대상 축제 인생네컷 사진 기반 소셜 매칭 서비스

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

## 🌟 Features

- 🔐 **Google OAuth 로그인** - 간편한 소셜 로그인
- 📸 **사진 기반 프로필** - 최대 10장의 4컷 사진 업로드
- 📱 **인스타그램 연동** - 프로필에 인스타그램 연결
- 🔄 **틴더식 매칭** - 좌우 스와이프로 매칭
- 💕 **호감 목록** - 보낸/받은 좋아요 관리
- 🌍 **다국어 지원** - 한국어, English, 繁體中文, 简体中文
- 📱 **모바일 최적화** - 모바일 퍼스트 반응형 디자인

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5, TanStack Query 5
- **i18n**: next-intl
- **Forms**: react-hook-form
- **Language**: TypeScript

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Prisma 6 with D1 adapter
- **Storage**: Cloudflare R2
- **Authentication**: NextAuth v5 (Auth.js)

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/aiandyou50/iluli-blind-date.git
cd iluli-blind-date

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma Client
npx prisma generate

# Run development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth (NextAuth v5)
AUTH_SECRET="your-secret-key"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Cloudflare
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for Cloudflare Pages
npm run pages:build

# Preview production build
npm run preview

# Lint code
npm run lint

# Generate Prisma Client
npm run db:generate
```

## 📱 App Structure

```
app/
├── [locale]/               # Internationalized routes
│   ├── page.tsx           # Landing/Login
│   ├── feed/              # Main photo feed
│   ├── profile/[id]/      # User profiles
│   ├── swipe/             # Swipe matching
│   ├── likes/             # Likes management
│   └── onboarding/        # User onboarding
└── api/                   # API routes
    ├── auth/              # Authentication
    ├── photos/            # Photo management
    ├── likes/             # Like operations
    └── matches/           # Match operations
```

## 🗄️ Database Schema

### Models

- **User**: User profiles with Google OAuth integration
- **Photo**: Up to 10 photos per user stored in R2
- **Like**: One-way like relationships
- **Match**: Mutual likes create matches

See `prisma/schema.prisma` for detailed schema.

## 🌐 Deployment

### Cloudflare Pages

1. **Create D1 Database**:
```bash
npx wrangler d1 create iluli-db
```

2. **Create R2 Bucket**:
```bash
npx wrangler r2 bucket create iluli-photos
```

3. **Build and Deploy**:
```bash
npm run pages:build
npx wrangler pages deploy
```

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed deployment instructions.

## 🌍 Internationalization

Supported languages:
- 🇰🇷 Korean (default)
- 🇺🇸 English
- 🇹🇼 Traditional Chinese
- 🇨🇳 Simplified Chinese

Language files are in `messages/` directory.

## 📚 Documentation

- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Detailed technical documentation
- [Security Summary](./SECURITY_SUMMARY.md) - Security considerations
- [Archived Docs](./archive/docs/) - Previous implementation documentation

## 🔒 Security

- NextAuth v5 for secure authentication
- HTTPS-only in production
- Input validation on all forms
- Prisma ORM prevents SQL injection
- Rate limiting on API routes

See [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a private project. For any questions or suggestions, please contact the repository owner.

## 📞 Support

For technical issues, please refer to:
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [GitHub Issues](https://github.com/aiandyou50/iluli-blind-date/issues)
- Archive documentation in `/archive/docs/`

## 🎯 Roadmap

- [x] Project setup with Next.js 15.5
- [x] Prisma schema for D1
- [x] Multi-language support (4 languages)
- [ ] Google OAuth authentication
- [ ] Photo upload to R2
- [ ] Feed page with infinite scroll
- [ ] Swipe matching
- [ ] Likes management
- [ ] Instagram integration
- [ ] Production deployment

---

**Built with ❤️ for university students**
