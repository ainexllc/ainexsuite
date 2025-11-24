'use client';

import { X, Home } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface AppNavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apps: Array<{
    name: string;
    slug: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  user?: {
    subscriptionStatus?: string;
    subscriptionTier?: string;
    trialStartDate?: number;
  };
}

export function AppNavigationSidebar({
  isOpen,
  onClose,
  apps,
  user,
}: AppNavigationSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[200px] flex flex-col bg-black/60 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-out z-40 overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />

        {/* Header */}
        <div className="relative z-10 flex-none flex items-center justify-between p-4 border-b border-white/10 bg-transparent">
          <h2 className="text-lg font-semibold text-white">Apps</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {/* Back to Dashboard */}
            <Link
              href="/workspace"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Suite Dashboard</span>
            </Link>

            {/* Divider */}
            <div className="my-2 border-t border-white/10" />

            {/* Apps List */}
            <div className="grid gap-2">
              {apps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <a
                    key={app.slug}
                    href={app.url}
                    onClick={onClose}
                    className="group relative flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:translate-x-1 overflow-hidden"
                    style={{
                      '--accent': app.color,
                      '--accent-dim': `${app.color}1a`, // 10% opacity
                      '--accent-glow': `${app.color}40`, // 25% opacity
                    } as React.CSSProperties}
                  >
                    {/* Background & Border Effects */}
                    <div className="absolute inset-0 bg-white/5 border border-white/5 rounded-xl transition-all duration-300 group-hover:bg-[var(--accent-dim)] group-hover:border-[var(--accent-glow)] group-hover:shadow-[0_0_15px_-3px_var(--accent-dim)]" />
                    
                    {/* Icon Container */}
                    <div 
                      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 border border-white/10 transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-black flex-shrink-0"
                      style={{ color: app.color }}
                    >
                      <IconComponent className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Text */}
                    <span className="relative z-10 text-sm font-medium text-white/70 transition-colors duration-300 group-hover:text-white truncate">
                      {app.name}
                    </span>

                    {/* Arrow */}
                    <span className="relative z-10 ml-auto text-xs text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)] flex-shrink-0">
                      →
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
