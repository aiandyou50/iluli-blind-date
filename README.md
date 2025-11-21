

# Iluli Blind Date (이루리 블라인드 데이트)

[![English](https://img.shields.io/badge/Language-English-blue)](#-english) [![Korean](https://img.shields.io/badge/Language-한국어-red)](#-korean)

---

<a id="-english"></a>
## 🇺🇸 English

Iluli Blind Date is a modern web application designed for social discovery and blind dating. Built with Next.js 15 and Cloudflare's edge infrastructure, it offers a fast, responsive, and global experience.

### 🚀 Features

- **Photo Feed**: Browse photos from other users in a clean, responsive grid layout.
- **User Profiles**:
  - **My Profile**: Manage your photos (upload/delete), view your info.
  - **Public Profile**: View other users' photos, bio, and Instagram links.
- **Photo Management**:
  - Upload photos directly to Cloudflare R2 storage.
  - Delete photos from your profile.
- **Internationalization (i18n)**:
  - Full support for **English**, **Korean (한국어)**, **Simplified Chinese (简体中文)**, and **Traditional Chinese (繁體中文)**.
  - Automatic locale detection and language switcher.
- **Authentication**: Secure login via Google (NextAuth.js).
- **Responsive Design**: Mobile-first UI built with Tailwind CSS, supporting Dark Mode.

### 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the Edge)
- **ORM**: [Prisma](https://www.prisma.io/) (with D1 adapter)
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (Object Storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Deployment**: Cloudflare Pages

### 📂 Project Structure

```

.
├── app/                    \# Next.js App Router
│   ├── [locale]/           \# Localized routes
│   │   ├── feed/           \# Main photo feed
│   │   ├── profile/        \# User profiles
│   │   └── ...
│   └── api/                \# API Routes (Photos, Users, Auth)
├── components/             \# Reusable React components
├── lib/                    \# Utility functions & configurations
├── messages/               \# i18n translation files (en, ko, zh)
├── prisma/                 \# Database schema & migrations
└── public/                 \# Static assets

````

### 🏁 Getting Started

#### Prerequisites

- Node.js 18+
- Cloudflare account (for D1 & R2)

#### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/iluli-blind-date.git](https://github.com/yourusername/iluli-blind-date.git)
   cd iluli-blind-date


2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with the following variables:

    ```env
    DATABASE_URL="file:./dev.db" # For local development
    NEXTAUTH_SECRET="your-secret"
    NEXTAUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"

    # Cloudflare R2 Configuration
    R2_ACCOUNT_ID="your-account-id"
    R2_ACCESS_KEY_ID="your-access-key"
    R2_SECRET_ACCESS_KEY="your-secret-key"
    R2_BUCKET_NAME="your-bucket-name"
    R2_PUBLIC_URL="https://your-r2-public-url"
    ```

4.  **Database Setup**
    Initialize the Prisma database:

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

### 📜 License

This project is licensed under the MIT License.

-----

<a id="korean"></a>

## 🇰🇷 Korean (한국어)

**이루리 블라인드 데이트(Iluli Blind Date)** 는 소셜 디스커버리와 소개팅을 위해 설계된 현대적인 웹 애플리케이션입니다. Next.js 15와 Cloudflare의 엣지 인프라를 기반으로 구축되어 전 세계 어디서나 빠르고 반응성 높은 사용자 경험을 제공합니다.

### 🚀 주요 기능

  - **포토 피드**: 깔끔한 반응형 그리드 레이아웃으로 다른 사용자들의 사진을 탐색할 수 있습니다.
  - **사용자 프로필**:
      - **내 프로필**: 내 사진을 관리(업로드/삭제)하고 내 정보를 확인할 수 있습니다.
      - **공개 프로필**: 다른 사용자의 사진, 자기소개, 인스타그램 링크 등을 조회할 수 있습니다.
  - **사진 관리**:
      - Cloudflare R2 스토리지에 사진을 직접 업로드합니다.
      - 프로필에서 원치 않는 사진을 삭제할 수 있습니다.
  - **다국어 지원 (i18n)**:
      - **영어**, **한국어**, \*\*중국어(간체/번체)\*\*를 완벽하게 지원합니다.
      - 사용자의 언어를 자동으로 감지하며, 수동 전환 기능도 제공합니다.
  - **인증 시스템**: 구글(Google) 계정을 통한 안전한 간편 로그인을 지원합니다 (NextAuth.js).
  - **반응형 디자인**: Tailwind CSS로 구축된 모바일 우선(Mobile-first) UI이며, 다크 모드를 지원합니다.

### 🛠️ 기술 스택

  - **프레임워크**: [Next.js 15](https://nextjs.org/) (App Router)
  - **언어**: TypeScript
  - **데이터베이스**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (엣지 기반 SQLite)
  - **ORM**: [Prisma](https://www.prisma.io/) (D1 어댑터 적용)
  - **스토리지**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (오브젝트 스토리지)
  - **스타일링**: [Tailwind CSS](https://tailwindcss.com/)
  - **국제화(i18n)**: [next-intl](https://next-intl-docs.vercel.app/)
  - **배포**: Cloudflare Pages

### 📂 프로젝트 구조

```
.
├── app/                    # Next.js 앱 라우터
│   ├── [locale]/           # 다국어 라우트
│   │   ├── feed/           # 메인 포토 피드
│   │   ├── profile/        # 사용자 프로필
│   │   └── ...
│   └── api/                # API 라우트 (사진, 유저, 인증)
├── components/             # 재사용 가능한 React 컴포넌트
├── lib/                    # 유틸리티 함수 및 설정 파일
├── messages/               # i18n 번역 파일 (en, ko, zh)
├── prisma/                 # 데이터베이스 스키마 및 마이그레이션
└── public/                 # 정적 에셋
```

### 🏁 시작 가이드

#### 사전 요구사항 (Prerequisites)

  - Node.js 18 버전 이상
  - Cloudflare 계정 (D1 및 R2 사용을 위해 필요)

#### 설치 및 실행 방법

1.  **저장소 복제 (Clone)**

    ```bash
    git clone [https://github.com/yourusername/iluli-blind-date.git](https://github.com/yourusername/iluli-blind-date.git)
    cd iluli-blind-date
    ```

2.  **패키지 설치**

    ```bash
    npm install
    ```

3.  **환경 변수 설정**
    프로젝트 루트 경로에 `.env` 파일을 생성하고 아래 내용을 입력하세요:

    ```env
    DATABASE_URL="file:./dev.db" # 로컬 개발용 DB 경로
    NEXTAUTH_SECRET="your-secret"
    NEXTAUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"

    # Cloudflare R2 설정
    R2_ACCOUNT_ID="your-account-id"
    R2_ACCESS_KEY_ID="your-access-key"
    R2_SECRET_ACCESS_KEY="your-secret-key"
    R2_BUCKET_NAME="your-bucket-name"
    R2_PUBLIC_URL="https://your-r2-public-url"
    ```

4.  **데이터베이스 설정**
    Prisma를 초기화하고 스키마를 적용합니다:

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **개발 서버 실행**

    ```bash
    npm run dev
    ```

    브라우저에서 [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)으로 접속하세요.

### 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.