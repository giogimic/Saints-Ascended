import { NextApiRequest, NextApiResponse } from 'next';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ModPerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkImpact: number;
  loadTime: number;
  crashCount: number;
  compatibility: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  lastUpdated: Date;
  uptime: number;
  errorRate: number;
}

interface DetailedModMetrics {
  [modId: string]: {
    performance: ModPerformanceMetrics;
    history: {
      timestamp: Date;
      cpuUsage: number;
      memoryUsage: number;
      networkImpact: number;
    }[];
    errors: {
      timestamp: Date;
      error: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }[];
  };
}

const getModMetricsPath = (serverId: string) => join(process.cwd(), 'data', 'servers', serverId, 'mod-metrics.json');
const getDetailedMetricsPath = (serverId: string) => join(process.cwd(), 'data', 'servers', serverId, 'detailed-metrics.json');
const getModPerformancePath = (serverId: string) => join(process.cwd(), 'data', 'servers', serverId, 'performance.json');

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

const loadDetailedMetrics = (serverId: string): DetailedModMetrics => {
  const metricsPath = getDetailedMetricsPath(serverId);
  if (!existsSync(metricsPath)) {
    return {};
  }
  
  try {
    const data = readFileSync(metricsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load detailed metrics:', error);
    return {};
  }
};

const saveDetailedMetrics = (serverId: string, metrics: DetailedModMetrics) => {
  const metricsPath = getDetailedMetricsPath(serverId);
  const dirPath = join(process.cwd(), 'data', 'servers', serverId);
  
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  
  writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
};

// Generate realistic performance data based on mod characteristics
const generateRealtimeMetrics = (modId: string, baseMetrics: ModPerformanceMetrics) => {
  const variation = 0.2; // 20% variation from base metrics
  
  return {
    cpuUsage: Math.max(0, baseMetrics.cpuUsage + (Math.random() - 0.5) * 2 * variation * baseMetrics.cpuUsage),
    memoryUsage: Math.max(0, baseMetrics.memoryUsage + (Math.random() - 0.5) * 2 * variation * baseMetrics.memoryUsage),
    networkImpact: Math.max(0, baseMetrics.networkImpact + (Math.random() - 0.5) * 2 * variation * baseMetrics.networkImpact),
    timestamp: new Date()
  };
};

// Simulate mod-specific performance profiles
const getModPerformanceProfile = (workshopId: string): Partial<ModPerformanceMetrics> => {
  const profiles: Record<string, Partial<ModPerformanceMetrics>> = {
    '928621': { // Awesome Spyglass
      cpuUsage: 2,
      memoryUsage: 15,
      networkImpact: 3,
      loadTime: 180,
      crashCount: 0,
      compatibility: 'excellent',
      uptime: 99.8,
      errorRate: 0.01
    },
    '893657': { // Awesome Teleporters
      cpuUsage: 12,
      memoryUsage: 45,
      networkImpact: 25,
      loadTime: 320,
      crashCount: 1,
      compatibility: 'good',
      uptime: 98.5,
      errorRate: 0.05
    },
    '935985': { // Dino Storage v2
      cpuUsage: 5,
      memoryUsage: 30,
      networkImpact: 10,
      loadTime: 220,
      crashCount: 0,
      compatibility: 'excellent',
      uptime: 99.9,
      errorRate: 0.002
    },
    '942136': { // Super Structures
      cpuUsage: 15,
      memoryUsage: 65,
      networkImpact: 18,
      loadTime: 450,
      crashCount: 2,
      compatibility: 'good',
      uptime: 97.8,
      errorRate: 0.08
    },
    '1090809': { // Primal Fear
      cpuUsage: 40,
      memoryUsage: 180,
      networkImpact: 35,
      loadTime: 1100,
      crashCount: 8,
      compatibility: 'fair',
      uptime: 94.2,
      errorRate: 0.15
    },
    '1565015': { // Additional Creatures
      cpuUsage: 25,
      memoryUsage: 120,
      networkImpact: 20,
      loadTime: 600,
      crashCount: 3,
      compatibility: 'good',
      uptime: 96.5,
      errorRate: 0.09
    },
    '1404697': { // Structures Plus
      cpuUsage: 18,
      memoryUsage: 85,
      networkImpact: 22,
      loadTime: 380,
      crashCount: 4,
      compatibility: 'good',
      uptime: 95.8,
      errorRate: 0.12
    }
  };
  
  return profiles[workshopId] || {
    cpuUsage: Math.floor(Math.random() * 30) + 5,
    memoryUsage: Math.floor(Math.random() * 100) + 20,
    networkImpact: Math.floor(Math.random() * 25) + 5,
    loadTime: Math.floor(Math.random() * 800) + 200,
    crashCount: Math.floor(Math.random() * 5),
    compatibility: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
    uptime: 95 + Math.random() * 5,
    errorRate: Math.random() * 0.1
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: serverId } = req.query;
  
  if (typeof serverId !== 'string') {
    return res.status(400).json({ error: 'Invalid server ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get performance metrics for all mods
        const baseMetrics = loadModMetrics(serverId);
        const detailedMetrics = loadDetailedMetrics(serverId);
        
        // Enhance with detailed performance data
        const enhancedMetrics: Record<string, ModPerformanceMetrics> = {};
        
        Object.entries(baseMetrics).forEach(([modId, metrics]) => {
          enhancedMetrics[modId] = {
            ...metrics,
            lastUpdated: new Date(),
            uptime: detailedMetrics[modId]?.performance?.uptime || 99.0,
            errorRate: detailedMetrics[modId]?.performance?.errorRate || 0.01
          };
        });
        
        res.status(200).json(enhancedMetrics);
        break;

      case 'POST':
        // Update performance metrics for a specific mod
        const { modId, workshopId, metrics: newMetrics } = req.body;
        
        if (!modId) {
          return res.status(400).json({ error: 'Mod ID is required' });
        }
        
        const currentMetrics = loadModMetrics(serverId);
        const currentDetailed = loadDetailedMetrics(serverId);
        
        // Generate performance profile if workshopId is provided
        let performanceData = newMetrics;
        if (workshopId && !newMetrics) {
          performanceData = getModPerformanceProfile(workshopId);
        }
        
        // Update base metrics
        currentMetrics[modId] = {
          ...currentMetrics[modId],
          ...performanceData,
          lastUpdated: new Date()
        };
        
        // Update detailed metrics with historical data
        if (!currentDetailed[modId]) {
          currentDetailed[modId] = {
            performance: currentMetrics[modId],
            history: [],
            errors: []
          };
        }
        
        // Add historical data point
        const realtimeData = generateRealtimeMetrics(modId, currentMetrics[modId]);
        currentDetailed[modId].history.push(realtimeData);
        
        // Keep only last 100 history points
        if (currentDetailed[modId].history.length > 100) {
          currentDetailed[modId].history = currentDetailed[modId].history.slice(-100);
        }
        
        // Update performance data
        currentDetailed[modId].performance = currentMetrics[modId];
        
        // Save updated metrics
        const dirPath = join(process.cwd(), 'data', 'servers', serverId);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
        
        const performancePath = getModPerformancePath(serverId);
        writeFileSync(performancePath, JSON.stringify(performanceData, null, 2));
        
        saveDetailedMetrics(serverId, currentDetailed);
        
        res.status(200).json(currentMetrics[modId]);
        break;

      case 'DELETE':
        // Clear all performance metrics
        const emptyMetrics = {};
        const emptyDetailed = {};
        
        const dirPath2 = join(process.cwd(), 'data', 'servers', serverId);
        if (!existsSync(dirPath2)) {
          mkdirSync(dirPath2, { recursive: true });
        }
        
        writeFileSync(getModMetricsPath(serverId), JSON.stringify(emptyMetrics, null, 2));
        saveDetailedMetrics(serverId, emptyDetailed);
        
        res.status(200).json({ message: 'Performance metrics cleared' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 