// lib/mod-service-optimized.ts
// Strategy 2: Backend cache aggregation and dedicated warming service

import { modCache } from './mod-cache';
import { CurseForgeAPI } from './curseforge-api';

interface CategoryConfig {
  query?: string;
  categoryId?: number;
  priority: number; // Higher priority = warmed more frequently
}

interface CacheWarmingSchedule {
  categoryKey: string;
  lastWarmed: number;
  nextWarm: number;
  priority: number;
}

class ModServiceOptimized {
  private warmingSchedule = new Map<string, CacheWarmingSchedule>();
  private isWarming = false;
  private warmingInterval: NodeJS.Timeout | null = null;
  
  // Category configurations with priorities
  private readonly categoryConfigs: Record<string, CategoryConfig> = {
    "Popular": { query: "", priority: 10 },
    "QoL": { query: "quality of life", priority: 9 },
    "Maps": { categoryId: 17, priority: 8 },
    "RPG": { query: "rpg progression", priority: 7 },
    "Overhauls": { query: "overhaul total conversion", priority: 6 },
    "General": { query: "utility building", priority: 5 },
    "Custom Cosmetics": { query: "cosmetic decoration", priority: 4 }
  };

  private readonly WARMING_INTERVALS = {
    HIGH_PRIORITY: 10 * 60 * 1000, // 10 minutes for priority >= 8
    MEDIUM_PRIORITY: 30 * 60 * 1000, // 30 minutes for priority 5-7
    LOW_PRIORITY: 60 * 60 * 1000 // 1 hour for priority < 5
  };

  constructor() {
    this.initializeWarmingSchedule();
  }

  // Initialize warming schedule for all categories
  private initializeWarmingSchedule(): void {
    const now = Date.now();
    
    Object.entries(this.categoryConfigs).forEach(([category, config]) => {
      const interval = this.getWarmingInterval(config.priority);
      this.warmingSchedule.set(category, {
        categoryKey: category,
        lastWarmed: 0, // Never warmed
        nextWarm: now, // Warm immediately
        priority: config.priority
      });
    });
  }

  // Get warming interval based on priority
  private getWarmingInterval(priority: number): number {
    if (priority >= 8) return this.WARMING_INTERVALS.HIGH_PRIORITY;
    if (priority >= 5) return this.WARMING_INTERVALS.MEDIUM_PRIORITY;
    return this.WARMING_INTERVALS.LOW_PRIORITY;
  }

