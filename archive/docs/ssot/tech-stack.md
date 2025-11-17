# 이루리 소개팅 서비스 기술 스택 (Tech Stack)

**문서 버전:** 1.0 | **작성일:** 2025-11-16 | **작성자:** 이루리 (AI)  
**상태:** **Approved** | **타입:** SSOT (Single Source of Truth)

---

## 1. 개요

본 문서는 '이루리' 소개팅 웹 서비스의 전체 기술 스택을 정의합니다. 모든 개발자는 이 문서를 기준으로 개발을 진행해야 합니다.

---

## 2. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 (브라우저)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend (React SPA)                            │
│  - React 18 + TypeScript                                     │
│  - Vite (빌드 도구)                                           │
│  - Tailwind CSS + Headless UI                                │
│  - React Query (TanStack Query)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS (REST API)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│        Backend API (Cloudflare Workers)                      │
│  - Hono Framework (TypeScript)                               │
│  - Google OAuth 2.0 (ID Token 검증)                          │
└─────┬─────────────────┬─────────────────┬───────────────────┘
      │                 │                 │
      ▼                 ▼                 ▼
┌───────────┐   ┌──────────────┐   ┌─────────────┐
│  D1 (DB)  │   │  R2 (Storage)│   │ Google Auth │
│ SQLite    │   │  Image Files │   │   Server    │
└───────────┘   └──────────────┘   └─────────────┘
```

---

## 3. 기술 스택 상세

### 3.1 프론트엔드 (Frontend)

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | React | 18.x | UI 라이브러리 |
| **언어** | TypeScript | 5.x | 타입 안정성 |
| **빌드 도구** | Vite | 5.x | 개발 서버 및 번들링 |
| **라우팅** | React Router | 6.x | SPA 라우팅 |
| **상태 관리** | React Query (TanStack Query) | 5.x | 서버 상태 관리, Optimistic UI |
| **클라이언트 상태** | Zustand | 4.x | 전역 상태 (사용자 정보 등) |
| **UI 스타일링** | Tailwind CSS | 3.x | 유틸리티 CSS |
| **UI 컴포넌트** | Headless UI | 2.x | 접근성 높은 헤드리스 컴포넌트 |
| **폼 관리** | React Hook Form | 7.x | 폼 유효성 검사 |
| **HTTP 클라이언트** | Fetch API (내장) | - | API 요청 (React Query 래퍼) |
| **이미지 처리** | browser-image-compression | 2.x | 클라이언트 이미지 압축 |
| **날짜 처리** | date-fns | 3.x | 날짜 포맷팅 |
| **지도/위치** | Geolocation API (내장) | - | 브라우저 GPS |

#### 프론트엔드 폴더 구조
```
/frontend
  /src
    /components      # 재사용 가능한 UI 컴포넌트
      /common        # 공통 컴포넌트 (Button, Modal 등)
      /profile       # 프로필 관련 컴포넌트
      /feed          # 피드 관련 컴포넌트
      /matching      # 매칭 관련 컴포넌트
    /pages           # 라우트 페이지 컴포넌트
    /hooks           # 커스텀 React Hooks
    /api             # API 호출 함수 (React Query)
    /utils           # 유틸리티 함수
    /types           # TypeScript 타입 정의
    /assets          # 정적 파일 (이미지, 아이콘)
    App.tsx
    main.tsx
  package.json
  vite.config.ts
  tailwind.config.js
```

---

### 3.2 백엔드 (Backend)

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **플랫폼** | Cloudflare Workers | - | 서버리스 API |
| **프레임워크** | Hono | 4.x | 경량 웹 프레임워크 (TypeScript) |
| **언어** | TypeScript | 5.x | 타입 안정성 |
| **데이터베이스** | Cloudflare D1 | - | SQLite 기반 DB |
| **스토리지** | Cloudflare R2 | - | 오브젝트 스토리지 (이미지) |
| **인증** | Google OAuth 2.0 | - | ID Token 검증 |
| **UUID 생성** | crypto.randomUUID() | - | Node.js 내장 |
| **Geohash** | ngeohash | 0.6.x | 위치 기반 검색 |
| **배포 도구** | Wrangler | 3.x | Cloudflare Workers CLI |

#### 백엔드 폴더 구조
```
/worker
  /src
    /routes          # API 라우트 핸들러
      /profile       # 프로필 관련 API
      /feed          # 피드 관련 API
      /matching      # 매칭 관련 API
      /photos        # 사진 관련 API
    /middleware      # Hono 미들웨어
      auth.ts        # Google Auth 검증
      error.ts       # 에러 핸들링
    /utils           # 유틸리티 함수
      geohash.ts     # Geohash 관련
      haversine.ts   # 거리 계산
    /types           # TypeScript 타입 정의
    index.ts         # Worker 진입점
  wrangler.toml      # Cloudflare 설정
  schema.sql         # D1 스키마 정의
  package.json
