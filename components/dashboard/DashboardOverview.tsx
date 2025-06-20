import React from 'react';
import { 
  ServerIcon, 
  PlayIcon,
  CpuChipIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
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
  const totalPlayers = Object.values(serverStatuses).reduce((acc, status) => acc + status.players.current, 0);
  
  if (totalServers === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🚀</div>
        <div className="empty-title">SAINTS ASCENDED CONTROL PANEL</div>
        <div className="empty-subtitle">
          NO SERVERS CONFIGURED. INITIALIZE YOUR FIRST SERVER INSTANCE TO BEGIN OPERATIONS.
        </div>
        <button className="action-button hover-jitter">
          <span>⚡</span>
          DEPLOY SERVER
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Status Header */}
      <div className="hardware-panel">
        <div className="panel-header">
          <div className="panel-title">SYSTEM STATUS</div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Total Servers */}
        <div className="metric-card hover-jitter">
          <div className="metric-header">
            <div className="metric-title">Total Servers</div>
            <ServerIcon className="metric-icon" />
          </div>
          <div className="metric-value">{totalServers.toString().padStart(2, '0')}</div>
          <div className="metric-subtitle">INSTANCES CONFIGURED</div>
        </div>

        {/* Online Servers */}
        <div className="metric-card hover-jitter">
          <div className="metric-header">
            <div className="metric-title">Active Servers</div>
            <CpuChipIcon className="metric-icon" />
          </div>
          <div className="metric-value status-online">{onlineServers.toString().padStart(2, '0')}</div>
          <div className="metric-subtitle">SYSTEMS ONLINE</div>
        </div>

        {/* Total Players */}
        <div className="metric-card hover-jitter">
          <div className="metric-header">
            <div className="metric-title">Connected Users</div>
            <PlayIcon className="metric-icon" />
          </div>
          <div className="metric-value">{totalPlayers.toString().padStart(3, '0')}</div>
          <div className="metric-subtitle">ACTIVE CONNECTIONS</div>
        </div>

        {/* System Uptime */}
        <div className="metric-card hover-jitter">
          <div className="metric-header">
            <div className="metric-title">System Uptime</div>
            <ClockIcon className="metric-icon" />
          </div>
          <div className="metric-value">99.9</div>
          <div className="metric-subtitle">PERCENT AVAILABILITY</div>
        </div>
      </div>

      {/* Server Summary */}
      {totalServers > 0 && (
        <div className="hardware-panel">
          <div className="panel-header">
            <div className="panel-title">SERVER OVERVIEW</div>
            <div className="text-muted text-xs">
              {onlineServers}/{totalServers} OPERATIONAL
            </div>
          </div>
          <div className="panel-content">
            <div className="space-y-3">
              {servers.slice(0, 5).map((server) => {
                const status = serverStatuses[server.id];
                const isOnline = status?.status === 'online';
                
                return (
                  <div key={server.id} className="data-row">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-matrix-green' : 'bg-gray-600'}`} />
                      <div className="data-label">{server.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted">
                        {status?.players.current || 0}/{server.maxPlayers}
                      </div>
                      <div className={`data-value text-xs ${isOnline ? 'status-online' : 'status-offline'}`}>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {servers.length > 5 && (
                <div className="data-row border-t border-matrix-green/20 pt-3">
                  <div className="data-label">AND {servers.length - 5} MORE...</div>
                  <div className="data-value text-xs">VIEW ALL</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 