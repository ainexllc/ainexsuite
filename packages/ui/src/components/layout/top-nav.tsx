"use client";

import type { ReactNode } from "react";
import { Menu, Search, X } from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";

export type TopNavProps = {
  /** Custom branding/logo component (e.g., LogoWordmark) */
  logo?: ReactNode;
  /** Search functionality */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFocus?: () => void;
  };
  /** Menu button click handler */
  onMenuClick?: () => void;
  /** Right-side action buttons */
  actions?: ReactNode;
  /** Custom className for styling */
  className?: string;
  /** Theme: light or dark */
  theme?: "light" | "dark";
  /** Max width of container */
  maxWidth?: string;
};

export function TopNav({
  logo,
  search,
  onMenuClick,
  actions,
  className,
  theme = "light",
  maxWidth = "1280px",
}: TopNavProps) {
  const navBackgroundClass =
    theme === "dark"
      ? "bg-[#050507]/95"
      : "bg-white/92 border-b border-outline-subtle/60";

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-30 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_16px_-4px_rgba(249,115,22,0.3)] transition-colors",
        navBackgroundClass,
        className,
      )}
    >
      <div
        className="mx-auto flex h-16 w-full items-center px-4 sm:px-6 cq-nav"
        style={{ maxWidth }}
      >
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="icon-button h-10 w-10 rounded-full bg-surface-muted/80 shadow-sm transition hover:bg-surface-muted"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {logo && <div className="hidden sm:block">{logo}</div>}
        </div>

        {/* Center: Search bar (if provided) */}
        {search && (
          <div className="top-nav-search mx-4 flex flex-1 items-center gap-2 rounded-full bg-surface-muted/80 px-3 py-1 shadow-sm transition hover:bg-surface-muted max-w-2xl h-9">
            <Search
              className="top-nav-search-icon h-4 w-4 text-ink-500 shrink-0"
              aria-hidden
            />
            <input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || "Search..."}
              className="top-nav-search-input w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-500 focus:outline-none"
              onFocus={search.onFocus}
            />
            {search.value && (
              <button
                type="button"
                className="icon-button h-6 w-6 rounded-full text-ink-500 hover:bg-surface-muted hover:text-ink-700 shrink-0"
                aria-label="Clear search"
                onClick={() => search.onChange("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="top-nav-search-button icon-button h-8 w-8 rounded-full bg-surface-muted/70 text-ink-600 hover:bg-surface-muted shrink-0"
              aria-label="Open search"
              onClick={search.onFocus}
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

        {/* Right: Actions */}
        {actions && (
          <div className="ml-auto flex items-center gap-2 top-nav-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export type TopNavProfileButtonProps = {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onClick: () => void;
  loading?: boolean;
};

/**
 * Reusable profile button for TopNav
 */
export function TopNavProfileButton({
  user,
  onClick,
  loading,
}: TopNavProfileButtonProps) {
  if (loading || !user) return null;

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <button
      type="button"
      className="flex items-center gap-2 h-9 rounded-full bg-surface-muted/80 text-ink-700 shadow-sm transition hover:bg-surface-muted px-2"
      aria-label="Profile menu"
      onClick={onClick}
    >
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName ?? user.email ?? "Account"}
          width={28}
          height={28}
          className="rounded-full object-cover"
          sizes="28px"
        />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
          {initials}
        </span>
      )}
    </button>
  );
}
