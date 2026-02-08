import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Download, Upload, RotateCcw } from 'lucide-react';

export default function EditToolbar() {
  const { editMode, exportToJSON, importFromJSON, resetData } =
    usePortfolioContext();

  if (!editMode) return null;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromJSON(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex gap-3 bg-card border border-border rounded-lg p-4 shadow-lg">
      <button
        onClick={exportToJSON}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
        title="포트폴리오를 JSON으로 내보내기"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">내보내기</span>
      </button>

      <label className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-foreground hover:bg-border transition-colors cursor-pointer">
        <Upload className="w-4 h-4" />
        <span className="text-sm font-medium">가져오기</span>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>

      <button
        onClick={() => {
          if (
            window.confirm(
              '정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
            )
          ) {
            resetData();
          }
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
        title="모든 데이터 초기화"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm font-medium">초기화</span>
      </button>
    </div>
  );
}
