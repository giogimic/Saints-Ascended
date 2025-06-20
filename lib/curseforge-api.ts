import fs from "fs";
import path from "path";
import { modCacheClient } from "./mod-cache-client";
import { getGlobalCurseForgeApiKey } from "./global-settings";
import {
  CurseForgeModData,
  CurseForgeSearchResponse,
} from "../types/curseforge";

/**
 * Validates CurseForge API key format
 * CurseForge API keys use BCrypt hash format: $2a$10$[53 character base64-like string]
 * Length: Exactly 60 characters
 * Pattern: ^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$
 */
export function isValidCurseForgeApiKey(key: string): boolean {
  if (!key) return false;
  
  // BCrypt hash format (current CurseForge standard)
  if (key.length === 60 && /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(key)) {
    return true;
  }
  
  // Legacy alphanumeric format (fallback)
  if (key.length >= 32 && /^[a-zA-Z0-9]+$/.test(key)) {
    return true;
  }
  
  return false;
}

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
  constructor(retryAfter: number = 60) {
    super("Rate limit exceeded", 429, "RATE_LIMIT", retryAfter);
    this.name = "CurseForgeRateLimitError";
  }
}

export class CurseForgeAuthenticationError extends CurseForgeAPIError {
  constructor() {
    super("Authentication failed", 401, "AUTH_FAILED");
    this.name = "CurseForgeAuthenticationError";
  }
}

export class CurseForgeForbiddenError extends CurseForgeAPIError {
  constructor() {
    super("Access forbidden", 403, "FORBIDDEN");
    this.name = "CurseForgeForbiddenError";
  }
}

export class CurseForgeTimeoutError extends CurseForgeAPIError {
  constructor() {
    super("Request timeout", 408, "TIMEOUT");
    this.name = "CurseForgeTimeoutError";
  }
}

