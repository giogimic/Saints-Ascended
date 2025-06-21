// pages/api/curseforge/health.ts
// Comprehensive Health Check for CurseForge API Integration

import { NextApiRequest, NextApiResponse } from 'next';
import { CurseForgeAPI } from '../../../lib/curseforge-api';
import { modCacheClient } from '../../../lib/mod-cache-client';
import { modServiceOptimized } from '../../../lib/mod-service-optimized';
import { categoryAnalytics } from '../../../lib/category-analytics';

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    apiConnectivity: HealthCheck;
    apiAuthentication: HealthCheck;
    rateLimiting: HealthCheck;
    cachePerformance: HealthCheck;
    backgroundServices: HealthCheck;
    analytics: HealthCheck;
  };
  metrics: {
    responseTime: number;
    cacheHitRate: number;
    activeRequests: number;
    queueLength: number;
    tokenBucketStatus: any;
  };
  recommendations: string[];
}

interface HealthCheck {
  status: "pass" | "warn" | "fail";
  message: string;
  responseTime?: number;
  details?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResult | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    // Perform all health checks
    const [
      apiConnectivity,
      apiAuthentication,
      rateLimiting,
      cachePerformance,
      backgroundServices,
      analytics
    ] = await Promise.allSettled([
      checkApiConnectivity(),
      checkApiAuthentication(),
      checkRateLimiting(),
      checkCachePerformance(),
      checkBackgroundServices(),
      checkAnalytics()
    ]);

    // Extract results from settled promises
    const checks = {
      apiConnectivity: getCheckResult(apiConnectivity, "API connectivity check failed"),
      apiAuthentication: getCheckResult(apiAuthentication, "API authentication check failed"),
      rateLimiting: getCheckResult(rateLimiting, "Rate limiting check failed"),
      cachePerformance: getCheckResult(cachePerformance, "Cache performance check failed"),
      backgroundServices: getCheckResult(backgroundServices, "Background services check failed"),
      analytics: getCheckResult(analytics, "Analytics check failed")
    };

    // Calculate overall status
    const overallStatus = calculateOverallStatus(checks);

    // Get system metrics
    const metrics = await getSystemMetrics();

    // Generate recommendations
    const recommendations = generateRecommendations(checks, metrics);

    const totalResponseTime = Date.now() - startTime;

    const healthResult: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      checks,
      metrics: {
        ...metrics,
        responseTime: totalResponseTime
      },
      recommendations
    };

    // Set appropriate HTTP status based on health
    const httpStatus = overallStatus === "healthy" ? 200 : 
                      overallStatus === "degraded" ? 200 : 503;

    res.status(httpStatus).json(healthResult);

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Check API connectivity by making a simple request
 */
