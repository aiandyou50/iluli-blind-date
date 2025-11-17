# 이루리 프로젝트 설치 및 실행 가이드

## 🚀 빠른 시작

### 1. 의존성 설치

```powershell
# 루트 디렉토리에서
cd worker
npm install

cd ../frontend
npm install
```

### 2. 환경 변수 설정

#### Worker (.env 파일 생성 필요 없음, wrangler.toml 수정)
```powershell
cd worker
```

`wrangler.toml` 파일을 열고 다음을 수정:
- `database_id`: D1 데이터베이스 ID (아래 3단계에서 생성)
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID

#### Frontend (.env 파일 생성)
```powershell
cd frontend
cp .env.example .env
```

`.env` 파일을 열고 다음을 입력:
```
VITE_API_BASE_URL=http://localhost:8787/api/v1
VITE_GOOGLE_CLIENT_ID=554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com
```

### 3. Cloudflare 설정

#### 3.1 Wrangler 로그인
```powershell
cd worker
npx wrangler login
```
np
#### 3.2 D1 데이터베이스 확인
이미 `iluli-db` 데이터베이스가 생성되어 있습니다.

```powershell
# 데이터베이스 목록 확인
npx wrangler d1 list
```

`wrangler.toml`의 `database_id` 값이 올바른지 확인하세요.

#### 3.3 D1 스키마 마이그레이션
```powershell
npx wrangler d1 execute iluli-db --local --file=./schema.sql
```

#### 3.4 R2 버킷 확인
이미 `iluli-photos` 버킷이 생성되어 있습니다.

```powershell
# R2 버킷 목록 확인
npx wrangler r2 bucket list
```

### 4. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션"
6. 승인된 자바스크립트 원본 (개발 + 프로덕션):
   - `http://localhost:5173` (개발: 프론트엔드)
   - `http://localhost:8787` (개발: Worker)
   - `https://aiboop.org` (프로덕션: 프론트엔드)
   - `https://api.aiboop.org` (프로덕션: Worker API - 배포 후 실제 URL로 변경)
7. 승인된 리디렉션 URI (개발 + 프로덕션):
   - `http://localhost:5173` (개발)
   - `https://aiboop.org` (프로덕션)
8. 생성된 "클라이언트 ID"를 확인:
   - 현재 Client ID: `554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com`
   - 이 값이 이미 다음 파일들에 설정되어 있는지 확인:
     - `worker/wrangler.toml`의 `GOOGLE_CLIENT_ID` (로컬 개발용)
     - `worker/wrangler.toml`의 `[env.production]` 섹션 (프로덕션용)
     - `frontend/.env`의 `VITE_GOOGLE_CLIENT_ID` (개발용)
     - `frontend/.env.production`의 `VITE_GOOGLE_CLIENT_ID` (프로덕션용)

### 5. 개발 서버 실행

#### Terminal 1 - Worker (백엔드)
```powershell
cd worker
npm run dev
```
→ http://localhost:8787 에서 실행됨

#### Terminal 2 - Frontend (프론트엔드)
```powershell
cd frontend
npm run dev
```
→ http://localhost:5173 에서 실행됨

### 6. 브라우저에서 테스트

1. http://localhost:5173 접속
2. "Google로 로그인" 클릭
3. Google 계정 선택
4. 로그인 후 프로필 페이지로 이동
5. 닉네임, 학교 등 정보 입력 및 사진 업로드

---

## 🔧 문제 해결

### TypeScript 에러가 나는 경우
```powershell
# Worker
cd worker
npm install

# Frontend
cd frontend
npm install
```

### D1 로컬 데이터베이스 초기화
```powershell
cd worker
npx wrangler d1 execute iluli-db --local --file=./schema.sql
```

### Google OAuth 401 에러
- `GOOGLE_CLIENT_ID`가 올바르게 설정되었는지 확인
- Google Cloud Console에서 승인된 도메인 확인

### CORS 에러
- Worker의 `ALLOWED_ORIGIN`이 `http://localhost:5173`으로 설정되었는지 확인

---

## 📦 배포 (프로덕션)

### Workers 단일 배포 (API + Frontend 통합)

Workers가 API와 정적 파일(Frontend)을 모두 제공합니다.

