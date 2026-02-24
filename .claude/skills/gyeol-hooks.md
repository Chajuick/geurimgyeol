---
name: gyeol-hooks
description: gyeol 커스텀 훅 가이드. Use when creating new hooks or understanding existing hook patterns.
---

# gyeol 커스텀 훅 가이드

## 훅 목록

```
client/src/hooks/
├── useComposition.ts     # IME 입력 조합 처리 (한글 등)
├── useMobile.tsx         # 모바일 반응형 감지
├── usePersistFn.ts       # 함수 레퍼런스 안정화
├── usePortfolio.ts       # 포트폴리오 데이터 관리
└── useResolvedImage.ts   # 이미지 URL 해석 (IndexedDB)
```

## 훅 작성 패턴

```typescript
// hooks/useExample.ts
import { useState, useEffect } from "react";

type UseExampleOptions = {
  initialValue?: string;
};

export function useExample({ initialValue = "" }: UseExampleOptions = {}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // 사이드 이펙트
  }, [initialValue]);

  return { value, setValue };
}
```

## 주요 훅 설명

### `usePortfolio`
포트폴리오 콘텐츠 데이터를 관리합니다. `PortfolioContext`와 연동.

### `useResolvedImage`
IndexedDB(`idb-keyval`)에 저장된 이미지 데이터를 URL로 변환합니다.

### `useComposition`
한글 등 IME 입력 조합 중인지 여부를 추적합니다 (`isComposing` 상태).

### `useMobile`
미디어 쿼리로 모바일 환경 여부를 반환합니다.

## 규칙

- 훅 파일명: `use` 접두사 + camelCase
- 비즈니스 로직은 컴포넌트에서 분리하여 훅으로 작성
- IndexedDB 접근은 `idb-keyval` 사용
