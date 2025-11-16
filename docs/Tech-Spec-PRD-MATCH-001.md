
-----

# [PRD-MATCH-001] (v1.1) 매칭 로직 및 카드 UI 기술 명세서

**문서 버전:** **1.1** (인스타 URL 응답) | **작성일:** 2025-11-16 | **작성자:** 이루리 (AI)
**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-MATCH-001 (v1.1)`에 정의된 '매칭' 관련 API의 기술적 설계를 정의합니다.
  - **핵심 기술**: Cloudflare Workers(Hono), D1(DB), D1 트랜잭션.
  - **범위 (In Scope)**:
      - `GET /api/v1/matching/deck` (매칭 덱 API)
      - `POST /api/v1/matching/action` (매치 성사 API)
      - D1 스키마 (`MatchingActions`, `Matches`)
  - **[v1.1] 핵심 수정**: `POST /action` API가 '매치' 성공 시(`is_match: true`), 프론트엔드가 인스타그램 버튼을 활성화할 수 있도록 **매치된 상대방의 `instagram_url`을 응답에 포함**해야 합니다.

## 2\. 아키텍처 디자인

### 2.1 'OK/Pass' 액션 및 매치 성사 흐름 (POST /action) [v1.1 수정]

`POST /action` API는 '상호 OK' 여부를 확인하고, 매치 성공 시 **추가 쿼리**를 통해 상대방의 인스타그램 URL을 가져와야 합니다.

```mermaid
graph TD
    A[사용자 A<br>(React App)] -- 1. 'OK' 클릭 (User B에게)<br>POST /action (target: User B) --> C[Cloudflare Worker (Hono)]
    
    subgraph C [CF Worker]
        D[Auth Middleware] -- 2. 'User A' 인증 --> E[API Route (action.ts)]
        
        E -- 3. 'User A'의 'OK' 기록 --> F[(D1 Database)]
        subgraph F
            G[INSERT INTO MatchingActions<br>(source: A, target: B, action: ok)]
        end
        
        E -- 4. "User B가 A에게 OK했는지" 확인 --> F
        subgraph F
            H[SELECT 1 FROM MatchingActions<br>WHERE source: B, target: A, action: ok]
        end
        
        E --> I{Mutual 'OK'?}
        I -- "No" --> J[응답: {is_match: false}]
        
        I -- "Yes" --> K[INSERT INTO Matches<br>(user_a, user_b)]
        
        K -- "[v1.1] 매치 성공!" --> L[추가 쿼리: User B의<br>'instagram_url' 조회]
        subgraph F
            M[SELECT instagram_url<br>FROM UserProfiles<br>WHERE user_id = B]
        end
        L --> M
        M --> N[응답: {is_match: true, ...<br>instagram_url: "..."}]
    end

    J --> A
    N --> A
```

## 3\. API 명세 (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: '이루리 소개팅 API (v1.5.1)'
  version: '1.5.1' # PRD-MATCH-001 v1.1 API 수정
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
    # --- [신규 v1.5] ---
    MatchCardItem:
      # ... (v1.0과 동일)
      type: object
          
    MatchActionBody:
      # ... (v1.0과 동일)
      type: object
      
    # [v1.1 수정] 매치 액션 응답 스키마
    MatchActionResponse:
      type: object
      properties:
        is_match:
          type: boolean
        match_id:
          type: string
          format: uuid
          nullable: true
        
        # [v1.1 추가] 매치 성공 시 상대방의 인스타 URL
        matched_user_instagram_url:
          type: string
          format: uri
          nullable: true
          description: 'is_match가 true일 때만 반환됨. 상대가 등록 안했으면 null.'
          
    Error: { type: object, properties: { error: { type: string } } }
        
# 2. 모든 API는 Google 인증을 필수로 함
security:
  - googleAuth: []

# 3. API 엔드포인트
paths:
  /matching/deck:
    get:
      summary: 매칭 카드 덱 조회
      tags: [Matching]
      # ... (v1.0과 동일 - responses 생략)

  /matching/action:
    post:
      summary: 'OK' 또는 'Pass' 액션 전송
      description: |
        PRD-MATCH-001 (v1.1): 의사표현을 전송하고, '매치' 성사 여부를 반환받습니다.
        **[v1.1] 'is_match: true'일 경우, 'matched_user_instagram_url'이 함께 반환됩니다.**
      tags:
        - Matching
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MatchActionBody'
      responses:
        '200':
          description: '액션 처리 성공. 매치 성사 여부 및 인스타 URL 반환.'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchActionResponse'
        '401': { description: '인증 실패' }
        '400': { description: '잘못된 요청' }
        '409': { description: 'Conflict (이미 처리된 액션)' }
```

