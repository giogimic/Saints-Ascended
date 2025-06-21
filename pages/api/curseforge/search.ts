import { NextApiRequest, NextApiResponse } from "next";
import {
  CurseForgeAPI,
  CurseForgeAPIError,
  CurseForgeRateLimitError,
  CurseForgeAuthenticationError,
  CurseForgeForbiddenError,
} from "@/lib/curseforge-api";
import { modCache } from "@/lib/mod-cache";
import { convertBigIntsToStrings } from "@/lib/json-helpers";
import { info, warn, error, debug } from '../../../lib/logger';

// Request deduplication to prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<any>>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  info('[API]', JSON.stringify(req.query));

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      query, // ModManager sends 'query'
      searchFilter = "", // Legacy parameter
      categoryId,
      sortBy, // ModManager sends 'sortBy'
      sortField = "popularity", // Legacy parameter
      sortOrder = "desc",
      pageSize = "50",
      index = "0",
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

    // Create request key for deduplication
    const requestKey = `search_${searchQuery}_${categoryId}_${mappedSortField}_${sortOrder}_${pageSizeNum}_${index}_${shouldForceRefresh}`;

    // Check if this request is already pending
    if (pendingRequests.has(requestKey)) {
      info('[API]', 'Request already pending for key: ' + requestKey);
      const result = await pendingRequests.get(requestKey);
      return res.status(200).json(result);
    }

    // Create new request with timeout handling
    const requestPromise = performSearch(
      searchQuery,
      categoryId,
      mappedSortField,
      sortOrder as "asc" | "desc",
      pageSizeNum,
      index as string,
      shouldForceRefresh
    );

    pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return res.status(200).json(result);
    } finally {
      // Clean up pending request
      pendingRequests.delete(requestKey);
    }

  } catch (error) {
    info('[API] /api/curseforge/search error', error instanceof Error ? error.message : String(error));

    // Handle timeout specifically - return empty results instead of error
    if (error instanceof Error && error.message === 'Request timeout') {
      console.warn('⚠️ CurseForge API timeout - returning empty results');
      
      // For development/testing, provide some mock data if no real data is available
      const mockData = process.env.NODE_ENV === 'development' ? [
        {
          id: 1,
          name: "Sample Mod 1",
          slug: "sample-mod-1",
          summary: "A sample mod for testing purposes when CurseForge API is unavailable",
          downloadCount: 1000,
          dateModified: new Date().toISOString(),
          logo: { thumbnailUrl: "/placeholder-mod.png" },
          authors: [{ name: "Test Author" }],
          categories: [{ name: "Testing" }]
        },
        {
          id: 2,
          name: "Sample Mod 2", 
          slug: "sample-mod-2",
          summary: "Another sample mod for testing the UI",
          downloadCount: 500,
          dateModified: new Date().toISOString(),
          logo: { thumbnailUrl: "/placeholder-mod.png" },
          authors: [{ name: "Test Author" }],
          categories: [{ name: "Testing" }]
        }
      ] : [];
      
      return res.status(200).json({
        data: mockData,
        totalCount: mockData.length,
        source: "timeout_fallback",
        message: mockData.length > 0 
          ? "CurseForge API is slow - showing sample data for testing"
          : "CurseForge API is currently slow - cached results will be available soon"
      });
    }

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

    // Handle generic errors - return empty results instead of error
    console.warn('⚠️ CurseForge API error - returning empty results:', error instanceof Error ? error.message : String(error));
    return res.status(200).json({ 
      data: [], 
      totalCount: 0,
      source: "error_fallback",
      message: "CurseForge API is currently unavailable - please try again later"
    });
  }
}

/**
 * Perform the actual search with caching and API calls
 */
async function performSearch(
  searchQuery: string,
  categoryId: string | string[] | undefined,
  mappedSortField: string,
  sortOrder: "asc" | "desc",
  pageSizeNum: number,
  index: string,
  shouldForceRefresh: boolean
) {
  // Try to get from cache first (unless force refresh is requested)
  if (!shouldForceRefresh) {
    try {
      const cachedResult = await modCache.searchMods(
        searchQuery,
        undefined,
        mappedSortField,
        sortOrder,
        1,
        pageSizeNum
      );
      if (cachedResult.data && cachedResult.data.length > 0) {
        const safeData = convertBigIntsToStrings(cachedResult.data);
        info('[API]', 'Returning cached data: ' + JSON.stringify({mods: cachedResult.data.length, totalCount: cachedResult.totalCount}));
        return { data: safeData, source: "cache" };
      }
    } catch (cacheError) {
      warn('[API] Cache error, falling back to API:', cacheError instanceof Error ? cacheError.message : String(cacheError));
    }
  }

  // Fetch from CurseForge API
  const page = Math.floor(Number(index) / Number(pageSizeNum)) + 1;
  
  info('[API]', 'Fetching from CurseForge API: ' + JSON.stringify({searchQuery, categoryId, mappedSortField, sortOrder, pageSize: pageSizeNum, page}));
  
  // Create timeout promise for this specific API call
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
  });
  
  // Race between the API call and timeout
  const result = await Promise.race([
    CurseForgeAPI.searchMods(
      String(searchQuery),
      categoryId ? Number(categoryId) : undefined,
      mappedSortField as any,
      sortOrder as any,
      Number(pageSizeNum),
      page
    ),
    timeoutPromise
  ]) as { mods: any[]; totalCount: number; fromCache?: boolean };

  info('[API]', 'Result: ' + JSON.stringify({mods: result.mods?.length, totalCount: result.totalCount, fromCache: result.fromCache}));

  // Cache the results
  if (result && result.mods && result.mods.length > 0) {
    try {
      await modCache.setSearchResults(
        searchQuery,
        undefined,
        mappedSortField,
        sortOrder,
        1,
        pageSizeNum,
        result.mods,
        result.totalCount
      );
    } catch (cacheError) {
      warn('[API] Failed to cache results:', cacheError instanceof Error ? cacheError.message : String(cacheError));
    }
  }

  const safeMods = convertBigIntsToStrings(result?.mods || []);
  return { data: safeMods, source: "api" };
}
