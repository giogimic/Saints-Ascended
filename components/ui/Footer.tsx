import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground font-mono">
            <span>Built with Next.js & shadcn/ui</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="font-mono">Saints Ascended Server Manager</span>
            <span className="text-primary">v1.0.0</span>
          </div>
          
          <div className="text-xs text-muted-foreground font-mono">
            © 2024 Cyberpunk Server Management
          </div>
        </div>
      </div>
    </footer>
  );
}; 