# ⚠️ Cloudflare Pages 배포 오류 해결 가이드

## 문제 상황

Cloudflare Pages가 GitHub 저장소에 자동으로 연결되어 배포를 시도하고 있습니다.
하지만 우리 프로젝트는 **Workers만 사용**하므로 Pages 배포는 필요하지 않습니다.

### 오류 로그
```
npm error path /opt/buildhome/repo/package.json
npm error errno -2
npm error enoent Could not read package.json
```

**원인**: Cloudflare Pages가 루트 디렉토리에서 빌드를 시도하지만, package.json이 `frontend/`와 `worker/` 폴더에만 존재합니다.

---

## ✅ 해결 방법

### 옵션 1: Cloudflare Pages 프로젝트 삭제 (권장)

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com/48a09063776ab35c453778ea6ebd0172/workers-and-pages

2. **Pages 탭 선택**

3. **iluli-frontend (또는 유사한 이름) 프로젝트 찾기**

4. **프로젝트 클릭 → Settings → Delete project**

### 옵션 2: Git 연동 비활성화

1. Pages 프로젝트 선택

2. **Settings → Builds & deployments**

3. **Automatic deployments** → **Disable**

---

## 🚀 올바른 배포 아키텍처

### ❌ 잘못된 방식 (현재 상태)
```
GitHub Push
  ↓
  ├─ GitHub Actions → Workers 배포 ✅
  └─ Cloudflare Pages → 빌드 시도 ❌ (실패)
```

### ✅ 올바른 방식 (목표)
```
GitHub Push
  ↓
GitHub Actions
  ↓
  1. Frontend 빌드
  2. worker/public/ 복사
  3. Workers 배포 (API + Frontend 통합)
  ↓
https://aiboop.org (Workers가 모든 것을 서빙)
```

---

## 📋 배포 확인

### GitHub Actions 상태 확인
https://github.com/aiandyou50/iluli-blind-date/actions

**예상 결과**:
- ✅ "Deploy to Cloudflare Workers" 워크플로우 성공
- ✅ Worker URL: https://iluli-worker-prod.x00518.workers.dev

### Cloudflare Workers 확인
https://dash.cloudflare.com/48a09063776ab35c453778ea6ebd0172/workers/services/view/iluli-worker-prod

**예상 결과**:
- ✅ Latest deployment: 성공
- ✅ Triggers: Custom domain 설정 가능

---

## 🎯 다음 단계

1. ✅ **Cloudflare Pages 프로젝트 삭제 또는 비활성화**

2. ✅ **GitHub Actions 워크플로우 확인**
   - https://github.com/aiandyou50/iluli-blind-date/actions
   - "Deploy to Cloudflare Workers" 성공 확인

3. ✅ **커스텀 도메인 연결** (수동)
   - Cloudflare Dashboard → Workers → iluli-worker-prod
   - Triggers → Custom Domains → Add: `aiboop.org`

4. ✅ **Google OAuth 도메인 추가** (수동)
   - https://console.cloud.google.com/apis/credentials
   - 승인된 자바스크립트 원본: `https://aiboop.org`

---

## 💡 참고

- **Workers**: API + Frontend를 단일 Worker에서 제공
- **Pages**: 사용하지 않음 (제거 필요)
- **배포 방식**: GitHub Actions만 사용
- **도메인**: aiboop.org (Workers 커스텀 도메인)

---

**완료 후**: https://aiboop.org 에서 서비스가 정상 작동합니다! 🎊
