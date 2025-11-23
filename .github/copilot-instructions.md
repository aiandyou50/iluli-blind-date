# AI 코딩 에이전트 가이드라인

> **문서 버전**: 2.1.0 (AI-Native & Emergency Procedure Simplified)  
> **원칙**: **"코드는 로컬에서 작성하고, 테스트는 배포 후에"** - GitHub와 Cloudflare만으로 관리합니다.

---

### 🎯 핵심 원칙 (2개)

1. **SPEC.md가 유일한 진실**: 모든 코드는 `SPEC.md`를 100% 따릅니다. 불일치는 즉시 중지합니다.
2. **배포 후 직접 테스트**: `localhost:3000`을 실행하지 않습니다. GitHub 푸시 → Cloudflare 배포 → `aiboop.org`에서 테스트합니다.

---

### ✅ **코드 작성 전 체크리스트 (필수)**

```typescript
// 이 체크리스트를 각 파일 상단에 주석으로 붙이세요
// [ ] 1. Zod 검증이 API 첫 번째 줄에 있나요?
// [ ] 2. 10MB 제한이 클라이언트+서버 모두 있나요?
// [ ] 3. Node.js 모듈(fs, os 등)을 import하지 않았나요?
// [ ] 4. Prisma Enum을 사용했나요? (Gender.MALE)
// [ ] 5. CORS 정책이 wrangler.toml에 설정되어 있나요?
// [ ] 6. "생략..." 주석이 없나요?
```

---

### 🎨 **테스트 방식 (Production-Only)**

| 단계 | 명령어/액션 | 검증 | 기대 결과 |
|------|-------------|------|-----------|
| **1. 코드 작성** | AI 생성 | TypeScript, ESLint | 오류 없음 |
| **2. GitHub 푸시** | `git push origin main` | GitHub | 푸시 성공 |
| **3. Cloudflare 빌드** | 자동 트리거 | Dashboard | Build 성공 🟢 |
| **4. 배포 확인** | 대기 (30초) | Dashboard | Deploy 성공 🟢 |
| **5. 브라우저 테스트** | `open https://aiboop.org` | Chrome DevTools | 기능 정상 |

---

### 🚫 **환경별 금지사항**

| 항목 | 개발 시 | 프로덕션 시 | 위반 시 |
|------|---------|-------------|---------|
| **로컬 서버 실행** | `npm run dev` **금지** | 해당 없음 | 환경 차이 발생 |
| **CORS 도메인** | `aiboop.org`만 허용 | `aiboop.org`만 허용 | 보안 취약점 |
| **파일 크기** | 10MB **검증 후 경고** | 10MB **즉시 거부** | 용량 초과 |
| **압축 라이브러리** | **절대 금지** | **절대 금지** | 원본 훼손 |
| **오류 세부사항** | `details` 포함 가능 | `details` 제거 | 정보 노출 |

---

### 📦 **필수 코드 템플릿**

#### **템플릿 1: API Route**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().cuid(),
  file: z.instanceof(File).refine(f => f.size <= 10 * 1024 * 1024, "10MB 초과")
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "입력값을 확인하세요" },
      { status: 400 }
    );
  }
}
```

#### **템플릿 2: 클라이언트 업로드**
```typescript
// components/PhotoUpload.tsx
const MAX_SIZE = 10 * 1024 * 1024;

function handleFile(file: File) {
  if (file.size > MAX_SIZE) {
    alert("10MB 이하 파일만 업로드 가능합니다");
    return;
  }
  // 업로드 로직
}
```

---

### ⚡ **비상 조치 (개발 중 주석으로 처리)**

긴급 상황(예: 장애 복구) 시 코드에 직접 주석을 추가하세요:

```typescript
// ESC: [이유] [기간] - 예: ESC: HEIC 호환성 테스트 15분간
// 원칙 위반 코드...
// ESC-END: 원칙 복구
```

- **이유**: 왜 원칙을 잠시 무시해야 하는지 명확히 작성
- **기간**: 예상 소요 시간 (15분, 1시간 등)
- **ESC-END**: 원칙 복구 시점을 명시적으로 표시

---

### 🛡️ **자가 검증 (5초 체크)**

코드 작성 후 **반드시** 실행:
1. `grep -r "from 'fs'\|from 'os'" app/` → **금지 모듈 없는가?**
2. `grep -r "생략\|...)" app/` → **생략 주석 없는가?**
3. 모든 `route.ts`에 `z.` → **Zod 검증 있는가?**

---
