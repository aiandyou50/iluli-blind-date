# 이루리 프로덕션 배포 가이드 (aiboop.org)

## 📋 배포 개요

- **통합 서비스**: https://aiboop.org (Cloudflare Workers)
  - Frontend: `https://aiboop.org` (정적 파일 서빙)
  - API: `https://aiboop.org/api/v1/*` (API 엔드포인트)
- **데이터베이스**: Cloudflare D1
- **스토리지**: Cloudflare R2

> **아키텍처**: Workers 단일 배포로 API와 정적 파일을 모두 제공합니다.

---

## 🚀 1단계: Google OAuth 프로덕션 설정

### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 기존 OAuth 클라이언트 선택 또는 새로 생성
3. **승인된 자바스크립트 원본**에 다음 추가:
   ```
   https://aiboop.org
   ```
   > Workers가 루트 도메인에서 모든 서비스를 제공합니다.

4. **승인된 리디렉션 URI**에 다음 추가:
   ```
   https://aiboop.org
   ```

5. 저장 후 클라이언트 ID 복사

---

## 🛠️ 2단계: 환경 변수 설정

### Worker 설정 (`worker/wrangler.toml`)

```toml
[env.production]
name = "iluli-worker-prod"
vars = { 
  ALLOWED_ORIGIN = "https://aiboop.org",
  GOOGLE_CLIENT_ID = "554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com"
}
```

### Frontend 설정 (`frontend/.env.production`)

```env
# API는 동일 도메인에서 제공됨
VITE_API_BASE_URL=https://aiboop.org/api/v1
VITE_GOOGLE_CLIENT_ID=554594965102-vpqdkqfugdm2vqh7q35oi7ghtopb7mvq.apps.googleusercontent.com
```

---

## 💾 3단계: 데이터베이스 마이그레이션

### D1 프로덕션 데이터베이스 확인

이미 `iluli-db` 데이터베이스가 생성되어 있습니다.
프로덕션 환경에서도 동일한 DB를 사용하거나, 별도의 프로덕션 DB를 생성할 수 있습니다.

**옵션 1: 기존 DB 사용 (개발과 프로덕션 공용)**
```powershell
cd worker

# 현재 DB 확인
npx wrangler d1 list
```

`wrangler.toml`의 기존 설정 그대로 사용:
```toml
[[d1_databases]]
binding = "DB"
database_name = "iluli-db"
database_id = "YOUR_EXISTING_DATABASE_ID"  # wrangler.toml에서 확인
```

**옵션 2: 별도의 프로덕션 DB 생성 (권장)**
```powershell
# 프로덕션 전용 DB 생성
npx wrangler d1 create iluli-db-prod

# 출력된 database_id를 복사
```

