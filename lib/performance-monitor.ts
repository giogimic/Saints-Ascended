// lib/performance-monitor.ts
// Performance Monitoring for CurseForge API Integration

interface PerformanceMetric {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  min: number;
  max: number;
  avg: number;
  count: number;
  p95: number;
  p99: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric[]>();
  private readonly MAX_METRICS_PER_TYPE = 1000; // Limit memory usage
  private readonly RETENTION_HOURS = 24; // Keep metrics for 24 hours

  /**
   * Record a performance metric
   */
  recordMetric(type: string, value: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const metrics = this.metrics.get(type)!;
    
    // Add new metric
    metrics.push({
      timestamp: Date.now(),
      value,
      metadata
    });

    // Trim old metrics if we exceed the limit
    if (metrics.length > this.MAX_METRICS_PER_TYPE) {
      metrics.splice(0, metrics.length - this.MAX_METRICS_PER_TYPE);
    }

    // Clean up old metrics periodically
    if (metrics.length % 100 === 0) {
      this.cleanupOldMetrics(type);
    }
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(endpoint: string, responseTime: number, statusCode?: number): void {
    this.recordMetric('api_response_time', responseTime, {
      endpoint,
      statusCode
    });

    // Also record endpoint-specific metrics
    this.recordMetric(`api_response_time_${endpoint.replace(/\//g, '_')}`, responseTime, {
      statusCode
    });
  }

  /**
   * Record cache hit/miss
   */
  recordCacheEvent(type: 'hit' | 'miss', category: string, responseTime?: number): void {
    this.recordMetric(`cache_${type}`, 1, {
      category,
      responseTime
    });

    // Record cache response time if provided
    if (responseTime !== undefined) {
      this.recordMetric('cache_response_time', responseTime, {
        type,
        category
      });
    }
  }

  /**
   * Record rate limiting events
   */
  recordRateLimitEvent(type: 'limit_hit' | 'token_depleted' | 'request_queued', details?: Record<string, any>): void {
    this.recordMetric(`rate_limit_${type}`, 1, details);
  }

  /**
   * Record background service performance
   */
  recordBackgroundServiceMetric(service: string, metric: string, value: number, metadata?: Record<string, any>): void {
    this.recordMetric(`background_${service}_${metric}`, value, metadata);
  }

  /**
   * Get performance statistics for a metric type
   */
  getStats(type: string, timeRangeHours: number = 1): PerformanceStats | null {
    const metrics = this.metrics.get(type);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const cutoffTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentMetrics = metrics
      .filter(m => m.timestamp >= cutoffTime)
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (recentMetrics.length === 0) {
      return null;
    }

    const sum = recentMetrics.reduce((acc, val) => acc + val, 0);
    const count = recentMetrics.length;
    const avg = sum / count;

    // Calculate percentiles
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);

    return {
      min: recentMetrics[0],
      max: recentMetrics[count - 1],
      avg: Math.round(avg * 100) / 100,
      count,
      p95: recentMetrics[p95Index] || recentMetrics[count - 1],
      p99: recentMetrics[p99Index] || recentMetrics[count - 1]
    };
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(timeRangeHours: number = 1): number {
    const hits = this.getStats('cache_hit', timeRangeHours);
    const misses = this.getStats('cache_miss', timeRangeHours);

    const hitCount = hits?.count || 0;
    const missCount = misses?.count || 0;
    const totalRequests = hitCount + missCount;

    if (totalRequests === 0) {
      return 0;
    }

    return Math.round((hitCount / totalRequests) * 100 * 100) / 100;
  }

  /**
   * Get API error rate
   */
  getApiErrorRate(timeRangeHours: number = 1): number {
    const metrics = this.metrics.get('api_response_time');
    if (!metrics || metrics.length === 0) {
      return 0;
    }

    const cutoffTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return 0;
    }

    const errorCount = recentMetrics.filter(m => 
      m.metadata?.statusCode && m.metadata.statusCode >= 400
    ).length;

    return Math.round((errorCount / recentMetrics.length) * 100 * 100) / 100;
  }

