// Simplified theme management for single dark theme
export const AVAILABLE_THEMES = [
  {
    name: "tromper",
    label: "Dark Theme",
    description: "Ultra-dark tech theme with neon green accents",
  },
];

const THEME_STORAGE_KEY = "ark-server-manager-theme";
const DEFAULT_THEME = "tromper";

export const getStoredTheme = (): string => {
  return DEFAULT_THEME; // Always return the dark theme
};

export const setTheme = (themeName: string = DEFAULT_THEME): void => {
  if (typeof window === "undefined") return;

  // Always use the dark theme
  const theme = DEFAULT_THEME;

  // Apply theme to HTML element
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);

  // Store theme preference (always dark)
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const initializeTheme = (): void => {
  if (typeof window === "undefined") return;

  // Set the dark theme immediately
  setTheme(DEFAULT_THEME);
};

// Always return true since we only have dark theme
export const isDarkTheme = (themeName: string = DEFAULT_THEME): boolean => {
  return true;
};

// Always return Custom since we only have our custom theme
export const getThemeCategory = (themeName: string = DEFAULT_THEME): string => {
  return "Custom";
};
