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
      description: 'SERVER OVERVIEW AND MANAGEMENT'
    },
    {
      name: 'ADD SERVER',
      icon: PlusIcon,
      action: onAddServer,
      description: 'CREATE A NEW ARK SERVER'
    },
    {
      name: 'GLOBAL SETTINGS',
      icon: Cog6ToothIcon,
      action: onGlobalSettings,
      description: 'SITE TITLE, FAVICON, THEME, AND SYSTEM PREFERENCES'
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-cyber-panel/95 backdrop-blur-lg border-r-2 border-matrix-500 shadow-matrix transition-all duration-300 z-[60] overflow-y-auto ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Toggle Button */}
      <Button
        variant="cyber-outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSidebar?.();
        }}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 z-50"
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </Button>

      {/* Expanded State - Full Navigation */}
      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Navigation Items */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = item.href && router.pathname === item.href;
              
              if (item.href) {
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "cyber-solid" : "cyber-ghost"}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <item.icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <div className="font-mono font-semibold text-sm uppercase tracking-wider">
                          {item.name}
                        </div>
                        <div className="text-xs text-matrix-600 font-mono mt-1 leading-tight">
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
                    className="w-full justify-start h-auto p-4"
                    onClick={item.action}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <item.icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <div className="font-mono font-semibold text-sm uppercase tracking-wider">
                          {item.name}
                        </div>
                        <div className="text-xs text-matrix-600 font-mono mt-1 leading-tight">
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
                variant={isActive ? "cyber-solid" : "cyber-ghost"}
                size="icon"
                className="w-12 h-12"
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