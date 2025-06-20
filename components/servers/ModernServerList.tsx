import React from 'react';
import { ServerTable } from './ServerTable';
import type { ServerConfig, ServerStatus } from '@/types/server';

interface ModernServerListProps {
  servers: ServerConfig[];
  serverStatuses: Record<string, ServerStatus>;
  onServerAction: (serverId: string, action: string) => Promise<void>;
  onEditServer: (serverId: string) => void;
  onDeleteServer: (serverId: string) => void;
  onViewDashboard: (serverId: string) => void;
  loading?: boolean;
}

export function ModernServerList({ 
  servers, 
  serverStatuses, 
  onServerAction, 
  onEditServer, 
  onDeleteServer,
  onViewDashboard,
  loading = false 
}: ModernServerListProps) {
  return (
    <div className="space-y-6">
      <ServerTable
        servers={servers}
        serverStatuses={serverStatuses}
        onServerAction={onServerAction}
        onEditServer={onEditServer}
        onDeleteServer={onDeleteServer}
        onViewDashboard={onViewDashboard}
        loading={loading}
      />
    </div>
  );
} 