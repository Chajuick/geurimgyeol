# build-all

프로덕션 빌드를 실행합니다.

## 실행 순서

1. `pnpm check` - 타입체크 먼저 통과 확인
2. `pnpm build` - Vite(클라이언트) + esbuild(서버) 빌드
3. 빌드 결과 `dist/` 폴더 확인

## 빌드 구조

```
dist/
├── public/    # Vite 클라이언트 빌드 결과
└── index.js   # esbuild 서버 번들
```

## 프로덕션 실행

```bash
pnpm start     # NODE_ENV=production node dist/index.js
```
