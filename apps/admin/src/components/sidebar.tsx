'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  LayoutGrid,
  Sparkles,
  X,
  Layers,
  Paintbrush,
  Command
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Apps', href: '/apps', icon: LayoutGrid },
  { label: 'Spaces', href: '/spaces', icon: Layers },
  { label: 'Theme', href: '/theme', icon: Paintbrush },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Feedback', href: '/feedback', icon: MessageSquare },
  { label: 'Updates', href: '/updates', icon: Sparkles },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface AdminSidebarProps {
  onSignOut: () => void;
}

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl fixed top-0 inset-x-0 z-50">
        <div className="flex items-center gap-3 text-zinc-100">
          <div className="p-1.5 rounded bg-white/5 border border-white/10">
            <Command className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide">AINEX</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed top-0 bottom-0 left-0 z-50 w-72 transition-transform duration-300 ease-out md:translate-x-0 md:static",
        "border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-full flex flex-col p-4">
          
          {/* Header */}
          <div className="px-3 py-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white text-zinc-950 shadow-lg shadow-white/10">
                <Command className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-none tracking-tight">
                  AINEX
                </h1>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Admin Workspace
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto space-y-1">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-2">
              Platform
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                  )}
                >
                  <item.icon className={clsx(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  )} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="mb-4 px-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">System Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Operational
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[98%]" />
                </div>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}