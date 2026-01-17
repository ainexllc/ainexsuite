'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderOpen,
  LayoutGrid,
  Image,
  BookOpen,
  Video,
  Bot,
  Palette,
  RefreshCw,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  children?: { href: string; label: string }[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'MENU',
    items: [
      {
        href: '/workspace',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        href: '/workspace/apps',
        label: 'Apps',
        icon: LayoutGrid,
      },
      {
        href: '/workspace/users',
        label: 'Users',
        icon: Users,
      },
      {
        href: '/workspace/spaces',
        label: 'Spaces',
        icon: FolderOpen,
        children: [
          { href: '/workspace/spaces?tab=all-spaces', label: 'All Spaces' },
          { href: '/workspace/spaces?tab=analytics', label: 'Analytics' },
          { href: '/workspace/spaces?tab=members', label: 'Members' },
          { href: '/workspace/spaces?tab=space-types', label: 'Space Types' },
          { href: '/workspace/spaces?tab=ui-settings', label: 'UI Settings' },
        ],
      },
      {
        href: '/workspace/feedback',
        label: 'Feedback',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'MEDIA',
    items: [
      {
        href: '/workspace/backgrounds',
        label: 'Backgrounds',
        icon: Image,
      },
      {
        href: '/workspace/covers',
        label: 'Covers',
        icon: BookOpen,
      },
      {
        href: '/workspace/video-backgrounds',
        label: 'Videos',
        icon: Video,
      },
      {
        href: '/workspace/ai-avatars',
        label: 'AI Avatars',
        icon: Bot,
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        href: '/workspace/theme',
        label: 'Theme',
        icon: Palette,
      },
      {
        href: '/workspace/updates',
        label: 'Updates',
        icon: RefreshCw,
      },
      {
        href: '/workspace/settings',
        label: 'Settings',
        icon: Settings,
      },
    ],
  },
];

function NavItemComponent({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
          }`}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[#3b82f6] text-white rounded">
              {item.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ${
            isOpen ? 'max-h-64 mt-1' : 'max-h-0'
          }`}
        >
          <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-[#27272a] space-y-1">
            {item.children?.map((child) => {
              const isChildActive = pathname === child.href || pathname?.startsWith(child.href.split('?')[0]);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                    isChildActive
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white'
          : 'text-zinc-600 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="px-2 py-0.5 text-xs font-medium bg-[#3b82f6] text-white rounded">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.href !== '/workspace' && pathname?.startsWith(item.href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-white dark:bg-[#0a0a0a] border-r border-zinc-200 dark:border-[#27272a] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-[#27272a]">
          <Link href="/workspace" className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-white">
              AI<span className="text-zinc-900 dark:text-white">NEX</span>
            </span>
            <span className="text-xs text-zinc-500 dark:text-[#a1a1aa] uppercase tracking-wider">Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-zinc-400 dark:text-[#71717a] uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    isActive={isItemActive(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-[#27272a]">
          <div className="bg-zinc-100 dark:bg-[#18181b] rounded-xl p-4 text-center">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">AinexSpace Admin</h4>
            <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] mb-3">Platform management console</p>
            <Link
              href="/"
              className="block w-full py-2 px-4 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Go to Main App
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export function AdminSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
