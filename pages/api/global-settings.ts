import type { NextApiRequest, NextApiResponse } from "next";
import {
  loadGlobalSettings,
  saveGlobalSettings,
  GlobalSettings,
} from "@/lib/global-settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        // Load and return global settings
        const settings = loadGlobalSettings();
        return res.status(200).json({ data: settings });

      case "PUT":
        // Update global settings
        const updatedSettings: GlobalSettings = {
          siteTitle: req.body.siteTitle || "Ark Server Manager",
          favicon: req.body.favicon || "🦕",
          steamCmdPath: req.body.steamCmdPath || "",
          cacheRefreshInterval: req.body.cacheRefreshInterval || 5,
          cacheEnabled:
            req.body.cacheEnabled !== undefined ? req.body.cacheEnabled : true,
          updatedAt: new Date(),
        };

        saveGlobalSettings(updatedSettings);
        return res.status(200).json({
          success: true,
          data: updatedSettings,
          message: "Global settings updated successfully",
        });

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
