import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createContext, useContext } from "react";

export interface GlobalSettings {
  siteTitle: string;
  favicon: string; // Can be emoji or base64 image data
  steamCmdPath: string;
  curseforgeApiKey: string; // CurseForge API key for mod management
  cacheRefreshInterval: number; // Cache refresh interval in hours (default: 5)
  cacheEnabled: boolean; // Whether to enable caching (default: true)
  updatedAt: Date;
}

export interface GlobalSettingsContextType {
  settings: GlobalSettings | null;
  updateSettings: (settings: GlobalSettings) => void;
}

export const GlobalSettingsContext = createContext<GlobalSettingsContextType>({
  settings: null,
  updateSettings: () => {},
});

export const useGlobalSettings = () => useContext(GlobalSettingsContext);

export const DEFAULT_SETTINGS: GlobalSettings = {
  siteTitle: "Saints Ascended",
  favicon: "🦕", // Default dinosaur emoji
  steamCmdPath: "",
  curseforgeApiKey: "",
  cacheRefreshInterval: 5, // 5 hours default
  cacheEnabled: true, // Enable caching by default
  updatedAt: new Date(),
};

const getSettingsPath = () =>
  join(process.cwd(), "data", "global-settings.json");

/**
 * Load global settings from file
 */
export function loadGlobalSettings(): GlobalSettings {
  try {
    const settingsPath = getSettingsPath();

    // Ensure data directory exists
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    if (!existsSync(settingsPath)) {
      // Create default settings file
      saveGlobalSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    const data = readFileSync(settingsPath, "utf-8");
    const settings = JSON.parse(data);

    // Convert date strings back to Date objects
    settings.updatedAt = new Date(settings.updatedAt);

    return settings;
  } catch (error) {
    console.error("Error loading global settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save global settings to file
 */
export function saveGlobalSettings(settings: GlobalSettings): void {
  try {
    const settingsPath = getSettingsPath();
    const dataDir = join(process.cwd(), "data");

    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Update timestamp
    settings.updatedAt = new Date();

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error saving global settings:", error);
    throw new Error("Failed to save global settings");
  }
}

/**
 * Get the global SteamCMD path
 */
export function getGlobalSteamCmdPath(): string {
  const settings = loadGlobalSettings();
  return settings.steamCmdPath;
}

/**
 * Get the global CurseForge API key
 */
export function getGlobalCurseForgeApiKey(): string {
  const settings = loadGlobalSettings();
  return settings.curseforgeApiKey;
}

/**
 * Get the effective CurseForge API key (env or global settings)
 */
export function getEffectiveCurseForgeApiKey(): string {
  if (process.env.CURSEFORGE_API_KEY && process.env.CURSEFORGE_API_KEY.trim() !== "") {
    return process.env.CURSEFORGE_API_KEY.trim();
  }
  return getGlobalCurseForgeApiKey();
}
