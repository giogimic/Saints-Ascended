// Temporarily disabled due to build issues
export default function ThemesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Theme Settings</h1>
      <p>Theme settings temporarily unavailable.</p>
    </div>
  );
}

/*
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { AVAILABLE_THEMES, isDarkTheme, getThemeCategory } from '@/lib/theme-manager';
import { Layout } from '@/components/ui/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function ThemesPage() {
  const { theme: currentTheme, setTheme } = useTheme();

  // Group themes by category
  const themesByCategory = AVAILABLE_THEMES.reduce((acc, theme) => {
    const category = getThemeCategory(theme.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(theme);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_THEMES>);

  return (
    <Layout
      showSidebar={true}
      onAddServer={() => {}}
      onGlobalSettings={() => {}}
      globalSettings={null}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Theme Settings</h1>
        
        {Object.entries(themesByCategory).map(([category, themes]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category} Themes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((themeOption) => (
                <Card
                  key={themeOption.name}
                  variant={themeOption.name === currentTheme ? 'elevated' : 'default'}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    themeOption.name === currentTheme ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setTheme(themeOption.name)}
                >
                  <CardHeader>
                    <CardTitle>{themeOption.label}</CardTitle>
                    <CardDescription>{themeOption.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <div className="badge badge-primary">primary</div>
                      <div className="badge badge-secondary">secondary</div>
                      <div className="badge badge-accent">accent</div>
                      <div className="badge badge-neutral">neutral</div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm">
                      <span className="opacity-70">
                        {isDarkTheme(themeOption.name) ? 'Dark theme' : 'Light theme'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
*/
