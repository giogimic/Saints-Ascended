// lib/mod-cache-client.ts
// Strategy 1: Client-side caching with TTL for mod search results

interface CachedSearchResult {
  data: any[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface BatchRequest {
  category: string;
  params: URLSearchParams;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
}

class ModCacheClient {
  private cache = new Map<string, CachedSearchResult>();
  private batchQueue: BatchRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // 50ms batch delay
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_SIZE_LIMIT = 100; // Maximum cache entries

  // Generate cache key from search parameters
  private getCacheKey(category: string, params: URLSearchParams): string {
    const sortedParams = Array.from(params.entries()).sort();
    return `${category}:${sortedParams.map(([k, v]) => `${k}=${v}`).join('&')}`;
  }

  // Check if cached data is still valid
  private isValidCache(cached: CachedSearchResult): boolean {
    return Date.now() - cached.timestamp < cached.ttl;
  }

  // Clean up expired cache entries
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Limit cache size by removing oldest entries
  private limitCacheSize(): void {
    if (this.cache.size > this.CACHE_SIZE_LIMIT) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 20% of entries
      const removeCount = Math.floor(this.CACHE_SIZE_LIMIT * 0.2);
      for (let i = 0; i < removeCount; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  // Get cached data or return null if not found/expired
  getCached(category: string, params: URLSearchParams): any[] | null {
    const key = this.getCacheKey(category, params);
    const cached = this.cache.get(key);
    
    if (cached && this.isValidCache(cached)) {
      return cached.data;
    }
    
    // Clean up expired entry
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  // Set cache data with TTL
  setCache(category: string, params: URLSearchParams, data: any[], ttl: number = this.DEFAULT_TTL): void {
    const key = this.getCacheKey(category, params);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Periodic cleanup
    this.cleanupExpiredEntries();
    this.limitCacheSize();
  }

  // Batch multiple requests together
  async searchWithBatching(category: string, params: URLSearchParams): Promise<any[]> {
    // Check cache first
    const cached = this.getCached(category, params);
    if (cached) {
      return cached;
    }

    // Add to batch queue
    return new Promise<any[]>((resolve, reject) => {
      this.batchQueue.push({ category, params, resolve, reject });
      
      // Set batch timeout if not already set
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.BATCH_DELAY);
      }
    });
  }

  // Process batched requests
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue.length = 0;
    this.batchTimeout = null;

    // Group by unique requests to avoid duplicates
    const uniqueRequests = new Map<string, BatchRequest[]>();
    
    for (const request of batch) {
      const key = this.getCacheKey(request.category, request.params);
      if (!uniqueRequests.has(key)) {
        uniqueRequests.set(key, []);
      }
      uniqueRequests.get(key)!.push(request);
    }

    // Execute unique requests
    const promises = Array.from(uniqueRequests.entries()).map(async ([key, requests]) => {
      const { category, params } = requests[0];
      
      try {
        const response = await fetch(`/api/curseforge/search?${params}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to load ${category} mods`);
        }

        const data = await response.json();
        
        if (data.data) {
          // Cache the result
          this.setCache(category, params, data.data);
          
          // Resolve all matching requests
          requests.forEach(req => req.resolve(data.data));
        } else {
          throw new Error(data.error || `Failed to load ${category} mods`);
        }
      } catch (error) {
        // Reject all matching requests
        requests.forEach(req => req.reject(error as Error));
      }
    });

    await Promise.allSettled(promises);
  }

  // Pre-fetch popular categories for better UX
  async prefetchPopularCategories(): Promise<void> {
    const popularCategories = [
      { category: "Popular", params: new URLSearchParams({ query: "", sortBy: "popularity", sortOrder: "desc", pageSize: "20" }) },
      { category: "QoL", params: new URLSearchParams({ query: "quality of life", sortBy: "popularity", sortOrder: "desc", pageSize: "20" }) },
      { category: "Maps", params: new URLSearchParams({ categoryId: "17", sortBy: "popularity", sortOrder: "desc", pageSize: "20" }) }
    ];

    // Pre-fetch in background without waiting
    popularCategories.forEach(({ category, params }) => {
      // Only pre-fetch if not already cached
      if (!this.getCached(category, params)) {
        this.searchWithBatching(category, params).catch(() => {
          // Silently fail pre-fetching
        });
      }
    });
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const modCacheClient = new ModCacheClient(); 