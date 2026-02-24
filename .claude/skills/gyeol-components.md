---
name: gyeol-components
description: gyeol UI 컴포넌트 패턴 가이드. Use when creating or modifying UI components, especially shadcn/ui based ones.
---

# gyeol 컴포넌트 가이드

## 컴포넌트 구조

```
client/src/components/
├── ui/           # shadcn/ui 기본 컴포넌트 (직접 수정 주의)
├── entities/     # 도메인 엔티티 컴포넌트
├── sidebar/      # 사이드바 레이아웃 관련
├── worlds/       # 세계관(World) 관련 컴포넌트
├── Navigation.tsx
├── Map.tsx
├── ImageUpload.tsx
├── StoredImage.tsx
├── ResolvedBg.tsx
└── ErrorBoundary.tsx
```

## shadcn/ui 사용 원칙

- `ui/` 폴더의 기본 컴포넌트를 **그대로** 사용하거나 래핑하여 확장
- `components.json` 설정 기반으로 shadcn/ui 컴포넌트 추가: `pnpm dlx shadcn@latest add <컴포넌트>`
- 직접 수정이 필요하면 `ui/` 외부에 래퍼 컴포넌트 생성

## 컴포넌트 작성 패턴

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CardProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

export function Card({ title, className, children }: CardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
```

## 애니메이션

framer-motion 사용:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

## 이미지 처리

- `StoredImage` — IndexedDB에 저장된 이미지 표시
- `ResolvedBg` — 배경 이미지 처리
- `ImageUpload` — 이미지 업로드 컴포넌트

## 아이콘

`lucide-react` 및 `react-icons` 사용:

```tsx
import { Settings } from "lucide-react";
import { FiUser } from "react-icons/fi";
```
