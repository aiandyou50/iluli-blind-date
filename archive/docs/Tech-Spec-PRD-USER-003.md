
-----

# [PRD-USER-003] (v1.1) 메인 피드 브라우징 기술 명세서

**문서 버전:** **1.1 (Geohash 반영)** | **작성일:** 2025-11-14 | **작성자:** 이루리 (AI)
**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-USER-003`에 정의된 '메인 피드 브라우징' 기능을 구현하기 위한 백엔드(Cloudflare Worker) API의 기술적 설계를 정의합니다.
  - **핵심 기술**: Cloudflare Workers(Hono), D1(DB), **[v1.1] Geohash**.
  - **범위 (In Scope)**:
      - 신규 API 엔드포인트: `GET /api/v1/feed`
      - 5가지 정렬 옵션(최신순, 좋아요순, **[v1.1] Geohash 기반 거리순** 등)을 처리하는 로직.
      - 무한 스크롤을 위한 페이지네이션(Pagination) 처리.
  - **핵심 의존성 (Dependencies)**:
    1.  **`PRD-USER-001 Tech Spec (v2.5)`**: `UserProfiles` 테이블에 `latitude`, `longitude`, 그리고 **`geohash`** 컬럼이 **필수**입니다.
    2.  **`PRD-USER-004` (좋아요) 스키마 (미정의)**: '좋아요 순' 정렬 및 '내가 좋아요' 여부를 표시하기 위해, **`Likes` 테이블**과 **`ProfilePhotos.likes_count` 컬럼**이 필요합니다. 본 문서는 이 스키마가 존재한다고 *가정*하고 설계합니다.

## 2\. 아키텍처 디자인

### 2.1 '좋아요' 의존성 선행 정의 (PRD-USER-004 가설)

`sort=popular` 및 `i_like_this` 응답을 위해, 다음과 같은 D1 스키마가 `PRD-USER-004`에서 정의되어야 합니다.

```sql
-- [가정 1] PRD-USER-004에서 생성할 '좋아요' 테이블
CREATE TABLE Likes (
    user_id TEXT NOT NULL,  -- 좋아요를 누른 사용자 ID
    photo_id TEXT NOT NULL, -- 좋아요를 받은 사진 ID
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, photo_id)
);

-- [가정 2] '좋아요 순' 정렬 성능을 위한 'ProfilePhotos' 스키마 수정
-- (PRD-USER-004의 Tech Spec에서 이 수정사항을 확정해야 함)
ALTER TABLE ProfilePhotos ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;
CREATE INDEX idx_profilephotos_likes_count ON ProfilePhotos(likes_count);
```

### 2.2 [v1.1] '거리 순' 정렬 (Geohash 구현)

> **설계 결정**:
> D1의 Geo-spatial 쿼리 부재 문제를 **Geohash**로 해결합니다.
>
> 1.  **사전 작업 (Write)**: `PRD-USER-001 (v2.5)`에서 사용자가 위치를 저장할 때 `geohash` 컬럼(정밀도 6\~7자리)에 인덱싱된 문자열을 저장합니다.
> 2.  **실행 (Read)**: `GET /feed?sort=distance` 요청 시, Worker는 사용자의 `lat`/`lon`(Type A)으로 Geohash 및 **주변 8개 이웃 Geohash**를 계산합니다.
> 3.  **D1 쿼리**: D1에 **`WHERE geohash IN (9개_해시_목록)`** 조건으로 쿼리하여 "근처 사용자" 목록만 1차로 필터링합니다.
> 4.  **메모리 정렬**: Worker는 D1에서 반환된 이 **소규모 목록**에 대해서만 정확한 '하버사인 공식(Haversine formula)'을 적용하여 메모리에서 정밀 정렬합니다.
> 5.  **페이지네이션**: 최종 정렬된 목록을 페이지네이션하여 반환합니다.

## 3\. API 명세 (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: '이루리 소개팅 API (v1.3)'
  version: '1.3.0' # PRD-USER-003 API 추가
servers:
  - url: /api/v1
    description: API v1 Base Path (Cloudflare Worker)

# 1. 인증 스키마
components:
  securitySchemes:
    googleAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    # --- [신규 v1.3] ---
    FeedItem:
      type: object
      properties:
        photo_id: { type: string, format: uuid }
        image_url: { type: string, format: uri }
        user:
          type: object
          properties:
            user_id: { type: string, format: uuid }
            nickname: { type: string }
            profile_image_url: { type: string, nullable: true } 
        likes_count:
          type: integer
          default: 0
        i_like_this:
          type: boolean
          description: '요청한 사용자(본인)가 이 사진을 좋아요 눌렀는지 여부'
        
    Error:
      type: object
      properties:
        error: { type: string }
        
# 2. 모든 API는 Google 인증을 필수로 함
security:
  - googleAuth: []

# 3. API 엔드포인트
paths:
  # --- [신규 v1.3] ---
  /feed:
    get:
      summary: 메인 피드 목록 조회
      description: |
        PRD-USER-003: 정렬 옵션에 따라 '승인된' 사진 목록을 조회합니다.
        **[v1.1] 'sort=distance'**: Geohash 기반 근접 이웃 조회 후 Worker에서 정밀 정렬합니다.
      tags:
        - Feed
      parameters:
        - in: query
          name: sort
          required: true
          schema:
            type: string
            enum: ['latest', 'oldest', 'popular', 'random', 'distance']
            default: 'latest'
          description: '정렬 옵션'
        - in: query
          name: page
          schema:
            type: integer
            default: 1
          description: '페이지 번호 (무한 스크롤용)'
        # 'sort=distance'일 때 클라이언트가 전송 (Type A 위치)
        - in: query
          name: lat
          schema:
            type: number
            format: double
          description: '현재 사용자 위도 (sort=distance 시 필수)'
        - in: query
          name: lon
          schema:
            type: number
            format: double
          description: '현재 사용자 경도 (sort=distance 시 필수)'
      responses:
        '200':
          description: '피드 목록 및 다음 페이지 정보 반환'
          content:
            application/json:
              schema:
                type: object
                properties:
                  feed:
                    type: array
                    items:
                      $ref: '#/components/schemas/FeedItem'
                  next_page:
                    type: integer
                    nullable: true
                    description: '다음 페이지 번호. 없으면 null.'
        '400':
          description: 'Bad Request (e.g., sort=distance 시 lat/lon 누락)'
        '401':
          description: '인증 실패 (로그인하지 않은 사용자)'
```

