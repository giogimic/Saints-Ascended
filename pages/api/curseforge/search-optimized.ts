// pages/api/curseforge/search-optimized.ts
// Enhanced optimized search endpoint with comprehensive coverage and better error handling

import { NextApiRequest, NextApiResponse } from "next";
import { CurseForgeAPI } from "@/lib/curseforge-api";
import { modCache } from "@/lib/mod-cache";
import { convertBigIntsToStrings } from "@/lib/json-helpers";
import { ErrorHandler } from "@/lib/error-handler";

// Unified timeout and retry configuration
const API_TIMEOUT = 25000; // 25 seconds for all operations
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Request deduplication to prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<any>>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      query = "",
      category,
      categories, // Comma-separated list of categories
      sortBy = "popularity",
      sortOrder = "desc",
      pageSize = "20",
      page = "1",
      forceRefresh = "false",
      comprehensive = "true", // Use comprehensive search by default
      warmCache = "false",
      getStats = "false",
      warmingStatus = "false"
    } = req.query;

    // Handle cache warming request
    if (warmCache === "true") {
      await warmCacheForCategories(category as string || "Popular");
      return res.status(200).json({ 
        success: true, 
        message: "Cache warming initiated" 
      });
    }

    // Handle cache statistics request
    if (getStats === "true") {
      const stats = await getCacheStatistics();
      const safeStats = convertBigIntsToStrings(stats);
      return res.status(200).json({ 
        success: true, 
        data: safeStats 
      });
    }

    // Handle warming status request
    if (warmingStatus === "true") {
      const status = getWarmingStatus();
      const safeStatus = convertBigIntsToStrings(status);
      return res.status(200).json({ 
        success: true, 
        data: safeStatus 
      });
    }

    // Validate parameters
    const pageSizeNum = Math.min(parseInt(pageSize as string) || 20, 50);
    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    const shouldForceRefresh = forceRefresh === "true";
    const useComprehensive = comprehensive === "true";

    // Handle multi-category search
    if (categories) {
      const categoryList = (categories as string).split(',').map(c => c.trim());
      const results = await searchMultipleCategories(categoryList, pageSizeNum, useComprehensive);
      const safeResults = convertBigIntsToStrings(results);
      
      return res.status(200).json({
        success: true,
        data: safeResults,
        source: "optimized-batch",
        categories: categoryList
      });
    }

    // Handle single category search with request deduplication
    if (category) {
      const requestKey = `category_${category}_${query}_${sortBy}_${sortOrder}_${pageSizeNum}_${pageNum}_${shouldForceRefresh}_${useComprehensive}`;
      
      // Check if this request is already pending
      if (pendingRequests.has(requestKey)) {
        console.log(`[search-optimized] Request already pending for key: ${requestKey}`);
        const result = await pendingRequests.get(requestKey);
        const safeResult = convertBigIntsToStrings(result);
        
        return res.status(200).json({
          success: true,
          data: safeResult,
          source: "optimized-single-dedup",
          category,
          query: query || "all"
        });
      }

      // Create new request
      const requestPromise = searchSingleCategory(
        category as string, 
        query as string,
        sortBy as string,
        sortOrder as "asc" | "desc",
        pageSizeNum,
        pageNum,
        shouldForceRefresh,
        useComprehensive
      );

      pendingRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        const safeResult = convertBigIntsToStrings(result);
        
        return res.status(200).json({
          success: true,
          data: safeResult,
          source: "optimized-single",
          category,
          query: query || "all"
        });
      } finally {
        // Clean up pending request
        pendingRequests.delete(requestKey);
      }
    }

    // Handle general search
    const searchResult = await performGeneralSearch(
      query as string,
      sortBy as string,
      sortOrder as "asc" | "desc",
      pageSizeNum,
      pageNum,
      shouldForceRefresh,
      useComprehensive
    );

    const safeSearchResult = convertBigIntsToStrings(searchResult);
    return res.status(200).json({
      success: true,
      data: safeSearchResult,
      source: "optimized-search",
      query: query || "all"
    });

  } catch (error) {
    console.error("Optimized search error:", error);
    
    // Use error handler for better error categorization
    const handledError = ErrorHandler.handleError(error, {
      component: 'search-optimized',
      action: 'search',
      timestamp: new Date()
    }, false);

    if (error instanceof Error) {
      const safeError = convertBigIntsToStrings(error);
      return res.status(500).json({
        error: "Failed to search mods",
        details: safeError.message,
        errorType: handledError.type
      });
    }

    res.status(500).json({ error: "An unexpected error occurred" });
  }
}

