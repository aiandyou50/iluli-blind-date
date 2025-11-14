
-----

# [PRD-USER-001] (v2.5) 내 프로필 관리 기술 명세서

**문서 버전:** **2.5 (Geohash 반영)** | **작성일:** 2025-11-14 | **작성자:** 이루리 (AI)
**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-USER-001 (v2.4)`에 정의된 '내 프로필 관리' 기능의 기술적 설계를 정의합니다. 이는 '프로필 정보 수정' (닉네임, 인스타그램, **위치** 등)과 '프로필 사진 업로드 및 인증 신청' 기능을 모두 포함합니다.
  - **핵심 기술**: Cloudflare Workers(Hono 프레임워크), D1(DB), R2(Storage)를 사용하며, Google 소셜 로그인을 통한 인증(JWT)을 전제로 합니다.
  - **[v2.5] 핵심 설계**: '거리순 정렬'(`PRD-USER-003`)의 성능 문제를 해결하기 위해, 위도/경도를 **Geohash** 문자열로 변환하여 D1에 함께 저장합니다.

## 2\. 아키텍처 디자인

### 2.1 시스템 컴포넌트 다이어그램 (Cloudflare)

```mermaid
graph TD
    A[사용자 (React App)] -- 1. Google 로그인 --> B[Google Auth]
    B -- 2. ID Token 발급 --> A
    
    A -- 3. 내 정보 수정 요청<br>(PATCH /profile)<br>(ID Token + JSON [lat, lon...]) --> C[Cloudflare Worker (Hono)]
    A -- 4. 사진 업로드 요청<br>(POST /profile/photos/upload)<br>(ID Token + Image File) --> C

    subgraph C [CF Worker]
        D[Auth Middleware] -- 5. ID Token 검증 --> B
        D --> E[API Routes]
        
        E -- 6a. (PATCH /profile)<br>[v2.5] lat/lon -> geohash 계산<br>D1에 UPDATE (Info + Location + Geohash) --> F[(Cloudflare D1<br>(Database))]
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
  version: '1.2.5' # v2.5 PRD (Geohash) 변경사항 반영
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
    # [수정 v2.5] UserProfile 스키마 (수정용)
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
        latitude:
          type: number
          nullable: true
          format: double
          description: '위도 (-90 ~ 90). geohash 계산에 사용됨.'
        longitude:
          type: number
          nullable: true
          format: double
          description: '경도 (-180 ~ 180). geohash 계산에 사용됨.'
      
    # [수정 v2.5] UserProfile 스키마 (조회용)
    # geohash는 내부 구현 스펙이므로 API 응답에 포함 X
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
        latitude: { type: number, nullable: true, format: double }
        longitude: { type: number, nullable: true, format: double }
        location_updated_at: { type: string, nullable: true, format: date-time }

    ProfilePhoto:
      # ... (변경 없음)
      type: object
      
    Error:
      type: object
      properties:
        error: { type: string }

# 2. 모든 API는 Google 인증을 필수로 함
security:
  - googleAuth: []

# 3. API 엔드포인트
paths:
  # --- [수정 v2.5] 프로필 정보 API ---
  /profile:
    get:
      summary: 내 프로필 정보 조회
      description: '인증된 사용자 본인의 프로필 정보(UserProfiles)를 조회합니다.'
      tags:
        - Profile (My)
      responses:
        '200':
          description: '내 프로필 정보 반환'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401': { description: '인증 실패' }
        '404': { description: '프로필을 찾을 수 없음' }
    patch:
      summary: 내 프로필 정보 수정
      description: |
        PRD-USER-001 (v2.5): 닉네임, 인스타그램 URL, 위치 정보 등 내 프로필 정보를 수정합니다.
        **[v2.5] 서버는 'latitude', 'longitude'를 받아 'geohash'(e.g., 6자리)를 계산한 후 D1에 저장합니다.**
      tags:
        - Profile (My)
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
          description: '유효성 검사 실패 (e.g., 잘못된 인스타 URL, 위도/경도 범위 초과)'
        '401': { description: '인증 실패' }
        '409': { description: '닉네임 중복 (Conflict)' }

  # --- [기존] 사진 업로드 API (변경 없음) ---
  /profile/photos/upload:
    post:
      summary: 프로필 사진 업로드
      tags:
        - Profile (My) Photos
      # ... (requestBody, responses 생략)

  /profile/photos/{photoId}/request-verification:
    post:
      summary: 사진 인증 요청
      tags:
        - Profile (My) Photos
      # ... (parameters, responses 생략)
