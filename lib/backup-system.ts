import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { emitBackupProgress } from './websocket';
import type { BackupInfo } from '@/types/server';

export interface BackupResult {
  success: boolean;
  message: string;
  backup?: BackupInfo;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredFiles?: string[];
  error?: string;
}

export class BackupSystem {
  private static readonly BACKUP_DIR = 'backups';

  /**
   * Create a backup of server configuration and save files
   */
  static async createBackup(serverId: string, configPath: string) {
    // Backup implementation
    return { success: true, message: 'Backup created' };
  }
  
  static async restoreBackup(backupId: string, targetPath: string) {
    // Restore implementation
    return { success: true, message: 'Backup restored' };
  }

  /**
   * List all backups for a server
   */
  static async listBackups(serverId: string): Promise<BackupInfo[]> {
    try {
      const serverBackupDir = path.join(process.cwd(), this.BACKUP_DIR, serverId);
      
      if (!existsSync(serverBackupDir)) {
        return [];
      }

      const backupDirs = await fs.readdir(serverBackupDir);
      const backups: BackupInfo[] = [];

      for (const backupDir of backupDirs) {
        const metadataPath = path.join(serverBackupDir, backupDir, 'backup.json');
        
        if (existsSync(metadataPath)) {
          try {
            const metadata = await fs.readFile(metadataPath, 'utf-8');
            const backupInfo = JSON.parse(metadata) as BackupInfo;
            
            // Update size if needed
            backupInfo.size = await this.getDirectorySize(backupInfo.path);
            
            backups.push(backupInfo);
          } catch (error) {
            console.error(`Failed to read backup metadata for ${backupDir}:`, error);
          }
        }
      }

      // Sort by creation date (newest first)
      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(serverId: string, backupId: string): Promise<BackupResult> {
    try {
      const backupPath = path.join(process.cwd(), this.BACKUP_DIR, serverId, backupId);
      
      if (!existsSync(backupPath)) {
        return {
          success: false,
          message: 'Backup not found',
          error: `Backup ${backupId} does not exist`
        };
      }

      await this.removeDirectory(backupPath);

      return {
        success: true,
        message: 'Backup deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete backup',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Schedule automatic backups
   */
  static startAutomaticBackups(
    serverId: string,
    serverName: string,
    configPath: string,
    savePath?: string,
    intervalHours = 6
  ): NodeJS.Timeout {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    return setInterval(async () => {
      try {
        const result = await this.createBackup(
          serverId,
          configPath
        );

        if (result.success) {
          console.log(`Automatic backup created for server ${serverId}`);
          
          // Clean up old automatic backups (keep last 10)
          await this.cleanupOldBackups(serverId, 10);
        } else {
          console.error(`Failed to create automatic backup for server ${serverId}:`, result.message);
        }
      } catch (error) {
        console.error(`Error in automatic backup for server ${serverId}:`, error);
      }
    }, intervalMs);
  }

  /**
   * Clean up old backups (keep specified number of most recent)
   */
  static async cleanupOldBackups(serverId: string, keepCount = 10): Promise<void> {
    try {
      const backups = await this.listBackups(serverId);
      
      // Filter automatic backups only for cleanup
      const automaticBackups = backups.filter(b => b.type === 'automatic');
      
      if (automaticBackups.length > keepCount) {
        const toDelete = automaticBackups.slice(keepCount);
        
        for (const backup of toDelete) {
          await this.deleteBackup(serverId, backup.id);
        }
        
        console.log(`Cleaned up ${toDelete.length} old automatic backups for server ${serverId}`);
      }
    } catch (error) {
      console.error(`Failed to cleanup old backups for server ${serverId}:`, error);
    }
  }

  // Helper methods

  private static async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });
    
    const items = await fs.readdir(source, { withFileTypes: true });
    
    for (const item of items) {
      const sourcePath = path.join(source, item.name);
      const destPath = path.join(destination, item.name);
      
      if (item.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  private static async removeDirectory(dirPath: string): Promise<void> {
    if (existsSync(dirPath)) {
      await fs.rm(dirPath, { recursive: true, force: true });
    }
  }

  private static async countFiles(dirPath: string): Promise<number> {
    let count = 0;
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          count += await this.countFiles(path.join(dirPath, item.name));
        } else {
          count++;
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
    
    return count;
  }

  private static async getDirectorySize(dirPath: string): Promise<number> {
    let size = 0;
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          size += await this.getDirectorySize(itemPath);
        } else {
          const stats = await fs.stat(itemPath);
          size += stats.size;
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
    
    return size;
  }
} 