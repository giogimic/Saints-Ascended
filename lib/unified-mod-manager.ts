// lib/unified-mod-manager.ts
// Unified Mod Manager - Client-safe version for browser use

import { CurseForgeAPI } from "./curseforge-api";
import { addConsoleInfo, addConsoleSuccess, addConsoleWarning, addConsoleError } from "@/components/ui/Layout";

export interface UnifiedModData {
  id: string;
  name: string;
  description: string;
  version: string;
  workshopId: string;
  enabled: boolean;
  loadOrder: number;
  dependencies: string[];
  incompatibilities: string[];
  size?: number;
  lastUpdated: Date;
  // Enhanced data from CurseForge
  downloadCount?: number;
  thumbsUpCount?: number;
  logoUrl?: string;
  author?: string;
  category?: string;
  tags?: string[];
  websiteUrl?: string;
  fileSize?: number;
}

export interface ModOperationResult {
  success: boolean;
  message: string;
  mod?: UnifiedModData;
  error?: string;
}

class UnifiedModManager {
  private readonly cacheTTL = 30 * 60 * 1000; // 30 minutes
  private readonly individualModCache = new Map<string, { data: UnifiedModData; timestamp: number }>();

  /**
   * Comprehensive mod data fetching: Cache → API → Store
   */
  async fetchModData(modId: string, forceRefresh: boolean = false): Promise<UnifiedModData | null> {
    const cacheKey = `mod_${modId}`;
    
    try {
      // Step 1: Check in-memory cache first (fastest)
      if (!forceRefresh) {
        const cached = this.individualModCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
          addConsoleInfo(`💾 Using cached mod data for ${modId}`);
          return cached.data;
        }
      }

      // Step 2: Fetch from CurseForge API
      addConsoleInfo(`🌐 Fetching mod ${modId} from CurseForge API`);
      const curseForgeData = await CurseForgeAPI.getModDetails(parseInt(modId, 10));
      
      if (curseForgeData) {
        // Convert and store the data
        const unifiedData = this.convertFromCurseForgeData(curseForgeData);
        
        // Cache the result
        this.individualModCache.set(cacheKey, { data: unifiedData, timestamp: Date.now() });
        
        addConsoleSuccess(`✅ Successfully fetched mod ${modId}: ${curseForgeData.name}`);
        return unifiedData;
      }

      addConsoleWarning(`⚠️ Mod ${modId} not found in CurseForge API`);
      return null;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addConsoleError(`❌ Error fetching mod ${modId}: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Add mod with comprehensive data fetching
   */
  async addMod(modId: string, serverId: string): Promise<ModOperationResult> {
    try {
      // Fetch comprehensive mod data
      const modData = await this.fetchModData(modId, true); // Force refresh for new additions
      
      if (!modData) {
        return {
          success: false,
          message: `Failed to fetch data for mod ${modId}`,
          error: 'Mod not found or API error'
        };
      }

      // Add to server via API
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modData)
      });

      if (response.ok) {
        addConsoleSuccess(`✅ Successfully added mod: ${modData.name} (ID: ${modId})`);
        return {
          success: true,
          message: `Added ${modData.name}`,
          mod: modData
        };
      } else {
        const errorText = await response.text();
        addConsoleError(`❌ Failed to add mod ${modId} to server: ${errorText}`);
        return {
          success: false,
          message: `Failed to add mod to server`,
          error: errorText
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addConsoleError(`❌ Error adding mod ${modId}: ${errorMessage}`);
      return {
        success: false,
        message: `Error adding mod`,
        error: errorMessage
      };
    }
  }

  /**
   * Remove mod with cleanup
   */
  async removeMod(modId: string, serverId: string): Promise<ModOperationResult> {
    try {
      // Get mod info before removal
      const modData = await this.fetchModData(modId);
      const modName = modData?.name || `Mod ${modId}`;

      // Remove from server
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modId })
      });

      if (response.ok) {
        // Clean up cache
        this.individualModCache.delete(`mod_${modId}`);
        
        addConsoleSuccess(`✅ Successfully removed mod: ${modName} (ID: ${modId})`);
        return {
          success: true,
          message: `Removed ${modName}`,
          mod: modData || undefined
        };
      } else {
        const errorText = await response.text();
        addConsoleError(`❌ Failed to remove mod ${modId}: ${errorText}`);
        return {
          success: false,
          message: `Failed to remove mod`,
          error: errorText
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addConsoleError(`❌ Error removing mod ${modId}: ${errorMessage}`);
      return {
        success: false,
        message: `Error removing mod`,
        error: errorMessage
      };
    }
  }

  /**
   * Toggle mod enabled/disabled
   */
  async toggleMod(modId: string, serverId: string, enabled: boolean): Promise<ModOperationResult> {
    try {
      // Get current mod data
      const modData = await this.fetchModData(modId);
      const modName = modData?.name || `Mod ${modId}`;

      // Update mod status via API
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{
            id: modId,
            isEnabled: enabled,
            loadOrder: modData?.loadOrder || 1
          }]
        })
      });

      if (response.ok) {
        addConsoleSuccess(`✅ Successfully ${enabled ? 'enabled' : 'disabled'} mod: ${modName} (ID: ${modId})`);
        return {
          success: true,
          message: `${enabled ? 'Enabled' : 'Disabled'} ${modName}`,
          mod: modData || undefined
        };
      } else {
        const errorText = await response.text();
        addConsoleError(`❌ Failed to toggle mod ${modId}: ${errorText}`);
        return {
          success: false,
          message: `Failed to toggle mod`,
          error: errorText
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addConsoleError(`❌ Error toggling mod ${modId}: ${errorMessage}`);
      return {
        success: false,
        message: `Error toggling mod`,
        error: errorMessage
      };
    }
  }

  /**
   * Bulk add mods with progress tracking
   */
  async bulkAddMods(modIds: string[], serverId: string): Promise<{
    successCount: number;
    errorCount: number;
    results: ModOperationResult[];
  }> {
    const results: ModOperationResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    addConsoleInfo(`🚀 Starting bulk add of ${modIds.length} mods...`);

    for (const modId of modIds) {
      try {
        const result = await this.addMod(modId, serverId);
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        results.push({
          success: false,
          message: `Error adding mod ${modId}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    addConsoleSuccess(`✅ Bulk add completed: ${successCount} successful, ${errorCount} failed`);
    return { successCount, errorCount, results };
  }

  /**
   * Get all mods for a server via API
   */
  async getServerMods(serverId: string): Promise<UnifiedModData[]> {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods`);
      
      if (response.ok) {
        const mods = await response.json();
        return Array.isArray(mods) ? mods.map(mod => this.convertToUnifiedData(mod)) : [];
      } else {
        addConsoleWarning(`⚠️ Failed to load server mods: ${response.statusText}`);
        return [];
      }
    } catch (error) {
      addConsoleError(`❌ Error loading server mods: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Generate launch options from enabled mods
   */
  generateLaunchOptions(mods: UnifiedModData[]): string {
    const enabledMods = mods.filter(mod => mod.enabled);
    if (enabledMods.length === 0) {
      return "";
    }
    
    const modIds = enabledMods.map(mod => mod.workshopId || mod.id).join(',');
    return `-mods=${modIds}`;
  }

  /**
   * Clear cache for specific mod or all mods
   */
  clearCache(modId?: string): void {
    if (modId) {
      this.individualModCache.delete(`mod_${modId}`);
      addConsoleInfo(`🗑️ Cleared cache for mod ${modId}`);
    } else {
      this.individualModCache.clear();
      addConsoleInfo(`🗑️ Cleared all mod cache`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.individualModCache.size,
      keys: Array.from(this.individualModCache.keys())
    };
  }

  /**
   * Convert server mod data to unified format
   */
  private convertToUnifiedData(mod: any): UnifiedModData {
    return {
      id: mod.id,
      name: mod.name || `Mod ${mod.id}`,
      description: mod.description || mod.summary || '',
      version: mod.version || '1.0.0',
      workshopId: mod.workshopId || mod.id,
      enabled: mod.enabled || mod.isEnabled || false,
      loadOrder: mod.loadOrder || 1,
      dependencies: mod.dependencies || [],
      incompatibilities: mod.incompatibilities || [],
      size: mod.size || mod.fileSize,
      lastUpdated: new Date(mod.lastUpdated || Date.now()),
      downloadCount: mod.downloadCount,
      thumbsUpCount: mod.thumbsUpCount,
      logoUrl: mod.logoUrl,
      author: mod.author,
      category: mod.category,
      tags: mod.tags || [],
      websiteUrl: mod.websiteUrl,
      fileSize: mod.fileSize
    };
  }

  /**
   * Convert CurseForge data to unified format
   */
  private convertFromCurseForgeData(curseForgeData: any): UnifiedModData {
    return {
      id: curseForgeData.id.toString(),
      name: curseForgeData.name,
      description: curseForgeData.summary || '',
      version: curseForgeData.latestFiles?.[0]?.displayName || '1.0.0',
      workshopId: curseForgeData.id.toString(),
      enabled: true, // Default to enabled when adding
      loadOrder: 1, // Default load order
      dependencies: [],
      incompatibilities: [],
      size: curseForgeData.latestFiles?.[0]?.fileLength,
      lastUpdated: new Date(curseForgeData.dateModified),
      downloadCount: curseForgeData.downloadCount,
      thumbsUpCount: curseForgeData.thumbsUpCount,
      logoUrl: curseForgeData.logo?.url,
      author: curseForgeData.authors?.[0]?.name,
      category: curseForgeData.categories?.[0]?.name,
      tags: curseForgeData.categories?.map((cat: any) => cat.name) || [],
      websiteUrl: curseForgeData.links?.websiteUrl,
      fileSize: curseForgeData.latestFiles?.[0]?.fileLength
    };
  }
}

// Export singleton instance
export const unifiedModManager = new UnifiedModManager(); 