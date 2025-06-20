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
      name: 'Dashboard',
      icon: HomeIcon,
      href: '/',
      description: 'Server overview and management'
    },
    {
      name: 'Add Server',
      icon: PlusIcon,
      action: onAddServer,
      description: 'Create a new ARK server'
    },
    {
      name: 'Global Settings',
      icon: Cog6ToothIcon,
      action: onGlobalSettings,
      description: 'Site title, favicon, theme, and system preferences'
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100%-4rem)] bg-base-200/90 backdrop-blur-lg border-r border-base-content/8 shadow-modern transition-all duration-300 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSidebar?.();
        }}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-modern-gradient from-primary to-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-primary/25 transition-all duration-200 z-50 border-2 border-base-100"
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
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                  isActive 
                    ? 'bg-modern-gradient from-primary/10 to-secondary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'hover:bg-base-content/5 text-base-content/80 hover:text-base-content'
                }`}
                title={item.description}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-base-content/60 group-hover:text-base-content'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className={`text-xs transition-colors truncate ${
                    isActive ? 'text-primary/70' : 'text-base-content/50 group-hover:text-base-content/70'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-base-content/8">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-base-content/2 text-sm">
              <span className="text-base-content/70 font-medium">Total Servers</span>
              <span className="font-semibold text-base-content">{totalServers}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 text-sm">
              <span className="text-base-content/70 font-medium">Online</span>
              <span className="font-semibold text-success">{onlineServers}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 text-sm">
              <span className="text-base-content/70 font-medium">Players</span>
              <span className="font-semibold text-accent">{totalPlayers}</span>
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
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-modern-gradient from-primary/10 to-secondary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'hover:bg-base-content/5 text-base-content/70 hover:text-base-content'
                }`}
                title={item.name}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-base-content/60 group-hover:text-base-content'
                }`} />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
} 