# GitHub Actions 자동 배포 설정 가이드

## ✅ 완료된 작업
1. ✅ GitHub Actions 워크플로우 파일 생성 (`.github/workflows/deploy.yml`)
2. ✅ Cloudflare API 토큰 생성 페이지 열림

## 🔑 다음 단계: GitHub Secrets 설정

### 1단계: Cloudflare API 토큰 생성 완료
브라우저에서 토큰 생성 후 복사하세요.

### 2단계: GitHub Repository Secrets 추가

1. **GitHub 저장소로 이동**
   ```
   https://github.com/aiandyou50/iluli-blind-date/settings/secrets/actions
   ```

2. **New repository secret** 클릭

3. **Secret 추가**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [복사한 Cloudflare API 토큰 붙여넣기]

4. **Add secret** 클릭

## 🚀 자동 배포 작동 방식

### 트리거
- `main` 브랜치에 코드 푸시 시 자동 실행

### 배포 프로세스
1. Frontend 빌드 (React + Vite)
2. 빌드 파일을 `worker/public/`로 복사
3. Worker 배포 (API + Frontend 통합)
4. `aiboop.org`로 자동 배포

### 워크플로우 단계
```yaml
1. Checkout code (코드 체크아웃)
2. Setup Node.js 18 (Node.js 설정)
3. Install Frontend dependencies (프론트엔드 의존성 설치)
4. Build Frontend (프론트엔드 빌드)
   - VITE_API_BASE_URL=https://aiboop.org/api/v1
   - VITE_GOOGLE_CLIENT_ID=[환경 변수에서 설정]
5. Copy to worker/public (빌드 파일 복사)
6. Install Worker dependencies (워커 의존성 설치)
7. Deploy to Cloudflare (프로덕션 배포)
```

## 📝 현재 해야 할 일

1. ✅ Cloudflare API 토큰 생성 (브라우저에서 진행 중)
2. ⏳ GitHub Secrets에 `CLOUDFLARE_API_TOKEN` 추가
3. ⏳ Frontend 로컬 빌드 및 worker/public 복사
4. ⏳ Git commit & push
5. ⏳ GitHub Actions 자동 배포 확인

## 🔍 배포 모니터링

배포 상태는 GitHub Actions 탭에서 확인:
```
https://github.com/aiandyou50/iluli-blind-date/actions
```

## ⚠️ 주의사항

- API 토큰은 절대 코드에 포함하지 마세요 (GitHub Secrets만 사용)
- 토큰은 한 번만 표시되므로 안전한 곳에 백업
- Workers 배포에는 몇 분 정도 소요될 수 있습니다

---

**다음**: API 토큰 복사 완료 후 알려주시면 GitHub Secrets 설정을 도와드리겠습니다.