## 4\. 데이터베이스 연동 (Cloudflare D1)

`GET /feed` 핸들러는 `sort` 쿼리 파라미터에 따라 분기 처리해야 합니다. (인증된 사용자 ID: `auth.userId`, 페이지당 항목 수: `PAGE_SIZE = 20`)

```sql
-- D1 쿼리 (Hono 바인딩 사용 예)
-- (공통 JOIN 및 WHERE 절)
-- ... FROM ProfilePhotos AS p
-- JOIN UserProfiles AS u ON p.user_id = u.user_id
-- LEFT JOIN Likes AS l ON p.id = l.photo_id AND l.user_id = ?1 (auth.userId)
-- WHERE p.verification_status = 'approved'
--   AND p.user_id != ?1 (auth.userId) -- 내 사진은 피드에 안 보이게

-- 1. [sort=latest] (기본)
SELECT
    p.id AS photo_id, p.image_url, u.user_id, u.nickname,
    p.likes_count, (l.user_id IS NOT NULL) AS i_like_this
-- ... (공통 JOIN/WHERE)
ORDER BY p.created_at DESC
LIMIT ?2 OFFSET ?3;  -- (PAGE_SIZE, (page-1) * PAGE_SIZE)

-- 2. [sort=popular]
-- ... (공통 JOIN/WHERE)
ORDER BY p.likes_count DESC, p.created_at DESC
LIMIT ?2 OFFSET ?3;

-- 3. [sort=random]
-- ... (공통 JOIN/WHERE)
ORDER BY RANDOM()
LIMIT ?2;

-- 4. [sort=distance] (D1 쿼리 + Worker 로직) [v1.1 수정]
-- Step 1: Worker가 lat/lon으로 이웃 Geohash 목록(neighborHashes)을 계산 (e.g., 9개)

-- Step 2: D1에서 Geohash로 후보군 필터링 (페이지네이션 X)
SELECT
    p.id AS photo_id, p.image_url, u.user_id, u.nickname,
    p.likes_count, (l.user_id IS NOT NULL) AS i_like_this,
    u.latitude, u.longitude -- 거리 계산을 위해 위도/경도 가져오기
FROM ProfilePhotos AS p
JOIN UserProfiles AS u ON p.user_id = u.user_id
LEFT JOIN Likes AS l ON p.id = l.photo_id AND l.user_id = ?1 (auth.userId)
WHERE p.verification_status = 'approved'
  AND p.user_id != ?1 (auth.userId)
  AND u.geohash IN (?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10); -- (neighborHashes)

-- Step 3: Cloudflare Worker (JS) 로직
// (Handler 코드 수도)
// const { lat, lon } = c.req.query(); // Type A 위치
// const neighborHashes = Geohash.neighbors(Geohash.encode(lat, lon, 6)); // + self
// 
// const results = await db.exec(Step 2 Query, [auth.userId, ...neighborHashes]);
// const calculated = results.map(row => {
//   const distance = haversine(lat, lon, row.latitude, row.longitude);
//   return { ...row, distance };
// });
// 
// calculated.sort((a, b) => a.distance - b.distance); // 거리순 정밀 정렬
// 
// const page = parseInt(c.req.query('page') || '1');
// const paginatedResults = calculated.slice((page-1) * PAGE_SIZE, page * PAGE_SIZE);
// return c.json({ feed: paginatedResults, ... });
```

## 5\. 테스트 전략

  - **단위 테스트 (Jest / Vitest)**:
      - **`haversine` 함수**: 서울-부산 간 거리 계산 MOCK 테스트.
      - **[v1.1] `Geohash` 계산**: MOCK 좌표(서울시청) 입력 시, 9개의 이웃 해시 배열을 정확히 반환하는지 검증.
      - **[v1.1] API 핸들러 로직 (sort=distance)**: MOCK DB가 9개 해시 내의 10명을 반환할 때, Worker가 JS `sort()`를 통해 올바른 순서로 정렬하는지 검증.
  - **통합 테스트 (Cloudflare `wrangler dev` + Supertest)**:
      - **선행 조건**: `UserA` (본인), `UserB` (서울 Geohash), `UserC` (부산 Geohash).
      - **TC-API-001 (latest)**: `GET /feed?sort=latest` 호출 -\> 정상 확인.
      - **TC-API-002 (popular)**: `GET /feed?sort=popular` 호출 -\> 정상 확인.
      - **[v1.1] TC-API-003 (distance)**: `GET /feed?sort=distance&lat=...&lon=...` (서울 좌표) 호출 -\> `UserB`가 `UserC`보다 상위에 노출되는지 확인.
      - **TC-API-004 (Bad Request)**: `GET /feed?sort=distance` (lat/lon 누락) 호출 -\> 400 Bad Request 응답 확인.
      - **TC-API-005 (Exclusion)**: `UserA` (본인)의 사진은 어떤 정렬에서도 피드에 노출되지 않는지 확인.

-----
