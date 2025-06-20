import { NextApiRequest, NextApiResponse } from "next";
import { findServerById } from "@/lib/server-storage";
import { ServerManager } from "@/lib/server-manager";
import type { ServerStatus } from "@/types/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id: serverId } = req.query;

  if (typeof serverId !== "string") {
    return res.status(400).json({ error: "Invalid server ID" });
  }

  try {
    // Check if server exists
    const server = await findServerById(serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Get server status from ServerManager
    const status = ServerManager.getServerStatus(serverId);

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Failed to get server status:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
