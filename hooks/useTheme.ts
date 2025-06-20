import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getStoredTheme, setTheme as setThemeInManager } from '@/lib/theme-manager';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(getStoredTheme());

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    setThemeInManager(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  return React.createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 