import React, { useState } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  PencilIcon, 
  TrashIcon, 
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import type { ServerConfig, ServerStatus } from '@/types/server';

// shadcn/ui imports
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ServerCardProps {
  server: ServerConfig;
  status: ServerStatus;
  onServerAction: (serverId: string, action: string) => Promise<void>;
  onEditServer: (serverId: string) => void;
  onDeleteServer: (serverId: string) => void;
  isLoading?: boolean;
}

export function ServerCard({ 
  server, 
  status, 
  onServerAction, 
  onEditServer, 
  onDeleteServer,
  isLoading = false 
}: ServerCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleServerAction = async (action: string) => {
    setActionLoading(action);
    try {
      await onServerAction(server.id, action);
    } catch (error) {
      console.error(`Server action failed: ${action}`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircleIcon,
          variant: 'cyber-success' as const,
          text: 'Online',
          color: 'text-green-500'
        };
      case 'offline':
        return {
          icon: XCircleIcon,
          variant: 'cyber-error' as const,
          text: 'Offline',
          color: 'text-red-500'
        };
      case 'starting':
      case 'stopping':
        return {
          icon: ClockIcon,
          variant: 'cyber-warning' as const,
          text: status === 'starting' ? 'Starting' : 'Stopping',
          color: 'text-orange-500'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          variant: 'cyber-warning' as const,
          text: 'Unknown',
          color: 'text-orange-500'
        };
    }
  };

  const statusConfig = getStatusConfig(status.status);
  const StatusIcon = statusConfig.icon;
  const playerPercentage = status.players.max > 0 ? (status.players.current / status.players.max) * 100 : 0;

  return (
    <Card 
      variant="cyber-glass"
      className="group hover:shadow-matrix-glow transition-all duration-300 relative overflow-hidden"
    >
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status.status === 'online' ? 'bg-green-500' : 
        status.status === 'offline' ? 'bg-red-500' : 
        'bg-orange-500'
      }`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-matrix-500/20 rounded-lg flex items-center justify-center border border-matrix-500/30">
              <ServerIcon className="h-6 w-6 text-matrix-500" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1">
                {server.name}
              </CardTitle>
              <p className="text-sm text-matrix-600 font-mono truncate">
                {server.executablePath?.split('\\').pop() || 'ARK Server'}:{server.port}
              </p>
            </div>
          </div>
          
          <Badge variant={statusConfig.variant} className="flex items-center gap-2">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Player Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-matrix-500" />
              <span className="text-sm font-mono text-matrix-400">Players</span>
            </div>
            <span className="text-sm font-mono font-bold text-matrix-500">
              {status.players.current}/{status.players.max}
            </span>
          </div>
          <Progress 
            value={playerPercentage} 
            className="h-2"
          />
        </div>

        {/* Map Info */}
        <div className="flex items-center justify-between p-3 bg-cyber-panel/50 rounded-lg border border-matrix-500/20">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-matrix-500" />
            <span className="text-sm font-mono text-matrix-400">Map</span>
          </div>
          <Badge variant="cyberpunk" className="text-xs">
            {server.map?.replace('_WP', '').replace(/([A-Z])/g, ' $1').trim() || 'The Island'}
          </Badge>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-matrix-600 font-mono">
            <span className="text-matrix-400">Max Players:</span> {server.maxPlayers}
          </div>
          <div className="text-matrix-600 font-mono">
            <span className="text-matrix-400">Query Port:</span> {server.queryPort}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex gap-2 w-full">
          {/* Primary Action Button */}
          {status.status === 'offline' ? (
            <Button
              onClick={() => handleServerAction('start')}
              disabled={isLoading || actionLoading === 'start'}
              variant="cyber-success"
              className="flex-1"
            >
              {actionLoading === 'start' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Start Server
            </Button>
          ) : (
            <Button
              onClick={() => handleServerAction('stop')}
              disabled={isLoading || actionLoading === 'stop'}
              variant="cyber-danger"
              className="flex-1"
            >
              {actionLoading === 'stop' ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <StopIcon className="h-4 w-4 mr-2" />
              )}
              Stop Server
            </Button>
          )}

          {/* Action Buttons */}
          <Button
            onClick={() => onEditServer(server.id)}
            variant="cyber-outline"
            size="icon"
            title="Edit Server"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => onDeleteServer(server.id)}
            variant="cyber-danger"
            size="icon"
            title="Delete Server"
            className="hover:bg-red-500/20"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 