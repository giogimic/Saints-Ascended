// lib/cache-bust.ts
// Cache busting utilities for development and production

/**
 * Generate a cache-busting query parameter
 * In development: uses timestamp
 * In production: uses build time or version
 */
export function getCacheBustParam(): string {
  if (process.env.NODE_ENV === 'development') {
    return `?v=${Date.now()}`;
  }
  
  // In production, use build time or package version
  const buildTime = process.env.BUILD_TIME || Date.now().toString();
  return `?v=${buildTime.replace(/[^0-9]/g, '').slice(-10)}`;
}

/**
 * Add cache-busting parameter to a URL
 */
export function addCacheBust(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
}

/**
 * Generate cache-busting headers for API responses
 */
export function getCacheBustHeaders(): Record<string, string> {
  if (process.env.NODE_ENV === 'development') {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"${Date.now()}"`,
    };
  }
  
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Last-Modified': new Date().toUTCString(),
  };
}

/**
 * Force reload a specific resource by changing its src/href
 */
export function forceReloadResource(selector: string): void {
  if (typeof window !== 'undefined') {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element instanceof HTMLLinkElement && element.href) {
        const url = new URL(element.href);
        url.searchParams.set('v', Date.now().toString());
        element.href = url.toString();
      } else if (element instanceof HTMLScriptElement && element.src) {
        const url = new URL(element.src);
        url.searchParams.set('v', Date.now().toString());
        element.src = url.toString();
      }
    });
  }
}

/**
 * Clear all browser caches programmatically
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window !== 'undefined') {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Force reload stylesheets
    forceReloadResource('link[rel="stylesheet"]');
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reload the page after clearing caches
    window.location.reload();
  }
}

/**
 * Development helper: Add cache-busting to all static assets
 */
export function enableDevCacheBusting(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Add cache busting to all stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      if (link instanceof HTMLLinkElement) {
        const url = new URL(link.href);
        url.searchParams.set('v', Date.now().toString());
        link.href = url.toString();
      }
    });
    
    // Add cache busting to all scripts
    document.querySelectorAll('script[src]').forEach((script) => {
      if (script instanceof HTMLScriptElement) {
        const url = new URL(script.src);
        url.searchParams.set('v', Date.now().toString());
        script.src = url.toString();
      }
    });
  }
} 