/**
 * Search multiple categories with comprehensive coverage
 */
async function searchMultipleCategories(
  categories: string[],
  pageSize: number,
  useComprehensive: boolean
): Promise<Record<string, any[]>> {
  const results: Record<string, any[]> = {};
  
  // Batch requests for efficiency
  const promises = categories.map(async (category) => {
    try {
      const data = await searchSingleCategory(
        category,
        "",
        "popularity",
        "desc",
        pageSize,
        1,
        false,
        useComprehensive
      );
      results[category] = data;
    } catch (error) {
      console.error(`Failed to search category ${category}:`, error);
      results[category] = [];
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Search single category with enhanced coverage
 */
async function searchSingleCategory(
  category: string,
  query: string,
  sortBy: string,
  sortOrder: "asc" | "desc",
  pageSize: number,
  page: number,
  forceRefresh: boolean,
  useComprehensive: boolean
): Promise<any[]> {
  try {
    // Map category names to search strategies
    const categoryConfig = getCategoryConfig(category);
    
    if (!categoryConfig) {
      throw new Error(`Unknown category: ${category}`);
    }

    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await modCache.searchMods(
        query || categoryConfig.query || "",
        categoryConfig.categoryId?.toString(),
        sortBy as any,
        sortOrder,
        page,
        pageSize
      );

      if (cached.data && cached.data.length > 0) {
        return cached.data;
      }
    }

    // Use comprehensive search if enabled
    if (useComprehensive) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('CurseForge API timeout')), 15000); // 15 second timeout
        });
        
        const mods = await Promise.race([
          CurseForgeAPI.searchModsComprehensive(
            query || categoryConfig.query || "",
            categoryConfig.categoryId,
            sortBy as any,
            sortOrder,
            pageSize
          ),
          timeoutPromise
        ]);

        // Cache the results
        if (mods && Array.isArray(mods) && mods.length > 0) {
          await modCache.setSearchResults(
            query || categoryConfig.query || "",
            categoryConfig.categoryId?.toString(),
            sortBy,
            sortOrder,
            page,
            pageSize,
            mods,
            mods.length
          );
        }

        return mods || [];
      } catch (apiError) {
        // Handle timeout and API errors gracefully
        if (apiError instanceof Error && apiError.message === 'CurseForge API timeout') {
          console.warn(`⚠️ CurseForge API timeout for category ${category} - returning empty results`);
          return [];
        }
        throw apiError;
      }
    } else {
      try {
        // Use regular search with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('CurseForge API timeout')), 15000); // 15 second timeout
        });
        
        const searchResult = await Promise.race([
          CurseForgeAPI.searchMods(
            query || categoryConfig.query || "",
            categoryConfig.categoryId,
            sortBy as any,
            sortOrder,
            pageSize,
            page,
            false
          ),
          timeoutPromise
        ]);

        // Cache the results
        if (searchResult.mods && Array.isArray(searchResult.mods) && searchResult.mods.length > 0) {
          await modCache.setSearchResults(
            query || categoryConfig.query || "",
            categoryConfig.categoryId?.toString(),
            sortBy,
            sortOrder,
            page,
            pageSize,
            searchResult.mods,
            searchResult.totalCount
          );
        }

        return searchResult.mods || [];
      } catch (apiError) {
        // Handle timeout and API errors gracefully
        if (apiError instanceof Error && apiError.message === 'CurseForge API timeout') {
          console.warn(`⚠️ CurseForge API timeout for category ${category} - returning empty results`);
          return [];
        }
        throw apiError;
      }
    }
  } catch (error) {
    console.error(`Error searching category ${category}:`, error);
    // Return empty array instead of throwing to prevent UI breaks
    return [];
  }
}

/**
 * Perform general search with fallback strategies
 */
