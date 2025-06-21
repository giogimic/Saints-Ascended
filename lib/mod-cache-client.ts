// lib/mod-cache-client.ts
// Client-safe mod cache that uses API calls instead of direct database access

import { CurseForgeModData } from "../types/curseforge";

// In-memory cache for client-side use
interface ModCacheEntry {
  data: CurseForgeModData;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
  lastAccessed: number;
}

interface SearchCacheEntry {
  data: CurseForgeModData[];
  totalCount: number;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
  lastAccessed: number;
}

class ModCacheClient {
  private modCache: Map<number, ModCacheEntry> = new Map();
  private searchCache: Map<string, SearchCacheEntry> = new Map();
  
  // Request deduplication - prevent multiple simultaneous requests for the same data
  private pendingRequests: Map<string, Promise<any>> = new Map();

  // Cache TTLs (in milliseconds)
  private readonly MOD_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 2000;
  private readonly MAX_SEARCH_CACHE_SIZE = 500;

  // Base URL for API calls
  private readonly baseUrl: string;

  // Check if we're in a build context (during Next.js build process)
  private readonly isBuildTime: boolean;

  constructor() {
    // Determine base URL based on environment
    if (typeof window === "undefined") {
      // Server-side: use localhost or environment variable
      this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    } else {
      // Client-side: use relative URLs
      this.baseUrl = "";
    }

    // Check if we're in a build context (during Next.js build process)
    this.isBuildTime = process.env.NODE_ENV === 'production' && 
                      (process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-production-optimize');

    // Start cache cleanup interval only if not in build time
    if (!this.isBuildTime) {
      setInterval(() => this.clearExpiredCache(), 5 * 60 * 1000); // Every 5 minutes
    }
  }

  /**
   * Get mod from cache or API
   */
  async getMod(modId: number): Promise<CurseForgeModData | null> {
    try {
      // Check in-memory cache first
      const cached = this.modCache.get(modId);
      if (cached && Date.now() < cached.expiresAt) {
        cached.hitCount++;
        cached.lastAccessed = Date.now();
        return cached.data;
      }

      // Check if request is already pending
      const requestKey = `mod_${modId}`;
      if (this.pendingRequests.has(requestKey)) {
        return await this.pendingRequests.get(requestKey);
      }

      // Create new request
      const requestPromise = this.fetchModFromAPI(modId);
      this.pendingRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(requestKey);
      }
    } catch (error) {
      console.error("Error retrieving mod from cache:", error);
      return null;
    }
  }

  /**
   * Fetch mod from API
   */
  private async fetchModFromAPI(modId: number): Promise<CurseForgeModData | null> {
    // Return early during build time to prevent API calls
    if (this.isBuildTime) {
      console.log(`[modCacheClient] Skipping mod API call during build time for modId: ${modId}`);
      return null;
    }

    const response = await fetch(`${this.baseUrl}/api/curseforge/mods/${modId}`);
    if (response.ok) {
      const modData = await response.json();
      
      // Store in cache
      this.setModInCache(modId, modData);
      return modData;
    }
    return null;
  }

