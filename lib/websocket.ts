import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiResponse } from 'next';
import type { WebSocketMessage, ServerStatus, ServerStats } from '@/types/server';

export interface ServerToClientEvents {
  server_status_update: (data: { serverId: string; status: ServerStatus }) => void;
  server_stats_update: (data: { serverId: string; stats: ServerStats }) => void;
  log_entry: (data: { serverId: string; entry: any }) => void;
  backup_progress: (data: { serverId: string; progress: number; message: string }) => void;
  update_progress: (data: { serverId: string; progress: number; message: string }) => void;
  error: (data: { serverId?: string; message: string; error: any }) => void;
}

export interface ClientToServerEvents {
  join_server_room: (serverId: string) => void;
  leave_server_room: (serverId: string) => void;
  request_server_status: (serverId: string) => void;
  request_server_stats: (serverId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  subscribedServers: string[];
}

export type IOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: IOServer | null = null;

export function initializeWebSocket(server: HTTPServer): IOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    path: '/api/ws',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Initialize socket data
    socket.data.subscribedServers = [];

    // Handle joining server rooms
    socket.on('join_server_room', (serverId: string) => {
      socket.join(`server:${serverId}`);
      socket.data.subscribedServers.push(serverId);
      console.log(`Client ${socket.id} joined room for server ${serverId}`);
      
      // Send current status when joining
      emitServerStatus(serverId).catch(console.error);
    });

    // Handle leaving server rooms
    socket.on('leave_server_room', (serverId: string) => {
      socket.leave(`server:${serverId}`);
      socket.data.subscribedServers = socket.data.subscribedServers.filter(
        id => id !== serverId
      );
      console.log(`Client ${socket.id} left room for server ${serverId}`);
    });

    // Handle status requests
    socket.on('request_server_status', (serverId: string) => {
      emitServerStatus(serverId).catch(console.error);
    });

    // Handle stats requests
    socket.on('request_server_stats', (serverId: string) => {
      emitServerStats(serverId).catch(console.error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      // Cleanup is automatic when socket disconnects
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Start periodic status updates
  startPeriodicUpdates();

  console.log('WebSocket server initialized');
  return io;
}

export function getWebSocketServer(): IOServer | null {
  return io;
}

// Emit server status update to all clients in the server room
export async function emitServerStatus(serverId: string): Promise<void> {
  if (!io) return;

  try {
    // In a real implementation, this would query actual server status
    const status = await getServerStatus(serverId);
    
    io.to(`server:${serverId}`).emit('server_status_update', {
      serverId,
      status
    });
  } catch (error) {
    console.error(`Failed to emit status for server ${serverId}:`, error);
    io.to(`server:${serverId}`).emit('error', {
      serverId,
      message: 'Failed to get server status',
      error
    });
  }
}

// Emit server stats update to all clients in the server room
export async function emitServerStats(serverId: string): Promise<void> {
  if (!io) return;

  try {
    const stats = await getServerStats(serverId);
    
    io.to(`server:${serverId}`).emit('server_stats_update', {
      serverId,
      stats
    });
  } catch (error) {
    console.error(`Failed to emit stats for server ${serverId}:`, error);
  }
}

// Emit log entry to all clients in the server room
export function emitLogEntry(serverId: string, entry: any): void {
  if (!io) return;

  io.to(`server:${serverId}`).emit('log_entry', {
    serverId,
    entry
  });
}

// Emit backup progress update
export function emitBackupProgress(
  serverId: string, 
  progress: number, 
  message: string
): void {
  if (!io) return;

  io.to(`server:${serverId}`).emit('backup_progress', {
    serverId,
    progress,
    message
  });
}

// Emit update progress
export function emitUpdateProgress(
  serverId: string, 
  progress: number, 
  message: string
): void {
  if (!io) return;

  io.to(`server:${serverId}`).emit('update_progress', {
    serverId,
    progress,
    message
  });
}

// Start periodic status updates for all active servers
function startPeriodicUpdates(): void {
  const UPDATE_INTERVAL = 5000; // 5 seconds

  setInterval(async () => {
    if (!io) return;

    try {
      // Get all active server rooms
      const rooms = io.sockets.adapter.rooms;
      const serverRooms = Array.from(rooms.keys())
        .filter(room => room.startsWith('server:'))
        .map(room => room.replace('server:', ''));

      // Update status for each active server
      for (const serverId of serverRooms) {
        await emitServerStatus(serverId);
        await emitServerStats(serverId);
      }
    } catch (error) {
      console.error('Error in periodic updates:', error);
    }
  }, UPDATE_INTERVAL);
}

// Mock functions - in production these would interface with actual server processes
async function getServerStatus(serverId: string): Promise<ServerStatus> {
  // Simulate varying server states
  const statuses: ServerStatus['status'][] = ['online', 'offline', 'starting', 'error'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: serverId,
    status: randomStatus,
    players: {
      current: randomStatus === 'online' ? Math.floor(Math.random() * 50) : 0,
      max: 70
    },
    uptime: randomStatus === 'online' ? Math.floor(Math.random() * 86400) : undefined,
    version: '1.0.0',
    lastSeen: new Date(),
    errorMessage: randomStatus === 'error' ? 'Failed to start server process' : undefined
  };
}

async function getServerStats(serverId: string): Promise<ServerStats> {
  return {
    id: serverId,
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 8192, // MB
    networkIn: Math.random() * 1000, // KB/s
    networkOut: Math.random() * 1000, // KB/s
    diskUsage: Math.random() * 100, // GB
    timestamp: new Date()
  };
}

// Enhanced API response type for WebSocket integration
export interface SocketAPIResponse {
  socket: {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
}

// Utility to check if WebSocket is available in API route
export function hasWebSocket(res: any): res is NextApiResponse & SocketAPIResponse {
  return res && 'socket' in res && 'server' in res.socket;
}

// Initialize WebSocket in API route
export function ensureWebSocket(res: any): IOServer {
  if (!hasWebSocket(res)) {
    throw new Error('WebSocket not available in this API route');
  }

  if (!res.socket.server.io) {
    res.socket.server.io = initializeWebSocket(res.socket.server);
  }

  return res.socket.server.io;
} 