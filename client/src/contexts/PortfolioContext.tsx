import type { PortfolioData } from "@/types";
import React, { createContext, useContext, ReactNode } from "react";

export interface PortfolioContextType {
  data: PortfolioData;
  setData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  isLoaded: boolean;

  editMode: boolean;
  setEditMode: (mode: boolean) => void;

  // zip-only
  exportToZip: () => Promise<void>;
  importFromZip: (file: File) => Promise<void>;

  resetData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolioContext must be used within PortfolioProvider");
  }
  return context;
}

interface PortfolioProviderProps {
  children: ReactNode;
  value: Omit<PortfolioContextType, "editMode" | "setEditMode"> & {
    editMode?: boolean;
    setEditMode?: (mode: boolean) => void;
  };
}

export function PortfolioProvider({ children, value }: PortfolioProviderProps) {
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