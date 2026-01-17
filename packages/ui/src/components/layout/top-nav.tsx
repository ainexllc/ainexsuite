"use client";

import { type ReactNode, useState, useEffect, useCallback } from "react";
import { Menu, ChevronDown, Maximize, Minimize, Sparkles } from "lucide-react";
import { AIVoiceIcon } from "../ai";
import { AnimatedAvatarPlayer } from "../animated-avatar-player";
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
        "fixed inset-x-0 top-0 z-40 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] transition-colors",
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
    /** Square-cropped icon for circular avatars */
    iconURL?: string | null;
    /** Animated avatar video URL */
    animatedAvatarURL?: string | null;
    /** Whether to use animated avatar */
    useAnimatedAvatar?: boolean;
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

  // Prefer iconURL (square cropped) for circular avatar, fallback to photoURL
  const avatarSrc = user.iconURL || user.photoURL;

  // Show animated avatar if enabled
  if (user.useAnimatedAvatar && user.animatedAvatarURL) {
    return (
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full transition hover:opacity-80"
        aria-label="Profile menu"
        onClick={onClick}
      >
        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg">
          <AnimatedAvatarPlayer
            src={user.animatedAvatarURL}
            className="h-full w-full object-cover"
            alt={user.displayName ?? "Avatar"}
            maxPlays={4}
            pauseDuration={10000}
          />
        </div>
        {showChevron && (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full transition hover:opacity-80"
      aria-label="Profile menu"
      onClick={onClick}
    >
      {avatarSrc ? (
        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg">
          <Image
            src={avatarSrc}
            alt={user.displayName ?? user.email ?? "Account"}
            fill
            sizes="40px"
            className="object-cover object-center"
            priority
          />
        </div>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold shadow-lg ring-2 ring-white/20">
          {initials}
        </span>
      )}
      {showChevron && (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
  /** Button style variant */
  variant?: "icon" | "pill";
  /** Text label for pill variant */
  text?: string;
};

/**
 * Reusable AI Assistant button for TopNav
 */
export function TopNavAiButton({
  onClick,
  label = "AI Assistant",
  accentColor = "#f97316",
  variant = "icon",
  text,
}: TopNavAiButtonProps) {
  // Pill variant with text (matches space pill styling)
  if (variant === "pill" && text) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/50 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition hover:bg-zinc-200/80 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-zinc-100"
        aria-label={label}
      >
        <Sparkles className="h-4 w-4" />
        <span>{text}</span>
      </button>
    );
  }

  // Default icon-only variant
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

/**
 * Reusable fullscreen toggle button for TopNav
 */
export function TopNavFullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkFullscreen = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
    };
  }, [checkFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 shadow-sm transition hover:bg-muted text-foreground"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </button>
  );
}
