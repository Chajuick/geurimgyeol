---
name: test-runner
description: vitest 테스트 실행 및 결과 분석. Use when running tests and analyzing failures.
---

# Test Runner

## 역할

vitest 테스트를 실행하고 실패 원인을 분석합니다.

## 실행

```bash
# 전체 테스트 (1회)
pnpm vitest run

# 특정 파일
pnpm vitest run <파일경로>
```

## 분석 항목

- 실패한 테스트 파일 및 케이스 목록
- 오류 메시지 및 예상/실제 값 비교
- 타입 오류로 인한 테스트 실패 여부 구분

## 보고 형식

```
[통과] N개
[실패] N개
  - 파일: 오류 원인 요약
[전체] 테스트 커버리지 (가능한 경우)
```
