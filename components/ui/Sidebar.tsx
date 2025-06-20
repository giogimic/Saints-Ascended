import React from 'react';
import { useRouter } from 'next/router';
import { 
  HomeIcon,
  Cog6ToothIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

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
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSidebar?.();
        }}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-cyber-panel border-2 border-matrix-500 text-matrix-500 flex items-center justify-center shadow-matrix hover:shadow-matrix-glow transition-all duration-200 z-50 cyber-hover"
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>

      <div className={`p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.href ? router.pathname === item.href : false;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={(e) => {
                  console.log('Sidebar button clicked:', item.name);
                  if (item.href) {
                    router.push(item.href);
                  } else if (item.action) {
                    item.action();
                  }
                }}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-3 bg-cyber-panel border border-matrix-700 text-left transition-all duration-200 group cyber-hover ${
                  isActive 
                    ? 'border-matrix-500 text-matrix-500 shadow-matrix-glow' 
                    : 'hover:border-matrix-600 text-matrix-600 hover:text-matrix-500'
                }`}
                title={item.description}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-matrix-500' : 'text-matrix-600 group-hover:text-matrix-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-medium text-sm truncate uppercase tracking-wider">{item.name}</div>
                  <div className={`text-xs font-mono transition-colors truncate uppercase tracking-widest ${
                    isActive ? 'text-matrix-600' : 'text-matrix-700 group-hover:text-matrix-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-matrix-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-cyber-panel border border-matrix-700 text-sm">
              <span className="text-matrix-600 font-mono font-medium uppercase tracking-wider">TOTAL SERVERS</span>
              <span className="font-mono font-semibold text-matrix-500">{totalServers}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-cyber-panel border border-matrix-700 text-sm">
              <span className="text-matrix-600 font-mono font-medium uppercase tracking-wider">ONLINE</span>
              <span className="font-mono font-semibold text-matrix-500">{onlineServers}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-cyber-panel border border-matrix-700 text-sm">
              <span className="text-matrix-600 font-mono font-medium uppercase tracking-wider">PLAYERS</span>
              <span className="font-mono font-semibold text-matrix-500">{totalPlayers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed State - Icons Only */}
      <div className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="p-3 space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.href ? router.pathname === item.href : false;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={(e) => {
                  console.log('Sidebar button clicked (collapsed):', item.name);
                  if (item.href) {
                    router.push(item.href);
                  } else if (item.action) {
                    item.action();
                  }
                }}
                type="button"
                className={`w-10 h-10 flex items-center justify-center bg-cyber-panel border border-matrix-700 transition-all duration-200 group cyber-hover ${
                  isActive 
                    ? 'border-matrix-500 text-matrix-500 shadow-matrix-glow' 
                    : 'hover:border-matrix-600 text-matrix-600 hover:text-matrix-500'
                }`}
                title={item.name}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-matrix-500' : 'text-matrix-600 group-hover:text-matrix-500'
                }`} />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
} 