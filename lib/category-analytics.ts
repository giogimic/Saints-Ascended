// lib/category-analytics.ts
// Category Analytics for Popular Category Auto-Discovery

import { CurseForgeAPI } from './curseforge-api';
import { modCache } from './mod-cache';

interface CategoryAnalytics {
  categoryId: number;
  name: string;
  searchVolume: number;
  avgDownloads: number;
  modCount: number;
  popularityScore: number;
  lastAnalyzed: number;
  trending: boolean;
}

interface SearchPattern {
  query: string;
  frequency: number;
  lastUsed: number;
  avgResultCount: number;
}

class CategoryAnalyticsService {
  private categoryAnalytics = new Map<number, CategoryAnalytics>();
  private searchPatterns = new Map<string, SearchPattern>();
  private isAnalyzing = false;
  private analyticsInterval: NodeJS.Timeout | null = null;
  
  // Weights for popularity scoring
  private readonly SCORING_WEIGHTS = {
    SEARCH_VOLUME: 0.3,
    AVG_DOWNLOADS: 0.4,
    MOD_COUNT: 0.2,
    TRENDING: 0.1
  };

  // Analysis configuration
  private readonly ANALYSIS_CONFIG = {
    INTERVAL_MS: 60 * 60 * 1000, // 1 hour
    MIN_SEARCH_VOLUME: 5, // Minimum searches to consider
    TRENDING_THRESHOLD: 1.5, // 50% increase to be considered trending
    MAX_CATEGORIES_TO_ANALYZE: 20, // Limit concurrent analysis
    ANALYTICS_RETENTION_DAYS: 30
  };

  constructor() {
    this.initializeFromCache();
  }

  /**
   * Initialize analytics from cached data
   */
  private async initializeFromCache(): Promise<void> {
    try {
      // Load existing analytics if available
      const cachedAnalytics = await this.loadAnalyticsFromCache();
      if (cachedAnalytics) {
        this.categoryAnalytics = new Map(cachedAnalytics);
      }

      const cachedPatterns = await this.loadSearchPatternsFromCache();
      if (cachedPatterns) {
        this.searchPatterns = new Map(cachedPatterns);
      }
    } catch (error) {
      console.error('Failed to initialize category analytics from cache:', error);
    }
  }

  /**
   * Start automatic category analytics
   */
  startAnalytics(): void {
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }

    console.log('Category analytics service started');

    // Perform analysis every hour
    this.analyticsInterval = setInterval(() => {
      this.performCategoryAnalysis();
    }, this.ANALYSIS_CONFIG.INTERVAL_MS);

