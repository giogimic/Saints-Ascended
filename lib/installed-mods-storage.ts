import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { CurseForgeModData } from "../types/curseforge";
import { PrismaClient } from "@prisma/client";

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
  lastSync: Date;
  version: string; // For future schema migrations
}

class InstalledModsStorage {
  private readonly dataDir: string;
  private readonly filePath: string;
  private readonly currentVersion = "1.0.0";
  private prisma!: PrismaClient;
  private dbAvailable: boolean = false;

  constructor() {
    this.dataDir = join(process.cwd(), "data");
    this.filePath = join(this.dataDir, "installedMods.json");
    this.ensureDataDirectory();

    // Initialize Prisma
    try {
      this.prisma = new PrismaClient();
      this.dbAvailable = true;
      console.log("Installed mods storage: Database connection initialized");
    } catch (error) {
      console.warn(
        "Installed mods storage: Failed to initialize database, falling back to JSON:",
        error
      );
      this.dbAvailable = false;
    }
  }

  /**
   * Ensure the data directory exists
   */
  private ensureDataDirectory(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load installed mods from database or fallback to JSON
   */
  async loadInstalledMods(): Promise<InstalledModsData> {
    try {
      if (this.dbAvailable) {
        // Try to load from database
        const dbMods = await this.prisma.installedMod.findMany({
          orderBy: { loadOrder: "asc" },
        });

        if (dbMods.length > 0) {
          const mods = (dbMods as any[]).map((mod) => ({
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
            tags: mod.tags ? JSON.parse(mod.tags) : [],
            websiteUrl: mod.websiteUrl || undefined,
            isEnabled: mod.enabled,
            loadOrder: mod.loadOrder,
            serverId: mod.serverId,
            modId: mod.modId,
          }));

          return {
            mods,
            lastSync: new Date(),
            version: this.currentVersion,
          };
        }
      }

      // Fallback to JSON file
      if (!existsSync(this.filePath)) {
        return this.getDefaultData();
      }

      const data = readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(data) as InstalledModsData;

      // Validate and migrate data if needed
      return this.validateAndMigrateData(parsed);
    } catch (error) {
      console.error("Error loading installed mods:", error);
      return this.getDefaultData();
    }
  }

  /**
   * Save installed mods to database or fallback to JSON
   */
  async saveInstalledMods(data: InstalledModsData): Promise<void> {
    try {
      if (this.dbAvailable) {
        // Save to database
        await this.prisma.installedMod.deleteMany(); // Clear existing

        for (const mod of data.mods) {
          if (!mod.serverId || !mod.modId) {
            throw new Error('serverId and modId are required for database operations');
          }
          
          await (this.prisma.installedMod as any).create({
            data: {
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
        }
        return;
      }

      // Fallback to JSON file
      this.ensureDataDirectory();

      // Update last sync timestamp
      data.lastSync = new Date();
      data.version = this.currentVersion;

      const jsonData = JSON.stringify(data, null, 2);
      writeFileSync(this.filePath, jsonData, "utf-8");
    } catch (error) {
      console.error("Error saving installed mods:", error);
      throw new Error("Failed to save installed mods data");
    }
  }

  /**
   * Add or update a mod in storage
   */
  async saveMod(mod: InstalledModMetadata): Promise<void> {
    try {
      if (this.dbAvailable) {
        if (!mod.serverId || !mod.modId) {
          throw new Error('serverId and modId are required for database operations');
        }

        // Save to database using upsert with composite unique key
        await (this.prisma.installedMod as any).upsert({
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
        return;
      }

      // Fallback to JSON file
      const data = await this.loadInstalledMods();

      // Find existing mod or add new one
      const existingIndex = data.mods.findIndex((m) => m.id === mod.id);
      if (existingIndex >= 0) {
        data.mods[existingIndex] = mod;
      } else {
        data.mods.push(mod);
      }

      await this.saveInstalledMods(data);
    } catch (error) {
      console.error("Error saving mod:", error);
      throw error;
    }
  }

  /**
   * Remove a mod from storage
   */
  async removeMod(modId: string, serverId: string): Promise<void> {
    try {
      if (this.dbAvailable) {
        await (this.prisma.installedMod as any).delete({
          where: {
            serverId_modId: {
              serverId,
              modId,
            },
          },
        });
        return;
      }

      // Fallback to JSON file
      const data = await this.loadInstalledMods();
      data.mods = data.mods.filter((mod) => mod.id !== modId);
      await this.saveInstalledMods(data);
    } catch (error) {
      console.error("Error removing mod:", error);
      throw error;
    }
  }

  /**
   * Get a specific mod by ID
   */
  async getMod(modId: string, serverId: string): Promise<InstalledModMetadata | null> {
    try {
      if (this.dbAvailable) {
        const mod = await (this.prisma.installedMod as any).findUnique({
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
          tags: mod.tags ? JSON.parse(mod.tags) : [],
          websiteUrl: mod.websiteUrl || undefined,
          isEnabled: mod.enabled,
          loadOrder: mod.loadOrder,
          serverId: mod.serverId,
          modId: mod.modId,
        };
      }

      // Fallback to JSON file
      const data = await this.loadInstalledMods();
      return data.mods.find((mod) => mod.id === modId) || null;
    } catch (error) {
      console.error("Error getting mod:", error);
      return null;
    }
  }

  /**
   * Get all installed mods
   */
  async getAllMods(): Promise<InstalledModMetadata[]> {
    const data = await this.loadInstalledMods();
    return data.mods;
  }

  /**
   * Get enabled mods only
   */
  async getEnabledMods(): Promise<InstalledModMetadata[]> {
    const data = await this.loadInstalledMods();
    return data.mods.filter((mod) => mod.isEnabled);
  }

  /**
   * Update mod metadata from CurseForge API data
   */
  async updateModFromCurseForge(
    modId: string,
    serverId: string,
    curseForgeData: CurseForgeModData
  ): Promise<void> {
    const existingMod = await this.getMod(modId, serverId);
    if (!existingMod) {
      console.warn(
        `Mod ${modId} not found in local storage, cannot update metadata`
      );
      return;
    }

    const updatedMod: InstalledModMetadata = {
      ...existingMod,
      name: curseForgeData.name,
      description: curseForgeData.summary,
      downloadCount: curseForgeData.downloadCount,
      thumbsUpCount: curseForgeData.thumbsUpCount,
      logoUrl: curseForgeData.logo?.thumbnailUrl,
      author: curseForgeData.authors?.[0]?.name,
      lastUpdated: new Date(),
      websiteUrl: curseForgeData.links?.websiteUrl,
      category: curseForgeData.categories?.[0]?.name,
      tags: curseForgeData.categories?.map((cat) => cat.name) || [],
    };

    await this.saveMod(updatedMod);
  }

  /**
   * Update mod status (enabled/disabled, load order)
   */
  async updateModStatus(
    modId: string,
    serverId: string,
    isEnabled: boolean,
    loadOrder: number
  ): Promise<void> {
    const existingMod = await this.getMod(modId, serverId);
    if (!existingMod) {
      console.warn(
        `Mod ${modId} not found in local storage, cannot update status`
      );
      return;
    }

    const updatedMod: InstalledModMetadata = {
      ...existingMod,
      isEnabled,
      loadOrder,
      lastUpdated: new Date(),
    };

    await this.saveMod(updatedMod);
  }

  /**
   * Bulk update mod statuses
   */
  async updateModStatuses(
    updates: Array<{ id: string; serverId: string; isEnabled: boolean; loadOrder: number }>
  ): Promise<void> {
    try {
      if (this.dbAvailable) {
        // Use database transaction for bulk update
        await this.prisma.$transaction(
          updates.map((update) =>
            (this.prisma.installedMod as any).update({
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
        return;
      }

      // Fallback to JSON file
      const data = await this.loadInstalledMods();

      updates.forEach((update) => {
        const modIndex = data.mods.findIndex((mod) => mod.id === update.id);
        if (modIndex >= 0) {
          data.mods[modIndex] = {
            ...data.mods[modIndex],
            isEnabled: update.isEnabled,
            loadOrder: update.loadOrder,
            lastUpdated: new Date(),
          };
        }
      });

      await this.saveInstalledMods(data);
    } catch (error) {
      console.error("Error updating mod statuses:", error);
      throw error;
    }
  }

  /**
   * Convert CurseForge mod data to installed mod metadata
   */
  convertCurseForgeToInstalledMod(
    curseForgeData: CurseForgeModData,
    serverId: string,
    isEnabled: boolean = true,
    loadOrder: number = 1
  ): InstalledModMetadata {
    return {
      id: curseForgeData.id.toString(),
      name: curseForgeData.name,
      description: curseForgeData.summary,
      downloadCount: curseForgeData.downloadCount,
      thumbsUpCount: curseForgeData.thumbsUpCount,
      logoUrl: curseForgeData.logo?.thumbnailUrl,
      author: curseForgeData.authors?.[0]?.name,
      lastUpdated: new Date(),
      installedAt: new Date(),
      websiteUrl: curseForgeData.links?.websiteUrl,
      category: curseForgeData.categories?.[0]?.name,
      tags: curseForgeData.categories?.map((cat) => cat.name) || [],
      isEnabled,
      loadOrder,
      serverId,
      modId: curseForgeData.id.toString(),
    };
  }

  /**
   * Get default data structure
   */
  private getDefaultData(): InstalledModsData {
    return {
      mods: [],
      lastSync: new Date(),
      version: this.currentVersion,
    };
  }

  /**
   * Validate and migrate data if needed
   */
  private validateAndMigrateData(data: any): InstalledModsData {
    if (!data || typeof data !== "object") {
      return this.getDefaultData();
    }

    if (!Array.isArray(data.mods)) {
      data.mods = [];
    }

    // Ensure each mod has required fields
    data.mods = data.mods.map((mod: any) => {
      if (!mod || typeof mod !== "object") return null;

      // Ensure required fields exist
      if (!mod.lastUpdated) mod.lastUpdated = new Date();
      if (!mod.installedAt) mod.installedAt = new Date();
      if (mod.isEnabled === undefined) mod.isEnabled = true;
      if (mod.loadOrder === undefined) mod.loadOrder = 1;
      if (!mod.serverId) mod.serverId = "";
      if (!mod.modId) mod.modId = mod.id || "";

      return mod;
    }).filter(Boolean);

    // Ensure metadata exists
    if (!data.lastSync) data.lastSync = new Date();
    if (!data.version) data.version = this.currentVersion;

    return data as InstalledModsData;
  }

  /**
   * Clear all installed mods
   */
  async clearAll(): Promise<void> {
    try {
      if (this.dbAvailable) {
        await this.prisma.installedMod.deleteMany();
        return;
      }

      // Fallback to JSON file
      const data = this.getDefaultData();
      await this.saveInstalledMods(data);
    } catch (error) {
      console.error("Error clearing installed mods:", error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalMods: number;
    enabledMods: number;
    lastSync: Date;
  }> {
    const data = await this.loadInstalledMods();
    return {
      totalMods: data.mods.length,
      enabledMods: data.mods.filter((mod) => mod.isEnabled).length,
      lastSync: data.lastSync,
    };
  }

  /**
   * Check if storage file exists (for JSON fallback)
   */
  exists(): boolean {
    return existsSync(this.filePath);
  }

  /**
   * Get the file path (for JSON fallback)
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.dbAvailable) {
      await this.prisma.$disconnect();
    }
  }
}

export const installedModsStorage = new InstalledModsStorage();
