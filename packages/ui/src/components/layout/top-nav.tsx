"use client";

import type { ReactNode } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { AIVoiceIcon } from "../ai";
import { clsx } from "clsx";
import Image from "next/image";

export type TopNavProps = {
  /** Custom branding/logo component (e.g., LogoWordmark) */
  logo?: ReactNode;
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
  /** Accent color for shadows (e.g., "249,115,22" for orange, "59,130,246" for blue) */
  accentColor?: string;
};

export function TopNav({
  logo,
  onMenuClick,
  actions,
  className,
  theme = "light",
  maxWidth = "1280px",
  accentColor = "249,115,22", // Default orange
}: TopNavProps) {
  const navBackgroundClass =
    theme === "dark"
      ? "bg-background/95 border-b border-border"
      : "bg-background/92 border-b border-border";

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-30 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] transition-colors",
        navBackgroundClass,
        className,
      )}
      style={{
        // @ts-expect-error - CSS custom property
        "--tw-shadow-colored": `0 4px 16px -4px rgba(${accentColor},0.3)`,
      }}
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 shadow-sm transition hover:bg-muted text-foreground"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {logo && <div className="hidden sm:block">{logo}</div>}
        </div>

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
  /** Show chevron down indicator */
  showChevron?: boolean;
};

/**
 * Reusable profile button for TopNav
 */
export function TopNavProfileButton({
  user,
  onClick,
  loading,
  showChevron = true,
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
      className="flex items-center gap-2 h-9 rounded-full bg-muted/80 text-foreground shadow-sm transition hover:bg-muted px-2"
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
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {initials}
        </span>
      )}
      {showChevron && (
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export type TopNavAiButtonProps = {
  onClick: () => void;
  /** Custom label for accessibility */
  label?: string;
  /** Accent color for the AI icon (hex) */
  accentColor?: string;
};

/**
 * Reusable AI Assistant button for TopNav
 */
export function TopNavAiButton({
  onClick,
  label = "AI Assistant",
  accentColor = "#f97316",
}: TopNavAiButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted shadow-sm transition hover:bg-accent"
      aria-label={label}
      style={{
        filter: `drop-shadow(0 0 4px ${accentColor}40)`,
      }}
    >
      <AIVoiceIcon size={18} color={accentColor} isAnimating={true} />
    </button>
  );
}
