
-----

# [PRD-USER-001] (v2.5) 내 프로필 관리 기술 명세서

**문서 버전:** 2.5 (Geohash 및 사진 삭제 API 반영) | **작성일:** 2025-11-16 | **작성자:** 이루리 (AI)
**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-USER-001 (v2.5)`에 정의된 '내 프로필 관리' 기능의 기술적 설계를 정의합니다. 이는 '프로필 정보 수정' (닉네임, 인스타그램, 위치 등), '프로필 사진 업로드' 및 **'프로필 사진 삭제'** 기능을 모두 포함합니다.
  - **핵심 기술**: Cloudflare Workers(Hono 프레임워크), D1(DB), R2(Storage), Geohash.
  - **범위 (In Scope)**:
      - 사용자 인증(Google) 미들웨어 설계.
      - 내 프로필 정보 조회/수정 API (`GET /profile`, `PATCH /profile`).
      - 사진 업로드 API (`POST /profile/photos/upload`).
      - 사진 인증 요청 API (`POST /profile/photos/{id}/request-verification`).
      - **[v2.5 추가]** 사진 삭제 API (`DELETE /profile/photos/{id}`).
      - Cloudflare D1 데이터베이스 스키마 (v2.5).

## 2\. 아키텍처 디자인

### 2.1 시스템 컴포넌트 다이어그램 (Cloudflare)

```mermaid
graph TD
    A[사용자 (React App)] -- 1. Google 로그인 --> B[Google Auth]
    B -- 2. ID Token 발급 --> A
    
    A -- 3. 내 정보 수정<br>(PATCH /profile) --> C[Cloudflare Worker (Hono)]
    A -- 4. 사진 업로드<br>(POST /upload) --> C
    A -- 5. [v2.5] 사진 삭제<br>(DELETE /photos/{id}) --> C

    subgraph C [CF Worker]
        D[Auth Middleware] -- 6. ID Token 검증 --> B
        D --> E[API Routes]
        
        E -- 7a. (PATCH)<br>geohash 계산, D1 UPDATE --> F[(Cloudflare D1<br>(Database))]
        E -- 7b. (POST)<br>파일 업로드, D1 INSERT --> F
        E -- 7c. (DELETE)<br>D1 DELETE (본인 확인) --> F
        
        F -- 8. D1 결과 반환 --> E
        E -- 9. API 응답 (200/201) --> H
    end
    
    H --> A
```

## 3\. API 명세 (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: '이루리 소개팅 API'
  version: '1.5.0' # v2.5 PRD (Delete API) 변경사항 반영
servers:
  - url: /api/v1
    description: API v1 Base Path (Cloudflare Worker)

# 1. 인증 스키마 정의
components:
  securitySchemes:
    googleAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: 'Google OIDC ID Token'
  schemas:
    # --- (v2.4 스키마: UserProfileUpdate, UserProfile, ProfilePhoto, Error) ---
    # (생략 - 이전 v2.5 Tech Spec과 동일)
    UserProfileUpdate:
      type: object
      # ... (nickname, school, mbti, bio, instagram_url, latitude, longitude)
    UserProfile:
      type: object
      # ... (user_id, email, nickname, ..., location_updated_at)
    ProfilePhoto:
      type: object
      # ... (id, image_url, verification_status, ...)
    Error:
      type: object
      # ... (error)

# 2. 모든 API는 Google 인증을 필수로 함
security:
  - googleAuth: []

# 3. API 엔드포인트
paths:
  # --- 프로필 정보 API (변경 없음) ---
  /profile:
    get:
      summary: 내 프로필 정보 조회
      tags: [Profile (My)]
      # ... (responses 생략)
    patch:
      summary: 내 프로필 정보 수정
      description: 'PRD-USER-001 (v2.5): 닉네임, 인스타, Geohash 위치 정보 등을 수정합니다.'
      tags: [Profile (My)]
      # ... (requestBody, responses 생략)

  # --- 사진 업로드 API (변경 없음) ---
  /profile/photos/upload:
    post:
      summary: 프로필 사진 업로드
      tags: [Profile (My) Photos]
      # ... (requestBody, responses 생략)

  /profile/photos/{photoId}/request-verification:
    post:
      summary: 사진 인증 요청
      tags: [Profile (My) Photos]
      # ... (parameters, responses 생략)

  # --- [v2.5 신규] 사진 삭제 API ---
  /profile/photos/{photoId}:
    delete:
      summary: '[v2.5] 내 프로필 사진 삭제'
      description: |
        PRD-USER-001 (v2.5): 내 프로필 사진을 영구적으로 삭제합니다.
        **[보안] 반드시 사진의 소유자(Owner)만 삭제할 수 있도록 서버에서 검증해야 합니다.**
        **[의존성] `Likes` 테이블의 `ON DELETE CASCADE`가 설정되어 있어야 합니다 (`PRD-USER-004`).**
      tags:
        - Profile (My) Photos
      parameters:
        - in: path
          name: photoId
          required: true
          schema:
            type: string
            format: uuid
          description: '삭제할 사진의 ID'
      responses:
        '200':
          description: '사진 삭제 성공.'
          content:
            application/json:
              schema:
                type: object
                properties:
                  message: { type: string, example: 'Photo deleted successfully' }
        '401': { description: '인증 실패' }
        '403': { description: '권한 없음 (사진 소유자가 아님)' }
        '404': { description: '사진을 찾을 수 없음' }
```

