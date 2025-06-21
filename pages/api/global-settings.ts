import type { NextApiRequest, NextApiResponse } from "next";
import {
  loadGlobalSettings,
  saveGlobalSettings,
  GlobalSettings,
} from "@/lib/global-settings";
import { isValidCurseForgeApiKey } from "@/lib/curseforge-api";
import { getCacheBustHeaders } from '@/lib/cache-bust';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add cache-busting headers
  const cacheBustHeaders = getCacheBustHeaders();
  Object.entries(cacheBustHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    switch (req.method) {
      case "GET":
        // Load and return global settings
        const settings = loadGlobalSettings();
        
        // Don't expose the API key in GET requests for security
        const getSafeSettings = {
          ...settings,
          curseforgeApiKey: settings.curseforgeApiKey ? '***CONFIGURED***' : ''
        };
        
        return res.status(200).json(getSafeSettings);

      case "PUT":
        // Update global settings
        const currentSettings = loadGlobalSettings();
        const updates = req.body as Partial<GlobalSettings>;
        
        // Validate CurseForge API key if provided
        if (updates.curseforgeApiKey !== undefined) {
          if (updates.curseforgeApiKey && !isValidCurseForgeApiKey(updates.curseforgeApiKey)) {
            return res.status(400).json({ 
              error: 'Invalid CurseForge API key format. Please provide a valid BCrypt hash or legacy alphanumeric key.' 
            });
          }
        }
        
        // Merge updates with current settings
        const newSettings: GlobalSettings = {
          ...currentSettings,
          ...updates,
          updatedAt: new Date()
        };

        saveGlobalSettings(newSettings);
        
        // Return success response without exposing the API key
        const putSafeSettings = {
          ...newSettings,
          curseforgeApiKey: newSettings.curseforgeApiKey ? '***CONFIGURED***' : ''
        };
        
        return res.status(200).json(putSafeSettings);

      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Global settings API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
