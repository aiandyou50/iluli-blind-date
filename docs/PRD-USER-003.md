
-----

# [PRD-USER-003] 메인 피드 브라우징

**문서 버전:** 1.0 | **작성일:** 2025-11-14 | **작성자:** 이루리 (AI)
**Epic:** `EPIC-002` (소셜 및 피드) | **스토리 포인트:** 13 | **우선순위:** **High**

## 1\. 개요

  - **User Story**: "사용자로서, '이루리'의 메인 피드에서 **다른 사용자들이 올린 '승인된' 사진들**을 탐색하고 싶다. 또한, **최신순, 좋아요순, 거리순** 등 다양한 정렬 옵션을 통해 내가 원하는 상대를 찾고 싶고, 마음에 드는 사진은 클릭해서 **확대/축소**해보고 싶다."
  - **Acceptance Criteria (Gherkin Format)**:

<!-- end list -->

```gherkin
Feature: 메인 피드 탐색 및 정렬
  시나리오: 사용자가 메인 피드를 성공적으로 로드한다.
    Given 나는 '이루리'로 로그인한 상태이며, '피드' 탭에 진입했다.
    When 페이지가 로드된다.
    Then `verification_status`가 'approved'인, **타 사용자의** 사진 게시물 목록이 표시되어야 한다.
    And 내 사진은 메인 피드에 표시되지 않아야 한다.
    And 기본 정렬 순서는 '최신순'이어야 한다.
    And 각 게시물에는 (1) 사진, (2) 닉네임, (3) 프로필 사진, (4) 좋아요 버튼이 표시되어야 한다.

  시나리오: 사용자가 '좋아요 많은 순'으로 피드를 정렬한다.
    Given '피드' 탭에 진입했다.
    When 내가 '정렬' 옵션에서 '좋아요 많은 순'을 선택한다.
    Then 피드 목록이 '좋아요'를 많이 받은 순서대로 재정렬되어야 한다.

  시나리오: 사용자가 '가까운 거리 순'으로 피드를 정렬한다.
    Given '피드' 탭에 진입했다.
    When 내가 '정렬' 옵션에서 '가까운 거리 순'을 선택한다.
    Then 브라우저가 "위치 정보(GPS)를 사용하시겠습니까?"라는 권한을 요청해야 한다.
    And 내가 '허용'을 클릭하면, 내 현재 위치를 기반으로 가까운 사용자들의 사진 순으로 재정렬된다.
    And '거절'을 클릭하면, "위치 정보가 없어 정렬할 수 없습니다."라는 메시지가 표시된다.

  시나리오: 사용자가 피드에서 타 사용자의 프로필로 이동한다. (PRD-002 연동)
    Given '피드' 탭에서 사용자 'B'의 게시물을 보고 있다.
    When 내가 사용자 'B'의 '프로필 사진' 또는 '닉네임'을 클릭한다.
    Then `PRD-USER-002`에서 정의한 사용자 'B'의 '공개 프로필 페이지'로 이동해야 한다.

  시나리오: 사용자가 피드 사진을 확대/축소한다.
    Given '피드' 탭에서 사용자 'B'의 사진을 보고 있다.
    When 내가 사진 이미지를 클릭(탭)한다.
    Then 사진이 화면 전체를 채우는 라이트박스(Lightbox) 모달로 확대되어야 한다.
    And 모바일(태블릿) 환경에서 두 손가락으로 핀치 줌(Pinch Zoom)을 하여 사진을 더 확대/축소할 수 있어야 한다.
    And 모달 바깥 영역을 클릭하거나 'X' 버튼을 누르면 모달이 닫히고 피드로 돌아간다.
```

## 2\. 사용자 흐름 (User Flow)

