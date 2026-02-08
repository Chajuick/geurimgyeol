import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl text-muted-foreground mb-8">
          페이지를 찾을 수 없습니다
        </p>
        <button
          onClick={() => setLocation('/')}
          className="px-8 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
