import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

import LOGO_IMG from "@/assets/logo/logo.png";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-[100svh] flex flex-col items-center justify-center gyeol-bg px-4 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_35%_at_50%_40%,rgba(129,140,248,0.12),transparent_70%)]"
      />
      <div className="relative text-center">
        <img
          src={LOGO_IMG}
          alt=""
          draggable={false}
          className="mx-auto h-14 w-auto opacity-60"
        />
        <div className="mt-8 gyeol-eyebrow justify-center">404</div>
        <h1 className="mt-3 text-4xl sm:text-5xl">길을 잃었어요</h1>
        <p className="mt-3 text-sm text-white/50">
          찾으시는 페이지가 없거나 옮겨졌어요.
        </p>
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mt-8 inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/15 bg-white/[0.06] text-sm font-medium text-white/85 backdrop-blur transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
