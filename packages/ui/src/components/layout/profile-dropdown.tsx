"use client";

import { useRef, useEffect, useState, type ReactNode, useCallback } from "react";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";

export type ThemeValue = "light" | "dark" | "system";

export type ProfileDropdownProps = {
  /** Whether dropdown is open */
  isOpen: boolean;
  /** Close dropdown handler */
  onClose: () => void;
  /** User information */
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  /** Theme configuration (optional) - supports Light/Dark/System */
  theme?: {
    current: ThemeValue | undefined;
    setTheme: (theme: ThemeValue) => void;
  };
  /** Menu items configuration */
  menuItems?: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
  }>;
  /** Sign out handler */
  onSignOut: () => void | Promise<void>;
  /** Additional menu items (rendered before sign out) */
  customMenuItems?: ReactNode;
};

export function ProfileDropdown({
  isOpen,
  onClose,
  user,
  theme,
  menuItems,
  onSignOut,
  customMenuItems,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track the selected theme locally for immediate UI feedback
  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>("dark");
  const hasInitialized = useRef(false);

  // Initialize from localStorage only once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ainex-theme') as ThemeValue | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setSelectedTheme(stored);
      }
      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = menuItems || [];

  // Better initials logic - get up to 2 letters from full name
  const getInitials = () => {
    if (!user) return "U";
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return (user.email?.charAt(0) || "U").toUpperCase();
  };

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "absolute right-0 top-full mt-2 w-64 rounded-2xl bg-popover/95 backdrop-blur-2xl border border-border shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50",
      )}
    >
      {/* User info */}
      {user && (
        <div className="px-3 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || user.email || "User"}
                width={40}
                height={40}
                className="rounded-full object-cover"
                sizes="40px"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold text-sm">
                {getInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {user.displayName && (
                <p className="font-semibold text-sm text-foreground truncate">
                  {user.displayName}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="py-1 space-y-0.5">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* Theme selector - Light/Dark/System */}
        {theme && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              {selectedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : selectedTheme === "system" ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>Theme</span>
            </div>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(["light", "dark", "system"] as const).map((mode) => {
                const isActive = selectedTheme === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Update local state immediately for instant feedback
                      setSelectedTheme(mode);
                      // Then propagate to the theme system
                      theme.setTheme(mode);
                    }}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                    aria-label={`Set ${mode} theme`}
                  >
                    {mode === "light" && <Sun className="h-3 w-3" />}
                    {mode === "dark" && <Moon className="h-3 w-3" />}
                    {mode === "system" && <Monitor className="h-3 w-3" />}
                    <span className="capitalize">{mode}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom menu items */}
        {customMenuItems}
      </div>

      {/* Sign out */}
      <div className="border-t border-border pt-1 pb-1 mt-1">
        <button
          type="button"
          onClick={async () => {
            await onSignOut();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
