import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { CyberLayout } from './CyberLayout';
import { TerminalWindow } from './TerminalWindow';
import { DevCacheControls } from './DevCacheControls';
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

// Global console logging system with different log levels
export const addConsoleInfo = (message: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('console-message', { 
      detail: { message, type: 'info' }
    }));
  }
};

export const addConsoleSuccess = (message: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('console-message', { 
      detail: { message, type: 'success' }
    }));
  }
};

export const addConsoleWarning = (message: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('console-message', { 
      detail: { message, type: 'warning' }
    }));
  }
};

export const addConsoleError = (message: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('console-message', { 
      detail: { message, type: 'error' }
    }));
  }
};

interface ConsoleMessage {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
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
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  // Listen for console messages
  React.useEffect(() => {
    const handleConsoleMessage = (event: CustomEvent) => {
      const { message, type } = event.detail;
      const newMessage: ConsoleMessage = {
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      };
      setConsoleMessages(prev => [...prev, newMessage]);
    };

    window.addEventListener('console-message', handleConsoleMessage as EventListener);
    return () => window.removeEventListener('console-message', handleConsoleMessage as EventListener);
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
          messages={consoleMessages}
        />
        
        {/* Development Cache Controls */}
        <DevCacheControls />
      </div>
    </CyberLayout>
  );
} 