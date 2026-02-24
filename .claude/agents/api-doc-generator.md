---
name: api-doc-generator
description: Express API 엔드포인트 및 공유 타입 문서 자동 생성. Use when documenting server routes or shared types.
---

# API Doc Generator

## 역할

`server/index.ts`의 Express 라우트와 `shared/` 타입을 분석하여 문서를 생성합니다.

## 분석 대상

- `server/index.ts` — Express 라우트 및 미들웨어
- `shared/const.ts` — 공유 상수
- `client/src/types/` — 클라이언트 타입 정의

## 출력 형식

```markdown
## API 엔드포인트

### GET /*
- 설명: 클라이언트 SPA 서빙
- 응답: index.html

## 공유 상수 (shared/const.ts)
- COOKIE_NAME: "app_session_id"
- ONE_YEAR_MS: 연간 밀리초
```

## 참고

현재 서버는 정적 파일 서빙 전용입니다.
새 API 엔드포인트 추가 시 이 에이전트로 문서를 업데이트하세요.
