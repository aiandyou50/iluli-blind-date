네, 아주 중요한 정보입니다\! AI 에이전트가 `wrangler.toml` 파일을 설정할 때 이 **실제 리소스 이름**을 모르면 에러가 발생합니다.

제공해주신 \*\*D1 데이터베이스명(`iluli-db`)\*\*과 \*\*R2 버킷명(`iluli-photos`)\*\*을 반영하여, AI가 설정 파일까지 완벽하게 작성할 수 있도록 \*\*[Master Spec v2.1]\*\*로 업데이트했습니다.

이 내용을 그대로 복사해서 `SPEC.md`로 저장하세요.

-----

# [Master Spec] 이루리 소개팅 개발 명세서 (v2.1)

> **AI Agent 지시 사항**:
> 이 문서는 프로젝트의 \*\*유일한 진실 공급원(Source of Truth)\*\*입니다.
> **이미 생성된 Cloudflare 리소스(D1, R2)** 정보를 `wrangler.toml`에 정확히 바인딩하고, 아래 명세를 준수하여 개발하십시오.

## 1\. 프로젝트 개요 (Overview)

  - **프로젝트명**: 이루리 소개팅 (Iruri Dating)
  - **서비스 정의**: 네컷사진을 매개로 이성을 확인하고, 마음에 들면 인스타그램 DM으로 직접 연락하는 글로벌 대학생 소개팅 서비스.
  - **배포 URL**: `https://aiboop.org`
  - **배포 파이프라인**: GitHub Commit & Push → Cloudflare Pages (CI/CD) 자동 배포.

## 2\. 기술 스택 (Tech Stack)

  - **Framework**: Next.js 15 (App Router)
  - **Language**: TypeScript
  - **Auth**: **Auth.js (NextAuth v5)** - Google Provider Only.
  - **Database**: Cloudflare D1 (SQLite)
  - **ORM**: Prisma (Adapter: `@prisma/adapter-d1`)
  - **Storage**: Cloudflare R2 (이미지 저장)
  - **Styling**: Tailwind CSS
  - **i18n**: `next-intl` (미들웨어 기반 라우팅)

## 3\. Cloudflare 리소스 구성 (Infrastructure)

이미 생성된 리소스를 사용하므로 `wrangler.toml` 설정 시 아래 정보를 사용하십시오.

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

Cloudflare Pages 대시보드 및 로컬 `.env`에서 관리해야 할 필수 변수.

| 변수명 | 설명 | 비고 |
|--------|------|------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | 구글 클라우드 콘솔 발급 |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | 보안 주의 (Secret) |
| `AUTH_SECRET` | NextAuth 암호화 키 | `openssl rand -base64 32` |

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
  
  accounts      Account[]
  sessions      Session[]
  photos        Photo[]   
  likes         Like[]    

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
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

  - **언어 감지**: 브라우저 설정 기반 (`ko`, `zh-CN`, `zh-TW`, `en`).
  - **기본값**: 지원하지 않는 언어일 경우 `en`(영어)로 표시.

### 6.2 인증 (Auth)

  - **로그인**: Google 소셜 로그인 전용.
  - **회원가입 후처리**: 최초 로그인 시 `instagramId`, `nickname`, `gender`가 `null`이면 **필수 정보 입력 페이지**로 리다이렉트.

### 6.3 피드 (Feed)

  - **UI**: 인스타그램 스타일 세로 스크롤.
  - **기능**: 전체 유저 사진 최신순 노출, 좋아요 클릭, 작성자 닉네임 클릭 시 프로필 이동.

### 6.4 소개팅 매칭 (Discovery)

  - **UI**: 틴더 스타일 카드 뷰.
  - **로직**: 내 성별과 반대되는(`Opposite`) 성별의 유저 사진만 랜덤 노출.
  - **액션**: 하트 클릭 시 좋아요 → 프로필 조회 페이지로 이동 유도.

### 6.5 프로필 조회 (Profile View)

  - **핵심 기능**: **[Instagram DM 보내기]** 버튼 (외부 링크 연결).
  - **정보**: 닉네임, 소개, 업로드한 사진 목록 및 총 좋아요 수.

### 6.6 마이페이지 (CRUD)

  - **내 정보**: 닉네임, 인스타그램 ID 수정.
  - **사진 관리**: R2 업로드 및 삭제 기능. 내가 받은 좋아요 수 확인.

## 7\. UI/UX 가이드라인

  - **Mobile First**: `max-w-[430px]` 중앙 정렬 레이아웃 준수.
  - **Tablet/PC**: 배경색을 어둡게 하거나 블러 처리하고, 앱 화면만 중앙에 위치시킴.

-----

### **이루리의 팁: AI에게 이렇게 명령하세요**

파일을 저장한 후, AI 에이전트에게 첫 번째로 내릴 명령입니다:

> "`SPEC.md`를 확인해.
> 이미 `iluli-db`라는 이름의 D1 데이터베이스와 `iluli-photos`라는 R2 버킷이 생성되어 있어.
> 이 정보를 바탕으로 `wrangler.toml` 설정을 먼저 잡아주고, 프로젝트 초기 세팅을 시작해 줘."

이제 정말 준비가 완벽하게 되었습니다\! 개발을 시작해 보세요.