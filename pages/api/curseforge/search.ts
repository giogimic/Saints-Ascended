import { NextApiRequest, NextApiResponse } from "next";
import {
  CurseForgeAPI,
  CurseForgeAPIError,
  CurseForgeRateLimitError,
  CurseForgeAuthenticationError,
  CurseForgeForbiddenError,
} from "@/lib/curseforge-api";
import { modCache } from "@/lib/mod-cache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      query, // ModManager sends 'query'
      searchFilter = "", // Legacy parameter
      categoryId,
      sortBy, // ModManager sends 'sortBy'
      sortField = "name", // Legacy parameter
      sortOrder = "asc",
      pageSize = "20",
      forceRefresh = "false",
    } = req.query;

    // Use query parameter from ModManager, fallback to searchFilter
    const searchQuery = (query as string) || (searchFilter as string) || "";

    // Map sortBy to sortField for compatibility
    const mappedSortField =
      sortBy === "downloads"
        ? "popularity"
        : sortBy === "featured"
          ? "name"
          : (sortField as string);

    // Validate sortField
    const validSortFields = ["name", "popularity", "size", "updated"];
    if (!validSortFields.includes(mappedSortField)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }

    // Validate sortOrder
    const validSortOrders = ["asc", "desc"];
    if (!validSortOrders.includes(sortOrder as string)) {
      return res.status(400).json({ error: "Invalid sort order" });
    }

    // Validate pageSize
    const pageSizeNum = parseInt(pageSize as string);
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
      return res
        .status(400)
        .json({ error: "Page size must be between 1 and 50" });
    }

    // Check if we should force refresh
    const shouldForceRefresh = forceRefresh === "true";

    // Try to get from cache first (unless force refresh is requested)
    if (!shouldForceRefresh) {
      const cachedResult = await modCache.searchMods(
        searchQuery,
        undefined,
        mappedSortField,
        sortOrder as "asc" | "desc",
        1,
        pageSizeNum
      );
      if (cachedResult.data && cachedResult.data.length > 0) {
        return res
          .status(200)
          .json({ data: cachedResult.data, source: "cache" });
      }
    }

    // Fetch from CurseForge API
    const mods = await CurseForgeAPI.searchMods(
      searchQuery,
      categoryId ? parseInt(categoryId as string) : undefined,
      mappedSortField as "name" | "popularity" | "size" | "updated",
      sortOrder as "asc" | "desc",
      pageSizeNum
    );

    // Cache the results
    if (mods && mods.length > 0) {
      await modCache.setSearchResults(
        searchQuery,
        undefined,
        mappedSortField,
        sortOrder as "asc" | "desc",
        1,
        pageSizeNum,
        mods,
        mods.length
      );
    }

    res.status(200).json({ data: mods, source: "api" });
  } catch (error) {
    console.error("CurseForge search error:", error);

    // Handle specific CurseForge API errors
    if (error instanceof CurseForgeAuthenticationError) {
      return res.status(401).json({
        error: "Authentication failed. Please check your CurseForge API key.",
        details: error.message,
      });
    }

    if (error instanceof CurseForgeForbiddenError) {
      return res.status(403).json({
        error: "Access forbidden. Please check your API key permissions.",
        details: error.message,
      });
    }

    if (error instanceof CurseForgeRateLimitError) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait before making more requests.",
        retryAfter: error.retryAfter,
        details: error.message,
      });
    }

    if (error instanceof CurseForgeAPIError) {
      return res.status(error.statusCode).json({
        error: "CurseForge API error",
        statusCode: error.statusCode,
        details: error.message,
      });
    }

    // Handle generic errors
    if (error instanceof Error) {
      return res.status(500).json({
        error: "Failed to search CurseForge mods",
        details: error.message,
      });
    }

    res.status(500).json({ error: "An unexpected error occurred" });
  }
}
