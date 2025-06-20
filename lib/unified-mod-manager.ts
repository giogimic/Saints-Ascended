// lib/unified-mod-manager.ts
// Unified Mod Manager - Handles all mod operations with comprehensive auto-fetch logic

import { CurseForgeAPI } from "./curseforge-api";
import { installedModsStorage, InstalledModMetadata } from "./installed-mods-storage";
import { modCacheClient } from "./mod-cache-client";
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
   * Comprehensive mod data fetching: Cache → DB → CurseForge API → Store
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

      // Step 2: Check installed mods storage (DB/JSON)
      const installedMod = await installedModsStorage.getMod(modId);
      if (installedMod) {
        const unifiedData = this.convertToUnifiedData(installedMod);
        this.individualModCache.set(cacheKey, { data: unifiedData, timestamp: Date.now() });
        addConsoleInfo(`📦 Found mod ${modId} in installed storage`);
        return unifiedData;
      }

      // Step 3: Fetch from CurseForge API
      addConsoleInfo(`🌐 Fetching mod ${modId} from CurseForge API`);
      const curseForgeData = await CurseForgeAPI.getModDetails(parseInt(modId, 10));
      
      if (curseForgeData) {
        // Convert and store the data
        const unifiedData = this.convertFromCurseForgeData(curseForgeData);
        
        // Store in installed mods storage for future use
        await this.storeModData(unifiedData);
        
        // Cache the result
        this.individualModCache.set(cacheKey, { data: unifiedData, timestamp: Date.now() });
        
        addConsoleSuccess(`✅ Successfully fetched and stored mod ${modId}: ${curseForgeData.name}`);
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
      if (!modData) {
        return {
          success: false,
          message: `Mod ${modId} not found`,
          error: 'Mod not found'
        };
      }

      // Update on server
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modId, 
          enabled 
        })
      });

      if (response.ok) {
        // Update cached data
        const updatedModData = { ...modData, enabled };
        this.individualModCache.set(`mod_${modId}`, { 
          data: updatedModData, 
          timestamp: Date.now() 
        });

        const action = enabled ? 'enabled' : 'disabled';
        addConsoleInfo(`🔄 ${action.charAt(0).toUpperCase() + action.slice(1)} mod: ${modData.name}`);
        
        return {
          success: true,
          message: `${modData.name} ${action}`,
          mod: updatedModData
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
   * Bulk add mods with comprehensive data fetching
   */
  async bulkAddMods(modIds: string[], serverId: string): Promise<{
    successCount: number;
    errorCount: number;
    results: ModOperationResult[];
  }> {
    const results: ModOperationResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    addConsoleInfo(`🔄 Starting bulk add of ${modIds.length} mods`);

    for (const modId of modIds) {
      const result = await this.addMod(modId, serverId);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    addConsoleInfo(`🎉 Bulk add completed: ${successCount} success, ${errorCount} failed`);
    
    return {
      successCount,
      errorCount,
      results
    };
  }

  /**
   * Get all mods for a server with comprehensive data
   */
  async getServerMods(serverId: string): Promise<UnifiedModData[]> {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch server mods: ${response.statusText}`);
      }

      const mods = await response.json();
      
      // Enhance mods with comprehensive data
      const enhancedMods: UnifiedModData[] = [];
      
      for (const mod of mods) {
        const enhancedMod = await this.fetchModData(mod.id);
        if (enhancedMod) {
          enhancedMods.push(enhancedMod);
        } else {
          // Fallback to basic mod data if fetch fails
          enhancedMods.push(this.convertToUnifiedData(mod));
        }
      }

      return enhancedMods;

    } catch (error) {
      addConsoleError(`❌ Error fetching server mods: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Clear cache for a specific mod or all mods
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

  // Private helper methods

  private convertToUnifiedData(installedMod: InstalledModMetadata): UnifiedModData {
    return {
      id: installedMod.id,
      name: installedMod.name,
      description: installedMod.summary || "No description available",
      version: installedMod.version || "Unknown",
      workshopId: installedMod.id,
      enabled: installedMod.isEnabled,
      loadOrder: installedMod.loadOrder,
      dependencies: [],
      incompatibilities: [],
      size: installedMod.fileSize,
      lastUpdated: installedMod.lastUpdated,
      downloadCount: installedMod.downloadCount,
      thumbsUpCount: installedMod.thumbsUpCount,
      logoUrl: installedMod.logoUrl,
      author: installedMod.author,
      category: installedMod.category,
      tags: installedMod.tags,
      websiteUrl: installedMod.websiteUrl,
      fileSize: installedMod.fileSize
    };
  }

  private convertFromCurseForgeData(curseForgeData: any): UnifiedModData {
    return {
      id: curseForgeData.id.toString(),
      name: curseForgeData.name,
      description: curseForgeData.summary || "No description available",
      version: "Latest",
      workshopId: curseForgeData.id.toString(),
      enabled: true,
      loadOrder: 0, // Will be set by the server
      dependencies: [],
      incompatibilities: [],
      size: curseForgeData.downloadCount,
      lastUpdated: new Date(curseForgeData.dateModified),
      downloadCount: curseForgeData.downloadCount,
      thumbsUpCount: curseForgeData.thumbsUpCount,
      logoUrl: curseForgeData.logo?.thumbnailUrl,
      author: curseForgeData.authors?.[0]?.name,
      category: curseForgeData.categories?.[0]?.name,
      tags: curseForgeData.categories?.map((cat: any) => cat.name) || [],
      websiteUrl: curseForgeData.links?.websiteUrl,
      fileSize: curseForgeData.latestFiles?.[0]?.fileLength
    };
  }

  private async storeModData(modData: UnifiedModData): Promise<void> {
    try {
      const installedModData: InstalledModMetadata = {
        id: modData.id,
        name: modData.name,
        summary: modData.description,
        downloadCount: modData.downloadCount,
        thumbsUpCount: modData.thumbsUpCount,
        logoUrl: modData.logoUrl,
        author: modData.author,
        lastUpdated: modData.lastUpdated,
        installedAt: new Date(),
        version: modData.version,
        fileSize: modData.fileSize,
        category: modData.category,
        tags: modData.tags,
        websiteUrl: modData.websiteUrl,
        isEnabled: modData.enabled,
        loadOrder: modData.loadOrder
      };

      await installedModsStorage.saveMod(installedModData);
    } catch (error) {
      addConsoleWarning(`⚠️ Failed to store mod data for ${modData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const unifiedModManager = new UnifiedModManager(); 