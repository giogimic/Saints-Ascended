import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface ServerSettings {
  [key: string]: any;
}

class ServerSettingsStorage {
  private readonly dataDir: string;

  constructor() {
    this.dataDir = join(process.cwd(), "data", "server-settings");
    this.ensureDataDirectory();
  }

  private getFilePath(serverId: string): string {
    return join(this.dataDir, `${serverId}.json`);
  }

  private ensureDataDirectory(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async getSetting(serverId: string, key: string): Promise<any> {
    try {
      const filePath = this.getFilePath(serverId);
      if (!existsSync(filePath)) {
        return null;
      }
      const fileContent = readFileSync(filePath, "utf-8");
      const settings = JSON.parse(fileContent) as ServerSettings;
      return settings[key] || null;
    } catch (error) {
      console.error(`Error getting setting '${key}' for server ${serverId}:`, error);
      return null;
    }
  }

  async saveSetting(serverId: string, key: string, value: any): Promise<void> {
    try {
      const filePath = this.getFilePath(serverId);
      let settings: ServerSettings = {};

      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, "utf-8");
        settings = JSON.parse(fileContent) as ServerSettings;
      }

      settings[key] = value;

      const jsonData = JSON.stringify(settings, null, 2);
      writeFileSync(filePath, jsonData, "utf-8");
    } catch (error) {
      console.error(`Error saving setting '${key}' for server ${serverId}:`, error);
      throw new Error("Failed to save server setting");
    }
  }
}

export const serverSettingsStorage = new ServerSettingsStorage(); 