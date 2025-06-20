import React, { useState, useEffect } from "react";
import {
  GlobalSettingsContext,
  GlobalSettings,
  DEFAULT_SETTINGS,
} from "@/lib/global-settings";
import { ErrorHandler } from "@/lib/error-handler";

interface GlobalSettingsProviderProps {
  children: React.ReactNode;
}

export function GlobalSettingsProvider({
  children,
}: GlobalSettingsProviderProps) {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    loadInitialSettings();
  }, []);

  const loadInitialSettings = async () => {
    const result = await ErrorHandler.handleAsync(
      async () => {
        const response = await fetch("/api/global-settings");
        if (!response.ok) {
          throw new Error(
            `Failed to load global settings: ${response.statusText}`
          );
        }
        const data = await response.json();
        return data.data;
      },
      { component: "GlobalSettingsProvider", action: "loadInitialSettings" },
      false // Don't show toast for this error
    );

    if (result.success) {
      setSettings(result.data);
      updateDocumentSettings(result.data);
    } else {
      console.error("Failed to load global settings:", result.error);
      setSettings(DEFAULT_SETTINGS);
      updateDocumentSettings(DEFAULT_SETTINGS);
    }
  };

  const updateSettings = async (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    updateDocumentSettings(newSettings);
  };

  const updateDocumentSettings = (settings: GlobalSettings) => {
    try {
      // Update page title
      document.title = settings.siteTitle;

      // Update favicon
      if (settings.favicon && typeof window !== "undefined") {
        const link =
          (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
          document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = settings.favicon;
        document.getElementsByTagName("head")[0].appendChild(link);
      }
    } catch (error) {
      ErrorHandler.handleError(
        error,
        {
          component: "GlobalSettingsProvider",
          action: "updateDocumentSettings",
        },
        false
      );
    }
  };

  return (
    <GlobalSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}
