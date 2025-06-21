import { prisma } from "./database";
import { CurseForgeModData } from "../types/curseforge";
import { info, warn, error, debug } from './logger';

// Database bypass mode - set to false to enable full database functionality
const BYPASS_SQLITE_FOR_API = false; // Enable full database functionality

// In-memory cache for mods
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

class ModCacheService {
  private inMemoryCache: Map<string, ModCacheEntry | SearchCacheEntry> = new Map();
  private dbAvailable: boolean = false;
  private readonly MOD_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 2000;
  private readonly MAX_SEARCH_CACHE_SIZE = 500;
  private initializationPromise: Promise<void> | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeDatabase();
    return this.initializationPromise;
  }

  private async _initializeDatabase(): Promise<void> {
    if (BYPASS_SQLITE_FOR_API) {
      warn('[DB]', 'SQLite bypass mode enabled - using in-memory cache only for testing');
      this.dbAvailable = false;
      this.startCacheCleanup();
      return;
    }

    try {
      // Try to connect to database with timeout
      const connectionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 5000); // Reduced from 10s to 5s
      });

      await Promise.race([
        prisma.$connect(),
        connectionTimeout
      ]);
      
      // Test database connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      
      // Verify the mod table exists and is accessible
      const testQuery = await prisma.mod.findFirst({
        take: 1,
        select: { id: true }
      });
      
      this.dbAvailable = true;
      info('[DB]', 'Database connection established successfully');
      
      // Start cache cleanup interval
      this.startCacheCleanup();
    } catch (err) {
      warn('[DB]', 'Database connection failed, using in-memory cache only: ' + (err instanceof Error ? err.message : String(err)));
      this.dbAvailable = false;
      
      // Still start cache cleanup for in-memory cache
      this.startCacheCleanup();
    }
  }

  private startCacheCleanup(): void {
    // Clean up expired cache entries every 5 minutes
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.clearExpiredMemoryCache();
    }, 5 * 60 * 1000);
  }

  async getMod(modId: number): Promise<CurseForgeModData | null> {
    try {
      // Check in-memory cache first (always fastest)
      const cached = this.inMemoryCache.get(`mod_${modId}`) as ModCacheEntry;
      if (cached && Date.now() < cached.expiresAt) {
        cached.hitCount++;
        cached.lastAccessed = Date.now();
        debug('[CACHE]', `Memory cache hit for mod ${modId}`);
        return cached.data;
      }

      // Skip database operations if bypass mode is enabled or database is unavailable
      if (BYPASS_SQLITE_FOR_API || !this.dbAvailable) {
        debug('[CACHE]', `Cache miss for mod ${modId} (${BYPASS_SQLITE_FOR_API ? 'SQLite bypass enabled' : 'database unavailable'})`);
        return null;
      }

      // Ensure database is initialized (non-blocking check)
      if (!this.initializationPromise) {
        debug('[CACHE]', `Database not initialized for mod ${modId}`);
        return null;
      }

      // Try database if available (with timeout protection)
        try {
        const dbTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), 2000); // 2 second timeout
        });

        const dbQuery = prisma.mod.findUnique({
            where: { id: modId },
            include: {
              categories: true,
              screenshots: true,
              authors: true
            }
          });

        const dbMod = await Promise.race([dbQuery, dbTimeout]) as any;

          if (dbMod && Date.now() < new Date(dbMod.lastUpdated).getTime() + this.MOD_CACHE_TTL) {
            const modData = this.convertDbToCurseForge(dbMod);
            // Store in memory cache for faster future access
            this.setModInMemoryCache(modId, modData);
            debug('[CACHE]', `Database cache hit for mod ${modId}`);
            return modData;
          }
        } catch (dbError) {
          warn('[CACHE]', `Database error for mod ${modId}, falling back to memory: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }

      debug('[CACHE]', `Cache miss for mod ${modId}`);
      return null;
    } catch (err) {
      error('[CACHE]', 'Error retrieving mod from cache: ' + (err instanceof Error ? err.message : String(err)));
      return null;
    }
  }

  async setMod(mod: CurseForgeModData): Promise<void> {
    try {
      // Always store in memory cache (fast and non-blocking)
      this.setModInMemoryCache(mod.id, mod);

      // Skip database operations if bypass mode is enabled
      if (BYPASS_SQLITE_FOR_API || !this.dbAvailable) {
        debug('[CACHE]', `Stored mod ${mod.id} in memory only (SQLite bypass enabled)`);
        return;
      }

      // Store in database (make it awaitable for proper error handling)
      if (this.dbAvailable) {
        try {
          await this.storeModInDatabase(mod);
          debug('[CACHE]', `Successfully stored mod ${mod.id} in database`);
        } catch (dbError) {
          warn('[CACHE]', `Failed to store mod ${mod.id} in database: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
          // Don't throw - just log the error so memory cache still works
        }
      }
    } catch (err) {
      error('[CACHE]', 'Error storing mod in cache: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  /**
   * Enhanced search with analytics and better caching
   */
  async searchMods(
    query: string,
    category?: string,
    sortBy: string = "popularity",
    sortOrder: string = "desc",
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: CurseForgeModData[]; totalCount: number }> {
    try {
      // Ensure database is initialized
      await this.initializeDatabase();

      const cacheKey = this.generateSearchCacheKey(
        query,
        category,
        sortBy,
        sortOrder,
        page,
        pageSize
      );

      // Check in-memory cache first
      const memoryEntry = this.inMemoryCache.get(cacheKey) as SearchCacheEntry;
      if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
        // Update hit count and last accessed
        memoryEntry.hitCount++;
        memoryEntry.lastAccessed = Date.now();
        debug('[CACHE]', `Memory search cache hit for: ${cacheKey}`);
        return {
          data: memoryEntry.data,
          totalCount: memoryEntry.totalCount,
        };
      }

      // Try database search if available
      if (this.dbAvailable) {
        try {
          const searchResults = await this.performDatabaseSearch(
            query,
            category,
            sortBy,
            sortOrder,
            page,
            pageSize
          );

          if (searchResults.data.length > 0) {
            // Store results in memory cache
            this.setSearchInMemoryCache(cacheKey, searchResults.data, searchResults.totalCount);
            debug('[CACHE]', `Database search results for: ${cacheKey}, found ${searchResults.data.length} mods`);
            return searchResults;
          }
        } catch (dbError) {
          warn('[CACHE]', `Database search error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
        }
      }

      debug('[CACHE]', `No cached results found for: ${cacheKey}`);
      return { data: [], totalCount: 0 };
    } catch (err) {
      error('[CACHE]', 'Error in searchMods: ' + (err instanceof Error ? err.message : String(err)));
      return { data: [], totalCount: 0 };
    }
  }

  /**
   * Enhanced search results storage with analytics
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
    try {
      // Ensure database is initialized
      await this.initializeDatabase();

      const cacheKey = this.generateSearchCacheKey(
        query,
        category,
        sortBy,
        sortOrder,
        page,
        pageSize
      );

      // Store in memory cache
      this.setSearchInMemoryCache(cacheKey, results, totalCount);

      // Store individual mods in cache
      for (const mod of results) {
        await this.setMod(mod);
      }

      // Update search analytics if database is available
      if (this.dbAvailable) {
        try {
          await this.updateSearchAnalytics(query, category, totalCount);
        } catch (dbError) {
          warn('[CACHE]', `Failed to update search analytics: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
        }
      }

      debug('[CACHE]', `Cached search results for: ${cacheKey}, ${results.length} mods`);
    } catch (err) {
      error('[CACHE]', 'Error storing search results: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  /**
   * Store mod in database with error handling
   */
  private async storeModInDatabase(mod: CurseForgeModData): Promise<void> {
    if (!this.dbAvailable) return;

    try {
      const expiresAt = new Date(Date.now() + this.MOD_CACHE_TTL);
      const popularityScore = this.calculatePopularityScore(mod);
      const searchKeywords = this.generateSearchKeywords(mod);

      await prisma.mod.upsert({
        where: { id: mod.id },
        update: {
          name: mod.name,
          summary: mod.summary || '',
          downloadCount: mod.downloadCount || 0,
          popularityScore,
          searchKeywords,
          lastUpdated: new Date(mod.dateModified || Date.now()),
          isAvailable: true,
        },
        create: {
          id: mod.id,
          gameId: mod.gameId || 83374, // ARK: Survival Ascended game ID
          name: mod.name,
          slug: mod.slug || '',
          summary: mod.summary || '',
          status: mod.status || 4,
          downloadCount: mod.downloadCount || 0,
          isFeatured: mod.isFeatured || false,
          primaryCategoryId: mod.primaryCategoryId || 0,
          classId: mod.classId || 0,
          dateCreated: new Date(mod.dateCreated || Date.now()),
          dateModified: new Date(mod.dateModified || Date.now()),
          dateReleased: mod.dateReleased ? new Date(mod.dateReleased) : null,
          allowModDistribution: mod.allowModDistribution ?? true,
          gamePopularityRank: mod.gamePopularityRank || null,
          isAvailable: true,
          thumbsUpCount: mod.thumbsUpCount || 0,
          popularityScore,
          searchKeywords,
          lastUpdated: new Date(mod.dateModified || Date.now()),
        },
      });

      // Store relations (temporarily disabled for debugging)
      // await this.storeModRelations(mod);
      debug('[CACHE]', `Stored basic mod data for ${mod.id}, skipping relations for now`);
    } catch (err) {
      throw new Error(`Failed to store mod ${mod.id} in database: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Perform database search with enhanced filtering
   */
  private async performDatabaseSearch(
    query: string,
    category?: string,
    sortBy: string = "popularity",
    sortOrder: string = "desc",
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: CurseForgeModData[]; totalCount: number }> {
    try {
      const skip = (page - 1) * pageSize;
      
      // Build where clause
      const where: any = {
        isAvailable: true,
      };

      if (query.trim()) {
        where.OR = [
          { name: { contains: query } },
          { summary: { contains: query } },
          { searchKeywords: { contains: query.toLowerCase() } },
        ];
      }

      if (category) {
        where.categories = {
          some: {
            name: { contains: category }
          }
        };
      }

      // Build order by clause
      const orderBy: any = {};
      switch (sortBy) {
        case 'popularity':
          orderBy.popularityScore = sortOrder;
          break;
        case 'downloads':
          orderBy.downloadCount = sortOrder;
          break;
        case 'updated':
          orderBy.lastUpdated = sortOrder;
          break;
        case 'name':
        default:
          orderBy.name = sortOrder;
          break;
      }

      // Get total count
      const totalCount = await prisma.mod.count({ where });

      // Get mods
      const mods = await prisma.mod.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          links: true,
          categories: true,
          authors: true,
          logo: true,
          screenshots: true,
          latestFiles: {
            include: {
              hashes: true,
              gameVersions: true,
              sortableGameVersions: true,
              dependencies: true,
              modules: true,
            },
          },
          latestFilesIndexes: true,
        },
      });

      // Convert to CurseForge format
      const curseForgeMods = mods.map((mod: any) => this.convertDbToCurseForge(mod));

      return {
        data: curseForgeMods,
        totalCount,
      };
    } catch (err) {
      error("Error performing database search:", err instanceof Error ? err.message : String(err));
      return { data: [], totalCount: 0 };
    }
  }

  /**
   * Calculate popularity score for a mod
   */
  private calculatePopularityScore(mod: CurseForgeModData): number {
    const downloadWeight = 0.6;
    const thumbsUpWeight = 0.3;
    const featuredWeight = 0.1;

    const downloadScore = Math.log10(mod.downloadCount + 1) / 6; // Normalize to 0-1
    const thumbsUpScore = Math.log10(mod.thumbsUpCount + 1) / 4; // Normalize to 0-1
    const featuredScore = mod.isFeatured ? 1 : 0;

    return (
      downloadScore * downloadWeight +
      thumbsUpScore * thumbsUpWeight +
      featuredScore * featuredWeight
    );
  }

  /**
   * Generate search keywords for a mod
   */
  private generateSearchKeywords(mod: CurseForgeModData): string {
    const keywords = [
      mod.name.toLowerCase(),
      mod.summary.toLowerCase(),
      ...mod.categories.map(cat => cat.name.toLowerCase()),
      ...mod.authors.map(author => author.name.toLowerCase()),
    ];

    // Remove common words and duplicates
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const filteredKeywords = keywords
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index);

    return filteredKeywords.join(' ');
  }

  /**
   * Update search analytics
   */
  private async updateSearchAnalytics(
    searchTerm: string,
    category: string | undefined,
    resultCount: number
  ): Promise<void> {
    try {
      if (!this.dbAvailable) return;

      await (prisma as any).modSearchAnalytics.upsert({
        where: {
          searchTerm_category: {
            searchTerm,
            category: category || "",
          },
        },
        update: {
          resultCount,
          searchCount: { increment: 1 },
          lastSearched: new Date(),
          avgResultCount: resultCount,
        },
        create: {
          searchTerm,
          category: category || "",
          resultCount,
          searchCount: 1,
          lastSearched: new Date(),
          avgResultCount: resultCount,
        },
      });
    } catch (err) {
      error("Error updating search analytics:", err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Update mod access analytics
   */
  private async updateModAccessAnalytics(modId: number): Promise<void> {
    try {
      if (!this.dbAvailable) return;

      // Update last accessed time
      await (prisma.mod as any).update({
        where: { id: modId },
        data: { lastUpdated: new Date() },
      });
    } catch (err) {
      error("Error updating mod access analytics:", err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Update popular mods tracking
   */
  private async updatePopularModsTracking(mod: CurseForgeModData): Promise<void> {
    try {
      if (!this.dbAvailable) return;

      // Update for each category
      for (const category of mod.categories) {
        await (prisma as any).popularMods.upsert({
          where: {
            category_modId: {
              category: category.name,
              modId: mod.id,
            },
          },
          update: {
            popularityScore: this.calculatePopularityScore(mod),
            lastUpdated: new Date(),
          },
          create: {
            category: category.name,
            modId: mod.id,
            name: mod.name,
            popularityScore: this.calculatePopularityScore(mod),
            lastUpdated: new Date(),
          },
        });
      }
    } catch (err) {
      error("Error updating popular mods tracking:", err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Get popular mods by category
   */
  async getPopularMods(category: string, limit: number = 20): Promise<CurseForgeModData[]> {
    try {
      if (!this.dbAvailable) return [];

      const popularMods = await (prisma as any).popularMods.findMany({
        where: { category },
        orderBy: { popularityScore: 'desc' },
        take: limit,
      });

      const modIds = popularMods.map((pm: any) => pm.modId);
      return await this.getModsByIds(modIds);
    } catch (err) {
      error("Error getting popular mods:", err instanceof Error ? err.message : String(err));
      return [];
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    try {
      if (!this.dbAvailable) return;

      const now = new Date();

      // Clear expired mod cache entries
      await prisma.modCache.deleteMany({
        where: { expiresAt: { lt: now } },
      });

      // Clear old search analytics (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await (prisma as any).modSearchAnalytics.deleteMany({
        where: { lastSearched: { lt: thirtyDaysAgo } },
      });

      // Clear memory cache
      this.clearExpiredMemoryCache();
    } catch (err) {
      error("Error clearing expired cache:", err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Clear expired memory cache entries
   */
  private clearExpiredMemoryCache(): void {
    const now = Date.now();

    // Clear expired mod cache
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.inMemoryCache.delete(key);
      }
    }

    // Enforce size limits
    if (this.inMemoryCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.inMemoryCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const toDelete = entries.slice(0, this.inMemoryCache.size - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.inMemoryCache.delete(key));
    }
  }

  /**
   * Get multiple mods by IDs
   */
  async getModsByIds(modIds: number[]): Promise<CurseForgeModData[]> {
    if (!modIds || modIds.length === 0) {
      return [];
    }

    // Use the CurseForge API bulk endpoint for efficiency
    try {
      const { CurseForgeAPI } = await import('./curseforge-api');
      const mods = await CurseForgeAPI.getModsByIds(modIds);
      return mods as CurseForgeModData[];
    } catch (error) {
      console.error('Failed to get mods by IDs from API, falling back to individual calls:', error);
      
      // Fallback to individual calls if bulk fails
      const results: CurseForgeModData[] = [];
      for (const modId of modIds) {
        const mod = await this.getMod(modId);
        if (mod) {
          results.push(mod);
        }
      }
      return results;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryMods: number;
    memorySearches: number;
    databaseMods: number;
    databaseSearches: number;
  } {
    return {
      memoryMods: this.inMemoryCache.size,
      memorySearches: 0, // Search cache is not stored in memory
      databaseMods: 0, // Would need to query database
      databaseSearches: 0, // Would need to query database
    };
  }

  private setModInMemoryCache(modId: number, mod: CurseForgeModData): void {
    if (this.inMemoryCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.inMemoryCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.inMemoryCache.delete(oldestKey);
      }
    }

    this.inMemoryCache.set(`mod_${modId}`, {
      data: mod,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.MOD_CACHE_TTL,
      hitCount: 0,
      lastAccessed: Date.now(),
    } as ModCacheEntry);
  }

  private setSearchInMemoryCache(
    cacheKey: string,
    results: CurseForgeModData[],
    totalCount: number
  ): void {
    if (this.inMemoryCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.inMemoryCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.inMemoryCache.delete(oldestKey);
      }
    }

    this.inMemoryCache.set(cacheKey, {
      data: results,
      totalCount,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SEARCH_CACHE_TTL,
      hitCount: 0,
      lastAccessed: Date.now(),
    } as SearchCacheEntry);
  }

  private generateSearchCacheKey(
    query: string,
    category: string | undefined,
    sortBy: string,
    sortOrder: string,
    page: number,
    pageSize: number
  ): string {
    return `${query}:${category || "all"}:${sortBy}:${sortOrder}:${page}:${pageSize}`;
  }

  private convertDbToCurseForge(dbMod: any): CurseForgeModData {
    return {
      id: dbMod.id,
      gameId: dbMod.gameId,
      name: dbMod.name,
      slug: dbMod.slug,
      links: dbMod.links || {
        websiteUrl: "",
        wikiUrl: "",
        issuesUrl: "",
        sourceUrl: "",
      },
      summary: dbMod.summary || "",
      status: dbMod.status,
      downloadCount: dbMod.downloadCount,
      isFeatured: dbMod.isFeatured,
      primaryCategoryId: dbMod.primaryCategoryId,
      categories:
        dbMod.categories?.map((cat: any) => ({
          id: cat.categoryId,
          gameId: cat.gameId,
          name: cat.name,
          slug: cat.slug,
          url: cat.url || "",
          iconUrl: cat.iconUrl || "",
          dateModified: cat.dateModified.toISOString(),
          isClass: cat.isClass,
          classId: cat.classId || 0,
          parentCategoryId: cat.parentCategoryId || 0,
          displayIndex: cat.displayIndex || 0,
        })) || [],
      classId: dbMod.classId,
      authors:
        dbMod.authors?.map((author: any) => ({
          id: author.authorId,
          name: author.name,
          url: author.url || "",
        })) || [],
      logo: dbMod.logo
        ? {
            id: dbMod.logo.logoId,
            modId: dbMod.logo.modId,
            title: dbMod.logo.title || "",
            description: dbMod.logo.description || "",
            thumbnailUrl: dbMod.logo.thumbnailUrl || "",
            url: dbMod.logo.url || "",
          }
        : {
            id: 0,
            modId: dbMod.id,
            title: "",
            description: "",
            thumbnailUrl: "",
            url: "",
          },
      screenshots:
        dbMod.screenshots?.map((screenshot: any) => ({
          id: screenshot.screenshotId,
          modId: screenshot.modId,
          title: screenshot.title || "",
          description: screenshot.description || "",
          thumbnailUrl: screenshot.thumbnailUrl || "",
          url: screenshot.url || "",
        })) || [],
      mainFileId: 0, // Would need to be calculated
      latestFiles:
        dbMod.latestFiles?.map((file: any) => ({
          id: file.fileId,
          gameId: file.gameId,
          modId: file.modId,
          isAvailable: file.isAvailable,
          displayName: file.displayName,
          fileName: file.fileName,
          releaseType: file.releaseType,
          fileStatus: file.fileStatus,
          hashes:
            file.hashes?.map((hash: any) => ({
              value: hash.value,
              algo: hash.algo,
            })) || [],
          fileDate: file.fileDate.toISOString(),
          fileLength: file.fileLength,
          downloadCount: file.downloadCount,
          fileSizeOnDisk: file.fileSizeOnDisk,
          downloadUrl: file.downloadUrl,
          gameVersions: file.gameVersions?.map((gv: any) => gv.version) || [],
          sortableGameVersions:
            file.sortableGameVersions?.map((sgv: any) => ({
              gameVersionName: sgv.gameVersionName,
              gameVersionPadded: sgv.gameVersionPadded,
              gameVersion: sgv.gameVersion,
              gameVersionReleaseDate: sgv.gameVersionReleaseDate.toISOString(),
              gameVersionTypeId: sgv.gameVersionTypeId,
            })) || [],
          dependencies:
            file.dependencies?.map((dep: any) => ({
              modId: dep.modId,
              relationType: dep.relationType,
            })) || [],
          exposeAsAlternative: false,
          parentProjectFileId: 0,
          alternateFileId: 0,
          isServerPack: file.isServerPack,
          serverPackFileId: file.serverPackFileId || 0,
          isEarlyAccessContent: file.isEarlyAccessContent,
          earlyAccessEndDate: file.earlyAccessEndDate?.toISOString() || "",
          fileFingerprint: file.fileFingerprint,
          modules:
            file.modules?.map((module: any) => ({
              name: module.name,
              fingerprint: module.fingerprint,
            })) || [],
        })) || [],
      latestFilesIndexes:
        dbMod.latestFilesIndexes?.map((index: any) => ({
          gameVersion: index.gameVersion,
          fileId: index.fileId,
          filename: index.filename,
          releaseType: index.releaseType,
          gameVersionTypeId: index.gameVersionTypeId,
          modLoader: index.modLoader ?? 0,
        })) || [],
      dateCreated: dbMod.dateCreated.toISOString(),
      dateModified: dbMod.dateModified.toISOString(),
      dateReleased: dbMod.dateReleased?.toISOString() || "",
      allowModDistribution: dbMod.allowModDistribution,
      gamePopularityRank: dbMod.gamePopularityRank || 0,
      isAvailable: dbMod.isAvailable,
      thumbsUpCount: dbMod.thumbsUpCount,
    };
  }

  private async storeModRelations(mod: CurseForgeModData): Promise<void> {
    if (!this.dbAvailable) return;

    try {
      // Store links
      if (mod.links) {
        await prisma.modLinks.upsert({
          where: { modId: mod.id },
          update: {
            websiteUrl: mod.links.websiteUrl,
            wikiUrl: mod.links.wikiUrl,
            issuesUrl: mod.links.issuesUrl,
            sourceUrl: mod.links.sourceUrl,
          },
          create: {
            modId: mod.id,
            websiteUrl: mod.links.websiteUrl,
            wikiUrl: mod.links.wikiUrl,
            issuesUrl: mod.links.issuesUrl,
            sourceUrl: mod.links.sourceUrl,
          },
        });
      }

      // Store categories
      if (mod.categories.length > 0) {
        await prisma.modCategory.deleteMany({
          where: { modId: mod.id },
        });

        for (const category of mod.categories) {
          await prisma.modCategory.create({
            data: {
              modId: mod.id,
              categoryId: category.id,
              gameId: category.gameId,
              name: category.name,
              slug: category.slug,
              url: category.url,
              iconUrl: category.iconUrl,
              dateModified: new Date(category.dateModified),
              isClass: category.isClass,
              classId: category.classId,
              parentCategoryId: category.parentCategoryId,
              displayIndex: category.displayIndex,
            },
          });
        }
      }

      // Store authors
      if (mod.authors.length > 0) {
        await prisma.modAuthor.deleteMany({
          where: { modId: mod.id },
        });

        for (const author of mod.authors) {
          await prisma.modAuthor.create({
            data: {
              modId: mod.id,
              authorId: author.id,
              name: author.name,
              url: author.url,
            },
          });
        }
      }

      // Store logo
      if (mod.logo) {
        await prisma.modLogo.upsert({
          where: { modId: mod.id },
          update: {
            logoId: mod.logo.id,
            modId: mod.logo.modId,
            title: mod.logo.title,
            description: mod.logo.description,
            thumbnailUrl: mod.logo.thumbnailUrl,
            url: mod.logo.url,
          },
          create: {
            modId: mod.id,
            logoId: mod.logo.id,
            title: mod.logo.title,
            description: mod.logo.description,
            thumbnailUrl: mod.logo.thumbnailUrl,
            url: mod.logo.url,
          },
        });
      }

      // Store screenshots
      if (mod.screenshots.length > 0) {
        await prisma.modScreenshot.deleteMany({
          where: { modId: mod.id },
        });

        for (const screenshot of mod.screenshots) {
          await prisma.modScreenshot.create({
            data: {
              modId: mod.id,
              screenshotId: screenshot.id,
              title: screenshot.title,
              description: screenshot.description,
              thumbnailUrl: screenshot.thumbnailUrl,
              url: screenshot.url,
            },
          });
        }
      }

      // Store latest files
      if (mod.latestFiles.length > 0) {
        await prisma.modFile.deleteMany({
          where: { modId: mod.id },
        });

        for (const file of mod.latestFiles) {
          const dbFile = await prisma.modFile.create({
            data: {
              modId: mod.id,
              fileId: file.id,
              gameId: file.gameId,
              isAvailable: file.isAvailable,
              displayName: file.displayName,
              fileName: file.fileName,
              releaseType: file.releaseType,
              fileStatus: file.fileStatus,
              fileDate: new Date(file.fileDate),
              fileLength: file.fileLength,
              downloadCount: file.downloadCount,
              fileSizeOnDisk: file.fileSizeOnDisk,
              downloadUrl: file.downloadUrl,
              isServerPack: file.isServerPack,
              serverPackFileId: file.serverPackFileId,
              isEarlyAccessContent: file.isEarlyAccessContent,
              earlyAccessEndDate: file.earlyAccessEndDate
                ? new Date(file.earlyAccessEndDate)
                : null,
              fileFingerprint: file.fileFingerprint,
            },
          });

          // Store file hashes
          for (const hash of file.hashes) {
            await prisma.modFileHash.create({
              data: {
                fileId: dbFile.id,
                value: hash.value,
                algo: hash.algo,
              },
            });
          }

          // Store game versions
          for (const version of file.gameVersions) {
            await prisma.modFileGameVersion.create({
              data: {
                fileId: dbFile.id,
                version,
              },
            });
          }

          // Store sortable game versions
          for (const sgv of file.sortableGameVersions) {
            await prisma.modFileSortableGameVersion.create({
              data: {
                fileId: dbFile.id,
                gameVersionName: sgv.gameVersionName,
                gameVersionPadded: sgv.gameVersionPadded,
                gameVersion: sgv.gameVersion,
                gameVersionReleaseDate: new Date(sgv.gameVersionReleaseDate),
                gameVersionTypeId: sgv.gameVersionTypeId,
                ...(typeof (sgv as any).modLoader !== "undefined"
                  ? { modLoader: (sgv as any).modLoader }
                  : {}),
              },
            });
          }

          // Store dependencies
          for (const dep of file.dependencies) {
            await prisma.modFileDependency.create({
              data: {
                fileId: dbFile.id,
                modId: dep.modId,
                relationType: dep.relationType,
              },
            });
          }

          // Store modules
          for (const modModule of file.modules) {
            await prisma.modFileModule.create({
              data: {
                fileId: dbFile.id,
                name: modModule.name,
                fingerprint: modModule.fingerprint,
              },
            });
          }
        }
      }

      // Store latest files indexes
      if (mod.latestFilesIndexes.length > 0) {
        await prisma.modFileIndex.deleteMany({
          where: { modId: mod.id },
        });

        for (const index of mod.latestFilesIndexes) {
          await prisma.modFileIndex.create({
            data: {
              modId: mod.id,
              gameVersion: index.gameVersion,
              fileId: index.fileId,
              filename: index.filename,
              releaseType: index.releaseType,
              gameVersionTypeId: index.gameVersionTypeId,
              modLoader: index.modLoader ?? 0,
            },
          });
        }
      }
    } catch (err) {
      error("Error storing mod relations:", err instanceof Error ? err.message : String(err));
    }
  }

  async disconnect(): Promise<void> {
    if (this.dbAvailable) {
      await prisma.$disconnect();
    }
  }
}

// Export singleton instance
export const modCache = new ModCacheService();

// Clean up expired cache entries periodically
setInterval(
  () => {
    modCache.clearExpiredCache();
  },
  60 * 60 * 1000
); // Every hour
