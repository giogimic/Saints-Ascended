// lib/server-init.ts
// Server-side initialization - this file should never be imported on the client

// Initialize server-side services
export async function initializeServerServices() {
  // Start cache warming service
  try {
    const { modServiceOptimized } = await import('./mod-service-optimized');
    modServiceOptimized.startCacheWarming();
    console.log("Strategy 2: Cache warming service started");
  } catch (error) {
    console.error("Failed to start cache warming service:", error);
  }

  // Start cache refresh service
  try {
    await import('./cache-refresh-service');
    console.log("Cache refresh service started");
  } catch (error) {
    console.error("Failed to start cache refresh service:", error);
  }
} 