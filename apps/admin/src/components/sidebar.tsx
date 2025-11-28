'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  LayoutGrid,
  Sparkles,
  Layers,
  Paintbrush,
  X,
  Command
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Apps', href: '/workspace/apps', icon: LayoutGrid },
  { label: 'Spaces', href: '/workspace/spaces', icon: Layers },
  { label: 'Theme', href: '/workspace/theme', icon: Paintbrush },
  { label: 'Users', href: '/workspace/users', icon: Users },
  { label: 'Feedback', href: '/workspace/feedback', icon: MessageSquare },
  { label: 'Updates', href: '/workspace/updates', icon: Sparkles },
  { label: 'Settings', href: '/workspace/settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  user?: {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  };
}

export function AdminSidebar({ isOpen, onClose, onSignOut, user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed top-0 bottom-0 left-0 z-40 w-72 transition-transform duration-300 ease-out pt-16 bg-zinc-950/95 backdrop-blur-xl border-r border-white/5 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-4">
          
          {/* Header (Visible only on mobile inside drawer, or desktop if we want) */}
          <div className="px-3 py-4 mb-2 flex justify-between items-center">
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
            <button onClick={onClose} className="md:hidden text-zinc-400">
              <X className="h-5 w-5" />
            </button>
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
                    onClose();
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}
    </>
  );
}
