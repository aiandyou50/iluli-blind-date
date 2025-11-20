
-----

# [PRD-USER-001] (v2.3) 내 프로필 관리 기술 명세서

**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-USER-001 (v2.3)`에 정의된 '내 프로필 관리' 기능의 기술적 설계를 정의합니다. 이는 '프로필 정보 수정' (닉네임, 인스타그램 URL 등)과 '프로필 사진 업로드 및 인증 신청' 기능을 모두 포함합니다.
  - **핵심 기술**: Cloudflare Workers(Hono 프레임워크), D1(DB), R2(Storage)를 사용하며, Google 소셜 로그인을 통한 인증(JWT)을 전제로 합니다.
  - **범위 (In Scope)**:
      - 사용자 인증(Google) 미들웨어 설계.
      - **`[신규 v2.3]`** 내 프로필 정보 조회 API (`GET /profile`).
      - **`[신규 v2.3]`** 내 프로필 정보 수정 API (`PATCH /profile`).
      - 사진 업로드 API 엔드포인트 (`POST /profile/photos/upload`).
      - 사진 인증 요청 API 엔드포인트 (`POST /profile/photos/{id}/request-verification`).
      - Cloudflare D1 데이터베이스 스키마 (v2.3).
  - **범위 제외 (Out of Scope)**:
      - **`PRD-ADMIN-001`** 관련 기능 (관리자 페이지 API).
      - Google OAuth 2.0 클라이언트 ID 발급 프로세스.

## 2\. 아키텍처 디자인

### 2.1 시스템 컴포넌트 다이어그램 (Cloudflare)

```mermaid
graph TD
    A[사용자 (React App)] -- 1. Google 로그인 --> B[Google Auth]
    B -- 2. ID Token 발급 --> A
    
    A -- 3. 내 정보 수정 요청<br>(PATCH /profile)<br>(ID Token + JSON) --> C[Cloudflare Worker (Hono)]
    A -- 4. 사진 업로드 요청<br>(POST /profile/photos/upload)<br>(ID Token + Image File) --> C

    subgraph C [CF Worker]
        D[Auth Middleware] -- 5. ID Token 검증 --> B
        D --> E[API Routes]
        
        E -- 6a. (PATCH /profile)<br>D1에 UPDATE --> F[(Cloudflare D1<br>(Database))]
        E -- 6b. (POST /upload)<br>파일 유효성 검사 --> E
        
        E -- 7. 파일 업로드 --> G[Cloudflare R2<br>(Image Storage)]
        G -- 8. Image URL 반환 --> E
        
        E -- 9. 메타데이터 저장<br>(INSERT ProfilePhotos) --> F
        
        F -- 10. D1 결과 반환 --> E
        E -- 11. API 응답 (200 OK / 201 Created) --> H
    end
    
    H --> A
```

## 3\. API 명세 (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: '이루리 소개팅 API'
  version: '1.1.0' # v2.3 PRD 변경사항 반영
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
    # [신규 v2.3] UserProfile 스키마 (수정용)
    UserProfileUpdate:
      type: object
      properties:
        nickname:
          type: string
          description: '사용자 닉네임 (UNIQUE)'
        school:
          type: string
        mbti:
          type: string
        bio:
          type: string
        instagram_url:
          type: string
          nullable: true
          format: uri
          description: 'https://www.instagram.com/ 으로 시작해야 함'
      
    # UserProfile 스키마 (조회용 - User 정보 포함)
    UserProfile:
      type: object
      properties:
        user_id: { type: string, format: uuid }
        email: { type: string, format: email } # Users 테이블에서 Join
        nickname: { type: string }
        school: { type: string }
        mbti: { type: string }
        bio: { type: string }
        instagram_url: { type: string, nullable: true, format: uri }

    ProfilePhoto:
      type: object
      properties:
        id: { type: string, format: uuid }
        image_url: { type: string, format: uri }
        verification_status:
          type: string
          enum: ['not_applied', 'pending', 'approved', 'rejected']
        created_at: { type: string, format: date-time }
        rejection_reason: { type: string, nullable: true }

    Error:
      type: object
      properties:
        error: { type: string }

# 2. 모든 API는 Google 인증을 필수로 함
security:
  - googleAuth: []

# 3. API 엔드포인트
paths:
  # --- [신규 v2.3] 프로필 정보 API ---
  /profile:
    get:
      summary: 내 프로필 정보 조회
      description: '인증된 사용자 본인의 프로필 정보(UserProfiles)를 조회합니다.'
      tags:
        - Profile
      responses:
        '200':
          description: '내 프로필 정보 반환'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          description: '인증 실패'
        '404':
          description: '프로필을 찾을 수 없음 (최초 가입 시)'
    patch:
      summary: 내 프로필 정보 수정
      description: 'PRD-USER-001 (v2.3): 닉네임, 인스타그램 URL 등 내 프로필 정보를 수정합니다.'
      tags:
        - Profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserProfileUpdate'
      responses:
        '200':
          description: '프로필 수정 성공. 업데이트된 프로필 반환.'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '400':
          description: '유효성 검사 실패 (e.g., 잘못된 인스타그램 URL 형식)'
        '401':
          description: '인증 실패'
        '409':
          description: '닉네임 중복 (Conflict)'

  # --- [기존] 사진 업로드 API ---
  /profile/photos/upload:
    post:
      summary: 프로필 사진 업로드
      description: '새 프로필 사진을 R2에 업로드하고 D1에 메타데이터를 저장합니다.'
      tags:
        - Profile Photos
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: '업로드할 이미지 파일 (jpeg, png, webp). 10MB 제한.'
            encoding:
              file:
                contentType: 'image/jpeg, image/png, image/webp'
      responses:
        '201':
          description: '업로드 성공. 생성된 사진 정보 반환.'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfilePhoto'
        '400':
          description: '파일 유효성 검사 실패 (MIME 타입, 크기 초과)'
        '401': { description: '인증 실패' }

  /profile/photos/{photoId}/request-verification:
    post:
      summary: 사진 인증 요청
      description: '업로드된 사진(not_applied)의 상태를 'pending'으로 변경합니다.'
      tags:
        - Profile Photos
      parameters:
        - in: path
          name: photoId
          required: true
          schema:
            type: string
            format: uuid
          description: '인증을 요청할 사진의 ID'
      responses:
        '200':
          description: '인증 요청(상태 변경) 성공. 업데이트된 사진 정보 반환.'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfilePhoto'
        '403':
          description: '권한 없음 (사진이 본인 소유가 아님)'
        '404':
          description: '사진을 찾을 수 없음'
        '409':
          description: '상태 오류 (이미 'pending' 또는 'approved' 상태임)'
```