async function performGeneralSearch(
  query: string,
  sortBy: string,
  sortOrder: "asc" | "desc",
  pageSize: number,
  page: number,
  forceRefresh: boolean,
  useComprehensive: boolean
): Promise<{ mods: any[]; totalCount: number; hasMore: boolean }> {
  try {
    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await modCache.searchMods(
        query,
        undefined,
        sortBy as any,
        sortOrder,
        page,
        pageSize
      );

      if (cached.data && cached.data.length > 0) {
        return {
          mods: cached.data,
          totalCount: cached.totalCount,
          hasMore: cached.data.length === pageSize
        };
      }
    }

    // Use comprehensive search if enabled
    if (useComprehensive) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('CurseForge API timeout')), 15000); // 15 second timeout
        });
        
        const mods = await Promise.race([
          CurseForgeAPI.searchModsComprehensive(
            query,
            undefined,
            sortBy as any,
            sortOrder,
            pageSize
          ),
          timeoutPromise
        ]);

        // Cache the results
        if (mods && Array.isArray(mods) && mods.length > 0) {
          await modCache.setSearchResults(
            query,
            undefined,
            sortBy,
            sortOrder,
            page,
            pageSize,
            mods,
            mods.length
          );
        }

        return {
          mods: mods || [],
          totalCount: mods?.length || 0,
          hasMore: false
        };
      } catch (apiError) {
        // Handle timeout and API errors gracefully
        if (apiError instanceof Error && apiError.message === 'CurseForge API timeout') {
          console.warn(`⚠️ CurseForge API timeout for query "${query}" - returning empty results`);
          return {
            mods: [],
            totalCount: 0,
            hasMore: false
          };
        }
        throw apiError;
      }
    } else {
      try {
        // Use regular search with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('CurseForge API timeout')), 15000); // 15 second timeout
        });
        
        const searchResult = await Promise.race([
          CurseForgeAPI.searchMods(
            query,
            undefined,
            sortBy as any,
            sortOrder,
            pageSize,
            page,
            false
          ),
          timeoutPromise
        ]);

        // Cache the results
        if (searchResult.mods && Array.isArray(searchResult.mods) && searchResult.mods.length > 0) {
          await modCache.setSearchResults(
            query,
            undefined,
            sortBy,
            sortOrder,
            page,
            pageSize,
            searchResult.mods,
            searchResult.totalCount
          );
        }

        return searchResult;
      } catch (apiError) {
        // Handle timeout and API errors gracefully
        if (apiError instanceof Error && apiError.message === 'CurseForge API timeout') {
          console.warn(`⚠️ CurseForge API timeout for query "${query}" - returning empty results`);
          return {
            mods: [],
            totalCount: 0,
            hasMore: false
          };
        }
        throw apiError;
      }
    }
  } catch (error) {
    console.error("Error performing general search:", error);
    // Return empty results instead of throwing to prevent UI breaks
    return {
      mods: [],
      totalCount: 0,
      hasMore: false
    };
  }
}

/**
 * Get category configuration for enhanced search
 */
function getCategoryConfig(category: string): { query?: string; categoryId?: number } | null {
  const configs: Record<string, { query?: string; categoryId?: number }> = {
    "Popular": { query: "" },
    "QoL": { query: "quality of life" },
    "Maps": { categoryId: 17 },
    "RPG": { query: "rpg progression" },
    "Overhauls": { query: "overhaul total conversion" },
    "General": { query: "utility building" },
    "Custom Cosmetics": { query: "cosmetic decoration" },
    "Performance": { query: "performance optimization" },
    "UI": { query: "user interface hud" },
    "Automation": { query: "automation auto" },
    "Building": { query: "building construction" },
    "Combat": { query: "combat weapons" },
    "Creatures": { query: "creatures dinosaurs" },
    "Technology": { query: "technology advanced" },
    "Magic": { query: "magic spells" },
    "Transportation": { query: "transportation vehicles" },
    "Farming": { query: "farming agriculture" },
    "Crafting": { query: "crafting recipes" },
    "Storage": { query: "storage organization" },
    "Lighting": { query: "lighting illumination" }
  };

  return configs[category] || null;
}

/**
 * Warm cache for specific categories
 */
async function warmCacheForCategories(category: string): Promise<void> {
  try {
    console.log(`Warming cache for category: ${category}`);
    
    // Warm popular mods for the category
    await searchSingleCategory(
      category,
      "",
      "popularity",
      "desc",
      20,
      1,
      false,
      true
    );

    // Warm recent mods for the category
    await searchSingleCategory(
      category,
      "",
      "updated",
      "desc",
      20,
      1,
      false,
      true
    );

    console.log(`Cache warming completed for category: ${category}`);
  } catch (error) {
    console.error(`Failed to warm cache for category ${category}:`, error);
  }
}

/**
 * Get cache statistics
 */
async function getCacheStatistics(): Promise<Record<string, any>> {
  try {
    const stats = modCache.getCacheStats();
    return {
      ...stats,
      timestamp: new Date().toISOString(),
      cacheHealth: "healthy"
    };
  } catch (error) {
    console.error("Error getting cache statistics:", error);
    return {
      error: "Failed to get cache statistics",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get warming status
 */
function getWarmingStatus(): Record<string, any> {
  return {
    isWarming: false,
    lastWarmed: new Date().toISOString(),
    status: "idle"
  };
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY_BASE
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}