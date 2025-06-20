import { loadGlobalSettings } from "./global-settings";
import { modCache } from "./mod-cache";
import { CurseForgeAPI } from "./curseforge-api";

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

// Category to search term mapping for background refresh
const CATEGORY_SEARCH_TERMS: { [key: string]: string[] } = {
  QoL: [
    "QoL",
    "Quality of Life",
    "Improvement",
    "Tweak",
    "Fix",
    "Enhancement",
    "Utility",
    "Optimization",
  ],
  RPG: [
    "RPG",
    "Roleplaying",
    "Roleplay",
    "Progression",
    "Skills",
    "Stats",
    "Leveling",
    "Classes",
  ],
  Maps: [
    "Map",
    "Maps",
    "Custom Map",
    "New Map",
    "Biome",
    "Terrain",
    "World",
    "Island",
  ],
  Popular: [
    "Popular",
    "Trending",
    "Top Rated",
    "Most Downloaded",
    "Hot",
    "Recommended",
  ],
  Overhauls: [
    "Overhaul",
    "Total Conversion",
    "Rework",
    "Expansion",
    "Revamp",
    "Modpack",
  ],
  General: ["General", "Utility", "Tool", "Helper", "Assistant", "Framework"],
  "Custom Cosmetics": [
    "Cosmetic",
    "Skin",
    "Texture",
    "Model",
    "Visual",
    "Appearance",
  ],
};

class CacheRefreshService {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private lastRefresh = 0;
  private readonly REFRESH_THROTTLE = 300000; // 5 minutes between refreshes

  /**
   * Start the background cache refresh service
   */
  start(): void {
    this.stop(); // Stop any existing interval

    const settings = loadGlobalSettings();
    if (!settings.cacheEnabled) {
      log(LOG_LEVEL.INFO, "Cache refresh service disabled in settings");
      return;
    }

    // Use a minimum interval of 1 hour to reduce spam
    const intervalMs =
      Math.max(settings.cacheRefreshInterval, 1) * 60 * 60 * 1000; // Convert hours to milliseconds

    log(
      LOG_LEVEL.INFO,
      `Starting cache refresh service with ${Math.max(settings.cacheRefreshInterval, 1)} hour interval`
    );

    this.refreshInterval = setInterval(() => {
      this.refreshAllCategories();
    }, intervalMs);

    // Initial refresh after a longer delay
    setTimeout(() => {
      this.refreshAllCategories();
    }, 30000); // 30 seconds delay instead of 5

    // Start background mod fetching service
    log(LOG_LEVEL.INFO, "Starting background mod fetching service...");
    CurseForgeAPI.startBackgroundFetching();
  }

  /**
   * Stop the background cache refresh service
   */
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      log(LOG_LEVEL.INFO, "Cache refresh service stopped");
    }

    // Stop background mod fetching service
    CurseForgeAPI.stopBackgroundFetching();
  }

  /**
   * Refresh all category caches
   */
  private async refreshAllCategories(): Promise<void> {
    // Throttle refreshes
    const now = Date.now();
    if (now - this.lastRefresh < this.REFRESH_THROTTLE) {
      log(LOG_LEVEL.DEBUG, "Cache refresh throttled, skipping...");
      return;
    }
    this.lastRefresh = now;

    if (this.isRefreshing) {
      log(LOG_LEVEL.DEBUG, "Cache refresh already in progress, skipping...");
      return;
    }

    this.isRefreshing = true;
    log(
      LOG_LEVEL.INFO,
      "Starting background cache refresh for all categories..."
    );

    try {
      const categories = Object.keys(CATEGORY_SEARCH_TERMS);
      const refreshPromises = categories.map((category) =>
        this.refreshCategory(category)
      );

      await Promise.allSettled(refreshPromises);

      log(LOG_LEVEL.INFO, "Background cache refresh completed");
    } catch (error) {
      console.error("Error during background cache refresh:", error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Refresh cache for a specific category
   */
  private async refreshCategory(category: string): Promise<void> {
    try {
      const searchTerms = CATEGORY_SEARCH_TERMS[category];
      const primarySearchTerm = searchTerms[0];
      const sortBy = category === "Popular" ? "popularity" : "name";
      const sortOrder = "desc";
      const pageSize = 50;

      log(
        LOG_LEVEL.DEBUG,
        `Refreshing cache for category: ${category} (${primarySearchTerm})`
      );

      // Fetch fresh data from CurseForge API
      const mods = await CurseForgeAPI.searchMods(
        primarySearchTerm,
        undefined, // No category ID filter
        sortBy as "name" | "popularity" | "size" | "updated",
        sortOrder as "asc" | "desc",
        pageSize
      );

      // Update cache with fresh data
      if (mods && mods.mods && mods.mods.length > 0) {
        await modCache.setSearchResults(
          primarySearchTerm,
          category,
          sortBy,
          sortOrder,
          1,
          pageSize,
          mods.mods,
          mods.totalCount
        );
        log(
          LOG_LEVEL.DEBUG,
          `Updated cache for ${category}: ${mods.mods.length} mods`
        );
      } else {
        log(LOG_LEVEL.DEBUG, `No mods found for category: ${category}`);
      }
    } catch (error) {
      console.error(`Error refreshing cache for category ${category}:`, error);
    }
  }

  /**
   * Manually trigger a cache refresh
   */
  async manualRefresh(): Promise<void> {
    log(LOG_LEVEL.INFO, "Manual cache refresh triggered");
    await this.refreshAllCategories();
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    isRefreshing: boolean;
    nextRefresh?: Date;
  } {
    const settings = loadGlobalSettings();
    const intervalMs = settings.cacheRefreshInterval * 60 * 60 * 1000;

    return {
      isRunning: this.refreshInterval !== null && settings.cacheEnabled,
      isRefreshing: this.isRefreshing,
      nextRefresh: this.refreshInterval
        ? new Date(Date.now() + intervalMs)
        : undefined,
    };
  }
}

// Export singleton instance
export const cacheRefreshService = new CacheRefreshService();

// Auto-start the service when this module is imported
if (typeof window === "undefined") {
  // Only run on server-side
  cacheRefreshService.start();
}
