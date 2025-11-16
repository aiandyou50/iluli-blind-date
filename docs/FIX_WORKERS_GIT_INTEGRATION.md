# 🔧 Cloudflare Workers Git 연동 비활성화 가이드

## 문제 상황

- ✅ **GitHub Actions**: 정상 배포 (올바름)
- ❌ **Cloudflare Workers**: Git 저장소와 직접 연결되어 자동 빌드 시도 중

### 오류 원인
Cloudflare Workers가 GitHub 저장소와 연결되어 있어서, 코드가 푸시될 때마다:
1. GitHub Actions로 배포 (성공) ✅
2. Cloudflare Workers에서도 자동 빌드 시도 (실패) ❌

루트 디렉토리에 `package.json`이 없어서 빌드가 실패합니다.

---

## ✅ 해결 방법

### 1단계: Cloudflare Workers 설정 페이지 접속

**URL**: https://dash.cloudflare.com/48a09063776ab35c453778ea6ebd0172/workers/services/view/iluli-worker-prod/production/settings

### 2단계: Git 연동 확인 및 비활성화

#### 옵션 A: Deployments 탭에서 확인

1. **Workers & Pages** → **iluli-worker-prod** 선택

2. **Deployments** 탭 클릭

3. **Source** 확인:
   - `Upload` (Wrangler CLI) → ✅ 올바름 (GitHub Actions 사용)
   - `Git` (GitHub 연동) → ❌ 비활성화 필요

#### 옵션 B: Settings 탭에서 Git 연동 제거

1. **Settings** 탭 클릭

2. **Builds & deployments** 섹션 찾기

3. Git 저장소가 연결되어 있다면:
   - **Disconnect repository** 클릭
   - 또는 **Automatic deployments** → **Disable**

#### 옵션 C: Worker를 처음부터 재생성 (마지막 수단)

만약 Git 연동을 끄는 옵션이 없다면:

1. 현재 `iluli-worker-prod` 삭제
2. 터미널에서 다시 배포:
   ```powershell
   cd worker
   npx wrangler deploy --env production
   ```
3. 이후 GitHub Actions만 사용

---

## 🎯 올바른 배포 플로우

### ❌ 현재 (잘못된 상태)
```
GitHub Push
  ↓
  ├─ GitHub Actions → Wrangler Deploy ✅ 성공
  └─ Cloudflare Git 연동 → 빌드 시도 ❌ 실패
```

### ✅ 목표 (올바른 상태)
```
GitHub Push
  ↓
GitHub Actions → Wrangler Deploy ✅
  ↓
Workers 자동 업데이트 ✅
```

**핵심**: Cloudflare에서는 수동 빌드를 하지 않고, GitHub Actions에서 업로드한 결과만 사용합니다.

---

## 📋 확인 방법

### Deployments 탭에서 Source 확인

올바른 상태:
```
Latest deployment
Source: Upload (from Wrangler CLI)
Author: sungyo0518@gmail.com
```

잘못된 상태:
```
Source: Git (from GitHub)
Repository: aiandyou50/iluli-blind-date
```

### GitHub Actions 성공 확인

https://github.com/aiandyou50/iluli-blind-date/actions

- ✅ "Deploy to Cloudflare Workers" 워크플로우 성공
- ✅ Worker가 정상 배포됨

---

## 🚀 완료 후

Git 연동을 비활성화하면:

1. Cloudflare가 더 이상 자동 빌드를 시도하지 않음
2. GitHub Actions에서 업로드한 Worker만 사용
3. 오류 로그가 더 이상 발생하지 않음

---

## 💡 추가 팁

### Worker가 이미 정상 배포되어 있는지 확인

```powershell
# 터미널에서
cd worker
npx wrangler deployments list --name iluli-worker-prod
```

출력 예시 (정상):
```
Created:     2025-11-16T07:XX:XX.XXXZ
Author:      sungyo0518@gmail.com
Source:      Upload
Version(s):  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Worker 접속 테스트

```powershell
curl https://iluli-worker-prod.x00518.workers.dev
```

정상이면 HTML 또는 JSON 응답이 와야 합니다.

---

**완료 후 다음 단계**: 커스텀 도메인 `aiboop.org` 연결!
