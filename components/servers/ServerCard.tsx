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
          borderColor: 'border-success/30',
          text: 'Online',
          dotColor: 'bg-success'
        };
      case 'offline':
        return {
          icon: XCircleIcon,
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/30',
          text: 'Offline',
          dotColor: 'bg-error'
        };
      case 'starting':
      case 'stopping':
        return {
          icon: ClockIcon,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          text: status === 'starting' ? 'Starting' : 'Stopping',
          dotColor: 'bg-warning'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          text: 'Unknown',
          dotColor: 'bg-warning'
        };
    }
  };

  const statusConfig = getStatusConfig(status.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      variant="elevated" 
      className="group hover:scale-[1.02] transition-all duration-200 relative overflow-hidden"
    >
      {/* Status indicator line */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', statusConfig.dotColor)} />
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-modern-gradient from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <ServerIcon className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle size="md" className="text-base-content mb-1">
                {server.name}
              </CardTitle>
              <p className="text-sm text-base-content/60 font-mono truncate">
                {server.executablePath}:{server.port}
              </p>
            </div>
          </div>
          
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm',
            statusConfig.bgColor,
            statusConfig.borderColor
          )}>
            <div className={cn('w-2 h-2 rounded-full', statusConfig.dotColor)} />
            <span className={cn('text-xs font-medium', statusConfig.color)}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-base-content/60 font-medium mb-1">Players</p>
              <p className="text-lg font-bold text-accent">
                {status.players.current}/{status.players.max}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-base-content/60 font-medium mb-1">Map</p>
              <p className="text-sm font-semibold text-base-content truncate">
                {server.map || 'The Island'}
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
              className="btn btn-success btn-sm flex-1 shadow-sm"
            >
              {actionLoading === 'start' ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              Start Server
            </button>
          ) : (
            <button
              onClick={() => handleServerAction('stop')}
              disabled={isLoading || actionLoading === 'stop'}
              className="btn btn-error btn-sm flex-1 shadow-sm"
            >
              {actionLoading === 'stop' ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <StopIcon className="h-4 w-4" />
              )}
              Stop Server
            </button>
          )}

          <button
            onClick={() => onEditServer(server.id)}
            className="btn btn-ghost btn-sm px-3 hover:bg-base-content/5"
            title="Edit Server"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDeleteServer(server.id)}
            className="btn btn-ghost btn-sm px-3 text-error hover:bg-error/10 hover:text-error"
            title="Delete Server"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 