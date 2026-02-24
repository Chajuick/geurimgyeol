# test-module

특정 모듈 또는 컴포넌트의 테스트를 실행합니다.

## 사용법

```
/test-module [대상 파일 또는 폴더]
```

## 실행

```bash
# 전체 테스트
pnpm vitest run

# 특정 파일 테스트
pnpm vitest run client/src/hooks/usePortfolio.test.ts

# watch 모드
pnpm vitest
```

## 참고

- 테스트 파일은 `*.test.ts` 또는 `*.test.tsx` 패턴
- `tsconfig.json`에서 테스트 파일은 타입체크 제외됨 (`**/*.test.ts`)
