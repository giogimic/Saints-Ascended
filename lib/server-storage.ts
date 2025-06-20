import fs from 'fs/promises';
import path from 'path';
import { ServerConfig, LaunchOptionsConfig } from '@/types/server';

const SERVERS_FILE = path.join(process.cwd(), 'data', 'servers.json');
const DATA_DIR = path.join(process.cwd(), 'data');
const LAUNCH_OPTIONS_DIR = path.join(process.cwd(), 'data', 'launch-options');

// Default launch options configuration
const DEFAULT_LAUNCH_OPTIONS: LaunchOptionsConfig = {
  USEALLAVAILABLECORES: false,
  lowmemory: false,
  nomanssky: false,
  NoCrashDialog: false,
  NoHangDetection: false,
  preventhibernation: false,
  disablemodchecks: false,
  automanagedmods: false,
  ForceRespawnDinos: false,
  crossplay: false,
  StasisKeepControllers: false,
  UseDynamicConfig: false,
  NoBattlEye: false,
  UseBattlEye: false,
  clusterID: '',
  clusterDirOverride: '',
  clusterEnabled: false,
  mods: []
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Ensure launch options directory exists
async function ensureLaunchOptionsDir() {
  try {
    await fs.access(LAUNCH_OPTIONS_DIR);
  } catch {
    await fs.mkdir(LAUNCH_OPTIONS_DIR, { recursive: true });
  }
}

// Get launch options file path for a server
function getLaunchOptionsFilePath(serverId: string): string {
  return path.join(LAUNCH_OPTIONS_DIR, `${serverId}.json`);
}

// Load launch options for a server
export async function loadLaunchOptions(serverId: string): Promise<LaunchOptionsConfig> {
  try {
    await ensureLaunchOptionsDir();
    const filePath = getLaunchOptionsFilePath(serverId);
    const data = await fs.readFile(filePath, 'utf-8');
    const launchOptions = JSON.parse(data);
    
    // Merge with defaults to ensure all options are present
    return { ...DEFAULT_LAUNCH_OPTIONS, ...launchOptions };
  } catch (error) {
    // If file doesn't exist or is invalid, return defaults
    console.log(`No launch options found for server ${serverId}, using defaults`);
    return { ...DEFAULT_LAUNCH_OPTIONS };
  }
}

// Save launch options for a server
export async function saveLaunchOptions(serverId: string, launchOptions: LaunchOptionsConfig): Promise<void> {
  try {
    await ensureLaunchOptionsDir();
    const filePath = getLaunchOptionsFilePath(serverId);
    await fs.writeFile(
      filePath,
      JSON.stringify(launchOptions, null, 2),
      'utf-8'
    );
    console.log(`Saved launch options for server ${serverId}`);
  } catch (error) {
    console.error('Failed to save launch options:', error);
    throw new Error('Failed to persist launch options');
  }
}

// Update specific launch option for a server
export async function updateLaunchOption(serverId: string, optionKey: keyof LaunchOptionsConfig, value: any): Promise<LaunchOptionsConfig> {
  const currentOptions = await loadLaunchOptions(serverId);
  const updatedOptions = {
    ...currentOptions,
    [optionKey]: value
  };
  await saveLaunchOptions(serverId, updatedOptions);
  return updatedOptions;
}

// Generate launch command arguments from launch options
export function generateLaunchArgs(launchOptions: LaunchOptionsConfig): string[] {
  const args: string[] = [];
  
  // Add enabled launch options as flags
  Object.entries(launchOptions).forEach(([key, value]) => {
    if (key === 'mods') {
      // Handle mods separately - only add if there are enabled mods
      if (Array.isArray(value) && value.length > 0) {
        const enabledModIds = value.filter(id => id && id.toString().trim() !== '');
        if (enabledModIds.length > 0) {
          args.push(`-mods=${enabledModIds.join(',')}`);
        }
      }
    } else if (key === 'clusterID' && launchOptions.clusterEnabled && value) {
      // Handle cluster ID when cluster is enabled
      args.push(`-clusterID=${value}`);
    } else if (key === 'clusterDirOverride' && launchOptions.clusterEnabled && value) {
      // Handle cluster directory override when cluster is enabled
      args.push(`-ClusterDirOverride="${value}"`);
    } else if (value === true) {
      // Add flag for enabled boolean options
      args.push(`-${key}`);
    }
  });
  
  return args;
}

/**
 * Merge launch options from multiple sources
 * Priority: modLaunchOptionsString > booleanLaunchOptions.mods
 */
export function mergeLaunchOptions(
  booleanLaunchOptions: LaunchOptionsConfig,
  modLaunchOptionsString: string
): string[] {
  const booleanArgs = generateLaunchArgs(booleanLaunchOptions);
  
  // If we have a mod launch options string, parse it and use those mods
  if (modLaunchOptionsString && modLaunchOptionsString.trim()) {
    const modArgs = parseModLaunchOptionsString(modLaunchOptionsString);
    
    // Remove any -mods= from boolean args if we have mod args
    const filteredBooleanArgs = booleanArgs.filter(arg => !arg.startsWith('-mods='));
    
    return [...filteredBooleanArgs, ...modArgs];
  }
  
  // Otherwise use the boolean launch options as-is
  return booleanArgs;
}

/**
 * Parse mod launch options string into individual arguments
 * Handles formats like:
 * - "-mods=123,456,789"
 * - "-mods=123,456,789 -other-param"
 * - "-mods=123,456,789 -USEALLAVAILABLECORES"
 */
function parseModLaunchOptionsString(launchOptionsString: string): string[] {
  if (!launchOptionsString || !launchOptionsString.trim()) {
    return [];
  }

  const args: string[] = [];
  const trimmedString = launchOptionsString.trim();

  // Split by spaces to get individual arguments
  const parts = trimmedString.split(/\s+/);

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart) {
      args.push(trimmedPart);
    }
  }

  return args;
}

