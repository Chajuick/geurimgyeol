# 깃허브 배포 및 파일 기반 데이터 관리 가이드

## 개요

이 가이드는 일러스트레이터 포트폴리오 관리 앱을 깃허브에 배포하고, 파일 기반 데이터 관리 시스템을 사용하는 방법을 설명합니다.

## 프로젝트 구조

```
illustrator-portfolio/
├── public/
│   ├── data/
│   │   └── portfolio.json          # 포트폴리오 데이터 (JSON)
│   └── images/
│       └── projects/               # 프로젝트 이미지 폴더
│           ├── project-001-rough.jpg
│           ├── project-001-lineart.jpg
│           └── ...
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── fileStorage.ts      # 파일 기반 데이터 로딩 유틸리티
│   │   │   ├── store.ts            # Zustand 상태 관리
│   │   │   └── storage.ts          # 기본 유틸리티
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   ├── components/             # UI 컴포넌트
│   │   ├── App.tsx                 # 메인 앱 (파일 로드 로직 포함)
│   │   └── index.css               # 글로벌 스타일
│   └── index.html
├── package.json
└── README.md
```

## 데이터 관리 방식

### 1. 초기 데이터 로드

앱이 시작될 때 `public/data/portfolio.json`에서 데이터를 자동으로 로드합니다.

```typescript
// App.tsx에서
useEffect(() => {
  loadData();  // public/data/portfolio.json 로드
}, [loadData]);
```

### 2. 데이터 수정 및 캐싱

사용자가 UI에서 데이터를 수정하면:

1. Zustand 스토어가 상태를 업데이트
2. 로컬 스토리지에 임시 캐시로 저장
3. 페이지 새로고침 시 로컬 스토리지에서 복원

### 3. 데이터 내보내기 (다운로드)

프로필 페이지에서 "데이터 내보내기" 버튼을 클릭하면:

- 현재 모든 데이터가 JSON 파일로 다운로드됨
- 파일명: `portfolio-backup-YYYY-MM-DD.json`

### 4. 데이터 가져오기 (업로드)

프로필 페이지에서 "데이터 가져오기" 버튼을 클릭하면:

- 이전에 내보낸 JSON 파일을 선택
- 모든 데이터가 복원되고 로컬 스토리지에 저장

## portfolio.json 구조

```json
{
  "projects": [
    {
      "id": "project-001",
      "title": "프로젝트 제목",
      "comment": "간단한 설명",
      "stages": [
        {
          "stage": "rough",
          "enabled": true,
          "imageUrl": "/images/projects/project-001-rough.jpg",
          "description": "단계 설명",
          "order": 1
        }
      ],
      "tools": ["Procreate", "Photoshop"],
      "tags": ["태그1", "태그2"],
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2026-01-15T14:30:00Z"
    }
  ],
  "frames": [...],
  "backgrounds": [...],
  "gallery": {
    "backgroundId": "bg-1",
    "items": [...]
  },
  "profile": {
    "name": "작가명",
    "bio": "자기소개",
    "website": "https://example.com",
    "social": {...}
  }
}
```

## 깃허브 배포 방법

### 1단계: 로컬 저장소 초기화

```bash
cd illustrator-portfolio
git init
git add .
git commit -m "Initial commit: Illustrator Portfolio Manager"
```

### 2단계: 깃허브 저장소 생성

