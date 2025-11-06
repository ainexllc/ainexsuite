"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { Settings, Moon, Sun, RefreshCw, LogOut, Activity } from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";

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
  /** Theme configuration (optional) */
  theme?: {
    current: "light" | "dark";
    toggle: () => void;
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

  const defaultMenuItems = [
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      onClick: () => {},
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: "Activity",
      onClick: () => {},
    },
    {
      icon: <RefreshCw className="h-4 w-4" />,
      label: "Refresh",
      onClick: () => window.location.reload(),
    },
  ];

  const items = menuItems || defaultMenuItems;

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "absolute right-0 top-full mt-2 w-64 rounded-2xl bg-surface-elevated/95 backdrop-blur-2xl border border-outline-subtle/60 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50",
      )}
    >
      {/* User info */}
      {user && (
        <div className="px-3 py-3 border-b border-outline-subtle/40">
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
              <div className="h-10 w-10 rounded-full bg-accent-500 text-white grid place-items-center font-semibold text-sm">
                {(user.displayName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {user.displayName && (
                <p className="font-semibold text-sm text-ink-900 truncate">
                  {user.displayName}
                </p>
              )}
              <p className="text-xs text-muted truncate">{user.email}</p>
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-surface-muted hover:text-ink-900 transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* Theme toggle */}
        {theme && (
          <div className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-surface-muted hover:text-ink-900 transition-colors">
            <div className="flex items-center gap-3">
              {theme.current === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>Theme</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                theme.toggle();
              }}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
                theme.current === "dark" ? "bg-ink-700" : "bg-accent-500",
              )}
              aria-label="Toggle theme"
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                  theme.current === "dark" ? "translate-x-0.5" : "translate-x-4",
                )}
              />
            </button>
          </div>
        )}

        {/* Custom menu items */}
        {customMenuItems}
      </div>

      {/* Sign out */}
      <div className="border-t border-outline-subtle/40 pt-1 pb-1 mt-1">
        <button
          type="button"
          onClick={async () => {
            await onSignOut();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
