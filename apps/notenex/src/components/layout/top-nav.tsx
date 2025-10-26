"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  Sparkles,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/components/providers/theme-provider";
import { useNotes } from "@/components/providers/notes-provider";
import { LogoWordmark } from "@/components/branding/logo-wordmark";
import { ProfileDropdown } from "./profile-dropdown";

type TopNavProps = {
  onMenuClick?: () => void;
  onRefresh?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenAiAssistant?: () => void;
  onSearchFocus?: () => void;
};

export function TopNav({
  onMenuClick,
  onRefresh,
  onOpenSettings,
  onOpenActivity,
  onOpenAiAssistant,
  onSearchFocus,
}: TopNavProps) {
  const { status, user, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const { searchQuery, setSearchQuery } = useNotes();
  const [isProfileOpen, setProfileOpen] = useState(false);


  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "NN";

  const navBackgroundClass =
    theme === "dark"
      ? "bg-[#050507]/95"
      : "bg-white/92 border-b border-outline-subtle/60";

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-30 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_16px_-4px_rgba(249,115,22,0.3)] transition-colors",
        navBackgroundClass,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center px-4 sm:px-6 cq-nav">
        {/* Left: Hamburger + Logo (tightly grouped) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="icon-button h-10 w-10 rounded-full bg-surface-muted/80 shadow-sm transition hover:bg-surface-muted"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <LogoWordmark href="/" iconSize={48} />
          </div>
        </div>

        {/* Center: Search bar */}
        <div className="top-nav-search mx-4 flex flex-1 items-center gap-2 rounded-full bg-surface-muted/80 px-3 py-1 shadow-sm transition hover:bg-surface-muted max-w-2xl h-9">
          <Search className="top-nav-search-icon h-4 w-4 text-ink-500 shrink-0" aria-hidden />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="top-nav-search-input w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-500 focus:outline-none"
            onFocus={() => onSearchFocus?.()}
          />
          {searchQuery && (
            <button
              type="button"
              className="icon-button h-6 w-6 rounded-full text-ink-500 hover:bg-surface-muted hover:text-ink-700 shrink-0"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="top-nav-search-button icon-button h-8 w-8 rounded-full bg-surface-muted/70 text-ink-600 hover:bg-surface-muted shrink-0"
            aria-label="Open search"
            onClick={() => onSearchFocus?.()}
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Right: Actions (right-justified) */}
        <div className="ml-auto flex items-center gap-2 top-nav-actions">
          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={() => onOpenAiAssistant()}
              className="icon-button h-9 w-9 rounded-full bg-purple-100 text-purple-600 shadow-sm transition hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
              aria-label="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}

          {status === "authenticated" ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 h-9 rounded-full bg-surface-muted/80 text-ink-700 shadow-sm transition hover:bg-surface-muted px-2"
                aria-label="Profile menu"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                {user?.photoURL ? (
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
                <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
              </button>
              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setProfileOpen(false)}
                onOpenSettings={() => {
                  setProfileOpen(false);
                  onOpenSettings?.();
                }}
                onOpenActivity={() => {
                  setProfileOpen(false);
                  onOpenActivity?.();
                }}
                onRefresh={() => {
                  setProfileOpen(false);
                  onRefresh?.();
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              className="rounded-full bg-surface-muted/80 px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm transition hover:bg-surface-muted hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              onClick={() => void signInWithGoogle()}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