#### 1단계: Frontend 빌드
```powershell
cd frontend

# 프로덕션 환경변수로 빌드 (.env.production 자동 사용)
npm run build
```

#### 2단계: 빌드 파일을 Worker로 복사
```powershell
# dist 폴더를 worker/public으로 복사
cp -r dist ../worker/public

# 또는 PowerShell에서:
Copy-Item -Path .\dist\* -Destination ..\worker\public -Recurse -Force
```

#### 3단계: D1 프로덕션 스키마 마이그레이션
```powershell
cd ../worker

# 프로덕션 DB에 스키마 적용
npx wrangler d1 execute iluli-db --remote --file=./schema.sql
```

#### 4단계: Worker 배포 (API + Frontend 포함)
```powershell
# 프로덕션 환경으로 Worker 배포
npx wrangler deploy --env production
```

**배포 성공 시 출력:**
```
Published iluli-worker-prod (1.23 sec)
  https://iluli-worker-prod.YOUR_ACCOUNT.workers.dev
```

#### 5단계: 커스텀 도메인 연결 (aiboop.org)

**루트 도메인 (aiboop.org) - Frontend 및 API 통합:**
1. Cloudflare Dashboard → **Workers & Pages** → `iluli-worker-prod` 선택
2. **Triggers** 탭 클릭
3. **Custom Domains** 섹션에서 **Add Custom Domain** 클릭
4. 도메인 입력: `aiboop.org` (루트 도메인)
5. **Add Domain** 클릭
6. DNS 레코드가 자동으로 추가됨 (CNAME 또는 A/AAAA)
7. SSL 인증서 자동 프로비저닝 (1-2분 소요)
8. 완료 후:
   - `https://aiboop.org` → Frontend (정적 파일)
   - `https://aiboop.org/api/v1/*` → API 엔드포인트

### 6단계: 프로덕션 환경 최종 확인

배포 완료 후 다음을 확인하세요:

- [ ] Frontend가 `https://aiboop.org`에서 로딩되는지 확인
  ```powershell
  curl https://aiboop.org
  # HTML 응답 확인
  ```

- [ ] API가 `https://aiboop.org/api/v1`에서 응답하는지 확인
  ```powershell
  curl https://aiboop.org/api/v1
  # 응답: {"message":"Iluli API Server is running!"} (라우트 설정 시)
  ```

- [ ] Google OAuth 로그인이 프로덕션에서 작동하는지 확인
  - Google Cloud Console에서 승인된 도메인 확인:
    - `https://aiboop.org` ✅

- [ ] 브라우저에서 전체 플로우 테스트:
  1. `https://aiboop.org` 접속
  2. Google 로그인
  3. 프로필 수정
  4. 사진 업로드

### 4. 배포 자동화 (선택사항)

GitHub Actions를 사용한 자동 배포 설정:

`.github/workflows/deploy.yml` 파일 생성 (향후 추가 예정)

---

## 📝 개발 체크리스트

### 로컬 개발
- [ ] Node.js 18+ 설치
- [ ] npm 또는 pnpm 설치
- [ ] Cloudflare 계정 생성
- [ ] `wrangler` 로그인 완료
- [ ] D1 데이터베이스 생성 및 마이그레이션
- [ ] R2 버킷 생성
- [ ] Google OAuth Client ID 발급
- [ ] `.env` 파일 설정 (frontend)
- [ ] `wrangler.toml` 수정 (worker)
- [ ] 백엔드 개발 서버 실행 확인
- [ ] 프론트엔드 개발 서버 실행 확인
- [ ] Google 로그인 테스트 완료

### 프로덕션 배포
- [ ] `.env.production` 파일 생성 (frontend)
- [ ] `wrangler.toml`의 `[env.production]` 설정 확인
- [ ] Google OAuth에 프로덕션 도메인 추가
  - [ ] `https://aiboop.org` (승인된 자바스크립트 원본)
  - [ ] `https://aiboop.org` (승인된 리디렉션 URI)
- [ ] D1 프로덕션 마이그레이션 완료
- [ ] Frontend 빌드 후 worker/public으로 복사
- [ ] Worker 배포 (API + Frontend 통합)
- [ ] `aiboop.org` 커스텀 도메인 연결
- [ ] 프로덕션 Google 로그인 테스트

---

**문제가 발생하면 GitHub Issues에 보고해주세요!**
