'use client';

import {
  Home,
  Settings,
  HelpCircle,
  X,
  FileText,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Camera,
  GraduationCap,
  Activity as ActivityIcon,
  Dumbbell,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
];

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

const apps = [
  { href: isDev ? 'http://localhost:3001' : 'https://notes.ainexsuite.com', icon: FileText, label: 'Notes', external: true },
  { href: isDev ? 'http://localhost:3002' : 'https://journey.ainexsuite.com', icon: BookOpen, label: 'Journey', external: true },
  { href: isDev ? 'http://localhost:3003' : 'https://tasks.ainexsuite.com', icon: CheckSquare, label: 'Tasks', external: true },
  { href: isDev ? 'http://localhost:3004' : 'https://track.ainexsuite.com', icon: TrendingUp, label: 'Track', external: true },
  { href: isDev ? 'http://localhost:3005' : 'https://moments.ainexsuite.com', icon: Camera, label: 'Moments', external: true },
  { href: isDev ? 'http://localhost:3006' : 'https://grow.ainexsuite.com', icon: GraduationCap, label: 'Grow', external: true },
  { href: isDev ? 'http://localhost:3007' : 'https://pulse.ainexsuite.com', icon: ActivityIcon, label: 'Pulse', external: true },
  { href: isDev ? 'http://localhost:3008' : 'https://fit.ainexsuite.com', icon: Dumbbell, label: 'Fit', external: true },
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

export function NavigationPanel({ isOpen, onClose }: NavigationPanelProps) {
  const pathname = usePathname();

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
            {apps.map(({ href, icon: Icon, label, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors text-ink-500 hover:bg-surface-muted hover:text-ink-700"
                onClick={onClose}
              >
                <span className="flex items-center gap-3 flex-1">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors bg-surface-muted text-ink-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </span>
                {external && <ExternalLink className="h-3.5 w-3.5 text-ink-400" />}
              </a>
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
