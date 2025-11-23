# [Master Spec] 이루리 소개팅 (Iruri Dating) 개발 명세서

> **문서 버전**: 7.0.0 (Updated: Deployment Flow & D1 Name)  
> **상태**: Production Ready  
> **원칙**: 이 문서는 프로젝트의 유일한 진실 공급원(Source of Truth)입니다. 이 문서에 정의된 모든 내용은 생략 없이 구현되어야 합니다.

---

## 1. 시스템 개요 (System Overview)

### 1.1 프로젝트 정의
- **서비스명**: 이루리 소개팅 (Iruri Dating)
- **핵심 가치**: 사진을 매개로 자연스러운 만남을 추구하는 글로벌 대학생 소개팅 플랫폼.
- **주요 기능**: 고화질 사진 프로필(업로드 개수 무제한), 스와이프 방식의 매칭(Like/Pass), 매칭 성사 시 인스타그램 DM 연결.
- **타겟 유저**: 한국 거주 대학생 및 글로벌 유학생 (다국적 지원 필수).

### 1.2 배포 및 인프라
- **Main URL**: `https://aiboop.org`
- **Image URL**: `https://photos.aiboop.org` (R2 Custom Domain)
- **배포 플랫폼**: Cloudflare Pages
- **Backend Runtime**: Cloudflare Workers (Edge Runtime)
  - **제약 사항**: Node.js Native Modules (fs, crypto, os 등) 사용 불가. 표준 Web API (fetch, Request)만 사용 가능.
- **Database**: Cloudflare D1 (SQLite)
- **Object Storage**: Cloudflare R2 (이미지 저장소)

---

## 2. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

### 2.1 Frontend (Next.js App Router)
- **Framework**: Next.js 15.x (App Router 필수)
- **Language**: TypeScript (Strict Mode 필수)
- **Styling**: Tailwind CSS 4.0
  - 모바일 퍼스트 디자인 (sm: 브레이크포인트 기준 작업).
  - 다크 모드 미지원 (화이트 테마 고정).
  - **RTL(Right-to-Left) 지원**: 페르시아어(fa) 지원을 위해 ms-(margin-start), pe-(padding-end) 등 논리적 속성 사용 필수.
- **State Management**: React Query (TanStack Query) v5
- **i18n Library**: next-intl (Middleware 기반 라우팅)
- **지원 언어 목록 (총 11개국)**:
  - `ko`: 한국어
  - `en`: 영어 (기본값)
  - `zh-CN`: 중국어 (간체)
  - `zh-TW`: 중국어 (번체)
  - `ru`: 러시아어
  - `vi`: 베트남어
  - `uz`: 우즈베크어
  - `mn`: 몽골어
  - `ne`: 네팔어
  - `fa`: 페르시아어 (이란) - RTL 레이아웃 적용
  - `es`: 스페인어

### 2.2 Backend (Serverless / Edge)
- **Database ORM**: Prisma 7.x (@prisma/adapter-d1 사용 필수)
- **Auth**: Auth.js (NextAuth v5 beta) - Google Provider Only
- **Image Handling**: No Server-Side Compression. 클라이언트에서 원본을 R2로 직접 업로드(Direct Upload) 처리.

---

## 3. 디렉토리 구조 (Directory Structure)

> **AI는 아래 구조를 엄격히 준수해야 하며, 임의로 구조를 변경해서는 안 됩니다.**

```
/
├── .wrangler/                # Cloudflare Local Development state
├── app/
│   ├── [locale]/             # 다국어 라우팅 루트
│   │   ├── layout.tsx        # Root Layout (i18n Provider, AuthProvider, QueryProvider, RTL Direction 설정)
│   │   ├── page.tsx          # 랜딩 페이지 (로그인 전 소개 화면)
│   │   ├── home/             # 메인 피드 (카드 스택 - 로그인 후 진입)
│   │   ├── profile/          # 내 프로필 설정 및 수정
│   │   │   └── photos/       # 사진 관리 페이지 (무제한 업로드)
│   │   ├── matching/         # 매칭된 목록 확인 및 인스타 ID 확인
│   │   └── admin/            # 관리자 전용 대시보드
│   ├── api/                  # Edge API Routes (Backend Logic)
│   │   ├── auth/             # NextAuth Endpoints
│   │   ├── upload/           # R2 Presigned URL 발급
│   │   ├── matches/          # 매칭 후보 추천 및 액션 처리
│   │   └── admin/            # 관리자 데이터 조회
│   └── globals.css           # Tailwind CSS directives
├── components/
│   ├── ui/                   # 재사용 가능한 원자 단위 UI (Button, Input, Dialog...)
│   ├── features/             # 도메인 로직이 포함된 컴포넌트 (CardStack, ProfileForm...)
│   ├── layout/               # 레이아웃 컴포넌트 (Header, BottomNav)
│   └── providers/            # Client Component Providers wrapper
├── lib/
│   ├── db.ts                 # Prisma Client Instance (Edge Compatible)
│   ├── auth.ts               # NextAuth Configuration
│   ├── utils.ts              # 공용 유틸리티 함수 (cn 등)
│   └── constants.ts          # 상수 관리 (언어 목록 등)
├── messages/                 # i18n JSON Files
│   ├── ko.json
│   ├── en.json
│   ├── ru.json
│   ├── ... (모든 11개 언어 파일 필수)
├── prisma/
│   └── schema.prisma         # 데이터베이스 모델 정의
├── public/                   # 정적 자산
├── next.config.ts            # Next.js Config
├── tailwind.config.ts        # Tailwind Config
└── wrangler.toml             # Cloudflare Configuration
```

