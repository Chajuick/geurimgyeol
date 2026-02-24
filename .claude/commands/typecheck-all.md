# typecheck-all

전체 TypeScript 타입체크를 실행합니다.

## 실행

```bash
pnpm check
```

## 오류 처리

- 타입 오류 발생 시 해당 파일과 라인을 명시하여 수정
- `any` 타입 사용 금지 — 정확한 타입으로 교체
- `enum` 대신 문자열 리터럴 유니온 사용
- 경로 별칭 확인: `@/*` → `client/src/*`, `@shared/*` → `shared/*`
