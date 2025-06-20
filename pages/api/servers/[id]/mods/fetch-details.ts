import { NextApiRequest, NextApiResponse } from "next";
import {
  installedModsStorage,
  InstalledModMetadata,
} from "@/lib/installed-mods-storage";
import { CurseForgeAPI } from "@/lib/curseforge-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: serverId } = req.query;
  const { modId } = req.body;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!serverId || typeof serverId !== "string") {
    return res.status(400).json({ error: "Server ID is required" });
  }

  if (!modId || typeof modId !== "string") {
    return res.status(400).json({ error: "Mod ID is required" });
  }

  try {
    const curseforge = new CurseForgeAPI();
    const modDetails = await CurseForgeAPI.getModDetails(parseInt(modId, 10));

    if (!modDetails) {
      return res
        .status(404)
        .json({ error: `Mod with ID ${modId} not found on CurseForge` });
    }

    const existingMod = await installedModsStorage.getMod(modId);

    if (!existingMod) {
      // This can happen in a race condition, but we can still create the entry.
      // The manual add should have already created a stub.
      console.warn(`Mod ${modId} not found in storage for server ${serverId} during detail fetch, but proceeding.`);
    }

    const updatedModData: InstalledModMetadata = {
      ...(existingMod || { // Create a stub if it doesn't exist
        id: modId,
        name: modDetails.name,
        isEnabled: true,
        loadOrder: 999, // Or some default
        installedAt: new Date(),
      }),
      name: modDetails.name,
      summary: modDetails.summary,
      lastUpdated: new Date(modDetails.dateModified),
      downloadCount: modDetails.downloadCount,
      thumbsUpCount: modDetails.thumbsUpCount,
      logoUrl: modDetails.logo?.thumbnailUrl,
      author: modDetails.authors.map(a => a.name).join(', '),
      websiteUrl: modDetails.links.websiteUrl,
    };

    await installedModsStorage.saveMod(updatedModData);

    res.status(200).json({
      message: "Successfully updated mod details",
      data: updatedModData,
    });
  } catch (error: any) {
    console.error(
      `Failed to fetch details for mod ${modId} on server ${serverId}:`,
      error
    );
    res.status(500).json({
      error: "Failed to fetch mod details",
      details: error.message,
    });
  }
} 