  /**
   * Get comprehensive performance summary
   */
  getPerformanceSummary(timeRangeHours: number = 1): {
    apiResponseTime: PerformanceStats | null;
    cacheResponseTime: PerformanceStats | null;
    cacheHitRate: number;
    apiErrorRate: number;
    rateLimitEvents: number;
    topEndpoints: Array<{ endpoint: string; count: number; avgResponseTime: number }>;
    recommendations: string[];
  } {
    const apiResponseTime = this.getStats('api_response_time', timeRangeHours);
    const cacheResponseTime = this.getStats('cache_response_time', timeRangeHours);
    const cacheHitRate = this.getCacheHitRate(timeRangeHours);
    const apiErrorRate = this.getApiErrorRate(timeRangeHours);

    // Count rate limit events
    const rateLimitHits = this.getStats('rate_limit_limit_hit', timeRangeHours);
    const rateLimitEvents = rateLimitHits?.count || 0;

    // Get top endpoints
    const topEndpoints = this.getTopEndpoints(timeRangeHours);

    // Generate recommendations
    const recommendations = this.generatePerformanceRecommendations({
      apiResponseTime,
      cacheHitRate,
      apiErrorRate,
      rateLimitEvents
    });

    return {
      apiResponseTime,
      cacheResponseTime,
      cacheHitRate,
      apiErrorRate,
      rateLimitEvents,
      topEndpoints,
      recommendations
    };
  }

  /**
   * Get top API endpoints by usage
   */
  private getTopEndpoints(timeRangeHours: number): Array<{ endpoint: string; count: number; avgResponseTime: number }> {
    const metrics = this.metrics.get('api_response_time');
    if (!metrics || metrics.length === 0) {
      return [];
    }

    const cutoffTime = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

    // Group by endpoint
    const endpointStats = new Map<string, { count: number; totalTime: number }>();

    recentMetrics.forEach(metric => {
      const endpoint = metric.metadata?.endpoint || 'unknown';
      const existing = endpointStats.get(endpoint) || { count: 0, totalTime: 0 };
      
      endpointStats.set(endpoint, {
        count: existing.count + 1,
        totalTime: existing.totalTime + metric.value
      });
    });

    // Convert to sorted array
    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgResponseTime: Math.round((stats.totalTime / stats.count) * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(data: {
    apiResponseTime: PerformanceStats | null;
    cacheHitRate: number;
    apiErrorRate: number;
    rateLimitEvents: number;
  }): string[] {
    const recommendations: string[] = [];

    // API response time recommendations
    if (data.apiResponseTime) {
      if (data.apiResponseTime.avg > 3000) {
        recommendations.push("API response times are high - consider implementing request optimization");
      }
      if (data.apiResponseTime.p95 > 5000) {
        recommendations.push("95th percentile response time is concerning - investigate slow endpoints");
      }
    }

    // Cache hit rate recommendations
    if (data.cacheHitRate < 70) {
      recommendations.push("Cache hit rate is below optimal - improve cache warming strategy");
    } else if (data.cacheHitRate < 50) {
      recommendations.push("Cache hit rate is critically low - review cache configuration");
    }

    // API error rate recommendations
    if (data.apiErrorRate > 5) {
      recommendations.push("API error rate is high - investigate API issues or request patterns");
    } else if (data.apiErrorRate > 1) {
      recommendations.push("API error rate is elevated - monitor for potential issues");
    }

    // Rate limiting recommendations
    if (data.rateLimitEvents > 0) {
      recommendations.push("Rate limiting events detected - consider reducing request frequency");
    }

    return recommendations;
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(type: string): void {
    const metrics = this.metrics.get(type);
    if (!metrics) return;

    const cutoffTime = Date.now() - (this.RETENTION_HOURS * 60 * 60 * 1000);
    const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
    
    this.metrics.set(type, filteredMetrics);
  }

  /**
   * Clean up all old metrics
   */
  cleanupAllMetrics(): void {
    for (const type of this.metrics.keys()) {
      this.cleanupOldMetrics(type);
    }
  }

  /**
   * Get all metric types
   */
  getMetricTypes(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get raw metrics for a type (for debugging)
   */
  getRawMetrics(type: string, limit: number = 100): PerformanceMetric[] {
    const metrics = this.metrics.get(type);
    if (!metrics) return [];

    return metrics.slice(-limit); // Get last N metrics
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Get memory usage info
   */
  getMemoryInfo(): {
    totalMetricTypes: number;
    totalMetrics: number;
    estimatedMemoryKB: number;
  } {
    let totalMetrics = 0;
    for (const metrics of this.metrics.values()) {
      totalMetrics += metrics.length;
    }

    // Rough estimate: each metric ~100 bytes
    const estimatedMemoryKB = Math.round((totalMetrics * 100) / 1024);

    return {
      totalMetricTypes: this.metrics.size,
      totalMetrics,
      estimatedMemoryKB
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor(); 