```mermaid
graph TD
    A[사용자 로그인] --> B[메인 피드 페이지]
    B --> C{피드 로드 (기본: 최신순)}
    C --> D[사진 그리드/리스트 뷰]

    D -- "사진 클릭" --> E[사진 확대 모달 (라이트박스)]
    E -- "핀치 줌 (모바일)" --> F[확대/축소]
    E -- "닫기" --> D
    
    D -- "프로필/닉네임 클릭" --> G[공개 프로필 (PRD-002)]
    D -- "좋아요 버튼 클릭" --> H[좋아요 로직 (PRD-004)]

    B --> I[정렬 옵션 선택]
    I -- "최신순/과거순/좋아요순" --> J[API 재호출 (정렬)] --> D
    I -- "랜덤" --> K[API 재호출 (랜덤)] --> D
    I -- "거리순" --> L{GPS 권한 요청}
    L -- "허용" --> M[API 재호출 (GPS 좌표 전송)] --> D
    L -- "거절" --> N[오류 알림] --> B
```

## 3\. 상세 기능 명세

### 3.1 UI/UX 요구사항

  - **화면 목록**:
    1.  **메인 피드 페이지 (`/feed`)**:
          - **정렬 드롭다운/버튼**: '최신순', '과거순', '좋아요순', '랜덤', '가까운 거리 순'
          - **피드 게시물 (컴포넌트)**:
              - `Header`: [프로필 사진], [닉네임] (클릭 시 `PRD-002`로 이동)
              - `Body`: [사진 이미지] (클릭 시 확대 모달)
              - `Footer`: [좋아요 버튼] (클릭 시 `PRD-004` 로직)
    2.  **사진 확대 모달 (라이트박스)**:
          - 전체 화면(Full Screen) 오버레이
          - 이미지 뷰어 (Pinch Zoom 지원 라이브러리 e.g., `photoswipe` or `react-zoom-pan-pinch`)
          - 닫기(X) 버튼
  - **인터랙션**:
      - **무한 스크롤 (Infinite Scroll)**: 사용자가 스크롤을 하단으로 내리면 다음 페이지의 사진을 로드 (페이지네이션).

### 3.2 데이터 요구사항

  - **API (신규)**: `GET /api/v1/feed`
      - **목적**: 메인 피드에 표시할 '승인된' 사진 목록을 조회.
      - **쿼리 파라미터**:
          - `?sort=latest` (기본값): `created_at` DESC
          - `?sort=oldest`: `created_at` ASC
          - `?sort=random`: DB단에서 랜덤 정렬 (e.g., `ORDER BY RANDOM()`)
          - `?sort=popular`: '좋아요' 수(`likes_count`) DESC (Tech Spec에서 `likes_count` 컬럼 필요)
          - `?sort=distance&lat=36.123&lon=127.456`: 사용자 GPS 좌표를 기반으로 거리 계산 정렬.
          - `?page=1`: 페이지네이션
      - **응답 (Success 200)**:
        ```json
        {
          "feed": [
            {
              "photo_id": "photo-uuid-1",
              "image_url": "https://r2.../img1.png",
              "user": {
                "user_id": "user-uuid-b",
                "nickname": "사용자 B",
                "profile_image_url": "https://r2.../user-b-profile.png" 
              },
              "likes_count": 15,
              "i_like_this": false // (PRD-004 연동: 내가 좋아요 눌렀는지 여부)
            }
            // ... (페이지당 20개)
          ],
          "next_page": 2
        }
        ```
  - **GPS 데이터 (신규 요구사항)**:
      - '가까운 거리 순' 정렬을 위해 **`UserProfiles` 테이블에 `latitude`, `longitude`, `location_updated_at` 컬럼이 필요**합니다. (`PRD-USER-001` Tech Spec의 추가 수정 필요)
      - 사용자가 '거리순 정렬'을 최초 시도 시, 브라우저 `navigator.geolocation` API로 좌표를 얻어 `PATCH /api/v1/profile/location` (신규 API)으로 전송하여 DB에 저장해야 합니다.