  /**
   * Store mod in cache
   */
  async setMod(mod: CurseForgeModData): Promise<void> {
    try {
      // Store in memory cache
      this.setModInCache(mod.id, mod);

      // Also store via API for server-side persistence
      await fetch(`${this.baseUrl}/api/curseforge/mods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mod)
      });
    } catch (error) {
      console.error("Error storing mod in cache:", error);
    }
  }

  /**
   * Search mods with caching
   */
  async searchMods(
    query: string,
    category: string | undefined,
    sortBy: string,
    sortOrder: string,
    page: number,
    pageSize: number
  ): Promise<{ data: CurseForgeModData[]; totalCount: number } | null> {
    const cacheKey = this.generateSearchCacheKey(
      query,
      category,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    // Check cache first
    const cachedResult = this.getSearchFromCache(cacheKey);
    if (cachedResult) {
      this.updateSearchCacheStats(cacheKey);
      console.log(`[modCacheClient] Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }
    console.log(`[modCacheClient] Cache miss for key: ${cacheKey}`);

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[modCacheClient] Request already pending for key: ${cacheKey}`);
      return await this.pendingRequests.get(cacheKey);
    }

    // Create new request
    const requestPromise = this.fetchSearchFromAPI(cacheKey, query, category, sortBy, sortOrder, page, pageSize);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Fetch search results from API with retry mechanism
   */
  private async fetchSearchFromAPI(
    cacheKey: string,
    query: string,
    category: string | undefined,
    sortBy: string,
    sortOrder: string,
    page: number,
    pageSize: number
  ): Promise<{ data: CurseForgeModData[]; totalCount: number } | null> {
    // Return early during build time to prevent API calls
    if (this.isBuildTime) {
      console.log(`[modCacheClient] Skipping API call during build time for key: ${cacheKey}`);
      return { data: [], totalCount: 0 };
    }

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let url = '';
      try {
        const params = new URLSearchParams({
          searchFilter: query,
          sortField: sortBy,
          sortOrder: sortOrder,
          pageSize: pageSize.toString(),
          index: ((page - 1) * pageSize).toString(),
        });

        if (category) {
          params.append("categoryId", category);
        }

        url = `${this.baseUrl}/api/curseforge/search?${params}`;
        console.log(`[modCacheClient] Fetching from API (attempt ${attempt}/${maxRetries}): ${url}`);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log(`[modCacheClient] Fetch response status: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          this.setSearchInCache(cacheKey, result.mods || [], result.totalCount || 0);
          return { data: result.mods || [], totalCount: result.totalCount || 0 };
        } else {
          console.warn(`[modCacheClient] API request failed with status ${response.status} (attempt ${attempt})`);
          if (attempt === maxRetries) {
            return null;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (error) {
        // Handle network errors gracefully
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        lastError = error instanceof Error ? error : new Error(errorMessage);
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`[modCacheClient] Request timeout for: ${url} (attempt ${attempt})`);
        } else {
          console.warn(`[modCacheClient] Failed to fetch mods from API: ${errorMessage} (attempt ${attempt})`);
        }
        
        if (attempt === maxRetries) {
          console.error(`[modCacheClient] All ${maxRetries} attempts failed for key: ${cacheKey}`);
          return null;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return null;
  }

  /**
   * Get search results from cache
   */
  private getSearchFromCache(cacheKey: string): { data: CurseForgeModData[]; totalCount: number } | null {
    const entry = this.searchCache.get(cacheKey);
    if (entry && Date.now() < entry.expiresAt) {
      return {
        data: entry.data,
        totalCount: entry.totalCount,
      };
    }
    return null;
  }

  /**
   * Update search cache statistics
   */
  private updateSearchCacheStats(cacheKey: string): void {
    const entry = this.searchCache.get(cacheKey);
    if (entry) {
      entry.hitCount++;
      entry.lastAccessed = Date.now();
    }
  }

  /**
   * Set search results in cache
   */
  async setSearchResults(
    query: string,
    category: string | undefined,
    sortBy: string,
    sortOrder: string,
    page: number,
    pageSize: number,
    results: CurseForgeModData[],
    totalCount: number
  ): Promise<void> {
    const cacheKey = this.generateSearchCacheKey(
      query,
      category,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    this.setSearchInCache(cacheKey, results, totalCount);
  }

  /**
   * Get popular mods for a category
   */
  async getPopularMods(category: string, limit: number = 20): Promise<CurseForgeModData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/curseforge/popular?category=${category}&limit=${limit}`);
      if (response.ok) {
        const result = await response.json();
        return result.mods || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching popular mods:", error);
      return [];
    }
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();

    // Clear expired mod cache entries
    for (const [key, entry] of this.modCache.entries()) {
      if (now >= entry.expiresAt) {
        this.modCache.delete(key);
      }
    }

    // Clear expired search cache entries
    for (const [key, entry] of this.searchCache.entries()) {
      if (now >= entry.expiresAt) {
        this.searchCache.delete(key);
      }
    }

    // Enforce cache size limits
    this.enforceCacheSizeLimits();
  }

  /**
   * Enforce cache size limits
   */
  private enforceCacheSizeLimits(): void {
    // Enforce mod cache size limit
    if (this.modCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.modCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = entries.slice(0, this.modCache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.modCache.delete(key));
    }

    // Enforce search cache size limit
    if (this.searchCache.size > this.MAX_SEARCH_CACHE_SIZE) {
      const entries = Array.from(this.searchCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = entries.slice(0, this.searchCache.size - this.MAX_SEARCH_CACHE_SIZE);
      toRemove.forEach(([key]) => this.searchCache.delete(key));
    }
  }

  /**
   * Set mod in memory cache
   */
  private setModInCache(modId: number, mod: CurseForgeModData): void {
    this.modCache.set(modId, {
      data: mod,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.MOD_CACHE_TTL,
      hitCount: 1,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Set search results in memory cache
   */
  private setSearchInCache(
    cacheKey: string,
    results: CurseForgeModData[],
    totalCount: number
  ): void {
    this.searchCache.set(cacheKey, {
      data: results,
      totalCount,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SEARCH_CACHE_TTL,
      hitCount: 1,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Generate cache key for search
   */
  private generateSearchCacheKey(
    query: string,
    category: string | undefined,
    sortBy: string,
    sortOrder: string,
    page: number,
    pageSize: number
  ): string {
    // Match the server-side key format exactly
    const categoryId = category || 'undefined';
    const index = ((page - 1) * pageSize).toString();
    return `search_${query}_${categoryId}_${sortBy}_${sortOrder}_${pageSize}_${index}_false`;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryMods: number;
    memorySearches: number;
  } {
    return {
      memoryMods: this.modCache.size,
      memorySearches: this.searchCache.size,
    };
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.modCache.clear();
    this.searchCache.clear();
    console.log("[modCacheClient] Cache cleared");
  }

  /**
   * Clear pending requests
   */
  clearPendingRequests(): void {
    this.pendingRequests.clear();
    console.log("[modCacheClient] Pending requests cleared");
  }

  /**
   * Clear all cache and pending requests
   */
  clearAll(): void {
    this.clearCache();
    this.clearPendingRequests();
    console.log("[modCacheClient] All cache and pending requests cleared");
  }

  /**
   * Clear specific mod from cache
   */
  clearModCache(modId: number): void {
    this.modCache.delete(modId);
    console.log(`[modCacheClient] Mod cache cleared for ID: ${modId}`);
  }
}

// Export singleton instance
export const modCacheClient = new ModCacheClient(); 