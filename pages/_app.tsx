import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/hooks/useTheme";
import Head from "next/head";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalSettingsProvider } from "@/components/GlobalSettingsProvider";
import { ModalProvider } from "@/components/ModalProvider";

// Import cache refresh service and Strategy 2 optimizations (server-side only)
if (typeof window === "undefined") {
  import("@/lib/cache-refresh-service");
  // Strategy 2: Start optimized cache warming service
  import("@/lib/mod-service-optimized").then(({ modServiceOptimized }) => {
    modServiceOptimized.startCacheWarming();
    console.log("Strategy 2: Cache warming service started");
  });
}

export default function App({ Component, pageProps }: AppProps) {
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
            </Head>
            <Component {...pageProps} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--b2))",
                  color: "hsl(var(--bc))",
                  border: "1px solid hsl(var(--b3))",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                },
                success: {
                  iconTheme: {
                    primary: "hsl(var(--su))",
                    secondary: "hsl(var(--b2))",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "hsl(var(--er))",
                    secondary: "hsl(var(--b2))",
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
