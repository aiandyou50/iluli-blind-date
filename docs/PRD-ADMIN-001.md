
-----

# [PRD-ADMIN-001] 관리자 사진 승인 대시보드

**문서 버전:** 1.0 | **작성일:** 2025-11-14 | **작성자:** 이루리 (AI)
**Epic:** `EPIC-ADMIN-001` (내부 운영 툴) | **우선순위:** **High** (PRD-USER-001의 핵심 의존성)

## 1\. 개요

  - **User Story**: "관리자(운영자)로서, 사용자가 '인증 신청'한 사진들을 목록으로 확인하고 싶다. 그리고 사진을 클릭하여 '포토부스 프레임' 유무를 명확히 확인한 뒤, '승인' 또는 '거절' 처리를 하고 싶다. 그래서 서비스의 신뢰도(인증된 사용자 비율)를 관리하고 싶다."
  - **Acceptance Criteria (Gherkin Format)**:

<!-- end list -->

```gherkin
Feature: 관리자 사진 승인/거절 처리
  시나리오: 관리자가 '승인 대기' 중인 사진을 승인한다.
    Given 관리자가 관리자 페이지에 로그인했다.
    And '승인 대기' (pending) 상태의 사진이 1건 이상 존재한다.
    When 관리자가 '승인 대기 목록'에서 특정 사진을 클릭한다.
    And 사진 상세 보기 모달(Modal)에서 '승인(Approve)' 버튼을 클릭한다.
    Then 해당 사진의 `verification_status`가 'approved'로 변경된다.
    And 해당 사진은 '승인 대기 목록'에서 사라진다.
    And 사용자('USER-001')의 프로필에는 '인증 배지'가 표시된다.

  시나리오: 관리자가 '승인 대기' 중인 사진을 거절한다.
    Given 관리자가 '승인 대기' 상태의 사진을 클릭했다.
    When 관리자가 '거절(Reject)' 버튼을 클릭한다.
    And '거절 사유' 입력란에 "포토부스 프레임이 확인되지 않습니다."라고 입력한다.
    And '최종 거절' 버튼을 클릭한다.
    Then 해당 사진의 `verification_status`가 'rejected'로 변경된다.
    And `rejection_reason` 필드에 해당 사유가 저장된다.
    And 해당 사진은 '승인 대기 목록'에서 사라진다.
    And 사용자('USER-001')는 거절 알림과 사유를 확인할 수 있다.

  시나리오: 거절 사유 없이 거절을 시도한다.
    Given 관리자가 '거절(Reject)' 버튼을 클릭했다.
    When '거절 사유' 입력란을 비워둔 채 '최종 거절' 버튼을 클릭한다.
    Then "거절 사유는 필수입니다."라는 오류 메시지가 표시된다.
    And '거절' 처리는 완료되지 않는다.
```

## 2\. 관리자 흐름 (Admin Flow)

```mermaid
graph TD
    A[관리자 로그인] --> B[관리자 대시보드]
    B --> C[사진 승인 관리 메뉴]
    C --> D[승인 대기 목록 (Queue)]
    D -- "목록: 0건" --> E[대기 중인 사진 없음 (Idle)]
    D -- "목록: N건" --> F(사진 썸네일 리스트<br>신청일시, 사용자 닉네임)
    F -- "사진 클릭" --> G[사진 상세 보기 (모달)]
    G --> H[사진 원본 크기 뷰]
    H --> I[승인 (Approve) 버튼]
    H --> J[거절 (Reject) 버튼]
    
    I -- "클릭" --> K[API: 'approved'로 변경]
    K --> D
    
    J -- "클릭" --> L[거절 사유 입력 팝업]
    L -- "사유 입력 + 확인" --> M[API: 'rejected'로 변경<br>+ 사유(Reason) 전송]
    M --> D
```

## 3\. 상세 기능 명세

### 3.1 UI/UX 요구사항

  - **화면 목록**:
    1.  **관리자 로그인 페이지**: (가정: Google Workspace 계정 연동 또는 ID/PW)
    2.  **대시보드 메인**: (좌측 GNB: '사진 승인 관리')
    3.  **사진 승인 관리 페이지 (`/admin/photos/pending`)**:
          - **필터/검색**: 상태별(pending, approved, rejected), 사용자 닉네임/이메일 검색
          - **목록 (Table View)**:
              - `사진 ID (UUID)`
              - `사용자 닉네임 (UserID)`
              - `사진 (썸네일)`
              - `신청 일시 (created_at)`
              - `상태 (verification_status)`
          - **정렬**: '신청 일시' 오름차순(오래된 순) 기본 정렬 (FIFO 처리).
    4.  **사진 상세 보기 (모달)**:
          - 썸네일 클릭 시 원본 해상도(또는 최대 1080px)로 이미지 표시.
          - **핵심 액션 버튼**: [승인 (Approve)], [거절 (Reject)]
    5.  **거절 사유 입력 (팝업/모달)**:
          - [거절] 버튼 클릭 시 활성화.
          - `TextArea` (텍스트 입력칸)
          - `Button` (최종 거절)

