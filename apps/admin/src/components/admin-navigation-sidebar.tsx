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
  Home,
  FileText,
  BookOpen,
  CheckSquare,
  Heart,
  Camera,
  GraduationCap,
  Activity,
  Dumbbell,
  GitBranch,
  Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';
import { navigateToApp } from '@ainexsuite/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/workspace', icon: LayoutDashboard },
  { label: 'Apps', href: '/workspace/apps', icon: LayoutGrid },
  { label: 'Spaces', href: '/workspace/spaces', icon: Layers },
  { label: 'Theme', href: '/workspace/theme', icon: Paintbrush },
  { label: 'Users', href: '/workspace/users', icon: Users },
  { label: 'Feedback', href: '/workspace/feedback', icon: MessageSquare },
  { label: 'Updates', href: '/workspace/updates', icon: Sparkles },
  { label: 'Settings', href: '/workspace/settings', icon: Settings },
];

// Apps for the app switcher
const suiteApps = [
  { name: 'Notes', slug: 'notes', icon: FileText, color: '#3b82f6' },
  { name: 'Journey', slug: 'journey', icon: BookOpen, color: '#f97316' },
  { name: 'Todo', slug: 'todo', icon: CheckSquare, color: '#8b5cf6' },
  { name: 'Health', slug: 'health', icon: Heart, color: '#ef4444' },
  { name: 'Moments', slug: 'moments', icon: Camera, color: '#ec4899' },
  { name: 'Grow', slug: 'grow', icon: GraduationCap, color: '#10b981' },
  { name: 'Pulse', slug: 'pulse', icon: Activity, color: '#06b6d4' },
  { name: 'Fit', slug: 'fit', icon: Dumbbell, color: '#f59e0b' },
  { name: 'Projects', slug: 'projects', icon: Layers, color: '#6366f1' },
  { name: 'Workflow', slug: 'workflow', icon: GitBranch, color: '#a855f7' },
  { name: 'Calendar', slug: 'calendar', icon: Calendar, color: '#14b8a6' },
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

  const handleAppNavigation = (slug: string) => {
    onClose();
    navigateToApp(slug, 'admin');
  };

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
        className={clsx(
          'fixed left-0 top-0 bottom-0 w-[220px] flex flex-col bg-black/60 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-out z-40 overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-zinc-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-zinc-600/20 blur-3xl rounded-full pointer-events-none opacity-50" />

        {/* Header */}
        <div className="relative z-10 flex-none flex items-center justify-between p-4 border-b border-white/10 bg-transparent">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3">
          {/* Admin Pages Section */}
          <div className="mb-4">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Admin Console
            </p>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/workspace' && pathname.startsWith(item.href));

                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className={clsx(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                      isActive
                        ? 'bg-zinc-500/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Apps Section */}
          <div>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Switch App
            </p>

            {/* Suite Dashboard */}
            <button
              type="button"
              onClick={() => handleAppNavigation('main')}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white text-left mb-2"
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Suite Dashboard</span>
            </button>

            {/* Apps Grid */}
            <div className="space-y-1">
              {suiteApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <button
                    key={app.slug}
                    type="button"
                    onClick={() => handleAppNavigation(app.slug)}
                    className="group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white text-left"
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
                      style={{
                        backgroundColor: `${app.color}20`,
                        color: app.color
                      }}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{app.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer - System Status */}
        <div className="relative z-10 p-3 border-t border-white/10">
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1.5">
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
    </>
  );
}
