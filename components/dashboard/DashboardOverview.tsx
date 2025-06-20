import React from 'react';
import { 
  ServerIcon, 
  PlayIcon
} from '@heroicons/react/24/outline';
import { StatCard } from '@/components/ui/StatCard';
import type { ServerConfig, ServerStatus } from '@/types/server';

interface DashboardOverviewProps {
  servers: ServerConfig[];
  serverStatuses: Record<string, ServerStatus>;
}

export function DashboardOverview({ 
  servers, 
  serverStatuses
}: DashboardOverviewProps) {
  // Calculate stats
  const totalServers = servers.length;
  const onlineServers = Object.values(serverStatuses).filter(s => s.status === 'online').length;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="flex justify-between gap-6">
        <StatCard
          title="Online Servers"
          value={onlineServers}
          description="Active servers"
          icon={<PlayIcon className="h-5 w-5 text-success" />}
          variant="success"
          className="flex-1"
        />
      </div>
      
      {/* Bottom Stats */}
      <div className="flex justify-between gap-6 mt-auto">
        <div className="text-sm">
          <span className="text-base-content/70">Total Servers:</span>
          <span className="ml-2 font-semibold">{totalServers}</span>
        </div>
        <div className="text-sm">
          <span className="text-base-content/70">Online:</span>
          <span className="ml-2 font-semibold text-success">{onlineServers}</span>
        </div>
      </div>
    </div>
  );
} 