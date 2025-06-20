import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { CyberLayout } from './CyberLayout';
import { TerminalWindow } from './TerminalWindow';
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

// Global error handler for console
export const addConsoleError = (error: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('console-error', { detail: error }));
  }
};

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
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);

  // Listen for global errors
  React.useEffect(() => {
    const handleConsoleError = (event: CustomEvent) => {
      setConsoleErrors(prev => [...prev, event.detail]);
    };

    window.addEventListener('console-error', handleConsoleError as EventListener);
    return () => window.removeEventListener('console-error', handleConsoleError as EventListener);
  }, []);
  return (
    <CyberLayout>
      <div className="flex min-h-screen">
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
        <div className="flex-1 flex flex-col">
          <Header onToggleConsole={() => setConsoleOpen(!consoleOpen)} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
          
          <Footer />
        </div>
        
        {/* Terminal Console */}
        <TerminalWindow 
          isOpen={consoleOpen}
          onClose={() => setConsoleOpen(false)}
          errors={consoleErrors}
        />
      </div>
    </CyberLayout>
  );
} 