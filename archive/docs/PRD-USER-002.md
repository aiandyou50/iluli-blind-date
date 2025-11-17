
-----

# [PRD-USER-002] 공개 프로필 조회

**문서 버전:** 1.0 | **작성일:** 2025-11-14 | **작성자:** 이루리 (AI)
**Epic:** `EPIC-002` (소셜 및 피드) | **스토리 포인트:** 8 | **우선순위:** **High**

## 1\. 개요

  - **User Story**: "사용자로서, 피드(`PRD-USER-003`)에서 흥미로운 상대를 발견했을 때, 그 사람의 프로필을 클릭하여 상세 정보를 보고 싶다. 그래서 그 사람이 **'승인'받은 모든 사진**과 닉네임, 자기소개, **인스타그램 링크**를 확인하고 그 사람에 대해 더 알아가고 싶다."
  - **Acceptance Criteria (Gherkin Format)**:

<!-- end list -->

```gherkin
Feature: 타 사용자 공개 프로필 조회
  시나리오: 사용자가 피드에서 타 사용자의 프로필로 성공적으로 이동한다.
    Given 나는 '이루리'로 로그인한 상태이며, 메인 피드를 보고 있다.
    And 피드에 사용자 'B'의 게시물이 보인다.
    When 내가 사용자 'B'의 프로필 사진 또는 닉네임을 클릭한다.
    Then 나는 사용자 'B'의 '공개 프로필 페이지' (`/profile/user_B_id`)로 이동해야 한다.
    And 나는 사용자 'B'의 '닉네임', '학교', 'MBTI', '자기소개'를 볼 수 있어야 한다.
    And 나는 사용자 'B'의 사진 중 **`verification_status`가 'approved' (승인됨)인 모든 사진**들의 그리드(Grid)를 볼 수 있어야 한다.
    And 'pending', 'rejected', 'not_applied' 상태의 사진은 **절대 보이지 않아야 한다.**

  시나리오: 인스타그램 링크가 있는 사용자의 프로필을 조회한다.
    Given 사용자 'B'는 `instagram_url`을 등록했다.
    When 내가 사용자 'B'의 '공개 프로필 페이지'를 본다.
    Then '인스타그램' 버튼이 표시되어야 한다.
    And 내가 이 '인스타그램' 버튼을 클릭하면, 새 탭으로 사용자 'B'의 인스타그램 URL이 열려야 한다.

  시나리오: 인스타그램 링크가 없는 사용자의 프로필을 조회한다.
    Given 사용자 'C'는 `instagram_url`을 등록하지 않았다 (NULL이다).
    When 내가 사용자 'C'의 '공개 프로필 페이지'를 본다.
    Then '인스타그램' 버튼이 **표시되지 않아야 한다.**
```

## 2\. 사용자 흐름 (User Flow)

```mermaid
graph TD
    A[메인 피드 (PRD-003)] --> B{타 사용자 게시물 클릭}
    B -- 프로필 사진/닉네임 클릭 --> C[공개 프로필 페이지 (PRD-002)]
    
    subgraph C [공개 프로필 페이지]
        D[1. 프로필 정보 조회<br>(닉네임, Bio, MBTI 등)]
        E[2. '승인된' 사진 목록 조회<br>(Grid 뷰)]
        F[3. 인스타그램 버튼<br>(조건부 렌더링)]
    end
    
    F -- 클릭 --> G[새 탭: Instagram.com]
    E -- 사진 클릭 --> H[사진 확대 보기 (PRD-003)]
```

## 3\. 상세 기능 명세

### 3.1 UI/UX 요구사항

  - **화면 목록**:
    1.  **공개 프로필 페이지 (`/profile/[userId]`)**:
          - **프로필 정보 섹션**:
              - `Nickname` (크게)
              - `MBTI`, `School` (뱃지 또는 태그 형태)
              - `Bio` (자기소개)
          - **액션 버튼 섹션**:
              - **[인스타그램] 버튼**: `UserProfiles.instagram_url`이 `NULL`이 아닐 경우에만 표시(Conditionally Rendered).
          - **콘텐츠 섹션 (사진 그리드)**:
              - `ProfilePhotos` 테이블에서 해당 `userId`의 `verification_status = 'approved'`인 사진만 썸네일 그리드로 표시.

