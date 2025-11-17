
-----

# [PRD-USER-004] 좋아요 및 인터랙션

**문서 버전:** 1.0 | **작성일:** 2025-11-14 | **작성자:** 이루리 (AI)
**Epic:** `EPIC-002` (소셜 및 피드) | **스토리 포인트:** 8 | **우선순위:** **High**

## 1\. 개요

  - **User Story**:

    1.  (좋아요 누르기) "사용자로서, 피드(`PRD-USER-003`)에서 마음에 드는 사진에 **'좋아요'** 를 눌러 호감을 표시하고 싶다. 또한, '좋아요'를 **취소**할 수도 있고 싶다."
    2.  (좋아요 목록 조회) "사진을 게시한 사용자로서, 내 사진에 **'좋아요'를 누른 사람들의 목록**을 확인하고 싶다. 그리고 목록에서 그들의 **프로필을 클릭**하여 어떤 사람인지 확인하고 싶다."

  - **Acceptance Criteria (Gherkin Format)**:

<!-- end list -->

```gherkin
Feature: 좋아요 누르기 및 취소
  시나리오: 사용자가 피드에서 사진에 '좋아요'를 누른다.
    Given 나는 '이루리'로 로그인한 상태이며, 메인 피드를 보고 있다.
    And 사용자 'B'의 사진에 '좋아요' 버튼(e.g., 빈 하트)이 보인다.
    And 나는 이 사진에 아직 '좋아요'를 누르지 않았다.
    When 내가 '좋아요' 버튼을 클릭한다.
    Then '좋아요' 버튼이 '채워진 하트' 아이콘으로 즉시 변경되어야 한다 (Optimistic UI).
    And 서버의 `Likes` 테이블에 (내 user_id, 사진 photo_id) 레코드가 1건 생성되어야 한다.
    And `ProfilePhotos` 테이블의 해당 `photo_id`의 `likes_count`가 1 증가해야 한다.

  시나리오: 사용자가 '좋아요'를 취소한다.
    Given 나는 사용자 'B'의 사진에 이미 '좋아요'를 누른 상태다 (채워진 하트).
    When 내가 '좋아요' 버튼을 다시 클릭한다.
    Then '좋아요' 버튼이 '빈 하트' 아이콘으로 즉시 변경되어야 한다.
    And 서버의 `Likes` 테이블에서 (내 user_id, 사진 photo_id) 레코드가 삭제되어야 한다.
    And `ProfilePhotos` 테이블의 해당 `photo_id`의 `likes_count`가 1 감소해야 한다.

Feature: '좋아요' 누른 사람 목록 조회 (게시물 주인)
  시나리오: 게시물 주인이 '좋아요' 목록을 확인한다.
    Given 나는 내 프로필 수정 페이지(`PRD-USER-001`)에서 내가 올린 사진 목록을 보고 있다.
    And 내 사진 중 하나가 '좋아요'를 5개 받았다 ("5 LIKES").
    When 내가 "5 LIKES" 텍스트(또는 아이콘)를 클릭한다.
    Then '좋아요 누른 사람 목록' 모달(Modal)이 열려야 한다.
    And 목록에는 나에게 '좋아요'를 누른 5명의 [프로필 사진]과 [닉네임]이 표시되어야 한다.

  시나리오: '좋아요' 목록에서 타인의 프로필로 이동한다. (PRD-002 연동)
    Given 나는 '좋아요 누른 사람 목록' 모달을 보고 있다.
    When 목록에서 사용자 'C'의 닉네임 또는 프로필 사진을 클릭한다.
    Then `PRD-USER-002`에서 정의한 사용자 'C'의 '공개 프로필 페이지'로 이동해야 한다.
```

## 2\. 사용자 흐름 (User Flow)

