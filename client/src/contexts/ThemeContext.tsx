import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
const THEME_KEY = "theme";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // ✅ 항상 존재
  switchable: boolean;
  setTheme: (t: Theme) => void; // ✅ 필요할 때 유용
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // ✅ switchable일 때만, mount 후 저장된 테마를 읽어 적용
  useEffect(() => {
    if (!switchable) return;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, [switchable]);

  // ✅ html 루트에 dark 클래스 토글 + (옵션) 저장
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    if (switchable) {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme, switchable]);

  const toggleTheme = useMemo(() => {
    if (!switchable) return () => {}; // ✅ noop
    return () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, [switchable]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}