async function checkApiConnectivity(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Test with a simple game request
    await CurseForgeAPI.getGame(83374); // ARK: Survival Ascended
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: responseTime < 2000 ? "pass" : "warn",
      message: responseTime < 2000 
        ? `API connectivity is good (${responseTime}ms)`
        : `API connectivity is slow (${responseTime}ms)`,
      responseTime,
      details: {
        endpoint: "/games/{gameId}",
        gameId: 83374
      }
    };
  } catch (error) {
    return {
      status: "fail",
      message: `API connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check API authentication status
 */
async function checkApiAuthentication(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const apiKeyConfig = CurseForgeAPI.checkApiKeyConfiguration();
    
    if (!apiKeyConfig.hasApiKey) {
      return {
        status: "fail",
        message: "No API key configured",
        responseTime: Date.now() - startTime,
        details: apiKeyConfig
      };
    }

    if (!apiKeyConfig.isValidFormat) {
      return {
        status: "fail",
        message: "API key format is invalid",
        responseTime: Date.now() - startTime,
        details: apiKeyConfig
      };
    }

    // Test authentication with a simple request
    await CurseForgeAPI.getCategories();
    
    return {
      status: "pass",
      message: `API authentication is working (${apiKeyConfig.source})`,
      responseTime: Date.now() - startTime,
      details: {
        source: apiKeyConfig.source,
        keyLength: apiKeyConfig.keyLength,
        format: apiKeyConfig.isValidFormat ? "valid" : "invalid"
      }
    };
  } catch (error) {
    return {
      status: "fail",
      message: `API authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check rate limiting status
 */
async function checkRateLimiting(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const canMakeRequest = CurseForgeAPI.canMakeRequest();
    const tokenBucketStatus = CurseForgeAPI.getTokenBucketStatus();
    const rateLimitInfo = CurseForgeAPI.getRateLimitInfo();
    const isRateLimited = CurseForgeAPI.isRateLimited();

    let status: "pass" | "warn" | "fail" = "pass";
    let message = "Rate limiting is healthy";

    if (isRateLimited) {
      status = "fail";
      message = "Currently rate limited";
    } else if (!canMakeRequest) {
      status = "warn";
      message = "Token bucket is empty but not rate limited";
    } else if (tokenBucketStatus.tokens < tokenBucketStatus.capacity * 0.2) {
      status = "warn";
      message = "Token bucket is running low";
    }

    return {
      status,
      message,
      responseTime: Date.now() - startTime,
      details: {
        canMakeRequest,
        tokenBucketStatus,
        rateLimitInfo,
        isRateLimited
      }
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Rate limiting check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check cache performance
 */
async function checkCachePerformance(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Get cache statistics
    const cacheStats = await modServiceOptimized.getCacheStatistics();
    const cacheStatus = modServiceOptimized.getCacheWarmingStatus();

    // Calculate metrics
    const totalCategories = Object.keys(cacheStats).length;
    const cachedCategories = Object.values(cacheStats).filter(stat => stat.cached).length;
    const cacheHitRate = totalCategories > 0 ? (cachedCategories / totalCategories) * 100 : 0;

    let status: "pass" | "warn" | "fail" = "pass";
    let message = `Cache performance is good (${cacheHitRate.toFixed(1)}% hit rate)`;

    if (cacheHitRate < 50) {
      status = "fail";
      message = `Cache hit rate is too low (${cacheHitRate.toFixed(1)}%)`;
    } else if (cacheHitRate < 70) {
      status = "warn";
      message = `Cache hit rate is below optimal (${cacheHitRate.toFixed(1)}%)`;
    }

    return {
      status,
      message,
      responseTime: Date.now() - startTime,
      details: {
        totalCategories,
        cachedCategories,
        cacheHitRate,
        isWarming: cacheStatus.isWarming,
        analyticsEnabled: cacheStatus.analyticsEnabled
      }
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Cache performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check background services status
 */
async function checkBackgroundServices(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const isBackgroundFetching = CurseForgeAPI.isBackgroundFetching();
    const cacheWarmingStatus = modServiceOptimized.getCacheWarmingStatus();
    
    let status: "pass" | "warn" | "fail" = "pass";
    let message = "Background services are running normally";

    const services = {
      backgroundFetching: isBackgroundFetching,
      cacheWarming: cacheWarmingStatus.isWarming,
      analytics: cacheWarmingStatus.analyticsEnabled
    };

    const runningServices = Object.values(services).filter(Boolean).length;
    
    if (runningServices === 0) {
      status = "warn";
      message = "No background services are running";
    } else if (runningServices < 2) {
      status = "warn";
      message = "Some background services are not running";
    }

    return {
      status,
      message,
      responseTime: Date.now() - startTime,
      details: {
        services,
        runningCount: runningServices,
        totalCount: Object.keys(services).length
      }
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Background services check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Check analytics status
 */
async function checkAnalytics(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const analyticsSummary = categoryAnalytics.getAnalyticsSummary();
    
    let status: "pass" | "warn" | "fail" = "pass";
    let message = "Analytics are working normally";

    if (analyticsSummary.isAnalyzing) {
      message = "Analytics are currently analyzing data";
    } else if (analyticsSummary.totalCategories === 0) {
      status = "warn";
      message = "No analytics data available yet";
    } else if (!analyticsSummary.lastAnalysis) {
      status = "warn";
      message = "Analytics have not run recently";
    } else {
      const timeSinceLastAnalysis = Date.now() - analyticsSummary.lastAnalysis.getTime();
      const hoursAgo = timeSinceLastAnalysis / (1000 * 60 * 60);
      
      if (hoursAgo > 24) {
        status = "warn";
        message = `Analytics data is stale (${hoursAgo.toFixed(1)} hours old)`;
      }
    }

    return {
      status,
      message,
      responseTime: Date.now() - startTime,
      details: analyticsSummary
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Analytics check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Get system metrics
 */
async function getSystemMetrics() {
  try {
    const queueStatus = CurseForgeAPI.getQueueStatus();
    const tokenBucketStatus = CurseForgeAPI.getTokenBucketStatus();
    const cacheStats = await modServiceOptimized.getCacheStatistics();
    
    // Calculate cache hit rate
    const totalCategories = Object.keys(cacheStats).length;
    const cachedCategories = Object.values(cacheStats).filter(stat => stat.cached).length;
    const cacheHitRate = totalCategories > 0 ? (cachedCategories / totalCategories) * 100 : 0;

    return {
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      activeRequests: queueStatus.activeRequests,
      queueLength: queueStatus.queueLength,
      tokenBucketStatus
    };
  } catch (error) {
    console.error('Failed to get system metrics:', error);
    return {
      cacheHitRate: 0,
      activeRequests: 0,
      queueLength: 0,
      tokenBucketStatus: { tokens: 0, capacity: 0 }
    };
  }
}

/**
 * Calculate overall status from individual checks
 */
function calculateOverallStatus(checks: Record<string, HealthCheck>): "healthy" | "degraded" | "unhealthy" {
  const statuses = Object.values(checks).map(check => check.status);
  
  if (statuses.includes("fail")) {
    return "unhealthy";
  }
  
  if (statuses.includes("warn")) {
    return "degraded";
  }
  
  return "healthy";
}

/**
 * Generate recommendations based on health check results
 */
function generateRecommendations(
  checks: Record<string, HealthCheck>,
  metrics: any
): string[] {
  const recommendations: string[] = [];

  // API connectivity recommendations
  if (checks.apiConnectivity.status === "fail") {
    recommendations.push("Check network connectivity and CurseForge API status");
  } else if (checks.apiConnectivity.status === "warn") {
    recommendations.push("API response times are slow - consider checking network or API load");
  }

  // Authentication recommendations
  if (checks.apiAuthentication.status === "fail") {
    recommendations.push("Verify CurseForge API key configuration and validity");
  }

  // Rate limiting recommendations
  if (checks.rateLimiting.status === "fail") {
    recommendations.push("Currently rate limited - reduce API request frequency");
  } else if (checks.rateLimiting.status === "warn") {
    recommendations.push("Token bucket is running low - consider implementing request prioritization");
  }

  // Cache performance recommendations
  if (checks.cachePerformance.status === "fail") {
    recommendations.push("Cache hit rate is too low - enable cache warming or check cache storage");
  } else if (checks.cachePerformance.status === "warn") {
    recommendations.push("Consider increasing cache warming frequency for better performance");
  }

  // Background services recommendations
  if (checks.backgroundServices.status !== "pass") {
    recommendations.push("Some background services are not running - check service configuration");
  }

  // Analytics recommendations
  if (checks.analytics.status === "warn") {
    recommendations.push("Analytics data is stale or missing - ensure analytics service is running");
  }

  // Performance recommendations
  if (metrics.cacheHitRate < 70) {
    recommendations.push("Improve cache warming strategy to increase hit rate");
  }

  if (metrics.queueLength > 10) {
    recommendations.push("High request queue length - consider increasing concurrent request limit");
  }

  if (metrics.tokenBucketStatus.tokens < metrics.tokenBucketStatus.capacity * 0.3) {
    recommendations.push("Token bucket is low - reduce request frequency or increase bucket size");
  }

  return recommendations;
}

/**
 * Helper function to extract result from PromiseSettledResult
 */
function getCheckResult(
  result: PromiseSettledResult<HealthCheck>,
  fallbackMessage: string
): HealthCheck {
  if (result.status === "fulfilled") {
    return result.value;
  } else {
    return {
      status: "fail",
      message: fallbackMessage,
      details: { error: result.reason }
    };
  }
} 