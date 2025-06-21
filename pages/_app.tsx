import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/hooks/useTheme";
import Head from "next/head";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalSettingsProvider } from "@/components/GlobalSettingsProvider";
import { ModalProvider } from "@/components/ModalProvider";
import { useEffect } from "react";
import { enableDevCacheBusting } from "@/lib/cache-bust";

// Initialize server-side services only on the server and not during build
if (typeof window === "undefined") {
  // Check if we're in a build context (during Next.js build process)
  const isBuildTime = process.env.NODE_ENV === 'production' && 
                     (process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-production-optimize');

  if (!isBuildTime) {
    import("@/lib/server-init").then(({ initializeServerServices }) => {
      initializeServerServices().catch((error) => {
        console.error("Failed to initialize server services:", error);
      });
    });
  }
}

export default function App({ Component, pageProps }: AppProps) {
  // Enable cache busting in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      enableDevCacheBusting();
      
      // Add development cache-busting keyboard shortcut
      const handleKeyDown = (event: KeyboardEvent) => {
        // Ctrl+Shift+F5 for force cache clear
        if (event.ctrlKey && event.shiftKey && event.key === 'F5') {
          event.preventDefault();
          console.log('🔄 Force clearing all caches...');
          import('@/lib/cache-bust').then(({ clearAllCaches }) => {
            clearAllCaches();
          });
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <ErrorBoundary>
      <GlobalSettingsProvider>
        <ThemeProvider>
          <ModalProvider>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <title>Saints Ascended</title>
              {/* Add cache-busting meta tags for development */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
                  <meta httpEquiv="Pragma" content="no-cache" />
                  <meta httpEquiv="Expires" content="0" />
                </>
              )}
            </Head>
            <Component {...pageProps} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                },
                success: {
                  iconTheme: {
                    primary: "hsl(var(--primary))",
                    secondary: "hsl(var(--background))",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "hsl(var(--destructive))",
                    secondary: "hsl(var(--background))",
                  },
                },
              }}
            />
          </ModalProvider>
        </ThemeProvider>
      </GlobalSettingsProvider>
    </ErrorBoundary>
  );
}
