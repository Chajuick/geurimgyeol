# lint-fix

Prettier로 코드 포맷을 자동 수정합니다.

## 실행

```bash
# 전체 포맷
pnpm format

# 특정 파일 포맷
pnpm prettier --write client/src/components/Navigation.tsx
```

## Prettier 설정 (.prettierrc)

- `semi`: true
- `singleQuote`: false (double quotes)
- `tabWidth`: 2
- `trailingComma`: "es5"
- `printWidth`: 80
- `endOfLine`: "lf"
