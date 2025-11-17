
-----

# [PRD-USER-002] 공개 프로필 조회 기술 명세서

**리뷰어:** [Tech Lead 이름] | **승인자:** [CTO 이름] | **상태:** **Draft**

## 1\. 개요 및 동기

  - **목적**: 본 문서는 `PRD-USER-002`에 정의된 '타 사용자 공개 프로필 조회' 기능을 구현하기 위한 백엔드(Cloudflare Worker) API의 기술적 설계를 정의합니다.
  - **핵심 기술**: Cloudflare Workers(Hono 프레임워크), D1(DB), Google Auth.
  - **범위 (In Scope)**:
      - 신규 API 엔드포인트: `GET /api/v1/users/{userId}/profile`
      - D1 데이터베이스 쿼리 로직 (JOIN 및 `approved` 상태 필터링).
    <!-- end list -->
      * 민감 정보(이메일, 미승인 사진 등) 제외 로직.
  - **범위 제외 (Out of Scope)**:
      - 프론트엔드(React) 동적 라우트 페이지(`/profile/[userId]`)의 상세 UI 구현.
      - `PRD-USER-003 (피드)`에서 이 API를 호출하는 로직.

## 2\. 아키텍처 디자인

### 2.1 API 요청 및 데이터 흐름

이 아키텍처는 인증된 사용자(User A)가 `isAuth` 미들웨어를 통과하여 타 사용자(User B)의 '공개용' 정보만 조회하는 흐름을 보여줍니다.

```mermaid
graph TD
    A[사용자 A (React App)] -- 1. '/profile/user-b-id' 페이지 방문 --> B(React /profile/[userId].tsx)
    B -- 2. API 호출<br>(GET /api/v1/users/user-b-id)<br>(+ User A의 JWT) --> C[Cloudflare Worker (Hono)]
    
    subgraph C [CF Worker]
        D[Auth Middleware (isAuth)] -- 3. 'User A' 인증 (로그인 여부) --> E[API Route]
        E -- 4. "user-b-id" 파라미터 획득 --> E
        
        E -- 5. [쿼리 1] User B 프로필 조회<br>(SELECT... FROM UserProfiles) --> F[(D1 Database)]
        F -- 6. 프로필 정보 반환 --> E
        
        E -- 7. [쿼리 2] User B '승인된' 사진 조회<br>(SELECT... FROM ProfilePhotos<br>WHERE status='approved') --> F
        F -- 8. 'approved' 사진 목록 반환 --> E
        
        E -- 9. 민감 정보 필터링 및<br>JSON 응답 조합 --> G
    end
    
    G --> B
    B -- 10. 페이지 렌더링 --> A
```

> **설계 결정**:
> `PRD-USER-002`의 3.1절 UI 요구사항(프로필 정보, 사진 그리드)을 충족하기 위해, DB 쿼리를 JOIN으로 한 번에 처리하는 것보다 **두 개의 분리된 쿼리**로 처리하는 것이 더 명확하고 효율적입니다. (프로필 정보 1회 + 사진 N개)

## 3\. API 명세 (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: '이루리 소개팅 API (v1.2)'
  version: '1.2.0' # PRD-USER-002 API 추가
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
      description: 'Google OIDC ID Token'
  schemas:
    # --- [신규 v1.2] ---
    # 공개 프로필 응답 (Photos 리스트 포함)
    PublicProfileResponse:
      type: object
      properties:
        profile:
          $ref: '#/components/schemas/PublicProfileInfo'
        photos:
          type: array
          items:
            $ref: '#/components/schemas/PublicPhoto'

    # 공개 프로필 정보 (민감 정보 제외)
    PublicProfileInfo:
      type: object
      properties:
        user_id: { type: string, format: uuid }
        nickname: { type: string }
        school: { type: string }
        mbti: { type: string }
        bio: { type: string }
        instagram_url: { type: string, nullable: true, format: uri }

    # 공개 사진 정보 (최소 정보)
    PublicPhoto:
      type: object
      properties:
        id: { type: string, format: uuid }
        image_url: { type: string, format: uri }

    Error:
      type: object
      properties:
        error: { type: string }
        