---

## 4. 데이터 모델 (Data Model - Prisma Schema)

> **아래 코드는 `prisma/schema.prisma`의 전체 내용입니다. 생략된 부분은 없습니다.**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

// 사용자 모델
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?   // 구글 프로필 사진 (기본값)
  
  // 서비스 전용 프로필 정보
  nickname      String?
  gender        String?   // 'MALE' | 'FEMALE'
  instagramId   String?   // 매칭 성공 시 상대에게 공개됨
  introduction  String?   // 자기소개 (최대 100자)
  
  role          String    @default("USER") // 'USER' | 'ADMIN'
  status        String    @default("ACTIVE") // 'ACTIVE' | 'BANNED' | 'PENDING'
  
  // 관계 정의
  accounts      Account[]
  sessions      Session[]
  photos        Photo[]
  
  // 매칭 관련 관계
  sentLikes     Like[]    @relation("UserSentLikes")
  
  matchesAsUser1 Match[]  @relation("User1Matches")
  matchesAsUser2 Match[]  @relation("User2Matches")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([gender])
}

// NextAuth 필수 Account 모델
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// NextAuth 필수 Session 모델
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// 프로필 사진 모델
model Photo {
  id        String   @id @default(cuid())
  userId    String
  url       String   // R2 Public URL (photos.aiboop.org/...)
  caption   String?  // 사진 설명 (선택)
  order     Int      @default(0) // 출력 순서 (0번이 대표 사진)
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}

// 좋아요(Like) 액션 모델
model Like {
  id         String   @id @default(cuid())
  fromUserId String
  toUserId   String
  
  user       User     @relation("UserSentLikes", fields: [fromUserId], references: [id], onDelete: Cascade)
  
  createdAt  DateTime @default(now())
  
  @@unique([fromUserId, toUserId]) // 중복 좋아요 방지
}

