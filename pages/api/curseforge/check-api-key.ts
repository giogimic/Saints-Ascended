import { NextApiRequest, NextApiResponse } from "next";
import { CurseForgeAPI } from "@/lib/curseforge-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = CurseForgeAPI.checkApiKeyConfiguration();

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("API key check error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check API key configuration",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
