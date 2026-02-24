# gyeol — Claude Code 개발 가이드

## 패키지 관리

- **항상 `pnpm` 사용** (npm, yarn 절대 금지)
- 의존성 추가: `pnpm add <package>`
- 개발 의존성: `pnpm add -D <package>`

## 개발 워크플로우

```bash
pnpm dev          # 개발 서버 (Vite, port 3000)
pnpm build        # 프로덕션 빌드 (Vite + esbuild)
pnpm check        # 타입체크 (tsc --noEmit)
pnpm format       # 코드 포맷 (Prettier)
pnpm start        # 프로덕션 서버 실행
```

### 작업 순서

1. 코드 작성
2. 타입체크: `pnpm check`
3. 포맷: `pnpm format`
4. 빌드 확인: `pnpm build`

## 프로젝트 구조

```
geurimgyeol/
├── client/               # React 프론트엔드
│   └── src/
│       ├── components/   # UI 컴포넌트 (shadcn/ui 기반)
│       │   ├── ui/       # shadcn/ui 기본 컴포넌트
│       │   ├── entities/ # 도메인 엔티티 컴포넌트
│       │   ├── sidebar/  # 사이드바 컴포넌트
│       │   └── worlds/   # 세계관 관련 컴포넌트
│       ├── pages/        # 페이지 컴포넌트 (wouter 라우팅)
│       ├── hooks/        # 커스텀 훅
│       ├── contexts/     # React Context (전역 상태)
│       ├── types/        # TypeScript 타입 정의
│       ├── lib/          # 유틸리티 함수
│       └── content/      # 정적 콘텐츠
├── server/               # Express 서버 (정적 파일 서빙)
├── shared/               # 공유 타입 및 상수
└── dist/                 # 빌드 결과물
```

## 경로 별칭

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

## 코딩 컨벤션

### TypeScript

- `type` 선호, `interface` 사용 자제
- **`enum` 절대 금지** → 문자열 리터럴 유니온 사용
- `any` 타입 금지 → 정확한 타입 명시
- Zod 스키마로 런타임 검증

### 컴포넌트

- shadcn/ui 컴포넌트를 기반으로 확장
- 새 UI 컴포넌트는 `client/src/components/ui/` 에 위치
- framer-motion으로 애니메이션 처리
- Tailwind CSS v4 클래스 사용

### 상태 관리

- 전역 상태는 React Context 사용 (`contexts/`)
- 서버 상태 없음 (클라이언트 전용 앱)
- IndexedDB 접근은 `idb-keyval` 사용

### 라우팅

- `wouter` 기반 클라이언트 라우팅
- 페이지 컴포넌트는 `pages/` 폴더에 위치

## 금지 사항

- `console.log` 남기지 않기 (개발용 로그 제거 후 커밋)
- `any` 타입 사용 금지
- `enum` 사용 금지
- `npm` 또는 `yarn` 명령 사용 금지
- `.manus-logs/` 폴더 수정 금지 (개발 도구 전용)

## 참고

- shadcn/ui 컴포넌트 설정: `components.json`
- Prettier 설정: `.prettierrc`
- TypeScript 설정: `tsconfig.json`
