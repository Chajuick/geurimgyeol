---
name: gyeol-testing
description: gyeol 프로젝트 테스트 가이드. Use when writing tests for hooks, utilities, or components.
---

# gyeol 테스트 가이드

## 테스트 도구

- **vitest** — 테스트 프레임워크 (Vite 기반)
- 테스트 파일: `*.test.ts` 또는 `*.test.tsx`

## 실행

```bash
pnpm vitest run      # 1회 실행
pnpm vitest          # watch 모드
pnpm vitest run --reporter=verbose  # 상세 출력
```

## 테스트 파일 위치

테스트 파일은 테스트 대상 파일 옆에 위치시킵니다:

```
hooks/
├── usePortfolio.ts
├── usePortfolio.test.ts   # 같은 폴더
```

## 커스텀 훅 테스트 패턴

```typescript
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePortfolio } from "@/hooks/usePortfolio";

describe("usePortfolio", () => {
  it("초기 상태 반환", () => {
    const { result } = renderHook(() => usePortfolio());
    expect(result.current).toBeDefined();
  });
});
```

## 참고

- `tsconfig.json`에서 `**/*.test.ts`는 타입체크 제외
- IndexedDB 테스트 시 vitest의 jsdom 환경 설정 필요
