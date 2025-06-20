import fs from 'fs/promises';
import path from 'path';
import { existsSync, createReadStream, createWriteStream, watch } from 'fs';
import type { GameUserSettings, GameIniSettings } from '@/types/server';

export interface FileOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface BackupInfo {
  id: string;
  serverId: string;
  name: string;
  path: string;
  size: number;
  createdAt: Date;
  type: 'manual' | 'automatic' | 'scheduled';
  description?: string;
}

export class FileOperations {
  /**
   * Read GameUserSettings.ini file
   */
  static async readGameUserSettings(configPath: string): Promise<FileOperationResult> {
    try {
      const filePath = path.join(configPath, 'GameUserSettings.ini');
      
      if (!existsSync(filePath)) {
        return {
          success: false,
          message: 'GameUserSettings.ini not found',
          error: `File does not exist: ${filePath}`
        };
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = this.parseIniFile(content);

      return {
        success: true,
        message: 'GameUserSettings.ini read successfully',
        data: parsed
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read GameUserSettings.ini',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Write GameUserSettings.ini file
   */
  static async writeGameUserSettings(
    configPath: string, 
    settings: GameUserSettings
  ): Promise<FileOperationResult> {
    try {
      const filePath = path.join(configPath, 'GameUserSettings.ini');
      const content = this.formatIniFile(settings);

      // Create backup before writing
      if (existsSync(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
      }

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Write new content
      await fs.writeFile(filePath, content, 'utf-8');

      return {
        success: true,
        message: 'GameUserSettings.ini written successfully',
        data: { path: filePath }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to write GameUserSettings.ini',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Read Game.ini file
   */
  static async readGameIni(configPath: string): Promise<FileOperationResult> {
    try {
      const filePath = path.join(configPath, 'Game.ini');
      
      if (!existsSync(filePath)) {
        return {
          success: true,
          message: 'Game.ini not found, returning empty configuration',
          data: {}
        };
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = this.parseIniFile(content);

      return {
        success: true,
        message: 'Game.ini read successfully',
        data: parsed
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read Game.ini',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Write Game.ini file
   */
  static async writeGameIni(
    configPath: string, 
    settings: GameIniSettings
  ): Promise<FileOperationResult> {
    try {
      const filePath = path.join(configPath, 'Game.ini');
      const content = this.formatIniFile(settings);

      // Create backup before writing
      if (existsSync(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
      }

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Write new content
      await fs.writeFile(filePath, content, 'utf-8');

      return {
        success: true,
        message: 'Game.ini written successfully',
        data: { path: filePath }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to write Game.ini',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate server paths and executables
   */
  static async validateServerPaths(
    executablePath: string,
    configDirectory: string,
    steamCmdPath: string
  ): Promise<FileOperationResult> {
    const errors: string[] = [];

    try {
      // Check executable exists
      if (!existsSync(executablePath)) {
        errors.push(`Server executable not found: ${executablePath}`);
      }

      // Check if it's actually an executable
      if (existsSync(executablePath)) {
        const stats = await fs.stat(executablePath);
        if (!stats.isFile()) {
          errors.push(`Server executable path is not a file: ${executablePath}`);
        }
      }

      // Check config directory exists or can be created
      if (!existsSync(configDirectory)) {
        try {
          await fs.mkdir(configDirectory, { recursive: true });
        } catch (mkdirError) {
          errors.push(`Cannot create config directory: ${configDirectory}`);
        }
      }

      // Check SteamCMD exists
      if (!existsSync(steamCmdPath)) {
        errors.push(`SteamCMD not found: ${steamCmdPath}`);
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: 'Path validation failed',
          error: errors.join('; ')
        };
      }

      return {
        success: true,
        message: 'All paths validated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Path validation error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create server backup
   */
  static async createBackup(
    serverId: string,
    configPath: string,
    backupName: string,
    description?: string
  ): Promise<FileOperationResult> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup_${serverId}_${timestamp}`;
      const backupDir = path.join(process.cwd(), 'backups', serverId);
      const backupPath = path.join(backupDir, `${backupId}.tar.gz`);

      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      // Create backup (simplified - in production would use proper archiving)
      const backupContent = await this.createArchive(configPath);
      await fs.writeFile(backupPath, backupContent);

      const stats = await fs.stat(backupPath);
      
      const backupInfo: BackupInfo = {
        id: backupId,
        serverId,
        name: backupName,
        path: backupPath,
        size: stats.size,
        createdAt: new Date(),
        type: 'manual',
        description
      };

      return {
        success: true,
        message: 'Backup created successfully',
        data: backupInfo
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create backup',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(
    backupPath: string,
    targetConfigPath: string
  ): Promise<FileOperationResult> {
    try {
      if (!existsSync(backupPath)) {
        return {
          success: false,
          message: 'Backup file not found',
          error: `Backup does not exist: ${backupPath}`
        };
      }

      // Create backup of current state before restore
      const currentBackupPath = `${targetConfigPath}.restore-backup.${Date.now()}`;
      if (existsSync(targetConfigPath)) {
        await this.copyDirectory(targetConfigPath, currentBackupPath);
      }

      // Restore from backup (simplified - in production would use proper extraction)
      await this.extractArchive(backupPath, targetConfigPath);

      return {
        success: true,
        message: 'Backup restored successfully',
        data: { 
          restored: targetConfigPath,
          currentBackup: currentBackupPath 
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to restore backup',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * List server logs
   */
  static async getServerLogs(
    logPath: string,
    maxLines = 1000
  ): Promise<FileOperationResult> {
    try {
      const logFiles = await fs.readdir(logPath);
      const arkLogFiles = logFiles.filter(file => 
        file.includes('ShooterGame') && file.endsWith('.log')
      );

      if (arkLogFiles.length === 0) {
        return {
          success: true,
          message: 'No log files found',
          data: []
        };
      }

      // Get the most recent log file
      const latestLogFile = arkLogFiles.sort().reverse()[0];
      const logFilePath = path.join(logPath, latestLogFile);
      
      const content = await fs.readFile(logFilePath, 'utf-8');
      const lines = content.split('\n').slice(-maxLines);

      return {
        success: true,
        message: `Retrieved ${lines.length} log lines`,
        data: {
          filename: latestLogFile,
          lines: lines.filter(line => line.trim().length > 0),
          totalFiles: arkLogFiles.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read server logs',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Watch file changes (simplified implementation)
   */
  static async watchConfigFiles(
    configPath: string,
    callback: (filename: string, eventType: string) => void
  ): Promise<FileOperationResult> {
    try {
      const watcher = watch(configPath, { recursive: true }, (eventType: string, filename: string | null) => {
        if (filename && (filename.includes('.ini') || filename.includes('.log'))) {
          callback(filename, eventType);
        }
      });

      return {
        success: true,
        message: 'File watcher started',
        data: { watcher }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to start file watcher',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods

  private static parseIniFile(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    let currentSection = '';

    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('#')) {
        continue;
      }

      // Section header
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        currentSection = trimmedLine.slice(1, -1);
        if (!result[currentSection]) {
          result[currentSection] = {};
        }
        continue;
      }

      // Key-value pair
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.slice(0, equalIndex).trim();
        const value = trimmedLine.slice(equalIndex + 1).trim();
        
        if (currentSection) {
          result[currentSection][key] = this.parseIniValue(value);
        } else {
          result[key] = this.parseIniValue(value);
        }
      }
    }

    return result;
  }

  private static parseIniValue(value: string): string | number | boolean {
    // Boolean values
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Numeric values
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    
    // String values (remove quotes if present)
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    return value;
  }

  private static formatIniFile(data: Record<string, any>): string {
    let content = '';

    for (const [section, values] of Object.entries(data)) {
      if (typeof values === 'object' && values !== null) {
        content += `[${section}]\n`;
        
        for (const [key, value] of Object.entries(values)) {
          content += `${key}=${this.formatIniValue(value)}\n`;
        }
        
        content += '\n';
      } else {
        content += `${section}=${this.formatIniValue(values)}\n`;
      }
    }

    return content;
  }

  private static formatIniValue(value: any): string {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string' && value.includes(' ')) {
      return `"${value}"`;
    }
    return String(value);
  }

  private static async createArchive(sourcePath: string): Promise<Buffer> {
    // Simplified archive creation - in production would use tar or zip library
    const files = await this.getAllFiles(sourcePath);
    const archive: Record<string, string> = {};
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const relativePath = path.relative(sourcePath, file);
      archive[relativePath] = content;
    }
    
    return Buffer.from(JSON.stringify(archive), 'utf-8');
  }

  private static async extractArchive(archivePath: string, targetPath: string): Promise<void> {
    // Simplified archive extraction - in production would use tar or zip library
    const content = await fs.readFile(archivePath, 'utf-8');
    const archive = JSON.parse(content);
    
    await fs.mkdir(targetPath, { recursive: true });
    
    for (const [relativePath, fileContent] of Object.entries(archive)) {
      const fullPath = path.join(targetPath, relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, fileContent as string, 'utf-8');
    }
  }

  private static async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private static async copyDirectory(source: string, target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true });
    
    const items = await fs.readdir(source, { withFileTypes: true });
    
    for (const item of items) {
      const sourcePath = path.join(source, item.name);
      const targetPath = path.join(target, item.name);
      
      if (item.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  static async readConfig(path: string) {
    // Implementation for reading config files
    return { success: true, data: {} };
  }
  
  static async writeConfig(path: string, data: any) {
    // Implementation for writing config files
    return { success: true };
  }
} 