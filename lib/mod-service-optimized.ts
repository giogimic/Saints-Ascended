// lib/mod-service-optimized.ts
// Strategy 2: Backend cache aggregation and dedicated warming service

import { modCache } from './mod-cache';
import { CurseForgeAPI } from './curseforge-api';
import { categoryAnalytics } from './category-analytics';

interface CategoryConfig {
  query?: string;
  categoryId?: number;
  priority: number; // Higher priority = warmed more frequently
  dynamicPriority?: number; // Updated based on analytics
}

interface CacheWarmingSchedule {
  categoryKey: string;
  lastWarmed: number;
  nextWarm: number;
  priority: number;
  dynamicPriority: number;
  analyticsScore: number;
}

class ModServiceOptimized {
  private warmingSchedule = new Map<string, CacheWarmingSchedule>();
  private isWarming = false;
  private warmingInterval: NodeJS.Timeout | null = null;
  private analyticsUpdateInterval: NodeJS.Timeout | null = null;
  
  // Category configurations with priorities (base priorities, will be enhanced by analytics)
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
    CRITICAL_PRIORITY: 5 * 60 * 1000, // 5 minutes for priority >= 9
    HIGH_PRIORITY: 10 * 60 * 1000, // 10 minutes for priority >= 7
    MEDIUM_PRIORITY: 30 * 60 * 1000, // 30 minutes for priority 5-6
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
        priority: config.priority,
        dynamicPriority: config.priority, // Start with base priority
        analyticsScore: 0 // Will be updated by analytics
      });
    });
  }

  // Get warming interval based on priority (now considers dynamic priority)
  private getWarmingInterval(priority: number): number {
    if (priority >= 9) return this.WARMING_INTERVALS.CRITICAL_PRIORITY;
    if (priority >= 7) return this.WARMING_INTERVALS.HIGH_PRIORITY;
    if (priority >= 5) return this.WARMING_INTERVALS.MEDIUM_PRIORITY;
    return this.WARMING_INTERVALS.LOW_PRIORITY;
  }

  // Aggregate search for multiple categories
  async searchMultipleCategories(categories: string[]): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};
    
    // Record analytics for these category searches
    categories.forEach(category => {
      const config = this.categoryConfigs[category];
      if (config) {
        categoryAnalytics.recordSearchPattern(
          config.query || category,
          0 // Will be updated after we get results
        );
      }
    });
    
    // Batch requests for efficiency
    const promises = categories.map(async (category) => {
      try {
        const data = await this.searchCategory(category);
        results[category] = data;
        
        // Update analytics with result count
        const config = this.categoryConfigs[category];
        if (config) {
          categoryAnalytics.recordSearchPattern(
            config.query || category,
            data.length
          );
        }
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

    // Record search pattern for analytics
    categoryAnalytics.recordSearchPattern(
      config.query || category,
      0 // Will be updated after we get results
    );

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
      // Update analytics with cached result count
      categoryAnalytics.recordSearchPattern(
        config.query || category,
        cached.data.length
      );
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
    if (mods && mods.mods && mods.mods.length > 0) {
      await modCache.setSearchResults(
        config.query || "",
        config.categoryId?.toString(),
        "popularity",
        "desc",
        1,
        20,
        mods.mods,
        mods.totalCount
      );

      // Update analytics with result count
      categoryAnalytics.recordSearchPattern(
        config.query || category,
        mods.mods.length
      );
    }

    return mods?.mods || [];
  }

  // Start cache warming service with analytics integration
  startCacheWarming(): void {
    // Check if we're in a build context (during Next.js build process)
    const isBuildTime = process.env.NODE_ENV === 'production' && 
                       (process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-production-optimize');

    if (isBuildTime) {
      console.log("Strategy 2: Cache warming service disabled during build time");
      return;
    }

    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
    }

    if (this.analyticsUpdateInterval) {
      clearInterval(this.analyticsUpdateInterval);
    }

    console.log("Strategy 2: Enhanced cache warming service started with analytics integration");

    // Start category analytics
    categoryAnalytics.startAnalytics();

    // Check for warming every 5 minutes
    this.warmingInterval = setInterval(() => {
      this.performCacheWarming();
    }, 5 * 60 * 1000);

    // Update priorities based on analytics every 15 minutes
    this.analyticsUpdateInterval = setInterval(() => {
      this.updatePrioritiesFromAnalytics();
    }, 15 * 60 * 1000);

    // Perform initial warming and priority update
    this.updatePrioritiesFromAnalytics();
    this.performCacheWarming();
  }

  // Stop cache warming service
  stopCacheWarming(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }

    if (this.analyticsUpdateInterval) {
      clearInterval(this.analyticsUpdateInterval);
      this.analyticsUpdateInterval = null;
    }

    // Stop category analytics
    categoryAnalytics.stopAnalytics();
  }

  // Update warming priorities based on analytics data
  private updatePrioritiesFromAnalytics(): void {
    console.log("Updating cache warming priorities based on analytics...");

    // Get popular categories from analytics
    const popularCategories = categoryAnalytics.getPopularCategories(20);
    const trendingCategories = categoryAnalytics.getTrendingCategories(10);
    const popularSearchPatterns = categoryAnalytics.getPopularSearchPatterns(15);

    // Create analytics score mapping
    const analyticsScores = new Map<string, number>();

    // Score based on popular categories
    popularCategories.forEach((cat, index) => {
      const boost = Math.max(0, 10 - index); // Top categories get higher boost
      analyticsScores.set(cat.name.toLowerCase(), cat.popularityScore + boost);
    });

    // Additional boost for trending categories
    trendingCategories.forEach((cat) => {
      const existing = analyticsScores.get(cat.name.toLowerCase()) || 0;
      analyticsScores.set(cat.name.toLowerCase(), existing + 5); // Trending boost
    });

    // Score based on search patterns
    popularSearchPatterns.forEach((pattern, index) => {
      const boost = Math.max(0, 5 - index * 0.5); // Diminishing boost
      
      // Find matching categories
      Object.entries(this.categoryConfigs).forEach(([categoryKey, config]) => {
        const categoryName = categoryKey.toLowerCase();
        const query = (config.query || categoryKey).toLowerCase();
        
        if (pattern.query.includes(query) || query.includes(pattern.query)) {
          const existing = analyticsScores.get(categoryName) || 0;
          analyticsScores.set(categoryName, existing + boost);
        }
      });
    });

    // Update warming schedules with new priorities
    for (const [categoryKey, schedule] of this.warmingSchedule.entries()) {
      const categoryName = categoryKey.toLowerCase();
      const analyticsScore = analyticsScores.get(categoryName) || 0;
      
      // Calculate dynamic priority (base priority + analytics boost)
      const analyticsBoost = Math.min(5, analyticsScore / 10); // Cap boost at 5 points
      const newDynamicPriority = schedule.priority + analyticsBoost;
      
      // Update schedule
      schedule.dynamicPriority = newDynamicPriority;
      schedule.analyticsScore = analyticsScore;
      
      // Recalculate next warming time if priority increased significantly
      if (newDynamicPriority > schedule.priority + 2) {
        const newInterval = this.getWarmingInterval(newDynamicPriority);
        const timeSinceLastWarm = Date.now() - schedule.lastWarmed;
        
        if (timeSinceLastWarm > newInterval) {
          schedule.nextWarm = Date.now(); // Warm immediately
        }
      }
    }

    const updatedCount = this.warmingSchedule.size;
    console.log(`Updated priorities for ${updatedCount} categories based on analytics`);
  }

  // Perform cache warming for due categories (enhanced with analytics prioritization)
  private async performCacheWarming(): Promise<void> {
    if (this.isWarming) return;

    this.isWarming = true;
    const now = Date.now();
    
    try {
      // Get categories that need warming, sorted by dynamic priority
      const dueCategories = Array.from(this.warmingSchedule.values())
        .filter(schedule => now >= schedule.nextWarm)
        .sort((a, b) => b.dynamicPriority - a.dynamicPriority); // High priority first

      console.log(`Enhanced cache warming: ${dueCategories.length} categories due for warming`);

      // Also include trending categories even if not due
      const trendingBoosts = categoryAnalytics.getTrendingCategories(3);
      const trendingCategoryKeys = trendingBoosts.map(cat => 
        Object.keys(this.categoryConfigs).find(key => 
          key.toLowerCase().includes(cat.name.toLowerCase())
        )
      ).filter(Boolean);

      // Add trending categories to warming queue
      for (const trendingKey of trendingCategoryKeys) {
        const schedule = this.warmingSchedule.get(trendingKey!);
        if (schedule && !dueCategories.includes(schedule)) {
          // Add trending category with high priority
          dueCategories.unshift(schedule);
          console.log(`Added trending category to warming queue: ${trendingKey}`);
        }
      }

      // Warm categories sequentially to avoid overwhelming the API
      for (const schedule of dueCategories.slice(0, 10)) { // Limit to top 10
        try {
          await this.warmCategory(schedule.categoryKey);
          
          // Update schedule based on dynamic priority
          const interval = this.getWarmingInterval(schedule.dynamicPriority);
          schedule.lastWarmed = now;
          schedule.nextWarm = now + interval;
          
          console.log(`Warmed cache for category: ${schedule.categoryKey} (priority: ${schedule.dynamicPriority}, analytics: ${schedule.analyticsScore})`);
          
          // Small delay between warming operations
          await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced delay for efficiency
          
        } catch (error) {
          console.error(`Failed to warm category ${schedule.categoryKey}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Enhanced cache warming error:', error);
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
    if (mods && mods.mods && mods.mods.length > 0) {
      await modCache.setSearchResults(
        config.query || "",
        config.categoryId?.toString(),
        "popularity",
        "desc",
        1,
        20,
        mods.mods,
        mods.totalCount
      );

      // Record analytics
      categoryAnalytics.recordSearchPattern(
        config.query || category,
        mods.mods.length
      );
    }
  }

  // Force warm all categories immediately (enhanced)
  async forceWarmAllCategories(): Promise<void> {
    console.log('Force warming all categories with analytics prioritization...');
    
    // Update priorities first
    this.updatePrioritiesFromAnalytics();
    
    // Get categories sorted by dynamic priority
    const sortedCategories = Array.from(this.warmingSchedule.values())
      .sort((a, b) => b.dynamicPriority - a.dynamicPriority)
      .map(schedule => schedule.categoryKey);
    
    for (const category of sortedCategories) {
      try {
        await this.warmCategory(category);
        console.log(`Force warmed: ${category}`);
        
        // Update schedule
        const schedule = this.warmingSchedule.get(category);
        if (schedule) {
          const now = Date.now();
          const interval = this.getWarmingInterval(schedule.dynamicPriority);
          schedule.lastWarmed = now;
          schedule.nextWarm = now + interval;
        }
        
        // Shorter delay for force warming
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Failed to force warm ${category}:`, error);
      }
    }
    
    console.log('Enhanced force warming completed');
  }

  // Get enhanced cache warming status
  getCacheWarmingStatus(): { 
    isWarming: boolean; 
    schedule: { 
      category: string; 
      lastWarmed: Date; 
      nextWarm: Date; 
      basePriority: number;
      dynamicPriority: number;
      analyticsScore: number;
    }[];
    analyticsEnabled: boolean;
    analyticsSummary: any;
  } {
    const schedule = Array.from(this.warmingSchedule.values()).map(s => ({
      category: s.categoryKey,
      lastWarmed: new Date(s.lastWarmed || 0),
      nextWarm: new Date(s.nextWarm),
      basePriority: s.priority,
      dynamicPriority: s.dynamicPriority,
      analyticsScore: s.analyticsScore
    }));

    return {
      isWarming: this.isWarming,
      schedule: schedule.sort((a, b) => b.dynamicPriority - a.basePriority),
      analyticsEnabled: true,
      analyticsSummary: categoryAnalytics.getAnalyticsSummary()
    };
  }

  // Get cache statistics for all categories (enhanced)
  async getCacheStatistics(): Promise<Record<string, { 
    cached: boolean; 
    size: number; 
    lastUpdated: Date | null;
    priority: number;
    dynamicPriority: number;
    analyticsScore: number;
  }>> {
    const stats: Record<string, { 
      cached: boolean; 
      size: number; 
      lastUpdated: Date | null;
      priority: number;
      dynamicPriority: number;
      analyticsScore: number;
    }> = {};
    
    for (const [category, config] of Object.entries(this.categoryConfigs)) {
      const schedule = this.warmingSchedule.get(category);
      
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
          lastUpdated: cached.data && cached.data.length > 0 ? new Date() : null,
          priority: config.priority,
          dynamicPriority: schedule?.dynamicPriority || config.priority,
          analyticsScore: schedule?.analyticsScore || 0
        };
      } catch (error) {
        stats[category] = {
          cached: false,
          size: 0,
          lastUpdated: null,
          priority: config.priority,
          dynamicPriority: schedule?.dynamicPriority || config.priority,
          analyticsScore: schedule?.analyticsScore || 0
        };
      }
    }
    
    return stats;
  }

  // Get analytics insights for cache optimization
  getAnalyticsInsights(): {
    popularCategories: any[];
    trendingCategories: any[];
    searchPatterns: any[];
    recommendations: string[];
  } {
    const popularCategories = categoryAnalytics.getPopularCategories(10);
    const trendingCategories = categoryAnalytics.getTrendingCategories(5);
    const searchPatterns = categoryAnalytics.getPopularSearchPatterns(10);
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on analytics
    if (trendingCategories.length > 0) {
      recommendations.push(`Consider increasing cache frequency for trending categories: ${trendingCategories.map(c => c.name).join(', ')}`);
    }
    
    if (searchPatterns.length > 3) {
      const topPatterns = searchPatterns.slice(0, 3).map(p => p.query);
      recommendations.push(`Top search patterns suggest focusing on: ${topPatterns.join(', ')}`);
    }
    
    const lowPerformingCategories = Array.from(this.warmingSchedule.values())
      .filter(s => s.analyticsScore < 5)
      .map(s => s.categoryKey);
    
    if (lowPerformingCategories.length > 0) {
      recommendations.push(`Consider reducing cache frequency for low-performing categories: ${lowPerformingCategories.join(', ')}`);
    }
    
    return {
      popularCategories,
      trendingCategories,
      searchPatterns,
      recommendations
    };
  }
}

// Export singleton instance
export const modServiceOptimized = new ModServiceOptimized(); 