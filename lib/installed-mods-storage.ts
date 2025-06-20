import { readFileSync, writeFileSync, existsSync, mkdirSync, unlink } from "fs";
import { join } from "path";
import { CurseForgeModData } from "../types/curseforge";
import { prisma } from "./database";

export interface InstalledModMetadata {
  id: string;
  name: string;
  description?: string;
  downloadCount?: number;
  thumbsUpCount?: number;
  logoUrl?: string;
  author?: string;
  lastUpdated: Date;
  installedAt: Date;
  version?: string;
  fileSize?: number;
  category?: string;
  tags?: string[];
  websiteUrl?: string;
  isEnabled: boolean;
  loadOrder: number;
  serverId: string;
  modId: string;
}

export interface InstalledModsData {
  mods: InstalledModMetadata[];
  lastUpdated: Date;
}

export class InstalledModsStorage {
  private dataDir: string;
  private cacheFile: string;
  private cache: InstalledModsData | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  constructor(dataDir: string = "data") {
    this.dataDir = dataDir;
    this.cacheFile = join(this.dataDir, "installed-mods-cache.json");
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private async loadFromCache(): Promise<InstalledModsData | null> {
    try {
      if (!existsSync(this.cacheFile)) {
        return null;
      }

      const data = readFileSync(this.cacheFile, "utf-8");
      const cached = JSON.parse(data) as InstalledModsData;

      // Check if cache is still valid
      if (Date.now() - cached.lastUpdated.getTime() < this.cacheExpiry) {
        return cached;
      }

      return null;
    } catch (error) {
      console.error("Failed to load from cache:", error);
      return null;
    }
  }

  private async saveToCache(data: InstalledModsData): Promise<void> {
    try {
      this.ensureDataDir();
      writeFileSync(this.cacheFile, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save to cache:", error);
    }
  }

  async loadMods(serverId: string): Promise<InstalledModMetadata[]> {
    try {
      // Try to load from database
      const dbMods = await (prisma.installedMod as any).findMany({
        where: { serverId },
        orderBy: { loadOrder: "asc" },
      });

      if (dbMods.length > 0) {
        const mods = dbMods.map((mod: any) => ({
          id: String(mod.id),
          name: mod.name,
          description: mod.description || undefined,
          downloadCount: mod.downloadCount || undefined,
          thumbsUpCount: mod.thumbsUpCount || undefined,
          logoUrl: mod.logoUrl || undefined,
          author: mod.author || undefined,
          lastUpdated: mod.lastUpdated,
          installedAt: mod.createdAt,
          version: mod.version || undefined,
          fileSize: mod.fileSize ? Number(mod.fileSize) : undefined,
          category: mod.category || undefined,
          tags: mod.tags ? JSON.parse(mod.tags) : undefined,
          websiteUrl: mod.websiteUrl || undefined,
          isEnabled: mod.enabled,
          loadOrder: mod.loadOrder,
          serverId: mod.serverId,
          modId: mod.modId,
        }));

        // Update cache
        const cacheData: InstalledModsData = {
          mods,
          lastUpdated: new Date(),
        };
        await this.saveToCache(cacheData);
        this.cache = cacheData;
        this.lastCacheUpdate = Date.now();

        return mods;
      }

      // Fallback to cache if database is empty
      const cached = await this.loadFromCache();
      if (cached) {
        this.cache = cached;
        this.lastCacheUpdate = Date.now();
        return cached.mods;
      }

      return [];
    } catch (error) {
      console.error("Failed to load mods from database:", error);
      
      // Fallback to cache on database error
      const cached = await this.loadFromCache();
      if (cached) {
        this.cache = cached;
        this.lastCacheUpdate = Date.now();
        return cached.mods;
      }

      return [];
    }
  }

  async saveMod(mod: InstalledModMetadata): Promise<void> {
    try {
      // Save to database using upsert with composite unique key
      await (prisma.installedMod as any).upsert({
        where: {
          serverId_modId: {
            serverId: mod.serverId,
            modId: mod.modId,
          },
        },
        update: {
          name: mod.name,
          description: mod.description,
          downloadCount: mod.downloadCount,
          thumbsUpCount: mod.thumbsUpCount,
          logoUrl: mod.logoUrl,
          author: mod.author,
          lastUpdated: mod.lastUpdated,
          version: mod.version,
          fileSize: mod.fileSize,
          category: mod.category,
          tags: mod.tags ? JSON.stringify(mod.tags) : null,
          websiteUrl: mod.websiteUrl,
          enabled: mod.isEnabled,
          loadOrder: mod.loadOrder,
        },
        create: {
          serverId: mod.serverId,
          modId: mod.modId,
          name: mod.name,
          description: mod.description,
          downloadCount: mod.downloadCount,
          thumbsUpCount: mod.thumbsUpCount,
          logoUrl: mod.logoUrl,
          author: mod.author,
          lastUpdated: mod.lastUpdated,
          version: mod.version,
          fileSize: mod.fileSize,
          category: mod.category,
          tags: mod.tags ? JSON.stringify(mod.tags) : null,
          websiteUrl: mod.websiteUrl,
          enabled: mod.isEnabled,
          loadOrder: mod.loadOrder,
        },
      });

      // Update cache
      const currentMods = await this.loadMods(mod.serverId);
      const existingIndex = currentMods.findIndex((m) => m.id === mod.id);
      
      if (existingIndex >= 0) {
        currentMods[existingIndex] = mod;
      } else {
        currentMods.push(mod);
      }

      const cacheData: InstalledModsData = {
        mods: currentMods,
        lastUpdated: new Date(),
      };
      await this.saveToCache(cacheData);
      this.cache = cacheData;
      this.lastCacheUpdate = Date.now();
    } catch (error) {
      console.error("Failed to save mod to database:", error);
      throw new Error(`Failed to save mod: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeMod(serverId: string, modId: string): Promise<void> {
    try {
      await (prisma.installedMod as any).delete({
        where: {
          serverId_modId: {
            serverId,
            modId,
          },
        },
      });

      // Update cache
      const currentMods = await this.loadMods(serverId);
      const filteredMods = currentMods.filter((m) => m.id !== modId);

      const cacheData: InstalledModsData = {
        mods: filteredMods,
        lastUpdated: new Date(),
      };
      await this.saveToCache(cacheData);
      this.cache = cacheData;
      this.lastCacheUpdate = Date.now();
    } catch (error) {
      console.error("Failed to remove mod from database:", error);
      throw new Error(`Failed to remove mod: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMod(serverId: string, modId: string): Promise<InstalledModMetadata | null> {
    try {
      const mod = await (prisma.installedMod as any).findUnique({
        where: {
          serverId_modId: {
            serverId,
            modId,
          },
        },
      });

      if (!mod) return null;

      return {
        id: String(mod.id),
        name: mod.name,
        description: mod.description || undefined,
        downloadCount: mod.downloadCount || undefined,
        thumbsUpCount: mod.thumbsUpCount || undefined,
        logoUrl: mod.logoUrl || undefined,
        author: mod.author || undefined,
        lastUpdated: mod.lastUpdated,
        installedAt: mod.createdAt,
        version: mod.version || undefined,
        fileSize: mod.fileSize ? Number(mod.fileSize) : undefined,
        category: mod.category || undefined,
        tags: mod.tags ? JSON.parse(mod.tags) : undefined,
        websiteUrl: mod.websiteUrl || undefined,
        isEnabled: mod.enabled,
        loadOrder: mod.loadOrder,
        serverId: mod.serverId,
        modId: mod.modId,
      };
    } catch (error) {
      console.error("Failed to get mod from database:", error);
      return null;
    }
  }

  async updateModFromCurseForge(
    serverId: string,
    modId: string,
    curseForgeData: CurseForgeModData
  ): Promise<void> {
    const mod: InstalledModMetadata = {
      id: modId,
      name: curseForgeData.name,
      description: curseForgeData.summary,
      downloadCount: curseForgeData.downloadCount,
      thumbsUpCount: curseForgeData.thumbsUpCount,
      logoUrl: curseForgeData.logo?.thumbnailUrl,
      author: curseForgeData.authors?.[0]?.name,
      lastUpdated: new Date(curseForgeData.dateModified),
      installedAt: new Date(),
      version: curseForgeData.latestFiles?.[0]?.displayName,
      fileSize: curseForgeData.latestFiles?.[0]?.fileLength
        ? Number(curseForgeData.latestFiles[0].fileLength)
        : undefined,
      category: curseForgeData.categories?.[0]?.name,
      tags: curseForgeData.categories?.map((cat) => cat.name),
      websiteUrl: curseForgeData.links?.websiteUrl,
      isEnabled: true,
      loadOrder: 999,
      serverId,
      modId,
    };

    await this.saveMod(mod);
  }

  async updateModStatuses(
    updates: Array<{ serverId: string; id: string; isEnabled: boolean; loadOrder: number }>
  ): Promise<void> {
    try {
      // Use database transaction for bulk update
      await prisma.$transaction(
        updates.map((update) =>
          (prisma.installedMod as any).update({
            where: {
              serverId_modId: {
                serverId: update.serverId,
                modId: update.id,
              },
            },
            data: {
              enabled: update.isEnabled,
              loadOrder: update.loadOrder,
              lastUpdated: new Date(),
            },
          })
        )
      );

      // Update cache for each server
      const serverIds = [...new Set(updates.map((u) => u.serverId))];
      for (const serverId of serverIds) {
        const currentMods = await this.loadMods(serverId);
        const cacheData: InstalledModsData = {
          mods: currentMods,
          lastUpdated: new Date(),
        };
        await this.saveToCache(cacheData);
      }
    } catch (error) {
      console.error("Failed to update mod statuses:", error);
      throw new Error(`Failed to update mod statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async clearCache(): Promise<void> {
    this.cache = null;
    this.lastCacheUpdate = 0;
    try {
      if (existsSync(this.cacheFile)) {
        unlink(this.cacheFile, (err) => {
          if (err) console.error("Failed to clear cache file:", err);
        });
      }
    } catch (error) {
      console.error("Failed to clear cache file:", error);
    }
  }
}

// Export singleton instance
export const installedModsStorage = new InstalledModsStorage();
