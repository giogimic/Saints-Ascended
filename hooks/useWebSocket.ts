import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerStatus, ServerStats } from '@/types/server';

interface WebSocketData {
  serverStatuses: Record<string, ServerStatus>;
  serverStats: Record<string, ServerStats>;
  isConnected: boolean;
  error: string | null;
}

interface WebSocketActions {
  joinServerRoom: (serverId: string) => void;
  leaveServerRoom: (serverId: string) => void;
  requestServerStatus: (serverId: string) => void;
  requestServerStats: (serverId: string) => void;
}

export function useWebSocket(): WebSocketData & WebSocketActions {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [serverStats, setServerStats] = useState<Record<string, ServerStats>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect if we're in a browser environment and WebSocket is available
    if (typeof window === 'undefined') {
      return;
    }

    // Check if WebSocket server is available (optional for now)
    const enableWebSocket = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';
    
    if (!enableWebSocket) {
      console.log('WebSocket disabled - using mock data');
      return;
    }

    try {
      // Initialize socket connection
      const newSocket = io(process.env.NODE_ENV === 'production' 
        ? 'wss://yourdomain.com' 
        : 'ws://localhost:3000', {
        path: '/api/ws',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        timeout: 5000, // 5 second timeout
        reconnection: false // Disable auto-reconnection to prevent spam
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.log('WebSocket connection error (non-critical):', error.message);
        // Don't set error state for connection issues - just log them
        setIsConnected(false);
      });

      // Server status updates
      newSocket.on('server_status_update', (data: { serverId: string; status: ServerStatus }) => {
        setServerStatuses(prev => ({
          ...prev,
          [data.serverId]: data.status
        }));
      });

      // Server stats updates
      newSocket.on('server_stats_update', (data: { serverId: string; stats: ServerStats }) => {
        setServerStats(prev => ({
          ...prev,
          [data.serverId]: data.stats
        }));
      });

      // Log entries
      newSocket.on('log_entry', (data: { serverId: string; entry: any }) => {
        console.log(`Server ${data.serverId} log:`, data.entry);
      });

      // Backup progress
      newSocket.on('backup_progress', (data: { serverId: string; progress: number; message: string }) => {
        console.log(`Backup progress for ${data.serverId}: ${data.progress}% - ${data.message}`);
      });

      // Update progress
      newSocket.on('update_progress', (data: { serverId: string; progress: number; message: string }) => {
        console.log(`Update progress for ${data.serverId}: ${data.progress}% - ${data.message}`);
      });

      // Error handling
      newSocket.on('error', (data: { serverId?: string; message: string; error: any }) => {
        console.error('Server error:', data);
        setError(data.message);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.log('WebSocket initialization failed (non-critical):', error);
      // Don't throw errors - just log them
    }
  }, []);

  // Actions
  const joinServerRoom = useCallback((serverId: string) => {
    if (socket && isConnected) {
      socket.emit('join_server_room', serverId);
    }
  }, [socket, isConnected]);

  const leaveServerRoom = useCallback((serverId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_server_room', serverId);
    }
  }, [socket, isConnected]);

  const requestServerStatus = useCallback((serverId: string) => {
    if (socket && isConnected) {
      socket.emit('request_server_status', serverId);
    }
  }, [socket, isConnected]);

  const requestServerStats = useCallback((serverId: string) => {
    if (socket && isConnected) {
      socket.emit('request_server_stats', serverId);
    }
  }, [socket, isConnected]);

  return {
    serverStatuses,
    serverStats,
    isConnected,
    error,
    joinServerRoom,
    leaveServerRoom,
    requestServerStatus,
    requestServerStats
  };
} 