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
  ChevronRight,
  Shield,
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

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-zinc-950/50 backdrop-blur-xl border-r border-white/5 z-20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className="p-2 rounded-lg bg-zinc-500/10">
          <Shield className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Admin Console</h2>
          <p className="text-xs text-zinc-500">Platform Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/workspace' && pathname.startsWith(item.href));

          return (
            <button
              key={item.href}
              onClick={() => handleNavigate(item.href)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className={clsx(
                'p-1.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-white/10'
                  : 'bg-white/5 group-hover:bg-white/10'
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.label}</div>
              </div>
              <ChevronRight className={clsx(
                'h-4 w-4 transition-opacity',
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
              )} />
            </button>
          );
        })}
      </nav>

      {/* Footer - System Status */}
      <div className="p-3 border-t border-white/5">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
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
    </aside>
  );
}