# 2. 모든 API는 Google 인증을 필수로 함
security:
  - googleAuth: []

# 3. API 엔드포인트
paths:
  # --- [신규 v1.2] ---
  /users/{userId}/profile:
    get:
      summary: 타 사용자 공개 프로필 조회
      description: 'PRD-USER-002: 특정 사용자의 공개 프로필 정보와 ''승인된'' 사진 목록을 조회합니다.'
      tags:
        - Users (Public)
      parameters:
        - in: path
          name: userId
          required: true
          schema:
            type: string
            format: uuid
          description: '조회할 사용자의 ID'
      responses:
        '200':
          description: '사용자 프로필 및 사진 목록 반환 성공.'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PublicProfileResponse'
        '401':
          description: '인증 실패 (로그인하지 않은 사용자)'
        '404':
          description: '사용자(userId)를 찾을 수 없음'
        '500':
          description: '서버 내부 오류'

  # --- [기존 v1.1] /profile (내 프로필) ---
  # ... (GET /profile, PATCH /profile 등) ...
  # ... (POST /profile/photos/upload 등) ...
```

## 4\. 데이터베이스 연동 (Cloudflare D1)

`PRD-USER-002` API 핸들러(`functions/api/users/[userId]/profile.ts`)는 다음 두 개의 D1 쿼리를 순차적으로 실행하고 결과를 조합해야 합니다. (바인딩: `env.DB`)

```sql
-- D1 쿼리 (Hono 바인딩 사용 예)

-- [쿼리 1] 프로필 정보 조회
-- (PRD-USER-002 보안 요구사항: 민감 정보(email 등)는 SELECT 하지 않음)
SELECT 
    user_id, 
    nickname, 
    school, 
    mbti, 
    bio, 
    instagram_url 
FROM UserProfiles 
WHERE user_id = ?; -- {userId}

-- [쿼리 2] '승인된' 사진 목록 조회
-- (PRD-USER-002 보안 요구사항: verification_status = 'approved' 조건 필수)
SELECT 
    id, 
    image_url 
FROM ProfilePhotos 
WHERE user_id = ?    -- {userId}
  AND verification_status = 'approved'
ORDER BY created_at DESC; -- (최신 사진 순으로 정렬)
```

## 5\. 테스트 전략

  - **단위 테스트 (Jest / Vitest)**:
      - **`isAuth` 미들웨어**: 유효한/만료된/없는 토큰 케이스 테스트.
      - **API 핸들러 로직**:
          - D1 DB 모킹(mocking).
          - '승인된' 사진 2개, '대기중' 사진 1개를 반환하는 DB 모의 응답을 설정.
          - API 핸들러가 최종적으로 '승인된' 사진 2개만 반환하고, '대기중' 사진은 필터링하는지 검증.
          - `UserProfiles`의 `email` 정보(가상)가 최종 응답 JSON에 포함되지 않았는지 검증.
  - **통합 테스트 (Cloudflare `wrangler dev` + Supertest)**:
      - **선행 조건**:
          - `UserA` (테스터) JWT 준비.
          - `UserB` 생성: `instagram_url` 있음, '승인된' 사진 2개, '대기중' 사진 1개.
          - `UserC` 생성: `instagram_url` 없음, '승인된' 사진 0개.
      - **TC-API-001 (정상)**: `UserA`가 `UserB`의 프로필(`GET /users/user-b-id/profile`) 호출 -\> 200 OK.
          - **검증**: 응답 body의 `profile.instagram_url`이 null이 아니고, `photos` 배열의 길이가 **2**인지 확인.
      - **TC-API-002 (사진 없음)**: `UserA`가 `UserC`의 프로필 호출 -\> 200 OK.
          - **검증**: 응답 body의 `profile.instagram_url`이 null이고, `photos` 배열의 길이가 **0**인지 확인.
      - **TC-API-003 (인증 실패)**: JWT 없이 `UserB` 프로필 호출 -\> 401 Unauthorized.
      - **TC-API-004 (경로 없음)**: `UserA`가 존재하지 않는 UUID로 프로필 호출 -\> 404 Not Found.

-----