`wrangler.toml`에 프로덕션 DB 추가:
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "iluli-db-prod"
database_id = "새로_생성된_DATABASE_ID"
```

### 스키마 마이그레이션

```powershell
# 프로덕션 DB에 스키마 적용
npx wrangler d1 execute iluli-db-prod --remote --file=./schema.sql
```

---

## 🪣 4단계: R2 버킷 설정

이미 `iluli-photos` 버킷이 생성되어 있습니다.
프로덕션 환경에서도 동일한 버킷을 사용하거나, 별도의 프로덕션 버킷을 생성할 수 있습니다.

**옵션 1: 기존 버킷 사용 (개발과 프로덕션 공용)**
```powershell
# 현재 버킷 확인
npx wrangler r2 bucket list
```

`wrangler.toml`의 기존 설정 그대로 사용:
```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "iluli-photos"
```

**옵션 2: 별도의 프로덕션 버킷 생성 (권장)**
```powershell
# 프로덕션 전용 버킷 생성
npx wrangler r2 bucket create iluli-photos-prod
```

`wrangler.toml`에 프로덕션 버킷 추가:
```toml
[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "iluli-photos-prod"
```

---

## 🚢 5단계: Frontend 빌드

```powershell
cd frontend

# 프로덕션 빌드 (.env.production 자동 사용)
npm run build
```

**빌드 결과:**
- `frontend/dist/` 폴더에 최적화된 정적 파일 생성
- HTML, CSS, JavaScript 번들링 완료

---

## 📦 6단계: 빌드 파일을 Worker로 복사

```powershell
# dist 폴더를 worker/public으로 복사
Copy-Item -Path .\dist\* -Destination ..\worker\public -Recurse -Force

# 또는 Git Bash/WSL에서:
# cp -r dist/* ../worker/public/
```

> Worker가 `public/` 폴더의 정적 파일을 자동으로 서빙합니다.

---

## 🚀 7단계: Worker 배포 (API + Frontend 통합)

```powershell
cd ../worker

# 프로덕션 환경으로 배포
npx wrangler deploy --env production
```

**배포 성공 시 출력:**
```
Published iluli-worker-prod (1.23 sec)
  https://iluli-worker-prod.YOUR_ACCOUNT.workers.dev
```

---

## 🌐 8단계: 커스텀 도메인 연결 (aiboop.org)

### Cloudflare Dashboard에서 설정

1. Cloudflare Dashboard → **Workers & Pages** → `iluli-worker-prod` 선택
2. **Triggers** 탭 클릭
3. **Custom Domains** 섹션에서 **Add Custom Domain** 클릭
4. 도메인 입력: `aiboop.org` (루트 도메인)
5. **Add Domain** 클릭
6. DNS 레코드가 자동으로 추가됨 (CNAME 또는 A/AAAA)
7. SSL 인증서 자동 프로비저닝 (1-2분 소요)

### 확인

```powershell
# Frontend 확인
curl https://aiboop.org
# HTML 응답 확인 (index.html)

# API 확인
curl https://aiboop.org/api/v1
# JSON 응답 확인 (API 라우트가 있을 경우)
```

---

## ✅ 9단계: 프로덕션 동작 테스트

### 1. Frontend 로딩 확인
```powershell
curl https://aiboop.org
```
**예상 응답:**
- HTML 파일 (index.html)

### 2. API 엔드포인트 확인
```powershell
# 프로필 API 테스트 (인증 필요)
curl https://aiboop.org/api/v1/profile -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 브라우저에서 전체 플로우 테스트
1. `https://aiboop.org` 접속
2. "Google로 로그인" 클릭
3. Google 계정 선택
4. 로그인 후 프로필 페이지로 리디렉션 확인

### 4. 프로필 수정 테스트
1. 닉네임, 학교 등 정보 입력
2. "저장" 클릭
3. 새로고침 후 데이터 유지 확인

### 5. 사진 업로드 테스트
1. "사진 업로드" 버튼 클릭
2. 이미지 선택 (< 10MB)
3. R2에 업로드 확인
4. 사진이 표시되는지 확인

---

## 🔧 문제 해결

### 1. CORS 에러 발생 시
**증상:** 브라우저 콘솔에 "CORS policy" 에러

**해결:**
- `worker/wrangler.toml`의 `[env.production]`에 `ALLOWED_ORIGIN = "https://aiboop.org"` 확인
- Worker 재배포: `npx wrangler deploy --env production`

### 2. Google OAuth 401 에러
**증상:** "Unauthorized: Invalid token"

**해결:**
- Google Cloud Console에서 승인된 도메인 재확인
  - `https://aiboop.org` ✅
- `.env.production`의 `VITE_GOOGLE_CLIENT_ID` 확인
- Frontend 재빌드 및 Worker 재배포

### 3. 정적 파일 404 에러
**증상:** `https://aiboop.org`에서 HTML이 로드되지 않음

**해결:**
- `worker/public/` 폴더에 빌드 파일이 있는지 확인
- Worker 재배포: `npx wrangler deploy --env production`

### 4. API 404 에러
**증상:** `https://aiboop.org/api/v1/profile` 호출 시 404

**해결:**
- Worker가 배포되었는지 확인
- `wrangler tail --env production`으로 로그 확인
- 라우팅 설정 확인 (worker/src/index.ts)

### 5. 사진 업로드 실패
**증상:** "File upload failed"

**해결:**
- R2 버킷이 생성되었는지 확인
- `wrangler.toml`의 R2 바인딩 확인
- Worker 로그 확인: `npx wrangler tail --env production`

---

## 🔄 배포 업데이트

### 코드 변경 시 재배포 프로세스

```powershell
# 1. Frontend 코드 변경 시
cd frontend
npm run build
Copy-Item -Path .\dist\* -Destination ..\worker\public -Recurse -Force

# 2. Worker 코드 또는 Frontend 재배포
cd ../worker
npx wrangler deploy --env production
```

### DB 스키마 업데이트
```powershell
cd worker
# schema.sql 수정 후
npx wrangler d1 execute iluli-db --remote --file=./schema.sql
# 또는 프로덕션 전용 DB 사용 시:
# npx wrangler d1 execute iluli-db-prod --remote --file=./schema.sql
```

---

## 📊 모니터링

### Worker 로그 실시간 확인
```powershell
cd worker
npx wrangler tail --env production
```

### Cloudflare Dashboard
- **Workers & Pages** → `iluli-worker-prod` → **Analytics**
  - 요청 수, 에러율, 응답 시간
  - CPU 사용 시간
  - 대역폭 사용량

---

## 🎉 배포 완료 체크리스트

- [ ] Google OAuth 프로덕션 도메인 추가 (`https://aiboop.org`)
- [ ] Worker `wrangler.toml` 프로덕션 설정 완료
- [ ] Frontend `.env.production` 파일 생성 (VITE_API_BASE_URL=https://aiboop.org/api/v1)
- [ ] D1 프로덕션 데이터베이스 생성 및 마이그레이션
- [ ] R2 프로덕션 버킷 생성
- [ ] Frontend 빌드 완료
- [ ] 빌드 파일을 `worker/public/`로 복사
- [ ] Worker 배포 성공 (API + Frontend 통합)
- [ ] 커스텀 도메인 연결 (`aiboop.org`)
- [ ] Frontend 로딩 테스트 통과 (`https://aiboop.org`)
- [ ] API 엔드포인트 테스트 통과 (`https://aiboop.org/api/v1/*`)
- [ ] Google OAuth 로그인 테스트 통과
- [ ] 프로필 수정 기능 테스트 통과
- [ ] 사진 업로드 기능 테스트 통과

---

**축하합니다! 🎊 이루리가 https://aiboop.org 에서 정상 작동 중입니다!**

> Workers 단일 배포로 API와 Frontend가 모두 `aiboop.org`에서 서비스됩니다.
