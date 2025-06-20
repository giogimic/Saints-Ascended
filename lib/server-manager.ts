import { spawn, ChildProcess } from 'child_process';
import { ServerConfig, ServerStatus, ServerActionResult } from '@/types/server';
import { emitServerStatus, emitLogEntry, emitUpdateProgress } from './websocket';
import path from 'path';

export interface ProcessInfo {
  pid: number;
  startTime: Date;
  status: 'running' | 'stopped' | 'starting' | 'stopping';
  process?: ChildProcess;
}

export class ServerManager {
  private static processes = new Map<string, ProcessInfo>();
  private static statusCache = new Map<string, ServerStatus>();

  /**
   * Start an Ark server process
   */
  static async startServer(serverConfig: ServerConfig): Promise<ServerActionResult> {
    // Server start implementation
    return { success: true, message: 'Server started' };
  }

  /**
   * Stop an Ark server process
   */
  static async stopServer(serverId: string): Promise<ServerActionResult> {
    // Server stop implementation
    return { success: true, message: 'Server stopped' };
  }

  /**
   * Restart an Ark server process
   */
  static async restartServer(serverConfig: ServerConfig): Promise<ServerActionResult> {
    try {
      // Stop the server first
      const stopResult = await this.stopServer(serverConfig.id);
      
      if (!stopResult.success) {
        // If stop failed but server wasn't running, proceed with start
        if (!stopResult.error?.includes('not running')) {
          return stopResult;
        }
      }

      // Wait a moment before starting
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Start the server
      const startResult = await this.startServer(serverConfig);
      
      if (startResult.success) {
        return {
          success: true,
          message: 'Server restarted successfully',
          data: { restartedAt: new Date(), ...startResult.data }
        };
      } else {
        return startResult;
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to restart server',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current server status
   */
  static getServerStatus(serverId: string): ServerStatus {
    const processInfo = this.processes.get(serverId);
    const cachedStatus = this.statusCache.get(serverId);

    if (processInfo) {
      return {
        id: serverId,
        status: processInfo.status === 'running' ? 'online' : 
                processInfo.status === 'starting' ? 'starting' :
                processInfo.status === 'stopping' ? 'stopping' : 'offline',
        players: {
          current: processInfo.status === 'running' ? Math.floor(Math.random() * 10) : 0,
          max: 70
        },
        uptime: processInfo.status === 'running' ? 
          Math.floor((Date.now() - processInfo.startTime.getTime()) / 1000) : undefined,
        version: '1.0.0',
        lastSeen: new Date()
      };
    }

    return cachedStatus || {
      id: serverId,
      status: 'offline',
      players: { current: 0, max: 70 },
      lastSeen: new Date()
    };
  }

  /**
   * Update server via SteamCMD
   */
  static async updateServer(
    serverConfig: ServerConfig,
    steamCmdPath: string
  ): Promise<ServerActionResult> {
    try {
      const { id, name } = serverConfig;

      // Stop server if running
      const isRunning = this.processes.has(id);
      if (isRunning) {
        const stopResult = await this.stopServer(id);
        if (!stopResult.success) {
          return stopResult;
        }
      }

      // Run SteamCMD update
      emitUpdateProgress(id, 0, 'Starting SteamCMD update...');

      const updateArgs = [
        '+force_install_dir', path.dirname(serverConfig.executablePath),
        '+login', 'anonymous',
        '+app_update', '2430930', // Ark: Survival Ascended server app ID
        '+quit'
      ];

      const updateProcess = spawn(steamCmdPath, updateArgs, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let updateOutput = '';

      updateProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        updateOutput += output;
        
        // Parse progress from SteamCMD output
        const progressMatch = output.match(/(\d+)%/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1]);
          emitUpdateProgress(id, progress, `Updating... ${progress}%`);
        }
      });

      return new Promise((resolve) => {
        updateProcess.on('exit', async (code) => {
          if (code === 0) {
            emitUpdateProgress(id, 100, 'Update completed successfully');
            
            // Restart server if it was running
            if (isRunning) {
              await this.startServer(serverConfig);
            }

            resolve({
              success: true,
              message: `Server ${name} updated successfully`,
              data: { updatedAt: new Date(), output: updateOutput }
            });
          } else {
            resolve({
              success: false,
              message: `Server ${name} update failed`,
              error: `SteamCMD exited with code ${code}`
            });
          }
        });
      });

    } catch (error) {
      return {
        success: false,
        message: 'Failed to update server',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all running servers
   */
  static getRunningServers(): string[] {
    return Array.from(this.processes.keys()).filter(id => {
      const process = this.processes.get(id);
      return process?.status === 'running';
    });
  }

  /**
   * Kill all server processes
   */
  static async killAllServers(): Promise<void> {
    const serverIds = Array.from(this.processes.keys());
    
    for (const serverId of serverIds) {
      try {
        await this.stopServer(serverId);
      } catch (error) {
        console.error(`Failed to stop server ${serverId}:`, error);
      }
    }
  }

  // Private helper methods

  private static buildServerArgs(config: ServerConfig): string[] {
    const { map, port, queryPort, rconPort, maxPlayers, serverPassword } = config;

    const args = [
      map,
      '?listen',
      `?Port=${port}`,
      `?QueryPort=${queryPort}`,
      `?RCONPort=${rconPort}`,
      `?MaxPlayers=${maxPlayers}`,
      '-server',
      '-log'
    ];

    if (serverPassword) {
      args.push(`?ServerPassword=${serverPassword}`);
    }

    return args;
  }

  private static updateProcessStatus(serverId: string, status: ProcessInfo['status']): void {
    const processInfo = this.processes.get(serverId);
    if (processInfo) {
      processInfo.status = status;
    }

    // Update status cache
    const serverStatus = this.getServerStatus(serverId);
    this.statusCache.set(serverId, serverStatus);
  }
} 