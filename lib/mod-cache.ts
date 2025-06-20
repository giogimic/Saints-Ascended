import { PrismaClient } from "@prisma/client";
import { CurseForgeModData } from "../types/curseforge";

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
  private prisma!: PrismaClient;
  private modCache: Map<number, ModCacheEntry> = new Map();
  private searchCache: Map<string, SearchCacheEntry> = new Map();
  private inMemoryCache: Map<string, any> = new Map();
  private dbAvailable: boolean = false;

  // Enhanced cache TTLs (in milliseconds)
  private readonly MOD_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly POPULAR_MODS_TTL = 6 * 60 * 60 * 1000; // 6 hours
  private readonly MAX_CACHE_SIZE = 2000; // Increased cache size
  private readonly MAX_SEARCH_CACHE_SIZE = 500; // Separate limit for search cache

  constructor() {
    try {
      this.prisma = new PrismaClient();
      this.dbAvailable = true;
      console.log("Prisma database connection initialized");
    } catch (error) {
      console.warn(
        "Failed to initialize Prisma database, falling back to in-memory cache:",
        error
      );
      this.dbAvailable = false;
    }
  }

  /**
   * Enhanced mod retrieval with popularity scoring and analytics
   */
  async getMod(modId: number): Promise<CurseForgeModData | null> {
    try {
      if (!this.dbAvailable) {
        // Fall back to in-memory cache
        return this.inMemoryCache.get(`mod_${modId}`) || null;
      }

      const mod = await this.prisma.mod.findUnique({
        where: { id: modId },
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

      if (!mod) {
        return null;
      }

      // Convert database model to CurseForge format
      const curseForgeMod = this.convertDbToCurseForge(mod);

      // Update access analytics
      await this.updateModAccessAnalytics(modId);

      // Store in memory cache with enhanced metadata
      this.setModInMemoryCache(modId, curseForgeMod);

      return curseForgeMod;
    } catch (error) {
      console.error("Error retrieving mod from cache:", error);
      // Fall back to in-memory cache
      return this.inMemoryCache.get(`mod_${modId}`) || null;
    }
  }

  /**
   * Enhanced mod storage with popularity scoring and search keywords
   */
  async setMod(mod: CurseForgeModData): Promise<void> {
    try {
      if (!this.dbAvailable) {
        // Fall back to in-memory cache
        this.inMemoryCache.set(`mod_${mod.id}`, {
          ...mod,
          lastFetched: new Date(),
        });
        return;
      }

      // Calculate popularity score
      const popularityScore = this.calculatePopularityScore(mod);
      
      // Generate search keywords
      const searchKeywords = this.generateSearchKeywords(mod);

      // Store in database with enhanced fields
      await this.prisma.mod.upsert({
        where: { id: mod.id },
        update: {
          gameId: mod.gameId,
          name: mod.name,
          slug: mod.slug,
          summary: mod.summary,
          status: mod.status,
          downloadCount: mod.downloadCount,
          isFeatured: mod.isFeatured,
          primaryCategoryId: mod.primaryCategoryId,
          classId: mod.classId,
          dateCreated: new Date(mod.dateCreated),
          dateModified: new Date(mod.dateModified),
          dateReleased: mod.dateReleased ? new Date(mod.dateReleased) : null,
          allowModDistribution: mod.allowModDistribution,
          gamePopularityRank: mod.gamePopularityRank,
          isAvailable: mod.isAvailable,
          thumbsUpCount: mod.thumbsUpCount,
          // Enhanced fields
          searchKeywords,
          popularityScore,
          lastUpdated: new Date(),
          lastFetched: new Date(),
        },
        create: {
          id: mod.id,
          gameId: mod.gameId,
          name: mod.name,
          slug: mod.slug,
          summary: mod.summary,
          status: mod.status,
          downloadCount: mod.downloadCount,
          isFeatured: mod.isFeatured,
          primaryCategoryId: mod.primaryCategoryId,
          classId: mod.classId,
          dateCreated: new Date(mod.dateCreated),
          dateModified: new Date(mod.dateModified),
          dateReleased: mod.dateReleased ? new Date(mod.dateReleased) : null,
          allowModDistribution: mod.allowModDistribution,
          gamePopularityRank: mod.gamePopularityRank,
          isAvailable: mod.isAvailable,
          thumbsUpCount: mod.thumbsUpCount,
          // Enhanced fields
          searchKeywords,
          popularityScore,
          lastUpdated: new Date(),
          lastFetched: new Date(),
        },
      });

      // Store related data
      await this.storeModRelations(mod);

      // Update popular mods tracking
      await this.updatePopularModsTracking(mod);

    } catch (error) {
      console.error("Error storing mod in cache:", error);
      // Fall back to in-memory cache
      this.inMemoryCache.set(`mod_${mod.id}`, {
        ...mod,
        lastFetched: new Date(),
      });
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
    const cacheKey = this.generateSearchCacheKey(
      query,
      category,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    // Check in-memory cache first
    const memoryEntry = this.searchCache.get(cacheKey);
    if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
      // Update hit count and last accessed
      memoryEntry.hitCount++;
      memoryEntry.lastAccessed = Date.now();
      return {
        data: memoryEntry.data,
        totalCount: memoryEntry.totalCount,
      };
    }

    // Check database cache
    try {
      const dbCache = await this.prisma.modCache.findUnique({
        where: { query: cacheKey },
      });

      if (dbCache && new Date() < dbCache.expiresAt) {
        // Update hit count and last accessed
        await this.prisma.modCache.update({
          where: { id: dbCache.id },
          data: {
            hitCount: { increment: 1 },
            lastAccessed: new Date(),
          },
        });

        const modIds = JSON.parse(dbCache.results) as number[];
        const mods = await this.getModsByIds(modIds);

        // Store in memory cache
        this.setSearchInMemoryCache(cacheKey, mods, dbCache.totalCount);

        return {
          data: mods,
          totalCount: dbCache.totalCount,
        };
      }
    } catch (error) {
      console.error("Error checking database cache:", error);
    }

    // If not in cache, perform search
    const searchResults = await this.performDatabaseSearch(
      query,
      category,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    // Store results in cache
    await this.setSearchResults(
      query,
      category,
      sortBy,
      sortOrder,
      page,
      pageSize,
      searchResults.data,
      searchResults.totalCount
    );

    // Update search analytics
    await this.updateSearchAnalytics(query, category, searchResults.totalCount);

    return searchResults;
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

    // Store in database cache
    try {
      if (this.dbAvailable) {
        const modIds = results.map((mod) => mod.id);
        const expiresAt = new Date(Date.now() + this.SEARCH_CACHE_TTL);

        await this.prisma.modCache.upsert({
          where: { query: cacheKey },
          update: {
            results: JSON.stringify(modIds),
            totalCount,
            expiresAt,
            lastAccessed: new Date(),
          },
          create: {
            query: cacheKey,
            results: JSON.stringify(modIds),
            totalCount,
            expiresAt,
            hitCount: 0,
            lastAccessed: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error storing search results in database:", error);
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
          { name: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { searchKeywords: { contains: query.toLowerCase(), mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.categories = {
          some: {
            name: { contains: category, mode: 'insensitive' }
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
      const totalCount = await this.prisma.mod.count({ where });

      // Get mods
      const mods = await this.prisma.mod.findMany({
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
      const curseForgeMods = mods.map(mod => this.convertDbToCurseForge(mod));

      return {
        data: curseForgeMods,
        totalCount,
      };
    } catch (error) {
      console.error("Error performing database search:", error);
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

      await this.prisma.modSearchAnalytics.upsert({
        where: {
          searchTerm_category: {
            searchTerm,
            category: category || null,
          },
        },
        update: {
          resultCount,
          searchCount: { increment: 1 },
          lastSearched: new Date(),
          avgResultCount: {
            set: this.prisma.raw(`
              (avgResultCount * searchCount + ${resultCount}) / (searchCount + 1)
            `),
          },
        },
        create: {
          searchTerm,
          category: category || null,
          resultCount,
          searchCount: 1,
          lastSearched: new Date(),
          avgResultCount: resultCount,
        },
      });
    } catch (error) {
      console.error("Error updating search analytics:", error);
    }
  }

  /**
   * Update mod access analytics
   */
  private async updateModAccessAnalytics(modId: number): Promise<void> {
    try {
      if (!this.dbAvailable) return;

      // Update last accessed time
      await this.prisma.mod.update({
        where: { id: modId },
        data: { lastUpdated: new Date() },
      });
    } catch (error) {
      console.error("Error updating mod access analytics:", error);
    }
  }

  /**
   * Update popular mods tracking
   */
  private async updatePopularModsTracking(mod: CurseForgeModData): Promise<void> {
    try {
      if (!this.dbAvailable) return;

      const popularityScore = this.calculatePopularityScore(mod);

      // Update for each category
      for (const category of mod.categories) {
        await this.prisma.popularMods.upsert({
          where: {
            category_modId: {
              category: category.name,
              modId: mod.id,
            },
          },
          update: {
            name: mod.name,
            downloadCount: mod.downloadCount,
            thumbsUpCount: mod.thumbsUpCount,
            popularityScore,
            lastUpdated: new Date(),
          },
          create: {
            category: category.name,
            modId: mod.id,
            name: mod.name,
            downloadCount: mod.downloadCount,
            thumbsUpCount: mod.thumbsUpCount,
            popularityScore,
            rank: 0, // Will be calculated separately
            lastUpdated: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error updating popular mods tracking:", error);
    }
  }

  /**
   * Get popular mods by category
   */
  async getPopularMods(category: string, limit: number = 20): Promise<CurseForgeModData[]> {
    try {
      if (!this.dbAvailable) return [];

      const popularMods = await this.prisma.popularMods.findMany({
        where: { category },
        orderBy: { popularityScore: 'desc' },
        take: limit,
      });

      const modIds = popularMods.map(pm => pm.modId);
      return await this.getModsByIds(modIds);
    } catch (error) {
      console.error("Error getting popular mods:", error);
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
      await this.prisma.modCache.deleteMany({
        where: { expiresAt: { lt: now } },
      });

      // Clear old search analytics (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await this.prisma.modSearchAnalytics.deleteMany({
        where: { lastSearched: { lt: thirtyDaysAgo } },
      });

      // Clear memory cache
      this.clearExpiredMemoryCache();
    } catch (error) {
      console.error("Error clearing expired cache:", error);
    }
  }

  /**
   * Clear expired memory cache entries
   */
  private clearExpiredMemoryCache(): void {
    const now = Date.now();

    // Clear expired mod cache
    for (const [key, entry] of this.modCache.entries()) {
      if (now > entry.expiresAt) {
        this.modCache.delete(key);
      }
    }

    // Clear expired search cache
    for (const [key, entry] of this.searchCache.entries()) {
      if (now > entry.expiresAt) {
        this.searchCache.delete(key);
      }
    }

    // Enforce size limits
    if (this.modCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.modCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const toDelete = entries.slice(0, this.modCache.size - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.modCache.delete(key));
    }

    if (this.searchCache.size > this.MAX_SEARCH_CACHE_SIZE) {
      const entries = Array.from(this.searchCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const toDelete = entries.slice(0, this.searchCache.size - this.MAX_SEARCH_CACHE_SIZE);
      toDelete.forEach(([key]) => this.searchCache.delete(key));
    }
  }

  /**
   * Get multiple mods by IDs
   */
  async getModsByIds(modIds: number[]): Promise<CurseForgeModData[]> {
    const results: CurseForgeModData[] = [];

    for (const modId of modIds) {
      const mod = await this.getMod(modId);
      if (mod) {
        results.push(mod);
      }
    }

    return results;
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
      memoryMods: this.modCache.size,
      memorySearches: this.searchCache.size,
      databaseMods: 0, // Would need to query database
      databaseSearches: 0, // Would need to query database
    };
  }

  private setModInMemoryCache(modId: number, mod: CurseForgeModData): void {
    if (this.modCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.modCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.modCache.delete(oldestKey);
      }
    }

    this.modCache.set(modId, {
      data: mod,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.MOD_CACHE_TTL,
      hitCount: 0,
      lastAccessed: Date.now(),
    });
  }

  private setSearchInMemoryCache(
    cacheKey: string,
    results: CurseForgeModData[],
    totalCount: number
  ): void {
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.searchCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.searchCache.delete(oldestKey);
      }
    }

    this.searchCache.set(cacheKey, {
      data: results,
      totalCount,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SEARCH_CACHE_TTL,
      hitCount: 0,
      lastAccessed: Date.now(),
    });
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
        await this.prisma.modLinks.upsert({
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
        await this.prisma.modCategory.deleteMany({
          where: { modId: mod.id },
        });

        for (const category of mod.categories) {
          await this.prisma.modCategory.create({
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
        await this.prisma.modAuthor.deleteMany({
          where: { modId: mod.id },
        });

        for (const author of mod.authors) {
          await this.prisma.modAuthor.create({
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
        await this.prisma.modLogo.upsert({
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
            modId: mod.logo.modId,
            title: mod.logo.title,
            description: mod.logo.description,
            thumbnailUrl: mod.logo.thumbnailUrl,
            url: mod.logo.url,
          },
        });
      }

      // Store screenshots
      if (mod.screenshots.length > 0) {
        await this.prisma.modScreenshot.deleteMany({
          where: { modId: mod.id },
        });

        for (const screenshot of mod.screenshots) {
          await this.prisma.modScreenshot.create({
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
        await this.prisma.modFile.deleteMany({
          where: { modId: mod.id },
        });

        for (const file of mod.latestFiles) {
          const dbFile = await this.prisma.modFile.create({
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
            await this.prisma.modFileHash.create({
              data: {
                fileId: dbFile.id,
                value: hash.value,
                algo: hash.algo,
              },
            });
          }

          // Store game versions
          for (const version of file.gameVersions) {
            await this.prisma.modFileGameVersion.create({
              data: {
                fileId: dbFile.id,
                version,
              },
            });
          }

          // Store sortable game versions
          for (const sgv of file.sortableGameVersions) {
            await this.prisma.modFileSortableGameVersion.create({
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
            await this.prisma.modFileDependency.create({
              data: {
                fileId: dbFile.id,
                modId: dep.modId,
                relationType: dep.relationType,
              },
            });
          }

          // Store modules
          for (const modModule of file.modules) {
            await this.prisma.modFileModule.create({
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
        await this.prisma.modFileIndex.deleteMany({
          where: { modId: mod.id },
        });

        for (const index of mod.latestFilesIndexes) {
          await this.prisma.modFileIndex.create({
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
    } catch (error) {
      console.error("Error storing mod relations:", error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.dbAvailable) {
      await this.prisma.$disconnect();
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
