import { NextApiRequest, NextApiResponse } from "next";
import { CurseForgeAPI } from "@/lib/curseforge-api";
import { modServiceOptimized } from "@/lib/mod-service-optimized";

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
          // Strategy 2: Include cache warming status
          cacheWarming: modServiceOptimized.getCacheWarmingStatus(),
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
          // Strategy 2: Start cache warming service
          modServiceOptimized.startCacheWarming();
          return res.status(200).json({
            success: true,
            message: "Background mod fetching and cache warming services started",
          });
        } else if (action === "stop") {
          CurseForgeAPI.stopBackgroundFetching();
          // Strategy 2: Stop cache warming service
          modServiceOptimized.stopCacheWarming();
          return res.status(200).json({
            success: true,
            message: "Background mod fetching and cache warming services stopped",
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
