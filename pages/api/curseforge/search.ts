import { NextApiRequest, NextApiResponse } from "next";
import {
  CurseForgeAPI,
  CurseForgeAPIError,
  CurseForgeRateLimitError,
  CurseForgeAuthenticationError,
  CurseForgeForbiddenError,
  CurseForgeTimeoutError,
  CurseForgeNetworkError,
} from "@/lib/curseforge-api";
import { modCache } from "@/lib/mod-cache";
import { convertBigIntsToStrings } from "@/lib/json-helpers";
import { info, warn, error, debug } from '../../../lib/logger';

// Request deduplication to prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<any>>();

// Clean up old pending requests every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, promise] of pendingRequests.entries()) {
    // Remove requests older than 2 minutes
    if (promise && (promise as any).timestamp && now - (promise as any).timestamp > 120000) {
      pendingRequests.delete(key);
    }
  }
}, 60000); // Every minute

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  info('[API]', JSON.stringify(req.query));

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract and validate parameters outside try block for error handling access
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
    return res.status(400).json({ error: "Invalid page size (1-50)" });
  }

  // Validate index
  const indexNum = parseInt(index as string);
  if (isNaN(indexNum) || indexNum < 0) {
    return res.status(400).json({ error: "Invalid index" });
  }

  const shouldForceRefresh = forceRefresh === "true";

  try {
    // Normalize categoryId for key generation
    const categoryIdStr = Array.isArray(categoryId) ? categoryId[0] : (categoryId || 'none');

    // Create unique request key for deduplication
    const requestKey = `search_${searchQuery}_${categoryIdStr}_${mappedSortField}_${sortOrder}_${pageSizeNum}_${indexNum}_${shouldForceRefresh}_${Date.now()}`;

    // Check if this request is already pending
    const pendingKey = `search_${searchQuery}_${categoryIdStr}_${mappedSortField}_${sortOrder}_${pageSizeNum}_${indexNum}_${shouldForceRefresh}`;
    if (pendingRequests.has(pendingKey)) {
      info('[API]', 'Request already pending, waiting for result');
      try {
        const result = await pendingRequests.get(pendingKey);
        return res.status(200).json(result);
      } catch (pendingError) {
        warn('[API]', 'Pending request failed: ' + (pendingError instanceof Error ? pendingError.message : String(pendingError)));
      }
    }

    // Create new request promise with timeout
    const requestPromise = Promise.race([
      performSearch(
        searchQuery,
        categoryIdStr,
        mappedSortField,
        sortOrder as "asc" | "desc",
        pageSizeNum,
        index as string,
        shouldForceRefresh
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout after 10 seconds')), 10000)
      )
    ]);

    pendingRequests.set(pendingKey, requestPromise);

    try {
      const result = await requestPromise;
      res.status(200).json(result);
    } finally {
      pendingRequests.delete(pendingKey);
    }

  } catch (err: unknown) {
    error('[API]', 'Search error: ' + (err instanceof Error ? err.message : String(err)));

    // Handle specific error types with enhanced fallback mechanisms
    if (err instanceof CurseForgeRateLimitError) {
      // Try to return cached results as fallback for rate limiting
      try {
        const fallbackResult = await modCache.searchMods(
          searchQuery,
          undefined,
          mappedSortField,
          sortOrder as "asc" | "desc",
          1,
          pageSizeNum
        );
        if (fallbackResult.data && fallbackResult.data.length > 0) {
          const safeData = convertBigIntsToStrings(fallbackResult.data);
          warn('[API]', 'Rate limited, returning cached data as fallback');
          return res.status(200).json({ 
            data: safeData, 
            source: "cache-fallback", 
            warning: "Rate limited, using cached data",
            retryAfter: err.retryAfter 
          });
        }
      } catch (fallbackError: unknown) {
        warn('[API]', 'Fallback cache also failed during rate limit: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
      }

      return res.status(429).json({ 
        error: "Rate limit exceeded", 
        retryAfter: err.retryAfter,
        details: "Too many requests. Please wait before making more requests.",
        fallbackAvailable: false
      });
    }

    if (err instanceof CurseForgeAuthenticationError) {
      return res.status(401).json({ 
        error: "Authentication failed", 
        details: "Invalid API key or authentication required.",
        suggestion: "Please check your CurseForge API key configuration."
      });
    }

    if (err instanceof CurseForgeForbiddenError) {
      return res.status(403).json({ 
        error: "Access forbidden", 
        details: "Insufficient permissions to access this resource.",
        suggestion: "Please verify your API key has the required permissions."
      });
    }

    if (err instanceof CurseForgeTimeoutError || (err instanceof Error && err.message?.includes('timeout'))) {
      // Try to return cached results for timeout errors
      try {
        const fallbackResult = await modCache.searchMods(
          searchQuery,
          undefined,
          mappedSortField,
          sortOrder as "asc" | "desc",
          1,
          pageSizeNum
        );
        if (fallbackResult.data && fallbackResult.data.length > 0) {
          const safeData = convertBigIntsToStrings(fallbackResult.data);
          warn('[API]', 'Timeout occurred, returning cached data as fallback');
          return res.status(200).json({ 
            data: safeData, 
            source: "cache-fallback", 
            warning: "Request timeout, using cached data" 
          });
        }
      } catch (fallbackError: unknown) {
        warn('[API]', 'Fallback cache also failed during timeout: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
      }

      return res.status(408).json({ 
        error: "Request timeout", 
        details: "The request took too long to complete. Please try again.",
        suggestion: "Try reducing the page size or searching for more specific terms."
      });
    }

    if (err instanceof CurseForgeNetworkError) {
      // Try to return cached results for network errors
      try {
        const fallbackResult = await modCache.searchMods(
          searchQuery,
          undefined,
          mappedSortField,
          sortOrder as "asc" | "desc",
          1,
          pageSizeNum
        );
        if (fallbackResult.data && fallbackResult.data.length > 0) {
          const safeData = convertBigIntsToStrings(fallbackResult.data);
          warn('[API]', 'Network error, returning cached data as fallback');
          return res.status(200).json({ 
            data: safeData, 
            source: "cache-fallback", 
            warning: "Network error, using cached data" 
          });
        }
      } catch (fallbackError: unknown) {
        warn('[API]', 'Fallback cache also failed during network error: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
      }

      return res.status(503).json({ 
        error: "Network error", 
        details: "Unable to connect to CurseForge API. Please check your internet connection.",
        suggestion: "Please try again in a few moments."
      });
    }

    if (err instanceof CurseForgeAPIError) {
      return res.status(err.statusCode || 500).json({ 
        error: "CurseForge API error", 
        details: err.message,
        errorCode: err.errorCode,
        suggestion: "Please try again or contact support if the issue persists."
      });
    }

    // Generic error fallback with cache attempt
    try {
      const fallbackResult = await modCache.searchMods(
        searchQuery,
        undefined,
        mappedSortField,
        sortOrder as "asc" | "desc",
        1,
        pageSizeNum
      );
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        const safeData = convertBigIntsToStrings(fallbackResult.data);
        warn('[API]', 'Generic error, returning cached data as fallback');
        return res.status(200).json({ 
          data: safeData, 
          source: "cache-fallback", 
          warning: "API error, using cached data" 
        });
      }
    } catch (fallbackError) {
      warn('[API]', 'Fallback cache also failed during generic error: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
    }

    // Final fallback - return empty results instead of error
    warn('[API]', 'All fallbacks failed, returning empty results');
    res.status(200).json({ 
      data: [], 
      totalCount: 0,
      source: "empty-fallback", 
      warning: "Unable to fetch mods, please try again later" 
    });
  }
}

/**
 * Perform the actual search with caching and API calls
 */
async function performSearch(
  searchQuery: string,
  categoryId: string,
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

  // Fetch from CurseForge API with timeout and retry
  const page = Math.floor(Number(index) / Number(pageSizeNum)) + 1;
  
  info('[API]', 'Fetching from CurseForge API: ' + JSON.stringify({searchQuery, categoryId, mappedSortField, sortOrder, pageSize: pageSizeNum, page}));
  
  try {
    // Add timeout to CurseForge API call
    const result = await Promise.race([
      CurseForgeAPI.searchMods(
        String(searchQuery),
        categoryId && categoryId !== 'none' ? Number(categoryId) : undefined,
        mappedSortField as any,
        sortOrder as any,
        Number(pageSizeNum),
        page
      ),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new CurseForgeTimeoutError()), 8000) // 8 second timeout for CurseForge API
      )
    ]);

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
      } catch (cacheError: unknown) {
        warn('[API] Failed to cache results:', cacheError instanceof Error ? cacheError.message : String(cacheError));
      }
    }

    const safeMods = convertBigIntsToStrings(result?.mods || []);
    return { data: safeMods, totalCount: result?.totalCount || 0, source: "api" };

  } catch (apiError: unknown) {
    error('[API]', 'CurseForge API error: ' + (apiError instanceof Error ? apiError.message : String(apiError)));
    
    // Try to return cached results as fallback, even if expired
    try {
      const fallbackResult = await modCache.searchMods(
        searchQuery,
        undefined,
        mappedSortField,
        sortOrder,
        1,
        pageSizeNum
      );
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        const safeData = convertBigIntsToStrings(fallbackResult.data);
        warn('[API]', 'Returning stale cached data as fallback: ' + JSON.stringify({mods: fallbackResult.data.length}));
        return { data: safeData, totalCount: fallbackResult.totalCount || 0, source: "cache-fallback", warning: "Using cached data due to API error" };
      }
    } catch (fallbackError: unknown) {
      warn('[API]', 'Fallback cache also failed: ' + (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)));
    }

    // Re-throw the original API error if no fallback available
    throw apiError;
  }
}
