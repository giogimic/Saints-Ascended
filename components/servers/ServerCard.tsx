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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ServerConfig, ServerStatus } from '@/types/server';

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
          color: 'text-matrix-500',
          bgColor: 'bg-cyber-panel',
          borderColor: 'border-matrix-500',
          text: 'ONLINE',
          dotColor: 'bg-matrix-500'
        };
      case 'offline':
        return {
          icon: XCircleIcon,
          color: 'text-danger-red',
          bgColor: 'bg-cyber-panel',
          borderColor: 'border-danger-red',
          text: 'OFFLINE',
          dotColor: 'bg-danger-red'
        };
      case 'starting':
      case 'stopping':
        return {
          icon: ClockIcon,
          color: 'text-warning-orange',
          bgColor: 'bg-cyber-panel',
          borderColor: 'border-warning-orange',
          text: status === 'starting' ? 'STARTING' : 'STOPPING',
          dotColor: 'bg-warning-orange'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-warning-orange',
          bgColor: 'bg-cyber-panel',
          borderColor: 'border-warning-orange',
          text: 'UNKNOWN',
          dotColor: 'bg-warning-orange'
        };
    }
  };

  const statusConfig = getStatusConfig(status.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      className="group hover:scale-[1.02] transition-all duration-200 relative overflow-hidden shadow-lg shadow-primary-green/10 hover:shadow-primary-green/20"
    >
      {/* Status indicator line */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', statusConfig.dotColor)} />
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyber-panel border-2 border-primary-green/30 flex items-center justify-center shadow-lg shadow-primary-green/20">
              <ServerIcon className="h-6 w-6 text-primary-green drop-shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-primary-green mb-1">
                {server.name}
              </CardTitle>
              <p className="text-sm text-matrix-600 font-mono truncate uppercase tracking-wider">
                {server.executablePath}:{server.port}
              </p>
            </div>
          </div>
          
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 border-2 backdrop-blur-sm',
            statusConfig.bgColor,
            statusConfig.borderColor
          )}>
            <div className={cn('w-2 h-2 animate-pulse', statusConfig.dotColor)} />
            <span className={cn('text-xs font-mono font-medium uppercase tracking-wider', statusConfig.color)}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-cyber-panel border border-matrix-700">
            <div className="w-10 h-10 bg-cyber-panel border border-matrix-600 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-matrix-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-matrix-600 font-mono font-medium mb-1 uppercase tracking-wider">PLAYERS</p>
              <p className="text-lg font-bold font-mono text-matrix-500">
                {status.players.current}/{status.players.max}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-cyber-panel border border-matrix-700">
            <div className="w-10 h-10 bg-cyber-panel border border-matrix-600 flex items-center justify-center">
              <MapIcon className="h-5 w-5 text-matrix-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-matrix-600 font-mono font-medium mb-1 uppercase tracking-wider">MAP</p>
              <p className="text-sm font-semibold font-mono text-matrix-500 truncate uppercase">
                {server.map || 'THE ISLAND'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex gap-3 w-full">
          {status.status === 'offline' ? (
            <button
              onClick={() => handleServerAction('start')}
              disabled={isLoading || actionLoading === 'start'}
              className="flex-1 px-4 py-2 bg-cyber-panel border-2 border-matrix-500 text-matrix-500 font-mono font-medium uppercase tracking-wider text-sm hover:bg-matrix-500 hover:text-cyber-bg transition-all duration-200 cyber-hover flex items-center justify-center gap-2"
            >
              {actionLoading === 'start' ? (
                <div className="w-4 h-4 border-2 border-matrix-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              START SERVER
            </button>
          ) : (
            <button
              onClick={() => handleServerAction('stop')}
              disabled={isLoading || actionLoading === 'stop'}
              className="flex-1 px-4 py-2 bg-cyber-panel border-2 border-danger-red text-danger-red font-mono font-medium uppercase tracking-wider text-sm hover:bg-danger-red hover:text-cyber-bg transition-all duration-200 cyber-hover flex items-center justify-center gap-2"
            >
              {actionLoading === 'stop' ? (
                <div className="w-4 h-4 border-2 border-danger-red border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <StopIcon className="h-4 w-4" />
              )}
              STOP SERVER
            </button>
          )}

          <button
            onClick={() => onEditServer(server.id)}
            className="px-3 py-2 bg-cyber-panel border border-matrix-700 text-matrix-600 hover:border-matrix-500 hover:text-matrix-500 transition-all duration-200 cyber-hover"
            title="Edit Server"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDeleteServer(server.id)}
            className="px-3 py-2 bg-cyber-panel border border-matrix-700 text-matrix-600 hover:border-danger-red hover:text-danger-red transition-all duration-200 cyber-hover"
            title="Delete Server"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 