// 성사된 매칭 모델
model Match {
  id        String   @id @default(cuid())
  user1Id   String
  user2Id   String
  
  user1     User     @relation("User1Matches", fields: [user1Id], references: [id], onDelete: Cascade)
  user2     User     @relation("User2Matches", fields: [user2Id], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  
  @@unique([user1Id, user2Id])
}
```

---

## 5. API 명세 (API Specification)

> **모든 API는 `app/api` 하위에 위치하며 Edge Runtime에서 동작합니다.**

### 5.1 인증 (Authentication)
- **Path**: `/api/auth/[...nextauth]`
- **Logic**:
  - Google OAuth 로그인 처리.
  - `jwt 콜백`: 로그인 시 `env.ADMIN_EMAILS`를 확인하여 관리자 이메일일 경우 DB의 role을 즉시 ADMIN으로 업데이트.
  - `session 콜백`: 클라이언트가 `user.id`, `user.role`, `user.instagramId`에 접근할 수 있도록 세션 객체 확장.

### 5.2 프로필 (Profile)
- **GET** `/api/profile`: 현재 로그인한 유저의 정보와 사진 목록 반환.
- **POST** `/api/profile`: 닉네임, 성별, 인스타그램ID, 자기소개 수정.

### 5.3 이미지 업로드 (R2 Storage - Critical)
- **Path**: `/api/upload/presigned`
- **Method**: `POST`
- **Payload**: `{ filename: string, filetype: string }`
- **Logic**:
  - 인증된 유저인지 확인.
  - R2 버킷에 업로드할 수 있는 Presigned URL 생성 (만료시간 5분).
  - URL 반환.
- **클라이언트 동작**:
  - **절대 압축 금지**: 사용자가 선택한 파일을 바이트 그대로 유지.
  - **지원 포맷**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`, `image/heic`, `image/heif`, `image/jxl` (JPEG XL).
  - `PUT` 메서드로 Presigned URL에 직접 바이너리 전송.
  - 업로드 성공 시 `/api/profile/photos`를 호출하여 DB에 Key(URL) 저장.

### 5.4 매칭 시스템 (Matching)
- **GET** `/api/matches/candidates`:
  - 나의 성별(gender)과 반대되는 유저 목록 조회.
  - **제외 조건**: 내가 이미 Like한 유저.
  - **정렬**: 랜덤(Random) 셔플.
  - **반환**: 최대 10명의 유저 프로필(사진 포함) 배열.
- **POST** `/api/matches/action`:
  - **Payload**: `{ targetUserId: string, action: 'LIKE' | 'PASS' }`
  - **LIKE** 일 경우:
    - Like 테이블에 레코드 추가.
    - 매칭 검사: Like 테이블에서 targetUserId가 나를 좋아요 했는지 확인 (`findFirst`).
    - 존재하면 Match 테이블 레코드 생성 후 `isMatch: true` 반환.
    - 없으면 `isMatch: false` 반환.
  - **PASS** 일 경우:
    - DB에 저장하지 않음 (Stateless). 다음 카드로 넘어감.

### 5.5 관리자 (Admin)
- **Middleware**: `/admin` 및 `/api/admin` 경로는 `user.role === 'ADMIN'` 일 때만 접근 허용.
- **GET** `/api/admin/users`: 전체 회원 목록, 가입일, 매칭 수 등 통계 조회.
- **DELETE** `/api/admin/users`: 악성 유저 강제 탈퇴 처리.

---

## 6. 인프라 및 환경 변수 (Infrastructure & Env)

환경 변수는 **1. 클라우드플레어 대시보드 등록(Secret)**과 **2. 로컬/프로젝트 설정(Public/Config)**으로 나뉩니다.

### 6.1 클라우드플레어 대시보드 등록 (Secrets)

보안이 필수적인 값들입니다. Cloudflare Pages Dashboard -> Settings -> Environment Variables에 등록되어 있습니다.

| 변수명 | 값(예시) | 설명 |
|--------|----------|------|
| `AUTH_GOOGLE_ID` | `123...apps.googleusercontent.com` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | `GOCSPX-...` | Google OAuth Client Secret |
| `AUTH_SECRET` | `asef...` | NextAuth 암호화 키 |
| `ADMIN_EMAILS` | `admin@a.com,ceo@b.com` | 관리자 이메일 목록 (쉼표 구분) |

### 6.2 로컬 개발 및 설정 파일 (Config)

`.env.local` 또는 `wrangler.toml`에 AI가 등록하거나 참조해야 할 값들입니다.

| 변수명 | 값 | 설명 |
|--------|----|------|
| `NEXT_PUBLIC_R2_URL` | `https://photos.aiboop.org` | **[중요]** 클라이언트에서 이미지를 로드할 때 사용하는 도메인 |
| `R2_BUCKET_NAME` | `iluli-photos` | R2 버킷 이름 |
| `D1_DATABASE_NAME` | `iluli-db` | **[추가]** Cloudflare D1 데이터베이스 이름 |

---

## 7. 배포 및 운영 플로우 (Deployment & Operations)

본 프로젝트는 GitHub와 Cloudflare Pages 간의 CI/CD 파이프라인을 통해 배포됩니다.

### 7.1 소스 코드 관리 및 CI/CD
- **Repository**: GitHub
- **Production Branch**: `main`
- **Deployment Strategy**:
  1. **개발 (Local)**: 개발자가 로컬 환경에서 AI 코딩 에이전트로 개발.
  2. **커밋 및 푸시 (Push)**: 코드를 수정 후 GitHub 리포지토리의 `main` 브랜치로 커밋 및 푸시.
  3. **자동 빌드 (Build)**: Cloudflare Pages가 `main` 브랜치의 변경 사항을 감지하여 자동으로 빌드 시작.
  4. **배포 (Deploy)**: 빌드 성공 시 전 세계 Edge Network에 즉시 배포 및 반영.

### 7.2 데이터베이스 마이그레이션
- **Schema 변경 시**: 로컬에서 `prisma migrate dev` 등으로 생성된 마이그레이션 파일도 함께 커밋해야 합니다.
- **Prod DB 적용**: Cloudflare Dashboard 또는 Wrangler CLI를 통해 프로덕션 D1 데이터베이스(`iluli-db`)에 마이그레이션을 적용합니다.
