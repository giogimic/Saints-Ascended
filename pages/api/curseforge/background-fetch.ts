import { NextApiRequest, NextApiResponse } from "next";
import { CurseForgeAPI } from "@/lib/curseforge-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        // Get status of background fetching service
        const status = {
          isRunning: CurseForgeAPI.isBackgroundFetching(),
          tokenBucket: CurseForgeAPI.getTokenBucketStatus(),
          canMakeRequest: CurseForgeAPI.canMakeRequest(),
          rateLimited: CurseForgeAPI.isRateLimited(),
        };

        return res.status(200).json({
          success: true,
          data: status,
        });

      case "POST":
        // Start background fetching service
        const { action } = req.body;

        if (action === "start") {
          CurseForgeAPI.startBackgroundFetching();
          return res.status(200).json({
            success: true,
            message: "Background mod fetching service started",
          });
        } else if (action === "stop") {
          CurseForgeAPI.stopBackgroundFetching();
          return res.status(200).json({
            success: true,
            message: "Background mod fetching service stopped",
          });
        } else {
          return res.status(400).json({
            success: false,
            error: "Invalid action. Use 'start' or 'stop'",
          });
        }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Background fetch API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