export class CurseForgeNetworkError extends CurseForgeAPIError {
  constructor(message: string) {
    super(`Network error: ${message}`, 0, "NETWORK_ERROR");
    this.name = "CurseForgeNetworkError";
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
export type SortField = "name" | "popularity" | "size" | "updated" | "downloads";
const SORT_FIELD_MAP: Record<SortField, number> = {
  name: 1,        // Alphabetical
  popularity: 2,  // Download count + featured status
  size: 3,        // File size
  updated: 4,     // Last update date
  downloads: 6,   // Total downloads
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

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  tokens: 100, // Increased from 1 to 100 tokens per minute
  windowMs: 60 * 1000, // 1 minute window
  maxConcurrent: 3, // Maximum 3 concurrent requests
};

export class CurseForgeAPI {
  private static readonly BASE_URL = "https://api.curseforge.com/v1";
  private static GAME_ID = 83374; // ARK: Survival Ascended
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second
  private static rateLimitInfo: RateLimitInfo | null = null;

  // Token bucket: Optimized for maximum throughput while staying under limits
  // CurseForge API documentation suggests ~200 requests per minute, we use 90% for safety
  private static tokenBucket = new TokenBucket(180, 180 / 60000); // 180 tokens per minute (90% of 200 for safety)

  // Background fetching throttling - optimized for faster cache population
  private static backgroundFetching = false;
  private static backgroundFetchInterval: NodeJS.Timeout | null = null;
  private static lastBackgroundFetch = 0;
  private static readonly BACKGROUND_FETCH_THROTTLE = 15000; // 15 seconds between fetches (reduced from 30)

  // Request batching to prevent overwhelming the API
  // Enhanced request deduplication and queue management
  private static pendingRequests: Map<string, Promise<any>> = new Map();
  private static requestQueue: Array<{ 
    key: string; 
    resolve: (value: any) => void; 
    reject: (reason: any) => void; 
    request: () => Promise<any>;
    retryCount: number;
    timestamp: number;
  }> = [];
  
  // Queue processing with optimized concurrency for maximum throughput
  private static isProcessingQueue = false;
  private static readonly MAX_CONCURRENT_REQUESTS = 8; // Increased from 2 to 8 for maximum parallel processing
  private static activeRequests = 0;
  private static readonly REQUEST_TIMEOUT = 30000; // 30s timeout
  private static readonly RETRY_DELAYS = [500, 1000, 2000]; // Faster retry delays for quicker recovery

  // Optimized page sizes - stay at 90% of max to prevent hitting limits
  private static readonly OPTIMAL_PAGE_SIZE = 45; // 90% of max 50
  private static readonly MAX_TOTAL_RESULTS = 9000; // 90% of max 10,000

  /**
   * Get API key with fallback to reading from .env files
   */
  private static getApiKey(): string {
    // First, try to get API key from global settings (primary source)
    const globalApiKey = getGlobalCurseForgeApiKey();
    if (globalApiKey && isValidCurseForgeApiKey(globalApiKey)) {
      log(LOG_LEVEL.INFO, `Using API key from global settings (length: ${globalApiKey.length}, format: ${globalApiKey.startsWith('$2') ? 'BCrypt' : 'Legacy'})`);
      return globalApiKey;
    }

    // Fallback to environment variable for backward compatibility
    const apiKey = process.env.CURSEFORGE_API_KEY;
    if (apiKey && isValidCurseForgeApiKey(apiKey)) {
      log(LOG_LEVEL.INFO, `Using API key from environment variable (length: ${apiKey.length}, format: ${apiKey.startsWith('$2') ? 'BCrypt' : 'Legacy'})`);
      return apiKey;
    }

    // No valid API key found
    log(LOG_LEVEL.ERROR, "No valid CurseForge API key found in Global Settings or environment variables");
    throw new CurseForgeAuthenticationError();
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
    // Create a unique key for this request
    const requestKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Check if this exact request is already pending
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey) as Promise<T>;
    }

    // If we're at max concurrent requests, queue this request
    if (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push({
          key: requestKey,
          resolve,
          reject,
          request: () => this.executeRequest<T>(endpoint, options, retryCount),
          retryCount: 0,
          timestamp: Date.now()
        });
        
        // Start processing queue if not already processing
        if (!this.isProcessingQueue) {
          this.processRequestQueue();
        }
      });
    }

    // Execute the request immediately
    return this.executeRequest<T>(endpoint, options, retryCount);
  }

  /**
   * Execute the actual request with rate limiting and error handling
   */
  private static async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const requestKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Create the promise and store it
    const requestPromise = this.performRequest<T>(endpoint, options, retryCount);
    this.pendingRequests.set(requestKey, requestPromise);
    this.activeRequests++;

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up
      this.pendingRequests.delete(requestKey);
      this.activeRequests--;
      
      // Process next request in queue
      if (this.requestQueue.length > 0) {
        this.processRequestQueue();
      }
    }
  }

  /**
   * Process the request queue
   */
  private static async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0 && this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
      const queuedRequest = this.requestQueue.shift();
      if (queuedRequest) {
        try {
          const result = await queuedRequest.request();
          queuedRequest.resolve(result);
        } catch (error) {
          queuedRequest.reject(error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Perform the actual HTTP request
   */
  private static async performRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Wait for token bucket
    await this.tokenBucket.consume();

    // Add timeout to prevent hanging requests - use configurable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      log(LOG_LEVEL.WARN, `Request to ${endpoint} timed out after ${this.REQUEST_TIMEOUT}ms`);
      controller.abort();
    }, this.REQUEST_TIMEOUT);

    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new CurseForgeAuthenticationError();
      }

      log(LOG_LEVEL.DEBUG, `Making request to ${this.BASE_URL}${endpoint}`);
      
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
          "User-Agent": "Saints-Ascended/1.0",
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Update rate limit info
      this.updateRateLimitInfo(response);

      if (response.ok) {
        log(LOG_LEVEL.DEBUG, `Successful response from ${endpoint} (${response.status})`);
        return await response.json();
      }

      // Handle specific error cases
      if (response.status === 401) {
        log(LOG_LEVEL.ERROR, `Authentication failed for ${endpoint}`);
        throw new CurseForgeAuthenticationError();
      }

      if (response.status === 403) {
        log(LOG_LEVEL.ERROR, `Access forbidden for ${endpoint}`);
        throw new CurseForgeForbiddenError();
      }

      if (response.status === 404) {
        log(LOG_LEVEL.WARN, `Resource not found: ${endpoint}`);
        throw new CurseForgeAPIError(`${endpoint} not found`, 404, "NOT_FOUND");
      }

      if (response.status === 429) {
        const retryAfter = this.getRetryAfterHeader(response);
        log(LOG_LEVEL.WARN, `Rate limit exceeded for ${endpoint}, retry after ${retryAfter}ms`);
        throw new CurseForgeRateLimitError(retryAfter);
      }

      // Handle other errors
      const errorData = await response.json().catch(() => ({}));
      log(LOG_LEVEL.ERROR, `HTTP error ${response.status} for ${endpoint}: ${errorData.errorMessage || 'Unknown error'}`);
      throw new CurseForgeAPIError(
        errorData.errorMessage || `HTTP ${response.status}`,
        response.status,
        errorData.errorCode
      );
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network errors with retry logic
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        const errorCause = (error as any).cause;
        const isConnectionError = errorCause?.code === 'ECONNRESET' || 
                                errorCause?.code === 'ENOTFOUND' ||
                                errorCause?.code === 'ETIMEDOUT' ||
                                errorCause?.code === 'ECONNREFUSED';

        if (isConnectionError && retryCount < this.MAX_RETRIES) {
          const backoffDelay = Math.pow(2, retryCount) * this.RETRY_DELAY;
          log(LOG_LEVEL.WARN, `Network error (${errorCause?.code}) for ${endpoint}, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          
          await this.delay(backoffDelay);
          return this.performRequest(endpoint, options, retryCount + 1);
        }

        log(LOG_LEVEL.ERROR, `Network error for ${endpoint}: ${errorCause?.code || error.message}`);
        throw new CurseForgeNetworkError(errorCause?.code || error.message);
      }

      // Handle AbortError (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        if (retryCount < this.MAX_RETRIES) {
          const backoffDelay = Math.pow(2, retryCount) * this.RETRY_DELAY;
          log(LOG_LEVEL.WARN, `Request timeout for ${endpoint}, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          
          await this.delay(backoffDelay);
          return this.performRequest(endpoint, options, retryCount + 1);
        }
        
        log(LOG_LEVEL.ERROR, `Request timeout for ${endpoint} after ${this.MAX_RETRIES} retries`);
        throw new CurseForgeTimeoutError();
      }

      // Re-throw CurseForge specific errors
      if (error instanceof CurseForgeAPIError) {
      throw error;
      }

      // Handle other unexpected errors
      log(LOG_LEVEL.ERROR, `Unexpected error for ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new CurseForgeAPIError(
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        "UNKNOWN_ERROR"
      );
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
    pageSize: number = this.OPTIMAL_PAGE_SIZE, // Use optimized page size by default
    page: number = 1,
    includeAllCategories: boolean = false
  ): Promise<{ mods: CurseForgeMod[]; totalCount: number; hasMore: boolean; fromCache: boolean }> {
    // Ensure we don't exceed API limits
    const safePageSize = Math.min(pageSize, this.OPTIMAL_PAGE_SIZE);
    const maxPage = Math.floor(this.MAX_TOTAL_RESULTS / safePageSize);
    const safePage = Math.min(page, maxPage);
    
    log(LOG_LEVEL.INFO, `Fetching from CurseForge API: ${JSON.stringify({
      searchQuery: searchFilter,
      categoryId: categoryId ? categoryId.toString() : "none",
      mappedSortField: sortField,
      sortOrder,
      pageSize: safePageSize,
      page: safePage
    })}`);

    try {
      // Try primary search strategy first
      const result = await this.performPrimarySearch(searchFilter, categoryId, sortField, sortOrder, safePageSize, safePage);
      if (result.mods.length > 0) {
        return result;
      }
      
      // If primary search fails or returns no results, try fallback strategies
      log(LOG_LEVEL.INFO, `Primary search returned no results, trying fallback strategies...`);
      return await this.performFallbackSearch(searchFilter, categoryId, sortField, sortOrder, safePageSize, safePage);
      
    } catch (error: any) {
      log(LOG_LEVEL.ERROR, `CurseForge API search failed: ${error.message}`);
      
      // If it's a 404 error, try fallback strategies instead of throwing
      if (error.statusCode === 404) {
        log(LOG_LEVEL.INFO, `404 error detected, attempting fallback search strategies...`);
        try {
          return await this.performFallbackSearch(searchFilter, categoryId, sortField, sortOrder, safePageSize, safePage);
        } catch (fallbackError) {
          log(LOG_LEVEL.WARN, `All search strategies failed, returning empty results`);
          return { mods: [], totalCount: 0, hasMore: false, fromCache: false };
        }
      }
      
      throw error;
    }
  }

  /**
   * Primary search strategy using the exact search parameters
   */
  private static async performPrimarySearch(
    searchFilter: string,
    categoryId: number | undefined,
    sortField: SortField,
    sortOrder: "asc" | "desc",
    safePageSize: number,
    safePage: number
  ): Promise<{ mods: CurseForgeMod[]; totalCount: number; hasMore: boolean; fromCache: boolean }> {
    const searchParams = new URLSearchParams({
      gameId: this.GAME_ID.toString(),
      sortField: (SORT_FIELD_MAP[sortField] || SORT_FIELD_MAP.popularity).toString(),
      sortOrder,
      pageSize: safePageSize.toString(),
      index: ((safePage - 1) * safePageSize).toString(),
    });

    // Only add searchFilter if it's not empty and doesn't look like a category name
    if (searchFilter && searchFilter.trim() && !this.isCategoryLikeTerm(searchFilter)) {
      searchParams.append("searchFilter", searchFilter.trim());
    }

    if (categoryId) {
      searchParams.append("categoryId", categoryId.toString());
    }

    const response = await this.makeRequest<any>(
      `/mods/search?${searchParams.toString()}`
    );

    if (!response.data) {
      log(LOG_LEVEL.WARN, "No data in CurseForge API response");
      return { mods: [], totalCount: 0, hasMore: false, fromCache: false };
    }

    const mods: CurseForgeMod[] = response.data.map((mod: any) => ({
      ...mod,
      gameId: this.GAME_ID,
    }));

    const totalCount = response.pagination?.totalCount || mods.length;
    const hasMore = response.pagination ? 
      (response.pagination.index + response.pagination.resultCount) < response.pagination.totalCount :
      false;

    log(LOG_LEVEL.INFO, `✅ Primary search successful: ${mods.length} mods found`);
    
    return {
      mods,
      totalCount,
      hasMore,
      fromCache: false
    };
  }

  /**
   * Fallback search strategies when primary search fails
   */
  private static async performFallbackSearch(
    searchFilter: string,
    categoryId: number | undefined,
    sortField: SortField,
    sortOrder: "asc" | "desc",
    safePageSize: number,
    safePage: number
  ): Promise<{ mods: CurseForgeMod[]; totalCount: number; hasMore: boolean; fromCache: boolean }> {
    const strategies = [
      // Strategy 1: Search without searchFilter (category only)
      async () => {
        if (categoryId) {
          log(LOG_LEVEL.INFO, `Fallback 1: Searching by category ${categoryId} only`);
          return await this.performPrimarySearch("", categoryId, sortField, sortOrder, safePageSize, safePage);
        }
        throw new Error("No category for category-only search");
      },
      
      // Strategy 2: Popular mods without category
      async () => {
        log(LOG_LEVEL.INFO, `Fallback 2: Searching popular mods without category`);
        return await this.performPrimarySearch("", undefined, "popularity", "desc", safePageSize, safePage);
      },
      
      // Strategy 3: Popular mods with category if available
      async () => {
        if (categoryId) {
          log(LOG_LEVEL.INFO, `Fallback 3: Searching popular mods in category ${categoryId}`);
          return await this.performPrimarySearch("", categoryId, "popularity", "desc", safePageSize, safePage);
        }
        throw new Error("No category for category popular search");
      },
      
      // Strategy 4: Use simplified search terms
      async () => {
        if (searchFilter && searchFilter.trim()) {
          const simplifiedTerm = this.simplifySearchTerm(searchFilter);
          if (simplifiedTerm && simplifiedTerm !== searchFilter) {
            log(LOG_LEVEL.INFO, `Fallback 4: Trying simplified search term "${simplifiedTerm}"`);
            return await this.performPrimarySearch(simplifiedTerm, categoryId, sortField, sortOrder, safePageSize, safePage);
          }
        }
        throw new Error("No simplified term available");
      }
    ];

    // Try each strategy until one succeeds
    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i]();
        if (result.mods.length > 0) {
          log(LOG_LEVEL.INFO, `✅ Fallback strategy ${i + 1} successful: ${result.mods.length} mods found`);
          return result;
        }
      } catch (error) {
        log(LOG_LEVEL.DEBUG, `Fallback strategy ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }

    // If all strategies fail, return empty results
    log(LOG_LEVEL.WARN, "All fallback strategies failed, returning empty results");
    return { mods: [], totalCount: 0, hasMore: false, fromCache: false };
  }

  /**
   * Check if a search term looks like a category name that might not work as a search filter
   */
  private static isCategoryLikeTerm(term: string): boolean {
    const categoryLikeTerms = [
      'overhaul', 'qol', 'general', 'rpg', 'cosmetic', 'popular', 'map', 'maps',
      'creature', 'creatures', 'building', 'buildings', 'utility', 'utilities',
      'admin', 'server', 'client', 'ui', 'interface', 'hud'
    ];
    
    return categoryLikeTerms.some(catTerm => 
      term.toLowerCase().includes(catTerm) || catTerm.includes(term.toLowerCase())
    );
  }

  /**
   * Simplify search terms to more generic versions that might work better
   */
  private static simplifySearchTerm(term: string): string | null {
    const simplifications: Record<string, string> = {
      'overhaul': 'mod',
      'total conversion': 'conversion',
      'qol': 'quality',
      'cosmetic': 'skin',
      'building': 'build',
      'creature': 'dino',
      'admin': 'tool'
    };

    const lowerTerm = term.toLowerCase();
    for (const [complex, simple] of Object.entries(simplifications)) {
      if (lowerTerm.includes(complex)) {
        return simple;
      }
    }
    
    // If term is very long, try first word only
    const words = term.trim().split(/\s+/);
    if (words.length > 2) {
      return words[0];
    }
    
    return null;
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
      const cachedMod = await modCacheClient.getMod(modId);

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
      await modCacheClient.setMod(data.data as CurseForgeModData);

      return data.data;
    } catch (error) {
      console.error(`Failed to get mod details for ${modId}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple mods by IDs using the bulk endpoint
   * This is more efficient than calling getModDetails for each mod individually
   */
  static async getModsByIds(modIds: number[]): Promise<CurseForgeMod[]> {
    try {
      if (!modIds || modIds.length === 0) {
        return [];
      }

      // Validate mod IDs
      const validModIds = modIds.filter(id => id && id > 0);
      if (validModIds.length === 0) {
        return [];
      }

      // Check cache first for each mod
      const cachedMods: CurseForgeMod[] = [];
      const uncachedModIds: number[] = [];

      for (const modId of validModIds) {
        const cachedMod = await modCacheClient.getMod(modId);
        if (cachedMod) {
          cachedMods.push(cachedMod as CurseForgeMod);
        } else {
          uncachedModIds.push(modId);
        }
      }

      // If all mods are cached, return them
      if (uncachedModIds.length === 0) {
        log(LOG_LEVEL.DEBUG, `All ${validModIds.length} mods found in cache`);
        return cachedMods;
      }

      log(LOG_LEVEL.DEBUG, `Fetching ${uncachedModIds.length} mods from API (${cachedMods.length} from cache)`);

      // Fetch uncached mods using bulk endpoint
      const requestBody = {
        modIds: uncachedModIds,
        filterPcOnly: true // Filter for PC-compatible mods only
      };

      const data = await this.makeRequest<{ data: CurseForgeMod[] }>(
        `/mods`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Store fetched mods in cache
      for (const mod of data.data) {
        await modCacheClient.setMod(mod as CurseForgeModData);
      }

      // Combine cached and fetched mods
      const allMods = [...cachedMods, ...data.data];

      log(LOG_LEVEL.DEBUG, `Successfully fetched ${data.data.length} mods from API, total: ${allMods.length}`);

      return allMods;
    } catch (error) {
      console.error(`Failed to get mods by IDs [${modIds.join(', ')}]:`, error);
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
   * Get featured mods for enhanced discovery
   */
  static async getFeaturedMods(
    gameId: number = this.GAME_ID,
    excludedModIds: number[] = []
  ): Promise<CurseForgeMod[]> {
    try {
      const data = await this.makeRequest<{data: {featured: CurseForgeMod[]}}>(
        '/mods/featured',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            excludedModIds,
            gameVersionTypeId: null
          })
        }
      );
      
      log(LOG_LEVEL.DEBUG, `Successfully fetched ${data.data.featured.length} featured mods`);
      return data.data.featured;
    } catch (error) {
      console.error("Failed to get featured mods:", error);
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
      capacity: 180, // Updated to match actual token bucket capacity
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
    // Prevent multiple instances
    if (this.backgroundFetching) {
      log(LOG_LEVEL.WARN, "Background fetching is already running");
      return;
    }

    // Check if we can make requests
    if (!this.canMakeRequest()) {
      log(LOG_LEVEL.WARN, "Cannot start background fetching: rate limited or no tokens");
      return;
    }

    this.backgroundFetching = true;
    log(LOG_LEVEL.INFO, "Starting background mod fetching service");

    // Use a more conservative interval to prevent overwhelming the API
    this.backgroundFetchInterval = setInterval(async () => {
      try {
        // Check if we should throttle
        const now = Date.now();
        if (now - this.lastBackgroundFetch < this.BACKGROUND_FETCH_THROTTLE) {
          return;
        }

        // Check if we can make requests
        if (!this.canMakeRequest()) {
          log(LOG_LEVEL.DEBUG, "Skipping background fetch: rate limited");
          return;
        }

        // Check if there are already too many active requests
        if (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
          log(LOG_LEVEL.DEBUG, "Skipping background fetch: too many active requests");
          return;
        }

        this.lastBackgroundFetch = now;
        await this.fetchNextBatchOfMods();
      } catch (error) {
        log(LOG_LEVEL.ERROR, "Background fetch error:", error);
      }
    }, this.BACKGROUND_FETCH_THROTTLE);
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
      log(LOG_LEVEL.DEBUG, "Background: No tokens available, skipping fetch");
      return; // Wait for more tokens
    }

    try {
      // Get the next batch of mods to fetch
      const nextMods = await this.getNextModsToFetch();

      if (nextMods.length === 0) {
        log(LOG_LEVEL.DEBUG, "Background: No more mods to fetch");
        return;
      }

      log(LOG_LEVEL.INFO, `Background: Fetching ${nextMods.length} mods`);

      // Process mods sequentially with delays to prevent overwhelming the system
      for (const modId of nextMods) {
        if (!this.canMakeRequest()) {
          // Wait for more tokens before continuing
          log(LOG_LEVEL.DEBUG, "Background: Waiting for tokens...");
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased delay
          continue;
        }

        try {
          // Add timeout to individual mod requests
          const modDetails = await Promise.race([
            this.getModDetails(modId),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Mod fetch timeout')), 10000)
            )
          ]) as CurseForgeMod;

          // Store in cache
          await modCacheClient.setMod(modDetails as CurseForgeModData);

          log(
            LOG_LEVEL.DEBUG,
            `Background: Fetched mod ${modId} - ${modDetails.name}`
          );

          // Add delay between mod fetches to prevent overwhelming the system
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Background: Failed to fetch mod ${modId}:`, error);
          // Add delay even on error to prevent rapid retries
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
        const cached = await modCacheClient.getMod(modId);
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
    source: "global" | "env" | "file" | "none";
    keyLength: number;
    isValidFormat: boolean;
    message: string;
  } {
    // Check global settings first
    const globalApiKey = getGlobalCurseForgeApiKey();
    if (globalApiKey && isValidCurseForgeApiKey(globalApiKey)) {
      return {
        hasApiKey: true,
        source: "global",
        keyLength: globalApiKey.length,
        isValidFormat: true,
        message: `API key found in global settings (${globalApiKey.startsWith('$2') ? 'BCrypt' : 'Legacy'} format, ${globalApiKey.length} chars)`
      };
    }

    // Fallback to environment variable for backward compatibility
    const apiKey = process.env.CURSEFORGE_API_KEY;
    let fileKey = "";

    // Use centralized validation function

    // Try to read from .env.local file
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");
        const curseforgeLine = lines.find(line => 
          line.trim().startsWith("CURSEFORGE_API_KEY=")
        );

        if (curseforgeLine) {
          const keyValue = curseforgeLine.split("=", 2)[1]?.trim();
          if (keyValue) {
            fileKey = keyValue.replace(/^["']|["']$/g, "");
          }
        }
      }
    } catch (error) {
      // Ignore file reading errors
    }

    let finalKey = "";
    let source: "global" | "env" | "file" | "none" = "none";

    if (fileKey && isValidCurseForgeApiKey(fileKey)) {
      finalKey = fileKey;
      source = "file";
    } else if (apiKey && isValidCurseForgeApiKey(apiKey)) {
      finalKey = apiKey;
      source = "env";
    }

    // Validate format using centralized function
    const isValidFormat = isValidCurseForgeApiKey(finalKey);

    let message = "";
    if (finalKey) {
      const keyFormat = finalKey.startsWith('$2') ? "BCrypt hash" : "Legacy alphanumeric";
      message = `API key found in ${source} (${keyFormat} format, ${finalKey.length} chars)`;
    } else {
      message = "No valid API key found. Please configure your CurseForge API key in global settings or environment variables.";
    }

    return {
      hasApiKey: !!finalKey,
      source,
      keyLength: finalKey.length,
      isValidFormat,
      message
    };
  }

  /**
   * Clear all pending requests and queue
   */
  static clearPendingRequests(): void {
    this.pendingRequests.clear();
    this.requestQueue = [];
    this.activeRequests = 0;
    this.isProcessingQueue = false;
    console.log("[CurseForgeAPI] All pending requests and queue cleared");
  }

  /**
   * Get queue status for debugging
   */
  static getQueueStatus(): {
    pendingRequests: number;
    queueLength: number;
    activeRequests: number;
    isProcessingQueue: boolean;
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests,
      isProcessingQueue: this.isProcessingQueue
    };
  }

  /**
   * Parallel category processing for maximum cache population
   * Fetches mods from multiple categories simultaneously to maximize API efficiency
   */
  static async populateMultipleCategoriesParallel(
    categories: number[],
    sortField: SortField = "popularity",
    sortOrder: "asc" | "desc" = "desc",
    pagesPerCategory: number = 5
  ): Promise<{
    totalMods: number;
    categoriesProcessed: number;
    errors: string[];
  }> {
    log(LOG_LEVEL.INFO, `Starting parallel category population for ${categories.length} categories`);
    
    const results = {
      totalMods: 0,
      categoriesProcessed: 0,
      errors: [] as string[]
    };

    // Process categories in batches to respect concurrent request limits
    const batchSize = this.MAX_CONCURRENT_REQUESTS;
    const categoryBatches = [];
    
    for (let i = 0; i < categories.length; i += batchSize) {
      categoryBatches.push(categories.slice(i, i + batchSize));
    }

    for (const batch of categoryBatches) {
      const batchPromises = batch.map(async (categoryId) => {
        try {
          let categoryModCount = 0;
          
          // Fetch multiple pages per category for maximum coverage
          for (let page = 1; page <= pagesPerCategory; page++) {
            try {
              const categoryResult = await this.searchMods(
                "", // Empty search to get all mods in category
                categoryId,
                sortField,
                sortOrder,
                this.OPTIMAL_PAGE_SIZE,
                page
              );
              
              categoryModCount += categoryResult.mods.length;
              
              // Break if no more pages
              if (!categoryResult.hasMore || categoryResult.mods.length === 0) {
                break;
              }
              
              // Small delay between pages to be respectful
              await this.delay(100);
            } catch (pageError: any) {
              log(LOG_LEVEL.WARN, `Failed to fetch page ${page} for category ${categoryId}: ${pageError.message}`);
              break; // Stop processing this category if a page fails
            }
          }
          
          return { categoryId, modCount: categoryModCount, success: true };
        } catch (error: any) {
          log(LOG_LEVEL.ERROR, `Failed to process category ${categoryId}: ${error.message}`);
          return { categoryId, modCount: 0, success: false, error: error.message };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { categoryId, modCount, success, error } = result.value;
          if (success) {
            results.totalMods += modCount;
            results.categoriesProcessed++;
            log(LOG_LEVEL.INFO, `✅ Category ${categoryId}: ${modCount} mods processed`);
          } else {
            results.errors.push(`Category ${categoryId}: ${error}`);
          }
        } else {
          results.errors.push(`Batch processing failed: ${result.reason}`);
        }
      });

      // Delay between batches to prevent overwhelming the API
      if (categoryBatches.indexOf(batch) < categoryBatches.length - 1) {
        await this.delay(1000);
      }
    }

    log(LOG_LEVEL.INFO, `Parallel category population completed: ${results.totalMods} total mods, ${results.categoriesProcessed}/${categories.length} categories processed`);
    
    return results;
  }
}
