
-----

# [Master Spec] 이루리 소개팅 개발 명세서 (v2.3)

> **AI Agent 지시 사항**:
> 이 문서는 프로젝트의 \*\*유일한 진실 공급원(Source of Truth)\*\*입니다.
> \*\*이미 생성된 Cloudflare 리소스(D1, R2)\*\*와 **이미 등록된 환경 변수**를 기반으로 개발을 진행하십시오.

## 1\. 프로젝트 개요 (Overview)

  - **프로젝트명**: 이루리 소개팅 (Iruri Dating)
  - **서비스 정의**: 네컷사진을 매개로 이성을 확인하고, 마음에 들면 인스타그램 DM으로 직접 연락하는 글로벌 대학생 소개팅 서비스.
  - **배포 URL**: `https://aiboop.org`
  - **배포 파이프라인**: GitHub Commit & Push → Cloudflare Pages (CI/CD) 자동 배포.

## 2\. 기술 스택 (Tech Stack)

  - **Framework**: Next.js 15.5.2 (App Router)
  - **Language**: TypeScript
  - **Auth**: **Auth.js (NextAuth v5)** - Google Provider Only.
  - **Database**: Cloudflare D1 (SQLite)
  - **ORM**: Prisma 7.0.0 (Adapter: `@prisma/adapter-d1`)
  - **Storage**: Cloudflare R2 (이미지 저장)
  - **Styling**: Tailwind CSS 4
  - **i18n**: `next-intl` (미들웨어 기반 라우팅)

## 3\. Cloudflare 리소스 구성 (Infrastructure)

이미 생성된 리소스를 사용하므로 `wrangler.toml` 설정 시 아래 정보를 바인딩하여 사용하십시오.

### 3.1 D1 Database

  - **Database Name**: `iluli-db`
  - **Binding Name (Env)**: `DB`
  - **설정 예시**:
    ```toml
    [[d1_databases]]
    binding = "DB"
    database_name = "iluli-db"
    database_id = "<AI가_Cloudflare_대시보드에서_ID확인_필요>"
    ```

### 3.2 R2 Storage

  - **Bucket Name**: `iluli-photos`
  - **Binding Name (Env)**: `R2`
  - **설정 예시**:
    ```toml
    [[r2_buckets]]
    binding = "R2"
    bucket_name = "iluli-photos"
    ```

## 4\. 환경 변수 (Environment Variables)

아래 변수들은 **이미 Cloudflare Pages 프로젝트 설정(Settings \> Environment variables)에 암호화된 비밀 변수(Secret)로 완벽하게 등록되어 있습니다.**
따라서 배포 환경에서는 별도의 설정이 필요 없으며, 코드에서 `process.env`로 호출하여 사용하면 됩니다.

| 변수명 | 설명 | 비고 |
|--------|------|------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | **Cloudflare Pages에 이미 등록됨** |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | **Cloudflare Pages에 이미 등록됨** |
| `AUTH_SECRET` | NextAuth 암호화 키 | **Cloudflare Pages에 이미 등록됨** (임의의 문자열 값) |

*(로컬 개발 시에만 `.env.local` 파일에 동일한 값을 복사하여 사용하십시오)*

## 5\. 데이터베이스 모델링 (Prisma Schema)

*Google 로그인을 사용하므로 `Account` 모델이 필요하며, 별도의 비밀번호 컬럼은 없습니다.*

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?   // 구글 프로필 사진
  
  // 커스텀 필드
  nickname      String?
  gender        String?   // 'MALE' | 'FEMALE'
  instagramId   String?   // 필수 입력
  introduction  String?   
  role          String    @default("USER") // 'USER' | 'ADMIN'
  
  accounts      Account[]
  sessions      Session[]
  photos        Photo[]   
  likes         Like[]    
  matchesAsUser1 Match[]  @relation("User1Matches")
  matchesAsUser2 Match[]  @relation("User2Matches")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Match {
  id        String   @id @default(cuid())
  user1Id   String
  user2Id   String
  user1     User     @relation("User1Matches", fields: [user1Id], references: [id], onDelete: Cascade)
  user2     User     @relation("User2Matches", fields: [user2Id], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String? 
  access_token       String? 
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Photo {
  id        String   @id @default(cuid())
  userId    String
  url       String   // R2 Public URL
  caption   String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes     Like[]   
  
  createdAt DateTime @default(now())
}

model Like {
  id        String   @id @default(cuid())
  userId    String   // 좋아요를 누른 사람
  photoId   String   // 좋아요 받은 사진
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  photo     Photo    @relation(fields: [photoId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  @@unique([userId, photoId]) // 중복 방지
}
```

## 6\. 기능 명세 (Functional Specs)

### 6.1 다국어 및 초기 진입

  - **언어 감지**: 브라우저 설정 기반. (`next-intl` 미들웨어 사용)
  - **지원 언어**: 한국어(`ko`), 영어(`en`), 중국어(`zh-CN`, `zh-TW`) 등 설정 가능.
  - **기본값**: 지원하지 않는 언어일 경우 `en`(영어)로 표시.

### 6.2 인증 (Auth)

  - **로그인**: Google 소셜 로그인 전용 (NextAuth v5).
  - **회원가입 후처리**: 최초 로그인 시 필수 정보(`instagramId`, `nickname`, `gender`)가 없는 경우 입력 페이지로 유도.

### 6.3 피드 (Feed)

  - **UI**: 인스타그램 스타일 세로 스크롤.
  - **기능**: 전체 유저 사진 최신순 노출, 좋아요 클릭, 작성자 닉네임 클릭 시 프로필 이동.

### 6.4 소개팅 매칭 (Discovery)

  - **대상 추출**:
    - 내 성별과 반대되는(`Opposite`) 성별의 유저만 노출.
    - 이미 좋아요/패스한 유저 제외 (TODO).
  - **액션**:
    - **Like**: 마음에 드는 사진에 하트 클릭. DB `Like` 테이블에 저장.
    - **Pass**: 다음 카드로 넘기기. (현재 DB 저장 없음).

### 6.5 프로필 조회 (Profile View)

  - **핵심 기능**: **[Instagram DM 보내기]** 버튼 (외부 링크 연결).
  - **정보**: 닉네임, 소개, 업로드한 사진 목록, 총 좋아요 수.

### 6.6 마이페이지 (CRUD)

  - **내 정보 수정**: 닉네임, 인스타그램 ID, 자기소개, 성별 수정 가능.
  - **사진 관리**: R2 이미지 업로드 및 삭제 기능.
  - **현황 확인**: 내가 받은 좋아요 수 확인.

### 6.7 관리자 (Admin)

  - **접근 권한**: `User.role`이 `ADMIN`인 계정만 접근 가능 (`/admin`).
  - **유저 관리**:
    - 전체 가입 유저 목록 조회 (최신순).
    - 유저별 사진 수, 받은 좋아요 수, 매칭 수 통계 확인.
    - 유저 삭제 기능.
  - **사진 관리**:
    - 전체 업로드 사진 목록 조회 (최신순).
    - 부적절한 사진 삭제 기능.

## 7\. UI/UX 가이드라인

  - **Mobile First**: `max-w-[430px]` 중앙 정렬 레이아웃 준수.
  - **Tablet/PC**: 배경색을 어둡게 하거나 블러 처리하고, 앱 화면만 중앙에 위치시킴.

-----
