// pages/api/curseforge/search-optimized.ts
// Strategy 2: Optimized search endpoint with multi-category support and cache warming

import { NextApiRequest, NextApiResponse } from "next";
import { modServiceOptimized } from "@/lib/mod-service-optimized";
import { convertBigIntsToStrings } from "@/lib/json-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      categories, // Comma-separated list of categories
      category, // Single category
      warmCache = "false",
      getStats = "false",
      getWarmingStatus = "false"
    } = req.query;

    // Handle cache warming request
    if (warmCache === "true") {
      await modServiceOptimized.forceWarmAllCategories();
      return res.status(200).json({ 
        success: true, 
        message: "Cache warming initiated" 
      });
    }

    // Handle cache statistics request
    if (getStats === "true") {
      const stats = await modServiceOptimized.getCacheStatistics();
      const safeStats = convertBigIntsToStrings(stats);
      return res.status(200).json({ 
        success: true, 
        data: safeStats 
      });
    }

    // Handle warming status request
    if (getWarmingStatus === "true") {
      const status = modServiceOptimized.getCacheWarmingStatus();
      const safeStatus = convertBigIntsToStrings(status);
      return res.status(200).json({ 
        success: true, 
        data: safeStatus 
      });
    }

    // Handle multi-category search
    if (categories) {
      const categoryList = (categories as string).split(',').map(c => c.trim());
      const results = await modServiceOptimized.searchMultipleCategories(categoryList);
      const safeResults = convertBigIntsToStrings(results);
      
      return res.status(200).json({
        success: true,
        data: safeResults,
        source: "optimized-batch"
      });
    }

    // Handle single category search
    if (category) {
      const result = await modServiceOptimized.searchCategory(category as string);
      const safeResult = convertBigIntsToStrings(result);
      
      return res.status(200).json({
        success: true,
        data: safeResult,
        source: "optimized-single"
      });
    }

    return res.status(400).json({ 
      error: "Please specify 'category' or 'categories' parameter" 
    });

  } catch (error) {
    console.error("Optimized search error:", error);
    
    if (error instanceof Error) {
      const safeError = convertBigIntsToStrings(error);
      return res.status(500).json({
        error: "Failed to search mods",
        details: safeError.message,
      });
    }

    res.status(500).json({ error: "An unexpected error occurred" });
  }
} 