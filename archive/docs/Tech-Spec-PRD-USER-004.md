
-----

# [PRD-USER-004] (v1.1) 좋아요 및 인터랙션 기술 명세서

**문서 버전:** **1.1** (CASCADE DELETE 반영) | **작성일:** 2025-11-16 | **작성자:** 이루리 (AI)
**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-USER-004`에 정의된 '좋아요' 관련 기능의 기술적 설계를 정의합니다.
  - **핵심 기술**: Cloudflare Workers(Hono), D1(DB), D1 트랜잭션 (`db.batch`).
  - **범위 (In Scope)**:
      - `Likes` 테이블 신규 스키마.
      - `ProfilePhotos` 테이블 `likes_count` 컬럼 추가.
      - '좋아요' / '좋아요 취소' / '좋아요 목록' API 3종.
  - **[v1.1] 핵심 의존성 (Dependencies)**:
      - **`PRD-USER-001 (v2.5)`**: 이 문서에서 정의하는 `Likes` 테이블은 `ProfilePhotos`의 삭제(`DELETE`)에 **종속**됩니다. (`ON DELETE CASCADE`)

## 2\. 아키텍처 디자인

### 2.1 '좋아요' 트랜잭션 흐름

(v1.0과 동일: `db.batch()`를 사용한 `Likes`와 `likes_count`의 원자적 업데이트)

```mermaid
graph TD
    A[사용자 (React App)] -- 1. 좋아요 클릭 --> B[POST /api/v1/photos/{id}/like<br>(+ JWT)]
    
    subgraph C [Cloudflare Worker (Hono)]
        D[Auth Middleware] -- 2. 인증 --> E[API Route (like.ts)]
        
        E -- 3. D1 Transaction (db.batch) 시작 --> F[(D1 Database)]
        
        subgraph F
            G[1. INSERT INTO Likes]
            H[2. UPDATE ProfilePhotos... likes_count + 1]
        end
        
        G --> H
        
        H -- 4. 트랜잭션 성공 --> E
        E -- 5. 200 OK 응답 --> A
    end
```

## 3\. API 명세 (OpenAPI 3.0)

(v1.0과 동일: `POST /like`, `POST /unlike`, `GET /likers` 3개 API)

```yaml
openapi: 3.0.0
info:
  title: '이루리 소개팅 API (v1.4)'
  version: '1.4.0' # PRD-USER-004 API
# ... (components, security 생략 - v1.0과 동일) ...
paths:
  /photos/{photoId}/like:
    post:
      summary: 사진 '좋아요' 누르기
      description: 'PRD-USER-004: 사진에 좋아요를 추가합니다. (트랜잭션)'
      tags: [Likes]
      # ... (parameters, responses 생략 - v1.0과 동일) ...
  /photos/{photoId}/unlike:
    post:
      summary: 사진 '좋아요' 취소
      description: 'PRD-USER-004: 사진에 누른 좋아요를 취소합니다. (트랜잭션)'
      tags: [Likes]
      # ... (parameters, responses 생략 - v1.0과 동일) ...
  /photos/{photoId}/likers:
    get:
      summary: '좋아요' 누른 사람 목록 조회
      description: |
        PRD-USER-004: 특정 사진에 좋아요를 누른 사용자 목록을 조회합니다.
        [보안] 이 API는 반드시 사진의 주인(Owner)만 호출할 수 있어야 합니다.
      tags: [Likes]
      # ... (parameters, responses 생략 - v1.0과 동일) ...
```

## 4\. 데이터베이스 스키마 (Cloudflare D1)

### 4.1 신규 테이블: `Likes` [v1.1 수정]

`PRD-USER-004`의 핵심 테이블입니다. `photo_id` 외래 키에 `ON DELETE CASCADE`가 추가되었습니다.

```sql
-- D1 스키마: [신규] Likes
CREATE TABLE Likes (
    user_id TEXT NOT NULL,  -- 좋아요를 누른 사용자 ID
    photo_id TEXT NOT NULL, -- 좋아요를 받은 사진 ID
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- [v1.1 수정] ProfilePhotos 레코드가 삭제되면,
    -- 이 테이블의 관련 '좋아요' 레코드도 자동으로 삭제됩니다.
    FOREIGN KEY (photo_id) REFERENCES ProfilePhotos(id) ON DELETE CASCADE,
    
    -- 한 사용자가 한 사진에 좋아요 1번만 (PK 중복 방지)
    PRIMARY KEY (user_id, photo_id) 
);

-- '좋아요 목록' 조회를 위한 인덱스
CREATE INDEX idx_likes_photo_id ON Likes(photo_id, created_at);
```

### 4.2 수정 대상: `ProfilePhotos` (`PRD-USER-001` Tech Spec 수정 필요)

'좋아요순' 정렬(`PRD-USER-003`) 및 성능 최적화를 위해 **`PRD-USER-001` Tech Spec**의 `ProfilePhotos` 테이블 정의에 다음을 추가해야 합니다. (이 부분은 v1.0과 동일)

```sql
-- D1 스키마: [수정] ProfilePhotos
ALTER TABLE ProfilePhotos 
ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX idx_profilephotos_likes_count ON ProfilePhotos(likes_count);
```

### 4.3 D1 트랜잭션 쿼리 (Hono)

(v1.0과 동일: `db.batch()`를 사용하여 `Likes`와 `ProfilePhotos` 동시 업데이트)

```javascript
// Worker (Hono) 예시 코드
// [POST /photos/{id}/like]
// ------------------------------
// (v1.0과 동일: INSERT Likes + UPDATE ProfilePhotos SET likes_count + 1)

// [POST /photos/{id}/unlike]
// ------------------------------
// (v1.0과 동일: DELETE Likes + UPDATE ProfilePhotos SET likes_count - 1)
```

## 5\. 테스트 전략

  - **단위 테스트 (Jest / Vitest)**:
      - (v1.0과 동일: `like`/`unlike` 핸들러가 `db.batch()`를 올바른 SQL로 호출하는지 검증)
  - **통합 테스트 (Cloudflare `wrangler dev` + Supertest)**:
      - (v1.0과 동일: `POST /like` -\> `POST /unlike` -\> `GET /likers` 권한 테스트)
      - **[v1.1 신규 테스트] TC-CASCADE-001 (삭제 연동 테스트)**:
          - **선행**: `UserA`가 `PhotoB`에 `POST /like`. (`Likes` 테이블에 레코드 1개, `likes_count = 1`)
          - **실행**: `UserB`(사진 주인)가 `DELETE /profile/photos/{photoId}` (`PRD-USER-001`의 API) 호출.
          - **검증**: `ProfilePhotos` 테이블에서 `PhotoB`가 삭제됨과 **동시에**, `Likes` 테이블에서 `(UserA, PhotoB)` 레코드가 **자동으로 삭제**되었는지 D1 쿼리로 확인.

-----
