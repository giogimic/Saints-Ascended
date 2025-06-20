import React, { createContext, useContext, useEffect } from 'react';
import { initializeTheme, getStoredTheme } from '@/lib/theme-manager';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Use the stored theme or default to pipboy
  const theme = "pipboy";

  // No-op setTheme function for compatibility - we only support dark theme
  const setTheme = (newTheme: string) => {
    // Do nothing - we only support the Pip-Boy theme
  };

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, setTheme } },
    children
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
