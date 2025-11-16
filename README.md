# 이루리 (Iluli) - 소개팅 웹 서비스

대학생을 위한 사진 기반 소개팅 플랫폼

## 🏗️ 프로젝트 구조

```
/iluli-blind-date
  /docs              # 요구사항 명세서 (PRD) 및 기술 명세서 (Tech Spec)
    /ssot            # Single Source of Truth 문서
  /worker            # Cloudflare Workers (백엔드 API)
  /frontend          # React 프론트엔드
  /shared            # 공통 TypeScript 타입 정의
  README.md
```

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** + TypeScript
- **Vite** (빌드 도구)
- **Tailwind CSS** + Headless UI
- **React Query** (TanStack Query)
- **Zustand** (전역 상태)

### 백엔드
- **Cloudflare Workers** (서버리스)
- **Hono** (TypeScript 웹 프레임워크)
- **Cloudflare D1** (SQLite 데이터베이스)
- **Cloudflare R2** (오브젝트 스토리지)

### 인증
- **Google OAuth 2.0** (ID Token)

자세한 기술 스택은 [docs/ssot/tech-stack.md](./docs/ssot/tech-stack.md) 참조

## 📋 요구사항 문서

- **Phase 1 (MVP)**
  - [PRD-USER-001](./docs/PRD-USER-001.md) - 내 프로필 관리
  - [Tech-Spec-PRD-USER-001](./docs/Tech-Spec-PRD-USER-001.md)

- **Phase 2**
  - [PRD-USER-002](./docs/PRD-USER-002.md) - 공개 프로필 조회
  - [Tech-Spec-PRD-USER-002](./docs/Tech-Spec-PRD-USER-002.md)

- **Phase 3**
  - [PRD-USER-003](./docs/PRD-USER-003.md) - 메인 피드 브라우징
  - [PRD-USER-004](./docs/PRD-USER-004.md) - 좋아요 및 인터랙션
  - [Tech-Spec-PRD-USER-003](./docs/Tech-Spec-PRD-USER-003.md)
  - [Tech-Spec-PRD-USER-004](./docs/Tech-Spec-PRD-USER-004.md)

- **Phase 4**
  - [PRD-MATCH-001](./docs/PRD-MATCH-001.md) - 매칭 로직
  - [Tech-Spec-PRD-MATCH-001](./docs/Tech-Spec-PRD-MATCH-001.md)

- **Phase 5**
  - [PRD-ADMIN-001](./docs/PRD-ADMIN-001.md) - 관리자 기능
  - [Tech-Spec-PRD-ADMIN-001](./docs/Tech-Spec-PRD-ADMIN-001.md)

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- npm 또는 pnpm
- Cloudflare 계정
- Wrangler CLI (`npm install -g wrangler`)
- 도메인 (프로덕션): `aiboop.org` (Cloudflare에서 구매)

### 백엔드 (Worker) 설정

```bash
cd worker
npm install
npm run dev  # 로컬 개발 서버 (http://localhost:8787)
```

### 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev  # Vite 개발 서버 (http://localhost:5173)
```

### 데이터베이스 마이그레이션

```bash
cd worker
wrangler d1 create iluli-db
wrangler d1 execute iluli-db --local --file=./schema.sql
```

## 📦 배포

### 프로덕션 배포 (Workers 단일 배포)
```bash
# 1. Frontend 빌드
cd frontend
npm run build

# 2. 빌드된 파일을 Worker에 복사
cp -r dist ../worker/public

# 3. Worker 배포 (Frontend 포함)
cd ../worker
npm run deploy
```

> Workers가 API와 정적 파일(Frontend)을 모두 제공합니다.

## 🔐 환경 변수

### Worker (`wrangler.toml`)
```toml
# 개발 환경
[vars]
GOOGLE_CLIENT_ID = "554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com"
ALLOWED_ORIGIN = "http://localhost:5173"

# 프로덕션 환경
[env.production]
vars = { 
  ALLOWED_ORIGIN = "https://aiboop.org",
  GOOGLE_CLIENT_ID = "554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com"
}
```

### Frontend
**개발 환경 (`.env`)**
```
VITE_API_BASE_URL=http://localhost:8787/api/v1
VITE_GOOGLE_CLIENT_ID=554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com
```

**프로덕션 환경 (`.env.production`)**
```
VITE_API_BASE_URL=https://api.aiboop.org/api/v1
VITE_GOOGLE_CLIENT_ID=554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com
```

## 📝 라이선스

MIT License

## 👥 기여자

- 이루리 (AI) - 설계 및 초기 구현

---

**문서 버전:** 1.0  
**최종 업데이트:** 2025-11-16
