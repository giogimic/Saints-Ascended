// Pip-Boy theme management with dark mode support
export const AVAILABLE_THEMES = [
  {
    name: "pipboy",
    label: "Pip-Boy Theme",
    description: "Classic Fallout Pip-Boy green-on-black aesthetic",
  },
];

const THEME_STORAGE_KEY = "ark-server-manager-theme";
const DEFAULT_THEME = "pipboy";

export const getStoredTheme = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const setTheme = (themeName: string = DEFAULT_THEME): void => {
  if (typeof window === "undefined") return;

  const theme = themeName || DEFAULT_THEME;
  const html = document.documentElement;
  
  // Apply DaisyUI theme
  html.setAttribute("data-theme", theme);
  
  // Add dark class for Tailwind dark mode
  html.classList.add("dark");
  
  // Store theme preference
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Handle localStorage errors gracefully
  }
};

export const initializeTheme = (): void => {
  if (typeof window === "undefined") return;

  const storedTheme = getStoredTheme();
  setTheme(storedTheme);
};

// Always return true since we only have dark theme
export const isDarkTheme = (themeName: string = DEFAULT_THEME): boolean => {
  return true;
};

// Always return Pip-Boy since we only have our Pip-Boy theme
export const getThemeCategory = (themeName: string = DEFAULT_THEME): string => {
  return "Pip-Boy";
};

export type Theme = 'matrix' | 'light' | 'dark'

export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: Theme = 'matrix'

  private constructor() {
    // Initialize with matrix theme
    this.loadTheme()
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  public setTheme(theme: Theme): void {
    this.currentTheme = theme
    this.applyTheme(theme)
    this.saveTheme(theme)
  }

  public getTheme(): Theme {
    return this.currentTheme
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark')
    html.removeAttribute('data-theme')
    
    // Apply new theme
    switch (theme) {
      case 'matrix':
        html.classList.add('dark')
        html.setAttribute('data-theme', 'matrix')
        break
      case 'dark':
        html.classList.add('dark')
        html.setAttribute('data-theme', 'dark')
        break
      case 'light':
        html.classList.remove('dark')
        html.setAttribute('data-theme', 'light')
        break
    }
  }

  private loadTheme(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && ['matrix', 'light', 'dark'].includes(savedTheme)) {
        this.currentTheme = savedTheme
      }
      this.applyTheme(this.currentTheme)
    }
  }

  private saveTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  }

  public toggleTheme(): void {
    const themes: Theme[] = ['matrix', 'dark', 'light']
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.setTheme(themes[nextIndex])
  }
}
