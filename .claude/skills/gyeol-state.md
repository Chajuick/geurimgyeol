---
name: gyeol-state
description: gyeol 전역 상태 관리 가이드. Use when working with global state, adding new context, or understanding data flow.
---

# gyeol 상태 관리 가이드

## 상태 관리 방식

**React Context** 전용 (외부 상태 라이브러리 미사용)

## Context 목록

```
client/src/contexts/
├── PortfolioContext.tsx  # 포트폴리오 데이터 전역 상태
└── ThemeContext.tsx      # 다크/라이트 테마 상태
```

## Context 작성 패턴

```tsx
// contexts/ExampleContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

type ExampleState = {
  value: string;
  setValue: (v: string) => void;
};

const ExampleContext = createContext<ExampleState | null>(null);

export function ExampleProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState("");

  return (
    <ExampleContext.Provider value={{ value, setValue }}>
      {children}
    </ExampleContext.Provider>
  );
}

export function useExample() {
  const ctx = useContext(ExampleContext);
  if (!ctx) throw new Error("ExampleProvider 내부에서 사용하세요");
  return ctx;
}
```

## 테마 관리

`next-themes` + `ThemeContext` 조합으로 다크/라이트 모드 처리.

## 로컬 영속 상태

- IndexedDB: `idb-keyval`로 대용량 데이터(이미지 등) 저장
- 영속 설정값: `localStorage` 또는 `idb-keyval`

## 데이터 흐름

```
PortfolioContext (전역)
  └── 페이지 컴포넌트
        └── 섹션 컴포넌트
              └── UI 컴포넌트
```

## 새 Context 추가 절차

1. `contexts/NewContext.tsx` 생성
2. `App.tsx` 또는 최상위 Provider에 추가
3. `useNew()` 훅으로 하위 컴포넌트에서 접근
