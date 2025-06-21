import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/hooks/useTheme";
import Head from "next/head";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalSettingsProvider } from "@/components/GlobalSettingsProvider";
import { ModalProvider } from "@/components/ModalProvider";

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
