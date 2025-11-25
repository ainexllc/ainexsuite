'use client';

import { useEffect } from 'react';
import {
  Home,
  Settings,
  HelpCircle,
  X,
  FileText,
  BookOpen,
  CheckSquare,
  Heart,
  Camera,
  GraduationCap,
  Activity as ActivityIcon,
  Dumbbell,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  navigateToApp,
  getCurrentAppSlug,
  useAppLoginStatus,
  AppLoginStatus,
} from '@ainexsuite/ui';

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Whether the current user is logged in */
  isLoggedIn?: boolean;
}

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
];

// App definitions with slugs for cross-app navigation
const apps = [
  { slug: 'notes', icon: FileText, label: 'Notes' },
  { slug: 'journey', icon: BookOpen, label: 'Journey' },
  { slug: 'todo', icon: CheckSquare, label: 'Tasks' },
  { slug: 'health', icon: Heart, label: 'Health' },
  { slug: 'moments', icon: Camera, label: 'Moments' },
  { slug: 'grow', icon: GraduationCap, label: 'Grow' },
  { slug: 'pulse', icon: ActivityIcon, label: 'Pulse' },
  { slug: 'fit', icon: Dumbbell, label: 'Fit' },
];

const settingsItems = [
  { href: '/settings', icon: Settings, label: 'Preferences' },
  { href: '/help', icon: HelpCircle, label: 'Help & Support' },
];

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </p>
      <nav className="mt-2 space-y-1">{children}</nav>
    </div>
  );
}

export function NavigationPanel({ isOpen, onClose, isLoggedIn = false }: NavigationPanelProps) {
  const pathname = usePathname();
  const currentAppSlug = getCurrentAppSlug();
  const { isChecking, checkStatuses, getStatus } = useAppLoginStatus({ isLoggedIn });

  // Check login statuses when panel opens
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      checkStatuses();
    }
  }, [isOpen, isLoggedIn, checkStatuses]);

  const handleAppNavigation = (slug: string) => {
    onClose();
    navigateToApp(slug, currentAppSlug || 'main');
  };

  return (
    <div
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-[280px] transform bg-surface-elevated/95 backdrop-blur-2xl border-r border-outline-subtle/60 shadow-2xl rounded-r-3xl transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-outline-subtle/40 px-5 py-4">
          <span className="text-sm font-semibold text-ink-900">Navigation</span>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted hover:bg-ink-200 transition-colors"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <NavSection title="Menu">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-ink-200 text-ink-900"
                      : "text-ink-500 hover:bg-surface-muted hover:text-ink-700",
                  )}
                  onClick={onClose}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors",
                        isActive
                          ? "bg-ink-300/80 text-ink-900"
                          : "bg-surface-muted text-ink-600",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={clsx(isActive ? "text-ink-900" : "text-inherit")}>
                      {label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </NavSection>

          <NavSection title="Apps">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] text-ink-400">
                {isLoggedIn ? 'SSO Status' : 'Sign in to sync'}
              </span>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={checkStatuses}
                  disabled={isChecking}
                  className="p-1 rounded hover:bg-surface-muted transition-colors disabled:opacity-50"
                  title="Refresh login status"
                >
                  <RefreshCw className={clsx('h-3 w-3 text-ink-400', isChecking && 'animate-spin')} />
                </button>
              )}
            </div>
            {apps.map(({ slug, icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleAppNavigation(slug)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors text-ink-500 hover:bg-surface-muted hover:text-ink-700 w-full text-left"
              >
                <span className="flex items-center gap-3 flex-1">
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors bg-surface-muted text-ink-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </span>
                {isLoggedIn && (
                  <AppLoginStatus status={getStatus(slug)} size="sm" />
                )}
              </button>
            ))}
          </NavSection>

          <NavSection title="Settings">
            {settingsItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-ink-200 text-ink-900"
                      : "text-ink-500 hover:bg-surface-muted hover:text-ink-700",
                  )}
                  onClick={onClose}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors",
                        isActive
                          ? "bg-ink-300/80 text-ink-900"
                          : "bg-surface-muted text-ink-600",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={clsx(isActive ? "text-ink-900" : "text-inherit")}>
                      {label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </NavSection>
        </div>
      </div>
    </div>
  );
}
