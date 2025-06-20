// Theme management system for DaisyUI
export const AVAILABLE_THEMES = [
  { name: 'tromper', label: 'Tromper', description: 'Ultra-dark tech theme with neon green accents' },
  { name: 'light', label: 'Light', description: 'Clean & minimal light theme' },
  { name: 'dark', label: 'Dark', description: 'Clean & minimal dark theme' },
  { name: 'cupcake', label: 'Cupcake', description: 'Soft pastel theme' },
  { name: 'cyberpunk', label: 'Cyberpunk', description: 'Retro-futuristic theme with bright colors' },
  { name: 'synthwave', label: 'Synthwave', description: '80s synthwave aesthetic' },
  { name: 'night', label: 'Night', description: 'Dark theme optimized for night use' },
  { name: 'dracula', label: 'Dracula', description: 'Dark theme based on Dracula color scheme' },
  { name: 'business', label: 'Business', description: 'Professional light theme' },
  { name: 'forest', label: 'Forest', description: 'Dark green nature-inspired theme' }
];

const THEME_STORAGE_KEY = 'ark-server-manager-theme';

export const getStoredTheme = (): string => {
  if (typeof window === 'undefined') return 'tromper';
  return localStorage.getItem(THEME_STORAGE_KEY) || 'tromper';
};

export const setTheme = (themeName: string): void => {
  if (typeof window === 'undefined') return;
  
  // Store theme preference
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
  
  // Apply theme to HTML element
  const html = document.documentElement;
  html.setAttribute('data-theme', themeName);
  
  // Force a re-render by toggling a class
  html.classList.remove('theme-transition');
  void html.offsetWidth; // Trigger reflow
  html.classList.add('theme-transition');
};

export const initializeTheme = (): void => {
  if (typeof window === 'undefined') return;
  
  // Add transition class to HTML element
  document.documentElement.classList.add('theme-transition');
  
  // Set initial theme from storage or default
  const storedTheme = getStoredTheme();
  setTheme(storedTheme);
  
  // Remove transition class after initial theme is set
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 300);
};

// Check if theme is dark
export const isDarkTheme = (themeName: string = getStoredTheme()): boolean => {
  const darkThemes = ['tromper', 'dark', 'cyberpunk', 'synthwave', 'night', 'dracula', 'forest'];
  return darkThemes.includes(themeName);
};

// Get theme category
export const getThemeCategory = (themeName: string = getStoredTheme()): string => {
  if (themeName === 'tromper') return 'Custom';
  return 'DaisyUI';
}; 