```mermaid
graph TD
    subgraph Flow 1: Liking (User A)
        A[피드 (PRD-003)] --> B(User B의 사진)
        B --> C{좋아요 버튼 클릭}
        C -- "좋아요" --> D[POST /api/v1/photos/{id}/like]
        D --> E[UI: 하트 채워짐<br>DB: Likes (INSERT)<br>DB: ProfilePhotos (Count +1)]
        C -- "좋아요 취소" --> F[POST /api/v1/photos/{id}/unlike]
        F --> G[UI: 하트 비워짐<br>DB: Likes (DELETE)<br>DB: ProfilePhotos (Count -1)]
    end
    
    subgraph Flow 2: Viewing Likes (User B, Owner)
        H[내 프로필 (PRD-001)] --> I(내가 올린 사진)
        I --> J['좋아요 N개' 클릭]
        J --> K[GET /api/v1/photos/{id}/likers]
        K --> L[좋아요 누른 사람 목록 (모달)]
        L -- "User C 클릭" --> M[User C 공개 프로필 (PRD-002)]
    end
```

## 3\. 상세 기능 명세

### 3.1 UI/UX 요구사항

  - **화면 목록**:
    1.  **피드 게시물 (`PRD-USER-003` 연동)**:
          - `Button` (좋아요): 클릭 시 즉각적인 UI 상태 변경(Optimistic Update) 및 API 호출.
    2.  **내 프로필 사진 그리드 (`PRD-USER-001` 수정 필요)**:
          - 내가 올린 각 사진 썸네일 위에 `좋아요 카운트` (e.g., "❤️ 15") 표시.
          - `좋아요 카운트` 클릭 시 '좋아요 누른 사람 목록' 모달 호출.
    3.  **'좋아요 누른 사람 목록' 모달**:
          - `Title`: "좋아요"
          - `List`: (스크롤 가능)
              - 각 항목: [프로필 사진], [닉네임]
              - 각 항목 클릭 시 `PRD-USER-002`의 공개 프로필 페이지로 이동.

### 3.2 데이터 요구사항

  - **API (신규)**:
    1.  **`POST /api/v1/photos/{photoId}/like`**:
          - **목적**: 특정 사진에 '좋아요'를 추가.
          - **로직**: `Likes` 테이블에 `(auth.userId, photoId)` 삽입. `ProfilePhotos`의 `likes_count` +1. (트랜잭션 필요)
    2.  **`POST /api/v1/photos/{photoId}/unlike`**:
          - **목적**: '좋아요'를 취소.
          - **로직**: `Likes` 테이블에서 `(auth.userId, photoId)` 삭제. `ProfilePhotos`의 `likes_count` -1. (트랜잭션 필요)
    3.  **`GET /api/v1/photos/{photoId}/likers`**:
          - **목적**: 특정 사진에 '좋아요'를 누른 사용자 목록 조회. (게시물 주인만 호출 가능하도록 권한 검사 필요)
          - **응답 (Success 200)**:
            ```json
            {
              "likers": [
                { "user_id": "user-uuid-c", "nickname": "사용자 C", "profile_image_url": "..." },
                { "user_id": "user-uuid-d", "nickname": "사용자 D", "profile_image_url": "..." }
              ],
              "total_count": 2
            }
            ```
  - **데이터 모델 (D1 스키마)**:
    1.  **`Likes` (신규 테이블)**:
        ```sql
        -- '좋아요' 관계 테이블
        CREATE TABLE Likes (
            user_id TEXT NOT NULL,
            photo_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (photo_id) REFERENCES ProfilePhotos(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, photo_id) -- 한 사람이 사진 하나에 좋아요 1번만
        );
        ```
    2.  **`ProfilePhotos` (컬럼 추가)**: (`PRD-USER-001` Tech Spec에 이 수정사항 반영 필요)
        ```sql
        -- ProfilePhotos 테이블에 '좋아요' 카운트 컬럼 추가
        ALTER TABLE ProfilePhotos ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;

        -- '좋아요순' 정렬 성능을 위한 인덱스
        CREATE INDEX idx_profilephotos_likes_count ON ProfilePhotos(likes_count);
        ```

