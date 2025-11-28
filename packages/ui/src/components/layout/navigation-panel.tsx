"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import type { Route } from "next";

export type NavItem = {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type NavigationPanelProps = {
  /** Whether panel is open */
  isOpen: boolean;
  /** Close panel handler */
  onClose: () => void;
  /** Navigation sections */
  sections: NavSection[];
  /** Current pathname for active state */
  pathname: string;
  /** Custom content (e.g., labels, categories) */
  customContent?: ReactNode;
  /** Custom className */
  className?: string;
};

export function NavigationPanel({
  isOpen,
  onClose,
  sections,
  pathname,
  customContent,
  className,
}: NavigationPanelProps) {
  return (
    <div
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-[280px] transform bg-surface-elevated/95 backdrop-blur-2xl border-r border-outline-subtle/60 shadow-2xl rounded-r-3xl transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-subtle/40 px-5 py-4">
          <span className="text-sm font-semibold text-ink-900">Navigation</span>
          <button
            type="button"
            className="icon-button h-8 w-8 rounded-full bg-surface-muted hover:bg-ink-200"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3">
          {sections.map((section) => (
            <NavSection
              key={section.title}
              title={section.title}
              items={section.items}
              pathname={pathname}
              onClose={onClose}
            />
          ))}

          {/* Custom content (labels, etc.) */}
          {customContent}
        </div>
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
  pathname,
  onClose,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="py-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </p>
      <nav className="mt-2 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.label}
              href={item.href as Route}
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
                  {item.icon}
                </span>
                <span className={clsx(isActive ? "text-ink-900" : "text-inherit")}>
                  {item.label}
                </span>
              </span>
              {item.badge && (
                <span className="ml-auto inline-flex items-center rounded-full bg-ink-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Reusable custom section component for NavigationPanel
 */
export function NavigationSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="py-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}
