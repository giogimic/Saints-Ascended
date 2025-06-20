import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

interface ClusterConfig {
  id: string;
  name: string;
  description: string;
  clusterId: string;
  clusterDirectory: string;
  servers: ClusterServer[];
  transferSettings: TransferSettings;
  syncSettings: SyncSettings;
  created: Date;
  updated: Date;
}

interface ClusterServer {
  id: string;
  name: string;
  map: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  port: number;
  maxPlayers: number;
  currentPlayers: number;
  role: 'primary' | 'secondary' | 'hub';
  config: any;
  lastSync: Date;
  transferStats: {
    charactersIn: number;
    charactersOut: number;
    itemsIn: number;
    itemsOut: number;
    dinosIn: number;
    dinosOut: number;
  };
}

interface TransferSettings {
  allowCharacterTransfers: boolean;
  allowItemTransfers: boolean;
  allowDinoTransfers: boolean;
  transferCooldown: number;
  maxTransferItems: number;
  maxTransferDinos: number;
  restrictedMaps: string[];
  transferTax: number;
}

interface SyncSettings {
  autoSync: boolean;
  syncInterval: number;
  syncOnStart: boolean;
  syncOnStop: boolean;
  backupBeforeSync: boolean;
  syncTribeLogs: boolean;
  syncPlayerData: boolean;
}

const getClustersPath = () => join(process.cwd(), 'data', 'clusters.json');

const loadClusters = (): ClusterConfig[] => {
  const clustersPath = getClustersPath();
  if (!existsSync(clustersPath)) {
    return [];
  }
  
  try {
    const data = readFileSync(clustersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load clusters:', error);
    return [];
  }
};

const saveClusters = (clusters: ClusterConfig[]) => {
  const clustersPath = getClustersPath();
  const dirPath = join(process.cwd(), 'data');
  
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  
  writeFileSync(clustersPath, JSON.stringify(clusters, null, 2));
};

// Generate mock cluster data for demonstration
const generateMockClusterData = (): ClusterConfig[] => [
  {
    id: 'cluster-1',
    name: 'Saints Gaming Cluster',
    description: 'Multi-map PvE cluster with cross-server transfers',
    clusterId: 'SaintsGG',
    clusterDirectory: '/servers/cluster-saves',
    created: new Date('2024-01-15'),
    updated: new Date(),
    transferSettings: {
      allowCharacterTransfers: true,
      allowItemTransfers: true,
      allowDinoTransfers: true,
      transferCooldown: 300,
      maxTransferItems: 50,
      maxTransferDinos: 20,
      restrictedMaps: [],
      transferTax: 0
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 300,
      syncOnStart: true,
      syncOnStop: true,
      backupBeforeSync: true,
      syncTribeLogs: true,
      syncPlayerData: true
    },
    servers: [
      {
        id: 'server-1',
        name: 'The Island - Main',
        map: 'TheIsland',
        status: 'running',
        port: 7777,
        maxPlayers: 70,
        currentPlayers: 45,
        role: 'primary',
        config: {},
        lastSync: new Date(),
        transferStats: {
          charactersIn: 125,
          charactersOut: 98,
          itemsIn: 2340,
          itemsOut: 1890,
          dinosIn: 567,
          dinosOut: 432
        }
      },
      {
        id: 'server-2',
        name: 'Ragnarok - PvE',
        map: 'Ragnarok',
        status: 'running',
        port: 7779,
        maxPlayers: 70,
        currentPlayers: 32,
        role: 'secondary',
        config: {},
        lastSync: new Date(),
        transferStats: {
          charactersIn: 78,
          charactersOut: 85,
          itemsIn: 1567,
          itemsOut: 1789,
          dinosIn: 234,
          dinosOut: 289
        }
      },
      {
        id: 'server-3',
        name: 'Genesis Part 2',
        map: 'Gen2',
        status: 'stopped',
        port: 7781,
        maxPlayers: 50,
        currentPlayers: 0,
        role: 'secondary',
        config: {},
        lastSync: new Date(Date.now() - 3600000), // 1 hour ago
        transferStats: {
          charactersIn: 23,
          charactersOut: 19,
          itemsIn: 456,
          itemsOut: 398,
          dinosIn: 67,
          dinosOut: 54
        }
      }
    ]
  },
  {
    id: 'cluster-2',
    name: 'PvP Arena Cluster',
    description: 'Competitive PvP cluster with raid weekends',
    clusterId: 'PvPArena',
    clusterDirectory: '/servers/pvp-cluster',
    created: new Date('2024-02-01'),
    updated: new Date(),
    transferSettings: {
      allowCharacterTransfers: true,
      allowItemTransfers: false,
      allowDinoTransfers: true,
      transferCooldown: 900,
      maxTransferItems: 0,
      maxTransferDinos: 10,
      restrictedMaps: ['Genesis'],
      transferTax: 0.1
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 600,
      syncOnStart: true,
      syncOnStop: true,
      backupBeforeSync: true,
      syncTribeLogs: true,
      syncPlayerData: true
    },
    servers: [
      {
        id: 'server-4',
        name: 'Scorched Earth PvP',
        map: 'ScorchedEarth_P',
        status: 'running',
        port: 7783,
        maxPlayers: 100,
        currentPlayers: 87,
        role: 'hub',
        config: {},
        lastSync: new Date(),
        transferStats: {
          charactersIn: 234,
          charactersOut: 198,
          itemsIn: 0,
          itemsOut: 0,
          dinosIn: 345,
          dinosOut: 298
        }
      },
      {
        id: 'server-5',
        name: 'Aberration PvP',
        map: 'Aberration_P',
        status: 'running',
        port: 7785,
        maxPlayers: 80,
        currentPlayers: 65,
        role: 'secondary',
        config: {},
        lastSync: new Date(),
        transferStats: {
          charactersIn: 156,
          charactersOut: 143,
          itemsIn: 0,
          itemsOut: 0,
          dinosIn: 189,
          dinosOut: 167
        }
      }
    ]
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all clusters
        let clusters = loadClusters();
        
        // If no clusters exist, generate mock data for demonstration
        if (clusters.length === 0) {
          clusters = generateMockClusterData();
          saveClusters(clusters);
        }
        
        res.status(200).json(clusters);
        break;

      case 'POST':
        // Create a new cluster
        const newCluster: ClusterConfig = {
          id: crypto.randomUUID(),
          name: req.body.name,
          description: req.body.description || '',
          clusterId: req.body.clusterId,
          clusterDirectory: req.body.clusterDirectory || '',
          servers: [],
          transferSettings: req.body.transferSettings || {
            allowCharacterTransfers: true,
            allowItemTransfers: true,
            allowDinoTransfers: true,
            transferCooldown: 300,
            maxTransferItems: 50,
            maxTransferDinos: 20,
            restrictedMaps: [],
            transferTax: 0
          },
          syncSettings: req.body.syncSettings || {
            autoSync: true,
            syncInterval: 300,
            syncOnStart: true,
            syncOnStop: true,
            backupBeforeSync: true,
            syncTribeLogs: true,
            syncPlayerData: true
          },
          created: new Date(),
          updated: new Date()
        };

        const currentClusters = loadClusters();
        const updatedClusters = [...currentClusters, newCluster];
        saveClusters(updatedClusters);

        res.status(201).json(newCluster);
        break;

      case 'PUT':
        // Update all clusters (bulk update)
        const clustersToUpdate: ClusterConfig[] = req.body;
        saveClusters(clustersToUpdate);
        res.status(200).json(clustersToUpdate);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Cluster management error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 