  // Aggregate search for multiple categories
  async searchMultipleCategories(categories: string[]): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};
    
    // Batch requests for efficiency
    const promises = categories.map(async (category) => {
      try {
        const data = await this.searchCategory(category);
        results[category] = data;
      } catch (error) {
        console.error(`Failed to search category ${category}:`, error);
        results[category] = [];
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Search single category with cache optimization
  async searchCategory(category: string): Promise<any[]> {
    const config = this.categoryConfigs[category];
    if (!config) {
      throw new Error(`Unknown category: ${category}`);
    }

    // Try cache first
    const cached = await modCache.searchMods(
      config.query || "",
      config.categoryId?.toString(),
      "popularity",
      "desc",
      1,
      20
    );

    if (cached.data && cached.data.length > 0) {
      return cached.data;
    }

    // Fetch from API and cache
    const mods = await CurseForgeAPI.searchMods(
      config.query || "",
      config.categoryId,
      "popularity",
      "desc",
      20
    );

    // Store in cache
    if (mods && mods.length > 0) {
      await modCache.setSearchResults(
        config.query || "",
        config.categoryId?.toString(),
        "popularity",
        "desc",
        1,
        20,
        mods,
        mods.length
      );
    }

    return mods || [];
  }

  // Start cache warming service
  startCacheWarming(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
    }

    // Check for warming every 5 minutes
    this.warmingInterval = setInterval(() => {
      this.performCacheWarming();
    }, 5 * 60 * 1000);

    // Perform initial warming
    this.performCacheWarming();
  }

  // Stop cache warming service
  stopCacheWarming(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }
  }

  // Perform cache warming for due categories
  private async performCacheWarming(): Promise<void> {
    if (this.isWarming) return;

    this.isWarming = true;
    const now = Date.now();
    
    try {
      // Get categories that need warming, sorted by priority
      const dueCategories = Array.from(this.warmingSchedule.values())
        .filter(schedule => now >= schedule.nextWarm)
        .sort((a, b) => b.priority - a.priority); // High priority first

      console.log(`Cache warming: ${dueCategories.length} categories due for warming`);

      // Warm categories sequentially to avoid overwhelming the API
      for (const schedule of dueCategories) {
        try {
          await this.warmCategory(schedule.categoryKey);
          
          // Update schedule
          const interval = this.getWarmingInterval(schedule.priority);
          schedule.lastWarmed = now;
          schedule.nextWarm = now + interval;
          
          console.log(`Warmed cache for category: ${schedule.categoryKey}`);
          
          // Small delay between warming operations
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Failed to warm category ${schedule.categoryKey}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Cache warming error:', error);
    } finally {
      this.isWarming = false;
    }
  }

  // Warm specific category cache
  private async warmCategory(category: string): Promise<void> {
    const config = this.categoryConfigs[category];
    if (!config) return;

    // Fetch fresh data from API
    const mods = await CurseForgeAPI.searchMods(
      config.query || "",
      config.categoryId,
      "popularity",
      "desc",
      20
    );

    // Update cache
    if (mods && mods.length > 0) {
      await modCache.setSearchResults(
        config.query || "",
        config.categoryId?.toString(),
        "popularity",
        "desc",
        1,
        20,
        mods,
        mods.length
      );
    }
  }

  // Force warm all categories immediately
  async forceWarmAllCategories(): Promise<void> {
    console.log('Force warming all categories...');
    
    const categories = Object.keys(this.categoryConfigs);
    for (const category of categories) {
      try {
        await this.warmCategory(category);
        console.log(`Force warmed: ${category}`);
        
        // Update schedule
        const schedule = this.warmingSchedule.get(category);
        if (schedule) {
          const now = Date.now();
          const interval = this.getWarmingInterval(schedule.priority);
          schedule.lastWarmed = now;
          schedule.nextWarm = now + interval;
        }
        
        // Delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to force warm ${category}:`, error);
      }
    }
    
    console.log('Force warming completed');
  }

  // Get cache warming status
  getCacheWarmingStatus(): { 
    isWarming: boolean; 
    schedule: { category: string; lastWarmed: Date; nextWarm: Date; priority: number }[];
  } {
    const schedule = Array.from(this.warmingSchedule.values()).map(s => ({
      category: s.categoryKey,
      lastWarmed: new Date(s.lastWarmed || 0),
      nextWarm: new Date(s.nextWarm),
      priority: s.priority
    }));

    return {
      isWarming: this.isWarming,
      schedule: schedule.sort((a, b) => b.priority - a.priority)
    };
  }

  // Get cache statistics for all categories
  async getCacheStatistics(): Promise<Record<string, { 
    cached: boolean; 
    size: number; 
    lastUpdated: Date | null;
  }>> {
    const stats: Record<string, { cached: boolean; size: number; lastUpdated: Date | null }> = {};
    
    for (const [category, config] of Object.entries(this.categoryConfigs)) {
      try {
        const cached = await modCache.searchMods(
          config.query || "",
          config.categoryId?.toString(),
          "popularity",
          "desc",
          1,
          20
        );
        
        stats[category] = {
          cached: cached.data && cached.data.length > 0,
          size: cached.data?.length || 0,
          lastUpdated: cached.data && cached.data.length > 0 ? new Date() : null
        };
      } catch (error) {
        stats[category] = {
          cached: false,
          size: 0,
          lastUpdated: null
        };
      }
    }
    
    return stats;
  }
}

// Export singleton instance
export const modServiceOptimized = new ModServiceOptimized(); 