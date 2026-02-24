---
name: build-validator
description: 빌드 유효성 검사. 타입체크와 빌드를 순서대로 실행하고 오류를 보고합니다. Use when you need to validate the build before deployment.
---

# Build Validator

## 역할

타입체크 → 빌드 순서로 실행하고 각 단계의 오류를 보고합니다.

## 실행 순서

1. `pnpm check` — TypeScript 타입체크
2. 오류 없으면 `pnpm build` — Vite + esbuild 빌드
3. `dist/` 폴더 존재 확인

## 보고 형식

```
[타입체크] ✅ 통과 / ❌ N개 오류
[빌드] ✅ 성공 / ❌ 오류 내용
[결과] 배포 가능 여부
```

## 오류 처리

- 타입 오류: 파일:라인 형식으로 정확한 위치 보고
- 빌드 오류: Vite/esbuild 오류 메시지 그대로 전달
