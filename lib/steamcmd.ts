import { spawn } from 'child_process';
import { emitUpdateProgress } from './websocket';

export interface SteamCMDResult {
  success: boolean;
  message: string;
  output?: string;
  error?: string;
}

export class SteamCMD {
  private static readonly ARK_APP_ID = '2430930'; // Ark: Survival Ascended Dedicated Server

  /**
   * Update Ark server using SteamCMD
   */
  static async updateServer(
    steamCmdPath: string,
    serverPath: string,
    serverId?: string
  ): Promise<SteamCMDResult> {
    try {
      const args = [
        '+force_install_dir', serverPath,
        '+login', 'anonymous',
        '+app_update', this.ARK_APP_ID, 'validate',
        '+quit'
      ];

      return this.executeSteamCMD(steamCmdPath, args, serverId);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update server',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Download and install a mod
   */
  static async installMod(
    steamCmdPath: string,
    serverPath: string,
    modId: string,
    serverId?: string
  ): Promise<SteamCMDResult> {
    try {
      const args = [
        '+force_install_dir', serverPath,
        '+login', 'anonymous',
        '+workshop_download_item', this.ARK_APP_ID, modId,
        '+quit'
      ];

      return this.executeSteamCMD(steamCmdPath, args, serverId);
    } catch (error) {
      return {
        success: false,
        message: `Failed to install mod ${modId}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate server installation
   */
  static async validateServer(
    steamCmdPath: string,
    serverPath: string,
    serverId?: string
  ): Promise<SteamCMDResult> {
    try {
      const args = [
        '+force_install_dir', serverPath,
        '+login', 'anonymous',
        '+app_update', this.ARK_APP_ID, 'validate',
        '+quit'
      ];

      return this.executeSteamCMD(steamCmdPath, args, serverId);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to validate server',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get mod information from Steam Workshop
   */
  static async getModInfo(modId: string): Promise<any> {
    try {
      // In a real implementation, this would query Steam Web API
      // For now, return mock data
      return {
        id: modId,
        title: `Mod ${modId}`,
        description: 'Ark mod description',
        file_size: 1024 * 1024 * 100, // 100MB
        time_updated: Date.now(),
        subscriptions: 1000,
        favorited: 100
      };
    } catch (error) {
      throw new Error(`Failed to get mod info for ${modId}`);
    }
  }

  /**
   * Execute SteamCMD with progress tracking
   */
  private static async executeSteamCMD(
    steamCmdPath: string,
    args: string[],
    serverId?: string
  ): Promise<SteamCMDResult> {
    return new Promise((resolve) => {
      const process = spawn(steamCmdPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';
      let lastProgress = 0;

      // Track progress from stdout
      process.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Parse progress indicators
        const progressPatterns = [
          /Update state \(0x\d+\) downloading, progress: (\d+\.\d+)/,
          /Update state \(0x\d+\) validating, progress: (\d+\.\d+)/,
          /(\d+)% complete/i
        ];

        for (const pattern of progressPatterns) {
          const match = text.match(pattern);
          if (match) {
            const progress = Math.round(parseFloat(match[1]));
            if (progress !== lastProgress && serverId) {
              lastProgress = progress;
              emitUpdateProgress(serverId, progress, `SteamCMD: ${progress}% complete`);
            }
            break;
          }
        }

        // Check for specific messages
        if (text.includes('Success! App') && serverId) {
          emitUpdateProgress(serverId, 100, 'SteamCMD: Update completed successfully');
        }
      });

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('exit', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            message: 'SteamCMD operation completed successfully',
            output
          });
        } else {
          resolve({
            success: false,
            message: `SteamCMD operation failed with exit code ${code}`,
            output,
            error: errorOutput
          });
        }
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          message: 'Failed to execute SteamCMD',
          error: error.message
        });
      });
    });
  }

  /**
   * Check if SteamCMD is available
   */
  static async checkSteamCMD(steamCmdPath: string): Promise<boolean> {
    try {
      const result = await this.executeSteamCMD(steamCmdPath, ['+quit']);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Download SteamCMD (for Windows)
   */
  static getSteamCMDDownloadInfo(): { url: string; instructions: string } {
    return {
      url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip',
      instructions: [
        '1. Download steamcmd.zip from the URL above',
        '2. Extract to a folder (e.g., C:\\SteamCMD\\)',
        '3. Run steamcmd.exe once to complete installation',
        '4. Use the full path to steamcmd.exe in server configuration'
      ].join('\n')
    };
  }
} 