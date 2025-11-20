"use client";

import { useState } from "react";
import {
  Menu,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import { useAuth } from "@ainexsuite/auth";
import { LogoWordmark } from "@/components/branding/logo-wordmark";

type TopNavProps = {
  onMenuClick?: () => void;
  onOpenAiAssistant?: () => void;
};

export function TopNav({
  onMenuClick,
  onOpenAiAssistant,
}: TopNavProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "JJ";

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-30 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_16px_-4px_rgba(147,51,234,0.3)] transition-colors",
        "bg-white/92 dark:bg-[#050507]/95 border-b border-gray-200/60 dark:border-gray-800/60",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center px-4 sm:px-6">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 shadow-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="hidden sm:block">
            <LogoWordmark href="/" iconSize={48} />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 shadow-sm transition hover:bg-purple-200 dark:hover:bg-purple-900/50"
              aria-label="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}

          {user && !authLoading ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition hover:bg-gray-200 dark:hover:bg-gray-700 px-2"
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-xs font-semibold text-white">
                    {initials}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 w-56 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 py-2">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