## 4\. 데이터베이스 스키마 (Cloudflare D1)

(v1.0과 동일: `MatchingActions` 및 `Matches` 테이블 생성)

### 4.1 신규 테이블: `MatchingActions`

```sql
-- D1 스키마: [신규] MatchingActions
CREATE TABLE MatchingActions (
    source_user_id TEXT NOT NULL,
    target_user_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('ok', 'pass')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (source_user_id, target_user_id)
    -- ... (Foreign Keys, Indexes 생략 - v1.0과 동일)
);
```

### 4.2 신규 테이블: `Matches`

```sql
-- D1 스키마: [신규] Matches
CREATE TABLE Matches (
    id TEXT PRIMARY KEY, -- UUID
    user_a_id TEXT NOT NULL,
    user_b_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (user_a_id < user_b_id), 
    UNIQUE (user_a_id, user_b_id)
    -- ... (Foreign Keys, Indexes 생략 - v1.0과 동일)
);
```

## 5\. 핵심 알고리즘 로직 (Worker)

### 5.1 `GET /matching/deck` (추천 덱 생성)

(v1.0과 동일: P-0 필터링 -\> P-1 '좋아요' -\> P-2 'Geohash' -\> P-3 '학교' 우선순위 정렬)

### 5.2 `POST /matching/action` (매치 성사 로직) [v1.1 수정]

```javascript
// Worker (Hono) 예시 로직: functions/api/matching/action.ts
// (auth.userId, body.target_user_id, body.action)

// Step 1: 내 액션 기록 (INSERT)
await db.prepare("INSERT INTO MatchingActions (source_user_id, target_user_id, action) VALUES (?, ?, ?)")
        .bind(auth.userId, body.target_user_id, body.action)
        .run();

// Step 2: 'pass'면 즉시 종료
if (body.action === 'pass') {
  return c.json({ is_match: false, matched_user_instagram_url: null });
}

// Step 3: ('ok'일 경우) 상대방이 'ok' 했는지 확인 (Mutual Check)
const mutualOk = await db.prepare(
  "SELECT 1 FROM MatchingActions WHERE source_user_id = ?1 AND target_user_id = ?2 AND action = 'ok'"
).bind(body.target_user_id, auth.userId).first();

// Step 4: 매치가 아닐 경우 종료
if (!mutualOk) {
  return c.json({ is_match: false, matched_user_instagram_url: null });
}

// Step 5: [v1.1] 매치 성사! (트랜잭션)
const matchId = crypto.randomUUID();
// (a < b 정렬)
const [userA, userB] = [auth.userId, body.target_user_id].sort(); 

try {
  await db.batch([
    // 5a. Matches 테이블에 기록
    db.prepare("INSERT INTO Matches (id, user_a_id, user_b_id) VALUES (?, ?, ?)")
      .bind(matchId, userA, userB),
      
    // 5b. (선택적) 푸시 알림/이메일 이벤트 트리거 (Queue)
  ]);
  
  // 5c. [v1.1] 상대방 인스타그램 URL 조회 (추가 쿼리)
  const targetProfile = await db.prepare(
    "SELECT instagram_url FROM UserProfiles WHERE user_id = ?"
  ).bind(body.target_user_id).first();

  // 5d. 최종 응답 반환
  return c.json({ 
    is_match: true, 
    match_id: matchId,
    matched_user_instagram_url: targetProfile ? targetProfile.instagram_url : null
  });

} catch (e) {
  // (UNIQUE 제약조건 등 오류 시 500 반환)
  return c.json({ error: 'Match creation failed' }, 500);
}
```

## 6\. 테스트 전략

  - (v1.0과 동일: P-1 우선순위, Pass/Match 필터링 등)
  - **[v1.1 신규 테스트] TC-MATCH-005 (매치 성공 시 인스타 URL)**:
      - **선행**: `UserB`가 `instagram_url`을 "http://insta/B"로 설정.
      - **실행**: `UserA`가 `UserD`에게 'OK' (응답: `is_match: false`). `UserB`가 `UserA`에게 'OK' (응답: `is_match: true`).
      - **검증**: `POST /action`의 두 번째 응답(Match) Body에 `is_match: true`와 `matched_user_instagram_url: "http://insta/B"`가 포함되어 있는지 확인.

-----
