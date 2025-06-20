import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { GlobalSettings } from '../../lib/global-settings';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarOpen?: boolean;
  onAddServer: () => void;
  onGlobalSettings: () => void;
  onToggleSidebar?: () => void;
  globalSettings: GlobalSettings | null;
  sidebarStats?: {
    totalServers: number;
    onlineServers: number;
    totalPlayers: number;
  };
}

export function Layout({ 
  children, 
  showSidebar = true,
  sidebarOpen = true,
  onAddServer,
  onGlobalSettings,
  onToggleSidebar,
  globalSettings: _globalSettings,
  sidebarStats = {
    totalServers: 0,
    onlineServers: 0,
    totalPlayers: 0
  }
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <Header />
      
      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen}
            onAddServer={onAddServer}
            onGlobalSettings={onGlobalSettings}
            onToggleSidebar={onToggleSidebar}
            totalServers={sidebarStats.totalServers}
            onlineServers={sidebarStats.onlineServers}
            totalPlayers={sidebarStats.totalPlayers}
          />
        )}
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'}`}>
          <main className="flex-1">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
} 