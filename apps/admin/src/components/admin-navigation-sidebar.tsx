'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LayoutGrid,
  Sparkles,
  Layers,
  Paintbrush,
  X,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/workspace', icon: LayoutDashboard, description: 'Platform metrics' },
  { label: 'Apps', href: '/workspace/apps', icon: LayoutGrid, description: 'Manage applications' },
  { label: 'Spaces', href: '/workspace/spaces', icon: Layers, description: 'User workspaces' },
  { label: 'Theme', href: '/workspace/theme', icon: Paintbrush, description: 'Visual customization' },
  { label: 'Users', href: '/workspace/users', icon: Users, description: 'User management' },
  { label: 'Feedback', href: '/workspace/feedback', icon: MessageSquare, description: 'User feedback' },
  { label: 'Updates', href: '/workspace/updates', icon: Sparkles, description: 'Release notes' },
  { label: 'Settings', href: '/workspace/settings', icon: Settings, description: 'System config' },
];

interface AdminNavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNavigationSidebar({ isOpen, onClose }: AdminNavigationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 h-full w-80 transform transition-transform duration-300 ease-out',
          'bg-surface-elevated/95 backdrop-blur-xl border-r border-white/10',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div>
              <h2 className="text-lg font-semibold text-white">Admin Console</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Platform Management</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/workspace' && pathname.startsWith(item.href));

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div className={clsx(
                    'p-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white/10'
                      : 'bg-white/5 group-hover:bg-white/10'
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-zinc-500 truncate">{item.description}</div>
                    )}
                  </div>
                  <ChevronRight className={clsx(
                    'h-4 w-4 transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                  )} />
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-400">System Status</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Operational
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[98%]" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
