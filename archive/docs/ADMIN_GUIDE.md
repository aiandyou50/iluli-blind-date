# 어드민 페이지 사용 가이드

## 개요

이루리 소개팅 서비스의 관리자 페이지입니다. 사진 관리, 계정 관리, 파트너 포토부스 인증 관리 기능을 제공합니다.

## 주요 변경 사항

### 1. 사진 인증 로직 수정

**변경 전:**
- 사진 업로드 → 인증 신청 → 관리자 승인 → 피드에 표시

**변경 후:**
- 사진 업로드 → **즉시 피드에 표시** → 인증 신청 (선택) → 관리자 승인 시 **파트너 포토부스 뱃지 추가**

인증 승인은 해당 사진이 파트너사 포토부스에서 촬영된 사진임을 인증하는 뱃지를 부여하는 것이며, 피드 노출과는 무관합니다.

### 2. 관리자 권한 시스템

- 데이터베이스에 `role` 컬럼 추가 (user/admin)
- 관리자만 `/admin` 경로 접근 가능
- API 엔드포인트는 admin 미들웨어로 보호

## 기능

### 대시보드 (`/admin`)

통계 정보 확인:
- 전체 사용자 수
- 전체 사진 수
- 인증 대기 중인 사진 수
- 승인된 사진 수
- 전체 매칭 수

### 사진 관리 (`/admin/photos`)

- 모든 사진 목록 조회
- 인증 상태별 필터링 (미신청/대기중/승인됨/거절됨)
- 사진 삭제
- 페이지네이션

### 인증 관리 (`/admin/verification`)

- 인증 대기 중인 사진 목록
- 사진 승인/거절
- 거절 시 사유 입력

### 사용자 관리 (`/admin/users`)

- 전체 사용자 목록 조회
- 사용자 정보 확인 (닉네임, 이메일, 학교, MBTI, 사진 수)
- 사용자 삭제
- 관리자 권한 부여/회수
- 페이지네이션

## API 엔드포인트

### 통계
- `GET /api/v1/admin/stats` - 통계 정보

### 사진 관리
- `GET /api/v1/admin/photos` - 사진 목록 (필터링 가능)
- `GET /api/v1/admin/photos/pending` - 인증 대기 사진
- `POST /api/v1/admin/photos/:photoId/approve` - 사진 승인
- `POST /api/v1/admin/photos/:photoId/reject` - 사진 거절
- `DELETE /api/v1/admin/photos/:photoId` - 사진 삭제

### 사용자 관리
- `GET /api/v1/admin/users` - 사용자 목록
- `GET /api/v1/admin/users/:userId` - 사용자 상세
- `DELETE /api/v1/admin/users/:userId` - 사용자 삭제
- `PATCH /api/v1/admin/users/:userId/role` - 역할 변경

## 데이터베이스 마이그레이션

### 신규 데이터베이스
`schema.sql` 파일을 실행하면 자동으로 role 컬럼이 포함됩니다.

```bash
wrangler d1 execute iluli-db --local --file=./schema.sql
wrangler d1 execute iluli-db --remote --file=./schema.sql
```

### 기존 데이터베이스
`migrations/add_admin_role.sql` 파일을 실행하여 role 컬럼을 추가합니다.

```bash
wrangler d1 execute iluli-db --local --file=./migrations/add_admin_role.sql
wrangler d1 execute iluli-db --remote --file=./migrations/add_admin_role.sql
```

## 관리자 계정 생성

1. 일반 계정으로 로그인
2. D1 데이터베이스에서 직접 역할 변경:

```sql
UPDATE Users SET role = 'admin' WHERE email = 'admin@example.com';
```

또는 wrangler CLI 사용:

```bash
wrangler d1 execute iluli-db --remote --command="UPDATE Users SET role = 'admin' WHERE email = 'admin@example.com';"
```

## 보안 고려사항

1. 모든 admin API는 `authMiddleware` + `adminMiddleware`로 보호
2. 관리자만 다른 사용자의 역할 변경 가능
3. 자기 자신은 삭제 불가
4. R2 객체 삭제 포함하여 데이터 완전 삭제

## 배포

### Frontend 빌드 및 배포
```bash
cd frontend
npm run build
cp -r dist ../worker/public
```

### Worker 배포
```bash
cd worker
wrangler deploy
```

## 접근 경로

- 일반 사용자: `/feed`, `/matching`, `/profile`
- 관리자: `/admin`, `/admin/photos`, `/admin/verification`, `/admin/users`

관리자 계정으로 로그인하면 피드 페이지에서 관리자 대시보드로 이동할 수 있습니다.
