import { NextApiRequest, NextApiResponse } from "next";
import {
  installedModsStorage,
  InstalledModMetadata,
} from "@/lib/installed-mods-storage";
import { CurseForgeAPI } from "@/lib/curseforge-api";
import { serverSettingsStorage } from "@/lib/server-settings-storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: serverId } = req.query;

  if (!serverId || typeof serverId !== "string") {
    return res.status(400).json({ error: "Server ID is required" });
  }

  try {
    switch (req.method) {
      case "GET":
        const { setting } = req.query;
        if (setting === 'launchOptions') {
          const launchOptions = await serverSettingsStorage.getSetting(serverId, 'launchOptions');
          return res.status(200).json({ data: { launchOptions } });
        }

        // Get all installed mods for the server
        const mods = await installedModsStorage.getAllMods();
        const stats = await installedModsStorage.getStats();
        return res.status(200).json({
          data: mods,
          stats: stats,
        });

      case "POST":
        const {
          modId,
          curseForgeData,
          isEnabled = true,
          loadOrder = 1,
          launchOptions,
        } = req.body;

        // Handle saving launch options
        if (typeof launchOptions === 'string') {
          await serverSettingsStorage.saveSetting(serverId, 'launchOptions', launchOptions);
          return res.status(200).json({
            message: "Launch options saved successfully",
          });
        }
        
        if (!modId) {
          return res.status(400).json({ error: "Mod ID is required" });
        }

        let modMetadata: InstalledModMetadata;

        if (curseForgeData) {
          // Convert CurseForge data to installed mod metadata
          modMetadata = installedModsStorage.convertCurseForgeToInstalledMod(
            curseForgeData,
            isEnabled,
            loadOrder
          );
        } else {
          // Create basic mod metadata
          modMetadata = {
            id: modId,
            name: `Mod ${modId}`,
            lastUpdated: new Date(),
            installedAt: new Date(),
            isEnabled,
            loadOrder,
            serverId: serverId,
            modId: modId,
          };
        }

        await installedModsStorage.saveMod(modMetadata);
        return res.status(200).json({
          data: modMetadata,
          message: "Mod saved successfully",
        });

      case "PUT":
        // Update mod metadata from CurseForge API
        const { modId: updateModId } = req.body;

        if (!updateModId) {
          return res.status(400).json({ error: "Mod ID is required" });
        }

        try {
          // Fetch fresh data from CurseForge API
          const curseForgeData = await CurseForgeAPI.getModDetails(
            parseInt(updateModId)
          );
          await installedModsStorage.updateModFromCurseForge(
            serverId,
            updateModId,
            curseForgeData
          );

          const updatedMod = await installedModsStorage.getMod(serverId, updateModId);
          return res.status(200).json({
            data: updatedMod,
            message: "Mod metadata updated successfully",
          });
        } catch (error) {
          console.error("Failed to update mod metadata:", error);
          return res.status(500).json({
            error: "Failed to update mod metadata from CurseForge",
          });
        }

      case "DELETE":
        // Remove a mod
        const { modId: deleteModId } = req.body;

        if (!deleteModId) {
          return res.status(400).json({ error: "Mod ID is required" });
        }

        await installedModsStorage.removeMod(serverId, deleteModId);
        return res.status(200).json({
          message: "Mod removed successfully",
        });

      case "PATCH":
        // Update mod status (enabled/disabled, load order)
        const { updates } = req.body;

        if (!Array.isArray(updates)) {
          return res.status(400).json({ error: "Updates array is required" });
        }

        await installedModsStorage.updateModStatuses(updates);
        return res.status(200).json({
          message: "Mod statuses updated successfully",
        });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "PATCH"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Installed mods storage API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
