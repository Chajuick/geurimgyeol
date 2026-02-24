---
name: gyeol-routing
description: gyeol 라우팅 구조 가이드. Use when adding new pages or modifying navigation.
---

# gyeol 라우팅 가이드

## 라우팅 라이브러리

**wouter** — 가벼운 React 라우터 (React Router 대체)

## 페이지 구조

```
client/src/pages/
├── Home.tsx
├── Characters.tsx
├── Creatures.tsx
├── Worlds.tsx
├── Profile.tsx
├── NotFound.tsx
└── world-detail/     # 세계관 상세 페이지
```

## wouter 사용 패턴

```tsx
import { Route, Switch, Link, useLocation, useRoute } from "wouter";

// App.tsx에서 라우트 정의
<Switch>
  <Route path="/" component={Home} />
  <Route path="/worlds" component={Worlds} />
  <Route path="/worlds/:id" component={WorldDetail} />
  <Route component={NotFound} />
</Switch>

// 링크
<Link href="/worlds">세계관 보기</Link>

// 프로그래매틱 이동
const [, navigate] = useLocation();
navigate("/worlds");

// 파라미터
const [match, params] = useRoute("/worlds/:id");
```

## 새 페이지 추가 절차

1. `pages/` 폴더에 `NewPage.tsx` 생성
2. `App.tsx`의 `<Switch>`에 `<Route>` 추가
3. `Navigation.tsx`에 링크 추가 (필요 시)

## 404 처리

`NotFound.tsx` — Switch의 마지막 `<Route>`로 처리
