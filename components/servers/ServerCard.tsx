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
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          text: 'Online'
        };
      case 'offline':
        return {
          icon: XCircleIcon,
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
          text: 'Offline'
        };
      case 'starting':
      case 'stopping':
        return {
          icon: ClockIcon,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          text: status === 'starting' ? 'Starting' : 'Stopping'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          text: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(status.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      variant="elevated" 
      className="group hover:scale-[1.02] transition-all duration-200"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <ServerIcon className="h-6 w-6 text-primary-content" />
            </div>
            <div>
              <CardTitle size="md" className="text-base-content">
                {server.name}
              </CardTitle>
              <p className="text-sm text-base-content/60 font-mono">
                {server.executablePath}:{server.port}
              </p>
            </div>
          </div>
          
          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full border',
            statusConfig.bgColor,
            statusConfig.borderColor
          )}>
            <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
            <span className={cn('text-xs font-semibold', statusConfig.color)}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-base-300/50 rounded-lg">
            <UsersIcon className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-base-content/60 font-medium">Players</p>
              <p className="text-lg font-bold text-accent">
                {status.players.current}/{status.players.max}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-base-300/50 rounded-lg">
            <MapIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-base-content/60 font-medium">Map</p>
              <p className="text-lg font-bold text-base-content">
                {server.map || 'The Island'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex gap-2 w-full">
          {status.status === 'offline' ? (
            <button
              onClick={() => handleServerAction('start')}
              disabled={isLoading || actionLoading === 'start'}
              className="btn btn-success btn-sm flex-1"
            >
              {actionLoading === 'start' ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              Start
            </button>
          ) : (
            <button
              onClick={() => handleServerAction('stop')}
              disabled={isLoading || actionLoading === 'stop'}
              className="btn btn-error btn-sm flex-1"
            >
              {actionLoading === 'stop' ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <StopIcon className="h-4 w-4" />
              )}
              Stop
            </button>
          )}

          <button
            onClick={() => onEditServer(server.id)}
            className="btn btn-ghost btn-sm btn-square"
            title="Edit Server"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDeleteServer(server.id)}
            className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
            title="Delete Server"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 