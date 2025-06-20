import { NextApiRequest, NextApiResponse } from 'next';
import { ModInfo } from '@/types/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { loadLaunchOptions, saveLaunchOptions } from '../../../../../lib/server-storage';

interface ModPerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkImpact: number;
  loadTime: number;
  crashCount: number;
  compatibility: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

// Data paths
const getServersPath = () => join(process.cwd(), 'data', 'servers.json');
const getModCachePath = (serverId: string) => join(process.cwd(), 'data', 'mod-cache', `${serverId}.json`);
const getModMetricsPath = (serverId: string) => join(process.cwd(), 'data', 'mod-metrics', `${serverId}.json`);

// Load servers data
const loadServers = () => {
  const serversPath = getServersPath();
  if (!existsSync(serversPath)) {
    return [];
  }
  
  try {
    const data = readFileSync(serversPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load servers:', error);
    return [];
  }
};

// Save servers data
const saveServers = (servers: any[]) => {
  const serversPath = getServersPath();
  writeFileSync(serversPath, JSON.stringify(servers, null, 2));
};

// Load server mods from both server data and cache
const loadServerMods = (serverId: string): ModInfo[] => {
  try {
    // First, try to load from mod cache (SQLite equivalent)
    const cachePath = getModCachePath(serverId);
    if (existsSync(cachePath)) {
      const cacheData = JSON.parse(readFileSync(cachePath, 'utf-8'));
      if (cacheData.mods && Array.isArray(cacheData.mods)) {
        return cacheData.mods;
      }
    }

    // Fallback: Load from server data structure
    const servers = loadServers();
    const server = servers.find((s: any) => s.id === serverId);
    
    if (server && server.launchOptions && server.launchOptions.mods) {
      // Convert mod IDs to full ModInfo objects if they're just strings
      const mods = server.launchOptions.mods.map((mod: any, index: number) => {
        if (typeof mod === 'string') {
          // Convert legacy mod ID to ModInfo object
          return {
            id: crypto.randomUUID(),
            name: `Mod ${mod}`,
            description: `Workshop mod ${mod}`,
            version: '1.0.0',
            workshopId: mod,
            enabled: true,
            loadOrder: index,
            dependencies: [],
            incompatibilities: [],
            size: 'Unknown',
            lastUpdated: new Date()
          };
        }
        return mod;
      });
      
      // Save to cache for future use
      saveServerModsCache(serverId, mods);
      return mods;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load server mods:', error);
    return [];
  }
};

// Save server mods to both cache and server data
const saveServerMods = async (serverId: string, mods: ModInfo[]) => {
  try {
    // Save to cache (SQLite equivalent)
    saveServerModsCache(serverId, mods);
    
    // Update server data structure
    const servers = loadServers();
    const serverIndex = servers.findIndex((s: any) => s.id === serverId);
    
    if (serverIndex !== -1) {
      // Ensure launchOptions exists
      if (!servers[serverIndex].launchOptions) {
        servers[serverIndex].launchOptions = {};
      }
      
      // Update mods in server data (store full ModInfo objects)
      servers[serverIndex].launchOptions.mods = mods;
      servers[serverIndex].updatedAt = new Date().toISOString();
      
      saveServers(servers);
    }
    
    // Sync with launch options system (for backwards compatibility)
    try {
      const launchOptions = await loadLaunchOptions(serverId);
      const enabledModIds = mods
        .filter(mod => mod.enabled)
        .map(mod => mod.workshopId || mod.id);
      
      launchOptions.mods = enabledModIds;
      await saveLaunchOptions(serverId, launchOptions);
    } catch (error) {
      console.error('Failed to sync mods with launch options:', error);
    }
  } catch (error) {
    console.error('Failed to save server mods:', error);
    throw error;
  }
};

// Save mods to cache file (SQLite equivalent)
const saveServerModsCache = (serverId: string, mods: ModInfo[]) => {
  const cachePath = getModCachePath(serverId);
  const cacheDir = join(process.cwd(), 'data', 'mod-cache');
  
  // Ensure cache directory exists
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  
  const cacheData = {
    serverId,
    lastUpdated: new Date().toISOString(),
    mods
  };
  
  writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
};

// Load mod performance metrics
const loadModMetrics = (serverId: string): Record<string, ModPerformanceMetrics> => {
  const metricsPath = getModMetricsPath(serverId);
  if (!existsSync(metricsPath)) {
    return {};
  }
  
  try {
    const data = readFileSync(metricsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load mod metrics:', error);
    return {};
  }
};

// Save mod performance metrics
const saveModMetrics = (serverId: string, metrics: Record<string, ModPerformanceMetrics>) => {
  const metricsPath = getModMetricsPath(serverId);
  const metricsDir = join(process.cwd(), 'data', 'mod-metrics');
  
  // Ensure directory exists
  if (!existsSync(metricsDir)) {
    mkdirSync(metricsDir, { recursive: true });
  }
  
  writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
};

// Generate mock performance metrics for a mod
const generateModMetrics = (modId: string): ModPerformanceMetrics => {
  // In a real implementation, these would come from actual server monitoring
  const mockMetrics: Record<string, Partial<ModPerformanceMetrics>> = {
    '928621': { // Awesome Spyglass
      cpuUsage: 1,
      memoryUsage: 15,
      networkImpact: 2,
      loadTime: 150,
      crashCount: 0,
      compatibility: 'excellent'
    },
    '893657': { // Awesome Teleporters
      cpuUsage: 8,
      memoryUsage: 45,
      networkImpact: 15,
      loadTime: 300,
      crashCount: 1,
      compatibility: 'good'
    },
    '935985': { // Dino Storage v2
      cpuUsage: 3,
      memoryUsage: 25,
      networkImpact: 8,
      loadTime: 200,
      crashCount: 0,
      compatibility: 'excellent'
    },
    '942136': { // Super Structures
      cpuUsage: 12,
      memoryUsage: 60,
      networkImpact: 20,
      loadTime: 500,
      crashCount: 2,
      compatibility: 'good'
    },
    '1090809': { // Primal Fear
      cpuUsage: 35,
      memoryUsage: 150,
      networkImpact: 40,
      loadTime: 1200,
      crashCount: 5,
      compatibility: 'fair'
    }
  };
  
  const knownMod = mockMetrics[modId];
  if (knownMod) {
    return {
      cpuUsage: knownMod.cpuUsage || 0,
      memoryUsage: knownMod.memoryUsage || 0,
      networkImpact: knownMod.networkImpact || 0,
      loadTime: knownMod.loadTime || 0,
      crashCount: knownMod.crashCount || 0,
      compatibility: knownMod.compatibility || 'unknown'
    };
  }
  
  // Generate semi-random metrics for unknown mods
  return {
    cpuUsage: Math.floor(Math.random() * 25),
    memoryUsage: Math.floor(Math.random() * 100),
    networkImpact: Math.floor(Math.random() * 30),
    loadTime: Math.floor(Math.random() * 800) + 100,
    crashCount: Math.floor(Math.random() * 3),
    compatibility: ['excellent', 'good', 'fair', 'poor', 'unknown'][Math.floor(Math.random() * 5)] as any
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: serverId } = req.query;
  
  if (typeof serverId !== 'string') {
    return res.status(400).json({ error: 'Invalid server ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all mods for the server
        const mods = loadServerMods(serverId);
        res.status(200).json(mods);
        break;

      case 'POST':
        // Add a new mod to the server
        const newMod: ModInfo = {
          id: req.body.id || crypto.randomUUID(),
          name: req.body.name,
          description: req.body.description || '',
          version: req.body.version || '1.0.0',
          workshopId: req.body.workshopId,
          enabled: req.body.enabled ?? true,
          loadOrder: req.body.loadOrder ?? 0,
          dependencies: req.body.dependencies || [],
          incompatibilities: req.body.incompatibilities || [],
          size: req.body.size || 'Unknown',
          lastUpdated: req.body.lastUpdated ? new Date(req.body.lastUpdated) : new Date()
        };

        const currentMods = loadServerMods(serverId);
        const updatedMods = [...currentMods, newMod];
        await saveServerMods(serverId, updatedMods);

        // Generate performance metrics for the new mod
        if (newMod.workshopId) {
          const currentMetrics = loadModMetrics(serverId);
          currentMetrics[newMod.id] = generateModMetrics(newMod.workshopId);
          saveModMetrics(serverId, currentMetrics);
        }

        res.status(201).json(newMod);
        break;

      case 'PUT':
        // Update all mods for the server
        const modsToUpdate: ModInfo[] = req.body;
        await saveServerMods(serverId, modsToUpdate);
        res.status(200).json(modsToUpdate);
        break;

      case 'DELETE':
        // Delete a specific mod
        const { modId } = req.body;
        if (!modId) {
          return res.status(400).json({ error: 'Mod ID required' });
        }
        
        const allMods = loadServerMods(serverId);
        const filteredMods = allMods.filter(mod => mod.id !== modId);
        await saveServerMods(serverId, filteredMods);
        
        res.status(200).json({ success: true });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Mod management error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 