# 📘 [Master Spec] 이루리 소개팅 (Iluli Dating) 통합 개발 명세서
**문서 버전:** 6.0.0 (Reverse Engineered & Refactored)
**최종 수정일:** 2025-11-30
**상태:** ✅ 개발 완료 및 유지보수 (Production Ready)

---

## 1. 프로젝트 개요 (Project Overview)
**이루리(Iluli)**는 글로벌 사용자를 대상으로 하는 웹 기반 소셜 데이팅 플랫폼입니다.
Next.js 15와 Cloudflare Edge Runtime을 기반으로 구축되어, 전 세계 어디서나 빠르고 안전한 매칭 경험을 제공합니다.
사용자는 자신의 프로필을 등록하고, 매칭 알고리즘을 통해 이성을 추천받으며, 인스타그램 연동을 통해 실제 연결로 이어질 수 있습니다.

### 🎯 핵심 목표
*   **Global First:** 11개국 언어 지원 및 RTL(페르시아어) 완벽 대응.
*   **Edge Native:** Node.js 의존성을 제거하고 Cloudflare Workers/Pages 환경에서 100% 동작.
*   **Security:** 철저한 인증/인가 및 관리자 승인 시스템 도입.
*   **Simplicity:** 복잡한 채팅 기능 대신 인스타그램 딥링크를 통한 직관적인 연결 유도.

---

## 2. 기술 스택 및 아키텍처 (Tech Stack & Architecture)

### 2.1 Frontend
*   **Framework:** Next.js 15.5.2 (App Router)
*   **Language:** TypeScript 5.x
*   **Styling:** Tailwind CSS 4.0 (PostCSS)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
*   **Internationalization:** `next-intl` (11 Languages)
*   **Icons:** Material Symbols (via Google Fonts) / Heroicons (via `react-hot-toast` custom components)
*   **Notifications:** `react-hot-toast`

### 2.2 Backend (Serverless Edge)
*   **Runtime:** Cloudflare Edge Runtime (V8 Isolate)
*   **API:** Next.js Route Handlers (`app/api/...`)
*   **ORM:** Prisma ORM v6+ (with `@prisma/adapter-d1`)
*   **Validation:** Zod

### 2.3 Infrastructure & Database
*   **Database:** Cloudflare D1 (SQLite distributed)
*   **Storage:** Cloudflare R2 (Object Storage for Images)
*   **Authentication:** NextAuth.js v5 (Auth.js)
    *   Provider: Google OAuth
    *   Strategy: JWT (Stateless)
*   **Deployment:** Cloudflare Pages (Git Integration)

---

## 3. 데이터베이스 스키마 (Database Schema)

### 3.1 ERD 요약
*   **User:** 핵심 사용자 정보 (프로필, 상태, 인증 정보).
*   **Account/Session:** NextAuth 인증 관리.
*   **Photo:** 사용자 프로필 사진 (R2 URL, 순서).
*   **PhotoLike:** 사진에 대한 좋아요 반응.
*   **Match:** 사용자 간의 매칭 기록 (중복 매칭 방지).
*   **Like:** 사용자 간의 호감 표시 (Super Like 포함).
*   **Pass:** 매칭 패스 기록 (재노출 방지).
*   **Block:** 차단 관계.
*   **Report:** 신고 내역 및 처리 상태.

### 3.2 주요 모델 명세 (Prisma)
```prisma
model User {
  id               String     @id @default(cuid())
  email            String     @unique
  nickname         String?    @unique
  school           String?
  instagramId      String?
  bio              String?    // 자기소개
  gender           Gender?
  isGraduated      Boolean    @default(false)
  status           UserStatus @default(PENDING) // PENDING, ACTIVE, BANNED
  role             Role       @default(USER)    // USER, ADMIN
  verificationCode String?
  lastActiveAt     DateTime   @default(now())
  
  // Relations: photos, likes, matches, reports, blocks...
}

model Photo {
  id        String   @id @default(cuid())
  userId    String
  url       String   // R2 Public URL
  order     Int      @default(0)
  likes     PhotoLike[]
}

model Report {
  id          String   @id @default(cuid())
  reporterId  String
  targetId    String   // 신고 대상
  reason      String
  details     String?
  status      ReportStatus @default(PENDING)
}
```

---

## 4. API 명세 (API Specification)

모든 API는 `edge` 런타임에서 동작하며, `/api` 프리픽스를 가집니다.

### 4.1 인증 및 사용자 (Auth & User)
*   `GET /api/auth/[...nextauth]`: NextAuth 인증 핸들러.
*   `GET /api/users/me`: 내 프로필 정보 조회.
*   `GET /api/users/[id]`: 특정 사용자 공개 프로필 조회.
*   `POST /api/profile`: 내 프로필 정보 수정 (닉네임, 소개, 인스타ID 등).

### 4.2 사진 및 업로드 (Photos)
*   `POST /api/upload`: R2 업로드를 위한 Presigned URL 발급.
*   `POST /api/photos`: 업로드 완료 후 DB에 사진 정보 저장.
*   `DELETE /api/photos/[id]`: 사진 삭제.
*   `POST /api/photos/[id]/like`: 특정 사진 좋아요 토글.

### 4.3 매칭 및 상호작용 (Matching)
*   `GET /api/matches/candidates`: 매칭 후보 추천 (필터링: 성별, 차단, 이미 본 유저).
*   `POST /api/matches/action`: 좋아요(Like) 또는 패스(Pass) 액션 처리.
*   `POST /api/matches/reset`: (디버그용) 매칭 기록 초기화.

