# ✅ 이루리 프로젝트 설정 현황 (2025-11-16)

## 🔑 Google OAuth 클라이언트
```
Client ID: [구성 필요 - wrangler.toml 및 .env 파일에 설정]
```

### Google Cloud Console 설정 확인 사항
- [x] OAuth 클라이언트 생성됨
- [ ] **승인된 자바스크립트 원본**에 다음 URL 추가 확인 필요:
  - [ ] `http://localhost:5173` (개발)
  - [ ] `http://localhost:8787` (개발)
  - [ ] `https://aiboop.org` (프로덕션)
- [ ] **승인된 리디렉션 URI**에 다음 URL 추가 확인 필요:
  - [ ] `http://localhost:5173` (개발)
  - [ ] `https://aiboop.org` (프로덕션)

---

## 🌐 도메인
```
통합 서비스: https://aiboop.org (Workers)
  - Frontend: https://aiboop.org (정적 파일)
  - API: https://aiboop.org/api/v1/* (API 엔드포인트)
```

---

## 💾 Cloudflare 리소스

### D1 데이터베이스
```
이름: iluli-db
Database ID: [구성 필요 - wrangler.toml에 설정]
상태: ✅ 생성 완료
```

**다음 작업:**
```powershell
cd worker
# 로컬 DB 스키마 적용
npx wrangler d1 execute iluli-db --local --file=./schema.sql

# 프로덕션 DB 스키마 적용 (배포 시)
npx wrangler d1 execute iluli-db --remote --file=./schema.sql
```

### R2 스토리지
```
버킷 이름: iluli-photos
상태: ✅ 생성 완료
```

**확인:**
```powershell
npx wrangler r2 bucket list
```

---

## 📁 설정 파일 현황

### ✅ 완료된 파일

#### 1. `worker/wrangler.toml`
- [x] D1 Database ID 설정 필요: 환경별로 구성
- [x] R2 Bucket 설정됨: `iluli-photos`
- [x] Google Client ID 설정 필요 (개발 환경)
- [x] Google Client ID 설정 필요 (프로덕션 환경)
- [x] ALLOWED_ORIGIN 설정됨: `https://aiboop.org`

#### 2. `frontend/.env` (개발용)
- [x] VITE_API_BASE_URL: `http://localhost:8787/api/v1`
- [x] VITE_GOOGLE_CLIENT_ID 설정 필요

#### 3. `frontend/.env.production` (프로덕션용)
- [x] VITE_API_BASE_URL: `https://api.aiboop.org/api/v1`
- [x] VITE_GOOGLE_CLIENT_ID 설정 필요

#### 4. `frontend/.env.example`
- [x] 예시 파일 업데이트됨

---

## 🚀 다음 단계 (순서대로)

### 1️⃣ Google OAuth 설정 확인 및 업데이트
👉 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
- 승인된 자바스크립트 원본 및 리디렉션 URI 추가 (위 체크리스트 참조)

### 2️⃣ 로컬 개발 환경 설정
```powershell
# 1. Worker 의존성 설치
cd worker
npm install

# 2. 로컬 D1 스키마 적용
npx wrangler d1 execute iluli-db --local --file=./schema.sql

# 3. Frontend 의존성 설치
cd ../frontend
npm install
```

### 3️⃣ 로컬 개발 서버 실행
```powershell
# Terminal 1 - Worker
cd worker
npm run dev
# → http://localhost:8787

# Terminal 2 - Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### 4️⃣ 로컬 테스트
1. http://localhost:5173 접속
2. Google 로그인 테스트
3. 프로필 정보 입력 테스트
4. 사진 업로드 테스트

### 5️⃣ 프로덕션 배포 (로컬 테스트 완료 후)
```powershell
# 1. 프로덕션 DB 스키마 적용
cd worker
npx wrangler d1 execute iluli-db --remote --file=./schema.sql

# 2. Frontend 빌드
cd ../frontend
npm run build

# 3. 빌드 파일을 Worker로 복사
Copy-Item -Path .\dist\* -Destination ..\worker\public -Recurse -Force

# 4. Worker 배포 (API + Frontend 통합)
cd ../worker
npx wrangler deploy --env production

# 5. 도메인 연결 (Cloudflare Dashboard에서)
# - Worker 커스텀 도메인: aiboop.org
```

---

## 📖 참고 문서

- **로컬 개발 가이드**: [SETUP.md](../SETUP.md)
- **프로덕션 배포 가이드**: [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md)
- **프로젝트 개요**: [README.md](../README.md)
- **기술 스택**: [docs/ssot/tech-stack.md](./ssot/tech-stack.md)

---

## ⚠️ 중요 확인 사항

### Google OAuth 설정 체크
실제로 Google Cloud Console에 접속하여 다음을 확인하세요:

```
프로젝트: [귀하의 Google Cloud 프로젝트]
OAuth 2.0 클라이언트 ID: [환경별로 구성]

✅ 확인 필요:
1. 승인된 자바스크립트 원본:
   □ http://localhost:5173
   □ http://localhost:8787
   □ https://aiboop.org

2. 승인된 리디렉션 URI:
   □ http://localhost:5173
   □ https://aiboop.org
```

### D1 데이터베이스 확인
```powershell
# DB 목록 확인
npx wrangler d1 list

# DB 정보 확인
npx wrangler d1 info iluli-db
```

### R2 버킷 확인
```powershell
# 버킷 목록 확인
npx wrangler r2 bucket list

# 특정 버킷 확인
npx wrangler r2 bucket info iluli-photos
```

---

**업데이트 일시**: 2025-11-16
**상태**: ✅ 모든 설정 파일 업데이트 완료, Google OAuth 설정 확인 필요
