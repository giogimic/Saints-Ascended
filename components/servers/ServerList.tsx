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
  ClockIcon
} from '@heroicons/react/24/outline';
import type { ServerConfig, ServerStatus } from '@/types/server';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

interface ServerListProps {
  servers: ServerConfig[];
  serverStatuses: Record<string, ServerStatus>;
  onServerAction: (serverId: string, action: string) => Promise<void>;
  onEditServer: (serverId: string) => void;
  onDeleteServer: (serverId: string) => void;
}

export function ServerList({ 
  servers, 
  serverStatuses, 
  onServerAction, 
  onEditServer, 
  onDeleteServer 
}: ServerListProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const { handleError } = useErrorHandler();

  const handleServerAction = async (serverId: string, action: string) => {
    setActionLoading(prev => ({ ...prev, [serverId]: action }));
    try {
      await onServerAction(serverId, action);
      toast.success(`Server ${action} action completed successfully`);
    } catch (error) {
      handleError(error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[serverId];
        return newState;
      });
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      await onDeleteServer(serverId);
      toast.success('Server deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditServer = (serverId: string) => {
    try {
      onEditServer(serverId);
    } catch (error) {
      handleError(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4 text-success glow" />;
      case 'offline':
        return <XCircleIcon className="h-4 w-4 text-error glow" />;
      case 'starting':
      case 'stopping':
        return <ClockIcon className="h-4 w-4 text-warning glow" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-warning glow" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'ONLINE';
      case 'offline':
        return 'OFFLINE';
      case 'starting':
        return 'STARTING';
      case 'stopping':
        return 'STOPPING';
      default:
        return 'UNKNOWN';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-error';
      case 'starting':
      case 'stopping':
        return 'text-warning';
      default:
        return 'text-base-content/60';
    }
  };

  if (servers.length === 0) {
    return (
      <div className="card bg-base-200 border border-primary shadow-pipboy">
        <div className="card-body p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded border border-primary flex items-center justify-center mx-auto mb-4">
              <ServerIcon className="h-8 w-8 text-primary/50 glow" />
            </div>
            <h3 className="text-lg font-bold text-primary glow-strong mb-2 font-mono">NO SERVERS CONFIGURED</h3>
            <p className="text-xs text-base-content/60 font-mono mb-6">
              ADD YOUR FIRST ARK: SURVIVAL ASCENDED DEDICATED SERVER
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 border-b-2 border-primary pb-2">
        <h2 className="text-xl font-bold text-primary glow-strong font-mono tracking-wider uppercase">
          SERVER CONTROL PANEL
        </h2>
        <div className="text-xs text-base-content/40 font-mono">
          {servers.length} SERVER{servers.length !== 1 ? 'S' : ''} CONFIGURED
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-base-300/30 p-4 rounded-xl border border-primary/30">
        {servers.map((server) => {
          const status = serverStatuses[server.id]?.status || 'offline';
          const players = serverStatuses[server.id]?.players || { current: 0, max: server.maxPlayers };
          const isLoading = actionLoading[server.id];

          return (
            <div key={server.id} className="card bg-base-200 border-2 border-primary shadow-pipboy-glow hover:shadow-pipboy-strong transition-all duration-200">
              <div className="card-body p-6">
                {/* Server Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded border border-primary flex items-center justify-center">
                      <ServerIcon className="h-4 w-4 text-primary glow" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-primary glow font-mono tracking-wide uppercase">
                        {server.name}
                      </h3>
                      <p className="text-xs text-base-content/60 font-mono">
                        {server.executablePath}:{server.port}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className={`text-xs font-bold font-mono ${getStatusColor(status)}`}>{getStatusText(status)}</span>
                  </div>
                </div>

                {/* Server Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-base-300 rounded border border-base-content/20">
                    <div className="text-xs text-base-content/60 font-mono">PLAYERS</div>
                    <div className="text-lg font-bold text-accent glow font-mono">
                      {players.current}/{players.max}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-base-300 rounded border border-base-content/20">
                    <div className="text-xs text-base-content/60 font-mono">MAP</div>
                    <div className="text-lg font-bold text-base-content font-mono">
                      {server.map || 'THE ISLAND'}
                    </div>
                  </div>
                </div>

                {/* Server Actions */}
                <div className="flex gap-3 mb-4">
                  {status === 'offline' ? (
                    <button
                      onClick={() => handleServerAction(server.id, 'start')}
                      disabled={!!isLoading}
                      className="btn btn-success btn-sm flex-1"
                    >
                      {isLoading === 'start' ? (
                        <div className="loading loading-spinner loading-xs"></div>
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                      START
                    </button>
                  ) : (
                    <button
                      onClick={() => handleServerAction(server.id, 'stop')}
                      disabled={!!isLoading}
                      className="btn btn-error btn-sm flex-1"
                    >
                      {isLoading === 'stop' ? (
                        <div className="loading loading-spinner loading-xs"></div>
                      ) : (
                        <StopIcon className="h-4 w-4" />
                      )}
                      STOP
                    </button>
                  )}

                  <button
                    onClick={() => handleEditServer(server.id)}
                    className="btn btn-ghost btn-sm"
                    title="Edit Server"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                    title="Delete Server"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Server Details */}
                <div className="pt-3 border-t border-base-content/20">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-base-content/60 font-mono">MAX PLAYERS:</span>
                      <span className="ml-1 font-bold text-base-content">{server.maxPlayers}</span>
                    </div>
                    <div>
                      <span className="text-base-content/60 font-mono">TICK RATE:</span>
                      <span className="ml-1 font-bold text-base-content">30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 