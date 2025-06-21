import React from 'react';
import { useRouter } from 'next/router';
import { 
  HomeIcon,
  Cog6ToothIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/Card';

interface SidebarProps {
  isOpen?: boolean;
  onAddServer?: () => void;
  onGlobalSettings?: () => void;
  onToggleSidebar?: () => void;
  totalServers?: number;
  onlineServers?: number;
  totalPlayers?: number;
}

export function Sidebar({ 
  isOpen = true, 
  onAddServer,
  onGlobalSettings,
  onToggleSidebar,
  totalServers = 0,
  onlineServers = 0,
  totalPlayers = 0
}: SidebarProps) {
  const router = useRouter();

  const navigationItems = [
    {
      name: 'DASHBOARD',
      icon: HomeIcon,
      href: '/',
      description: 'SERVER OVERVIEW'
    },
    {
      name: 'ADD SERVER',
      icon: PlusIcon,
      action: onAddServer,
      description: 'CREATE NEW ARK SERVER'
    },
    {
      name: 'GLOBAL SETTINGS',
      icon: Cog6ToothIcon,
      action: onGlobalSettings,
      description: 'SITE PREFERENCES & THEME'
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-cyber-panel/95 backdrop-blur-lg border-r-2 border-matrix-500 shadow-matrix transition-all duration-300 z-[60] ${
      isOpen ? 'w-80' : 'w-16'
    }`}>
      {/* Toggle Button */}
      <Button
        variant="cyber-outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSidebar?.();
        }}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 z-50"
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-3 w-3" />
        ) : (
          <ChevronRightIcon className="h-3 w-3" />
        )}
      </Button>

      {/* Expanded State - Full Navigation */}
      {isOpen && (
        <div className="p-4 pb-6 space-y-6 h-full overflow-y-auto">
          {/* Navigation Items */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = item.href && router.pathname === item.href;
              
              if (item.href) {
                return (
                  <Button
                    key={item.name}
                    variant="cyber-ghost"
                    className={`w-full justify-start h-auto p-4 min-h-[4rem] transition-all duration-200 ${
                      isActive 
                        ? 'border-2 border-matrix-500 bg-matrix-900/30 text-matrix-300 shadow-matrix-glow' 
                        : 'border border-transparent hover:border-matrix-500/50 hover:bg-matrix-900/20'
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <item.icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-mono font-semibold text-sm uppercase tracking-wider">
                          {item.name}
                        </div>
                        <div className="text-xs text-matrix-600 font-mono mt-1 leading-tight break-words">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              } else {
                return (
                  <Button
                    key={item.name}
                    variant="cyber-ghost"
                    className="w-full justify-start h-auto p-4 min-h-[4rem] border border-transparent hover:border-matrix-500/50 hover:bg-matrix-900/20 transition-all duration-200"
                    onClick={item.action}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <item.icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-mono font-semibold text-sm uppercase tracking-wider">
                          {item.name}
                        </div>
                        <div className="text-xs text-matrix-600 font-mono mt-1 leading-tight break-words">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              }
            })}
          </nav>

          <Separator className="bg-matrix-700" />

          {/* Server Statistics */}
          <Card variant="cyber-glass">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-mono font-semibold text-matrix-400 uppercase tracking-wider">
                Server Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
                    Total Servers
                  </span>
                  <Badge variant="cyberpunk">{totalServers}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
                    Online
                  </span>
                  <Badge variant="cyber-success">{onlineServers}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-matrix-600 font-mono uppercase tracking-wider">
                    Players
                  </span>
                  <Badge variant="cyber-info">{totalPlayers}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card variant="cyber-glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-matrix-400 uppercase tracking-wider">
                  System Online
                </span>
              </div>
              <div className="text-xs text-matrix-600 font-mono mt-1">
                All systems operational
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collapsed State - Icons Only */}
      {!isOpen && (
        <div className="p-2 space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.href && router.pathname === item.href;
            
            return (
              <Button
                key={item.name}
                variant="cyber-ghost"
                size="icon"
                className={`w-12 h-12 transition-all duration-200 ${
                  isActive 
                    ? 'border-2 border-matrix-500 bg-matrix-900/30 text-matrix-300 shadow-matrix-glow' 
                    : 'border border-transparent hover:border-matrix-500/50 hover:bg-matrix-900/20'
                }`}
                onClick={item.href ? () => router.push(item.href) : item.action}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            );
          })}
          
          <Separator className="bg-matrix-700 my-4" />
          
          {/* Collapsed Stats */}
          <div className="space-y-2">
            <div className="flex flex-col items-center">
              <Badge variant="cyberpunk" className="text-xs px-1">
                {totalServers}
              </Badge>
              <span className="text-xs text-matrix-600 font-mono mt-1">
                SRV
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <Badge variant="cyber-success" className="text-xs px-1">
                {onlineServers}
              </Badge>
              <span className="text-xs text-matrix-600 font-mono mt-1">
                ON
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
} 