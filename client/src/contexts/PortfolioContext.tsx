import { PortfolioData } from '@/types';
import { createContext, useContext, ReactNode } from 'react';

interface PortfolioContextType {
  data: PortfolioData;
  setData: (data: PortfolioData) => void;
  isLoaded: boolean;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  exportToJSON: () => void;
  exportToSingleJSON: () => void;
  importFromJSON: (file: File) => void;
  resetData: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error(
      'usePortfolioContext must be used within PortfolioProvider'
    );
  }
  return context;
}

interface PortfolioProviderProps {
  children: ReactNode;
  value: Omit<PortfolioContextType, 'editMode' | 'setEditMode'> & {
    editMode?: boolean;
    setEditMode?: (mode: boolean) => void;
  };
}

export function PortfolioProvider({
  children,
  value,
}: PortfolioProviderProps) {
  const contextValue: PortfolioContextType = {
    ...value,
    editMode: value.editMode ?? false,
    setEditMode: value.setEditMode ?? (() => {}),
  };

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
}
