import { PortfolioData } from '@/types';
import { DEFAULT_PORTFOLIO_DATA } from '@/lib/defaultData';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'geurim-gyeol-portfolio';

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData(parsed);
        } else {
          setData(DEFAULT_PORTFOLIO_DATA);
        }
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
        setData(DEFAULT_PORTFOLIO_DATA);
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // 데이터 저장
  const saveData = (newData: PortfolioData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Failed to save portfolio data:', error);
    }
  };

  // JSON 파일로 내보내기
  const exportToJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'geurim-gyeol-portfolio.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // JSON 파일에서 가져오기
  const importFromJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        saveData(imported);
      } catch (error) {
        console.error('Failed to import portfolio data:', error);
      }
    };
    reader.readAsText(file);
  };

  // 데이터 초기화
  const resetData = () => {
    saveData(DEFAULT_PORTFOLIO_DATA);
  };

  return {
    data,
    setData: saveData,
    isLoaded,
    exportToJSON,
    importFromJSON,
    resetData,
  };
}
