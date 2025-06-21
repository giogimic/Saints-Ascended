import React from 'react';
import { 
  ServerIcon, 
  PlayIcon,
  CpuChipIcon,
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import type { ServerConfig, ServerStatus } from '@/types/server';

// shadcn/ui imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
  const totalPlayers = Object.values(serverStatuses).reduce((acc, status) => acc + status.players.current, 0);
  const maxPlayers = servers.reduce((acc, server) => acc + server.maxPlayers, 0);
  const uptime = totalServers > 0 ? ((onlineServers / totalServers) * 100).toFixed(1) : 0;
  
  if (totalServers === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="cyber-glass" className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-matrix-500/20 rounded-lg flex items-center justify-center">
                <RocketLaunchIcon className="h-8 w-8 text-matrix-500" />
              </div>
            </div>
            <CardTitle className="mb-4">Saints Ascended Control Panel</CardTitle>
            <p className="text-matrix-400 text-sm mb-6">
              No servers configured. Initialize your first server instance to begin operations.
            </p>
            <Button variant="cyber-solid" className="w-full">
              <RocketLaunchIcon className="h-4 w-4 mr-2" />
              Deploy Server
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Status Header */}
      <Card variant="cyber">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Status</CardTitle>
            <Badge variant="cyber-online" className="animate-pulse">
              Operational
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Servers */}
        <Card variant="cyber-glass" className="hover:shadow-matrix-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm">Total Servers</CardTitle>
              <ServerIcon className="h-5 w-5 text-matrix-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-matrix-500 mb-2">
              {totalServers.toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
              Instances Configured
            </p>
          </CardContent>
        </Card>

        {/* Online Servers */}
        <Card variant="cyber-glass" className="hover:shadow-matrix-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm">Active Servers</CardTitle>
              <CpuChipIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-green-500 mb-2">
              {onlineServers.toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
              Systems Online
            </p>
          </CardContent>
        </Card>

        {/* Total Players */}
        <Card variant="cyber-glass" className="hover:shadow-matrix-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm">Connected Users</CardTitle>
              <PlayIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-blue-500 mb-2">
              {totalPlayers.toString().padStart(3, '0')}
            </div>
            <p className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
              Active Connections
            </p>
            {maxPlayers > 0 && (
              <div className="mt-3">
                <Progress 
                  value={(totalPlayers / maxPlayers) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-matrix-600 mt-1">
                  {totalPlayers}/{maxPlayers} capacity
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card variant="cyber-glass" className="hover:shadow-matrix-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm">System Uptime</CardTitle>
              <ClockIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-orange-500 mb-2">
              {uptime}%
            </div>
            <p className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
              Percent Availability
            </p>
            <div className="mt-3">
              <Progress 
                value={Number(uptime)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Summary */}
      {totalServers > 0 && (
        <Card variant="cyber">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Server Overview</CardTitle>
              <Badge variant="cyberpunk">
                {onlineServers}/{totalServers} Operational
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servers.slice(0, 5).map((server) => {
                const status = serverStatuses[server.id];
                const isOnline = status?.status === 'online';
                
                return (
                  <div key={server.id} className="flex items-center justify-between p-3 bg-cyber-panel/50 rounded-lg border border-matrix-500/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                      <div className="font-mono text-matrix-400 font-medium">{server.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-matrix-600 font-mono">
                        {status?.players.current || 0}/{server.maxPlayers}
                      </div>
                      <Badge variant={isOnline ? 'cyber-success' : 'cyber-offline'}>
                        {isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {servers.length > 5 && (
                <div className="flex items-center justify-between p-3 border-t border-matrix-500/20 pt-3">
                  <div className="font-mono text-matrix-400 text-sm">
                    And {servers.length - 5} more servers...
                  </div>
                  <Button variant="cyber-outline" size="sm">
                    View All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 