### 4.4 관리자 (Admin) - *Role: ADMIN Only*
*   `GET /api/admin/users`: 전체 사용자 목록 및 상태 조회.
*   `POST /api/admin/verify`: 사용자 인증 코드 확인 및 승인 (PENDING -> ACTIVE).
*   `POST /api/admin/reports`: 신고 내역 조회 및 처리.
*   `GET /api/admin/photos`: (관리자용) 전체 사진 조회.

### 4.5 기타
*   `POST /api/reports`: 사용자 신고 접수.
*   `POST /api/blocks`: 사용자 차단.

---

## 5. 핵심 기능 및 로직 (Core Features)

### 5.1 회원가입 및 승인 프로세스
1.  **Google 로그인:** NextAuth를 통해 계정 생성.
2.  **프로필 설정:** 닉네임, 학교, 성별, 인스타그램 ID 입력.
3.  **사진 업로드:** 최소 1장 이상의 사진 등록 필수.
4.  **관리자 승인 대기 (PENDING):**
    *   사용자는 인증 코드를 발급받음.
    *   관리자는 대시보드에서 해당 유저의 인스타그램 ID와 사진을 확인.
    *   인증 코드가 일치하면 승인(ACTIVE) 처리.

### 5.2 매칭 알고리즘
1.  **기본 필터:**
    *   자신의 성별과 반대되는 유저 (또는 설정에 따름).
    *   상태가 `ACTIVE`인 유저.
2.  **제외 조건:**
    *   이미 `Like` 또는 `Pass`한 유저.
    *   내가 차단(`Block`)했거나 나를 차단한 유저.
    *   신고(`Report`) 관계에 있는 유저.
3.  **정렬:** `lastActiveAt` 기준 내림차순 또는 랜덤 셔플 (구현에 따라 다름).

### 5.3 인스타그램 연동 (Deep Link)
*   채팅 기능 대신 **인스타그램 DM**으로 직접 연결.
*   프로필의 "인스타그램으로 이동" 버튼 클릭 시:
    *   모바일: 인스타그램 앱 실행 (`instagram://user?username=...`).
    *   PC: 인스타그램 웹 프로필 새 탭 열기.

### 5.4 관리자 대시보드
*   **Verification Queue:** 승인 대기 중인 신규 가입자 목록.
*   **User Management:** 전체 유저 검색, 상태 변경(BAN), 상세 정보 확인.
*   **Report Management:** 접수된 신고 내역 확인 및 처벌.

---

## 6. 디렉토리 구조 (Directory Structure)

```
/
├── app/
│   ├── [locale]/           # i18n Routing Root
│   │   ├── admin/          # 관리자 페이지
│   │   ├── auth/           # 로그인/에러 페이지
│   │   ├── chat/           # (Placeholder) 채팅/매칭 목록
│   │   ├── connect/        # 인스타 연결 페이지
│   │   ├── feed/           # (Legacy) 피드형 보기
│   │   ├── matching/       # 메인 매칭 화면 (스와이프/카드)
│   │   ├── profile/        # 내 프로필 수정
│   │   └── users/[id]/     # 상대방 프로필 상세
│   └── api/                # Backend API Routes
├── components/
│   ├── ui/                 # 공통 UI 컴포넌트 (Button, Input...)
│   └── ...                 # Feature 컴포넌트 (PhotoUpload, Header...)
├── lib/
│   ├── auth.ts             # NextAuth 설정
│   ├── db.ts               # Prisma Client (Edge 호환)
│   └── validations.ts      # Zod 스키마
├── messages/               # i18n JSON 파일 (ko, en, fa, etc.)
├── prisma/                 # DB 스키마 및 마이그레이션
└── public/                 # 정적 자산
```

---

## 7. 국제화 (Internationalization)

*   **라이브러리:** `next-intl`
*   **지원 언어 (11개):**
    *   한국어 (`ko`), 영어 (`en`)
    *   중국어 간체/번체 (`zh-CN`, `zh-TW`)
    *   러시아어 (`ru`), 베트남어 (`vi`), 우즈벡어 (`uz`)
    *   몽골어 (`mn`), 네팔어 (`ne`), 스페인어 (`es`)
    *   **페르시아어 (`fa`)**: RTL(Right-to-Left) 레이아웃 적용 필수.
*   **구현:** URL 경로 기반 라우팅 (`/ko/matching`, `/en/matching`). 미들웨어에서 언어 감지 및 리다이렉트.

---

## 8. 보안 및 제약 사항 (Security & Constraints)

*   **Edge Runtime:** Node.js Native 모듈(`fs`, `crypto` 등) 사용 금지.
*   **이미지 보안:**
    *   업로드는 Presigned URL을 통해서만 가능.
    *   파일 크기 제한 (Client & Server).
    *   허용된 확장자 검사 (Zod).
*   **데이터 접근 제어:**
    *   API 레벨에서 `session.user.role` 확인.
    *   자신의 데이터만 수정 가능하도록 ID 검증.
*   **환경 변수:**
    *   `wrangler.toml` 및 Cloudflare Dashboard에서 관리.
    *   `NEXT_PUBLIC_` 접두사 주의.

---

**문의:** @aiandyou50 (인스타그램) | **문의 이메일:** me@aiboop.org
