import React, { useState } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ServerIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { ServerConfig, ServerStatus } from '@/types/server';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ServerTableProps {
  servers: ServerConfig[];
  serverStatuses: Record<string, ServerStatus>;
  onServerAction: (serverId: string, action: string) => Promise<void>;
  onEditServer: (serverId: string) => void;
  onDeleteServer: (serverId: string) => void;
  onViewDashboard: (serverId: string) => void;
  loading?: boolean;
}

export function ServerTable({ 
  servers, 
  serverStatuses, 
  onServerAction, 
  onEditServer, 
  onDeleteServer,
  onViewDashboard,
  loading = false 
}: ServerTableProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleServerAction = async (serverId: string, action: string) => {
    setActionLoading(prev => ({ ...prev, [serverId]: action }));
    try {
      await onServerAction(serverId, action);
    } catch (error) {
      console.error(`Server action failed: ${action}`, error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[serverId];
        return newState;
      });
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

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="mt-4 text-base-content/60">Loading server data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (servers.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ServerIcon className="h-10 w-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-semibold text-base-content mb-2">
              No servers configured
            </h3>
            <p className="text-base-content/60 mb-6 max-w-md mx-auto">
              Get started by adding your first ARK: Survival Ascended dedicated server to begin managing your game infrastructure.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="border-b border-base-content/10">
                <th className="text-left font-semibold text-base-content/70">Name</th>
                <th className="text-left font-semibold text-base-content/70">Map</th>
                <th className="text-left font-semibold text-base-content/70">Drive</th>
                <th className="text-left font-semibold text-base-content/70">Status</th>
                <th className="text-center font-semibold text-base-content/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => {
                const status = serverStatuses[server.id] || {
                  id: server.id,
                  status: 'offline',
                  players: { current: 0, max: server.maxPlayers },
                  version: '1.0.0',
                  lastSeen: new Date()
                };
                const isLoading = actionLoading[server.id];

                return (
                  <tr key={server.id} className="border-b border-base-content/5 hover:bg-base-300/30">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ServerIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-base-content">{server.name}</div>
                          <div className="text-sm text-base-content/60">{server.executablePath}:{server.port}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-base-content">{server.map || 'The Island'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-base-content/60">{server.executablePath}</span>
                    </td>
                    <td className="py-4">
                      <span className={`text-sm font-medium ${getStatusColor(status.status)}`}>
                        {status.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        {status.status === 'offline' ? (
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full"
                            onClick={() => handleServerAction(server.id, 'start')}
                            title="Start Server"
                          >
                            {isLoading === 'start' ? (
                              <div className="loading loading-spinner loading-xs"></div>
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full"
                            onClick={() => handleServerAction(server.id, 'stop')}
                            title="Stop Server"
                          >
                            {isLoading === 'stop' ? (
                              <div className="loading loading-spinner loading-xs"></div>
                            ) : (
                              <StopIcon className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          onClick={() => handleServerAction(server.id, 'update')}
                          title="Update Server"
                        >
                          {isLoading === 'update' ? (
                            <div className="loading loading-spinner loading-xs"></div>
                          ) : (
                            <ArrowPathIcon className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
                          onClick={() => onViewDashboard(server.id)}
                          title="Server Dashboard"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
                          onClick={() => router.push(`/servers/${server.id}/edit`)}
                          title="Edit Server"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => onDeleteServer(server.id)}
                          title="Delete Server"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 