// Delete launch options file for a server
export async function deleteLaunchOptions(serverId: string): Promise<void> {
  try {
    const filePath = getLaunchOptionsFilePath(serverId);
    await fs.unlink(filePath);
    console.log(`Deleted launch options for server ${serverId}`);
  } catch (error) {
    // Ignore if file doesn't exist
    console.log(`Launch options file not found for server ${serverId}`);
  }
}

// Load servers from file
export async function loadServers(): Promise<ServerConfig[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SERVERS_FILE, 'utf-8');
    const servers = JSON.parse(data);
    
    // Convert date strings back to Date objects and load launch options
    const serversWithLaunchOptions = await Promise.all(
      servers.map(async (server: any) => {
        const launchOptions = await loadLaunchOptions(server.id);
        return {
          ...server,
          createdAt: new Date(server.createdAt),
          updatedAt: new Date(server.updatedAt),
          launchOptions
        };
      })
    );
    
    return serversWithLaunchOptions;
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    console.log('No existing servers file found, starting fresh');
    return [];
  }
}

// Save servers to file
export async function saveServers(servers: ServerConfig[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(
      SERVERS_FILE,
      JSON.stringify(servers, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Failed to save servers:', error);
    throw new Error('Failed to persist server data');
  }
}

// Get all servers
export async function getServers(): Promise<ServerConfig[]> {
  return await loadServers();
}

// Add a new server
export async function addServer(server: ServerConfig): Promise<void> {
  const servers = await loadServers();
  servers.push(server);
  await saveServers(servers);
}

// Update a server
export async function updateServer(id: string, updates: Partial<ServerConfig>): Promise<ServerConfig | null> {
  const servers = await loadServers();
  const index = servers.findIndex(s => s.id === id);
  
  if (index === -1) {
    return null;
  }
  
  servers[index] = {
    ...servers[index],
    ...updates,
    updatedAt: new Date()
  };
  
  await saveServers(servers);
  return servers[index];
}

// Remove a server
export async function removeServer(id: string): Promise<ServerConfig | null> {
  const servers = await loadServers();
  const index = servers.findIndex(s => s.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const [removed] = servers.splice(index, 1);
  await saveServers(servers);
  
  // Clean up launch options file
  await deleteLaunchOptions(id);
  
  return removed;
}

// Find server by ID
export async function findServerById(id: string): Promise<ServerConfig | null> {
  const servers = await loadServers();
  return servers.find(s => s.id === id) || null;
}

// Check for duplicate server names
export async function serverNameExists(name: string, excludeId?: string): Promise<boolean> {
  const servers = await loadServers();
  return servers.some(s => s.name === name && s.id !== excludeId);
}

// Check for port conflicts
export async function hasPortConflict(
  port: number,
  queryPort: number,
  rconPort: number,
  excludeId?: string
): Promise<boolean> {
  const servers = await loadServers();
  const ports = [port, queryPort, rconPort];
  
  return servers.some(server => {
    if (server.id === excludeId) return false;
    
    const serverPorts = [server.port, server.queryPort, server.rconPort];
    return ports.some(p => serverPorts.includes(p));
  });
} 