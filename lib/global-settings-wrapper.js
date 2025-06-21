// JavaScript wrapper for global settings functionality
// This allows Node.js scripts to access the global settings without TypeScript compilation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SETTINGS = {
  siteTitle: "Saints Ascended",
  favicon: "🦕",
  steamCmdPath: "",
  curseforgeApiKey: "",
  cacheRefreshInterval: 5,
  cacheEnabled: true,
  updatedAt: new Date(),
};

const getSettingsPath = () =>
  path.join(process.cwd(), "data", "global-settings.json");

/**
 * Load global settings from file
 */
function loadGlobalSettings() {
  try {
    const settingsPath = getSettingsPath();

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(settingsPath)) {
      // Create default settings file
      saveGlobalSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    const data = fs.readFileSync(settingsPath, "utf-8");
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
function saveGlobalSettings(settings) {
  try {
    const settingsPath = getSettingsPath();
    const dataDir = path.join(process.cwd(), "data");

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Update timestamp
    settings.updatedAt = new Date();

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error saving global settings:", error);
    throw new Error("Failed to save global settings");
  }
}

/**
 * Get the global CurseForge API key
 */
function getGlobalCurseForgeApiKey() {
  const settings = loadGlobalSettings();
  return settings.curseforgeApiKey;
}

/**
 * Get the effective CurseForge API key (Global Settings first, then env as fallback)
 * Prioritizes Global Settings over environment variables
 */
function getEffectiveCurseForgeApiKey() {
  // First try Global Settings (primary source)
  const globalApiKey = getGlobalCurseForgeApiKey();
  if (globalApiKey && globalApiKey.trim() !== "") {
    return globalApiKey.trim();
  }
  
  // Fallback to environment variable (for backward compatibility)
  if (process.env.CURSEFORGE_API_KEY && process.env.CURSEFORGE_API_KEY.trim() !== "") {
    return process.env.CURSEFORGE_API_KEY.trim();
  }
  
  return null;
}

export {
  loadGlobalSettings,
  saveGlobalSettings,
  getGlobalCurseForgeApiKey,
  getEffectiveCurseForgeApiKey,
  DEFAULT_SETTINGS
}; 