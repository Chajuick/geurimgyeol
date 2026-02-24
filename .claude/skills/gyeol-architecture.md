---
name: gyeol-architecture
description: gyeol 프로젝트 전체 아키텍처 가이드. Use when understanding project structure, adding new features, or deciding where to place new files.
---

# gyeol 아키텍처

## 프로젝트 개요

**gyeol**은 React 19 + Vite 기반의 클라이언트 사이드 앱입니다.
Express 서버는 정적 파일 서빙 전용으로만 사용됩니다.

## 기술 스택

| 계층 | 기술 |
|------|------|
| UI | React 19, shadcn/ui, Radix UI |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | framer-motion |
| 라우팅 | wouter |
| 상태 | React Context |
| 폼 | react-hook-form + Zod |
| 로컬 저장소 | idb-keyval (IndexedDB) |
| 빌드 | Vite |
| 서버 | Express (정적 파일만) |

## 폴더 구조 원칙

```
client/src/
├── components/      # 재사용 UI 컴포넌트
│   ├── ui/          # shadcn/ui 원본 컴포넌트 (수정 주의)
│   ├── entities/    # 도메인 엔티티 시각화
│   ├── sidebar/     # 사이드바 관련
│   └── worlds/      # 세계관 관련 컴포넌트
├── pages/           # 라우트별 페이지 (wouter)
├── hooks/           # 커스텀 훅 (비즈니스 로직)
├── contexts/        # 전역 상태 (React Context)
├── types/           # TypeScript 타입 정의
├── lib/             # 유틸리티 함수
└── content/         # 정적 콘텐츠 데이터
```

## 경로 별칭

- `@/` → `client/src/`
- `@shared/` → `shared/`

## 새 파일 배치 기준

| 파일 유형 | 위치 |
|----------|------|
| 도메인 컴포넌트 | `components/entities/` |
| 페이지 | `pages/` |
| 비즈니스 로직 훅 | `hooks/` |
| 전역 상태 | `contexts/` |
| 공유 타입/상수 | `shared/` |
| 유틸리티 | `lib/` |
