# [Master Spec] 이루리 소개팅 (Iruri Dating) 개발 명세서

> **문서 버전**: 3.0.1 (2025-11-22 현행화)
> **상태**: Final (Codebase Synchronized)
> **목적**: 이 문서는 프로젝트의 **유일한 진실 공급원(Source of Truth)**으로서, 현재 구현된 코드와 100% 일치하는 시스템 아키텍처, 데이터 모델, API 및 기능을 정의합니다.

---

## 1. 시스템 개요 (System Overview)

### 1.1 프로젝트 정의
- **서비스명**: 이루리 소개팅 (Iruri Dating)
- **핵심 가치**: 사진을 매개로 자연스러운 만남을 추구하는 글로벌 대학생 소개팅 플랫폼.
- **주요 기능**: 사진 프로필 업로드, 이성 매칭(스와이프 방식), 인스타그램 DM 연결.
- **타겟 유저**: 한국 및 글로벌(중화권/영어권) 대학생.

### 1.2 배포 환경
- **URL**: `https://aiboop.org`
- **배포 플랫폼**: Cloudflare Pages
- **CI/CD**: GitHub Repository (`main` branch push) -> Cloudflare Build System

---

## 2. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

### 2.1 Frontend (App Router)
- **Framework**: Next.js 15.5.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **i18n**: `next-intl` (Middleware Routing)
  - 지원 언어: `ko` (한국어), `en` (영어 - 기본값), `zh-CN` (간체), `zh-TW` (번체)
- **Components**:
  - `BottomNav`: 하단 탭 네비게이션
  - `PhotoUpload`: 이미지 업로드 및 미리보기

### 2.2 Backend (Serverless / Edge)
- **Runtime**: Cloudflare Workers (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Object Storage for Images)
- **ORM**: Prisma 7.0.0 (`@prisma/adapter-d1`)
- **Auth**: NextAuth v5 (Auth.js) - Google Provider Only

---

## 3. 데이터 모델 (Data Model)