```

---

### 3.3 데이터베이스 (Database)

| 항목 | 내용 |
|------|------|
| **서비스** | Cloudflare D1 |
| **엔진** | SQLite (서버리스) |
| **ORM** | 없음 (Raw SQL + Prepared Statements) |
| **마이그레이션** | 수동 SQL 파일 실행 (`wrangler d1 execute`) |

#### 주요 테이블
- `Users` - 사용자 기본 정보 (Google Auth)
- `UserProfiles` - 프로필 정보 (닉네임, 학교, MBTI, Geohash 등)
- `ProfilePhotos` - 프로필 사진 (R2 URL, 인증 상태)
- `Likes` - 좋아요 기록
- `Matches` - 매칭 성사 기록
- `MatchingActions` - 매칭 액션 (OK/Pass)

---

### 3.4 스토리지 (Storage)

| 항목 | 내용 |
|------|------|
| **서비스** | Cloudflare R2 |
| **용도** | 프로필 사진 저장 |
| **URL 형식** | `https://<bucket>.r2.dev/<user_id>/<photo_id>.jpg` |
| **업로드 제한** | 10MB, MIME: `image/jpeg`, `image/png`, `image/webp` |

---

### 3.5 인증 (Authentication)

| 항목 | 내용 |
|------|------|
| **방식** | Google OAuth 2.0 (OIDC) |
| **토큰 타입** | ID Token (JWT) |
| **검증 위치** | Cloudflare Worker (Hono 미들웨어) |
| **토큰 저장** | 브라우저 LocalStorage (또는 Memory) |
| **검증 라이브러리** | `jose` (JWT 검증) |

---

### 3.6 개발 도구 (Development Tools)

| 도구 | 용도 |
|------|------|
| **Git** | 버전 관리 |
| **VS Code** | IDE |
| **ESLint** | 린팅 (TypeScript) |
| **Prettier** | 코드 포맷팅 |
| **Wrangler CLI** | Cloudflare Workers 로컬 개발 및 배포 |
| **Vite Dev Server** | 프론트엔드 로컬 개발 |
| **Postman / Thunder Client** | API 테스트 |

---

## 4. 배포 전략

### 4.1 환경 구성

| 환경 | 설명 | 도메인 예시 |
|------|------|------------|
| **Local** | 개발자 로컬 환경 | `localhost:5173` (Frontend), `localhost:8787` (Worker) |
| **Development** | 개발 서버 (자동 배포) | `dev.iluli.workers.dev` |
| **Production** | 프로덕션 서버 | `api.iluli.com` (커스텀 도메인) |

### 4.2 배포 프로세스

```mermaid
graph LR
    A[Git Push to main] --> B[GitHub Actions]
    B --> C{환경 선택}
    C -->|Dev Branch| D[Cloudflare Workers Dev 배포]
    C -->|Main Branch| E[Cloudflare Workers Prod 배포]
    E --> F[Frontend 정적 배포<br>(Cloudflare Pages)]
```

---

## 5. 보안 정책

| 항목 | 내용 |
|------|------|
| **HTTPS** | 모든 통신 HTTPS 필수 |
| **CORS** | Worker에서 프론트엔드 도메인만 허용 |
| **인증** | 모든 API 엔드포인트 JWT 검증 필수 (공개 API 제외) |
| **XSS 방지** | React의 자동 이스케이핑 활용 |
| **CSRF 방지** | SameSite 쿠키 (또는 Token 기반이므로 N/A) |
| **민감 정보** | 이메일, GPS 좌표 등 최소 노출 |

---

## 6. 성능 목표

| 지표 | 목표 |
|------|------|
| **API 응답 시간** | P95 < 500ms |
| **페이지 로딩 (FCP)** | < 1.5초 |
| **이미지 로딩** | Lazy Loading + WebP 포맷 |
| **번들 크기** | < 500KB (gzip) |
| **Lighthouse 점수** | Performance > 90 |

---

## 7. 모니터링 및 로깅

| 도구 | 용도 |
|------|------|
| **Cloudflare Analytics** | Worker 요청 분석 |
| **Sentry** | 에러 트래킹 (Frontend + Backend) |
| **Console Logs** | Worker 로그 (`wrangler tail`) |

---

## 8. 라이선스 및 의존성

### 8.1 오픈소스 라이선스
- React: MIT
- Hono: MIT
- Tailwind CSS: MIT
- (모든 주요 라이브러리 MIT 라이선스)

### 8.2 상용 서비스
- Cloudflare Workers: Pay-as-you-go
- Google OAuth 2.0: 무료 (쿼터 제한)

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-11-16 | 초기 기술 스택 정의 | 이루리 (AI) |

---

## 10. 참고 문서

- [Cloudflare Workers 공식 문서](https://developers.cloudflare.com/workers/)
- [Hono 공식 문서](https://hono.dev/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [D1 데이터베이스 문서](https://developers.cloudflare.com/d1/)
- [R2 스토리지 문서](https://developers.cloudflare.com/r2/)

---

**문서 승인자:** [CTO 이름]  
**최종 승인일:** 2025-11-16
