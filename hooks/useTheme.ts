import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeTheme, getStoredTheme, ThemeManager, Theme } from '@/lib/theme-manager';

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
  const [theme, setTheme] = useState<Theme>('matrix');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const themeManager = ThemeManager.getInstance();
    setTheme(themeManager.getTheme());
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const themeManager = ThemeManager.getInstance();
    themeManager.toggleTheme();
    setTheme(themeManager.getTheme());
  };

  const setThemeValue = (newTheme: Theme) => {
    const themeManager = ThemeManager.getInstance();
    themeManager.setTheme(newTheme);
    setTheme(newTheme);
  };

  // Return default values during SSR
  if (!mounted) {
    return {
      theme: 'matrix' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      mounted: false
    };
  }

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    mounted
  };
}