### 3.2 데이터 요구사항

  - **API (신규)**: `GET /api/v1/users/[userId]/profile`
      - **목적**: 특정 사용자(`[userId]`)의 공개 프로필 정보를 조회.
      - **요청**: `GET /api/v1/users/uuid-of-user-b` (인증된 사용자만 호출 가능)
      - **응답 (Success 200)**:
        ```json
        {
          "profile": {
            "nickname": "사용자 B",
            "school": "이루리대학교",
            "mbti": "ENFP",
            "bio": "안녕하세요!",
            "instagram_url": "https://www.instagram.com/user_b_id" 
          },
          "photos": [
            { "id": "photo-uuid-1", "image_url": "https://r2.../img1.png" },
            { "id": "photo-uuid-3", "image_url": "https://r2.../img3.png" }
            // 'approved' 상태인 사진만 포함
          ]
        }
        ```
  - **데이터 프라이버시 (필수)**:
      - 위 API는 **절대** `email`, `google_subject_id`, `verification_status` (approved 외), `rejection_reason` 등 민감 정보를 반환해서는 안 됨.

## 4\. 성능 요구사항

  - **프로필 로딩 시간**: 1초 이내 (95% percentile)
  - **'승인된' 사진 썸네일 로딩**: 2초 이내

## 5\. 보안 요구사항

  - **데이터 노출 방지 (백엔드)**:
      - API(`GET /api/v1/users/[userId]/profile`)는 D1 쿼리 시 `WHERE verification_status = 'approved'` 조건을 **필수**로 포함해야 함.
      - 민감 정보(이메일 등)는 응답 객체에서 반드시 제외(omit)해야 함.
  - **Tabnabbing 방지 (프론트엔드)**:
      - 인스타그램 링크(외부 링크)는 `target="_blank"`와 `rel="noopener noreferrer"` 속성을 **필수**로 포함하여 새 탭으로 열어야 함.

## 6\. AI 에이전트 구현 가이드 (GitHub Copilot)

### Copilot 프롬프트 예시 (Cloudflare Worker + React):

```
Feature: Public Profile View
Tech Stack: Cloudflare Workers, Hono (TS framework), D1, React (Next.js or Remix for dynamic routing), TypeScript
Files to Create/Modify:
- functions/api/users/[userId]/profile.ts (Backend: New API Endpoint)
- src/pages/profile/[userId].tsx (Frontend: New Dynamic Route Page)
- src/api/userApi.ts (Frontend: New API client function 'getUserProfile(userId)')

Constraints (Backend - profile.ts):
- Must be a GET handler.
- Must be protected by Google Auth middleware (only logged-in users can view others).
- Must extract 'userId' from the path.
- Must query D1 'UserProfiles' table for the 'userId'.
- Must query D1 'ProfilePhotos' table for 'userId' AND 'verification_status = 'approved''.
- **CRITICAL**: Response must NOT contain sensitive data (email, google_subject_id, non-approved photos).
- Must return data in the specified JSON format (profile object, photos array).

Constraints (Frontend - [userId].tsx):
- Must be a dynamic route that extracts 'userId' from the URL.
- Must call 'getUserProfile(userId)' to fetch data.
- Must display profile info (nickname, bio, etc.).
- Must render the Instagram button ONLY if 'profile.instagram_url' is present.
- The Instagram link MUST use 'target="_blank"' and 'rel="noopener noreferrer"'.
- Must render a grid of photos from the 'photos' array.
```

## 7\. 의존성 및 선행 작업

  - **선행 작업 (기술)**:
      - [ ] **`PRD-USER-001 (v2.3)`**: `UserProfiles.instagram_url` 컬럼이 D1 스키마에 추가되어 있어야 함.
      - [ ] **`PRD-ADMIN-001`**: 관리자 승인 기능이 동작하여 `approved` 상태의 사진이 1개 이상 존재해야 테스트 가능함.
  - **의존성 (연계)**:
      - **`PRD-USER-003 (피드)`**: 이 '공개 프로필 페이지'로 진입하는 주요 경로가 될 문서 (향후 작성).

## 8\. 성공 지표 (KPI)

  - **프로필 조회 전환율 (CVR)**: (피드에서 프로필 클릭 수) / (피드 노출 수)
  - **인스타그램 유도율 (CTR)**: (인스타그램 버튼 클릭 수) / (프로필 조회 수)
  - **프로필 페이지 이탈률 (Bounce Rate)**: 프로필 조회 후 즉시 앱을 이탈하는 사용자 비율.

-----