1. [github.com](https://github.com)에 로그인
2. "New repository" 클릭
3. 저장소 이름: `illustrator-portfolio`
4. 설명: "일러스트레이터 포트폴리오 관리 및 전시 앱"
5. "Create repository" 클릭

### 3단계: 원격 저장소 연결

```bash
git remote add origin https://github.com/YOUR_USERNAME/illustrator-portfolio.git
git branch -M main
git push -u origin main
```

### 4단계: 깃허브 Pages 배포

#### 옵션 A: Vercel 사용 (권장)

1. [vercel.com](https://vercel.com)에 접속
2. "Import Project" 클릭
3. GitHub 저장소 선택
4. 배포 설정:
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. "Deploy" 클릭

배포 후 URL: `https://illustrator-portfolio.vercel.app`

#### 옵션 B: GitHub Pages 사용

1. 저장소 Settings → Pages로 이동
2. "Source" → "Deploy from a branch" 선택
3. Branch: `main`, folder: `dist`
4. "Save" 클릭

배포 후 URL: `https://YOUR_USERNAME.github.io/illustrator-portfolio`

#### 옵션 C: Netlify 사용

1. [netlify.com](https://netlify.com)에 접속
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택
4. 배포 설정:
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. "Deploy site" 클릭

## 포트폴리오 데이터 수정 방법

### 방법 1: JSON 파일 직접 편집 (권장)

1. `public/data/portfolio.json` 파일 편집
2. 프로젝트, 프로필 정보 수정
3. 이미지 경로 업데이트
4. 깃허브에 커밋 및 푸시

```bash
git add public/data/portfolio.json
git commit -m "Update portfolio data"
git push
```

### 방법 2: 앱 UI에서 수정 후 내보내기

1. 배포된 앱에 접속
2. 프로젝트 추가/수정
3. 프로필 페이지에서 "데이터 내보내기"
4. 다운로드된 JSON 파일을 `public/data/portfolio.json`으로 저장
5. 깃허브에 커밋 및 푸시

## 이미지 관리

### 이미지 저장 위치

모든 프로젝트 이미지는 `public/images/projects/` 폴더에 저장됩니다.

### 이미지 추가 방법

1. 이미지 파일을 `public/images/projects/` 폴더에 저장
2. `portfolio.json`에서 이미지 경로 업데이트:

```json
{
  "stage": "rough",
  "imageUrl": "/images/projects/project-001-rough.jpg"
}
```

3. 깃허브에 커밋 및 푸시

### 이미지 파일명 규칙

```
{projectId}-{stage}-{description}.{extension}

예시:
- project-001-rough.jpg
- project-001-lineart.jpg
- project-001-final.jpg
- project-002-rough.jpg
```

## 주의사항

### 로컬 스토리지 vs 파일 기반

- **로컬 스토리지**: 브라우저에 임시 캐시로 저장 (페이지 새로고침 시 유지)
- **파일 기반**: `public/data/portfolio.json`에 영구 저장 (모든 사용자가 동일한 데이터 로드)

### 데이터 동기화

1. 앱 시작 시: `public/data/portfolio.json` 로드
2. 사용자 수정: 로컬 스토리지에 캐시
3. 데이터 내보내기: 현재 상태를 JSON으로 다운로드
4. 깃허브 업데이트: 다운로드한 JSON을 `public/data/portfolio.json`으로 저장

### 여러 기기에서 작업할 때

1. 한 기기에서 수정 후 데이터 내보내기
2. `public/data/portfolio.json` 업데이트
3. 깃허브에 푸시
4. 다른 기기에서 깃허브에서 풀 받기

## 트러블슈팅

### Q: 이미지가 안 보여요

**A**: 이미지 경로를 확인하세요.

```json
// 잘못된 경로
"imageUrl": "images/projects/project-001-rough.jpg"

// 올바른 경로
"imageUrl": "/images/projects/project-001-rough.jpg"
```

### Q: 데이터가 로드되지 않아요

**A**: 브라우저 콘솔에서 오류를 확인하세요.

```javascript
// 브라우저 개발자 도구 (F12) → Console
// 오류 메시지 확인
```

### Q: 깃허브에 푸시했는데 변경사항이 안 보여요

**A**: 배포 서비스의 캐시를 초기화하세요.

- **Vercel**: 대시보드에서 "Redeploy" 클릭
- **Netlify**: 대시보드에서 "Clear cache and deploy site" 클릭
- **GitHub Pages**: 몇 분 기다렸다가 새로고침

## 추가 리소스

- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Netlify 배포 가이드](https://docs.netlify.com/)
- [GitHub Pages 배포 가이드](https://pages.github.com/)

---

**작성일**: 2026년 2월 5일  
**버전**: 1.0.0
