// components/ui/DevCacheControls.tsx
// Development-only cache control utilities
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { clearAllCaches, forceReloadResource, getCacheBustParam } from '@/lib/cache-bust';

interface DevCacheControlsProps {
  show?: boolean;
}

export function DevCacheControls({ show = process.env.NODE_ENV === 'development' }: DevCacheControlsProps) {
  const [cacheInfo, setCacheInfo] = useState({
    buildTime: '',
    cacheBustParam: '',
    lastClearTime: '',
  });

  useEffect(() => {
    if (show) {
      setCacheInfo({
        buildTime: process.env.BUILD_TIME || 'Unknown',
        cacheBustParam: getCacheBustParam(),
        lastClearTime: localStorage.getItem('lastCacheClear') || 'Never',
      });
    }
  }, [show]);

  const handleClearAllCaches = async () => {
    try {
      await clearAllCaches();
      localStorage.setItem('lastCacheClear', new Date().toLocaleString());
      setCacheInfo(prev => ({
        ...prev,
        lastClearTime: new Date().toLocaleString(),
      }));
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  };

  const handleReloadCSS = () => {
    forceReloadResource('link[rel="stylesheet"]');
    console.log('🎨 CSS stylesheets reloaded');
  };

  const handleReloadJS = () => {
    window.location.reload();
  };

  if (!show) return null;

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 z-50 max-w-sm">
      <div className="text-sm space-y-2">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
          🛠️ Dev Cache Controls
        </h3>
        
        <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <div>Build: {cacheInfo.buildTime.slice(-8)}</div>
          <div>Cache Param: {cacheInfo.cacheBustParam}</div>
          <div>Last Clear: {cacheInfo.lastClearTime}</div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={handleReloadCSS}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            🎨 Reload CSS
          </Button>
          
          <Button
            size="sm"
            onClick={handleReloadJS}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
          >
            🔄 Reload Page
          </Button>
          
          <Button
            size="sm"
            onClick={handleClearAllCaches}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            🗑️ Clear All Caches
          </Button>
        </div>

        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          <div>Shortcut: Ctrl+Shift+F5</div>
          <div>Auto cache-bust: ON</div>
        </div>
      </div>
    </Card>
  );
} 