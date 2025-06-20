import React from 'react';

export function Footer() {
  return (
    <footer className="bg-base-200/50 border-t border-base-content/10 py-4 w-full">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <span>ARK Server Manager v1.0.0</span>
            <span>•</span>
            <span>Built with Next.js & DaisyUI</span>
            <span>•</span>
            <a 
              href="https://discord.gg/saintsgaming"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-content/60 hover:text-primary transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 