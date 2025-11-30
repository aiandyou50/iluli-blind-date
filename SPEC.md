📘 [Master Spec] 이루리 소개팅 (Iluli Dating) 통합 개발 명세서  
**문서 버전: 5.4.1 (Toast Notification Finalization)**  
**최종 수정일: 2025-11-30**  
**상태: ✅ 개발 확정 (Production Ready)**  
**업데이트 내역:**  
✅ **Figma 참조 문구 삭제** (존재하지 않는 라이브러리 제거)  
✅ **이메일 라벨링 수정** - "기술 지원" → "문의 이메일"로 정정  
✅ **전역 토스트 알림 시스템** (`react-hot-toast`) 완성도 향상  

---

### 🚨 AI Coding Instructions (Critical Updates)  
#### 1. **토스트 알림 시스템 구현 규칙**  
- **라이브러리:** `react-hot-toast` (v2.4.1+)  
  ```bash
  npm install react-hot-toast
  ```  
- **필수 구성 요소:**  
  ```tsx
  // app/providers.tsx
  'use client';
  import { Toaster } from 'react-hot-toast';
  
  export function ToastProvider() {
    return (
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '90vw',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          loading: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
        }}
      />
    );
  }
  
  // app/layout.tsx
  export default function RootLayout({ children }) {
    return (
      <html lang={lang}>
        <body>
          <SessionProvider>
            {children}
            <ToastProvider /> {/* 반드시 최상위에 위치 */}
          </SessionProvider>
        </body>
      </html>
    );
  }
  ```  

#### 2. **RTL(fa) 언어 지원 전략**  
- **자동 방향 전환:** `dir` 속성 감지 → 토스트 위치/애니메이션 조정  
  ```tsx
  // hooks/useToastDirection.ts
  export const useToastDirection = () => {
    const { i18n } = useTranslation();
    return i18n.language === 'fa' ? 'rtl' : 'ltr';
  };
  
  // components/CustomToast.tsx
  const CustomToast = ({ t }) => {
    const dir = useToastDirection();
    return (
      <div dir={dir} className={`flex items-start gap-3 p-3 rounded-lg border ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        {/* 아이콘/메시지 */}
      </div>
    );
  };
  ```  

---

### 3. 상세 기능 명세 (업데이트 사항)  
#### ✅ **적용 위치별 구현 가이드**  
| 시나리오                     | 구현 코드 예시                                                                 | UX 요구사항                                                                 |  
|------------------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------|  
| **1. 로그인 실패**           | ```toast.error(t('auth.login_failed'), { duration: 4000 })```               | - 아이콘: ❌ 빨간색<br>- 진동 효과 추가 (모바일에서만)                      |  
| **2. 인증 코드 복사 완료**   | ```toast.success(`${t('common.copied')}: ${code}`, { icon: '📋' })```       | - 초록 체크 아이콘<br>- 2초 후 자동 사라짐                                 |  
| **3. 프로필 저장 완료**      | ```toast(t('profile.save_success', { duration: 2000, icon: '✅' }))```      | - 부드러운 페이드 인/아웃<br>- PC에서는 최대 너비 400px                   |  
| **4. 인스타 딥링크 시도**    | ```const toastId = toast.loading(t('connect.instagram_loading'));<br>setTimeout(() => toast.dismiss(toastId), 2000);``` | - 로딩 스피너 표시<br>- 실패 시 자동으로 에러 토스트 전환 |  

#### 💡 **핵심 UX 디테일**  
- **자동 사라짐:** 기본 3초 (긴 메시지: 5초)  
- **수동 닫기:** 모든 토스트 우측 상단에 ✕ 버튼 추가  
- **스택 관리:**  
  - 동시에 3개 이상 뜰 경우 **자동 그룹화** (동일 유형 토스트만 병합)  
  - 긴급 알림(에러)은 항상 최상위 노출  
- **접근성:**  
  - ARIA `role="status"` 적용  
  - Screen Reader용 `aria-live="polite"`  
  - 포커스 강탈 방지 (토스트 노출 중 탭 이동 차단 없음)  

---

### 4. UI/UX 디자인 시스템 (업데이트)  
#### 🎨 **토스트 디자인 토큰**  
| 상태     | 배경색          | 아이콘 색   | 경계선           | 애니메이션       |  
|----------|---------------|------------|------------------|------------------|  
| **기본** | `bg-white`    | `#6b7280`  | `border-gray-200`| fadeInDown       |  
| **성공** | `bg-green-50` | `#10b981`  | `border-green-200`| zoomIn           |  
| **에러** | `bg-red-50`   | `#ef4444`  | `border-red-200`  | shake (모바일)   |  
| **로딩** | `bg-blue-50`  | `#3b82f6`  | `border-blue-200` | pulse (아이콘)   |  