## 4\. 성능 요구사항

  - **피드 로딩**: 1.5초 이내 (95% percentile)
  - **정렬 변경**: 1초 이내 API 응답
  - **사진 확대**: 300ms 이내 모달 표시
  - **DB (중요)**: '좋아요순', '거리순' 정렬은 복잡한 쿼리입니다. `likes_count` 및 위치(PostGIS/GeoHash)에 대한 **인덱싱(Indexing)이 필수**입니다. (D1은 Geo-Spatial 쿼리를 지원하지 않으므로, Worker에서 거리 계산 후 메모리 정렬 또는 다른 DB(e.g., PostGIS) 고려 필요)

## 5\. 보안 요구사항

  - **위치 정보**: GPS 좌표는 사용자 동의 하에 수집되어야 하며, API는 `lat`, `lon` 외의 상세 주소를 반환해서는 안 됩니다.
  - **API**: 피드 API는 로그인된 사용자만 호출할 수 있어야 합니다.

## 6\. AI 에이전트 구현 가이드 (GitHub Copilot)

### Copilot 프롬프트 예시 (Cloudflare Worker + React):

```
Feature: Main Feed Browsing with Sorting
Tech Stack: Cloudflare Workers, Hono, D1, React, TypeScript
Files to Create/Modify:
- functions/api/feed/index.ts (Backend: New API Endpoint)
- functions/api/profile/location.ts (Backend: New API for GPS update)
- src/pages/Feed.tsx (Frontend: Main Feed Page)
- src/components/feed/FeedItem.tsx (Frontend: Feed Post Component)
- src/components/feed/SortDropdown.tsx (Frontend: Sort Selector)
- src/components/feed/PhotoLightbox.tsx (Frontend: Zoom Modal)
- schema.sql (D1 Schema - Add location columns to UserProfiles)

Constraints (Backend - feed/index.ts):
- Must be a GET handler, protected by Auth middleware.
- Must parse 'sort', 'page', 'lat', 'lon' query parameters.
- Must query 'ProfilePhotos' WHERE verification_status = 'approved'.
- Must NOT include photos from the authenticated user.
- Must JOIN 'UserProfiles' to get nickname/profile image.
- Must JOIN (or Subquery) 'Likes' table to get 'likes_count' (PRD-004).
- Must return data in the specified JSON format.
- **GPS Sort**: D1 does not support Geo-spatial queries. Implement Haversine formula calculation in the Worker *after* fetching candidates, or (if too many users) this logic needs re-architecture.

Constraints (Frontend - Feed.tsx):
- Must use 'react-query' or 'SWR' for fetching feed data.
- Must implement 'react-infinite-scroll-component'.
- When 'sort=distance' is selected:
  - Must call 'navigator.geolocation.getCurrentPosition'.
  - On success, call API to update location (location.ts) and then refetch feed with new lat/lon.
- Clicking a FeedItem's photo must open 'PhotoLightbox.tsx'.
```

## 7\. 의존성 및 선행 작업

  - **선행 작업 (기술)**:
      - [ ] **`PRD-USER-001` / Tech Spec (수정 필요)**: `UserProfiles` 테이블에 `latitude`, `longitude` 컬럼 추가.
      - [ ] **`PRD-USER-002` / Tech Spec (완료)**: '공개 프로필' 페이지가 존재해야 함.
      - [ ] **`PRD-USER-004` (병행/선행)**: '좋아요' 기능(`Likes` 테이블)이 정의되어야 '좋아요순' 정렬이 가능함.
  - **선행 작업 (정책)**:
      - [ ] GPS(위치 정보) 수집에 대한 개인정보 처리방침 고지.

## 8\. 성공 지표 (KPI)

  - **체류 시간**: 사용자가 '피드' 탭에서 머무는 평균 시간.
  - **정렬 기능 사용률**: '최신순' 외 다른 정렬 옵션(거리순, 좋아요순)의 클릭 비율.
  - **확대 기능 사용률**: 피드 노출 대비 '사진 확대' 클릭 비율.

-----
