import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface ServerStatus {
  pid?: number;
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'error';
  uptime?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  lastChecked: Date;
  error?: string;
}

interface MonitorConfig {
  checkInterval: number; // ms
  logFile?: string;
  maxLogSize?: number; // bytes
}

export class SimpleMonitor {
  private config: MonitorConfig;
  private serverProcess: ChildProcess | null = null;
  private monitorInterval: NodeJS.Timeout | null = null;
  private startTime: Date | null = null;
  private status: ServerStatus = {
    status: 'offline',
    lastChecked: new Date()
  };

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      logFile: 'server-monitor.log',
      maxLogSize: 1024 * 1024, // 1MB
      ...config
    };
  }

  /**
   * Start monitoring a server process
   */
  startMonitoring(serverProcess: ChildProcess): void {
    this.serverProcess = serverProcess;
    this.startTime = new Date();
    
    // Monitor process events
    serverProcess.on('spawn', () => {
      this.updateStatus('starting');
      this.log('Server process spawned');
    });

    serverProcess.on('error', (error) => {
      this.updateStatus('error', error.message);
      this.log(`Server process error: ${error.message}`);
    });

    serverProcess.on('exit', (code, signal) => {
      this.updateStatus('offline');
      this.log(`Server process exited with code ${code}, signal ${signal}`);
      this.serverProcess = null;
      this.startTime = null;
    });

    // Set up periodic health checks
    this.monitorInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    this.log('Monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.log('Monitoring stopped');
  }

  /**
   * Get current server status
   */
  getStatus(): ServerStatus {
    return { ...this.status };
  }

  /**
   * Perform a simple health check
   */
  private performHealthCheck(): void {
    if (!this.serverProcess) {
      this.updateStatus('offline');
      return;
    }

    // Check if process is still running
    try {
      // Sending signal 0 doesn't actually kill the process, just checks if it exists
      process.kill(this.serverProcess.pid!, 0);
      
      // If we get here, process is running
      this.updateStatus('online');
      
      // Update memory usage if available
      if (process.memoryUsage) {
        this.status.memoryUsage = process.memoryUsage();
      }
      
    } catch (error) {
      // Process doesn't exist
      this.updateStatus('offline');
      this.serverProcess = null;
      this.startTime = null;
    }
  }

  /**
   * Update server status
   */
  private updateStatus(status: ServerStatus['status'], error?: string): void {
    this.status = {
      ...this.status,
      status,
      lastChecked: new Date(),
      error: error || undefined
    };

    if (this.serverProcess?.pid) {
      this.status.pid = this.serverProcess.pid;
    }

    if (this.startTime && status === 'online') {
      this.status.uptime = Date.now() - this.startTime.getTime();
    }
  }

  /**
   * Simple logging utility
   */
  private async log(message: string): Promise<void> {
    if (!this.config.logFile) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    try {
      const logPath = path.join(process.cwd(), 'logs', this.config.logFile);
      
      // Ensure logs directory exists
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      
      // Check file size and rotate if needed
      try {
        const stats = await fs.stat(logPath);
        if (stats.size > this.config.maxLogSize!) {
          await this.rotateLog(logPath);
        }
      } catch (error) {
        // File doesn't exist, which is fine
      }
      
      // Append log entry
      await fs.appendFile(logPath, logEntry);
      
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Rotate log file when it gets too large
   */
  private async rotateLog(logPath: string): Promise<void> {
    try {
      const backupPath = logPath.replace('.log', `.${Date.now()}.log`);
      await fs.rename(logPath, backupPath);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }
}

/**
 * Create a simple monitor instance
 */
export function createSimpleMonitor(config?: Partial<MonitorConfig>): SimpleMonitor {
  return new SimpleMonitor(config);
}

/**
 * Quick health check utility function
 */
export async function quickHealthCheck(port: number = 3000): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
} 