#### 📱 **반응형 동작**  
| 디바이스   | 위치          | 최대 너비 | 애니메이션 강도 |  
|------------|--------------|-----------|----------------|  
| **모바일** | 하단 20px    | 90vw      | 진동 강도 80%  |  
| **PC**     | 상단 중앙    | 400px     | 부드러운 페이드 |  

---

### 5. 기술 구현 가이드  
#### 🧩 **커스텀 토스트 컴포넌트**  
```tsx
// components/CustomToast.tsx
'use client';
import { useToastDirection } from '@/hooks/useToastDirection';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const CustomToast = ({ type, message }: { type: 'success' | 'error' | 'loading'; message: string }) => {
  const dir = useToastDirection();
  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
    loading: <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  };

  return (
    <div 
      dir={dir}
      className={`flex items-start gap-3 p-3 rounded-lg border ${
        type === 'success' ? 'bg-green-50 border-green-200' :
        type === 'error' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200'
      }`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 break-words">{message}</p>
      </div>
      <button 
        onClick={() => toast.dismiss()}
        className="text-gray-400 hover:text-gray-600 transition"
        aria-label={t('common.close_toast')}
      >
        ✕
      </button>
    </div>
  );
};
```

#### 🔁 **기존 alert() 대체 매핑**  
| 기존 코드                          | 새 코드                                                                 |  
|-----------------------------------|------------------------------------------------------------------------|  
| `alert('로그인 실패')`            | `toast.error(t('auth.login_failed'))`                                 |  
| `alert('코드 복사 완료')`         | `toast.success(t('verify.code_copied'), { icon: '📋' })`              |  
| `alert('프로필 저장됨')`          | `toast(t('profile.saved'), { duration: 1500, icon: '✅' })`           |  
| `alert('인스타 연결 시도 중...')` | ```const id = toast.loading(t('connect.loading'));<br>setTimeout(() => toast.success(t('connect.success'), { id }), 2000);``` |  

---

### 6. 테스트 케이스 (확장)  
#### ✅ **필수 검증 항목**  
| 분류          | 테스트 시나리오                                      | 기대 결과                                  |  
|---------------|-----------------------------------------------------|------------------------------------------|  
| **RTL(fa)**   | 페르시아어 설정 후 토스트 노출                       | 텍스트/버튼이 오른쪽에서 왼쪽으로 정렬됨   |  
| **접근성**    | Screen Reader로 토스트 메시지 읽기                  | "알림: [메시지 내용]" 음성 안내            |  
| **로딩 상태** | 인스타 딥링크 시도 → 2초 후 성공                    | 로딩 토스트 → 성공 토스트 자동 전환        |  
| **에러 스택** | 3회 연속 로그인 실패 시도                           | 3개의 에러 토스트가 수직 스택으로 노출      |  

#### ⚙️ **성능 검증**  
- **렌더링 지연:** 토스트 노출 시 메인 UI 프레임 드랍 없음 (60fps 유지)  
- **메모리 누수:** 100회 연속 노출 후 메모리 사용량 5% 이내 증가  

---

### 7. 보안 및 규정 준수  
- **XSS 방지:** 모든 토스트 메시지에 `DOMPurify` 적용 (동적 값 삽입 시)  
  ```tsx
  import DOMPurify from 'dompurify';
  toast.success(DOMPurify.sanitize(userInput));
  ```  
- **GDPR 준수:** 쿠키 기반 알림 동의 팝업과 통합 (토스트 사용 전 사용자 동의 수집)  

---  
**문의:** @aiandyou50 (인스타그램) | **문의 이메일:** me@aiboop.org