import fs from "fs";
import path from "path";
import { modCache } from "./mod-cache";
import {
  CurseForgeModData,
  CurseForgeSearchResponse,
} from "../types/curseforge";

// CurseForge API Error Types
export class CurseForgeAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "CurseForgeAPIError";
  }
}

export class CurseForgeRateLimitError extends CurseForgeAPIError {
  constructor(retryAfter?: number) {
    super(
      "Rate limit exceeded. Please wait before making more requests.",
      429,
      "RATE_LIMIT_EXCEEDED",
      retryAfter
    );
    this.name = "CurseForgeRateLimitError";
  }
}

export class CurseForgeAuthenticationError extends CurseForgeAPIError {
  constructor(
    message: string = "Authentication failed. Please check your API key."
  ) {
    super(message, 401, "AUTHENTICATION_FAILED");
    this.name = "CurseForgeAuthenticationError";
  }
}

export class CurseForgeForbiddenError extends CurseForgeAPIError {
  constructor(
    message: string = "Access forbidden. Please check your API key permissions."
  ) {
    super(message, 403, "ACCESS_FORBIDDEN");
    this.name = "CurseForgeForbiddenError";
  }
}

export class CurseForgeNotFoundError extends CurseForgeAPIError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found.`, 404, "NOT_FOUND");
    this.name = "CurseForgeNotFoundError";
  }
}

// CurseForge API Response Types
interface CurseForgeMod {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  links: {
    websiteUrl: string;
    wikiUrl: string;
    issuesUrl: string;
    sourceUrl: string;
  };
  summary: string;
  status: number;
  downloadCount: number;
  isFeatured: boolean;
  primaryCategoryId: number;
  categories: Array<{
    id: number;
    gameId: number;
    name: string;
    slug: string;
    url: string;
    iconUrl: string;
    dateModified: string;
    isClass: boolean;
    classId: number;
    parentCategoryId: number;
    displayIndex: number;
  }>;
  classId: number;
  authors: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  logo: {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
  };
  screenshots: Array<{
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
  }>;
  mainFileId: number;
  latestFiles: Array<{
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes: Array<{
      value: string;
      algo: number;
    }>;
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    fileSizeOnDisk: number;
    downloadUrl: string;
    gameVersions: string[];
    sortableGameVersions: Array<{
      gameVersionName: string;
      gameVersionPadded: string;
      gameVersion: string;
      gameVersionReleaseDate: string;
      gameVersionTypeId: number;
    }>;
    dependencies: Array<{
      modId: number;
      relationType: number;
    }>;
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    isEarlyAccessContent: boolean;
    earlyAccessEndDate: string;
    fileFingerprint: number;
    modules: Array<{
      name: string;
      fingerprint: number;
    }>;
  }>;
  latestFilesIndexes: Array<{
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    gameVersionTypeId: number;
    modLoader: number;
  }>;
  dateCreated: string;
  dateModified: string;
  dateReleased: string;
  allowModDistribution: boolean;
  gamePopularityRank: number;
  isAvailable: boolean;
  thumbsUpCount: number;
}

interface CurseForgeCategory {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  url: string;
  iconUrl: string;
  dateModified: string;
  isClass: boolean;
  classId: number;
  parentCategoryId: number;
  displayIndex: number;
}

interface CurseForgeErrorResponse {
  errorCode: string;
  errorMessage: string;
  details?: any;
}

// Rate limiting and retry configuration
interface RateLimitInfo {
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Token Bucket Rate Limiter
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRate = refillRate;
  }

  async consume(tokens: number = 1): Promise<boolean> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    // Calculate wait time for next token
    const tokensNeeded = tokens - this.tokens;
    const waitTime = tokensNeeded / this.refillRate;

    // Wait for tokens to be available
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    this.refill();
    this.tokens -= tokens;
    return true;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Sort field mapping based on CurseForge API documentation
export type SortField = "name" | "popularity" | "size" | "updated";
const SORT_FIELD_MAP: Record<SortField, number> = {
  name: 1,
  popularity: 2,
  size: 3,
  updated: 4,
};

// Logging level configuration
const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const CURRENT_LOG_LEVEL =
  process.env.NODE_ENV === "development" ? LOG_LEVEL.INFO : LOG_LEVEL.WARN;

function log(level: number, message: string, ...args: any[]): void {
  if (level <= CURRENT_LOG_LEVEL) {
    console.log(message, ...args);
  }
}

export class CurseForgeAPI {
  private static readonly BASE_URL = "https://api.curseforge.com/v1";
  private static GAME_ID = 83374; // ARK: Survival Ascended
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static rateLimitInfo: RateLimitInfo | null = null;

  // Token bucket: 60 tokens per minute = 1 token per second
  private static tokenBucket = new TokenBucket(60, 1 / 60000); // 1 token per 60000ms (1 minute)

  // Background fetching throttling
  private static backgroundFetching = false;
  private static backgroundFetchInterval: NodeJS.Timeout | null = null;
  private static lastBackgroundFetch = 0;
  private static readonly BACKGROUND_FETCH_THROTTLE = 30000; // 30 seconds between fetches

  /**
   * Get API key with fallback to reading from .env.local file
   */
  private static getApiKey(): string {
    const apiKey = process.env.CURSEFORGE_API_KEY;

    // Always try to read from .env.local file first for better reliability
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");
        const curseforgeLine = lines.find((line) =>
          line.trim().startsWith("CURSEFORGE_API_KEY=")
        );
        if (curseforgeLine) {
          const fileKey = curseforgeLine.split("=")[1]?.trim() || "";
          // Remove quotes if present
          const cleanKey = fileKey.replace(/^\"|'|\"$/g, "");

          if (cleanKey && cleanKey.length >= 32) {
            log(LOG_LEVEL.INFO, "Using API key from .env.local file");
            return cleanKey;
          }
        }
      }
    } catch (error) {
      console.error("Error reading API key from .env.local:", error);
    }

    // Fallback to environment variable if file reading failed
    if (apiKey && apiKey.length >= 32) {
      log(LOG_LEVEL.INFO, "Using API key from environment variable");
      return apiKey;
    }

    // If environment variable is truncated, try to read from file again with different approach
    if (apiKey && apiKey.length < 50) {
      log(
        LOG_LEVEL.WARN,
        "Environment variable appears truncated, attempting to read from .env.local file"
      );
      try {
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const lines = envContent.split("\n");
          const curseforgeLine = lines.find((line) =>
            line.trim().startsWith("CURSEFORGE_API_KEY=")
          );
          if (curseforgeLine) {
            const fileKey = curseforgeLine.split("=")[1]?.trim() || "";
            const cleanKey = fileKey.replace(/^["']|["']$/g, "");

            if (cleanKey && cleanKey.length > apiKey.length) {
              log(
                LOG_LEVEL.INFO,
                "Using API key from .env.local file (environment variable was truncated)"
              );
              return cleanKey;
            }
          }
        }
      } catch (error) {
        console.error("Error reading API key from .env.local:", error);
      }
    }

    return apiKey || "";
  }

  /**
   * Set the game ID for API calls
   */
  static setGameId(gameId: number): void {
    this.GAME_ID = gameId;
  }

  /**
   * Get the current game ID
   */
  static getGameId(): number {
    return this.GAME_ID;
  }

  /**
   * Make a request to the CurseForge API with proper error handling and retry logic
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new CurseForgeAuthenticationError(
        "CURSEFORGE_API_KEY not configured"
      );
    }

    // Use token bucket rate limiter
    await this.tokenBucket.consume(1);

    // Check rate limits before making request
    if (this.rateLimitInfo && this.rateLimitInfo.remaining <= 0) {
      const now = Date.now();
      if (now < this.rateLimitInfo.reset) {
        const waitTime = this.rateLimitInfo.reset - now;
        throw new CurseForgeRateLimitError(waitTime);
      }
    }

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          Accept: "application/json",
          "x-api-key": apiKey,
          "User-Agent": "Saints-Ascended-Server-Manager/1.0",
          ...options.headers,
        },
      });

      // Update rate limit info from headers
      this.updateRateLimitInfo(response);

      // Handle different HTTP status codes
      if (response.status === 429) {
        const retryAfter = this.getRetryAfterHeader(response);
        throw new CurseForgeRateLimitError(retryAfter);
      }

      if (response.status === 401) {
        throw new CurseForgeAuthenticationError();
      }

      if (response.status === 403) {
        throw new CurseForgeForbiddenError();
      }

      if (response.status === 404) {
        throw new CurseForgeNotFoundError();
      }

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: CurseForgeErrorResponse = await response.json();
          errorMessage = errorData.errorMessage || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }

        throw new CurseForgeAPIError(errorMessage, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle retry logic for rate limits and server errors
      if (
        (error instanceof CurseForgeRateLimitError ||
          (error instanceof CurseForgeAPIError && error.statusCode >= 500)) &&
        retryCount < this.MAX_RETRIES
      ) {
        const delay =
          error instanceof CurseForgeRateLimitError
            ? error.retryAfter || this.RETRY_DELAY
            : this.RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff

        console.log(
          `Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`
        );
        await this.delay(delay);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private static updateRateLimitInfo(response: Response): void {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const reset = response.headers.get("X-RateLimit-Reset");

    if (remaining !== null && reset !== null) {
      this.rateLimitInfo = {
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10) * 1000, // Convert to milliseconds
      };
    }
  }

  /**
   * Get retry-after header value
   */
  private static getRetryAfterHeader(response: Response): number | undefined {
    const retryAfter = response.headers.get("Retry-After");
    return retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined;
  }

  /**
   * Utility function to delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Enhanced search for mods with improved coverage and pagination
   */
  static async searchMods(
    searchFilter: string,
    categoryId?: number,
    sortField: SortField = "name",
    sortOrder: "asc" | "desc" = "asc",
    pageSize: number = 20,
    page: number = 1,
    includeAllCategories: boolean = false
  ): Promise<{ mods: CurseForgeMod[]; totalCount: number; hasMore: boolean }> {
    try {
      // Check cache first with enhanced key
      const cacheKey = this.generateEnhancedCacheKey(
        searchFilter,
        categoryId,
        sortField,
        sortOrder,
        page,
        pageSize,
        includeAllCategories
      );
      
      const cachedResult = await modCache.searchMods(
        searchFilter,
        categoryId?.toString(),
        sortField,
        sortOrder,
        page,
        pageSize
      );

      if (cachedResult.data.length > 0) {
        log(LOG_LEVEL.DEBUG, `Cache hit for enhanced search: ${cacheKey}`);
        const mods = this.normalizeModData(cachedResult.data);
        return {
          mods,
          totalCount: cachedResult.totalCount,
          hasMore: cachedResult.data.length === pageSize
        };
      }

      log(LOG_LEVEL.DEBUG, `Cache miss for enhanced search: ${cacheKey}, fetching from API`);

      // Enhanced API request with better parameters
      const SORT_FIELD_MAP: Record<SortField, number> = {
        name: 1,
        popularity: 2,
        size: 3,
        updated: 4,
      };

      const params = new URLSearchParams({
        gameId: this.GAME_ID.toString(),
        searchFilter: searchFilter.trim(),
        sortField: SORT_FIELD_MAP[sortField].toString(),
        sortOrder: sortOrder,
        pageSize: Math.min(pageSize, 50).toString(), // API limit
        index: ((page - 1) * pageSize).toString(),
      });

      if (categoryId && !includeAllCategories) {
        params.append("categoryId", categoryId.toString());
      }

      // Add additional parameters for better coverage
      params.append("classId", "5"); // Mods class
      params.append("gameVersionTypeId", "68441"); // Latest game version

      const data: CurseForgeSearchResponse =
        await this.makeRequest<CurseForgeSearchResponse>(
          `/mods/search?${params}`
        );

      // Normalize and deduplicate results
      const normalizedMods = this.normalizeModData(data.data as CurseForgeModData[]);
      const deduplicatedMods = this.deduplicateMods(normalizedMods);

      // Store in cache with enhanced metadata
      await modCache.setSearchResults(
        searchFilter,
        categoryId?.toString(),
        sortField,
        sortOrder,
        page,
        pageSize,
        deduplicatedMods as CurseForgeModData[],
        data.pagination.totalCount
      );

      // Store individual mods in cache for faster future access
      for (const mod of deduplicatedMods) {
        await modCache.setMod(mod as CurseForgeModData);
      }

      return {
        mods: deduplicatedMods,
        totalCount: data.pagination.totalCount,
        hasMore: data.pagination.index + data.pagination.resultCount < data.pagination.totalCount
      };
    } catch (error) {
      console.error("Failed to search CurseForge mods:", error);
      throw error;
    }
  }

  /**
   * Enhanced search with multiple strategies for better coverage
   */
  static async searchModsComprehensive(
    searchFilter: string,
    categoryId?: number,
    sortField: SortField = "popularity",
    sortOrder: "asc" | "desc" = "desc",
    pageSize: number = 20
  ): Promise<CurseForgeMod[]> {
    try {
      const allMods: CurseForgeMod[] = [];
      const seenIds = new Set<number>();

      // Strategy 1: Direct search
      const directResults = await this.searchMods(
        searchFilter,
        categoryId,
        sortField,
        sortOrder,
        pageSize,
        1,
        false
      );
      
      directResults.mods.forEach(mod => {
        if (!seenIds.has(mod.id)) {
          allMods.push(mod);
          seenIds.add(mod.id);
        }
      });

      // Strategy 2: Broader search without category filter
      if (categoryId && allMods.length < pageSize) {
        const broaderResults = await this.searchMods(
          searchFilter,
          undefined,
          sortField,
          sortOrder,
          pageSize - allMods.length,
          1,
          true
        );
        
        broaderResults.mods.forEach(mod => {
          if (!seenIds.has(mod.id)) {
            allMods.push(mod);
            seenIds.add(mod.id);
          }
        });
      }

      // Strategy 3: Popular mods fallback if still insufficient
      if (allMods.length < Math.min(pageSize, 10)) {
        const popularResults = await this.searchMods(
          "",
          categoryId,
          "popularity",
          "desc",
          pageSize - allMods.length,
          1,
          false
        );
        
        popularResults.mods.forEach(mod => {
          if (!seenIds.has(mod.id)) {
            allMods.push(mod);
            seenIds.add(mod.id);
          }
        });
      }

      return allMods.slice(0, pageSize);
    } catch (error) {
      console.error("Failed to perform comprehensive search:", error);
      throw error;
    }
  }

  /**
   * Fetch mods by category with enhanced coverage
   */
  static async getModsByCategory(
    categoryId: number,
    sortField: SortField = "popularity",
    sortOrder: "asc" | "desc" = "desc",
    pageSize: number = 20,
    page: number = 1
  ): Promise<{ mods: CurseForgeMod[]; totalCount: number; hasMore: boolean }> {
    try {
      // First try category-specific search
      const categoryResults = await this.searchMods(
        "",
        categoryId,
        sortField,
        sortOrder,
        pageSize,
        page,
        false
      );

      // If insufficient results, supplement with popular mods in same category
      if (categoryResults.mods.length < pageSize && page === 1) {
        const popularResults = await this.searchMods(
          "",
          categoryId,
          "popularity",
          "desc",
          pageSize - categoryResults.mods.length,
          1,
          false
        );

        const seenIds = new Set(categoryResults.mods.map(m => m.id));
        const additionalMods = popularResults.mods.filter(mod => !seenIds.has(mod.id));
        
        categoryResults.mods.push(...additionalMods);
        categoryResults.hasMore = categoryResults.hasMore || popularResults.hasMore;
      }

      return categoryResults;
    } catch (error) {
      console.error("Failed to get mods by category:", error);
      throw error;
    }
  }

  /**
   * Normalize mod data to ensure consistency
   */
  private static normalizeModData(mods: CurseForgeModData[]): CurseForgeMod[] {
    return mods.map(mod => ({
      ...mod,
      // Ensure logo is never null
      logo: mod.logo || {
        id: 0,
        modId: mod.id,
        title: "",
        description: "",
        thumbnailUrl: "",
        url: "",
      },
      // Normalize name and summary
      name: mod.name?.trim() || "Unknown Mod",
      summary: mod.summary?.trim() || "",
      // Ensure numeric fields are valid
      downloadCount: Math.max(0, mod.downloadCount || 0),
      thumbsUpCount: Math.max(0, mod.thumbsUpCount || 0),
      // Normalize dates - keep as strings for API compatibility
      dateCreated: mod.dateCreated || new Date().toISOString(),
      dateModified: mod.dateModified || new Date().toISOString(),
      dateReleased: mod.dateReleased || "",
      // Ensure arrays are always arrays
      categories: Array.isArray(mod.categories) ? mod.categories : [],
      authors: Array.isArray(mod.authors) ? mod.authors : [],
      screenshots: Array.isArray(mod.screenshots) ? mod.screenshots : [],
      latestFiles: Array.isArray(mod.latestFiles) ? mod.latestFiles : [],
      latestFilesIndexes: Array.isArray(mod.latestFilesIndexes) ? mod.latestFilesIndexes : [],
    }));
  }

  /**
   * Deduplicate mods based on ID and name similarity
   */
  private static deduplicateMods(mods: CurseForgeMod[]): CurseForgeMod[] {
    const seenIds = new Set<number>();
    const seenNames = new Set<string>();
    const uniqueMods: CurseForgeMod[] = [];

    for (const mod of mods) {
      const normalizedName = mod.name.toLowerCase().trim();
      
      // Check for exact ID match
      if (seenIds.has(mod.id)) {
        continue;
      }
      
      // Check for name similarity (fuzzy matching)
      const isDuplicateName = Array.from(seenNames).some(seenName => {
        const similarity = this.calculateNameSimilarity(normalizedName, seenName);
        return similarity > 0.8; // 80% similarity threshold
      });
      
      if (!isDuplicateName) {
        uniqueMods.push(mod);
        seenIds.add(mod.id);
        seenNames.add(normalizedName);
      }
    }

    return uniqueMods;
  }

  /**
   * Calculate similarity between two mod names
   */
  private static calculateNameSimilarity(name1: string, name2: string): number {
    const words1 = name1.split(/\s+/).filter(w => w.length > 2);
    const words2 = name2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) {
      return 0;
    }
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  }

  /**
   * Generate enhanced cache key with more parameters
   */
  private static generateEnhancedCacheKey(
    searchFilter: string,
    categoryId?: number,
    sortField: SortField = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    pageSize: number = 20,
    includeAllCategories: boolean = false
  ): string {
    return `${searchFilter}_${categoryId || 'all'}_${sortField}_${sortOrder}_${page}_${pageSize}_${includeAllCategories}`;
  }

  /**
   * Get detailed information about a specific mod
   */
  static async getModDetails(modId: number): Promise<CurseForgeMod> {
    try {
      // Check cache first
      const cachedMod = await modCache.getMod(modId);

      if (cachedMod) {
        log(LOG_LEVEL.DEBUG, `Cache hit for mod: ${modId}`);
        return cachedMod as CurseForgeMod;
      }

      log(LOG_LEVEL.DEBUG, `Cache miss for mod: ${modId}, fetching from API`);

      if (!modId || modId <= 0) {
        throw new Error("Invalid mod ID");
      }

      const data = await this.makeRequest<{ data: CurseForgeMod }>(
        `/mods/${modId}`
      );

      // Store in cache
      await modCache.setMod(data.data as CurseForgeModData);

      return data.data;
    } catch (error) {
      console.error(`Failed to get mod details for ${modId}:`, error);
      throw error;
    }
  }

  /**
   * Get mod categories for Ark: Survival Ascended
   */
  static async getCategories(): Promise<Array<{ id: number; name: string }>> {
    try {
      const data = await this.makeRequest<{ data: CurseForgeCategory[] }>(
        `/categories?gameId=${this.GAME_ID}`
      );
      return data.data.map((category) => ({
        id: category.id,
        name: category.name,
      }));
    } catch (error) {
      console.error("Failed to get categories:", error);
      throw error;
    }
  }

  /**
   * Get rate limit information
   */
  static getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Check if we're currently rate limited
   */
  static isRateLimited(): boolean {
    if (!this.rateLimitInfo) {
      return false;
    }
    return (
      this.rateLimitInfo.remaining <= 0 && Date.now() < this.rateLimitInfo.reset
    );
  }

  /**
   * Get token bucket status for monitoring
   */
  static getTokenBucketStatus(): { tokens: number; capacity: number } {
    return {
      tokens: this.tokenBucket.getTokens(),
      capacity: 60,
    };
  }

  /**
   * Check if we can make a request (has tokens available)
   */
  static canMakeRequest(): boolean {
    return this.tokenBucket.getTokens() >= 1;
  }

  /**
   * Start background mod fetching service
   */
  static startBackgroundFetching(): void {
    if (this.backgroundFetching) {
      log(LOG_LEVEL.INFO, "Background mod fetching already running");
      return;
    }

    this.backgroundFetching = true;
    log(LOG_LEVEL.INFO, "Starting background mod fetching service");

    // Start the background fetching process with longer intervals
    this.backgroundFetchInterval = setInterval(async () => {
      try {
        await this.fetchNextBatchOfMods();
      } catch (error) {
        console.error("Error in background mod fetching:", error);
      }
    }, 30000); // Check every 30 seconds instead of 5 seconds
  }

  /**
   * Stop background mod fetching service
   */
  static stopBackgroundFetching(): void {
    if (!this.backgroundFetching) {
      return;
    }

    this.backgroundFetching = false;
    if (this.backgroundFetchInterval) {
      clearInterval(this.backgroundFetchInterval);
      this.backgroundFetchInterval = null;
    }
    log(LOG_LEVEL.INFO, "Stopped background mod fetching service");
  }

  /**
   * Get background fetching status
   */
  static isBackgroundFetching(): boolean {
    return this.backgroundFetching;
  }

  /**
   * Fetch next batch of mods for background processing
   */
  private static async fetchNextBatchOfMods(): Promise<void> {
    // Throttle background fetches
    const now = Date.now();
    if (now - this.lastBackgroundFetch < this.BACKGROUND_FETCH_THROTTLE) {
      return;
    }
    this.lastBackgroundFetch = now;

    // Check if we have tokens available
    if (!this.canMakeRequest()) {
      return; // Wait for more tokens
    }

    try {
      // Get the next batch of mods to fetch
      const nextMods = await this.getNextModsToFetch();

      if (nextMods.length === 0) {
        // No more mods to fetch, we can stop or wait
        return;
      }

      // Fetch mod details for each mod in the batch
      for (const modId of nextMods) {
        if (!this.canMakeRequest()) {
          // Wait for more tokens before continuing
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        try {
          const modDetails = await this.getModDetails(modId);

          // Store in cache
          await modCache.setMod(modDetails as CurseForgeModData);

          log(
            LOG_LEVEL.DEBUG,
            `Background: Fetched mod ${modId} - ${modDetails.name}`
          );
        } catch (error) {
          console.error(`Background: Failed to fetch mod ${modId}:`, error);
        }
      }
    } catch (error) {
      console.error("Background: Error fetching mod batch:", error);
    }
  }

  /**
   * Get next batch of mod IDs to fetch (mods not in cache)
   */
  private static async getNextModsToFetch(): Promise<number[]> {
    try {
      // Get popular mods first (higher priority)
      const popularResults = await this.searchMods(
        "",
        undefined,
        "popularity",
        "desc",
        50
      );

      // Get mods by category
      const categories = await this.getCategories();
      const categoryMods: number[] = [];

      for (const category of categories.slice(0, 5)) {
        // Limit to top 5 categories
        try {
          const categoryResults = await this.searchMods(
            "",
            category.id,
            "popularity",
            "desc",
            20
          );
          categoryMods.push(...categoryResults.mods.map((m) => m.id));
        } catch (error) {
          console.error(
            `Background: Failed to fetch category ${category.name}:`,
            error
          );
        }
      }

      // Combine and deduplicate
      const allModIds = [...popularResults.mods.map((m) => m.id), ...categoryMods];
      const uniqueModIds = [...new Set(allModIds)];

      // Filter out mods already in cache
      const uncachedModIds: number[] = [];
      for (const modId of uniqueModIds.slice(0, 5)) {
        // Reduced from 10 to 5
        // Limit batch size
        const cached = await modCache.getMod(modId);
        if (!cached) {
          uncachedModIds.push(modId);
        }
      }

      return uncachedModIds;
    } catch (error) {
      console.error("Background: Error getting next mods to fetch:", error);
      return [];
    }
  }

  static async getGames(
    index: number = 0,
    pageSize: number = 50
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        index: index.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await this.makeRequest(`/games?${params}`);
      return response;
    } catch (error) {
      console.error("Failed to get games:", error);
      throw error;
    }
  }

  static async getGame(gameId: number): Promise<any> {
    try {
      const response = await this.makeRequest(`/games/${gameId}`);
      return response;
    } catch (error) {
      console.error("Failed to get game:", error);
      throw error;
    }
  }

  /**
   * Check API key configuration and return diagnostic information
   */
  static checkApiKeyConfiguration(): {
    hasApiKey: boolean;
    source: "env" | "file" | "none";
    keyLength: number;
    isValidFormat: boolean;
    message: string;
  } {
    const apiKey = process.env.CURSEFORGE_API_KEY;
    let fileKey = "";

    // Try to read from .env.local file
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");
        const curseforgeLine = lines.find((line) =>
          line.trim().startsWith("CURSEFORGE_API_KEY=")
        );
        if (curseforgeLine) {
          const keyPart = curseforgeLine.split("=")[1]?.trim() || "";
          fileKey = keyPart.replace(/^["']|["']$/g, "");
        }
      }
    } catch (error) {
      console.error("Error reading API key from .env.local:", error);
    }

    // Determine which key to use
    let finalKey = "";
    let source: "env" | "file" | "none" = "none";

    if (fileKey && fileKey.length >= 32) {
      finalKey = fileKey;
      source = "file";
    } else if (apiKey && apiKey.length >= 32) {
      finalKey = apiKey;
      source = "env";
    }

    const isValidFormat =
      finalKey.length >= 32 && /^[a-zA-Z0-9]+$/.test(finalKey);

    let message = "";
    if (!finalKey) {
      message =
        "No API key found. Please add CURSEFORGE_API_KEY to your .env.local file or environment variables.";
    } else if (finalKey.length < 32) {
      message =
        "API key appears to be truncated. Please check your .env.local file or environment variable configuration.";
    } else if (!isValidFormat) {
      message =
        "API key format appears invalid. CurseForge API keys should be alphanumeric and at least 32 characters long.";
    } else {
      message = `API key configured successfully (${source === "file" ? "from .env.local file" : "from environment variable"}).`;
    }

    return {
      hasApiKey: !!finalKey,
      source,
      keyLength: finalKey.length,
      isValidFormat,
      message,
    };
  }
}
