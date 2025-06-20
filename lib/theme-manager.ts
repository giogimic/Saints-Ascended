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