### 3.2 데이터 요구사항

  - **데이터 소스**: Cloudflare D1의 `ProfilePhotos` 테이블.
  - **API 요구사항 (백엔드)**:
      - `GET /api/admin/photos?status=pending&page=1`: '승인 대기' 목록 조회 (페이지네이션 적용).
      - `POST /api/admin/photos/{photoId}/approve`: 사진을 'approved'로 변경.
      - `POST /api/admin/photos/{photoId}/reject`: 사진을 'rejected'로 변경 (Body: `{ "reason": "거절 사유" }`).
  - **권한**: 오직 'Admin' role을 가진 사용자만 위 API를 호출할 수 있어야 함.

## 4\. 성능 요구사항

  - **목록 로딩**: '승인 대기' 목록은 1초 이내 로딩.
  - **처리 속도**: '승인/거절' 버튼 클릭 시 500ms 이내 처리 완료.

## 5\. 보안 요구사항

  - **관리자 인증 (필수)**:
      - Google Workspace (사내 계정) OIDC 또는 별도 Admin 계정 테이블을 통한 인증.
      - Cloudflare Worker에서 관리자 API(`/api/admin/*`) 접근 시 'Admin' role JWT 토큰 검증.
  - **데이터베이스**:
      - 관리자 계정은 D1 데이터베이스의 `ProfilePhotos` 테이블에 대한 `UPDATE` 권한을 가져야 함.

## 6\. AI 에이전트 구현 가이드 (GitHub Copilot)

### Copilot 프롬프트 예시 (Admin FE: React + Admin BE: CF Worker):

```
Feature: Admin Photo Verification Dashboard
Tech Stack: React, Material-UI (or similar admin UI kit), Cloudflare Workers, Hono, D1
Files to Create/Modify:
- functions/api/admin/photos/index.ts (Worker: GET pending photos)
- functions/api/admin/photos/[id]/approve.ts (Worker: POST approve)
- functions/api/admin/photos/[id]/reject.ts (Worker: POST reject)
- functions/api/middleware/isAdmin.ts (Worker: Admin Auth Middleware)
- src/admin/pages/PhotoVerification.tsx (React Page Component)
- src/admin/components/PhotoQueueTable.tsx (React Table)
- src/admin/components/PhotoDetailModal.tsx (React Modal)

Constraints (Backend):
- All routes under 'functions/api/admin/' MUST be protected by the 'isAdmin' middleware.
- 'isAdmin' middleware must verify a JWT token and check for 'role: admin' claim.
- 'reject.ts' MUST validate that the request body contains a non-empty 'reason' string.
- 'index.ts' MUST query D1 for 'ProfilePhotos' WHERE verification_status = 'pending' ORDER BY created_at ASC.

Constraints (Frontend):
- 'PhotoVerification.tsx' must fetch data from '/api/admin/photos?status=pending'.
- Clicking a table row in 'PhotoQueueTable.tsx' must open 'PhotoDetailModal.tsx'.
- 'PhotoDetailModal.tsx' must display the high-res image.
- Clicking 'Reject' button must open a text prompt for the 'reason' before calling the API.
```

## 7\. 의존성 및 선행 작업

  - **선행 작업 (기술)**:
      - [ ] **`AUTH-ADMIN-001`**: 관리자 계정 시스템 및 인증/인가(Role) 방식 확정. (e.g., Google Workspace 연동 또는 별도 이메일/PW 로그인)
      - [ ] **`PRD-USER-001`**: 관련 API 및 D1 스키마(`ProfilePhotos` 테이블) 개발 완료.
  - **선행 작업 (정책)**:
      - [ ] **승인 가이드라인 확립**: 운영자가 어떤 사진을 '승인'하고 '거절'할지 명확한 내부 기준 문서화. (e.g., "프레임이 50% 이상 보여야 함", "얼굴이 식별 가능해야 함")

## 8\. 성공 지표 (KPI)

  - **인증 승인 리드타임 (SLA)**: 사용자가 '신청'한 시점부터 관리자가 '승인/거절'하기까지 걸리는 평균 시간 (목표: 24시간 이내).
  - **운영 효율성**: 관리자 1명당 하루에 처리(승인/거절)할 수 있는 사진 건수.

-----