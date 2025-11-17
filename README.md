# 이루리 소개팅 (iluli-blind-date)

이 프로젝트는 "이루리 소개팅"이라는 이름의 웹 기반 소개팅 서비스를 구현한 것입니다. React와 Vite를 사용한 프론트엔드와 Cloudflare Workers 및 D1 데이터베이스를 사용한 서버리스 백엔드로 구성되어 있습니다.

## 기술 스택

- **프론트엔드**: React, TypeScript, Vite, Tailwind CSS, react-router-dom
- **백엔드**: Cloudflare Workers, Hono (라우팅), jose (JWT)
- **데이터베이스**: Cloudflare D1
- **배포**: Cloudflare Pages (프론트엔드), Cloudflare Workers (백엔드)
- **CI/CD**: GitHub Actions

## 주요 기능

- Google 소셜 로그인을 통한 사용자 인증
- 사용자 프로필 조회 및 인스타그램 URL 등록
- 다른 사용자에게 '좋아요' 보내기
- 상호 '좋아요' 시 실시간 매칭 알림

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

## 테스트

-   (여기에 테스트 실행 방법에 대한 안내를 추가할 수 있습니다.)
