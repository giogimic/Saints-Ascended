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

// Mock data store - in production, use a proper database
const getModDataPath = (serverId: string) => join(process.cwd(), 'data', 'servers', serverId, 'mods.json');
const getModMetricsPath = (serverId: string) => join(process.cwd(), 'data', 'servers', serverId, 'mod-metrics.json');

const loadServerMods = (serverId: string): ModInfo[] => {
  const modPath = getModDataPath(serverId);
  if (!existsSync(modPath)) {
    return [];
  }
  
  try {
    const data = readFileSync(modPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load server mods:', error);
    return [];
  }
};

const saveServerMods = async (serverId: string, mods: ModInfo[]) => {
  const modsDir = join(process.cwd(), 'data', 'servers', serverId, 'mods');
  if (!existsSync(modsDir)) {
    mkdirSync(modsDir, { recursive: true });
  }

  const modsPath = join(process.cwd(), 'data', 'servers', serverId, 'mods', 'mods.json');
  if (!existsSync(join(process.cwd(), 'data', 'servers', serverId, 'mods'))) {
    mkdirSync(join(process.cwd(), 'data', 'servers', serverId, 'mods'), { recursive: true });
  }
  writeFileSync(modsPath, JSON.stringify(mods, null, 2));
  
  // Sync with launch options system
  try {
    const launchOptions = await loadLaunchOptions(serverId);
    const enabledModIds = mods
      .filter(mod => mod.enabled)
      .map(mod => mod.id);
    
    launchOptions.mods = enabledModIds;
    await saveLaunchOptions(serverId, launchOptions);
  } catch (error) {
    console.error('Failed to sync mods with launch options:', error);
  }
};

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

const saveModMetrics = (serverId: string, metrics: Record<string, ModPerformanceMetrics>) => {
  const metricsPath = getModMetricsPath(serverId);
  const dirPath = join(process.cwd(), 'data', 'servers', serverId);
  
  // Ensure directory exists
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
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
          description: req.body.description,
          version: req.body.version,
          workshopId: req.body.workshopId,
          enabled: req.body.enabled ?? true,
          loadOrder: req.body.loadOrder ?? 0,
          dependencies: req.body.dependencies || [],
          incompatibilities: req.body.incompatibilities || [],
          size: req.body.size,
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

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Mod management error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 