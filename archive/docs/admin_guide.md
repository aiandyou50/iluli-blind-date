# 관리자 가이드 (Admin Guide)

이루리 소개팅 서비스의 관리자 계정 관리 가이드입니다.

## 새 관리자 이메일 추가 방법

관리자 권한은 데이터베이스의 `Users` 테이블에서 `role` 컬럼을 통해 관리됩니다.

### 전제 조건

새로운 관리자로 추가하려는 사용자가 최소 한 번 이상 서비스에 로그인하여 `Users` 테이블에 레코드가 생성되어 있어야 합니다.

### 방법 1: Wrangler CLI를 사용한 SQL 실행 (권장)

#### 로컬 개발 환경:

```bash
cd worker

# 특정 사용자를 관리자로 설정
wrangler d1 execute iluli-db --local --command="UPDATE Users SET role = 'admin' WHERE email = 'admin@example.com';"

# 변경 사항 확인
wrangler d1 execute iluli-db --local --command="SELECT id, email, role FROM Users WHERE email = 'admin@example.com';"
```

#### 프로덕션 환경:

```bash
cd worker

# 특정 사용자를 관리자로 설정
wrangler d1 execute iluli-db --remote --command="UPDATE Users SET role = 'admin' WHERE email = 'admin@example.com';"

# 변경 사항 확인
wrangler d1 execute iluli-db --remote --command="SELECT id, email, role FROM Users WHERE email = 'admin@example.com';"
```

### 방법 2: SQL 파일을 사용한 일괄 실행

여러 관리자를 한 번에 추가하거나 초기 설정 시 사용합니다.

1. `worker/seed_admin.sql` 파일을 편집합니다:

```sql
-- 새 관리자 추가 예시
UPDATE Users SET role = 'admin' WHERE email = 'admin1@example.com';
UPDATE Users SET role = 'admin' WHERE email = 'admin2@example.com';
UPDATE Users SET role = 'admin' WHERE email = 'admin3@example.com';
```

2. SQL 파일을 실행합니다:

```bash
# 로컬 환경
wrangler d1 execute iluli-db --local --file=./seed_admin.sql

# 프로덕션 환경
wrangler d1 execute iluli-db --remote --file=./seed_admin.sql
```

### SQL 쿼리 예시

#### 관리자 추가 (UPDATE)

```sql
UPDATE Users
SET role = 'admin'
WHERE email = 'newadmin@example.com';
```

#### 관리자 권한 제거 (일반 사용자로 변경)

```sql
UPDATE Users
SET role = 'user'
WHERE email = 'oldadmin@example.com';
```

#### 모든 관리자 목록 조회

```sql
SELECT id, email, role, created_at
FROM Users
WHERE role = 'admin'
ORDER BY created_at DESC;
```

#### 특정 사용자의 권한 확인

```sql
SELECT id, email, role
FROM Users
WHERE email = 'user@example.com';
```

## 주의사항

1. **사용자 존재 확인**: 관리자로 추가하려는 이메일이 `Users` 테이블에 존재하는지 먼저 확인하세요.

2. **이메일 정확성**: 이메일 주소는 대소문자를 구분하므로 정확히 입력해야 합니다.

3. **프로덕션 주의**: 프로덕션 데이터베이스에서 작업할 때는 항상 먼저 조회 쿼리로 확인한 후 수정하세요.

4. **백업**: 중요한 변경 전에는 데이터베이스 백업을 권장합니다.

## 관리자 기능

관리자 권한을 가진 사용자는 다음 기능에 접근할 수 있습니다:

- `/admin` - 관리자 대시보드
- `/admin/verification` - 사진 인증 관리
- `/admin/photos` - 사진 관리
- `/admin/users` - 사용자 관리

관리자가 아닌 사용자가 이러한 경로에 접근하려고 하면 자동으로 메인 페이지(`/`)로 리다이렉트됩니다.

## 기술 세부사항

- **데이터베이스**: Cloudflare D1 (SQLite 기반)
- **테이블**: `Users`
- **컬럼**: `role` (VARCHAR, CHECK 제약: 'user' 또는 'admin')
- **기본값**: 'user' (모든 신규 사용자는 기본적으로 일반 사용자)

## 문의

관리자 권한 관련 문제가 있을 경우 시스템 관리자에게 문의하세요.

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-11-16