## 4\. 성능 요구사항

  - **좋아요 클릭**: 300ms 이내 UI 응답 (Optimistic Update), 1초 이내 API 응답.
  - **`likes_count` 정확성**: `Likes` 테이블과 `likes_count` 컬럼의 데이터 정합성이 100% 보장되어야 함 (D1 트랜잭션 사용).
  - **'좋아요' 목록 로딩**: 1초 이내.

## 5\. 보안 요구사항

  - **권한 검증**: `GET /api/v1/photos/{photoId}/likers` API는 **사진의 주인(`ProfilePhotos.user_id`)** 과 인증된 사용자(`auth.userId`)가 동일할 때만 호출을 허용해야 함.
  - **Optimistic UI 롤백**: '좋아요' API 호출이 실패(네트워크 오류, 서버 에러)할 경우, 즉각 변경했던 UI(채워진 하트)를 원래대로(빈 하트) 되돌리고 사용자에게 오류 알림을 줘야 함.

## 6\. AI 에이전트 구현 가이드 (GitHub Copilot)

### Copilot 프롬프트 예시 (Cloudflare Worker + React):

```
Feature: Photo Like/Unlike and Likers List
Tech Stack: Cloudflare Workers, Hono (TS framework), D1, React, TypeScript, SWR (for optimistic UI)
Files to Create/Modify:
- functions/api/photos/[id]/like.ts (Backend: POST like)
- functions/api/photos/[id]/unlike.ts (Backend: POST unlike)
- functions/api/photos/[id]/likers.ts (Backend: GET likers)
- src/components/feed/LikeButton.tsx (Frontend: Optimistic UI Button)
- src/components/profile/LikersModal.tsx (Frontend: Modal for likers list)
- schema.sql (D1: Add 'Likes' table, add 'likes_count' to 'ProfilePhotos')

Constraints (Backend):
- 'like.ts' and 'unlike.ts' MUST use D1 transactions (db.batch) to update BOTH 'Likes' and 'ProfilePhotos(likes_count)' tables atomically.
- 'likers.ts':
  - Must be a GET handler.
  - Must verify that the authenticated user is the owner of the photoId.
  - Must JOIN 'UserProfiles' to get the nickname and profile_image_url of the likers.
- 'schema.sql':
  - Create 'Likes' table with (user_id, photo_id) PRIMARY KEY.
  - ALTER 'ProfilePhotos' to add 'likes_count INTEGER DEFAULT 0 NOT NULL' and an INDEX.

Constraints (Frontend):
- 'LikeButton.tsx':
  - Must use 'useSWR' or 'react-query' for mutation.
  - Must implement Optimistic Update for the like state.
  - Must implement 'onError' callback to rollback the UI state if the API fails.
- 'LikersModal.tsx':
  - Must fetch data from '/api/photos/[id]/likers'.
  - Each item in the list must be a <Link> component routing to '/profile/[userId]' (PRD-002).
```

## 7\. 의존성 및 선행 작업

  - **선행 작업 (기술)**:
      - [ ] **`PRD-USER-001` / Tech Spec (수정 필요)**: `ProfilePhotos` 테이블에 `likes_count` 컬럼 및 인덱스 추가. '내 프로필' UI에 좋아요 수 표시 및 모달 트리거 UI 추가.
      - [ ] **D1 스키마**: `Likes` 테이블 신규 생성.
  - **의존성 (연계)**:
      - **`PRD-USER-003 (피드)`**: 이 문서에서 정의한 `likes_count`를 `sort=popular`에 사용함.
      - **`PRD-USER-002 (프로필 조회)`**: '좋아요 목록'에서 이 페이지로 링크됨.

## 8\. 성공 지표 (KPI)

  - **참여율 (Engagement Rate)**: (총 좋아요 수) / (총 피드 노출 수)
  - **'좋아요 목록' 조회율**: (좋아요 목록 조회 클릭 수) / (내 사진이 받은 총 좋아요 수)

-----