Cloudflare D1(SQLite)을 사용하며, `prisma/schema.prisma`에 정의된 모델은 다음과 같습니다.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?   // 구글 프로필 사진
  
  // 프로필 정보
  nickname      String?
  gender        String?   // 'MALE' | 'FEMALE'
  instagramId   String?   // 필수 입력 사항
  introduction  String?   
  role          String    @default("USER") // 'USER' | 'ADMIN'
  
  // 관계
  accounts      Account[]
  sessions      Session[]
  photos        Photo[]   
  likes         Like[]    
  matchesAsUser1 Match[]  @relation("User1Matches")
  matchesAsUser2 Match[]  @relation("User2Matches")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Match {
  id        String   @id @default(cuid())
  user1Id   String
  user2Id   String
  user1     User     @relation("User1Matches", fields: [user1Id], references: [id], onDelete: Cascade)
  user2     User     @relation("User2Matches", fields: [user2Id], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

model Photo {
  id        String   @id @default(cuid())
  userId    String
  url       String   // R2 Public URL
  caption   String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes     Like[]   
  
  createdAt DateTime @default(now())
}

model Like {
  id        String   @id @default(cuid())
  userId    String   // 좋아요를 누른 사람 (Actor)
  photoId   String   // 좋아요 받은 사진 (Target Photo)
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  photo     Photo    @relation(fields: [photoId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  @@unique([userId, photoId]) // 중복 좋아요 방지
}

// NextAuth 필수 모델 (Account, Session) 생략 (표준 스키마 준수)
```

---

## 4. API 명세 (API Specification)

모든 API는 `app/api` 경로 하위에 위치하며 Cloudflare Edge Runtime에서 동작합니다.

### 4.1 인증 (Auth)
- **Endpoint**: `/api/auth/[...nextauth]`
- **Provider**: Google
- **Logic**: `getPrisma(ctx.env.DB)`를 통해 D1 어댑터 연결.

### 4.2 매칭 (Matching)
- **후보 추천 (`GET /api/matches/candidates`)**:
  - `userId` 파라미터 필수.
  - 요청자의 성별(`gender`)을 확인 후, 반대 성별(`Opposite Gender`) 유저 목록 반환.
  - 이미 본 유저 제외 로직(TODO) 및 랜덤 셔플링 포함.
- **액션 수행 (`POST /api/matches/action`)**:
  - Payload: `{ userId, photoId, action }` (`action`: 'like' | 'pass')
  - **Like**: `Like` 테이블에 레코드 생성 (Upsert).
  - **Pass**: DB에 저장하지 않고 성공 응답만 반환 (Stateless).

### 4.3 프로필 (Profile)
- **조회 (`GET /api/profile`)**: `email` 파라미터로 유저 및 사진 목록(`photos`) 조회.
- **수정 (`POST /api/profile`)**: `instagramId`, `nickname`, `gender`, `introduction` 업데이트.

### 4.4 관리자 (Admin)
- **권한 체크**: `User.role === 'ADMIN'` 인지 확인.
- **유저 관리 (`/api/admin/users`)**:
  - `GET`: 전체 유저 목록 및 통계(사진 수, 좋아요 수 등) 반환.
  - `DELETE`: 특정 유저 계정 삭제.
- **사진 관리 (`/api/admin/photos`)**:
  - `GET`: 전체 업로드 사진 목록 반환.
  - `DELETE`: 부적절한 사진 DB 레코드 삭제 (R2 파일 삭제는 별도 구현 필요).

### 4.5 유틸리티 (Utility)
- **관리자 승격 (`GET /api/setup/admin`)**:
  - **URL**: `/api/setup/admin?email=...&secret=...`
  - **기능**: 특정 `email`을 가진 유저의 `role`을 `ADMIN`으로 즉시 변경.
  - **보안**: 하드코딩된 `secret` 키(`iluli-admin-setup-2024`) 검증 필요.

---

## 5. 기능 시나리오 (User Flows)

### 5.1 회원가입 및 온보딩
1. 사용자가 구글 소셜 로그인 시도.
2. DB에 `User` 레코드 생성(없는 경우).
3. 로그인 직후 `instagramId`나 `nickname`이 없으면 **프로필 설정 페이지**로 리다이렉트.
4. 필수 정보 입력 후 메인 피드로 진입.

### 5.2 매칭 (Matching)
1. 사용자가 **매칭 탭**(`app/[locale]/matching`) 진입.
2. 시스템이 이성 유저의 프로필 카드(사진 포함)를 제시.
3. 사용자는 **Like(하트)** 또는 **Pass(X)** 버튼 클릭.
4. Like 시 상대방에게 좋아요 알림(기능 예정) 또는 매칭 성사 로직 트리거.

### 5.3 사진 업로드
1. 마이페이지 또는 업로드 버튼 클릭.
2. `PhotoUpload` 컴포넌트를 통해 이미지 선택.
3. `/api/upload` (Presigned URL 또는 직접 업로드 방식)를 통해 Cloudflare R2에 저장.
4. DB `Photo` 테이블에 Public URL 저장.

---

## 6. 인프라 설정 (Infrastructure)

### 6.1 환경 변수 (Environment Variables)
Cloudflare Pages 설정 메뉴에서 관리됩니다.

| 변수명 | 설명 |
|--------|------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `AUTH_SECRET` | NextAuth 암호화 키 |
| `R2_PUBLIC_URL` | R2 버킷의 공개 도메인 (예: `https://photos.aiboop.org`) |

### 6.2 바인딩 (Bindings)
`wrangler.toml` 및 Cloudflare Dashboard에서 연결된 리소스입니다.

| 바인딩 이름 | 리소스 타입 | 연결 대상 |
|-------------|-------------|-----------|
| `DB` | D1 Database | `iluli-db` |
| `R2` | R2 Bucket | `iluli-photos` |
