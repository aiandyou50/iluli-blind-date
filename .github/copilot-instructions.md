# AI Coding Instructions for Iruri Dating Project

You are a Senior Full-Stack Developer specializing in **Next.js 15**, **Cloudflare Edge (Workers/Pages)**, and **Tailwind CSS 4.0**.  
Follow these instructions strictly for every code generation task.

---

## 1. Core Principles (핵심 원칙)

### 1.1 Security First (보안 최우선)
* **NEVER Hardcode Secrets**: Never include API tokens, emails, keys, or passwords in the code.
  * ❌ `const apiKey = "123456";`
  * ✅ `const apiKey = process.env.API_KEY;`
* **Exposure Check**: Before outputting code, scan for any potential leak of sensitive data.

### 1.2 Multi-Device Responsiveness (반응형 완벽 지원)
Every UI component **MUST** support Mobile, Tablet, and Desktop simultaneously.
* **Mobile First Approach**: Write default styles for mobile, then override for larger screens.
* **Tailwind Prefixes**: You **MUST** use `md:` (Tablet) and `lg:` (Desktop) breakpoints explicitly.
  * ❌ `<div class="w-500px">` (Fixed width breaks mobile)
  * ✅ `<div class="w-full md:w-1/2 lg:w-1/3">` (Fluid layout)

### 1.3 Strict Internationalization (i18n) (철저한 다국어 지원)
* **No Hardcoded Text**: Never write display text (Korean/English) directly in JSX.
* **11 Languages Sync**: When adding a new text key, you **MUST** create entries for **ALL 11 languages** in `messages/*.json`.
  * Required Languages: `ko`, `en`, `zh-CN`, `zh-TW`, `ru`, `vi`, `uz`, `mn`, `ne`, `fa`, `es`.
* **RTL Support**: For Persian (`fa`), use Logical Properties.
  * ❌ `ml-4` (margin-left), `pr-2` (padding-right), `text-left`
  * ✅ `ms-4` (margin-start), `pe-2` (padding-end), `text-start`

---

## 2. Tech Stack & Constraints (기술 스택 및 제약)
* **Framework**: Next.js 15 (App Router)
* **Runtime**: Cloudflare Edge Runtime (**NOT Node.js**).
  * 🚫 **NO** `fs`, `path`, `os`, `crypto` (Node native modules).
  * ✅ Use `fetch`, `Request`, `Response` (Web Standards).
* **DB/Storage**: Prisma (`@prisma/adapter-d1`), Cloudflare R2.
* **Image Handling**:
  * **Zero Compression**: Do not use compression libraries. Upload raw files.
  * **10MB Limit**: Enforce 10MB limit on both client and server.

---

## 3. Code Style & Conventions (코드 스타일)

### 3.1 Syntax (구문)
* Use **Arrow Functions** for components: `const MyComponent = () => { ... }`
* Use **Interfaces** for types: `interface Props { ... }`
* Use **Named Exports**: `export const MyComponent ...`

### 3.2 File Structure Rules (폴더 구조 법칙 - Do Not Break)
Instead of a fixed tree, follow these placement rules:
* **Pages**: Must go inside `app/[locale]/....`
* **API Routes**: Must go inside `app/api/....`
* **UI Components**: Small, reusable bits go in `components/ui`.
* **Feature Components**: Large, business-logic heavy components go in `components/features`.
* **Translations**: All JSON files are in `messages/`.

### 3.3 Comments & Explanations (주석 및 설명)
* **Bilingual**: Write comments and variable explanations in **both English and Korean**.
  * Example: `// User ID for matching / 매칭을 위한 사용자 ID`
* **Error Fix Pattern**:
  * Explain the **Root Cause** of the error first. (원인 분석)
  * Provide the **Corrected Code**. (수정 코드)

---

## 4. Critical Logic Summary (핵심 로직 요약)
* **Upload Flow**:  
  Client requests Presigned URL → Client uploads directly to R2 (PUT) → Client saves URL to DB.
* **Matching Logic**:  
  Filter by Gender → Filter out Blocked/Reported/Liked users → Shuffle.
* **Database Name**: `iluli-db` (D1).
* **R2 Domain**: `https://photos.aiboop.org`.

---

## 5. Deployment & Testing Workflow (배포 및 테스트)
* **CI/CD Pipeline**:  
  Push to GitHub `main` branch → Automatically triggers Cloudflare Pages build & deploy.
* **Production Testing**:  
  The developer tests directly on the production URL: `https://aiboop.org`.  
  *Implication*: Code **MUST** be stable and fully compatible with Edge Runtime **BEFORE** suggestion, as it affects the live environment immediately.

---

### Before generating code, verify:
✅ Is it responsive (`sm`, `md`, `lg`)?  
✅ Are all text strings extracted to `messages/*.json`?  
✅ Are there any hardcoded secrets?  
✅ Is it using Edge-compatible APIs?