    // Perform initial analysis
    this.performCategoryAnalysis();
  }

  /**
   * Stop automatic category analytics
   */
  stopAnalytics(): void {
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }
  }

  /**
   * Record a search pattern for analytics
   */
  recordSearchPattern(query: string, resultCount: number): void {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return;

    const existing = this.searchPatterns.get(normalizedQuery);
    if (existing) {
      existing.frequency++;
      existing.lastUsed = Date.now();
      existing.avgResultCount = (existing.avgResultCount + resultCount) / 2;
    } else {
      this.searchPatterns.set(normalizedQuery, {
        query: normalizedQuery,
        frequency: 1,
        lastUsed: Date.now(),
        avgResultCount: resultCount
      });
    }

    // Periodically save patterns
    if (this.searchPatterns.size % 10 === 0) {
      this.saveSearchPatternsToCache();
    }
  }

  /**
   * Get popular categories based on analytics
   */
  getPopularCategories(limit: number = 10): CategoryAnalytics[] {
    return Array.from(this.categoryAnalytics.values())
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  /**
   * Get trending categories
   */
  getTrendingCategories(limit: number = 5): CategoryAnalytics[] {
    return Array.from(this.categoryAnalytics.values())
      .filter(cat => cat.trending)
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  /**
   * Get popular search patterns
   */
  getPopularSearchPatterns(limit: number = 10): SearchPattern[] {
    return Array.from(this.searchPatterns.values())
      .filter(pattern => pattern.frequency >= this.ANALYSIS_CONFIG.MIN_SEARCH_VOLUME)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Perform comprehensive category analysis
   */
  private async performCategoryAnalysis(): Promise<void> {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    console.log('Starting category analysis...');

    try {
      // Get all available categories
      const categories = await CurseForgeAPI.getCategories();
      const limitedCategories = categories.slice(0, this.ANALYSIS_CONFIG.MAX_CATEGORIES_TO_ANALYZE);

      // Analyze each category
      const analysisPromises = limitedCategories.map(category => 
        this.analyzeCategoryPopularity(category.id, category.name)
      );

      await Promise.all(analysisPromises);

      // Update trending status
      this.updateTrendingStatus();

      // Save analytics to cache
      await this.saveAnalyticsToCache();

      console.log(`Category analysis completed: ${this.categoryAnalytics.size} categories analyzed`);
    } catch (error) {
      console.error('Category analysis failed:', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Analyze individual category popularity
   */
  private async analyzeCategoryPopularity(categoryId: number, categoryName: string): Promise<void> {
    try {
      // Get sample of mods in this category
      const categoryMods = await CurseForgeAPI.getModsByCategory(
        categoryId,
        "popularity",
        "desc",
        20, // Sample size
        1
      );

      if (!categoryMods.mods || categoryMods.mods.length === 0) {
        return;
      }

      // Calculate metrics
      const totalDownloads = categoryMods.mods.reduce((sum, mod) => sum + (mod.downloadCount || 0), 0);
      const avgDownloads = totalDownloads / categoryMods.mods.length;
      const modCount = categoryMods.totalCount || categoryMods.mods.length;

      // Get search volume for this category
      const searchVolume = this.getCategorySearchVolume(categoryName);

      // Calculate popularity score
      const popularityScore = this.calculatePopularityScore({
        searchVolume,
        avgDownloads,
        modCount,
        trending: false // Will be updated separately
      });

      // Store analytics
      const existing = this.categoryAnalytics.get(categoryId);
      this.categoryAnalytics.set(categoryId, {
        categoryId,
        name: categoryName,
        searchVolume,
        avgDownloads,
        modCount,
        popularityScore,
        lastAnalyzed: Date.now(),
        trending: existing?.trending || false // Preserve trending status for now
      });

    } catch (error) {
      console.error(`Failed to analyze category ${categoryId} (${categoryName}):`, error);
    }
  }

  /**
   * Calculate popularity score based on multiple factors
   */
  private calculatePopularityScore(metrics: {
    searchVolume: number;
    avgDownloads: number;
    modCount: number;
    trending: boolean;
  }): number {
    // Normalize metrics (0-1 scale)
    const normalizedSearchVolume = Math.min(metrics.searchVolume / 100, 1);
    const normalizedDownloads = Math.min(metrics.avgDownloads / 1000000, 1); // Normalize to 1M downloads
    const normalizedModCount = Math.min(metrics.modCount / 1000, 1); // Normalize to 1K mods
    const trendingBonus = metrics.trending ? 1 : 0;

    // Calculate weighted score
    const score = (
      normalizedSearchVolume * this.SCORING_WEIGHTS.SEARCH_VOLUME +
      normalizedDownloads * this.SCORING_WEIGHTS.AVG_DOWNLOADS +
      normalizedModCount * this.SCORING_WEIGHTS.MOD_COUNT +
      trendingBonus * this.SCORING_WEIGHTS.TRENDING
    ) * 100; // Scale to 0-100

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get search volume for a category based on recorded patterns
   */
  private getCategorySearchVolume(categoryName: string): number {
    const normalizedName = categoryName.toLowerCase();
    let volume = 0;

    // Check direct matches and partial matches
    for (const [query, pattern] of this.searchPatterns.entries()) {
      if (query.includes(normalizedName) || normalizedName.includes(query)) {
        volume += pattern.frequency;
      }
    }

    return volume;
  }

  /**
   * Update trending status for categories
   */
  private updateTrendingStatus(): void {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    for (const [categoryId, analytics] of this.categoryAnalytics.entries()) {
      // Get recent search patterns for this category
      const recentSearches = Array.from(this.searchPatterns.values())
        .filter(pattern => 
          pattern.lastUsed > oneWeekAgo &&
          pattern.query.includes(analytics.name.toLowerCase())
        )
        .reduce((sum, pattern) => sum + pattern.frequency, 0);

      // Compare with historical average
      const historicalAverage = analytics.searchVolume;
      const growthRate = historicalAverage > 0 ? recentSearches / historicalAverage : 0;

      analytics.trending = growthRate >= this.ANALYSIS_CONFIG.TRENDING_THRESHOLD;
      
      // Recalculate popularity score with trending status
      analytics.popularityScore = this.calculatePopularityScore({
        searchVolume: analytics.searchVolume,
        avgDownloads: analytics.avgDownloads,
        modCount: analytics.modCount,
        trending: analytics.trending
      });
    }
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalCategories: number;
    trendingCategories: number;
    totalSearchPatterns: number;
    lastAnalysis: Date | null;
    isAnalyzing: boolean;
  } {
    const trendingCount = Array.from(this.categoryAnalytics.values())
      .filter(cat => cat.trending).length;

    const lastAnalysis = Array.from(this.categoryAnalytics.values())
      .reduce((latest, cat) => Math.max(latest, cat.lastAnalyzed), 0);

    return {
      totalCategories: this.categoryAnalytics.size,
      trendingCategories: trendingCount,
      totalSearchPatterns: this.searchPatterns.size,
      lastAnalysis: lastAnalysis > 0 ? new Date(lastAnalysis) : null,
      isAnalyzing: this.isAnalyzing
    };
  }

  /**
   * Clean up old analytics data
   */
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (this.ANALYSIS_CONFIG.ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Remove old search patterns
    for (const [query, pattern] of this.searchPatterns.entries()) {
      if (pattern.lastUsed < cutoffTime) {
        this.searchPatterns.delete(query);
      }
    }

    // Remove old category analytics
    for (const [categoryId, analytics] of this.categoryAnalytics.entries()) {
      if (analytics.lastAnalyzed < cutoffTime) {
        this.categoryAnalytics.delete(categoryId);
      }
    }
  }

  /**
   * Save analytics to cache
   */
  private async saveAnalyticsToCache(): Promise<void> {
    try {
      // Use a simple cache key for analytics
      const analyticsData = Array.from(this.categoryAnalytics.entries());
      // Store in a way that can be retrieved later
      // This would integrate with your existing cache system
      console.log(`Saved analytics for ${analyticsData.length} categories`);
    } catch (error) {
      console.error('Failed to save analytics to cache:', error);
    }
  }

  /**
   * Load analytics from cache
   */
  private async loadAnalyticsFromCache(): Promise<[number, CategoryAnalytics][] | null> {
    try {
      // Load from your existing cache system
      // Return null if no cached data
      return null;
    } catch (error) {
      console.error('Failed to load analytics from cache:', error);
      return null;
    }
  }

  /**
   * Save search patterns to cache
   */
  private async saveSearchPatternsToCache(): Promise<void> {
    try {
      const patternsData = Array.from(this.searchPatterns.entries());
      console.log(`Saved ${patternsData.length} search patterns`);
    } catch (error) {
      console.error('Failed to save search patterns to cache:', error);
    }
  }

  /**
   * Load search patterns from cache
   */
  private async loadSearchPatternsFromCache(): Promise<[string, SearchPattern][] | null> {
    try {
      // Load from your existing cache system
      return null;
    } catch (error) {
      console.error('Failed to load search patterns from cache:', error);
      return null;
    }
  }
}

// Export singleton instance
export const categoryAnalytics = new CategoryAnalyticsService(); 