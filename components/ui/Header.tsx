import React, { useState } from 'react';
import { 
  ComputerDesktopIcon, 
  Bars3Icon,
  CommandLineIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useGlobalSettings } from '@/lib/global-settings';
import Link from 'next/link';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

          {/* Navigation Menu - Desktop */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-matrix-400 hover:text-matrix-300 font-mono">
                    System
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-matrix-500/10 hover:text-matrix-300 focus:bg-matrix-500/10 focus:text-matrix-300"
                        >
                          <div className="text-sm font-medium leading-none text-matrix-400 font-mono">Dashboard</div>
                          <p className="line-clamp-2 text-sm leading-snug text-matrix-600">
                            Server overview and management
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/admin"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-matrix-500/10 hover:text-matrix-300 focus:bg-matrix-500/10 focus:text-matrix-300"
                        >
                          <div className="text-sm font-medium leading-none text-matrix-400 font-mono">Admin Panel</div>
                          <p className="line-clamp-2 text-sm leading-snug text-matrix-600">
                            System administration and testing
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Status Indicators and Actions */}
          <div className="flex items-center gap-3">
            {/* System Status */}
            <div className="hidden lg:flex items-center gap-2">
              <Badge variant="cyber-online" className="animate-pulse">
                ONLINE
              </Badge>
              <div className="text-xs text-matrix-600 font-mono">
                SYSTEM OPERATIONAL
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Console Toggle */}
              {onToggleConsole && (
                <Button
                  variant="cyber-ghost"
                  size="sm"
                  onClick={onToggleConsole}
                  className="hidden sm:flex"
                  title="Toggle Console"
                >
                  <CommandLineIcon className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">CONSOLE</span>
                </Button>
              )}

              {/* Admin Access */}
              <Button
                variant="cyber-outline"
                size="sm"
                asChild
                className="hidden sm:flex"
              >
                <Link href="/admin">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">ADMIN</span>
                </Link>
              </Button>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="cyber-ghost" size="sm">
                      <Bars3Icon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/" className="flex items-center gap-2 w-full">
                        <ComputerDesktopIcon className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 w-full">
                        <ShieldCheckIcon className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    {onToggleConsole && (
                      <DropdownMenuItem onClick={onToggleConsole}>
                        <CommandLineIcon className="h-4 w-4 mr-2" />
                        Toggle Console
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 