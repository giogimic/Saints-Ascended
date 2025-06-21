import React, { useState } from 'react';
import { 
  ComputerDesktopIcon, 
  Bars3Icon,
  CommandLineIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useGlobalSettings } from '@/lib/global-settings';
import Link from 'next/link';

interface HeaderProps {
  onToggleConsole?: () => void;
}

export function Header({ onToggleConsole }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings } = useGlobalSettings();

  return (
    <header className="sticky top-0 z-50 bg-cyber-panel/90 backdrop-blur-lg border-b-2 border-matrix-500 shadow-matrix">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyber-panel border-2 border-matrix-500 rounded-none flex items-center justify-center shadow-matrix hover:shadow-matrix-glow transition-all duration-200 cyber-hover">
                <ComputerDesktopIcon className="h-6 w-6 text-matrix-500 drop-shadow-matrix" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-mono font-bold text-matrix-500 tracking-wider uppercase cyber-text">
                  {settings?.siteTitle || 'SAINTS ASCENDED'}
                </h1>
                <p className="text-xs text-matrix-600 font-mono font-medium uppercase tracking-widest">
                  SERVER CONTROL MATRIX
                </p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-matrix-600 uppercase tracking-wider">ONLINE</span>
            </div>
            <div className="w-px h-6 bg-matrix-700"></div>
            <div className="text-xs font-mono text-matrix-600 uppercase tracking-wider">
              SYSTEM READY
            </div>
            <div className="w-px h-6 bg-matrix-700"></div>
            
            {/* Admin Link */}
            <Link
              href="/admin"
              className="w-8 h-8 bg-cyber-panel border border-matrix-500 flex items-center justify-center cyber-hover transition-all duration-200 hover:border-orange-400 group"
              title="Admin Dashboard"
            >
              <ShieldCheckIcon className="h-4 w-4 text-matrix-500 group-hover:text-orange-400 transition-colors" />
            </Link>
            
            {/* Console Toggle */}
            <button
              onClick={onToggleConsole}
              className="w-8 h-8 bg-cyber-panel border border-matrix-500 flex items-center justify-center cyber-hover transition-all duration-200 hover:border-matrix-400"
              title="Toggle System Console"
            >
              <CommandLineIcon className="h-4 w-4 text-matrix-500" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-cyber-panel border border-matrix-500 flex items-center justify-center cyber-hover transition-all duration-200"
              title="Menu"
            >
              <Bars3Icon className="h-5 w-5 text-matrix-500" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-matrix-500 py-4 bg-cyber-panel/95 backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-4">
                <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-matrix-600 uppercase tracking-wider">SYSTEM STATUS: ONLINE</span>
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-matrix-600 uppercase tracking-wider hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 