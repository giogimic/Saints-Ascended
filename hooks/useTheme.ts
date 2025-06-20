import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { initializeTheme } from "@/lib/theme-manager";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always use the dark theme
  const theme = "tromper";

  // No-op setTheme function for compatibility
  const setTheme = (newTheme: string) => {
    // Do nothing - we only support the dark theme
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
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