## 4\. 데이터베이스 스키마 (Cloudflare D1)

`PRD-USER-001 (v2.5)` (Geohash) 기반의 D1용 SQL 스키마입니다. (이 문서에서 정의하는 테이블)

```sql
-- D1 스키마: schema.sql

-- 1. 사용자 (Google Auth 기반)
CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    google_subject_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 사용자 프로필 (v2.5 Geohash 포함)
CREATE TABLE UserProfiles (
    user_id TEXT PRIMARY KEY NOT NULL,
    nickname TEXT UNIQUE,
    school TEXT,
    mbti TEXT,
    bio TEXT,
    instagram_url TEXT,
    latitude REAL,
    longitude REAL,
    location_updated_at TEXT,
    geohash TEXT, -- [v2.5]
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. 프로필 사진 (v2.5 likes_count 의존성 포함)
CREATE TABLE ProfilePhotos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'not_applied' NOT NULL,
    rejection_reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- [의존성: PRD-USER-004] '좋아요' 카운트 (성능 최적화용)
    likes_count INTEGER DEFAULT 0 NOT NULL, 
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. [의존성: PRD-USER-004] Likes 테이블
-- (이 테이블은 'PRD-USER-004 Tech Spec (v1.1)'에서 정의됩니다)
-- (참고용)
-- CREATE TABLE Likes (
--    user_id TEXT NOT NULL,
--    photo_id TEXT NOT NULL,
--    ...
--    FOREIGN KEY (photo_id) REFERENCES ProfilePhotos(id) ON DELETE CASCADE -- [v2.5 핵심 의존성]
-- );


-- 인덱스
CREATE INDEX idx_userprofiles_geohash ON UserProfiles(geohash);
CREATE INDEX idx_profilephotos_user_id ON ProfilePhotos(user_id);
-- [의존성: PRD-USER-004]
-- CREATE INDEX idx_profilephotos_likes_count ON ProfilePhotos(likes_count);
```

## 5\. 테스트 전략

  - **단위 테스트 (Jest / Vitest)**:

      - (v2.4 동일: Auth 미들웨어, 파일 유효성, Geohash 변환 로직)
      - **[v2.5 신규] `DELETE /.../{id}` 핸들러**:
          - D1 `db.prepare()`가 `DELETE FROM ProfilePhotos WHERE id = ?1 AND user_id = ?2` 라는 **소유권 검증 SQL**로 호출되는지 검증.

  - **통합 테스트 (Cloudflare `wrangler dev` + Supertest)**:

      - (v2.4 동일: TC-API-001 \~ TC-API-005)
      - **[v2.5 신규] TC-API-009 (삭제 권한 실패)**:
          - **선행**: `UserA`가 `PhotoA` 업로드. `UserB`가 로그인.
          - **실행**: `UserB`가 `DELETE /profile/photos/{PhotoA의 ID}` 호출.
          - **검증**: **403 Forbidden** 응답 확인. D1에서 `PhotoA`가 삭제되지 않았는지 확인.
      - **[v2.5 신규] TC-API-010 (삭제 성공)**:
          - **선행**: `UserA`가 `PhotoA` 업로드. `UserA`가 로그인.
          - **실행**: `UserA`가 `DELETE /profile/photos/{PhotoA의 ID}` 호출.
          - **검증**: **200 OK** 응답 확인. D1에서 `PhotoA`가 삭제되었는지 확인.
          - **(연동 검증)**: (TC-CASCADE-001 - `PRD-USER-004` 테스트와 동일) `Likes` 테이블의 관련 데이터도 `ON DELETE CASCADE`로 삭제되었는지 확인.

-----
