import React, { useState } from 'react';
import { 
  ComputerDesktopIcon, 
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useGlobalSettings } from '@/lib/global-settings';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings } = useGlobalSettings();

  return (
    <header className="sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl border border-primary/30 flex items-center justify-center shadow-lg">
                <ComputerDesktopIcon className="h-6 w-6 text-primary-content" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary">
                  {settings?.siteTitle || 'ARK SERVER MANAGER'}
                </h1>
                <p className="text-xs text-base-content/60 font-medium">
                  Dedicated Server Control
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-ghost btn-sm btn-circle"
              title="Menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-base-content/10 py-4">
            <div className="flex flex-col gap-3">
              {/* Mobile menu content can be added here if needed */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 