```

## 4\. 데이터베이스 스키마 (Cloudflare D1)

`PRD-USER-001 (v2.5)` (Geohash) 기반의 D1용 SQL 스키마입니다.

```sql
-- D1 스키마: schema.sql

-- 1. 사용자 (Google Auth 기반)
CREATE TABLE Users (
    id TEXT PRIMARY KEY,                            -- UUID (Hono/JS에서 생성)
    google_subject_id TEXT UNIQUE NOT NULL,         -- Google에서 받은 고유 ID
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 사용자 프로필 [v2.5 수정]
CREATE TABLE UserProfiles (
    user_id TEXT PRIMARY KEY NOT NULL,
    nickname TEXT UNIQUE,
    school TEXT,
    mbti TEXT,
    bio TEXT,
    
    instagram_url TEXT,                             -- [v2.3 추가] NULL 허용
    
    latitude REAL,                                  -- [v2.4 추가] NULL 허용, 위도
    longitude REAL,                                 -- [v2.4 추가] NULL 허용, 경도
    location_updated_at TEXT,                       -- [v2.4 추가] NULL 허용
    
    geohash TEXT,                                   -- [v2.5 추가] NULL 허용, (e.g., 'wydm9q')
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. 프로필 사진 (변경 없음)
CREATE TABLE ProfilePhotos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'not_applied' NOT NULL,
    rejection_reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_profilephotos_user_id ON ProfilePhotos(user_id);

-- [v2.5 추가] Geohash 검색을 위한 인덱스 (PRD-USER-003에서 사용)
CREATE INDEX idx_userprofiles_geohash ON UserProfiles(geohash);
```

## 5\. 테스트 전략

  - **단위 테스트 (Jest / Vitest)**:

      - **Hono 미들웨어**: Google Auth 토큰 검증 로직 모킹.
      - **파일 유효성 검사**: MIME 타입/크기 제한 로직 테스트.
      - **[v2.5] `PATCH /profile` 핸들러 유효성 검사**:
          - `instagram_url`: `null`, `https://www.instagram.com/` (성공), `https://www.google.com` (실패) 케이스.
          - `latitude`: `null`, `80.0` (성공), `91.0` (실패) 케이스.
      - **[v2.5] `geohash` 변환 로직**:
          - MOCK 좌표 (e.g., 서울시청 `lat: 37.5665`, `lon: 126.9780`) 입력 시,
          - `geohash-library`가 올바른 Geohash(e.g., 6자리)를 반환하는지 검증.

  - **통합 테스트 (Cloudflare `wrangler dev` + Supertest)**:

      - **TC-API-001 (성공)**: `PATCH /profile` - 유효한 `nickname`, `instagram_url`, `latitude`, `longitude` 전송 -\> 200 OK.
          - **검증**: D1 `UserProfiles` 테이블에 `geohash` 컬럼이 **올바른 문자열로 채워졌는지** 확인. `location_updated_at`도 업데이트되었는지 확인.
      - **TC-API-002 (실패)**: `PATCH /profile` - `latitude`가 100인 데이터 전송 -\> 400 Bad Request 반환 확인.
      - **TC-API-003 (사진 업로드)**: `POST /upload` - 유효한 `image/webp` 파일 전송 -\> 201 Created.
      - **TC-API-004 (인증 요청)**: `POST /.../request-verification` - 200 OK 및 D1 `pending` 상태 변경 확인.
      - **TC-API-005 (인증)**: 인증 토큰 없이 모든 API 호출 시 401 Unauthorized 확인.

-----