## 4\. 데이터베이스 스키마 (Cloudflare D1)

`PRD-USER-001 (v2.3)`의 3.2절에 정의된 데이터 모델 기반의 D1용 SQL 스키마입니다.

```sql
-- D1 스키마: schema.sql

-- 1. 사용자 (Google Auth 기반)
CREATE TABLE Users (
    id TEXT PRIMARY KEY,                            -- UUID (Hono/JS에서 생성)
    google_subject_id TEXT UNIQUE NOT NULL,         -- Google에서 받은 고유 ID
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 사용자 프로필 [v2.3 수정]
CREATE TABLE UserProfiles (
    user_id TEXT PRIMARY KEY NOT NULL,
    nickname TEXT UNIQUE,
    school TEXT,
    mbti TEXT,
    bio TEXT,
    instagram_url TEXT,                             -- [v2.3 추가] NULL 허용
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. 프로필 사진 (변경 없음)
CREATE TABLE ProfilePhotos (
    id TEXT PRIMARY KEY,                            -- UUID (Hono/JS에서 생성)
    user_id TEXT NOT NULL,
    image_url TEXT NOT NULL,                        -- R2에 저장된 객체 URL
    
    -- 'not_applied' (기본값) -> 'pending' (신청) -> 'approved' (승인) / 'rejected' (거절)
    verification_status TEXT DEFAULT 'not_applied' NOT NULL 
        CHECK(verification_status IN ('not_applied', 'pending', 'approved', 'rejected')),
        
    rejection_reason TEXT,                          -- 관리자가 거절 시 사유 작성
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_profilephotos_user_id ON ProfilePhotos(user_id);
```

## 5\. 테스트 전략

  - **단위 테스트 (Jest / Vitest)**:

      - **Hono 미들웨어**: Google Auth 토큰 검증 로직 모킹(mocking) 테스트.
      - **파일 유효성 검사**: `multipart/form-data` 파싱 및 MIME 타입/크기 제한 로직 테스트.
      - **[신규 v2.3] `instagram_url` 유효성 검사**: `null`, `https://www.instagram.com/`, `https://www.google.com` (실패) 케이스 테스트.

  - **통합 테스트 (Cloudflare `wrangler dev` + Supertest)**:

      - **[신규 v2.3] TC-API-000: `GET /profile`**: 인증된 사용자의 프로필 정보를 200 OK로 반환하는지 확인.
      - **[신규 v2.3] TC-API-001: `PATCH /profile` (성공)**: 유효한 `nickname`과 `instagram_url`로 200 OK 및 D1 데이터 변경 확인.
      - **[신규 v2.3] TC-API-002: `PATCH /profile` (실패)**: 유효하지 않은 `instagram_url`(e.g., `google.com`)로 400 Bad Request 반환 확인.
      - **TC-API-003: `POST /upload` (성공)**: 유효한 이미지(`image/png`)와 토큰으로 201 Created 및 D1/R2 상태 확인.
      - **TC-API-004: `POST /upload` (실패)**: 유효하지 않은 파일(`text/plain`)로 400 Bad Request 확인.
      - **TC-API-005: `POST /upload` (실패)**: 10MB 초과 파일로 400 Bad Request 확인.
      - **TC-API-006: `POST /.../request-verification` (성공)**: 업로드 직후(`not_applied`) 200 OK 및 D1 상태 `pending` 변경 확인.
      - **TC-API-007: `POST /.../request-verification` (실패)**: `pending` 상태에서 재호출 시 409 Conflict 확인.
      - **TC-API-008: (인증)**: 인증 토큰 없이 모든 API 호출 시 401 Unauthorized 확인.

-----
