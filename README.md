# 이루리 소개팅 (iluli-blind-date)

이 프로젝트는 "이루리 소개팅"이라는 이름의 웹 기반 소개팅 서비스를 구현한 것입니다. React와 Vite를 사용한 프론트엔드와 Cloudflare Workers 및 D1 데이터베이스를 사용한 서버리스 백엔드로 구성되어 있습니다.

## 기술 스택

<<<<<<< HEAD
- **프론트엔드**: React, TypeScript, Vite, Tailwind CSS, react-router-dom
- **백엔드**: Cloudflare Workers, Hono (라우팅), jose (JWT)
- **데이터베이스**: Cloudflare D1
- **배포**: Cloudflare Pages (프론트엔드), Cloudflare Workers (백엔드)
- **CI/CD**: GitHub Actions
=======
```
/iluli-blind-date
  /docs              # 요구사항 명세서 (PRD) 및 기술 명세서 (Tech Spec)
    /ssot            # Single Source of Truth 문서
  /worker            # Cloudflare Workers (백엔드 API)
  /frontend          # React 프론트엔드
    /src
      /components
        /AdminPhotoApprovalModal  # 관리자 사진 승인 모달 (모듈화)
      /pages         # 페이지 컴포넌트
      /api           # API 클라이언트
    /.storybook      # Storybook 설정
  /shared            # 공통 TypeScript 타입 정의
  README.md
```
>>>>>>> main

## 주요 기능

<<<<<<< HEAD
- Google 소셜 로그인을 통한 사용자 인증
- 사용자 프로필 조회 및 인스타그램 URL 등록
- 다른 사용자에게 '좋아요' 보내기
- 상호 '좋아요' 시 실시간 매칭 알림
=======
### 프론트엔드
- **React 18** + TypeScript
- **Vite** (빌드 도구)
- **Tailwind CSS** + Headless UI
- **React Query** (TanStack Query)
- **Zustand** (전역 상태)
- **Vitest** (테스트 프레임워크)
- **Storybook** (컴포넌트 문서화)
- **React Testing Library** (컴포넌트 테스트)
>>>>>>> main

## 프로젝트 설정

### 1. Cloudflare 설정

1.  **D1 데이터베이스 생성**:
    ```sh
    npx wrangler d1 create iluli-blind-date-db
    ```
2.  **`wrangler.toml` 업데이트**: 위 명령어 실행 후 출력되는 `database_id`를 `wrangler.toml` 파일에 복사하여 붙여넣습니다.

### 2. 환경 변수

-   백엔드 로직은 Google OAuth 클라이언트 ID를 필요로 합니다. Cloudflare Worker의 설정에서 `GOOGLE_CLIENT_ID`라는 이름의 환경 변수를 추가해야 합니다.

### 3. CI/CD (GitHub Actions)

-   `.github/workflows/deploy-worker.yml` 워크플로우는 `main` 브랜치에 코드가 푸시될 때 자동으로 백엔드 Worker를 배포합니다.
-   이를 위해 GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 두 개의 시크릿을 반드시 설정해야 합니다.
    -   `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰
    -   `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID

## 로컬 개발

1.  **의존성 설치**:
    ```sh
    npm install
    ```
2.  **원격 데이터베이스 스키마 적용**:
    -   `CLOUDFLARE_API_TOKEN`을 환경 변수로 설정한 후 다음 명령어를 실행합니다.
    ```sh
    npx wrangler d1 migrations apply DB --remote
    ```
3.  **백엔드 배포**:
    -   백엔드 코드를 변경할 때마다 아래 명령어를 실행하여 Cloudflare에 배포합니다.
    ```sh
    npx wrangler deploy
    ```
4.  **프론트엔드 개발 서버 실행**:
    -   프론트엔드 개발 서버는 `vite.config.ts`에 설정된 프록시를 통해 배포된 백엔드와 통신합니다.
    ```sh
    npm run dev
    ```

<<<<<<< HEAD
## 테스트

-   (여기에 테스트 실행 방법에 대한 안내를 추가할 수 있습니다.)
=======
## ✨ 주요 기능

### 관리자 사진 승인 모달 (리팩토링)
- ✅ 접근성 우선 설계 (WCAG AA 준수)
- ✅ 반응형 디자인 (모바일/태블릿/데스크탑)
- ✅ 다크모드 지원
- ✅ 모듈화된 컴포넌트 구조
- ✅ 포괄적인 테스트 커버리지 (21개 테스트)
- ✅ Storybook 문서화

자세한 내용은 [frontend/MODAL_REFACTORING.md](./frontend/MODAL_REFACTORING.md)를 참조하세요.

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

### 테스트 실행

```bash
cd frontend
npm test              # 테스트 실행
npm run test:ui       # 테스트 UI로 실행
npm run test:coverage # 테스트 커버리지
```

### Storybook (컴포넌트 문서화)

```bash
cd frontend
npm run storybook     # http://localhost:6006
npm run build-storybook  # 정적 빌드
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
>>>>>>> main
